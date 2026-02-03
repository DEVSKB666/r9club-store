'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MusicalNoteIcon, GiftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSiteSettings } from '@/hooks/useSiteSettings';

import swal from '@/lib/swal';

interface LegacyUserData {
  email: string;
  name: string;
  creditBalance: number;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSiteSettings();

  // Legacy user states
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [legacyUser, setLegacyUser] = useState<LegacyUserData | null>(null);
  const [legacyStep, setLegacyStep] = useState<'info' | 'otp' | 'password'>('info');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [legacyLoading, setLegacyLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First, check if user is a legacy user
      const checkRes = await fetch('/api/auth/check-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const checkData = await checkRes.json();

      // If user is a legacy user (no password), show modal
      if (checkData.exists && checkData.isLegacy) {
        setLegacyUser({
          email: checkData.email,
          name: checkData.name,
          creditBalance: checkData.creditBalance,
        });
        setShowLegacyModal(true);
        setLegacyStep('info');
        setIsLoading(false);
        return;
      }

      // Normal login flow
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        swal.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        swal.success('เข้าสู่ระบบสำเร็จ');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      swal.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP to legacy user
  const handleSendOtp = async () => {
    if (!legacyUser) return;
    setLegacyLoading(true);

    try {
      const res = await fetch('/api/auth/legacy-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: legacyUser.email }),
      });
      const data = await res.json();

      if (data.success) {
        swal.success('ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว');
        setLegacyStep('otp');
      } else {
        swal.error(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      swal.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLegacyLoading(false);
    }
  };

  // Verify OTP and set new password
  const handleResetPassword = async () => {
    if (!legacyUser || !otp || !newPassword) return;

    if (newPassword !== confirmPassword) {
      swal.error('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      swal.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLegacyLoading(true);

    try {
      const res = await fetch('/api/auth/legacy-reset', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: legacyUser.email, 
          otp, 
          password: newPassword 
        }),
      });
      const data = await res.json();

      if (data.success) {
        swal.success('ตั้งรหัสผ่านใหม่สำเร็จ! กำลังเข้าสู่ระบบ...');
        setShowLegacyModal(false);

        // Auto login with new password
        const result = await signIn('credentials', {
          email: legacyUser.email,
          password: newPassword,
          redirect: false,
        });

        if (!result?.error) {
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        swal.error(data.error || 'รหัส OTP ไม่ถูกต้อง');
      }
    } catch (err) {
      swal.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLegacyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">



            {settings.site_logo && settings.site_logo !== '/logo.png' ? (
              <div className="relative w-24 h-24 mx-auto">
                <Image 
                  src={settings.site_logo} 
                  alt={settings.site_name} 
                  fill
                  className="rounded-xl object-contain"
                  sizes="96px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <MusicalNoteIcon className="w-7 h-7 text-white" />
              </div>
            )}
            <div className="text-left">
              <h1 className="font-bold text-xl">{settings.site_name}</h1>
              <p className="text-xs text-gray-400">Music Store</p>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl gradient-card border border-white/10 p-8">
          <h2 className="text-2xl font-bold text-center mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="อีเมล"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="รหัสผ่าน"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-500">หรือ</span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            onClick={async () => {
              console.log("Starting Discord login...");
              try {
                const result = await signIn('discord', { callbackUrl, redirect: true });
                console.log("Discord login result:", result);
              } catch (e) {
                console.error("Discord login error:", e);
              }
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
            </svg>
            เข้าสู่ระบบด้วย Discord
          </Button>

          <div className="mt-6 text-center text-sm text-gray-400">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300">
              สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>

      {/* Legacy User Modal */}
      {showLegacyModal && legacyUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md relative">
            <button 
              onClick={() => setShowLegacyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Step: Info */}
            {legacyStep === 'info' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <GiftIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">ยินดีต้อนรับกลับ! 🎉</h3>
                <p className="text-gray-400 mb-4">
                  พบบัญชีเดิมของคุณในระบบ
                </p>
                
                <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-400">ชื่อผู้ใช้</p>
                  <p className="font-bold text-lg">{legacyUser.name}</p>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400">เครดิตคงเหลือ</p>
                    <p className="font-bold text-2xl text-yellow-400">
                      ฿{legacyUser.creditBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  กรุณาตั้งรหัสผ่านใหม่เพื่อเข้าสู่ระบบ<br/>
                  เราจะส่งรหัส OTP ไปที่อีเมล <strong className="text-white">{legacyUser.email}</strong>
                </p>

                <Button 
                  onClick={handleSendOtp} 
                  className="w-full"
                  isLoading={legacyLoading}
                >
                  ส่งรหัส OTP
                </Button>
              </div>
            )}

            {/* Step: OTP + Password */}
            {legacyStep === 'otp' && (
              <div>
                <h3 className="text-xl font-bold mb-2 text-center">ตั้งรหัสผ่านใหม่</h3>
                <p className="text-gray-400 text-center mb-6 text-sm">
                  กรอกรหัส OTP ที่ส่งไปยัง {legacyUser.email}
                </p>

                <div className="space-y-4">
                  <Input
                    id="otp"
                    type="text"
                    label="รหัส OTP (6 หลัก)"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />

                  <Input
                    id="newPassword"
                    type="password"
                    label="รหัสผ่านใหม่"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <Input
                    id="confirmPassword"
                    type="password"
                    label="ยืนยันรหัสผ่าน"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <Button 
                    onClick={handleResetPassword} 
                    className="w-full"
                    isLoading={legacyLoading}
                    disabled={!otp || !newPassword || !confirmPassword}
                  >
                    ยืนยันและเข้าสู่ระบบ
                  </Button>

                  <button 
                    onClick={handleSendOtp}
                    className="w-full text-sm text-gray-400 hover:text-white"
                    disabled={legacyLoading}
                  >
                    ส่งรหัส OTP อีกครั้ง
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
