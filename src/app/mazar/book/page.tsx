import { Metadata } from 'next';
import BookingClient from './BookingClient';

export const metadata: Metadata = {
  title: 'احجز الآن | مزار للاستوديوهات الفندقية',
  description: 'احجز إقامتك الفاخرة في مزار الآن. عملية حجز سهلة وسريعة مع تأكيد فوري عبر واتساب. استمتع بأرقى الخدمات الفندقية في القاهرة.',
  openGraph: {
    title: 'حجز إقامة في مزار | سهولة ورفاهية',
    description: 'اختر مواعيدك ووحدتك المفضلة وأتمم حجزك في دقائق معدودة.',
  }
};

export default function BookingPage() {
  return <BookingClient />;
}
