import { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'عن مزار | الرفاهية والخصوصية في قلب القاهرة',
  description: 'تعرف على قصة مزار، ورؤيتنا في تقديم تجربة إقامة فندقية فريدة تجمع بين الفخامة والخصوصية في مدينة نصر.',
  openGraph: {
    title: 'عن مزار | تجربة إقامة استثنائية',
    description: 'اكتشف لماذا يعتبر مزار الوجهة الأولى للإقامة الفاخرة في مدينة نصر.',
  }
};

export default function AboutPage() {
  return <AboutClient />;
}
