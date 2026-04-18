
// src/app/mazar/debug/page.tsx
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  const supabaseUrl = process.env.SUPABASE_URL || 'NOT SET';
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
  const hasKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  return (
    <div className="p-10 font-mono bg-black text-green-500">
      <h1 className="text-2xl mb-4">SYSTEM DIAGNOSTIC (MAZAR)</h1>
      <pre>
        URL: {supabaseUrl.substring(0, 15)}...
        PUBLIC_URL: {publicUrl.substring(0, 15)}...
        KEYS_CONFIGURED: {hasKey ? 'YES' : 'NO'}
        NODE_ENV: {process.env.NODE_ENV}
        VERCEL_URL: {process.env.VERCEL_URL || 'LOCAL'}
      </pre>
      <div className="mt-8">
        <p>If URL is 'NOT SET', the website is running in Demo Mode (Local Fallback).</p>
      </div>
    </div>
  );
}
