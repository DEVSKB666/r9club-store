'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowUpTrayIcon, TrashIcon, PhotoIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import swal from '@/lib/swal';

interface Media {
  id: string;
  url: string;
  filename: string;
  size: number;
  alt?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/upload?limit=100');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch (error) {
      swal.error('ไม่สามารถโหลดรูปภาพได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      swal.success(`อัพโหลดสำเร็จ ${successCount} ไฟล์`);
      fetchMedia();
    }
    if (errorCount > 0) {
      swal.error(`อัพโหลดไม่สำเร็จ ${errorCount} ไฟล์`);
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('รูปภาพนี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/upload/${id}`, { method: 'DELETE' });
      if (res.ok) {
        swal.success('ลบสำเร็จ!');
        setMedia((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (error) {
      swal.error('ลบไม่สำเร็จ');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    swal.success('คัดลอก URL แล้ว!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-gray-400">จัดการรูปภาพและไฟล์สื่อ</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={isUploading}
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            อัพโหลดรูปภาพ
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-900/50 border border-white/10">
          <p className="text-sm text-gray-400">รูปภาพทั้งหมด</p>
          <p className="text-2xl font-bold mt-1">{media.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-gray-900/50 border border-white/10">
          <p className="text-sm text-gray-400">พื้นที่ใช้งาน</p>
          <p className="text-2xl font-bold mt-1">
            {formatFileSize(media.reduce((acc, m) => acc + m.size, 0))}
          </p>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : media.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-white/10"
            >
              <Image
                src={item.url}
                alt={item.alt || item.filename}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    title="คัดลอก URL"
                  >
                    <ClipboardIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 transition-colors"
                    title="ลบ"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="text-xs">
                  <p className="truncate">{item.filename}</p>
                  <p className="text-gray-400">{formatFileSize(item.size)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="w-20 h-20 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-500">ยังไม่มีรูปภาพ</p>
          <p className="text-sm text-gray-600 mt-1">กดอัพโหลดเพื่อเพิ่มรูปภาพ</p>
        </div>
      )}
    </div>
  );
}
