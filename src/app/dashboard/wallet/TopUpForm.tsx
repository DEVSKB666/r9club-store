'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import swal from '@/lib/swal';
import { PaymentModal } from '@/components/topup/PaymentModal';

const presetAmounts = [100, 200, 500, 1000];

export function TopUpForm() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean; qrUrl: string; referenceId: string}>({isOpen: false, qrUrl: '', referenceId: ''});

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 10) {
      swal.error('จำนวนเงินขั้นต่ำ 10 บาท');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/topup/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      console.log('QR Response:', data);

      if (res.ok && data.success) {
        // Get raw QR code data or image URL
        const qrData = data.qrCode || data.qrImage || data.rawResponse?.data?.qrCode;
        
        if (qrData) {
          // If it's raw QR data (not a URL), generate image using QR code API
          let qrImageUrl = qrData;
          if (!qrData.startsWith('http')) {
            // Use a QR code generation service
            qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
          }
          
          setPaymentModal({
            isOpen: true,
            qrUrl: qrImageUrl,
            referenceId: data.referenceId || `QR-${Date.now()}`,
          });
        } else {
          swal.error('ไม่พบ QR Code กรุณาลองใหม่');
        }
      } else {
        swal.error(data.error || 'ไม่สามารถสร้าง QR Code ได้');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleGenerateQR} className="space-y-4">
        {/* Preset Amounts */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            เลือกจำนวนเงิน
          </label>
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-2 rounded-lg border transition-all ${
                  amount === preset
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                ฿{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <Input
          type="number"
          label="หรือระบุจำนวนเอง (บาท)"
          value={amount || ''}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          min={10}
          placeholder="100"
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={amount < 10}
        >
          เติมเงิน ฿{amount || 0}
        </Button>
      </form>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => {
          setPaymentModal({ isOpen: false, qrUrl: '', referenceId: '' });
          router.refresh(); // Refresh page to show new balance and transaction
        }}
        qrCodeUrl={paymentModal.qrUrl}
        amount={amount}
        referenceId={paymentModal.referenceId}
      />
    </>
  );
}
