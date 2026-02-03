'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';
import { useSession } from 'next-auth/react';

interface Media {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  createdAt?: string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  fit?: 'contain' | 'cover';
}

export function ImageUpload({ value, onChange, label, placeholder, className = '', fit = 'contain' }: ImageUploadProps) {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (keep all functions same until return)

  // Fetch media from API
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/upload?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open modal and fetch media
  const openModal = () => {
    setIsModalOpen(true);
    setSelectedImage(value || null);
    fetchMedia();
  };

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'อัพโหลดไม่สำเร็จ');
      }

      swal.success('อัพโหลดสำเร็จ!');
      setSelectedImage(data.media.url);
      fetchMedia();
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'อัพโหลดไม่สำเร็จ';
      swal.error(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete media
  const handleDelete = async (id: string) => {
    const confirmed = await swal.confirmDelete('รูปภาพนี้');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/upload/${id}`, { method: 'DELETE' });
      if (res.ok) {
        swal.success('ลบสำเร็จ!');
        // Remove from list
        setMedia((prev) => prev.filter((m) => m.id !== id));
        // Clear selection if deleted
        const deleted = media.find((m) => m.id === id);
        if (deleted && selectedImage === deleted.url) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      swal.error('ลบไม่สำเร็จ');
    }
  };

  // Confirm selection
  const handleSelect = () => {
    if (selectedImage) {
      onChange(selectedImage);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Preview / Trigger */}
      <div
        onClick={openModal}
        className={`relative group cursor-pointer rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500/50 transition-colors overflow-hidden ${className}`}
      >
        {value ? (
          <div className={`relative bg-gray-900 w-full h-full min-h-[150px] ${!className ? 'aspect-video' : ''}`}>
            <Image
              src={value}
              alt="Selected"
              fill
              className={`object-${fit}`}
              unoptimized
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm">คลิกเพื่อเปลี่ยน</span>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center gap-2 text-gray-500 w-full h-full min-h-[150px] ${!className ? 'aspect-video' : ''}`}>
            <PhotoIcon className="w-10 h-10" />
            <span className="text-sm">{placeholder || 'คลิกเพื่อเลือกรูปภาพ'}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">เลือกรูปภาพ</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Upload Button */}
            <div className="px-6 py-4 border-b border-white/10">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                {isUploading ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปใหม่'}
              </button>
            </div>

            {/* Gallery - Only show for ADMIN */}
            {session?.user?.role === 'ADMIN' ? (
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : media.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map((item) => (
                      <div
                        key={item.id}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                          selectedImage === item.url
                            ? 'border-primary-500 ring-2 ring-primary-500/50'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                        onClick={() => setSelectedImage(item.url)}
                      >
                        <Image
                          src={item.url}
                          alt={item.alt || item.filename}
                          fill
                          className="object-cover"
                          unoptimized
                        />

                        {/* Selected Check */}
                        {selectedImage === item.url && (
                          <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <CheckIcon className="w-4 h-4 text-white" />
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>ยังไม่มีรูปภาพ</p>
                    <p className="text-sm mt-1">กดอัพโหลดเพื่อเพิ่มรูปภาพ</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>กดปุ่ม &quot;อัพโหลดรูปใหม่&quot; ด้านบนเพื่อเพิ่มรูปภาพ</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedImage}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                เลือกรูปนี้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
