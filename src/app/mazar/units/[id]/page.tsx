import { Metadata } from 'next';
import { getPublicSystemUnits } from '@/lib/data-init';
import UnitClient from './UnitClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const units = await getPublicSystemUnits();
  const unit = units.find((u: any) => u.id === id);

  if (!unit) {
    return {
      title: 'وحدة غير موجودة',
    };
  }

  const title = `${unit.title.ar} | مزار`;
  const description = unit.description.ar;
  const image = unit.images?.[0] || '/images/logo-en.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: unit.title.ar,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const units = await getPublicSystemUnits();
  const unit = units.find((u: any) => u.id === id);

  return <UnitClient initialUnit={unit} />;
}
