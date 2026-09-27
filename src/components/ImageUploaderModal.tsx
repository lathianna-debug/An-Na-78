import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Palette,
  Layers,
  Lock,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { SystemSettings } from '../types.ts';
import { BACKGROUND_PRESETS, BackgroundPreset } from '../data/backgroundPresets.ts';

interface ImageUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'banner' | 'logo' | 'avatar' | 'question';
  currentImage?: string;
  onSuccess: (imageUrl: string, updatedSettings?: SystemSettings) => void;
  onResetOriginal?: () => void;
  isAdmin?: boolean;
}

export const ImageUploaderModal: React.FC<ImageUploaderModalProps> = ({
  isOpen,
  onClose,
  targetType = 'banner',
  currentImage = '',
  onSuccess,
  onResetOriginal,
  isAdmin = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url' | 'theme'>('preset');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  const [urlInput, setUrlInput] = useState<string>('');
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'original'>('contain');
  const [borderRadius, setBorderRadius] = useState<'rounded-none' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full'>('rounded-3xl');
  const [shadow, setShadow] = useState<'none' | 'shadow-md' | 'shadow-xl' | 'shadow-2xl'>('shadow-xl');
  const [selectedTheme, setSelectedTheme] = useState<'default' | 'royal-purple' | 'golden-tan-hai' | 'ocean-blue' | 'emerald-growth' | 'warm-sunset'>('default');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [presetCategory, setPresetCategory] = useState<string>('all');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentImage);
      setErrorMsg(null);
      setSuccessMsg(null);
      setSelectedPresetId('');
    }
  }, [isOpen, currentImage]);

  // Support Ctrl+V paste image from clipboard
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            handleFileProcess(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP, GIF, SVG)!');
      return;
    }

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp quá lớn! Vui lòng chọn ảnh dưới 15MB.');
      return;
    }

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    setFileInfo({
      name: file.name,
      size: sizeFormatted,
    });

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setSelectedPresetId('');
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file hình ảnh. Vui lòng thử lại!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Vui lòng nhập đường dẫn hình ảnh hợp lệ!');
      return;
    }
    setPreviewUrl(urlInput.trim());
    setSelectedPresetId('');
    setFileInfo({
      name: 'Liên kết hình ảnh trực tuyến',
      size: 'URL ngoài',
    });
    setErrorMsg(null);
  };

  const handleSelectPreset = (preset: BackgroundPreset) => {
    setPreviewUrl(preset.svgDataUri);
    setSelectedPresetId(preset.id);
    setFileInfo({
      name: preset.name,
      size: preset.badge,
    });
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (!previewUrl && targetType === 'banner') {
      setErrorMsg('Chưa có hình ảnh nào được chọn để lưu!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Save directly to server and persist locally
      const res = await api.changeBackground({
        image: previewUrl,
        useCustom: true,
        fitMode,
        borderRadius,
        shadow,
        backgroundTheme: selectedTheme,
        isTeacherAction: true,
        overrideLock: true,
        adminPassword: adminPasswordInput.trim() || undefined,
      });

      localStorage.setItem(`htcdn_custom_${targetType}`, previewUrl);
      localStorage.setItem('htcdn_use_custom_banner', 'true');
      setSuccessMsg('Đã chọn và áp dụng hình nền Cô An Na đã tải lên thành công!');
      setTimeout(() => {
        onSuccess(res.imageUrl || previewUrl, res.settings);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu hình ảnh. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Cô có chắc muốn khôi phục lại hình minh họa vector gốc chuẩn GDCD 9?')) {
      try {
        setIsSubmitting(true);
        if (isAdmin || adminPasswordInput.trim()) {
          const res = await api.changeBackground({
            image: '',
            useCustom: false,
            adminPassword: adminPasswordInput.trim() || undefined,
          });
          if (onResetOriginal) onResetOriginal();
          onSuccess('', res.settings);
        } else {
          localStorage.removeItem(`htcdn_custom_${targetType}`);
          localStorage.setItem('htcdn_use_custom_banner', 'false');
          if (onResetOriginal) onResetOriginal();
          onSuccess('');
        }
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Lỗi khi khôi phục!');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const filteredPresets = presetCategory === 'all'
    ? BACKGROUND_PRESETS
    : BACKGROUND_PRESETS.filter((p) => p.category === presetCategory);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-purple-200 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🎨
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-purple-100 text-[11px] font-bold mb-1">
                <span>TRƯỜNG THCS TÂN HẢI</span>
                <span>•</span>
                <span>MÔN GDCD 9</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                THAY ĐỔI HÌNH NỀN THEO YÊU CẦU
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Chọn mẫu có sẵn, tải ảnh từ máy hoặc dán trực tiếp (Ctrl+V)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'preset'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Thư viện mẫu GDCD 9 (Chọn 1 chạm)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'upload'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải tệp từ máy / Dán Ctrl+V</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'url'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Đường dẫn URL mạng</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition ${
              activeTab === 'theme'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4 text-emerald-600" />
            <span>Tông màu giao diện</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[62vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Select: Hình nền Cô An Na đã tải lên trước đó (nếu có) */}
          {typeof window !== 'undefined' && localStorage.getItem('htcdn_custom_banner') && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={localStorage.getItem('htcdn_custom_banner')!}
                  alt="Ảnh đã tải lên"
                  className="w-14 h-14 object-cover rounded-xl border-2 border-amber-400 shadow-xs"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900">
                    <span>✨</span>
                    <span>HÌNH NỀN CÔ AN NA ĐÃ TẢI LÊN</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Ảnh đang có sẵn trong bộ nhớ trình duyệt. Bấm nút để chọn và kích hoạt ngay.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const saved = localStorage.getItem('htcdn_custom_banner');
                  if (saved) {
                    setPreviewUrl(saved);
                    setSuccessMsg('Đã chọn hình nền Cô An Na đã tải lên! Bấm "Lưu & Áp dụng" bên dưới để hoàn tất.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
              >
                <span>✅</span>
                <span>Chọn ảnh này</span>
              </button>
            </div>
          )}

          {/* TAB 1: PRESET GALLERY */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold mr-1">Chủ đề:</span>
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'chuan', label: '🌟 Chuẩn GDCD 9' },
                  { key: 'phap_luat', label: '⚖️ Pháp luật & Kỷ luật' },
                  { key: 'tan_hai', label: '🏫 THCS Tân Hải' },
                  { key: 'to_quoc', label: '🇻🇳 Tự hào Tổ quốc' },
                  { key: 'dao_duc', label: '🌸 Đạo đức & Bác Hồ' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setPresetCategory(cat.key)}
                    className={`px-3 py-1 rounded-full font-bold transition text-[11px] ${
                      presetCategory === cat.key
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id || previewUrl === preset.svgDataUri;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group cursor-pointer rounded-2xl border-2 p-3 transition-all hover:scale-[1.01] ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-400'
                          : 'border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-2.5 border border-slate-200 bg-slate-900 shadow-inner">
                        <img
                          src={preset.svgDataUri}
                          alt={preset.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-amber-300 text-[10px] font-black backdrop-blur-xs">
                          {preset.badge}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-purple-700">
                            {preset.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {preset.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Chọn ảnh'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE / PASTE */}
          {activeTab === 'upload' && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Kéo thả hình ảnh vào đây hoặc <span className="text-purple-600 underline">bấm để duyệt tệp</span>
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    Hỗ trợ PNG, JPG, JPEG, WEBP, GIF, SVG (Tối đa 15MB)
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-purple-100 text-purple-700 text-[11px] font-bold shadow-xs">
                  <span>💡 Mẹo:</span>
                  <span>Cô có thể ấn <b>Ctrl+V</b> (hoặc <b>Cmd+V</b>) để dán ảnh trực tiếp từ Zalo/chụp màn hình</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: URL LINK */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Đường dẫn hình ảnh trực tuyến (URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/hinh-anh-minh-hoa.png"
                  className="flex-1 p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-purple-200"
                >
                  <Check className="w-4 h-4" />
                  <span>Xem thử</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Lưu ý: Đảm bảo đường dẫn hình ảnh có thể truy cập công khai không bị chặn bản quyền.
              </p>
            </div>
          )}

          {/* TAB 4: THEME SELECTION */}
          {activeTab === 'theme' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700">
                Chọn phong cách màu sắc giao diện tổng thể theo chủ đề:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'default', name: 'Mặc định Chuẩn GDCD 9', color: 'bg-gradient-to-r from-purple-700 to-indigo-600' },
                  { id: 'golden-tan-hai', name: 'Hoàng Kim THCS Tân Hải', color: 'bg-gradient-to-r from-amber-600 to-orange-600' },
                  { id: 'ocean-blue', name: 'Xanh Đại Dương Hòa Bình', color: 'bg-gradient-to-r from-sky-600 to-blue-700' },
                  { id: 'emerald-growth', name: 'Xanh Ngọc Trưởng Thành', color: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
                  { id: 'warm-sunset', name: 'Hồng Nhiệt Huyết Tuổi Trẻ', color: 'bg-gradient-to-r from-rose-600 to-pink-600' },
                  { id: 'royal-purple', name: 'Tím Hoàng Gia Quý Phái', color: 'bg-gradient-to-r from-purple-900 to-violet-800' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSelectedTheme(th.id as any)}
                    className={`p-3 rounded-2xl border-2 text-left transition ${
                      selectedTheme === th.id
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300'
                        : 'border-slate-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className={`h-6 rounded-lg ${th.color} mb-2 shadow-xs`} />
                    <span className="text-xs font-bold text-slate-800 block line-clamp-1">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Preview Box & Style Adjustments */}
          {previewUrl && (
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Xem trước hình ảnh thực tế trên trang chủ
                  </span>
                </div>

                {fileInfo && (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {fileInfo.name} ({fileInfo.size})
                  </span>
                )}
              </div>

              {/* Preview Box */}
              <div className="bg-gradient-to-br from-slate-100 to-purple-50/50 p-4 rounded-2xl flex items-center justify-center min-h-[190px] max-h-[280px] overflow-hidden border border-slate-200 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Xem trước hình ảnh"
                  className={`max-h-[240px] max-w-full transition-all duration-200 ${borderRadius} ${
                    shadow === 'none'
                      ? ''
                      : shadow === 'shadow-md'
                      ? 'shadow-md'
                      : shadow === 'shadow-2xl'
                      ? 'shadow-2xl ring-4 ring-purple-300/50'
                      : 'shadow-xl'
                  } ${
                    fitMode === 'contain'
                      ? 'object-contain'
                      : fitMode === 'cover'
                      ? 'object-cover w-full h-[210px]'
                      : ''
                  }`}
                />
              </div>

              {/* Style controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div>
                  <span className="block font-bold text-slate-600 mb-1">Chế độ hiển thị:</span>
                  <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        fitMode === 'contain' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Vừa vặn
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        fitMode === 'cover' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Lấp đầy
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('original')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        fitMode === 'original' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Cỡ gốc
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block font-bold text-slate-600 mb-1">Độ bo góc:</span>
                  <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setBorderRadius('rounded-none')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        borderRadius === 'rounded-none' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Vuông
                    </button>
                    <button
                      type="button"
                      onClick={() => setBorderRadius('rounded-2xl')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        borderRadius === 'rounded-2xl' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Bo vừa
                    </button>
                    <button
                      type="button"
                      onClick={() => setBorderRadius('rounded-3xl')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        borderRadius === 'rounded-3xl' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Bo tròn
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block font-bold text-slate-600 mb-1">Đổ bóng (3D):</span>
                  <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShadow('none')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        shadow === 'none' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Phẳng
                    </button>
                    <button
                      type="button"
                      onClick={() => setShadow('shadow-xl')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        shadow === 'shadow-xl' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Bóng đẹp
                    </button>
                    <button
                      type="button"
                      onClick={() => setShadow('shadow-2xl')}
                      className={`py-1 rounded-lg font-semibold transition ${
                        shadow === 'shadow-2xl' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Nổi bật
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Protection Section: If not logged in as Admin */}
          {!isAdmin && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Bảo mật hệ thống: Lưu vĩnh viễn cho toàn bộ học sinh</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Để áp dụng hình nền này cho tất cả học sinh Trường THCS Tân Hải, vui lòng nhập mật khẩu Quản trị Cô An Na (hoặc để trống nếu chỉ muốn xem thử):
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Mật khẩu Cô An Na (Annalhp1978)..."
                  className="p-2.5 rounded-xl border border-amber-300 bg-white text-xs w-full max-w-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-amber-600 font-semibold italic">
                  Chỉ Cô An Na mới có quyền thay đổi dữ liệu
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Khôi phục vector gốc</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !previewUrl}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ÁP DỤNG HÌNH NỀN MỚI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
