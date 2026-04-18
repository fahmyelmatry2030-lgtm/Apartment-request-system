"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getBookings } from '@/lib/data-init';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadData = useCallback(async () => {
    const bookings = await getBookings();
    
    // Notifications logic (Daily Reminders)
    let notifs: any[] = [];
    
    if (typeof window !== 'undefined') {
      try {
        notifs = JSON.parse(localStorage.getItem('admin_notifs') || '[]');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const lastCheck = localStorage.getItem('last_notif_check');
        if (lastCheck !== tomorrowStr) {
          const checkIns = bookings.filter((b: any) => b.status === 'approved' && b.checkIn === tomorrowStr);
          const checkOuts = bookings.filter((b: any) => b.status === 'approved' && b.checkOut === tomorrowStr);
          
          if (checkIns.length > 0) {
            notifs.unshift({ id: Date.now(), msg: `🔔 تنبيه: غداً يوجد ${checkIns.length} عملية وصول (Check-in).`, read: false });
          }
          if (checkOuts.length > 0) {
            notifs.unshift({ id: Date.now() + 1, msg: `🔔 تنبيه: غداً يوجد ${checkOuts.length} عملية مغادرة (Check-out).`, read: false });
          }
          localStorage.setItem('admin_notifs', JSON.stringify(notifs.slice(0, 50)));
          localStorage.setItem('last_notif_check', tomorrowStr);
        }
      } catch (e) {
        console.warn('Failed to handle administrative notifications');
      }
    }

    const pendingCount = bookings.filter((b: any) => b.status === 'رد جديد' || b.status === 'pending').length;
    setUnreadNotifs(pendingCount + notifs.filter((n: any) => !n.read).length);
    setNotifications(notifs);

    // Sent Messages Log
    const sent = bookings
      .filter((b: any) => b.paymentInfo)
      .map((b: any) => ({
        id: b.id,
        name: b.name,
        msg: b.paymentInfo,
        time: b.timestamp ? new Date(b.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '---'
      }));
    setSentMessages(sent);
  }, []);

  const [adminRole, setAdminRole] = useState('Super Admin');
  const [adminName, setAdminName] = useState('مدير النظام');

  useEffect(() => {
    const auth = sessionStorage.getItem('isAdmin');
    const info = JSON.parse(sessionStorage.getItem('adminInfo') || '{}');
    if (info?.role) setAdminRole(info.role);
    if (info?.name) setAdminName(info.name);

    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (auth) {
      // Role Guard Logic
      const isBookingsAdmin = info?.role === 'مدير الحجوزات';
      const isUnitsAdmin = info?.role === 'مدير الوحدات';
      
      const restrictedForBookings = ['/admin/dashboard/units', '/admin/dashboard/reports', '/admin/dashboard/admins'];
      const restrictedForUnits = ['/admin/dashboard/bookings', '/admin/dashboard/reports', '/admin/dashboard/admins'];
      
      if (isBookingsAdmin && restrictedForBookings.includes(pathname)) {
         router.push('/admin/dashboard/bookings');
         return;
      }
      
      if (isUnitsAdmin && restrictedForUnits.includes(pathname)) {
         router.push('/admin/dashboard/units');
         return;
      }

      setIsAuthorized(true);
      loadData();
      
      // REAL-TIME NOTIFICATIONS
      const supabase = require('@/lib/supabase/client').getSupabaseBrowserClient();
      let channel: any;

      if (supabase) {
        channel = supabase
          .channel('realtime_bookings')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'bookings' },
            (payload: any) => {
              console.log('New booking received!', payload);
              loadData(); // Refresh all stats
              
              // Play sound or show browser notification if possible
              try {
                const audio = new Audio('/notification-sound.mp3');
                audio.play().catch(() => {});
              } catch (e) {}
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'bookings' },
            (payload: any) => {
              console.log('Booking updated!', payload);
              loadData();
            }
          )
          .subscribe();
      } else {
        // Fallback to polling if Supabase is offline
        const interval = setInterval(loadData, 30000); 
        return () => clearInterval(interval);
      }

      return () => {
        if (channel) channel.unsubscribe();
      };
    }
  }, [pathname, router, loadData]);

  if (!isAuthorized && pathname !== '/admin/login') return null;
  if (pathname === '/admin/login') return <>{children}</>;

  const menuItems = [
    { name: 'الاستعراض العام', href: '/admin/dashboard', icon: '📊', roles: ['Super Admin', 'مدير الحجوزات', 'مدير الوحدات'] },
    { name: 'مركز العمليات', href: '/admin/dashboard/operations', icon: '📋', roles: ['Super Admin', 'مدير الحجوزات', 'مدير الوحدات'] },
    { name: 'طلبات الحجز', href: '/admin/dashboard/bookings', icon: '📩', roles: ['Super Admin', 'مدير الحجوزات'] },
    { name: 'إدارة الوحدات', href: '/admin/dashboard/units', icon: '🏢', roles: ['Super Admin', 'مدير الوحدات'] },
    { name: 'قاعدة العملاء', href: '/admin/dashboard/customers', icon: '📞', roles: ['Super Admin'] },
    { name: 'مرتبات الموظفين', href: '/admin/dashboard/hr/salaries', icon: '💸', roles: ['Super Admin'] },
    { name: 'إجازات الموظفين', href: '/admin/dashboard/hr/vacations', icon: '🌴', roles: ['Super Admin'] },
    { name: 'إدارة المحتوى', href: '/admin/dashboard/content', icon: '📝', roles: ['Super Admin'] },
    { name: 'التقارير المالي', href: '/admin/dashboard/reports', icon: '💰', roles: ['Super Admin'] },
    { name: 'فريق الإدارة', href: '/admin/dashboard/admins', icon: '👥', roles: ['Super Admin'] },
  ].filter(item => item.roles.includes(adminRole as string));


  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col md:flex-row custom-scrollbar" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-l border-[#EAE4D9]/50 flex flex-col z-40 shadow-sm">
        <div className="p-8">
          <Link href="/" className="text-2xl font-black text-[#2A2723] block mb-1 tracking-tighter">مزار</Link>
          <span className="text-[10px] text-[#C1A68D] font-black uppercase tracking-wider">نظام الإدارة المتكامل</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${
                  isActive 
                  ? 'bg-[#2A2723] text-white shadow-xl shadow-black/10' 
                  : 'text-[#7A7061] hover:text-[#2A2723] hover:bg-[#FDFBF7]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
                {item.name === 'طلبات الحجز' && unreadNotifs > 0 && (
                  <span className={`mr-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isActive ? 'bg-[#C1A68D] text-[#2A2723]' : 'bg-[#C1A68D] text-white'}`}>
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-[#EAE4D9]/50">
          <button 
            onClick={() => {
              sessionStorage.removeItem('isAdmin');
              router.push('/admin/login');
            }}
            className="flex items-center gap-4 text-[#7A7061] hover:text-[#E63946] transition-colors font-black text-sm w-full outline-none"
          >
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-[#EAE4D9]/50 flex items-center justify-end px-8 gap-6 z-30 sticky top-0">
          <div className="relative">
            <button 
              onClick={() => { setShowSent(!showSent); setShowNotifs(false); }}
              className={`p-3 rounded-xl transition-all relative ${showSent ? 'bg-[#2A2723] text-white' : 'bg-[#FDFBF7] text-[#7A7061] hover:text-[#2A2723] border border-[#EAE4D9]'}`}
              title="سجل الرسائل المرسلة"
            >
              <span className="text-xl">📧</span>
              {sentMessages.length > 0 && !showSent && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#C1A68D] border-2 border-white rounded-full" />
              )}
            </button>
            {showSent && (
              <div className="absolute top-14 left-0 w-80 bg-white border border-[#EAE4D9] rounded-2xl shadow-2xl p-5 max-h-[450px] overflow-y-auto animate-scale-in custom-scrollbar">
                <h4 className="text-xs font-black text-[#2A2723] uppercase mb-4 pb-2 border-b border-[#EAE4D9] tracking-widest">آخر الرسائل المرسلة</h4>
                <div className="space-y-4">
                  {sentMessages.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#FDFBF7] border border-[#EAE4D9]/50 space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black">
                         <span className="text-[#C1A68D]">{m.name}</span>
                         <span className="text-[#7A7061] font-bold">{m.time}</span>
                       </div>
                       <p className="text-[10px] text-[#2A2723] leading-relaxed font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">"{m.msg}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => { setShowNotifs(!showNotifs); setShowSent(false); }}
              className={`p-3 rounded-xl transition-all relative ${showNotifs ? 'bg-[#2A2723] text-white' : 'bg-[#FDFBF7] text-[#7A7061] hover:text-[#2A2723] border border-[#EAE4D9]'}`}
              title="التنبيهات"
            >
              <span className="text-xl">🔔</span>
              {unreadNotifs > 0 && !showNotifs && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#E63946] border-2 border-white rounded-full" />
              )}
            </button>
            {showNotifs && (
              <div className="absolute top-14 left-0 w-80 bg-white border border-[#EAE4D9] rounded-2xl shadow-2xl p-5 max-h-[450px] overflow-y-auto animate-scale-in custom-scrollbar">
                <h4 className="text-xs font-black text-[#2A2723] uppercase mb-4 pb-2 border-b border-[#EAE4D9] tracking-widest">التنبيهات الذكية</h4>
                <div className="space-y-3">
                  {notifications.map((n, i) => (
                    <div key={i} className="text-[10px] p-4 rounded-xl bg-[#FDFBF7] border border-[#EAE4D9]/50 leading-relaxed font-bold text-[#2A2723]">
                      {n.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 w-px bg-[#EAE4D9] mx-2" />
          <div className="relative">
             <button 
                 onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); setShowSent(false); }}
                 className="flex items-center gap-3 bg-[#FDFBF7] hover:bg-[#F5F2EA] px-4 py-2 rounded-2xl transition-all outline-none border border-[#EAE4D9]"
             >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-black text-[#2A2723]">{adminName}</div>
                  <div className="text-[10px] text-[#C1A68D] uppercase tracking-tighter font-black">{adminRole}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C1A68D] to-[#D5C5B3] flex items-center justify-center text-white font-black shadow-lg shadow-[#C1A68D]/20">
                   {adminName.substring(0, 1).toUpperCase()}
                </div>
             </button>

             {showProfile && (
               <div className="absolute top-16 left-0 w-56 bg-white border border-[#EAE4D9] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-4 border-b border-[#EAE4D9]/50 bg-[#FDFBF7] text-center sm:hidden">
                      <div className="text-xs font-black text-[#2A2723]">{adminName}</div>
                      <div className="text-[10px] text-[#C1A68D] uppercase font-black">{adminRole}</div>
                  </div>
                  {adminRole === 'Super Admin' && (
                    <Link 
                      href="/admin/dashboard/admins" 
                      onClick={() => setShowProfile(false)}
                      className="block px-5 py-3.5 text-xs font-bold text-[#2A2723] hover:bg-[#FDFBF7] hover:text-[#C1A68D] transition-colors text-right border-b border-[#EAE4D9]/50"
                    >
                      إدارة الصلاحيات (Admin Roles) ⚙️
                    </Link>
                  )}
                  <button 
                    onClick={() => {
                      sessionStorage.removeItem('isAdmin');
                      sessionStorage.removeItem('adminInfo');
                      router.push('/admin/login');
                    }}
                    className="w-full text-right px-5 py-3.5 text-xs font-bold text-[#E63946] hover:bg-[#FDFBF7] transition-colors outline-none"
                  >
                    تسجيل الخروج 🚪
                  </button>
               </div>
             )}
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
