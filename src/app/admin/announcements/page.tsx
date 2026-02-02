'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface Announcement {
  id: string;
  message: string;
  type: string;
  linkUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

const typeOptions = [
  { value: 'info', label: 'ข้อมูล (น้ำเงิน)', color: 'bg-blue-600' },
  { value: 'success', label: 'สำเร็จ (เขียว)', color: 'bg-green-600' },
  { value: 'warning', label: 'เตือน (เหลือง)', color: 'bg-yellow-600' },
  { value: 'error', label: 'สำคัญ (แดง)', color: 'bg-red-600' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    message: '',
    type: 'info',
    linkUrl: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditing(announcement);
      setForm({
        message: announcement.message,
        type: announcement.type,
        linkUrl: announcement.linkUrl || '',
        isActive: announcement.isActive,
        startDate: announcement.startDate?.slice(0, 16) || '',
        endDate: announcement.endDate?.slice(0, 16) || '',
      });
    } else {
      setEditing(null);
      setForm({
        message: '',
        type: 'info',
        linkUrl: '',
        isActive: true,
        startDate: '',
        endDate: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.message.trim()) {
      swal.error('กรุณากรอกข้อความ');
      return;
    }

    try {
      const url = '/api/admin/announcements';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editing ? 'แก้ไขประกาศสำเร็จ' : 'เพิ่มประกาศสำเร็จ');
      setShowModal(false);
      fetchAnnouncements();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirm('ยืนยันการลบ', 'ต้องการลบประกาศนี้หรือไม่?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบประกาศสำเร็จ');
      fetchAnnouncements();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const getTypeColor = (type: string) => {
    return typeOptions.find(t => t.value === type)?.color || 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการประกาศ</h1>
          <p className="text-gray-400">แถบแจ้งเตือนด้านบนเว็บไซต์</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มประกาศ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MegaphoneIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>ยังไม่มีประกาศ</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-white/10"
            >
              <div className={`w-2 h-12 rounded-full ${getTypeColor(announcement.type)}`} />
              <div className="flex-1">
                <p className="font-medium">{announcement.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    announcement.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {announcement.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  {announcement.linkUrl && (
                    <span className="text-xs text-gray-500">→ {announcement.linkUrl}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(announcement)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg mx-4 p-6 rounded-2xl bg-gray-900 border border-white/10">
            <h2 className="text-xl font-bold mb-4">
              {editing ? 'แก้ไขประกาศ' : 'เพิ่มประกาศ'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ข้อความ *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  rows={3}
                  placeholder="ระบบเติมเงินอัตโนมัติพร้อมใช้งาน"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ประเภท</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ลิงก์ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  placeholder="/products"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">เริ่มแสดง</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">สิ้นสุด</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>เปิดใช้งาน</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90"
                >
                  {editing ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
