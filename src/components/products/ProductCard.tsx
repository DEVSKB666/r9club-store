'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlayButton } from '@/components/player/PlayButton';
import { useCartStore } from '@/stores/useCartStore';
import { formatPrice, cn } from '@/lib/utils';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    artist: string;
    price: number;
    coverImage: string;
    sampleAudioUrl: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(product);
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="relative rounded-xl overflow-hidden gradient-card border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10">
        {/* Cover Image */}
        <div className="relative aspect-square">
          <Image
            src={product.coverImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <PlayButton track={product} size="lg" />
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-gray-400 truncate">{product.artist}</p>
          
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-lg text-green-400">
              {formatPrice(product.price)}
            </span>
            
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                inCart
                  ? 'bg-green-500/20 text-green-400 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              )}
            >
              {inCart ? (
                <CheckIcon className="w-5 h-5" />
              ) : (
                <ShoppingCartIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
