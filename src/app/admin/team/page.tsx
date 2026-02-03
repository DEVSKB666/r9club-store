'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string | null;
  description: string | null;
  socialLinks: string | null;
  isActive: boolean;
  order: number;
}

interface SocialLinks {
  youtube?: string;
  facebook?: string;
  discord?: string;
  twitter?: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    description: '',
    socialLinks: {
      youtube: '',
      facebook: '',
      discord: '',
      twitter: '',
    } as SocialLinks,
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      image: '',
      description: '',
      socialLinks: {
        youtube: '',
        facebook: '',
        discord: '',
        twitter: '',
      },
      isActive: true,
      order: 0,
    });
    setEditingMember(null);
    setIsAdding(false);
  };

  const startEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsAdding(false);
    let socialLinks: SocialLinks = {};
    try {
      socialLinks = JSON.parse(member.socialLinks || '{}');
    } catch {}
    
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image || '',
      description: member.description || '',
      socialLinks: {
        youtube: socialLinks.youtube || '',
        facebook: socialLinks.facebook || '',
        discord: socialLinks.discord || '',
        twitter: socialLinks.twitter || '',
      },
      isActive: member.isActive,
      order: member.order,
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingMember 
        ? `/api/admin/team/${editingMember.id}` 
        : '/api/admin/team';
      
      const res = await fetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed');

      swal.success(editingMember ? 'บันทึกสำเร็จ!' : 'เพิ่มสมาชิกสำเร็จ!');
      resetForm();
      fetchMembers();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('สมาชิกนี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      swal.success('ลบสำเร็จ!');
      fetchMembers();
    } catch (error) {
      swal.error('เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการทีมงาน</h1>
          <p className="text-gray-400">Our Teams</p>
        </div>
        {!isAdding && !editingMember && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            เพิ่มสมาชิกใหม่
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingMember) && (
        <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6 space-y-4">
          <h3 className="font-semibold text-lg">
            {editingMember ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="รูปโปรไฟล์"
            />
            <div className="space-y-4">
              <Input
                label="ชื่อ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น FZ REMIX"
              />
              <Input
                label="ตำแหน่ง"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="เช่น DEVELOPER - LOOPS"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">คำอธิบาย</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white"
              placeholder="คำอธิบายเพิ่มเติม..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">โซเชียลมีเดีย</label>
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label="YouTube"
                value={formData.socialLinks.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
                placeholder="https://youtube.com/@..."
              />
              <Input
                label="Facebook"
                value={formData.socialLinks.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/..."
              />
              <Input
                label="Discord"
                value={formData.socialLinks.discord || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, discord: e.target.value }
                })}
                placeholder="Discord username"
              />
              <Input
                label="Twitter/X"
                value={formData.socialLinks.twitter || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                })}
                placeholder="https://x.com/..."
              />
            </div>
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
              {editingMember ? 'บันทึก' : 'เพิ่ม'}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ยกเลิก
            </Button>
          </div>
        </div>
      )}

      {/* Team Members Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {members.map((member) => {
          let socialLinks: SocialLinks = {};
          try {
            socialLinks = JSON.parse(member.socialLinks || '{}');
          } catch {}

          return (
            <div
              key={member.id}
              className="rounded-2xl bg-gray-900/50 border border-white/10 p-4 text-center"
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gray-700 flex items-center justify-center text-3xl">
                  {member.name.charAt(0)}
                </div>
              )}

              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-gray-400">{member.role}</p>

              {/* Social Icons */}
              <div className="flex justify-center gap-2 mt-2">
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" className="text-red-400 hover:text-red-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => startEdit(member)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="px-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && members.length === 0 && !isAdding && (
        <div className="text-center py-12 text-gray-500">
          ยังไม่มีสมาชิกในทีม กดปุ่ม &quot;เพิ่มสมาชิกใหม่&quot; เพื่อเริ่มต้น
        </div>
      )}
    </div>
  );
}
