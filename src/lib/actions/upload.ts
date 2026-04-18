"use server";

import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const supabase = getSupabaseServerClient();
    if (!supabase) throw new Error('Database is offline, cannot upload files.');
    const safeName = file.name.replace(/[^\w.\-]+/g, '-');
    const objectPath = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(objectPath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('uploads').getPublicUrl(objectPath);
    if (!data?.publicUrl) throw new Error('Failed to generate public URL');

    return data.publicUrl;
  } catch (error: any) {
    console.error('Upload Error:', error);
    throw new Error('Failed to save file: ' + error.message);
  }
}
