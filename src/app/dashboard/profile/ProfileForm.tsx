'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import swal from '@/lib/swal';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export function ProfileForm({ user }: { user: User | null }) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(user?.name || '');
  const [image, setImage] = useState(user?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'เกิดข้อผิดพลาด');
      }

      await update({ name, image }); // Sync session for Header update
      swal.success('บันทึกข้อมูลสำเร็จ!');
      setSuccess(true);
      router.refresh();
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      swal.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm">
          บันทึกข้อมูลสำเร็จ!
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <ImageUpload
          label="รูปโปรไฟล์"
          value={image}
          onChange={setImage}
          className="w-32 h-32 rounded-full overflow-hidden mx-auto border-2 border-white/20"
          fit="cover"
          placeholder="เปลี่ยนรูป"
        />
      </div>

      <Input
        label="ชื่อ"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อของคุณ"
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        บันทึกการเปลี่ยนแปลง
      </Button>
    </form>
  );
}
