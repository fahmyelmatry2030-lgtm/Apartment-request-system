import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "نظام حجز الشقق | الرفاهية والراحة",
  description: "نظام حجز شقق متطور بواجهة عصرية وتجربة مستخدم فاخرة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo antialiased bg-[#0a0f1e] text-white`}>
        {children}
      </body>
    </html>
  );
}
