"use client";

import { useState } from 'react';
import { Lock, KeyRound, ShieldAlert } from 'lucide-react';

interface FinancialLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

export default function FinancialLockModal({ isOpen, onUnlock }: FinancialLockModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept standard management passcodes (mazar2026, 1234, akoura2026, or admin)
    const validPasscodes = ['1234', 'mazar2026', 'akoura2026', 'admin'];
    
    if (validPasscodes.includes(password.trim().toLowerCase())) {
      sessionStorage.setItem('financialUnlocked', 'true');
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      <div className="bg-[#1F1C18] border border-[#C1A68D]/40 rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative text-center">
        {/* Glow Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-[#C1A68D] rounded-full shadow-[0_0_20px_#C1A68D]" />

        <div className="w-16 h-16 bg-[#C1A68D]/10 border border-[#C1A68D]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#C1A68D]">
          <Lock size={32} className="animate-pulse" />
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">محمي بكلمة السر 🔒</h3>
        <p className="text-xs font-bold text-gray-400 mb-8 leading-relaxed">
          كشف الحساب الشهري والتقرير المالي الشامل محمي. يرجى إدخال كلمة مرور الإدارة لعرض البيانات المالية.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <input
              autoFocus
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={`w-full bg-[#2A2723] border-2 rounded-2xl px-5 py-4 text-center text-white font-black tracking-widest outline-none transition-all placeholder:text-gray-600 ${
                error ? 'border-red-500/80 ring-2 ring-red-500/20' : 'border-[#C1A68D]/40 focus:border-[#C1A68D]'
              }`}
            />
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-black bg-rose-500/10 py-2 rounded-xl border border-rose-500/20 animate-shake">
              <ShieldAlert size={14} />
              <span>كلمة المرور غير صحيحة! يرجى المحاولة مرة أخرى</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#C1A68D] to-[#9E8268] text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-98 text-sm"
          >
            فتح التقرير المالي 🔓
          </button>
        </form>

        <p className="text-[10px] text-gray-500 font-bold mt-6 opacity-60">
          نظام المزار الإلكتروني — حماية البيانات المالية v2.0
        </p>
      </div>
    </div>
  );
}
