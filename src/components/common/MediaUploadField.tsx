import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, X, Check, FileText, AlertCircle, RefreshCw, Link as LinkIcon, Sparkles } from 'lucide-react';

export interface MediaUploadFieldProps {
  value: string;
  onChange: (value: string, fileInfo?: { name: string; size: number; type: string }) => void;
  label?: string;
  description?: string;
  accept?: string;
  mediaType?: 'all' | 'image' | 'video';
  maxSizeMB?: number;
  allowUrlFallback?: boolean;
  required?: boolean;
  className?: string;
}

export const MediaUploadField: React.FC<MediaUploadFieldProps> = ({
  value,
  onChange,
  label = 'Upload Foto / Video Media:',
  description = 'Pilih file foto atau video dari perangkat Anda (PNG, JPG, WEBP, MP4, WEBM). Mendukung drag & drop.',
  accept = 'image/*,video/*',
  mediaType = 'all',
  maxSizeMB = 25,
  allowUrlFallback = true,
  required = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = (url: string) => {
    if (!url) return false;
    return (
      url.startsWith('data:video/') ||
      url.endsWith('.mp4') ||
      url.endsWith('.webm') ||
      url.endsWith('.mov') ||
      url.endsWith('.mkv') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be')
    );
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const processFile = (file: File) => {
    setUploadError(null);

    // Validate size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`Ukuran file terlalu besar! Maksimal ${maxSizeMB}MB (Ukuran file Anda: ${formatFileSize(file.size)}).`);
      return;
    }

    // Validate type if constrained
    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      setUploadError('Hanya file foto/gambar yang diizinkan (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      setUploadError('Hanya file video yang diizinkan (MP4, WEBM, MOV).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFileDetails({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type || (file.name.split('.').pop()?.toUpperCase() || 'FILE')
        });
        onChange(result, {
          name: file.name,
          size: file.size,
          type: file.type
        });
      }
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca file dari perangkat. Silakan coba lagi.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileDetails(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          {mediaType === 'video' ? (
            <Video className="w-3.5 h-3.5 text-cyan-400" />
          ) : mediaType === 'image' ? (
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>

        {allowUrlFallback && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📁 Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                activeMode === 'url'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔗 URL Link
            </button>
          </div>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-400 leading-tight">
          {description}
        </p>
      )}

      {/* Main Upload Dropzone Area */}
      {activeMode === 'upload' ? (
        <div className="space-y-2">
          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-purple-400 bg-purple-950/40 scale-[1.01]'
                  : 'border-slate-700 hover:border-purple-500 bg-slate-950/80 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-white">
                    <span className="text-purple-400 underline">Klik untuk memilih</span> atau seret file ke sini
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Foto (JPG, PNG, WEBP) atau Video (MP4, WEBM) • Maksimal {maxSizeMB}MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Media Preview Box */
            <div className="bg-slate-950 border-2 border-purple-500/50 rounded-2xl p-3 space-y-3 shadow-xl">
              <div className="relative rounded-xl overflow-hidden bg-black/80 flex items-center justify-center min-h-[140px] max-h-[220px]">
                {isVideo(value) && !isYouTube(value) ? (
                  <video
                    src={value}
                    controls
                    className="w-full max-h-[220px] object-contain rounded-xl"
                  />
                ) : isYouTube(value) ? (
                  <div className="p-4 text-center space-y-2">
                    <Video className="w-8 h-8 text-red-500 mx-auto" />
                    <p className="text-xs font-mono text-slate-300 break-all">{value}</p>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-bold rounded">
                      Video YouTube Terpasang
                    </span>
                  </div>
                ) : (
                  <img
                    src={value}
                    alt="Preview Media"
                    className="w-full max-h-[220px] object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Ganti File"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-slate-300 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                    title="Hapus File"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              {/* File Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    <span>File Siap Digunakan</span>
                  </span>
                  {fileDetails && (
                    <span className="text-[11px] text-slate-300 font-mono font-medium truncate max-w-[180px]">
                      {fileDetails.name} ({fileDetails.size})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                >
                  Ganti Foto / Video
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      ) : (
        /* Direct URL Input Mode */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... (Masukkan URL foto / video)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
            <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {value && (
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                {isVideo(value) ? (
                  <Video className="w-5 h-5 text-cyan-400" />
                ) : (
                  <img src={value} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] text-slate-300 font-mono truncate block">{value}</span>
                <span className="text-[9px] text-emerald-400 font-bold">Pratinjau URL Terhubung</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
