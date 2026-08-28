export interface CustodyItem {
  id: string;
  num: number;
  name: string; // البند
  totalCount: string | number; // العدد الإجمالي
  unitCount: string | number; // المتواجد بالوحدات
  distributionStyle: string; // أسلوب التوزيع
  reserveCount: string | number; // الاحتياط
  reserveLocation: string; // مكان الاحتياط
  notes: string; // ملاحظات
}

export interface CustodyTable {
  id: string;
  title: string; // اسم الجدول
  items: CustodyItem[];
}

export interface CustodyLog {
  id: string;
  timestamp: string;
  user: string;
  action: 'إضافة' | 'تعديل' | 'حذف';
  details: string;
  reason?: string;
}

export interface CustodyDataStore {
  isSetupPhase?: boolean;
  sections: {
    mazar1: { tables: CustodyTable[] };
    mazar2: { tables: CustodyTable[] };
    mazar3: { tables: CustodyTable[] };
    apt1: { tables: CustodyTable[] };
    apt2: { tables: CustodyTable[] };
    apt3: { tables: CustodyTable[] };
    mazar12?: { tables: CustodyTable[] };
    external?: { tables: CustodyTable[] };
  };
  logs: CustodyLog[];
}

export const initialCustodyData: CustodyDataStore = {
  isSetupPhase: true,
  sections: {
    mazar1: {
      tables: [
        {
          id: 'table-devices-m1',
          title: 'جدول الأجهزة والكهربائيات - مزار 1',
          items: [
            {
              id: 'item-m1-1',
              num: 1,
              name: 'تكييف 1.5 حصان',
              totalCount: '12',
              unitCount: '12',
              distributionStyle: 'استوديوهات 1 - 12',
              reserveCount: '0',
              reserveLocation: 'مخزن مزار 1',
              notes: 'حالة ممتازة',
            },
            {
              id: 'item-m1-2',
              num: 2,
              name: 'شاشة سمارت 43 بوصة',
              totalCount: '12',
              unitCount: '12',
              distributionStyle: 'استوديوهات 1 - 12',
              reserveCount: '0',
              reserveLocation: 'رف الأجهزة',
              notes: 'سليمة',
            },
          ],
        },
        {
          id: 'table-furniture-m1',
          title: 'جدول المفروشات والأثاث - مزار 1',
          items: [],
        },
      ],
    },
    mazar2: {
      tables: [
        {
          id: 'table-devices-m2',
          title: 'جدول الأجهزة والكهربائيات - مزار 2',
          items: [
            {
              id: 'item-m2-1',
              num: 1,
              name: 'تكييف 1.5 حصان',
              totalCount: '12',
              unitCount: '12',
              distributionStyle: 'استوديوهات 13 - 24',
              reserveCount: '0',
              reserveLocation: 'مخزن مزار 2',
              notes: 'حالة ممتازة',
            },
          ],
        },
        {
          id: 'table-furniture-m2',
          title: 'جدول المفروشات والأثاث - مزار 2',
          items: [],
        },
      ],
    },
    mazar3: {
      tables: [
        {
          id: 'table-devices-3',
          title: 'جدول الأجهزة والكهربائيات - مزار 3 (أ. أكورة)',
          items: [
            {
              id: 'item-3-1',
              num: 1,
              name: 'ثلاجة توشيبا 14 قدم',
              totalCount: '6',
              unitCount: '6',
              distributionStyle: 'مطبخ الشقة',
              reserveCount: '0',
              reserveLocation: 'لا يوجد',
              notes: 'جديد',
            },
          ],
        },
      ],
    },
    apt1: {
      tables: [
        {
          id: 'table-ext-apt1',
          title: 'معدات وأجهزة شقة 1 الخارجية',
          items: [],
        },
      ],
    },
    apt2: {
      tables: [
        {
          id: 'table-ext-apt2',
          title: 'معدات وأجهزة شقة 2 الخارجية',
          items: [],
        },
      ],
    },
    apt3: {
      tables: [
        {
          id: 'table-ext-apt3',
          title: 'معدات وأجهزة شقة 3 الخارجية',
          items: [],
        },
      ],
    },
  },
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toISOString(),
      user: 'Admin',
      action: 'إضافة',
      details: 'تهيئة جدول عهدة مزار 1 ومزار 2 ومزار 3 والشقق الخارجية',
    },
  ],
};
