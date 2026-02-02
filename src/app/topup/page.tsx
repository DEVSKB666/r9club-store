'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CloudArrowUpIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';
import { useCreditStore } from '@/stores/useCreditStore';
import { PaymentModal } from '@/components/topup/PaymentModal';

interface PaymentSettings {
  bankCode: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
  promptpayId: string | null;
  promptpayName: string | null;
  qrCodeImage: string | null;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
}

const bankColors: Record<string, string> = {
  KBANK: '#138F2D',
  SCB: '#4E2A84',
  BBL: '#1E4598',
  KTB: '#00A4E4',
  TMB: '#1279BE',
  BAY: '#FEC43B',
  GSB: '#E8119D',
};

const bankNames: Record<string, string> = {
  KBANK: 'ธนาคารกสิกรไทย',
  SCB: 'ธนาคารไทยพาณิชย์',
  BBL: 'ธนาคารกรุงเทพ',
  KTB: 'ธนาคารกรุงไทย',
  TMB: 'ธนาคารทหารไทยธนชาต',
  BAY: 'ธนาคารกรุงศรีอยุธยา',
  GSB: 'ธนาคารออมสิน',
};

export default function TopUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { creditBalance, fetchBalance } = useCreditStore();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [dynamicQR, setDynamicQR] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{isOpen: boolean; qrUrl: string; referenceId: string}>({isOpen: false, qrUrl: '', referenceId: ''});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial balance
  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance();
    }
  }, [session?.user?.id, fetchBalance]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/topup');
    }
  }, [status, router]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment-settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Generate dynamic QR Code with amount
  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) < 10) {
      swal.warning('กรุณาใส่จำนวนเงินขั้นต่ำ 10 บาท');
      return;
    }

    setGeneratingQR(true);
    try {
      const res = await fetch('/api/topup/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await res.json();
      console.log('QR Response:', data);

      if (res.ok && data.success) {
        // Get raw QR code data or image URL
        const qrData = data.qrCode || data.qrImage || data.rawResponse?.data?.qrCode;
        console.log('QR Data:', qrData);
        
        if (qrData) {
          // If it's raw QR data (not a URL), generate image using QR code API
          let qrImageUrl = qrData;
          if (!qrData.startsWith('http')) {
            // Use a QR code generation service
            qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
          }
          
          setDynamicQR(qrImageUrl);
          
          // Open the payment modal
          setPaymentModal({
            isOpen: true,
            qrUrl: qrImageUrl,
            referenceId: data.referenceId || `QR-${Date.now()}`,
          });
        } else {
          swal.error('ไม่พบ QR Code กรุณาลองใหม่อีกครั้ง');
        }
      } else {
        swal.error(data.error || 'ไม่สามารถสร้าง QR Code ได้');
      }
    } catch (error) {
      console.error('Generate QR error:', error);
      swal.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleSubmit = async () => {
    if (!slipFile || !amount) {
      swal.warning('กรุณากรอกข้อมูลให้ครบ ใส่จำนวนเงินและอัพโหลดสลิป');
      return;
    }

    const amountNum = parseFloat(amount);
    if (settings && (amountNum < settings.minAmount || amountNum > settings.maxAmount)) {
      swal.error(`จำนวนเงินต้องอยู่ระหว่าง ${settings.minAmount.toLocaleString()} - ${settings.maxAmount.toLocaleString()} บาท`);
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('slip', slipFile);
      formData.append('amount', amount);

      const res = await fetch('/api/topup/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Refresh the credit balance in the store
        fetchBalance();
        
        swal.fire({
          icon: 'success',
          title: 'เติมเงินสำเร็จ!',
          html: `<p class="text-2xl font-bold text-green-400">+${data.transaction.amount.toLocaleString()} บาท</p>`,
          confirmButtonText: 'ตกลง',
        }).then(() => {
          router.push('/dashboard');
        });
      } else {
        swal.error(data.error || 'เติมเงินไม่สำเร็จ กรุณาลองใหม่');
      }
    } catch (error) {
      console.error('Submit error:', error);
      swal.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!settings?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">ระบบเติมเงินปิดให้บริการ</h1>
          <p className="text-gray-400">กรุณาติดต่อแอดมินเพื่อเติมเงิน</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <BanknotesIcon className="w-10 h-10 text-green-500" />
            เติมเงิน
          </h1>
          <p className="text-gray-400 mt-2">
            ยอดเงินปัจจุบัน: <span className="text-green-400 font-bold">{creditBalance.toLocaleString()} บาท</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bank Info */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">ข้อมูลการโอนเงิน</h2>

            {/* QR Code - Dynamic or Static */}
            {dynamicQR ? (
              <div className="mb-6 text-center">
                <img
                  src={dynamicQR}
                  alt="Dynamic QR Code"
                  className="max-w-[200px] mx-auto rounded-xl border-4 border-green-500"
                />
                <p className="text-sm text-green-400 mt-2 font-semibold">
                  QR Code สำหรับ {parseFloat(amount).toLocaleString()} บาท
                </p>
                <button
                  onClick={() => setDynamicQR(null)}
                  className="mt-2 text-xs text-gray-400 hover:text-white"
                >
                  ยกเลิก QR นี้
                </button>
              </div>
            ) : settings.qrCodeImage ? (
              <div className="mb-6 text-center">
                <img
                  src={settings.qrCodeImage}
                  alt="QR Code"
                  className="max-w-[200px] mx-auto rounded-xl border-4 border-white"
                />
                <p className="text-sm text-gray-400 mt-2">สแกนเพื่อโอนเงิน</p>
              </div>
            ) : null}

            {/* Bank Details */}
            {settings.bankCode && (
              <div 
                className="p-4 rounded-xl text-white mb-4"
                style={{ backgroundColor: bankColors[settings.bankCode] || '#333' }}
              >
                <div className="font-bold text-lg">{bankNames[settings.bankCode] || settings.bankCode}</div>
                <div className="text-2xl font-mono tracking-wider my-2">{settings.bankAccountNo}</div>
                <div className="opacity-90">{settings.bankAccountName}</div>
              </div>
            )}

            {/* PromptPay */}
            {settings.promptpayId && (
              <div className="p-4 rounded-xl bg-blue-600 text-white">
                <div className="text-sm opacity-75">พร้อมเพย์</div>
                <div className="text-xl font-mono">{settings.promptpayId}</div>
                <div className="opacity-90">{settings.promptpayName}</div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-400">
              <p>• จำนวนขั้นต่ำ: <span className="text-white">{settings.minAmount.toLocaleString()} บาท</span></p>
              <p>• จำนวนสูงสุด: <span className="text-white">{settings.maxAmount.toLocaleString()} บาท</span></p>
            </div>
          </div>

          {/* Upload Slip */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold">อัพโหลดหลักฐานการโอน</h2>
            <span className="text-xs text-red-500">กรุณา หลีกเลี่ยง !! การโอนเงินในช่วงเวลา 23:00น. - 00:00น.</span>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2 mt-4">
                จำนวนเงินที่โอน (บาท)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 text-xl font-bold"
                placeholder="0"
                min={settings.minAmount}
                max={settings.maxAmount}
              />
            </div>

            {/* Generate QR Button */}
            <button
              onClick={handleGenerateQR}
              disabled={generatingQR || !amount || parseFloat(amount) < 10}
              className="w-full mb-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
            >
              {generatingQR ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  กำลังสร้าง QR...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  สร้าง QR Code ({amount || 0} บาท)
                </>
              )}
            </button>

            {/* Slip Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                slipPreview ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {slipPreview ? (
                <div>
                  <img
                    src={slipPreview}
                    alt="Slip Preview"
                    className="max-h-48 mx-auto rounded-lg mb-2"
                  />
                  <p className="text-green-400 flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    อัพโหลดสลิปแล้ว
                  </p>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">คลิกเพื่ออัพโหลดสลิป</p>
                  <p className="text-sm text-gray-500 mt-1">รองรับ JPG, PNG, WEBP</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !slipFile || !amount}
              className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  กำลังตรวจสอบ...
                </span>
              ) : (
                'ยืนยันการเติมเงิน'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              ระบบจะตรวจสอบสลิปอัตโนมัติและเติมเงินให้ภายใน 10 วินาที
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => {
          setPaymentModal({ isOpen: false, qrUrl: '', referenceId: '' });
          fetchBalance(); // Refresh balance when modal closes
        }}
        qrCodeUrl={paymentModal.qrUrl}
        amount={parseFloat(amount) || 0}
        referenceId={paymentModal.referenceId}
      />
    </div>
  );
}
