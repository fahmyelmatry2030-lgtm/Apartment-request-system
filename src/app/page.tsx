import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'مزار | الفخامة والخصوصية في قلب القاهرة',
  description: 'استكشف وحدات مزار الفندقية الفاخرة في مدينة نصر. استوديوهات وشقق مفروشة تجمع بين الرقي والخصوصية لتجربة إقامة استثنائية.',
  openGraph: {
    title: 'مزار | تجربة إقامة فندقية فريدة',
    description: 'احجز إقامتك الآن في أرقى الاستوديوهات والشقق بمدينة نصر.',
    images: ['/og-image.jpg'],
  }
};

export default function HomePage() {
  return <HomeClient />;
}
