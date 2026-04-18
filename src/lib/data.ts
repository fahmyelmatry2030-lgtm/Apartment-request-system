export interface Unit {
  id: string;
  branch: 1 | 2;
  type: 'studio' | 'apartment';
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  images: string[];
  video?: string;
  features: {
    ar: string[];
    en: string[];
  };
  price?: string;
  status?: string;
}

// Sample images from the folders
const mazar1Images = [
  "/images/Mazar%201%20Pictures/2026%201.jpeg",
  "/images/Mazar%201%20Pictures/2026.jpeg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Imag6e%202025-12-31%20at%203.00.24%20PM.jpeg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.16_ff8ccd08.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.17_3a943570.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.17_41aa1043.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.18_61f75a9f.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.19_03fc3d1e.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.20_0887eed0.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.23_69ff6c33.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.23_bae97d5a.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.24_989640c4.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.24_cbc5045f.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.25_2995ad23.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.25_916d0a49.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.26_283075f9.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.26_4887d74a.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.27_7dd977ec.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.28_84e0b4be.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.28_fb417a23.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.29_8c81234c.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.29_e2a135bf.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.30_02c2b262.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.30_95fead93.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.31_dcc4de82.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.32_811870e6.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.32_e0da995c.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.33_07bc59b5.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.33_2004b57f.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.33_361d04a7.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.33_6c3c1bda.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.34_02003b20.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.34_b66b6098.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.35_043b205e.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.35_8ae4078a.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.36_a209e979.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.37_46a06ccb.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.37_c073a78c.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.37_df17e0be.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.38_58d7840e.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.38_6f7ec759.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.38_e7c5836c.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.39_9b4da674.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_5586b607.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_789a6fdb.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_aac2c107.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-15%20at%2012.39.40_ebec746d.jpg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-12-31%20at%203.00.24%20PM.jpeg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-1%D8%AE%D9%85%D8%AC%D8%AF2-31%20at%203.00.24%20PM.jpeg",
  "/images/Mazar%201%20Pictures/WhatsApp%20Image%202025-%D9%85%D9%8312-31%20at%203.00.25%20PM.jpeg"
];
const mazar2Images = [
  "/images/Mazar%202%20Pictures/1.jpeg",
  "/images/Mazar%202%20Pictures/20260218_015423.jpg",
  "/images/Mazar%202%20Pictures/20260218_015425.jpg",
  "/images/Mazar%202%20Pictures/20260218_023924.jpg",
  "/images/Mazar%202%20Pictures/20260218_171702.jpg",
  "/images/Mazar%202%20Pictures/20260218_171710.jpg",
  "/images/Mazar%202%20Pictures/20260218_171720.jpg",
  "/images/Mazar%202%20Pictures/20260218_183029.jpg",
  "/images/Mazar%202%20Pictures/20260218_183033.jpg",
  "/images/Mazar%202%20Pictures/20260218_183154.jpg",
  "/images/Mazar%202%20Pictures/20260218_183159.jpg",
  "/images/Mazar%202%20Pictures/20260218_184901.jpg",
  "/images/Mazar%202%20Pictures/20260218_184903.jpg",
  "/images/Mazar%202%20Pictures/20260218_184917.jpg",
  "/images/Mazar%202%20Pictures/20260218_184928.jpg",
  "/images/Mazar%202%20Pictures/20260218_184935(0).jpg",
  "/images/Mazar%202%20Pictures/20260218_184935.jpg",
  "/images/Mazar%202%20Pictures/20260218_184943.jpg",
  "/images/Mazar%202%20Pictures/20260218_185035.jpg",
  "/images/Mazar%202%20Pictures/20260218_185045.jpg",
  "/images/Mazar%202%20Pictures/20260218_185052.jpg",
  "/images/Mazar%202%20Pictures/20260218_185108.jpg",
  "/images/Mazar%202%20Pictures/20260218_185113.jpg",
  "/images/Mazar%202%20Pictures/20260218_185116.jpg",
  "/images/Mazar%202%20Pictures/20260218_185122.jpg",
  "/images/Mazar%202%20Pictures/20260218_185432.jpg",
  "/images/Mazar%202%20Pictures/20260218_185441.jpg",
  "/images/Mazar%202%20Pictures/20260218_185509.jpg",
  "/images/Mazar%202%20Pictures/20260218_185512.jpg",
  "/images/Mazar%202%20Pictures/20260218_185519.jpg",
  "/images/Mazar%202%20Pictures/20260218_185525.jpg",
  "/images/Mazar%202%20Pictures/20260218_185535.jpg",
  "/images/Mazar%202%20Pictures/20260218_185858.jpg",
  "/images/Mazar%202%20Pictures/20260218_185901.jpg",
  "/images/Mazar%202%20Pictures/20260218_185904.jpg",
  "/images/Mazar%202%20Pictures/20260218_185913.jpg",
  "/images/Mazar%202%20Pictures/20260218_185919.jpg",
  "/images/Mazar%202%20Pictures/20260218_185922.jpg",
  "/images/Mazar%202%20Pictures/20260218_185931.jpg",
  "/images/Mazar%202%20Pictures/20260218_185945.jpg",
  "/images/Mazar%202%20Pictures/20260218_185952.jpg",
  "/images/Mazar%202%20Pictures/20260218_185959.jpg",
  "/images/Mazar%202%20Pictures/20260218_190028.jpg",
  "/images/Mazar%202%20Pictures/20260218_190038.jpg",
  "/images/Mazar%202%20Pictures/20260218_190050.jpg",
  "/images/Mazar%202%20Pictures/20260218_190054.jpg",
  "/images/Mazar%202%20Pictures/20260218_190056.jpg",
  "/images/Mazar%202%20Pictures/20260218_190124.jpg",
  "/images/Mazar%202%20Pictures/20260218_191332.jpg",
  "/images/Mazar%202%20Pictures/20260218_191339.jpg",
  "/images/Mazar%202%20Pictures/20260218_194957.jpg",
  "/images/Mazar%202%20Pictures/20260218_195002.jpg",
  "/images/Mazar%202%20Pictures/20260218_195006.jpg",
  "/images/Mazar%202%20Pictures/20260218_195026.jpg",
  "/images/Mazar%202%20Pictures/20260218_195036.jpg",
  "/images/Mazar%202%20Pictures/20260218_195049.jpg",
  "/images/Mazar%202%20Pictures/20260218_195101.jpg",
  "/images/Mazar%202%20Pictures/20260218_195108.jpg",
  "/images/Mazar%202%20Pictures/20260218_195119.jpg",
  "/images/Mazar%202%20Pictures/20260218_195129.jpg",
  "/images/Mazar%202%20Pictures/20260218_195710.jpg",
  "/images/Mazar%202%20Pictures/20260218_195720.jpg",
  "/images/Mazar%202%20Pictures/20260218_195727.jpg",
  "/images/Mazar%202%20Pictures/20260218_195742.jpg",
  "/images/Mazar%202%20Pictures/20260218_195747.jpg",
  "/images/Mazar%202%20Pictures/20260218_195750.jpg",
  "/images/Mazar%202%20Pictures/20260218_195756.jpg",
  "/images/Mazar%202%20Pictures/20260218_195807.jpg",
  "/images/Mazar%202%20Pictures/20260218_195811.jpg",
  "/images/Mazar%202%20Pictures/20260218_195824.jpg",
  "/images/Mazar%202%20Pictures/20260218_195828.jpg",
  "/images/Mazar%202%20Pictures/20260218_204912.jpg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.09%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.10%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.11%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.15%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.17%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.21%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.22%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.25%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.26%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.27%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.28%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.29%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.43%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.16.44%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.49%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.50%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.51%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.52%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.56%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.57%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.34.59%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.35.00%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.35.01%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.35.03%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Image%202026-02-19%20at%209.35.04%20AM.jpeg",
  "/images/Mazar%202%20Pictures/WhatsApp%20Video%202026-02-19%20at%209.16.14%20AM.mp4"
];

const getVideoPath = (index: number) => {
  // Try to use a sensible video mapping for 1-24 based on the directory
  return `/images/video/studio ${index}.mp4`;
}; // (The actual browser will handle 404s gracefully, or we could map them exactly)

export const units: Unit[] = [
  {
    id: "s-single",
    branch: 1 as const,
    type: "studio" as const,
    title: {
      ar: "استوديو سنجل",
      en: "Single Studio"
    },
    description: {
      ar: "استوديو فندقي مريح مجهز بكافة الخدمات لقضاء إقامة هادئة.",
      en: "A comfortable hotel studio equipped with all services for a quiet stay."
    },
    images: mazar1Images.slice(0, 5),
    video: "/images/video/studio 1.mp4",
    features: {
      ar: ["تكييف", "واي فاي سريع", "شاشة سمارت", "مطبخ مجهز"],
      en: ["AC", "Fast WiFi", "Smart TV", "Equipped Kitchen"]
    },
    price: "150"
  },
  {
    id: "s-double",
    branch: 1 as const,
    type: "studio" as const,
    title: {
      ar: "استوديو دبل",
      en: "Double Studio"
    },
    description: {
      ar: "استوديو فندقي واسع يناسب شخصين بأحدث التجهيزات العصرية.",
      en: "A spacious hotel studio suitable for two people with modern amenities."
    },
    images: mazar1Images.slice(5, 10),
    video: "/images/video/studio 2.mp4",
    features: {
      ar: ["سرير مزدوج", "تكييف", "واي فاي سريع", "دخول ذكي", "شاشة سمارت"],
      en: ["Double Bed", "AC", "Fast WiFi", "Smart Entry", "Smart TV"]
    },
    price: "200"
  },
  {
    id: "s-triple",
    branch: 1 as const,
    type: "studio" as const,
    title: {
      ar: "استوديو تريبل",
      en: "Triple Studio"
    },
    description: {
      ar: "استوديو فندقي واسع جداً مجهز لثلاثة أشخاص بكل وسائل الراحة.",
      en: "A very spacious hotel studio equipped for three people with all comforts."
    },
    images: mazar2Images.slice(0, 5),
    video: "/images/video/studio 3.mp4",
    features: {
      ar: ["٣ أسرة فردية", "تكييف", "واي فاي سريع", "مطبخ مجهز"],
      en: ["3 Single Beds", "AC", "Fast WiFi", "Equipped Kitchen"]
    },
    price: "250"
  },
  {
    id: "s-tworoom",
    branch: 1 as const,
    type: "studio" as const,
    title: {
      ar: "استوديو غرفتين",
      en: "Two-room Studio"
    },
    description: {
      ar: "استوديو عائلي فندقي مكون من غرفتين، خيار مثالي للعائلات.",
      en: "A family hotel studio consisting of two rooms, an ideal choice for families."
    },
    images: mazar2Images.slice(5, 10),
    video: "/images/video/studio 4.mp4",
    features: {
      ar: ["غرفتين", "تكييف", "دخول ذكي", "شاشة سمارت", "مطبخ مجهز"],
      en: ["Two Rooms", "AC", "Smart Entry", "Smart TV", "Equipped Kitchen"]
    },
    price: "350"
  },
  // Apartments (3)
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `apt-${i + 1}`,
    branch: 1 as const, 
    type: 'apartment' as const,
    title: {
      ar: `شقة فندقية فاخرة ${i + 1}`,
      en: `Luxury Hotel Apartment ${i + 1}`
    },
    description: {
      ar: 'شقة فندقية واسعة متكاملة الخدمات للعائلات والباحثين عن الرقي في مدينة نصر.',
      en: 'Spacious hotel apartment with complete services for families and luxury seekers in Nasr City.'
    },
    images: mazar1Images.slice(((i + 2) * 5) % mazar1Images.length, ((i + 2) * 5) % mazar1Images.length + 5), 
    video: `/images/video/studio 1.mp4`,
    features: {
      ar: ['غرفتين نوم', 'ريسبشن واسع', 'واي فاي فايبر', 'خدمة نظافة', 'موقف سيارات'],
      en: ['2 Bedrooms', 'Spacious Reception', 'Fiber WiFi', 'Housekeeping', 'Parking']
    }
  }))
];
