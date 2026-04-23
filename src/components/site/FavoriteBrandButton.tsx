'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import {
  isBrandFavorite,
  subscribeFavoriteUpdates,
  toggleBrandFavorite,
} from '@/lib/favorites';

interface FavoriteBrandButtonProps {
  brandId: string;
}

export function FavoriteBrandButton({ brandId }: FavoriteBrandButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const syncFavorite = () => setIsFavorite(isBrandFavorite(brandId));
    syncFavorite();
    return subscribeFavoriteUpdates(syncFavorite);
  }, [brandId]);

  const handleToggle = () => {
    toggleBrandFavorite(brandId);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3.5 font-semibold transition-all duration-300 ${
        isFavorite
          ? 'bg-white text-orange-700 shadow-[0_12px_28px_rgba(255,255,255,0.14)]'
          : 'border border-white/24 bg-white/10 text-white hover:bg-white/16'
      }`}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-orange-500 text-orange-500' : ''}`} />
      {isFavorite ? '已收藏品牌' : '收藏品牌'}
    </button>
  );
}
