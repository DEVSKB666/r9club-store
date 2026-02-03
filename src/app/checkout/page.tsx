'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/useCartStore';
import { useInboxStore } from '@/stores/useInboxStore';
import { Button } from '@/components/ui/Button';
import { EmailVerifyModal } from '@/components/email/EmailVerifyModal';
import { formatPrice } from '@/lib/utils';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MusicalNoteIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import swal from '@/lib/swal';
import { playPurchase } from '@/lib/sounds';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const addNotification = useInboxStore((state) => state.addNotification);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  // Fetch latest credit balance from database
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (!session?.user?.id) {
        setCreditBalance(null);
        return;
      }
      
      try {
        const res = await fetch('/api/user/credit');
        if (res.ok) {
          const data = await res.json();
          setCreditBalance(data.creditBalance);
          
          if (data.creditBalance !== session.user.creditBalance) {
            await updateSession({ creditBalance: data.creditBalance });
          }
        }
      } catch (error) {
        console.error('Failed to fetch credit balance:', error);
        setCreditBalance(session.user.creditBalance);
      }
    };

    fetchCreditBalance();
  }, [session?.user?.id, session?.user?.creditBalance, updateSession]);

  const currentCredit = creditBalance ?? session?.user?.creditBalance ?? 0;
  const hasEnoughCredit = currentCredit >= totalPrice;

  const handleCheckout = async (email?: string) => {
    if (!session) {
      router.push('/login?callbackUrl=/checkout');
      return;
    }

    if (!hasEnoughCredit) {
      swal.error('เครดิตไม่เพียงพอ กรุณาเติมเงินก่อน');
      setError('เครดิตไม่เพียงพอ กรุณาเติมเงินก่อน');
      return;
    }

    if (items.length === 0) {
      swal.error('ไม่มีสินค้าในตะกร้า');
      setError('ไม่มีสินค้าในตะกร้า');
      return;
    }

    // Use passed email or already verified email
    const emailToUse = email || verifiedEmail;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            price: item.price,
          })),
          verifiedEmail: emailToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      await updateSession({
        creditBalance: session.user.creditBalance - totalPrice,
      });

      addNotification({
        type: 'purchase',
        title: 'ชำระเงินสำเร็จ! 🎉',
        message: `คุณซื้อ ${items.length} รายการ รวม ${formatPrice(totalPrice)} - พร้อมดาวน์โหลดแล้ว!`,
        link: '/dashboard/downloads',
      });

      clearCart();
      playPurchase(); // Victory fanfare!
      swal.success('ชำระเงินสำเร็จ!');
      setSuccess(true);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Success Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 border border-green-500/30 p-8 text-center">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-green-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircleIcon className="w-14 h-14 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold mb-3">ชำระเงินสำเร็จ! 🎉</h1>
              <p className="text-gray-400 mb-8 text-lg">
                เพลงที่ซื้อพร้อมดาวน์โหลดแล้วในหน้า Dashboard
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/downloads">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <MusicalNoteIcon className="w-5 h-5" />
                    ดาวน์โหลดเพลง
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    เลือกซื้อเพิ่ม
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
            <ShoppingBagIcon className="w-12 h-12 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold mb-3">ตะกร้าว่างเปล่า</h1>
          <p className="text-gray-400 mb-8">
            ยังไม่มีสินค้าในตะกร้า เลือกเพลงที่ชอบแล้วกลับมาชำระเงินกันเถอะ!
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <MusicalNoteIcon className="w-5 h-5" />
              เลือกซื้อเพลง
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">ชำระเงิน</h1>
          </div>
          <p className="text-gray-400 ml-[52px]">ตรวจสอบรายการและยืนยันการซื้อ</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Order Items */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 overflow-hidden backdrop-blur-lg">
              {/* Items Header */}
              <div className="px-5 md:px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-5 h-5 text-primary-400" />
                    <h2 className="font-semibold text-lg">รายการสินค้า</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
                    {items.length} รายการ
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/5">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="px-5 md:px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                  >
                    {/* Index */}
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">
                      {index + 1}
                    </span>

                    {/* Cover Image */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
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
                      <p className="font-semibold text-base md:text-lg truncate">{item.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{item.artist}</p>
                      <div className="flex items-center gap-1 mt-1 text-gray-500">
                        <MusicalNoteIcon className="w-3 h-3" />
                        <span className="text-xs">เพลงดิจิทัล</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg md:text-xl font-bold text-green-400">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items Footer */}
              <div className="px-5 md:px-6 py-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">รวมสินค้า</span>
                  <span className="text-xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Summary Card */}
              <div className="rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-white/10 overflow-hidden backdrop-blur-lg">
                <div className="px-5 md:px-6 py-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-primary-400" />
                    <h2 className="font-semibold text-lg">สรุปการชำระเงิน</h2>
                  </div>
                </div>

                <div className="p-5 md:p-6 space-y-4">
                  {/* Credit Balance */}
                  {session && (
                    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5">
                      <span className="text-gray-400">เครดิตคงเหลือ</span>
                      <span className={`text-lg font-bold ${hasEnoughCredit ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPrice(currentCredit)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
                    <span className="font-medium">ยอดชำระ</span>
                    <span className="text-2xl font-bold text-green-400">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {/* After Payment */}
                  {session && (
                    <div className="flex items-center justify-between text-sm py-2">
                      <span className="text-gray-500">หลังชำระ</span>
                      <span className={hasEnoughCredit ? 'text-gray-400' : 'text-red-400 font-medium'}>
                        {formatPrice(currentCredit - totalPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div className="mx-5 md:mx-6 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Not Enough Credit Warning */}
                {session && !hasEnoughCredit && (
                  <div className="mx-5 md:mx-6 mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30">
                    <div className="flex gap-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-400">เครดิตไม่เพียงพอ</p>
                        <p className="text-sm text-gray-400 mt-1">
                          ต้องการเพิ่มอีก <span className="text-yellow-400 font-medium">{formatPrice(totalPrice - currentCredit)}</span>
                        </p>
                        <Link
                          href="/topup"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                          เติมเงินเลย
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <div className="p-5 md:p-6 pt-0">
                  {/* Show verified email if set */}
                  {verifiedEmail && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
                      <EnvelopeIcon className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm text-green-400">อีเมลสำหรับดาวน์โหลด</p>
                        <p className="text-white font-medium">{verifiedEmail}</p>
                      </div>
                      <button
                        onClick={() => setShowEmailVerify(true)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        เปลี่ยน
                      </button>
                    </div>
                  )}

                  {/* Show verify email button if not verified */}
                  {!verifiedEmail ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setShowEmailVerify(true)}
                      disabled={!hasEnoughCredit}
                    >
                      <EnvelopeIcon className="w-5 h-5 mr-2" />
                      ยืนยันอีเมลเพื่อชำระเงิน
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleCheckout()}
                      isLoading={isLoading}
                      disabled={!hasEnoughCredit}
                    >
                      <ShieldCheckIcon className="w-5 h-5 mr-2" />
                      ยืนยันชำระเงิน
                    </Button>
                  )}

                  <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    เมื่อกดชำระเงิน เครดิตจะถูกหักทันที
                  </p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>ระบบชำระเงินปลอดภัย 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Verify Modal */}
      <EmailVerifyModal
        isOpen={showEmailVerify}
        onClose={() => setShowEmailVerify(false)}
        onSuccess={(email) => {
          setVerifiedEmail(email);
          setShowEmailVerify(false);
        }}
        type="checkout"
        title="ยืนยันอีเมลก่อนชำระเงิน"
        description="อีเมลนี้จะใช้สำหรับดาวน์โหลดสินค้า"
      />
    </div>
  );
}
