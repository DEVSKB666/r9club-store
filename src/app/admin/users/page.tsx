'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import swal from '@/lib/swal';
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  creditBalance: number;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');
  const [addCredit, setAddCredit] = useState('');
  const [creditReason, setCreditReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      swal.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name || '');
    setEditRole(user.role);
    setAddCredit('');
    setCreditReason('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setEditName('');
    setEditRole('USER');
    setAddCredit('');
    setCreditReason('');
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          addCredit: addCredit ? parseFloat(addCredit) : 0,
          creditReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      swal.success('อัปเดตข้อมูลสำเร็จ!');
      closeModal();
      fetchUsers();
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    const confirmed = await swal.confirm(
      `ลบผู้ใช้ ${user.name || user.email}?`,
      'การดำเนินการนี้ไม่สามารถย้อนกลับได้'
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      swal.success('ลบผู้ใช้สำเร็จ!');
      fetchUsers();
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
    }
  };

  const formatPrice = (price: number) => `฿${price.toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">จัดการผู้ใช้งาน</h1>
        <p className="text-gray-400">ผู้ใช้ทั้งหมด {users.length} คน</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-gray-900/50 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ผู้ใช้</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">เครดิต</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">คำสั่งซื้อ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">สมัครเมื่อ</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.name || '-'}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      {formatPrice(user.creditBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {user._count.orders} รายการ
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="แก้ไข"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="ลบ"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            ยังไม่มีผู้ใช้งาน
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-gray-900 rounded-2xl border border-white/10 w-full max-w-md p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">แก้ไขผู้ใช้</h2>
              <button 
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                {selectedUser.name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{selectedUser.name || '-'}</p>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <Input
                label="ชื่อ"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="ชื่อผู้ใช้"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('USER')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                      editRole === 'USER'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    USER
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('ADMIN')}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                      editRole === 'ADMIN'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    ADMIN
                  </button>
                </div>
              </div>

              {/* Credit Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <PlusIcon className="w-5 h-5 text-green-400" />
                  <span className="font-medium">เพิ่มเครดิต</span>
                  <span className="text-sm text-gray-400">
                    (ปัจจุบัน: {formatPrice(selectedUser.creditBalance)})
                  </span>
                </div>
                
                <Input
                  type="number"
                  label="จำนวนเงิน (บาท)"
                  value={addCredit}
                  onChange={(e) => setAddCredit(e.target.value)}
                  placeholder="0"
                  min="0"
                />

                <div className="mt-3">
                  <Input
                    label="หมายเหตุ (ไม่บังคับ)"
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="เหตุผลในการเพิ่มเครดิต"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="flex-1"
              >
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
