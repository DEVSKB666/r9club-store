'use client';

import { useState, useRef } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface DriveUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function DriveUpload({ 
  value, 
  onChange, 
  label = 'อัพโหลดไฟล์ (Google Drive)',
  accept = '.zip,.rar,.7z,.mp3,.wav,.flac'
}: DriveUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500MB for example, though server might limit less)
    if (file.size > 500 * 1024 * 1024) {
      swal.error('ไฟล์ใหญ่เกินไป (สูงสุด 500MB)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Fake progress for UX (since fetch doesn't support progress events natively easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 95));
      }, 500);

      const res = await fetch('/api/admin/upload/drive', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);
      onChange(data.url);
      swal.success('อัพโหลดขึ้น Google Drive สำเร็จ!');
    } catch (error: any) {
      swal.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearFile = () => {
    onChange('');
    setUploadProgress(0);
  };

  const getFileId = (url: string) => {
    if (url.startsWith('gdrive://')) {
      return url.replace('gdrive://', '');
    }
    return 'External Link';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-green-500/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
          
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <CheckCircleIcon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0 z-10">
            <p className="text-sm font-medium text-green-400 truncate">
              อัพโหลดบน Google Drive แล้ว
            </p>
            <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
              ID: {getFileId(value)}
            </p>
          </div>

          <button
            type="button"
            onClick={clearFile}
            className="p-2 z-20 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
            title="ลบไฟล์เพื่ออัพโหลดใหม่"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isUploading
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-white/20 hover:border-green-500/50 hover:bg-green-500/5'
          }`}
        >
          {isUploading ? (
            <div className="text-center w-full max-w-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin" />
              <p className="text-sm text-gray-300 mb-2">กำลังอัพโหลดไป Google Drive...</p>
              <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">อาจใช้เวลาสักครู่สำหรับไฟล์ขนาดใหญ่</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4 text-green-500">
                <CloudArrowUpIcon className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <DocumentIcon className="w-5 h-5" />
                <span className="font-medium">คลิกเพื่ออัพโหลด ZIP / Audio</span>
              </div>
              <p className="text-xs text-gray-500">รองรับไฟล์ขนาดใหญ่ (เก็บใน Google Drive)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
