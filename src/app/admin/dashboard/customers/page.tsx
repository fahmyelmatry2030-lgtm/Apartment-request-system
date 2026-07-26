"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getFreshDbBookings, deleteDbBookingsByPhone } from '@/lib/actions/db';
import { formatWhatsAppNumber } from '@/lib/utils';
import {
  X, Search, Download, Phone, MessageSquare, Trash2,
  Star, Calendar, Home, TrendingUp, Clock, FileText,
  ChevronRight, Award, Users, Repeat, Sparkles, Shield,
  User, Hash, BookOpen
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomerRecord {
  name: string;
  phone: string;
  count: number;
  totalRevenue: number;
  totalNights: number;
  firstSeen: string;
  lastSeen: string;
  units: string[];
  hasDiscount: boolean;
  bookings: any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DISCOUNT_KW = ['خصم', 'discount', 'تخفيض', 'وفر', 'بونص', 'free', 'هدية'];

function getBadge(c: CustomerRecord) {
  if (c.count >= 3) return { label: 'VIP', icon: '🏆', color: 'bg-amber-100 text-amber-700 border-amber-300' };
  if (c.count >= 2) return { label: 'متكرر', icon: '🔄', color: 'bg-blue-100 text-blue-700 border-blue-300' };
  return { label: 'جديد', icon: '✨', color: 'bg-green-100 text-green-700 border-green-300' };
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-rose-100 text-rose-600',
    'bg-violet-100 text-violet-600',
    'bg-sky-100 text-sky-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-teal-100 text-teal-600',
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

function fmt(date: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtMoney(n: number) {
  return n.toLocaleString('ar-EG') + ' ج';
}

function statusColor(status: string) {
  if (status === 'approved' || status === 'confirmed') return 'bg-green-100 text-green-700';
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
  if (status === 'cancelled' || status === 'rejected') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

function statusLabel(status: string) {
  if (status === 'approved' || status === 'confirmed') return 'مؤكد';
  if (status === 'pending' || status === 'رد جديد') return 'معلق';
  if (status === 'cancelled') return 'ملغي';
  if (status === 'rejected') return 'مرفوض';
  return status || '—';
}

// ─── Customer Drawer ──────────────────────────────────────────────────────────
function CustomerDrawer({
  customer,
  onClose,
  onDelete,
  isDeleting
}: {
  customer: CustomerRecord | null;
  onClose: () => void;
  onDelete: (phone: string, name: string) => void;
  isDeleting: boolean;
}) {
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'info'>('history');

  useEffect(() => {
    if (customer?.phone) {
      const saved = localStorage.getItem(`customer_note_${customer.phone}`) || '';
      setNote(saved);
    }
    setEditingNote(false);
    setActiveTab('history');
  }, [customer?.phone]);

  const saveNote = () => {
    if (customer?.phone) {
      localStorage.setItem(`customer_note_${customer.phone}`, note);
    }
    setEditingNote(false);
  };

  if (!customer) return null;

  const badge = getBadge(customer);
  const avatarColor = getAvatarColor(customer.name);
  const cleanPhone = formatWhatsAppNumber(customer.phone);
  const avgAmount = customer.count > 0 ? Math.round(customer.totalRevenue / customer.count) : 0;

  // Most booked unit
  const unitFreq: Record<string, number> = {};
  customer.bookings.forEach(b => { if (b.studio) unitFreq[b.studio] = (unitFreq[b.studio] || 0) + 1; });
  const favoriteUnit = Object.entries(unitFreq).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-2xl bg-[#FDFBF7] z-50 shadow-2xl overflow-y-auto flex flex-col"
        dir="rtl"
        style={{ animation: 'slideInLeft 0.3s ease-out' }}
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#EAE4D9]/60 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center text-2xl font-black flex-shrink-0`}>
              {customer.name?.substring(0, 1) || '?'}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#2A2723] leading-tight">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.icon} {badge.label}
                </span>
                {customer.hasDiscount && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-300">
                    💎 خصم سابق
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F0EDE6] hover:bg-[#E5DDD1] flex items-center justify-center transition-all"
          >
            <X size={18} className="text-[#2A2723]" />
          </button>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-8 py-6 bg-[#FDFBF7] border-b border-[#EAE4D9]/40">
          {[
            { label: 'إجمالي الإيراد', value: fmtMoney(customer.totalRevenue), icon: '💰', color: 'text-emerald-600' },
            { label: 'عدد الحجوزات', value: `${customer.count} ${customer.count > 1 ? 'مرات' : 'مرة'}`, icon: '📅', color: 'text-blue-600' },
            { label: 'إجمالي الليالي', value: `${customer.totalNights} ليلة`, icon: '🌙', color: 'text-violet-600' },
            { label: 'متوسط الحجز', value: fmtMoney(avgAmount), icon: '📊', color: 'text-amber-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-[#EAE4D9]/50 shadow-sm text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-sm font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-[#7A7061] font-bold mt-0.5 opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Contact & Info ── */}
        <div className="px-8 py-5 border-b border-[#EAE4D9]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EAE4D9]/50 flex items-center justify-center">
                <Phone size={15} className="text-[#7A7061]" />
              </div>
              <span className="font-bold text-[#2A2723] tracking-wider" dir="ltr">{customer.phone}</span>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${customer.phone}`}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl text-xs font-black transition-all border border-blue-200"
              >
                📞 اتصال
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl text-xs font-black transition-all border border-[#25D366]/20"
              >
                💬 واتساب
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#EAE4D9]/50">
              <Calendar size={13} className="text-[#C1A68D]" />
              <div>
                <div className="font-black text-[#2A2723]">{fmt(customer.firstSeen)}</div>
                <div className="text-[#7A7061] opacity-70">أول حجز</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-[#EAE4D9]/50">
              <Clock size={13} className="text-[#C1A68D]" />
              <div>
                <div className="font-black text-[#2A2723]">{fmt(customer.lastSeen)}</div>
                <div className="text-[#7A7061] opacity-70">آخر زيارة</div>
              </div>
            </div>
          </div>

          {favoriteUnit && (
            <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3 border border-amber-200">
              <Home size={14} className="text-amber-600" />
              <div className="text-xs">
                <span className="font-black text-amber-700">الوحدة المفضلة: </span>
                <span className="font-bold text-[#2A2723]">{favoriteUnit}</span>
                <span className="text-amber-600 font-bold"> ({unitFreq[favoriteUnit]} مرات)</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#EAE4D9]/40 px-8">
          {[
            { key: 'history', label: 'سجل الحجوزات', icon: BookOpen },
            { key: 'info', label: 'ملاحظات', icon: FileText },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-black border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? 'border-[#C1A68D] text-[#C1A68D]'
                  : 'border-transparent text-[#7A7061] opacity-60 hover:opacity-100'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="flex-1 px-8 py-6">
          {activeTab === 'history' && (
            <div className="space-y-3">
              {customer.bookings.length === 0 ? (
                <p className="text-center text-[#7A7061] opacity-50 font-bold py-12">لا توجد حجوزات مسجلة</p>
              ) : (
                customer.bookings.map((b: any, i: number) => (
                  <div key={b.id || i} className="bg-white rounded-2xl border border-[#EAE4D9]/50 p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-[#2A2723] text-sm">{b.studio || 'وحدة غير محددة'}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>
                            {statusLabel(b.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-[#7A7061] font-bold">
                          <span>📅 {fmt(b.checkIn)} → {fmt(b.checkOut)}</span>
                          {b.numberOfDays && <span>🌙 {b.numberOfDays} ليلة</span>}
                          {b.guestsCount && <span>👥 {b.guestsCount} أشخاص</span>}
                        </div>
                        {b.notes && (
                          <p className="text-[10px] text-[#7A7061] bg-[#FDFBF7] rounded-lg px-3 py-2 border border-[#EAE4D9]/40 leading-relaxed">
                            📝 {b.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-[#2A2723] text-sm">{fmtMoney(b.totalAmount || 0)}</div>
                        {b.paidAmount && b.paidAmount !== b.totalAmount && (
                          <div className="text-[9px] text-[#7A7061] opacity-70">مدفوع: {fmtMoney(b.paidAmount)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#EAE4D9]/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-[#2A2723] text-sm flex items-center gap-2">
                    <FileText size={14} className="text-[#C1A68D]" />
                    ملاحظات خاصة بالعميل
                  </h3>
                  {!editingNote && (
                    <button
                      onClick={() => setEditingNote(true)}
                      className="text-[10px] font-black text-[#C1A68D] hover:text-[#2A2723] transition-colors border border-[#C1A68D]/30 px-3 py-1 rounded-lg hover:bg-[#C1A68D]/10"
                    >
                      ✏️ تعديل
                    </button>
                  )}
                </div>

                {editingNote ? (
                  <div className="space-y-3">
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={5}
                      placeholder="اكتب ملاحظاتك عن هذا العميل هنا... مثلاً: عميل محترم، يفضل الغرف الهادئة، سبق وحصل على خصم..."
                      className="w-full border border-[#EAE4D9] rounded-xl p-3 text-sm font-bold text-[#2A2723] focus:border-[#C1A68D] outline-none resize-none leading-relaxed"
                      dir="rtl"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveNote}
                        className="bg-[#2A2723] text-white font-black px-5 py-2 rounded-xl text-xs hover:bg-black transition-all"
                      >
                        ✅ حفظ
                      </button>
                      <button
                        onClick={() => setEditingNote(false)}
                        className="bg-[#F0EDE6] text-[#7A7061] font-black px-5 py-2 rounded-xl text-xs hover:bg-[#E5DDD1] transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm leading-relaxed ${note ? 'text-[#2A2723] font-bold' : 'text-[#7A7061] opacity-50 font-bold'}`}>
                    {note || 'لا توجد ملاحظات مضافة بعد. اضغط "تعديل" لإضافة ملاحظة.'}
                  </p>
                )}
              </div>

              {/* All Units */}
              {customer.units.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#EAE4D9]/50 p-5 shadow-sm">
                  <h3 className="font-black text-[#2A2723] text-sm flex items-center gap-2 mb-3">
                    <Home size={14} className="text-[#C1A68D]" />
                    الوحدات التي أقام بها
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.units.map((u, i) => (
                      <span key={i} className="bg-[#FDFBF7] border border-[#EAE4D9]/60 text-[#2A2723] font-black text-[10px] px-3 py-1.5 rounded-xl">
                        🏠 {u} {unitFreq[u] > 1 && <span className="text-[#C1A68D]">×{unitFreq[u]}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer: Delete ── */}
        <div className="sticky bottom-0 bg-white border-t border-[#EAE4D9]/40 px-8 py-4">
          <button
            onClick={() => onDelete(customer.phone, customer.name)}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white border border-red-200 font-black py-3 rounded-2xl text-sm transition-all disabled:opacity-30"
          >
            <Trash2 size={15} />
            {isDeleting ? 'جاري الحذف...' : 'حذف هذا العميل نهائياً'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CustomersDatabase() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [adminRole, setAdminRole] = useState<string>('Admin');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vip' | 'repeat' | 'new' | 'discount'>('all');

  useEffect(() => {
    const info = sessionStorage.getItem('adminInfo');
    if (info) setAdminRole(JSON.parse(info)?.role || 'Admin');
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    let data = await getFreshDbBookings(Date.now().toString());
    const currentRole = typeof window !== 'undefined'
      ? (JSON.parse(sessionStorage.getItem('adminInfo') || '{}')?.role || adminRole)
      : adminRole;
    if (currentRole === 'Akoura' || currentRole === 'Partner') {
      data = data.filter((b: any) => String(b.apartmentId).startsWith('p-s') || !b.apartmentId);
    }
    setBookings(data);
    setIsLoading(false);
  }, [adminRole]);

  useEffect(() => { loadData(); }, [loadData]);

  const customers = useMemo<CustomerRecord[]>(() => {
    const map = new Map<string, CustomerRecord>();
    bookings.forEach(b => {
      const phone = b.phone?.trim();
      if (!phone) return;
      const hasDiscount = b.notes && DISCOUNT_KW.some(kw => String(b.notes).toLowerCase().includes(kw));
      const existing = map.get(phone);
      if (existing) {
        existing.count += 1;
        existing.totalRevenue += Number(b.totalAmount) || 0;
        existing.totalNights += Number(b.numberOfDays) || 0;
        if (hasDiscount) existing.hasDiscount = true;
        const t = new Date(b.timestamp || b.checkIn || 0).getTime();
        if (t > new Date(existing.lastSeen).getTime()) { existing.lastSeen = b.timestamp || b.checkIn; existing.name = b.name; }
        if (t < new Date(existing.firstSeen).getTime()) existing.firstSeen = b.timestamp || b.checkIn;
        if (b.studio && !existing.units.includes(b.studio)) existing.units.push(b.studio);
        existing.bookings.push(b);
      } else {
        map.set(phone, {
          name: b.name,
          phone,
          count: 1,
          totalRevenue: Number(b.totalAmount) || 0,
          totalNights: Number(b.numberOfDays) || 0,
          firstSeen: b.timestamp || b.checkIn || '',
          lastSeen: b.timestamp || b.checkIn || '',
          hasDiscount: !!hasDiscount,
          units: b.studio ? [b.studio] : [],
          bookings: [b],
        });
      }
    });
    return Array.from(map.values())
      .map(c => ({ ...c, bookings: c.bookings.sort((a, b) => new Date(b.checkIn || 0).getTime() - new Date(a.checkIn || 0).getTime()) }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

  // Summary counts
  const counts = useMemo(() => ({
    all: customers.length,
    vip: customers.filter(c => c.count >= 3).length,
    repeat: customers.filter(c => c.count === 2).length,
    new: customers.filter(c => c.count === 1).length,
    discount: customers.filter(c => c.hasDiscount).length,
  }), [customers]);

  const filtered = useMemo(() => {
    let list = customers;
    if (activeFilter === 'vip') list = list.filter(c => c.count >= 3);
    else if (activeFilter === 'repeat') list = list.filter(c => c.count === 2);
    else if (activeFilter === 'new') list = list.filter(c => c.count === 1);
    else if (activeFilter === 'discount') list = list.filter(c => c.hasDiscount);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(c => c.name?.toLowerCase().includes(s) || c.phone?.includes(searchTerm));
    }
    return list;
  }, [customers, activeFilter, searchTerm]);

  const handleDelete = async (phone: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟ سيتم حذف كافة سجلات حجوزاته نهائياً.`)) return;
    setIsDeleting(true);
    try {
      const { deleteDbBookingsByPhone } = await import('@/lib/actions/db');
      await deleteDbBookingsByPhone(phone);
      setSelectedCustomer(null);
      await loadData();
    } catch {
      alert('فشل الحذف. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['الاسم', 'الهاتف', 'عدد الحجوزات', 'إجمالي الإيراد', 'إجمالي الليالي', 'أول حجز', 'آخر زيارة', 'خصم سابق'];
    const rows = filtered.map(c => [
      c.name, c.phone, c.count, c.totalRevenue, c.totalNights,
      fmt(c.firstSeen), fmt(c.lastSeen), c.hasDiscount ? 'نعم' : 'لا'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Mazar_Customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.visibility = 'hidden'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const FILTERS = [
    { key: 'all', label: 'الكل', icon: Users, count: counts.all },
    { key: 'vip', label: 'VIP', icon: Award, count: counts.vip },
    { key: 'repeat', label: 'متكرر', icon: Repeat, count: counts.repeat },
    { key: 'new', label: 'جديد', icon: Sparkles, count: counts.new },
    { key: 'discount', label: 'خصم سابق', icon: Shield, count: counts.discount },
  ];

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* ── Header ── */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 text-[#2A2723]">
            قاعدة <span className="text-[#C1A68D]">العملاء</span>
          </h1>
          <p className="text-[#7A7061] font-bold opacity-70 text-sm">
            {isLoading ? 'جاري التحميل...' : `${counts.all} عميل • ${bookings.length} حجز إجمالي`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#EAE4D9]/50 rounded-2xl px-6 py-4 text-sm font-bold shadow-sm focus:border-[#C1A68D] transition-all outline-none"
            />
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A7061] opacity-30" />
          </div>
          <button
            onClick={exportToCSV}
            className="bg-[#2A2723] text-white font-black px-8 py-4 rounded-2xl hover:bg-black transition-all text-sm shadow-xl shadow-black/10 flex items-center justify-center gap-3"
          >
            <Download size={15} /> تصدير CSV
          </button>
        </div>
      </header>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all border ${
              activeFilter === f.key
                ? 'bg-[#2A2723] text-white border-[#2A2723] shadow-lg'
                : 'bg-white text-[#7A7061] border-[#EAE4D9]/50 hover:border-[#C1A68D] hover:text-[#2A2723]'
            }`}
          >
            <f.icon size={13} />
            {f.label}
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
              activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-[#F0EDE6] text-[#7A7061]'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Customer Cards Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-[#EAE4D9]/50 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAE4D9]/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#EAE4D9]/50 rounded-full w-3/4" />
                  <div className="h-3 bg-[#EAE4D9]/30 rounded-full w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#EAE4D9]/30 rounded-full" />
                <div className="h-3 bg-[#EAE4D9]/20 rounded-full w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-[#7A7061] opacity-40">
          <User size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-black text-lg">لا يوجد عملاء يطابقون البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => {
            const badge = getBadge(c);
            const avatarColor = getAvatarColor(c.name);
            return (
              <button
                key={c.phone}
                onClick={() => setSelectedCustomer(c)}
                className="bg-white rounded-3xl p-6 border border-[#EAE4D9]/50 shadow-sm hover:shadow-xl hover:border-[#C1A68D]/40 transition-all text-right group"
              >
                {/* Card Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${avatarColor} flex items-center justify-center text-xl font-black flex-shrink-0`}>
                    {c.name?.substring(0, 1) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[#2A2723] text-sm leading-tight truncate">{c.name || 'عميل'}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                      {c.hasDiscount && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-300">
                          💎 خصم
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#C1A68D] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#FDFBF7] rounded-xl p-2.5 text-center border border-[#EAE4D9]/30">
                    <div className="text-sm font-black text-[#2A2723]">{c.count}</div>
                    <div className="text-[8px] text-[#7A7061] opacity-70 font-bold">حجوزات</div>
                  </div>
                  <div className="bg-[#FDFBF7] rounded-xl p-2.5 text-center border border-[#EAE4D9]/30">
                    <div className="text-sm font-black text-[#2A2723]">{c.totalNights}</div>
                    <div className="text-[8px] text-[#7A7061] opacity-70 font-bold">ليلة</div>
                  </div>
                  <div className="bg-[#FDFBF7] rounded-xl p-2.5 text-center border border-[#EAE4D9]/30">
                    <div className="text-[10px] font-black text-emerald-600">{(c.totalRevenue / 1000).toFixed(1)}k</div>
                    <div className="text-[8px] text-[#7A7061] opacity-70 font-bold">إيراد</div>
                  </div>
                </div>

                {/* Phone & Last Seen */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-[#7A7061] font-bold" dir="ltr">
                    <Phone size={10} className="flex-shrink-0" />
                    <span className="truncate">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#7A7061] font-bold">
                    <Clock size={10} className="flex-shrink-0" />
                    <span>آخر زيارة: {fmt(c.lastSeen)}</span>
                  </div>
                  {c.units.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-[#7A7061] font-bold">
                      <Home size={10} className="flex-shrink-0" />
                      <span className="truncate">{c.units.slice(0, 2).join('، ')}{c.units.length > 2 ? ` +${c.units.length - 2}` : ''}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Customer Drawer ── */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
