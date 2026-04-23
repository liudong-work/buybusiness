'use client';

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import {
  isBrandCompared,
  subscribeCompareUpdates,
  toggleBrandCompare,
} from '@/lib/compare';

interface CompareBrandButtonProps {
  brandId: string;
}

export function CompareBrandButton({ brandId }: CompareBrandButtonProps) {
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const syncCompared = () => setIsCompared(isBrandCompared(brandId));
    syncCompared();
    return subscribeCompareUpdates(syncCompared);
  }, [brandId]);

  const handleToggle = () => {
    toggleBrandCompare(brandId);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3.5 font-semibold transition-all duration-300 ${
        isCompared
          ? 'bg-white text-orange-700 shadow-[0_12px_28px_rgba(255,255,255,0.14)]'
          : 'border border-white/24 bg-white/10 text-white hover:bg-white/16'
      }`}
    >
      <Scale className="mr-2 h-4 w-4" />
      {isCompared ? '已加入对比' : '加入对比'}
    </button>
  );
}
