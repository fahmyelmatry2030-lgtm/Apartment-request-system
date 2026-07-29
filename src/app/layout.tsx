import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import { translations as fallbackTranslations } from "@/lib/translations";
import { getDbTranslations } from "@/lib/actions/db";
import ScrollProgress from "@/components/ScrollProgress";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import MobileBottomNav from "@/components/MobileBottomNav";

export const dynamic = 'force-dynamic';



const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: {
    default: "مزار | استوديوهات فندقية فاخرة في مدينة نصر",
    template: "%s | مزار"
  },
  description: "اكتشف أرقى الاستوديوهات الفندقية في مزار، مدينة نصر. دخول ذكي، تصميم معاصر، وخدمة ريسيبشن 24 ساعة. احجز إقامتك الفاخرة الآن.",
  keywords: ["مزار", "حجز فنادق مدينة نصر", "استوديو فندقي القاهرة", "إقامة فاخرة", "Mazar Booking", "Nasr City Hotels"],
  authors: [{ name: "Mazar Team" }],
  creator: "Mazar",
  publisher: "Mazar",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "مزار | استوديوهات فندقية فاخرة في مدينة نصر",
    description: "تجربة إقامة استثنائية تجمع بين الخصوصية والفخامة في قلب القاهرة.",
    url: 'https://mazar-booking.com',
    siteName: 'Mazar',
    locale: 'ar_EG',
    type: 'website',
    images: [
      {
        url: '/images/logo-en.jpg', // Placeholder for OG image
        width: 1200,
        height: 630,
        alt: 'Mazar Booking Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "مزار | استوديوهات فندقية فاخرة",
    description: "احجز إقامتك الفاخرة في قلب مدينة نصر.",
    images: ['/images/logo-en.jpg'],
  },
  icons: {
    icon: [
      { url: '/images/logo-en.jpg' },
      { url: '/images/logo-en.jpg', sizes: '32x32', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/images/logo-en.jpg' },
    ],
  },
  category: 'travel',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mazar',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read translations at runtime from DB so CMS changes are always live on Vercel
  let translations: any = null;
  
  // Defensive check for build environment or missing Supabase config
  try {
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      translations = await getDbTranslations();
    }
  } catch (error) {
    console.warn('⚠️ Layout: Failed to fetch DB translations during render, using fallback.', error);
    translations = null;
  }

  const initialTranslations = translations || fallbackTranslations;

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'مزار - Mazar',
    description: 'أرقى الاستوديوهات الفندقية في مدينة نصر، القاهرة.',
    url: 'https://mazar-booking.com',
    logo: 'https://mazar-booking.com/images/logo-en.jpg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nasr City',
      addressRegion: 'Cairo',
      addressCountry: 'EG',
    },
    telephone: '+201108109969', // Personal client number
    starRating: {
      '@type': 'Rating',
      ratingValue: '5',
    },
  };


  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${cairo.variable} font-cairo antialiased selection:bg-[#C1A68D] selection:text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider initialTranslations={initialTranslations}>
          <ScrollProgress />
          {children}
          <WhatsAppWidget />
          <MobileBottomNav />
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

