'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import swal from '@/lib/swal';

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, removeItem, clearCart, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    if (!session) {
      router.push('/login?callbackUrl=/cart');
      return;
    }
    router.push('/checkout');
  };

  const handleRemoveItem = (id: string, title: string) => {
    removeItem(id);
    swal.success(`ลบ "${title}" ออกจากตะกร้าแล้ว`);
  };

  const handleClearCart = async () => {
    const confirmed = await swal.confirmDelete('สินค้าทั้งหมดในตะกร้า');
    if (confirmed) {
      clearCart();
      swal.success('ล้างตะกร้าแล้ว');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBagIcon className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <h1 className="text-2xl font-bold mb-2">ตะกร้าของคุณว่างเปล่า</h1>
          <p className="text-gray-400 mb-6">ลองเลือกซื้อเพลงที่คุณชอบกันเถอะ!</p>
          <Link href="/products">
            <Button>เลือกซื้อเพลง</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">ตะกร้าสินค้า</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl gradient-card border border-white/10"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.id}`} className="hover:text-primary-400">
                    <h3 className="font-semibold truncate">{item.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-400">{item.artist}</p>
                  <p className="text-green-400 font-semibold mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id, item.title)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-xl gradient-card border border-white/10">
              <h2 className="text-lg font-semibold mb-4">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>จำนวนสินค้า</span>
                  <span>{items.length} รายการ</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>รวมทั้งหมด</span>
                  <span className="text-green-400">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {session && session.user.creditBalance < totalPrice && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm">
                  เครดิตคงเหลือไม่เพียงพอ กรุณา
                  <Link href="/dashboard/wallet" className="underline ml-1">
                    เติมเงิน
                  </Link>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
              >
                ดำเนินการชำระเงิน
              </Button>

              <button
                onClick={handleClearCart}
                className="w-full mt-4 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                ล้างตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
