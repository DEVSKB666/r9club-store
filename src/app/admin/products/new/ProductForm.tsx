'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AudioUpload } from '@/components/ui/AudioUpload';
import { DriveUpload } from '@/components/ui/DriveUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    title: string;
    artist: string;
    description: string | null;
    price: number;
    coverImage: string;
    sampleAudioUrl: string | null;
    fullAudioUrl: string;
    categoryId: string | null;
    isActive: boolean;
    isFeatured: boolean;
  };
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: product?.title || '',
    artist: product?.artist || '',
    description: product?.description || '',
    price: product?.price || 0,
    coverImage: product?.coverImage || '',
    sampleAudioUrl: product?.sampleAudioUrl || '',
    fullAudioUrl: product?.fullAudioUrl || '',
    categoryId: product?.categoryId || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.coverImage) {
      setError('กรุณาอัพโหลดรูปปก');
      setIsLoading(false);
      return;
    }

    if (!formData.sampleAudioUrl) {
      setError('กรุณาอัพโหลดไฟล์เสียงตัวอย่าง');
      setIsLoading(false);
      return;
    }

    if (!formData.fullAudioUrl) {
      setError('กรุณาอัพโหลดไฟล์เสียงฉบับเต็ม');
      setIsLoading(false);
      return;
    }

    try {
      const url = product 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products';
      
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-6">
        <h2 className="font-semibold border-b border-white/10 pb-4">ข้อมูลทั่วไป</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="ชื่อเพลง *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="ชื่อเพลง"
          />
          <Input
            label="ศิลปิน *"
            value={formData.artist}
            onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
            required
            placeholder="ชื่อศิลปิน"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">รายละเอียด</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="รายละเอียดเพลง..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            type="number"
            label="ราคา (บาท) *"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
            min={0}
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">หมวดหมู่</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-6">
        <h2 className="font-semibold border-b border-white/10 pb-4">รูปปก</h2>
        
        <ImageUpload
          value={formData.coverImage}
          onChange={(url) => setFormData({ ...formData, coverImage: url })}
          label="รูปปกอัลบั้ม *"
          placeholder="เลือกหรืออัพโหลดรูปปก"
        />
      </div>

      {/* Audio Files */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-6">
        <h2 className="font-semibold border-b border-white/10 pb-4">ไฟล์เสียง</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <AudioUpload
            value={formData.sampleAudioUrl}
            onChange={(url) => setFormData({ ...formData, sampleAudioUrl: url })}
            label="ไฟล์เสียงตัวอย่าง (Preview) *"
          />
          <DriveUpload
            value={formData.fullAudioUrl}
            onChange={(url: string) => setFormData({ ...formData, fullAudioUrl: url })}
            label="ไฟล์ดาวน์โหลด (Audio / ZIP) *"
            accept=".mp3,.wav,.flac,.zip,.rar,.7z"
          />
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>หมายเหตุ:</strong> ไฟล์เสียงตัวอย่างจะใช้สำหรับเล่นฟังก่อนซื้อ ส่วนไฟล์ฉบับเต็มจะได้หลังชำระเงินเท่านั้น
          </p>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-6">
        <h2 className="font-semibold border-b border-white/10 pb-4">ตั้งค่า</h2>
        
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
            />
            <span>เปิดขาย</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
            />
            <span>แนะนำ (Featured)</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          ยกเลิก
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
        </Button>
      </div>
    </form>
  );
}
