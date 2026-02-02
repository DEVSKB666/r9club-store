'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useCreditStore } from '@/stores/useCreditStore';
import Swal from 'sweetalert2';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  amount: number;
  referenceId?: string;
}

type PaymentStatus = 'waiting' | 'checking' | 'success' | 'expired' | 'error' | 'uploading';

export function PaymentModal({ isOpen, onClose, qrCodeUrl, amount, referenceId }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>('waiting');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [checkCount, setCheckCount] = useState(0);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchBalance } = useCreditStore();

  // Show upload option after 3 seconds (almost immediately since auto-check doesn't work)
  useEffect(() => {
    if (!isOpen || status === 'success' || status === 'expired') return;

    const timer = setTimeout(() => {
      setShowUploadOption(true);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [isOpen, status]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || status === 'success' || status === 'expired') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, status]);

  // Poll for payment status
  const checkPaymentStatus = useCallback(async () => {
    if (status === 'success' || status === 'expired' || status === 'uploading') return;
    
    setStatus('checking');
    try {
      const res = await fetch('/api/topup/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, referenceId }),
      });

      const data = await res.json();
      console.log('Payment check response:', data);

      if (data.paid) {
        setStatus('success');
        fetchBalance(); // Refresh balance
      } else {
        setStatus('waiting');
        setCheckCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Payment check error:', error);
      setStatus('waiting');
    }
  }, [amount, referenceId, status, fetchBalance]);

  // Auto-check payment every 5 seconds
  useEffect(() => {
    if (!isOpen || status === 'success' || status === 'expired' || status === 'uploading') return;

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, status, checkPaymentStatus]);

  // Handle slip upload
  const handleSlipUpload = async (file: File) => {
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('slip', file);
    formData.append('amount', amount.toString());

    try {
      const res = await fetch('/api/topup/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        fetchBalance();
        Swal.fire({
          icon: 'success',
          title: 'เติมเงินสำเร็จ!',
          text: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setStatus('waiting');
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: data.error || 'กรุณาลองใหม่',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('waiting');
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStatus('waiting');
      setTimeLeft(300);
      setCheckCount(0);
      setShowUploadOption(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={status === 'success' ? onClose : undefined}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSlipUpload(file);
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white text-center">เติมเงิน</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'success' ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
                <CheckCircleIcon className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">เติมเงินสำเร็จ!</h3>
              <p className="text-4xl font-bold text-white mb-4">+{amount.toLocaleString()} บาท</p>
              <p className="text-gray-400">ยอดเงินได้ถูกเพิ่มเข้าบัญชีแล้ว</p>
              <button
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-colors"
              >
                ตกลง
              </button>
            </div>
          ) : status === 'expired' ? (
            /* Expired State */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">หมดเวลา</h3>
              <p className="text-gray-400 mb-4">QR Code นี้หมดอายุแล้ว</p>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
              >
                ปิด
              </button>
            </div>
          ) : (
            /* Waiting State */
            <>
              {/* Amount */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">จำนวนเงินที่ต้องโอน</p>
                <p className="text-4xl font-bold text-green-400">{amount.toLocaleString()} บาท</p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-4 mx-auto w-fit mb-6">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {status === 'checking' || status === 'uploading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-green-400">
                      {status === 'uploading' ? 'กำลังตรวจสอบสลิป...' : 'กำลังตรวจสอบการชำระเงิน...'}
                    </span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400">รอการชำระเงิน</span>
                  </>
                )}
              </div>

              {/* Timer */}
              <div className="text-center mb-4">
                <p className="text-gray-500 text-sm">หมดอายุใน</p>
                <p className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* Upload Slip Button - Show after 30 seconds */}
              {showUploadOption && status !== 'uploading' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <CloudArrowUpIcon className="w-5 h-5" />
                  อัพโหลดสลิปแทน
                </button>
              )}

              {/* Instructions */}
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 font-bold">1.</span>
                  สแกน QR Code ด้วยแอปธนาคาร
                </p>
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 font-bold">2.</span>
                  ทำการโอนเงินตามจำนวนที่ระบุ
                </p>
                <p className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 font-bold">3.</span>
                  {showUploadOption 
                    ? 'กดปุ่ม "อัพโหลดสลิปแทน" เพื่อยืนยันการโอน'
                    : 'รอระบบตรวจสอบอัตโนมัติ'}
                </p>
              </div>

              {/* Check count indicator */}
              {checkCount > 0 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  ตรวจสอบแล้ว {checkCount} ครั้ง
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
