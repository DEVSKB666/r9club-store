'use client';

import { useState, useRef } from 'react';
import { MusicalNoteIcon, ArrowUpTrayIcon, XMarkIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import swal from '@/lib/swal';

interface AudioUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export function AudioUpload({ 
  value, 
  onChange, 
  label = 'อัพโหลดไฟล์เสียง',
  accept = 'audio/*'
}: AudioUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      swal.error('กรุณาเลือกไฟล์เสียงเท่านั้น');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      swal.error('ไฟล์ใหญ่เกินไป (สูงสุด 50MB)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'audio');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch('/api/upload', {
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
      swal.success('อัพโหลดสำเร็จ!');
    } catch (error: any) {
      swal.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const clearAudio = () => {
    onChange('');
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Get filename from URL
  const getFilename = (url: string) => {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-white/10">
          {/* Play button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {getFilename(value)}
            </p>
            <p className="text-xs text-gray-400">คลิกเล่นเพื่อทดสอบ</p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={clearAudio}
            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={value}
            onEnded={handleAudioEnded}
          />
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isUploading
              ? 'border-primary-500/50 bg-primary-500/10'
              : 'border-white/20 hover:border-primary-500/50 hover:bg-white/5'
          }`}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
              <p className="text-sm text-gray-400">กำลังอัพโหลด... {uploadProgress}%</p>
              <div className="w-48 h-2 mt-2 rounded-full bg-gray-700 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                <MusicalNoteIcon className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex items-center gap-2 text-primary-400 mb-2">
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span className="font-medium">คลิกเพื่ออัพโหลด</span>
              </div>
              <p className="text-xs text-gray-500">รองรับ MP3, WAV, OGG (สูงสุด 50MB)</p>
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
