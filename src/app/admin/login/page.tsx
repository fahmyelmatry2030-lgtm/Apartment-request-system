"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyAdminAuth } from '@/lib/actions/db';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await verifyAdminAuth(username, password);

    if (res.success) {
      sessionStorage.setItem('isAdmin', 'true');
      sessionStorage.setItem('adminInfo', JSON.stringify(res.admin));
      router.push('/admin/dashboard');
    } else {
      setError('بيانات الدخول غير صحيحة');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#FDFBF7] relative overflow-hidden font-sans">
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#EAE4D9]/40 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C1A68D]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="bg-white p-10 md:p-14 rounded-[50px] border border-[#EAE4D9] shadow-2xl w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-black text-[#2A2723] block mb-4 tracking-tighter">مزار</Link>
          <div className="w-12 h-1 bg-[#C1A68D] mx-auto rounded-full mb-6 opacity-30" />
          <h2 className="text-sm font-black text-[#7A7061] uppercase tracking-[0.2em]">تسجيل دخول الإدارة</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-1">اسم المستخدم</label>
              <input 
                required
                type="text" 
                placeholder="admin"
                className="w-full bg-[#FDFBF7] border-2 border-transparent focus:border-[#C1A68D] rounded-2xl px-6 py-4 outline-none transition-all text-center text-[#2A2723] font-bold"
                value={username}
                onChange={e => setUsername(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#C1A68D] uppercase tracking-widest px-1">كلمة المرور</label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#FDFBF7] border-2 border-transparent focus:border-[#C1A68D] rounded-2xl px-6 py-4 outline-none transition-all text-center tracking-widest text-[#2A2723] font-bold"
                value={password}
                onChange={e => setPassword(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-[#E63946] text-[10px] font-bold p-4 rounded-xl text-center">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#2A2723] text-white font-black py-5 rounded-[24px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-95 text-sm"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'دخول للوحة التحكم'
            )}
          </button>
        </form>

        <div className="mt-12 text-center text-[9px] text-[#7A7061] font-black uppercase tracking-[0.3em] opacity-30">
          MAZAR DIGITAL HUB • V2.0
        </div>
      </div>
    </main>
  );
}
