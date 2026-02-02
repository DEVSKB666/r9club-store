'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, EnvelopeIcon, KeyIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface EmailVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, token: string) => void;
  type: 'checkout' | 'download';
  relatedId?: string;
  title?: string;
  description?: string;
}

export function EmailVerifyModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  relatedId,
  title = 'ยืนยันอีเมล',
  description = 'กรอกอีเมลเพื่อรับรหัส OTP',
}: EmailVerifyModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'otp') {
      setCanResend(true);
    }
  }, [countdown, step]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(0);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมล');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email-verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type, relatedId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setStep('otp');
      setCountdown(data.expiresIn || 300);
      setCanResend(false);
      
      // Focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/email-verify/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, type, relatedId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      onSuccess(email, data.verificationToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = pasted.padEnd(6, '').split('').slice(0, 6);
      setOtp(newOtp);
      if (pasted.length === 6) {
        setTimeout(() => handleVerifyOtp(), 100);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <EnvelopeIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{title}</h2>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={loading || !email}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5" />
                    ส่งรหัส OTP
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Email display */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">ส่งรหัสไปยัง</p>
                <p className="font-medium text-primary-400">{email}</p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputsRef.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-400 text-sm">
                    รหัสหมดอายุใน <span className="text-primary-400 font-mono">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-red-400 text-sm">รหัส OTP หมดอายุแล้ว</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    กำลังตรวจสอบ...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    ยืนยัน
                  </>
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={() => {
                      setStep('email');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="text-primary-400 text-sm hover:underline"
                  >
                    ส่งรหัสใหม่
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('email')}
                    className="text-gray-500 text-sm hover:text-gray-400"
                  >
                    เปลี่ยนอีเมล
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
