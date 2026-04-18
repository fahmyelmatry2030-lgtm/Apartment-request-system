import { Metadata } from 'next';
import UnitsClient from './UnitsClient';

export const metadata: Metadata = {
  title: 'استكشف الوحدات | مزار للفنادق والاستوديوهات',
  description: 'تصفح قائمة الاستوديوهات والوحدات الفندقية المتاحة في مزار. اختر بين فروعنا المختلفة واستمتع بإقامة فاخرة بأسعار تنافسية.',
  openGraph: {
    title: 'وحدات مزار الفندقية | الفخامة في انتظارك',
    description: 'استكشف غرفنا واستوديوهاتنا المصممة بعناية لتناسب احتياجاتكم.',
  }
};

export default function UnitsPage() {
  return <UnitsClient />;
}
