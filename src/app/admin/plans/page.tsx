'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  icon: string | null;
  color: string;
  features: string;
  buttonText: string | null;
  buttonUrl: string | null;
  isPopular: boolean;
  isActive: boolean;
  order: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    period: 'month',
    icon: '',
    color: '#facc15',
    features: [''],
    buttonText: 'เลือกแพ็คนี้',
    buttonUrl: '',
    isPopular: false,
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/plans');
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      period: 'month',
      icon: '',
      color: '#facc15',
      features: [''],
      buttonText: 'เลือกแพ็คนี้',
      buttonUrl: '',
      isPopular: false,
      isActive: true,
      order: 0,
    });
    setEditingPlan(null);
    setIsAdding(false);
  };

  const startEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsAdding(false);
    try {
      const features = JSON.parse(plan.features);
      setFormData({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        icon: plan.icon || '',
        color: plan.color,
        features: Array.isArray(features) ? features : [''],
        buttonText: plan.buttonText || 'เลือกแพ็คนี้',
        buttonUrl: plan.buttonUrl || '',
        isPopular: plan.isPopular,
        isActive: plan.isActive,
        order: plan.order,
      });
    } catch {
      setFormData({
        ...formData,
        name: plan.name,
        price: plan.price,
        features: [''],
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingPlan 
        ? `/api/admin/plans/${editingPlan.id}` 
        : '/api/admin/plans';
      
      const res = await fetch(url, {
        method: editingPlan ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(f => f.trim()),
        }),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editingPlan ? 'บันทึกสำเร็จ!' : 'เพิ่มแพ็คใหม่สำเร็จ!');
      resetForm();
      fetchPlans();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('แพ็คนี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบสำเร็จ!');
      fetchPlans();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const removeFeature = (index: number) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated.length ? updated : [''] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการแพ็คสมาชิก</h1>
          <p className="text-gray-400">Discord Plans / Membership</p>
        </div>
        {!isAdding && !editingPlan && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            เพิ่มแพ็คใหม่
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingPlan) && (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingPlan ? 'แก้ไขแพ็ค' : 'เพิ่มแพ็คใหม่'}
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="ชื่อแพ็ค"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น Membership"
            />
            <Input
              type="number"
              label="ราคา (บาท)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ระยะเวลา</label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="month">รายเดือน</option>
                <option value="year">รายปี</option>
                <option value="lifetime">ตลอดชีพ</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">สี</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <ImageUpload
              value={formData.icon}
              onChange={(url) => setFormData({ ...formData, icon: url })}
              label="ไอคอน"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">คุณสมบัติ</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder="เช่น Loop Exclusive ทุกเพลง"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-400 hover:bg-white/10 rounded-lg"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                <PlusIcon className="w-4 h-4 mr-1" />
                เพิ่มคุณสมบัติ
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="ข้อความปุ่ม"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="เลือกแพ็คนี้"
            />
            <Input
              label="URL ปุ่ม"
              value={formData.buttonUrl}
              onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
              placeholder="https://discord.gg/..."
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span>ยอดนิยม (แสดง badge)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <span>เปิดใช้งาน</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              {editingPlan ? 'บันทึก' : 'เพิ่ม'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          let features: string[] = [];
          try {
            features = JSON.parse(plan.features);
          } catch {}

          return (
            <div
              key={plan.id}
              className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 relative"
              style={{ borderColor: plan.color + '40' }}
            >
              {plan.isPopular && (
                <span className="absolute top-2 right-2 px-2 py-1 text-xs bg-yellow-500 text-black rounded-full font-bold">
                  ยอดนิยม
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                {plan.icon && (
                  <img src={plan.icon} alt="" className="w-12 h-12 rounded-lg" />
                )}
                <div>
                  <h3 className="font-bold text-lg" style={{ color: plan.color }}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    ฿{plan.price} / {plan.period === 'month' ? 'เดือน' : plan.period === 'year' ? 'ปี' : 'ตลอดชีพ'}
                  </p>
                </div>
              </div>

              <ul className="space-y-1 text-sm text-gray-300 mb-4">
                {features.slice(0, 3).map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
                {features.length > 3 && (
                  <li className="text-gray-500">+{features.length - 3} อื่นๆ</li>
                )}
              </ul>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(plan)}
                  className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 inline mr-1" />
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && plans.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500">
          ยังไม่มีแพ็คสมาชิก กดปุ่ม &quot;เพิ่มแพ็คใหม่&quot; เพื่อเริ่มต้น
        </div>
      )}
    </div>
  );
}
