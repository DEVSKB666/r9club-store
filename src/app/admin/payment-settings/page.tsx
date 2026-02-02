'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon, BanknotesIcon, KeyIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Swal from 'sweetalert2';

interface PaymentSettings {
  id: string;
  provider: string;
  apiKey: string | null;
  apiSecret: string | null;
  bankCode: string | null;
  bankAccountNo: string | null;
  bankAccountName: string | null;
  promptpayId: string | null;
  promptpayName: string | null;
  qrCodeImage: string | null;
  minAmount: number;
  maxAmount: number;
  checkDuplicate: boolean;
  checkReceiver: boolean;
  isActive: boolean;
}

const bankOptions = [
  { code: 'KBANK', name: 'ธนาคารกสิกรไทย', color: '#138F2D' },
  { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', color: '#4E2A84' },
  { code: 'BBL', name: 'ธนาคารกรุงเทพ', color: '#1E4598' },
  { code: 'KTB', name: 'ธนาคารกรุงไทย', color: '#00A4E4' },
  { code: 'TMB', name: 'ธนาคารทหารไทยธนชาต', color: '#1279BE' },
  { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา', color: '#FEC43B' },
  { code: 'GSB', name: 'ธนาคารออมสิน', color: '#E8119D' },
];

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกได้',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (url: string) => {
    if (settings) {
      setSettings({ ...settings, qrCodeImage: url });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <CreditCardIcon className="w-8 h-8 text-green-500" />
            ตั้งค่าการชำระเงิน
          </h1>
          <p className="text-gray-400 mt-1">ตั้งค่า Slip2Go API และบัญชีธนาคาร</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>

      {settings && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* API Settings */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <KeyIcon className="w-5 h-5 text-yellow-500" />
              Slip2Go API
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={settings.apiKey || ''}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="ใส่ API Key จาก Slip2Go"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Secret
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiSecret ? 'text' : 'password'}
                    value={settings.apiSecret || ''}
                    onChange={(e) => setSettings({ ...settings, apiSecret: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                    placeholder="ใส่ API Secret จาก Slip2Go"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
                  >
                    {showApiSecret ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  รับ API Key/Secret จาก{' '}
                  <a href="https://app.slip2go.com" target="_blank" rel="noreferrer" className="text-primary-400 hover:underline">
                    app.slip2go.com
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    จำนวนเงินขั้นต่ำ
                  </label>
                  <input
                    type="number"
                    value={settings.minAmount}
                    onChange={(e) => setSettings({ ...settings, minAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    จำนวนเงินสูงสุด
                  </label>
                  <input
                    type="number"
                    value={settings.maxAmount}
                    onChange={(e) => setSettings({ ...settings, maxAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.checkDuplicate}
                    onChange={(e) => setSettings({ ...settings, checkDuplicate: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm">ตรวจสลิปซ้ำ</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.checkReceiver}
                    onChange={(e) => setSettings({ ...settings, checkReceiver: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm">ตรวจบัญชีปลายทาง</span>
                </label>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.isActive}
                    onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                  />
                  <span className="text-sm font-medium text-green-400">เปิดใช้งานระบบเติมเงิน</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bank Account Settings */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <BanknotesIcon className="w-5 h-5 text-green-500" />
              บัญชีธนาคาร
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ธนาคาร
                </label>
                <select
                  value={settings.bankCode || ''}
                  onChange={(e) => setSettings({ ...settings, bankCode: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">เลือกธนาคาร</option>
                  {bankOptions.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  เลขบัญชี
                </label>
                <input
                  type="text"
                  value={settings.bankAccountNo || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="เลขบัญชีธนาคาร"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ชื่อบัญชี
                </label>
                <input
                  type="text"
                  value={settings.bankAccountName || ''}
                  onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="ชื่อเจ้าของบัญชี"
                />
              </div>

              <hr className="border-gray-700" />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  เบอร์/เลขบัตร PromptPay
                </label>
                <input
                  type="text"
                  value={settings.promptpayId || ''}
                  onChange={(e) => setSettings({ ...settings, promptpayId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="เบอร์โทร หรือ เลขบัตรประชาชน"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ชื่อ PromptPay
                </label>
                <input
                  type="text"
                  value={settings.promptpayName || ''}
                  onChange={(e) => setSettings({ ...settings, promptpayName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary-500"
                  placeholder="ชื่อที่แสดงใน PromptPay"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 lg:col-span-2">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <PhotoIcon className="w-5 h-5 text-blue-500" />
              QR Code สำหรับโอนเงิน
            </h2>

            <div className="flex items-start gap-6">
              <div className="w-48">
                {settings.qrCodeImage ? (
                  <div className="relative">
                    <img
                      src={settings.qrCodeImage}
                      alt="QR Code"
                      className="w-full rounded-lg border border-gray-600"
                    />
                    <button
                      onClick={() => setSettings({ ...settings, qrCodeImage: null })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <span className="text-gray-500">ไม่มี QR</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <ImageUpload
                  value={settings.qrCodeImage || ''}
                  onChange={handleImageUpload}
                  label="อัพโหลด QR Code"
                />
                <p className="text-sm text-gray-500 mt-2">
                  อัพโหลด QR Code PromptPay หรือ QR ธนาคาร เพื่อแสดงให้ลูกค้าสแกน
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
