import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FolderOpen, Image as ImageIcon } from 'lucide-react';

export interface MascotIllustrationProps {
  className?: string;
  customImage?: string;
  useCustom?: boolean;
  fitMode?: 'contain' | 'cover' | 'original';
  borderRadius?: string;
  shadow?: string;
  onOpenUploader?: () => void;
  onSelectFile?: (dataUrl: string) => void;
  canEdit?: boolean;
  isLocked?: boolean;
}

export const MascotIllustration: React.FC<MascotIllustrationProps> = ({
  className = '',
  customImage = '',
  useCustom = false,
  fitMode = 'contain',
  borderRadius = 'rounded-3xl',
  shadow = 'shadow-xl',
  onOpenUploader,
  onSelectFile,
  canEdit = false,
  isLocked = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If user selected to use custom image and it's present and valid
  const showCustomImage = useCustom && customImage && !imageError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onSelectFile) {
        setImageError(false);
        onSelectFile(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (!canEdit) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none group/mascot ${className}`}>
      {/* Hidden File Input for direct image picking from device */}
      {canEdit && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      )}

      {showCustomImage ? (
        <div className="relative w-full flex items-center justify-center overflow-hidden">
          <img
            src={customImage}
            alt="Hình nền Hành trình học tập GDCD 9"
            onError={() => setImageError(true)}
            className={`w-full max-w-2xl h-auto max-h-[440px] transition-all duration-300 ${
              fitMode === 'contain'
                ? 'object-contain'
                : fitMode === 'cover'
                ? 'object-cover w-full h-[380px]'
                : ''
            } ${borderRadius} ${
              shadow === 'none'
                ? ''
                : shadow === 'shadow-md'
                ? 'shadow-md'
                : shadow === 'shadow-2xl'
                ? 'shadow-2xl'
                : 'shadow-xl drop-shadow-xl'
            }`}
          />
        </div>
      ) : (
        /* Dignified, academic GDCD 9 Banner */
        <div
          onClick={canEdit ? triggerFileInput : undefined}
          className={`w-full max-w-2xl h-auto min-h-[240px] sm:min-h-[290px] rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border-2 border-indigo-400/40 shadow-2xl transition-all ${
            canEdit ? 'cursor-pointer hover:border-amber-400' : ''
          }`}
        >
          {/* Subtle background glow & grid */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Golden Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/50 text-amber-300 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MÔN GIÁO DỤC CÔNG DÂN 9 — TRƯỜNG THCS TÂN HẢI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md mb-2">
            🌟 HÀNH TRÌNH CÔNG DÂN NHÍ 9
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-md font-medium mb-3">
            Nền tảng học tập & rèn luyện phẩm chất công dân số chuẩn chương trình Khối 9
          </p>

          {/* Cô An Na Action Button when logged in */}
          {canEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-white/40 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-slate-950" />
              <span>📁 Bấm để chọn hình nền Cô An Na đã tải lên từ máy tính</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-purple-200 text-xs font-semibold border border-white/15">
              <span>🎒 5 Lớp: 9A8 – 9A9 – 9A10 – 9A11 – 9A12</span>
            </div>
          )}
        </div>
      )}

      {/* Control bar & Security Badge */}
      <div className="mt-3 w-full max-w-2xl flex flex-wrap items-center justify-between gap-2.5 px-2">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/95 text-amber-300 border-2 border-amber-400/80 shadow-md backdrop-blur-md flex items-center gap-2 text-xs font-black tracking-wide">
          <span className="text-sm">🔒</span>
          <span>
            {canEdit
              ? showCustomImage
                ? 'HÌNH NỀN CÔ AN NA • ĐÃ KHÓA CỐ ĐỊNH'
                : 'QUẢN TRỊ GIAO DIỆN BỞI CÔ AN NA'
              : 'GIAO DIỆN HỌC TẬP KHÓA AN TOÀN BỞI CÔ AN NA'}
          </span>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {/* Direct File Picker Button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-md text-xs font-black flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/30 cursor-pointer"
              title="Chọn ảnh nền đã tải lên từ máy tính hoặc điện thoại"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>📁 Chọn ảnh từ máy</span>
            </button>

            {/* Open Preset Selector Modal */}
            {onOpenUploader && (
              <button
                type="button"
                onClick={onOpenUploader}
                className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 shadow-sm transition cursor-pointer"
                title="Chọn từ thư viện mẫu chuẩn GDCD 9"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                <span>Kho mẫu</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
