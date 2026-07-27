"use client";

import { useState, useEffect } from 'react';
import { getBookings, getSystemUnits } from '@/lib/data-init';
import FinancialLockModal from '@/components/FinancialLockModal';
import FinancialSummaryTab from '../reports/FinancialSummaryTab';

export default function FinancePage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [b, unitsData] = await Promise.all([
        getBookings(),
        getSystemUnits(),
      ]);
      setBookings(b || []);
      setUnits(unitsData || []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <FinancialLockModal isOpen={true} onUnlock={() => setIsUnlocked(true)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-[#C1A68D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinancialSummaryTab
        bookings={bookings}
        units={units}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
      />
    </div>
  );
}
