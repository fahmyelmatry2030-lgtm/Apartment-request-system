"use client";

import { useState, useEffect, useCallback } from 'react';
import { CustodyDataStore, CustodyTable, CustodyItem, CustodyLog, initialCustodyData } from '@/lib/custody-data';
import { Plus, Trash2, Edit3, Save, RefreshCw, Layers, Box, Check, X, ShieldAlert, History, Search } from 'lucide-react';

export default function CustodyPage() {
  const [store, setStore] = useState<CustodyDataStore>(initialCustodyData);
  const [activeTab, setActiveTab] = useState<'mazar12' | 'mazar3' | 'external'>('mazar12');
  const [adminRole, setAdminRole] = useState<string>('Admin');
  const [adminName, setAdminName] = useState<string>('مدير النظام');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // New Table Modal
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [newTableTitle, setNewTableTitle] = useState('');

  // Edit Table Title Modal
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableTitle, setEditTableTitle] = useState('');

  // Audit Log Reason Modal
  const [logReasonModal, setLogReasonModal] = useState<{
    isOpen: boolean;
    actionType: 'add_item' | 'delete_item' | 'delete_table';
    tableId: string;
    itemId?: string;
    details: string;
  }>({
    isOpen: false,
    actionType: 'add_item',
    tableId: '',
    details: '',
  });
  const [actionReason, setActionReason] = useState('');

  // Read Role from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const info = sessionStorage.getItem('adminInfo');
      if (info) {
        try {
          const parsed = JSON.parse(info);
          if (parsed?.role) setAdminRole(parsed.role);
          if (parsed?.name) setAdminName(parsed.name);

          // Role tab locking
          if (parsed.role === 'Mohsen') setActiveTab('mazar12');
          if (parsed.role === 'Akoura') setActiveTab('mazar3');
        } catch (e) {}
      }
    }
  }, []);

  // Fetch Custody Data from API
  const fetchCustodyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/custody');
      if (res.ok) {
        const data = await res.json();
        if (data && data.sections) {
          setStore(data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch custody data from API:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustodyData();
  }, [fetchCustodyData]);

  // Save Store to Server
  const saveStore = async (updatedStore: CustodyDataStore, msg = 'تم حفظ التعديلات بنجاح') => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/custody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStore),
      });
      if (res.ok) {
        setStore(updatedStore);
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert('فشل حفظ التعديلات على السيرفر');
      }
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  // Log Activity Helper
  const createLog = (action: 'إضافة' | 'تعديل' | 'حذف', details: string, reason = ''): CustodyLog => ({
    id: 'log-' + Date.now(),
    timestamp: new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    user: adminName + ` (${adminRole})`,
    action,
    details,
    reason,
  });

  // Role Checks
  const isMohsen = adminRole === 'Mohsen';
  const isAkoura = adminRole === 'Akoura';

  // Allowed Tabs logic
  const canAccessTab = (tab: 'mazar12' | 'mazar3' | 'external') => {
    if (isMohsen) return tab === 'mazar12';
    if (isAkoura) return tab === 'mazar3';
    return true;
  };

  // Add New Table
  const handleAddTable = () => {
    if (!newTableTitle.trim()) return;
    const newTable: CustodyTable = {
      id: 'table-' + Date.now(),
      title: newTableTitle.trim(),
      items: [],
    };

    const updatedSections = { ...store.sections };
    updatedSections[activeTab].tables.push(newTable);

    const log = createLog('إضافة', `إنشاء جدول جديد بعنوان: "${newTableTitle.trim()}" في قسم (${tabLabel(activeTab)})`);
    const updatedStore = {
      ...store,
      sections: updatedSections,
      logs: [log, ...store.logs],
    };

    saveStore(updatedStore, `تمت إضافة جدول "${newTableTitle.trim()}" بنجاح`);
    setNewTableTitle('');
    setIsAddTableModalOpen(false);
  };

  // Rename Table
  const handleRenameTable = (tableId: string) => {
    if (!editTableTitle.trim()) return;
    const updatedSections = { ...store.sections };
    const table = updatedSections[activeTab].tables.find((t) => t.id === tableId);
    if (table) {
      const oldTitle = table.title;
      table.title = editTableTitle.trim();
      const log = createLog('تعديل', `تغيير اسم الجدول من "${oldTitle}" إلى "${table.title}"`);
      saveStore(
        {
          ...store,
          sections: updatedSections,
          logs: [log, ...store.logs],
        },
        'تم تغيير اسم الجدول بنجاح'
      );
    }
    setEditingTableId(null);
    setEditTableTitle('');
  };

  // Delete Table
  const handleDeleteTable = (tableId: string) => {
    const table = store.sections[activeTab].tables.find((t) => t.id === tableId);
    if (!table) return;
    if (!confirm(`هل أنت تأكد من حذف الجدول الكامل "${table.title}" بجميع محتوياته؟`)) return;

    const updatedSections = { ...store.sections };
    updatedSections[activeTab].tables = updatedSections[activeTab].tables.filter((t) => t.id !== tableId);

    const log = createLog('حذف', `حذف جدول بالكامل بعنوان: "${table.title}" من قسم (${tabLabel(activeTab)})`);
    saveStore(
      {
        ...store,
        sections: updatedSections,
        logs: [log, ...store.logs],
      },
      'تم حذف الجدول بنجاح'
    );
  };

  // Add Item to Table
  const handleAddItem = (tableId: string) => {
    const updatedSections = { ...store.sections };
    const table = updatedSections[activeTab].tables.find((t) => t.id === tableId);
    if (!table) return;

    const newItem: CustodyItem = {
      id: 'item-' + Date.now(),
      num: table.items.length + 1,
      name: 'بند جديد',
      totalCount: '1',
      unitCount: '1',
      distributionStyle: '—',
      reserveCount: '0',
      reserveLocation: 'المخزن الرئيسي',
      notes: '',
    };

    table.items.push(newItem);

    const log = createLog('إضافة', `إضافة بند جديد إلى جدول (${table.title})`);
    saveStore(
      {
        ...store,
        sections: updatedSections,
        logs: [log, ...store.logs],
      },
      'تم إضافة بند جديد للجدول'
    );
  };

  // Update Item Property
  const handleUpdateItem = (tableId: string, itemId: string, field: keyof CustodyItem, value: any) => {
    const updatedSections = { ...store.sections };
    const table = updatedSections[activeTab].tables.find((t) => t.id === tableId);
    if (!table) return;

    const item = table.items.find((i) => i.id === itemId);
    if (!item) return;

    item[field] = value as never;
    setStore({ ...store, sections: updatedSections });
  };

  // Save Current Table Items & Log Edit
  const handleSaveTableItems = (tableId: string) => {
    const table = store.sections[activeTab].tables.find((t) => t.id === tableId);
    if (!table) return;

    const log = createLog('تعديل', `حفظ وتحديث بيانات جدول (${table.title})`);
    saveStore(
      {
        ...store,
        logs: [log, ...store.logs],
      },
      'تم حفظ جدول ' + table.title
    );
  };

  // Delete Item
  const handleDeleteItem = (tableId: string, itemId: string) => {
    const table = store.sections[activeTab].tables.find((t) => t.id === tableId);
    if (!table) return;
    const item = table.items.find((i) => i.id === itemId);

    const updatedSections = { ...store.sections };
    const targetTable = updatedSections[activeTab].tables.find((t) => t.id === tableId);
    if (targetTable) {
      targetTable.items = targetTable.items.filter((i) => i.id !== itemId);
      // Re-index numbers
      targetTable.items.forEach((it, index) => {
        it.num = index + 1;
      });
    }

    const log = createLog('حذف', `إزالة بند "${item?.name || ''}" من جدول (${table.title})`);
    saveStore(
      {
        ...store,
        sections: updatedSections,
        logs: [log, ...store.logs],
      },
      'تم حذف البند بنجاح'
    );
  };

  const tabLabel = (tabKey: string) => {
    if (tabKey === 'mazar12') return 'مزار 1 و 2';
    if (tabKey === 'mazar3') return 'مزار 3 (عكورة)';
    return 'الشقق الخارجية';
  };

  const currentTables = store.sections[activeTab]?.tables || [];

  return (
    <div className="space-y-8 animate-fade-in text-[#2A2723]" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={20} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2A2723] via-[#3A3530] to-[#1F1C18] p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl border border-[#C1A68D]/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1.5 md:space-y-2 z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl p-2.5 md:p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl md:rounded-2xl">📦</span>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-white">عهدة مزار والأجهزة والمحتويات</h1>
              <p className="text-[11px] md:text-xs text-amber-200/80 font-bold mt-0.5 md:mt-1">
                إدارة كافة المعدات، المفروشات، والأجهزة الكهربائية الخاصة باستوديوهات وشقق مزار
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 md:gap-3 z-10 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={fetchCustodyData}
            disabled={isLoading}
            className="bg-white/10 hover:bg-white/20 text-white font-black px-3.5 py-2.5 md:px-4 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs transition-all border border-white/10 flex items-center gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>

          {!isMohsen && !isAkoura && (
            <button
              type="button"
              onClick={() => setIsAddTableModalOpen(true)}
              className="bg-[#C1A68D] hover:bg-[#a68d74] text-black font-black px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs transition-all shadow-xl flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>إضافة جدول جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TOP SECTION NAVIGATION TABS (3 MAIN TABS) ─────────────────────── */}
      <div className="flex items-center gap-2.5 md:gap-3 overflow-x-auto pb-2 custom-scrollbar border-b border-[#EAE4D9]">
        {canAccessTab('mazar12') && (
          <button
            type="button"
            onClick={() => setActiveTab('mazar12')}
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
              activeTab === 'mazar12'
                ? 'bg-[#2A2723] text-white shadow-xl scale-105 border border-[#C1A68D]'
                : 'bg-white text-[#7A7061] hover:bg-[#FDFBF7] border border-[#EAE4D9]'
            }`}
          >
            <span>🏢</span>
            <span>مزار 1 و 2 (الوحدات 1 - 24)</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.mazar12.tables.length} جدول
            </span>
          </button>
        )}

        {canAccessTab('mazar3') && (
          <button
            type="button"
            onClick={() => setActiveTab('mazar3')}
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
              activeTab === 'mazar3'
                ? 'bg-[#2A2723] text-white shadow-xl scale-105 border border-[#C1A68D]'
                : 'bg-white text-[#7A7061] hover:bg-[#FDFBF7] border border-[#EAE4D9]'
            }`}
          >
            <span>🏬</span>
            <span>مزار 3 (عكورة / الشقق)</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.mazar3.tables.length} جدول
            </span>
          </button>
        )}

        {canAccessTab('external') && (
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
              activeTab === 'external'
                ? 'bg-[#2A2723] text-white shadow-xl scale-105 border border-[#C1A68D]'
                : 'bg-white text-[#7A7061] hover:bg-[#FDFBF7] border border-[#EAE4D9]'
            }`}
          >
            <span>🏡</span>
            <span>الشقق الخارجية</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.external.tables.length} جدول
            </span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن جهاز، مفروشات، أو بند في عهدة القسم..."
          className="w-full bg-white border border-[#EAE4D9] rounded-2xl pr-11 pl-4 py-3 text-xs font-bold focus:border-[#C1A68D] outline-none transition-all shadow-sm"
        />
      </div>

      {/* ── TABLES DISPLAY SECTION ────────────────────────────────────────── */}
      {currentTables.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-[#EAE4D9] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center text-3xl mx-auto border border-[#EAE4D9]">
            📋
          </div>
          <h3 className="text-lg font-black text-[#2A2723]">لا يوجد جداول عهدة في قسم ({tabLabel(activeTab)})</h3>
          <p className="text-xs text-gray-500 font-bold max-w-md mx-auto">
            قم بالضغط على زر "إضافة جدول جديد" لإنشاء جدول الجداول والأجهزة والمفروشات لهذا القسم.
          </p>
          <button
            type="button"
            onClick={() => setIsAddTableModalOpen(true)}
            className="bg-[#2A2723] hover:bg-black text-white font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-lg"
          >
            + إضافة جدول جديد الآن
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {currentTables.map((table) => {
            const filteredItems = table.items.filter((item) =>
              !searchTerm
                ? true
                : item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.distributionStyle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.reserveLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.notes.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <div
                key={table.id}
                className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-[#EAE4D9] shadow-md p-4 md:p-8 space-y-4 md:space-y-6 relative overflow-hidden"
              >
                {/* Table Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 border-b border-[#EAE4D9] pb-4 md:pb-5">
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <span className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[#C1A68D]/10 border border-[#C1A68D]/30 flex items-center justify-center text-[#C1A68D] font-black text-base md:text-lg shrink-0">
                      📋
                    </span>
                    {editingTableId === table.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTableTitle}
                          onChange={(e) => setEditTableTitle(e.target.value)}
                          className="bg-[#FDFBF7] border border-[#C1A68D] font-black text-sm md:text-base px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameTable(table.id)}
                          className="bg-emerald-600 text-white p-1.5 md:p-2 rounded-xl"
                          title="حفظ الاسم"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h2 className="text-base md:text-xl font-black text-[#2A2723]">{table.title}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTableId(table.id);
                            setEditTableTitle(table.title);
                          }}
                          className="text-gray-400 hover:text-[#C1A68D] p-1"
                          title="تعديل اسم الجدول"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    <button
                      type="button"
                      onClick={() => handleAddItem(table.id)}
                      className="bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[11px] md:text-xs font-black transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Plus size={15} />
                      <span>إضافة بند صف جديد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveTableItems(table.id)}
                      disabled={isSaving}
                      className="bg-[#2A2723] hover:bg-black text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-[11px] md:text-xs font-black transition-all flex items-center gap-1 shadow-md"
                      title="حفظ تغييرات البيانات في هذا الجدول"
                    >
                      <Save size={15} />
                      <span>حفظ الجدول</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTable(table.id)}
                      className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 p-2 md:p-2.5 rounded-xl text-xs font-black transition-all"
                      title="حذف الجدول بالكامل"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Table Data View */}
                <div className="overflow-x-auto custom-scrollbar rounded-xl md:rounded-2xl border border-[#EAE4D9]">
                  <table className="w-full text-right text-[11px] md:text-xs">
                    <thead className="bg-[#2A2723] text-white font-black">
                      <tr>
                        <th className="p-2 md:p-3.5 text-center w-10 md:w-12 border-b border-white/10 text-[10px] md:text-xs">م</th>
                        <th className="p-2 md:p-3.5 min-w-[140px] md:min-w-[180px] border-b border-white/10 text-[10px] md:text-xs">البند</th>
                        <th className="p-2 md:p-3.5 text-center w-24 md:w-28 border-b border-white/10 text-[10px] md:text-xs">العدد الإجمالي</th>
                        <th className="p-2 md:p-3.5 text-center w-28 md:w-32 border-b border-white/10 text-[10px] md:text-xs">المتواجد بالوحدات</th>
                        <th className="p-2 md:p-3.5 min-w-[140px] md:min-w-[180px] border-b border-white/10 text-[10px] md:text-xs">أسلوب التوزيع</th>
                        <th className="p-2 md:p-3.5 text-center w-20 md:w-24 border-b border-white/10 text-[10px] md:text-xs">الاحتياط</th>
                        <th className="p-2 md:p-3.5 min-w-[120px] md:min-w-[150px] border-b border-white/10 text-[10px] md:text-xs">مكان الاحتياط</th>
                        <th className="p-2 md:p-3.5 min-w-[130px] md:min-w-[160px] border-b border-white/10 text-[10px] md:text-xs">ملاحظات</th>
                        <th className="p-2 md:p-3.5 text-center w-12 md:w-16 border-b border-white/10 text-[10px] md:text-xs">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE4D9] bg-white font-bold text-[#2A2723]">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-gray-400 font-bold">
                            لا يوجد بنود مسجلة في هذا الجدول حتى الآن. انقر على "+ إضافة بند صف جديد".
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-[#FDFBF7] transition-colors">
                            {/* Serial Number */}
                            <td className="p-1.5 md:p-3 text-center font-black text-gray-500 bg-[#FDFBF7] text-[10px] md:text-xs">{idx + 1}</td>

                            {/* Item Name */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'name', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs"
                                placeholder="اسم البند..."
                              />
                            </td>

                            {/* Total Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.totalCount}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'totalCount', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-amber-700"
                                placeholder="0"
                              />
                            </td>

                            {/* Units Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.unitCount}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'unitCount', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-emerald-700"
                                placeholder="0"
                              />
                            </td>

                            {/* Distribution Style */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.distributionStyle}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'distributionStyle', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs"
                                placeholder="توزيع..."
                              />
                            </td>

                            {/* Reserve Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.reserveCount}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'reserveCount', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-blue-700"
                                placeholder="0"
                              />
                            </td>

                            {/* Reserve Location */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.reserveLocation}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'reserveLocation', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs"
                                placeholder="المخزن..."
                              />
                            </td>

                            {/* Notes */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'notes', e.target.value)}
                                className="w-full bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D] px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs text-gray-600"
                                placeholder="ملاحظات..."
                              />
                            </td>

                            {/* Delete Row Action */}
                            <td className="p-1 md:p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(table.id, item.id)}
                                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                                title="حذف الصف"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-gray-500">
                    إجمالي البنود المسجلة: {table.items.length} بند
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddItem(table.id)}
                    className="text-xs font-black text-[#C1A68D] hover:underline flex items-center gap-1"
                  >
                    + إضافة سطر بند جديد لهذا الجدول
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AUDIT LOG ACTIVITY PANEL ────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-[#EAE4D9] p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-4">
          <div className="flex items-center gap-2 text-base font-black text-[#2A2723]">
            <History size={20} className="text-[#C1A68D]" />
            <span>سجل الحركة والتعديلات على العهدة (Audit Log)</span>
          </div>
          <span className="text-xs text-gray-400 font-bold">آخر {store.logs?.length || 0} حركة مسجلة</span>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {store.logs?.length === 0 ? (
            <p className="text-xs text-gray-400 font-bold text-center py-4">لا يوجد سجلات حركة حالياً.</p>
          ) : (
            store.logs?.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#EAE4D9]/60 flex items-center justify-between gap-4 text-xs font-bold"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      log.action === 'إضافة'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.action === 'حذف'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[#2A2723]">{log.details}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-500 shrink-0">
                  <span>بواسطة: {log.user}</span>
                  <span className="dir-ltr">{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── ADD NEW TABLE MODAL ────────────────────────────────────────────── */}
      {isAddTableModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full border border-[#EAE4D9] space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#EAE4D9] pb-3">
              <h3 className="text-base font-black text-[#2A2723] flex items-center gap-2">
                <span>📋</span>
                <span>إضافة جدول عهدة جديد</span>
              </h3>
              <button onClick={() => setIsAddTableModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#5C554B]">اسم الجدول الجديد:</label>
              <input
                type="text"
                value={newTableTitle}
                onChange={(e) => setNewTableTitle(e.target.value)}
                placeholder="مثال: جدول المفروشات والأثاث، جدول أدوات المطبخ..."
                className="w-full bg-[#FDFBF7] border border-[#EAE4D9] focus:border-[#C1A68D] rounded-xl p-3 text-xs font-bold outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddTable}
                className="flex-1 bg-[#2A2723] hover:bg-black text-white font-black py-3 rounded-xl text-xs transition-all"
              >
                إنشاء الجدول
              </button>
              <button
                type="button"
                onClick={() => setIsAddTableModalOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl text-xs transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
