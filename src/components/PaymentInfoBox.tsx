'use client';

import React, { useState } from 'react';
import { PAYMENT_DETAILS } from '@/data/paymentInfo';

interface PaymentInfoBoxProps {
  isRTL?: boolean;
  compact?: boolean;
}

export default function PaymentInfoBox({ isRTL = true, compact = false }: PaymentInfoBoxProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Vodafone Cash */}
      <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#EAE4D9] shadow-sm hover:border-[#E63946]/40 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-black shadow-inner">
              📱
            </span>
            <div>
              <p className="text-[11px] font-black text-[#2A2723]">
                {isRTL ? 'فودافون كاش (Vodafone Cash)' : 'Vodafone Cash'}
              </p>
              <p className="text-[10px] font-bold text-[#7A7061]">
                {isRTL ? `الاسم: ${PAYMENT_DETAILS.vodafoneCash.accountName}` : `Name: ${PAYMENT_DETAILS.vodafoneCash.accountName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(PAYMENT_DETAILS.vodafoneCash.number, 'voda')}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border border-rose-200/60"
          >
            <span>{copiedKey === 'voda' ? (isRTL ? '✅ تم النسخ' : '✅ Copied') : PAYMENT_DETAILS.vodafoneCash.number}</span>
            <span className="text-[9px] opacity-70">📋</span>
          </button>
        </div>
      </div>

      {/* InstaPay */}
      <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#EAE4D9] shadow-sm hover:border-blue-300 transition-all group">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black shadow-inner">
              🔗
            </span>
            <div>
              <p className="text-[11px] font-black text-[#2A2723]">
                {isRTL ? 'إنستا باي (InstaPay)' : 'InstaPay'}
              </p>
              <p className="text-[10px] font-bold text-[#7A7061]">
                {isRTL ? `الاسم: ${PAYMENT_DETAILS.instapay.accountName}` : `Name: ${PAYMENT_DETAILS.instapay.accountName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(PAYMENT_DETAILS.instapay.number, 'insta')}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border border-blue-200/60"
          >
            <span>{copiedKey === 'insta' ? (isRTL ? '✅ تم النسخ' : '✅ Copied') : PAYMENT_DETAILS.instapay.number}</span>
            <span className="text-[9px] opacity-70">📋</span>
          </button>
        </div>
      </div>

      {/* Bank Transfer */}
      <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-[#EAE4D9] shadow-sm hover:border-amber-300 transition-all space-y-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-black shadow-inner">
            🏦
          </span>
          <div>
            <p className="text-[11px] font-black text-[#2A2723]">
              {isRTL ? PAYMENT_DETAILS.bank.bankName : PAYMENT_DETAILS.bank.bankNameEn}
            </p>
            <p className="text-[10px] font-bold text-[#7A7061]">
              {isRTL ? `اسم الحساب: ${PAYMENT_DETAILS.bank.accountName}` : `Account Name: ${PAYMENT_DETAILS.bank.accountNameEn}`}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t border-[#F0EBE1]">
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="font-bold text-[#7A7061]">{isRTL ? 'رقم الحساب:' : 'Account No:'}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(PAYMENT_DETAILS.bank.accountNumber, 'acc')}
              className="flex items-center gap-1 bg-[#FDFBF7] hover:bg-[#2A2723] hover:text-white text-[#2A2723] px-2.5 py-1 rounded-lg font-black transition-all border border-[#EAE4D9] text-[10px]"
            >
              <span>{copiedKey === 'acc' ? (isRTL ? '✅ تم النسخ' : '✅ Copied') : PAYMENT_DETAILS.bank.accountNumber}</span>
              <span className="text-[9px] opacity-70">📋</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="font-bold text-[#7A7061]">{isRTL ? 'IBAN الدولي:' : 'IBAN:'}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(PAYMENT_DETAILS.bank.iban, 'iban')}
              className="flex items-center gap-1 bg-[#FDFBF7] hover:bg-[#2A2723] hover:text-white text-[#2A2723] px-2.5 py-1 rounded-lg font-black transition-all border border-[#EAE4D9] text-[9px] break-all"
            >
              <span>{copiedKey === 'iban' ? (isRTL ? '✅ تم النسخ' : '✅ Copied') : PAYMENT_DETAILS.bank.iban}</span>
              <span className="text-[9px] opacity-70">📋</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
