import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "مزار | تجربة إقامة فندقية فاخرة في مدينة نصر",
  description: "اكتشف أرقى الاستوديوهات الفندقية في مزار، مع دخول ذكي وخدمة ريسيبشن 24 ساعة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased selection:bg-[#C1A68D] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
