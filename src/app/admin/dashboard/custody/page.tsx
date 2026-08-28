"use client";

import { useState, useEffect, useCallback } from 'react';
import { CustodyDataStore, CustodyTable, CustodyItem, CustodyLog, initialCustodyData } from '@/lib/custody-data';
import { Plus, Trash2, Edit3, Save, RefreshCw, Layers, Box, Check, X, ShieldAlert, History, Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function CustodyPage() {
  const [store, setStore] = useState<CustodyDataStore>(initialCustodyData);
  const [activeTab, setActiveTab] = useState<'mazar1' | 'mazar2' | 'mazar3' | 'external'>('mazar1');
  const [activeExternalSubTab, setActiveExternalSubTab] = useState<'apt1' | 'apt2' | 'apt3' | 'all'>('apt1');
  const [adminRole, setAdminRole] = useState<string>('Admin');
  const [adminName, setAdminName] = useState<string>('مدير النظام');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [tableZoom, setTableZoom] = useState<number>(100); // 70%, 85%, 100%, 115%, 130%

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

  // Comprehensive Migration Helper for backward compatibility and restoring data
  const formatStoreData = (data: any): CustodyDataStore => {
    const s = data?.sections || {};

    const oldMazar12Tables = s.mazar12?.tables || [];
    const existingMazar1Tables = s.mazar1?.tables || [];
    const existingMazar2Tables = s.mazar2?.tables || [];

    const existingIds = new Set([
      ...existingMazar1Tables.map((t: any) => t.id),
      ...existingMazar2Tables.map((t: any) => t.id),
    ]);

    const mazar1Tables = [...existingMazar1Tables];
    const mazar2Tables = [...existingMazar2Tables];

    for (const t of oldMazar12Tables) {
      if (!existingIds.has(t.id)) {
        if (t.id.includes('-m2') || t.title.includes('مزار 2')) {
          mazar2Tables.push(t);
        } else {
          mazar1Tables.push(t);
        }
        existingIds.add(t.id);
      }
    }

    const oldExternalTables = s.external?.tables || [];
    const existingApt1Tables = s.apt1?.tables || [];
    const existingApt2Tables = s.apt2?.tables || [];
    const existingApt3Tables = s.apt3?.tables || [];

    const existingAptIds = new Set([
      ...existingApt1Tables.map((t: any) => t.id),
      ...existingApt2Tables.map((t: any) => t.id),
      ...existingApt3Tables.map((t: any) => t.id),
    ]);

    const apt1Tables = [...existingApt1Tables];
    const apt2Tables = [...existingApt2Tables];
    const apt3Tables = [...existingApt3Tables];

    for (const t of oldExternalTables) {
      if (!existingAptIds.has(t.id)) {
        apt1Tables.push(t);
        existingAptIds.add(t.id);
      }
    }

    const mazar3Tables = s.mazar3?.tables || [];

    return {
      ...data,
      sections: {
        mazar1: { tables: mazar1Tables },
        mazar2: { tables: mazar2Tables },
        mazar3: { tables: mazar3Tables },
        apt1: { tables: apt1Tables },
        apt2: { tables: apt2Tables },
        apt3: { tables: apt3Tables },
      },
    };
  };

  // Helper to merge local backup store with server store
  const mergeBackupStore = (serverStore: CustodyDataStore, backupStore: CustodyDataStore): CustodyDataStore => {
    if (!backupStore || !backupStore.sections) return serverStore;
    const formattedBackup = formatStoreData(backupStore);

    const mergedSections = { ...serverStore.sections };
    const sectionKeys: (keyof CustodyDataStore['sections'])[] = ['mazar1', 'mazar2', 'mazar3', 'apt1', 'apt2', 'apt3'];

    for (const k of sectionKeys) {
      const serverTables = mergedSections[k]?.tables || [];
      const backupTables = formattedBackup.sections[k]?.tables || [];

      const serverTableIds = new Set(serverTables.map((t) => t.id));
      const combinedTables = [...serverTables];

      for (const bt of backupTables) {
        if (!serverTableIds.has(bt.id)) {
          combinedTables.push(bt);
          serverTableIds.add(bt.id);
        } else {
          // Replace server table with backup table if backup table has more items
          const serverTableIdx = combinedTables.findIndex((t) => t.id === bt.id);
          if (serverTableIdx !== -1 && (bt.items?.length || 0) > (combinedTables[serverTableIdx].items?.length || 0)) {
            combinedTables[serverTableIdx] = bt;
          }
        }
      }
      mergedSections[k] = { tables: combinedTables };
    }

    return {
      ...serverStore,
      sections: mergedSections,
    };
  };

  type StandardSectionKey = 'mazar1' | 'mazar2' | 'mazar3' | 'apt1' | 'apt2' | 'apt3';

  // Helper to locate table section in store
  const findTableSection = (sections: any, tableId: string): StandardSectionKey | null => {
    const keys: StandardSectionKey[] = ['mazar1', 'mazar2', 'mazar3', 'apt1', 'apt2', 'apt3'];
    for (const k of keys) {
      if (sections[k]?.tables?.some((t: CustodyTable) => t.id === tableId)) {
        return k;
      }
    }
    return null;
  };

  // Read Role & Set Initial Mobile Zoom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Auto initial zoom out on mobile screens
      if (window.innerWidth < 768) {
        setTableZoom(80);
      }

      const info = sessionStorage.getItem('adminInfo');
      if (info) {
        try {
          const parsed = JSON.parse(info);
          if (parsed?.role) setAdminRole(parsed.role);
          if (parsed?.name) setAdminName(parsed.name);

          // Role tab locking
          if (parsed.role === 'Mohsen') setActiveTab('mazar1');
          if (parsed.role === 'Akoura' || parsed.role === 'Aura' || parsed.role === 'koura') setActiveTab('mazar3');
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
          const formatted = formatStoreData(data);
          if (typeof window !== 'undefined') {
            try {
              const backupRaw = localStorage.getItem('mazar_custody_backup');
              if (backupRaw) {
                const backupStore = JSON.parse(backupRaw);
                const merged = mergeBackupStore(formatted, backupStore);
                setStore(merged);
                return;
              }
            } catch (e) {}
          }
          setStore(formatted);
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

  // Save Store to Server and Backup Locally
  const saveStore = async (updatedStore: CustodyDataStore, msg = 'تم حفظ التعديلات بنجاح') => {
    setIsSaving(true);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mazar_custody_backup', JSON.stringify(updatedStore));
      } catch (e) {}
    }
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
  const isAkoura = adminRole === 'Akoura' || adminRole === 'Aura' || adminRole === 'koura';
  const isReadOnly = isMohsen || isAkoura;

  // Allowed Tabs logic
  const canAccessTab = (tab: 'mazar1' | 'mazar2' | 'mazar3' | 'external') => {
    if (isMohsen) return tab === 'mazar1' || tab === 'mazar2';
    if (isAkoura) return tab === 'mazar3';
    return true;
  };

  const isSetup = store.isSetupPhase !== false;

  // Add New Table
  const handleAddTable = () => {
    if (!newTableTitle.trim()) return;
    const newTable: CustodyTable = {
      id: 'table-' + Date.now(),
      title: newTableTitle.trim(),
      items: [],
    };

    const targetKey = activeTab === 'external' ? (activeExternalSubTab === 'all' ? 'apt1' : activeExternalSubTab) : activeTab;
    const updatedSections = { ...store.sections };
    if (!updatedSections[targetKey]) updatedSections[targetKey] = { tables: [] };
    updatedSections[targetKey].tables.push(newTable);

    const log = createLog('إضافة', `إنشاء جدول جديد بعنوان: "${newTableTitle.trim()}" في قسم (${tabLabel(targetKey)})`);
    const updatedStore = {
      ...store,
      sections: updatedSections,
      logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
    };

    saveStore(updatedStore, `تمت إضافة جدول "${newTableTitle.trim()}" بنجاح`);
    setNewTableTitle('');
    setIsAddTableModalOpen(false);
  };

  // Rename Table
  const handleRenameTable = (tableId: string) => {
    if (!editTableTitle.trim()) return;
    const updatedSections = { ...store.sections };
    const secKey = findTableSection(updatedSections, tableId);
    if (!secKey || !updatedSections[secKey]) return;
    const table = updatedSections[secKey].tables.find((t) => t.id === tableId);
    if (table) {
      const oldTitle = table.title;
      table.title = editTableTitle.trim();
      const log = createLog('تعديل', `تغيير اسم الجدول من "${oldTitle}" إلى "${table.title}"`);
      saveStore(
        {
          ...store,
          sections: updatedSections,
          logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
        },
        'تم تغيير اسم الجدول بنجاح'
      );
    }
    setEditingTableId(null);
    setEditTableTitle('');
  };

  // Delete Table
  const handleDeleteTable = (tableId: string) => {
    const updatedSections = { ...store.sections };
    const secKey = findTableSection(updatedSections, tableId);
    if (!secKey || !updatedSections[secKey]) return;
    const table = updatedSections[secKey].tables.find((t) => t.id === tableId);
    if (!table) return;
    if (!confirm(`هل أنت تأكد من حذف الجدول الكامل "${table.title}" بجميع محتوياته؟`)) return;

    updatedSections[secKey].tables = updatedSections[secKey].tables.filter((t) => t.id !== tableId);

    const log = createLog('حذف', `حذف جدول بالكامل بعنوان: "${table.title}" من قسم (${tabLabel(secKey)})`);
    saveStore(
      {
        ...store,
        sections: updatedSections,
        logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
      },
      'تم حذف الجدول بنجاح'
    );
  };

  // Add Item to Table
  const handleAddItem = (tableId: string) => {
    const updatedSections = { ...store.sections };
    const secKey = findTableSection(updatedSections, tableId);
    if (!secKey || !updatedSections[secKey]) return;
    const table = updatedSections[secKey].tables.find((t) => t.id === tableId);
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
        logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
      },
      'تم إضافة بند جديد للجدول'
    );
  };

  // Update Item Property
  const handleUpdateItem = (tableId: string, itemId: string, field: keyof CustodyItem, value: any) => {
    const updatedSections = { ...store.sections };
    const secKey = findTableSection(updatedSections, tableId);
    if (!secKey || !updatedSections[secKey]) return;
    const table = updatedSections[secKey].tables.find((t) => t.id === tableId);
    if (!table) return;

    const item = table.items.find((i) => i.id === itemId);
    if (!item) return;

    item[field] = value as never;
    setStore({ ...store, sections: updatedSections });
  };

  // Save Current Table Items & Log Edit
  const handleSaveTableItems = (tableId: string) => {
    const secKey = findTableSection(store.sections, tableId);
    if (!secKey || !store.sections[secKey]) return;
    const table = store.sections[secKey].tables.find((t) => t.id === tableId);
    if (!table) return;

    const log = createLog('تعديل', `حفظ وتحديث بيانات جدول (${table.title})`);
    saveStore(
      {
        ...store,
        logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
      },
      'تم حفظ جدول ' + table.title
    );
  };

  // Delete Item
  const handleDeleteItem = (tableId: string, itemId: string) => {
    const updatedSections = { ...store.sections };
    const secKey = findTableSection(updatedSections, tableId);
    if (!secKey || !updatedSections[secKey]) return;
    const table = updatedSections[secKey].tables.find((t) => t.id === tableId);
    if (!table) return;
    const item = table.items.find((i) => i.id === itemId);

    table.items = table.items.filter((i) => i.id !== itemId);
    table.items.forEach((it, index) => {
      it.num = index + 1;
    });

    const log = createLog('حذف', `إزالة بند "${item?.name || ''}" من جدول (${table.title})`);
    saveStore(
      {
        ...store,
        sections: updatedSections,
        logs: isSetup ? (store.logs || []) : [log, ...(store.logs || [])],
      },
      'تم حذف البند بنجاح'
    );
  };

  // Finalize Setup & Lock Initial Baseline
  const handleFinalizeSetup = () => {
    if (!confirm('هل أنت تأكد من الانتهاء من تأسيس وتنسيق العهدة؟ عند التثبيت، أي حركة إضافة أو مسح أو تعديل قادمة ستسجل تلقائياً في السجل.')) return;
    const log = createLog('إضافة', '🟢 تم اعتماد وتثبيت العهدة الأساسية بنجاح وتفعيل سجل التعديلات والحركة المباشر');
    saveStore(
      {
        ...store,
        isSetupPhase: false,
        logs: [log, ...(store.logs || [])],
      },
      'تم تثبيت العهدة وتفعيل سجل التعديلات بنجاح 🎉'
    );
  };

  // Return to Setup Phase
  const handleReturnToSetup = () => {
    if (!confirm('هل تريد العودة إلى وضع التأسيس؟ في وضع التأسيس، يمكنك تعديل وإضافة البيانات بحرية دون تسجيلها في جدول السجل.')) return;
    saveStore(
      {
        ...store,
        isSetupPhase: true,
      },
      'تم فتح وضع التأسيس (السجل معطل مؤقتاً)'
    );
  };

  // Clear All Audit Logs
  const handleClearLogs = () => {
    if (!confirm('هل أنت تأكد من تصفير ومسح جميع سجلات الحركة والتغييرات القديمة؟')) return;
    saveStore(
      {
        ...store,
        logs: [],
      },
      'تم تصفير سجل التعديلات بنجاح'
    );
  };

  const tabLabel = (tabKey: string) => {
    if (tabKey === 'mazar1') return 'مزار 1';
    if (tabKey === 'mazar2') return 'مزار 2';
    if (tabKey === 'mazar3') return 'مزار 3 (أ. أكورة)';
    if (tabKey === 'apt1') return 'شقة 1';
    if (tabKey === 'apt2') return 'شقة 2';
    if (tabKey === 'apt3') return 'شقة 3';
    return 'الشقق الخارجية';
  };

  const currentTables = (() => {
    if (activeTab === 'mazar1') return store.sections?.mazar1?.tables || [];
    if (activeTab === 'mazar2') return store.sections?.mazar2?.tables || [];
    if (activeTab === 'mazar3') return store.sections?.mazar3?.tables || [];
    if (activeTab === 'external') {
      if (activeExternalSubTab === 'apt1') return store.sections?.apt1?.tables || [];
      if (activeExternalSubTab === 'apt2') return store.sections?.apt2?.tables || [];
      if (activeExternalSubTab === 'apt3') return store.sections?.apt3?.tables || [];
      return [
        ...(store.sections?.apt1?.tables || []),
        ...(store.sections?.apt2?.tables || []),
        ...(store.sections?.apt3?.tables || []),
      ];
    }
    return [];
  })();

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

          {!isReadOnly && (
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

      {/* ── SETUP PHASE STATUS CONTROL BAR ── */}
      <div
        className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-all ${
          isSetup
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xl md:text-2xl p-2.5 rounded-2xl ${isSetup ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
            {isSetup ? '🛠️' : '🟢'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm md:text-base">
                {isSetup ? 'وضع تأسيس العهدة حالياً (سجل التعديلات معطل مؤقتاً)' : 'وضع التشغيل المباشر (سجل الحركة والتعديلات مفعل وموثق 100%)'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${isSetup ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'}`}>
                {isSetup ? 'مرحلة التأسيس' : 'مكتمل ومثبت'}
              </span>
            </div>
            <p className="text-xs font-bold opacity-80 mt-1 leading-relaxed">
              {isSetup
                ? 'يمكنك الآن كتابة، تعديل، وإضافة أجهزة ومحتويات العهدة بحرية دون تسجيل أو تلوث جدول السجل. عند انتهائك، انقر زر "اعتماد وتثبيت العهدة".'
                : 'أي حركة إضافة أو مسح أو تعديل تتم الآن تُسجل وتُوثق تلقائياً بالاسم والوقت وسبب التعديل في جدول السجل بالأسفل.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {!isReadOnly && isSetup && (
            <button
              type="button"
              onClick={handleFinalizeSetup}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Check size={16} />
              <span>اعتماد وتثبيت العهدة (تفعيل السجل)</span>
            </button>
          )}

          {!isReadOnly && !isSetup && (
            <button
              type="button"
              onClick={handleReturnToSetup}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1"
              title="العودة لوضع التأسيس لو كان هناك تعديل تاسيسي تود إجراؤه دون تسجيله"
            >
              <RotateCcw size={14} />
              <span>العودة لوضع التأسيس</span>
            </button>
          )}

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1"
              title="تصفير ومسح السجلات القديمة"
            >
              <Trash2 size={14} />
              <span>تصفير السجل</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TOP SECTION NAVIGATION TABS (4 MAIN TABS) ─────────────────────── */}
      <div className="flex items-center gap-2.5 md:gap-3 overflow-x-auto pb-2 custom-scrollbar border-b border-[#EAE4D9]">
        {canAccessTab('mazar1') && (
          <button
            type="button"
            onClick={() => setActiveTab('mazar1')}
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
              activeTab === 'mazar1'
                ? 'bg-[#2A2723] text-white shadow-xl scale-105 border border-[#C1A68D]'
                : 'bg-white text-[#7A7061] hover:bg-[#FDFBF7] border border-[#EAE4D9]'
            }`}
          >
            <span>🏢</span>
            <span>مزار 1 (الوحدات 1 - 12)</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.mazar1?.tables?.length || 0} جدول
            </span>
          </button>
        )}

        {canAccessTab('mazar2') && (
          <button
            type="button"
            onClick={() => setActiveTab('mazar2')}
            className={`px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 ${
              activeTab === 'mazar2'
                ? 'bg-[#2A2723] text-white shadow-xl scale-105 border border-[#C1A68D]'
                : 'bg-white text-[#7A7061] hover:bg-[#FDFBF7] border border-[#EAE4D9]'
            }`}
          >
            <span>🏢</span>
            <span>مزار 2 (الوحدات 13 - 24)</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.mazar2?.tables?.length || 0} جدول
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
            <span>مزار 3 (أ. أكورة / الشقق 25 - 30)</span>
            <span className="bg-[#C1A68D]/20 text-[#C1A68D] text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold">
              {store.sections.mazar3?.tables?.length || 0} جدول
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
              {(store.sections.apt1?.tables?.length || 0) + (store.sections.apt2?.tables?.length || 0) + (store.sections.apt3?.tables?.length || 0)} جدول
            </span>
          </button>
        )}
      </div>

      {/* ── SUB-TABS FOR EXTERNAL APARTMENTS ── */}
      {activeTab === 'external' && (
        <div className="flex items-center gap-2 bg-[#FDFBF7] p-2.5 rounded-2xl border border-[#EAE4D9] overflow-x-auto shadow-inner">
          <span className="text-xs font-black text-[#7A7061] px-2 shrink-0 flex items-center gap-1">
            <span>🛋️</span>
            <span>اختر الشقة الخارجية:</span>
          </span>

          <button
            type="button"
            onClick={() => setActiveExternalSubTab('apt1')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              activeExternalSubTab === 'apt1'
                ? 'bg-[#2A2723] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>شقة 1</span>
            <span className="bg-amber-500/20 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {store.sections.apt1?.tables?.length || 0} جدول
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveExternalSubTab('apt2')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              activeExternalSubTab === 'apt2'
                ? 'bg-[#2A2723] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>شقة 2</span>
            <span className="bg-amber-500/20 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {store.sections.apt2?.tables?.length || 0} جدول
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveExternalSubTab('apt3')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              activeExternalSubTab === 'apt3'
                ? 'bg-[#2A2723] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>شقة 3</span>
            <span className="bg-amber-500/20 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {store.sections.apt3?.tables?.length || 0} جدول
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveExternalSubTab('all')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              activeExternalSubTab === 'all'
                ? 'bg-[#C1A68D] text-black shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>عرض كل الشقق الخارجية</span>
          </button>
        </div>
      )}

      {/* Search Bar & Zoom In / Zoom Out Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن جهاز، مفروشات، أو بند في عهدة القسم..."
            className="w-full bg-white border border-[#EAE4D9] rounded-2xl pr-11 pl-4 py-3 text-xs font-bold focus:border-[#C1A68D] outline-none transition-all shadow-sm"
          />
        </div>

        {/* Zoom In & Zoom Out Controls */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#EAE4D9] shadow-sm self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1 bg-[#FDFBF7] p-1 rounded-xl border border-[#EAE4D9]">
            <button
              type="button"
              onClick={() => setTableZoom((prev) => Math.max(50, prev - 15))}
              className="bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 p-2 rounded-lg font-black transition-all flex items-center gap-1 active:scale-90 text-[11px]"
              title="تصغير الجدول (Zoom Out)"
            >
              <ZoomOut size={15} />
              <span>زوم اوت (-)</span>
            </button>

            <button
              type="button"
              onClick={() => setTableZoom(80)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                tableZoom === 80
                  ? 'bg-[#2A2723] text-white border-[#2A2723]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
              }`}
              title="عرض مصغر 80% للموبايل"
            >
              80% (موبايل)
            </button>

            <button
              type="button"
              onClick={() => setTableZoom(100)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                tableZoom === 100
                  ? 'bg-[#2A2723] text-white border-[#2A2723]'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
              }`}
              title="عرض طبيعي 100%"
            >
              100%
            </button>

            <button
              type="button"
              onClick={() => setTableZoom((prev) => Math.min(160, prev + 15))}
              className="bg-white hover:bg-emerald-50 text-emerald-600 border border-gray-200 p-2 rounded-lg font-black transition-all flex items-center gap-1 active:scale-90 text-[11px]"
              title="تكبير الجدول (Zoom In)"
            >
              <ZoomIn size={15} />
              <span>زوم ان (+)</span>
            </button>
          </div>

          <span className="text-xs font-black text-[#5C554B] px-1">
            النسبة: <span className="text-[#C1A68D] font-black">{tableZoom}%</span>
          </span>
        </div>
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
        <div
          className="space-y-10 transition-all duration-300 ease-out origin-top-right"
          style={{
            fontSize: `${tableZoom}%`,
            zoom: tableZoom / 100,
            transform: `scale(${tableZoom / 100})`,
            transformOrigin: 'right top',
            width: tableZoom < 100 ? `${(100 / tableZoom) * 100}%` : '100%',
          }}
        >
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
                        {!isReadOnly && (
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
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isReadOnly && (
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
                  )}
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
                        {!isReadOnly && <th className="p-2 md:p-3.5 text-center w-12 md:w-16 border-b border-white/10 text-[10px] md:text-xs">حذف</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE4D9] bg-white font-bold text-[#2A2723]">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={isReadOnly ? 8 : 9} className="p-8 text-center text-gray-400 font-bold">
                            {isReadOnly ? 'لا يوجد بنود مسجلة في هذا الجدول.' : 'لا يوجد بنود مسجلة في هذا الجدول حتى الآن. انقر على "+ إضافة بند صف جديد".'}
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
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'name', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs`}
                                placeholder="اسم البند..."
                              />
                            </td>

                            {/* Total Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.totalCount}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'totalCount', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-amber-700`}
                                placeholder="0"
                              />
                            </td>

                            {/* Units Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.unitCount}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'unitCount', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-emerald-700`}
                                placeholder="0"
                              />
                            </td>

                            {/* Distribution Style */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.distributionStyle}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'distributionStyle', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs`}
                                placeholder="توزيع..."
                              />
                            </td>

                            {/* Reserve Count */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.reserveCount}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'reserveCount', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1 py-1 md:px-2 md:py-2 rounded-lg md:rounded-xl outline-none font-black text-center text-[10px] md:text-xs text-blue-700`}
                                placeholder="0"
                              />
                            </td>

                            {/* Reserve Location */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.reserveLocation}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'reserveLocation', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs`}
                                placeholder="المخزن..."
                              />
                            </td>

                            {/* Notes */}
                            <td className="p-1 md:p-2">
                              <input
                                type="text"
                                value={item.notes}
                                readOnly={isReadOnly}
                                onChange={(e) => handleUpdateItem(table.id, item.id, 'notes', e.target.value)}
                                className={`w-full ${isReadOnly ? 'bg-transparent border-transparent select-none cursor-default' : 'bg-[#FDFBF7] focus:bg-white border border-transparent focus:border-[#C1A68D]'} px-1.5 py-1 md:px-2.5 md:py-2 rounded-lg md:rounded-xl outline-none font-bold text-[10px] md:text-xs text-gray-600`}
                                placeholder="ملاحظات..."
                              />
                            </td>

                            {/* Delete Row Action */}
                            {!isReadOnly && (
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
                            )}
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
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleAddItem(table.id)}
                      className="text-xs font-black text-[#C1A68D] hover:underline flex items-center gap-1"
                    >
                      + إضافة سطر بند جديد لهذا الجدول
                    </button>
                  )}
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
