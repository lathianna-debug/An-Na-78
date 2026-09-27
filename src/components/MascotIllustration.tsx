import React, { useState } from 'react';

export const PERMANENT_LOCKED_BANNER = '/uploads/banner_1790495237357_fdc4121b.png';
export const FALLBACK_LOCKED_BANNER = '/banner_co_an_na.png';

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
  fitMode = 'contain',
  borderRadius = 'rounded-3xl',
  shadow = 'shadow-xl',
}) => {
  // Always prioritize the locked custom image chosen by Cô An Na
  const initialSource = customImage && customImage.trim() ? customImage : PERMANENT_LOCKED_BANNER;
  const [imgSource, setImgSource] = useState<string>(initialSource);

  // Sync if prop changes to another valid url
  React.useEffect(() => {
    if (customImage && customImage.trim()) {
      setImgSource(customImage);
    }
  }, [customImage]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 🖼️ KHÓA CỐ ĐỊNH HÌNH NỀN CÔ AN NA ĐÃ THAY (KHÔNG HIỂN THỊ HÌNH CŨ) */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        <img
          src={imgSource}
          alt="Hình nền Hành trình Công dân nhí 9 - Trường THCS Tân Hải"
          onError={() => {
            if (imgSource !== FALLBACK_LOCKED_BANNER) {
              setImgSource(FALLBACK_LOCKED_BANNER);
            }
          }}
          className={`w-full max-w-2xl h-auto max-h-[460px] transition-all duration-300 ${
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

      {/* 🔒 Huy hiệu Khóa cố định bảo vệ bản quyền giao diện của Cô An Na */}
      <div className="mt-3 w-full max-w-2xl flex items-center justify-center px-2">
        <div className="px-4 py-1.5 rounded-full bg-slate-900/95 text-amber-300 border-2 border-amber-400/80 shadow-md backdrop-blur-md flex items-center gap-2 text-xs font-black tracking-wide">
          <span className="text-sm">🔒</span>
          <span>HÌNH NỀN CHÍNH THỨC CỦA CÔ AN NA • ĐÃ KHÓA CỐ ĐỊNH</span>
        </div>
      </div>
    </div>
  );
};
