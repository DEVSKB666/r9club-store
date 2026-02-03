'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: string | null;
  isActive: boolean;
  order: number;
}

const categories = [
  { value: 'general', label: 'ทั่วไป' },
  { value: 'payment', label: 'การชำระเงิน' },
  { value: 'download', label: 'การดาวน์โหลด' },
  { value: 'membership', label: 'สมาชิก/แพ็คเกจ' },
  { value: 'support', label: 'การติดต่อ/ช่วยเหลือ' },
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    icon: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      icon: '',
      isActive: true,
      order: 0,
    });
    setEditingFaq(null);
    setIsAdding(false);
  };

  const startEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setIsAdding(false);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      icon: faq.icon || '',
      isActive: faq.isActive,
      order: faq.order,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingFaq 
        ? `/api/admin/faqs/${editingFaq.id}` 
        : '/api/admin/faqs';
      
      const res = await fetch(url, {
        method: editingFaq ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editingFaq ? 'บันทึกสำเร็จ!' : 'เพิ่ม FAQ สำเร็จ!');
      resetForm();
      fetchFaqs();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('คำถามนี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบสำเร็จ!');
      fetchFaqs();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  // Group FAQs by category
  const groupedFaqs = categories.map(cat => ({
    ...cat,
    faqs: faqs.filter(f => f.category === cat.value),
  })).filter(g => g.faqs.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">คำถามที่พบบ่อย</h1>
          <p className="text-gray-400">FAQ - Frequently Asked Questions</p>
        </div>
        {!isAdding && !editingFaq && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            เพิ่ม FAQ ใหม่
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingFaq) && (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingFaq ? 'แก้ไข FAQ' : 'เพิ่ม FAQ ใหม่'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="ไอคอน (Emoji หรือ URL)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🔥 หรือ /icons/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">คำถาม</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="เช่น วิธีการสั่งซื้อในเว็บของเรา?"
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">คำตอบ</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
              placeholder="คำตอบแบบละเอียด... รองรับ HTML"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span>เปิดใช้งาน</span>
            </label>
            <Input
              type="number"
              label="ลำดับ"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-24"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              {editingFaq ? 'บันทึก' : 'เพิ่ม'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {/* FAQ List by Category */}
      <div className="space-y-6">
        {groupedFaqs.map(group => (
          <div key={group.value}>
            <h3 className="text-lg font-semibold mb-3 text-primary-400">{group.label}</h3>
            <div className="space-y-2">
              {group.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl bg-gray-900/50 border border-white/10 overflow-hidden"
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5"
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  >
                    {faq.icon && <span className="text-xl">{faq.icon}</span>}
                    <span className="flex-1 font-medium">Q: {faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-3">
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap">{faq.answer}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(faq); }}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm"
                        >
                          <PencilIcon className="w-4 h-4 inline mr-1" />
                          แก้ไข
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(faq.id); }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm"
                        >
                          <TrashIcon className="w-4 h-4 inline mr-1" />
                          ลบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && faqs.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500">
          ยังไม่มี FAQ กดปุ่ม &quot;เพิ่ม FAQ ใหม่&quot; เพื่อเริ่มต้น
        </div>
      )}
    </div>
  );
}
