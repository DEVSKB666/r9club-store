'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface Slide {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  order: number;
  isActive: boolean;
}

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
    order: 0,
    isActive: true,
  });

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/slides');
      const data = await res.json();
      setSlides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openModal = (slide?: Slide) => {
    if (slide) {
      setEditing(slide);
      setForm({
        title: slide.title || '',
        description: slide.description || '',
        imageUrl: slide.imageUrl,
        linkUrl: slide.linkUrl || '',
        buttonText: slide.buttonText || '',
        order: slide.order,
        isActive: slide.isActive,
      });
    } else {
      setEditing(null);
      setForm({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        buttonText: '',
        order: slides.length,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.imageUrl) {
      swal.error('กรุณาเลือกรูปภาพ');
      return;
    }

    try {
      const url = '/api/admin/slides';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editing ? 'แก้ไขสไลด์สำเร็จ' : 'เพิ่มสไลด์สำเร็จ');
      setShowModal(false);
      fetchSlides();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirm('ยืนยันการลบ', 'ต้องการลบสไลด์นี้หรือไม่?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/slides?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบสไลด์สำเร็จ');
      fetchSlides();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการสไลด์</h1>
          <p className="text-gray-400">แบนเนอร์โปรโมชั่นหน้าแรก</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-white font-medium hover:opacity-90"
        >
          <PlusIcon className="w-5 h-5" />
          เพิ่มสไลด์
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : slides.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>ยังไม่มีสไลด์</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-white/10"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title || 'Slide'}
                className="w-32 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{slide.title || '(ไม่มีชื่อ)'}</h3>
                <p className="text-sm text-gray-400 truncate">{slide.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    slide.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {slide.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                  <span className="text-xs text-gray-500">ลำดับ: {slide.order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(slide)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
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
              {editing ? 'แก้ไขสไลด์' : 'เพิ่มสไลด์'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">รูปภาพ *</label>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">หัวข้อ</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  placeholder="ยินดีต้อนรับ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">รายละเอียด</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  rows={2}
                  placeholder="โปรโมชั่นสินค้า 150-400 บาท"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ลิงก์ปุ่ม</label>
                  <input
                    type="text"
                    value={form.linkUrl}
                    onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ข้อความปุ่ม</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                    placeholder="เลือกซื้อสินค้า"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ลำดับ</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-white/10 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center mt-6">
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
