'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
}

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', image: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const url = editingId 
        ? `/api/admin/categories/${editingId}` 
        : '/api/admin/categories';
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editingId ? 'บันทึกสำเร็จ!' : 'เพิ่มหมวดหมู่สำเร็จ!');
      resetForm();
      router.refresh();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('หมวดหมู่นี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบหมวดหมู่สำเร็จ!');
      router.refresh();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          เพิ่มหมวดหมู่
        </Button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
          <h3 className="font-semibold mb-4">
            {editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
          </h3>
          
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ไอคอน/รูปภาพ</label>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />
            <p className="text-xs text-gray-500 mt-1">แนะนำ: รูปขนาด 100x100 พื้นหลังโปร่งใส (PNG)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Input
              label="ชื่อหมวดหมู่"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                });
              }}
              placeholder="เช่น Pop, Rock, Jazz"
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="pop, rock, jazz"
            />
          </div>
          <div className="mb-4">
            <Input
              label="รายละเอียด (ไม่บังคับ)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="คำอธิบายสั้นๆ"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {editingId ? 'บันทึก' : 'เพิ่ม'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ไอคอน</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ชื่อ</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Slug</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สินค้า</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain rounded-lg bg-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-500 text-xs">
                      -
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-gray-400">{cat.slug}</td>
                <td className="px-6 py-4 text-gray-400">{cat._count.products}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
                      disabled={cat._count.products > 0}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            ยังไม่มีหมวดหมู่
          </div>
        )}
      </div>
    </div>
  );
}
