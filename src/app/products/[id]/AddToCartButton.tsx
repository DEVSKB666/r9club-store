'use client';

import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    artist: string;
    price: number;
    coverImage: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, isInCart } = useCartStore();
  const inCart = isInCart(product.id);

  return (
    <Button
      onClick={() => addItem(product)}
      disabled={inCart}
      variant={inCart ? 'secondary' : 'primary'}
      size="lg"
      className="flex-1 md:flex-none"
    >
      {inCart ? (
        <>
          <CheckIcon className="w-5 h-5 mr-2" />
          อยู่ในตะกร้าแล้ว
        </>
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          หยิบใส่ตะกร้า
        </>
      )}
    </Button>
  );
}
