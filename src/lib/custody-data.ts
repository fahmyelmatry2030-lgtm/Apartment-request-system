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
  sections: {
    mazar12: { tables: CustodyTable[] };
    mazar3: { tables: CustodyTable[] };
    external: { tables: CustodyTable[] };
  };
  logs: CustodyLog[];
}

export const initialCustodyData: CustodyDataStore = {
  sections: {
    mazar12: {
      tables: [
        {
          id: 'table-devices-12',
          title: 'جدول الأجهزة والكهربائيات',
          items: [
            {
              id: 'item-1',
              num: 1,
              name: 'تكييف 1.5 حصان',
              totalCount: '24',
              unitCount: '20',
              distributionStyle: 'صالة 1 + غرفة 1',
              reserveCount: '4',
              reserveLocation: 'مخزن مزار 1',
              notes: 'حالة ممتازة',
            },
            {
              id: 'item-2',
              num: 2,
              name: 'شاشة سمارت 43 بوصة',
              totalCount: '15',
              unitCount: '12',
              distributionStyle: 'صالة الاستوديو',
              reserveCount: '3',
              reserveLocation: 'رف الأجهزة',
              notes: 'احتياطي معلق',
            },
          ],
        },
        {
          id: 'table-[#furniture-12]',
          title: 'جدول المفروشات والأثاث',
          items: [
            {
              id: 'item-f1',
              num: 1,
              name: 'ملاية سرير دبل',
              totalCount: '50',
              unitCount: '30',
              distributionStyle: '2 لكل استوديو دبل',
              reserveCount: '20',
              reserveLocation: 'مخزن المغسلة',
              notes: 'طقم بريميوم',
            },
          ],
        },
      ],
    },
    mazar3: {
      tables: [
        {
          id: 'table-devices-3',
          title: 'جدول الأجهزة والكهربائيات - مزار 3',
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
    external: {
      tables: [
        {
          id: 'table-ext-1',
          title: 'معدات وأجهزة الشقق الخارجية',
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
      details: 'تهيئة جدول عهدة مزار والأجهزة المبدئي',
    },
  ],
};
