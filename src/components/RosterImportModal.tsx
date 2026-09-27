import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Users,
  RefreshCw,
  ClipboardList,
  Sparkles,
  Camera,
  Layers,
  Check,
  Edit2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../lib/api.ts';

interface ParsedStudent {
  stt?: number;
  name: string;
  class: string;
}

interface RosterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialClass?: string;
}

export const ALL_TARGET_CLASSES = [
  '9A8',
  '9A9',
  '9A10',
  '9A11',
  '9A12',
];

const SAMPLE_50_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bảo Ngọc', 'Lê Hoàng Long', 'Phạm Minh Châu', 'Vũ Đức Hải',
  'Đặng Quỳnh Như', 'Bùi Tuấn Kiệt', 'Ngô Mai Phương', 'Hoàng Gia Bảo', 'Đỗ Thùy Linh',
  'Dương Quốc Anh', 'Lý Hải Yến', 'Phan Thanh Tùng', 'Hồ Ngọc Mai', 'Võ Trọng Nghĩa',
  'Trịnh Hoài Nam', 'Mai Phương Thảo', 'Lương Anh Dũng', 'Đinh Thảo Nguyên', 'Cao Minh Trí',
  'Nguyễn Thị Kim Ngân', 'Trần Đức Phúc', 'Lê Minh Khôi', 'Phạm Thu Trang', 'Vũ Gia Huy',
  'Đặng Phương Anh', 'Bùi Nhật Minh', 'Ngô Đăng Khoa', 'Hoàng Khánh Linh', 'Đỗ Quang Huy',
  'Dương Bảo Châu', 'Lý Thành Đạt', 'Phan Ngọc Hân', 'Hồ Đăng Quang', 'Võ Hoàng Yến',
  'Trịnh Quốc Cường', 'Mai Diệu Huyền', 'Lương Tuấn Tú', 'Đinh Hồng Hạnh', 'Cao Bá Quát',
  'Nguyễn Tiến Đạt', 'Trần Khánh Vy', 'Lê Hữu Phước', 'Phạm Ngọc Ánh', 'Vũ Thiên An',
  'Đặng Hữu Tài', 'Bùi Hà My', 'Ngô Kiến Huy', 'Hoàng Yến Nhi', 'Đỗ Trọng Nhân'
];

export const RosterImportModal: React.FC<RosterImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialClass,
}) => {
  const [targetClass, setTargetClass] = useState<string>(
    initialClass && initialClass !== 'ALL' ? initialClass : '9A8'
  );
  const [tab, setTab] = useState<'image' | 'excel' | 'paste'>('image');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace_class' | 'append' | 'replace'>('replace_class');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Image AI parsing states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiParsing, setAiParsing] = useState(false);
  const [aiStatusText, setAiStatusText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialClass && initialClass !== 'ALL') {
      setTargetClass(initialClass);
    }
  }, [initialClass]);

  // Support pasting image directly from clipboard (Ctrl+V) anywhere in modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleSelectImageFile(file);
            setTab('image');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectImageFile = (file: File) => {
    setImageFile(file);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiImageOcr = async () => {
    if (!imagePreview) {
      setErrorMsg('Vui lòng chọn hoặc dán ảnh chụp bảng danh sách học sinh.');
      return;
    }

    setAiParsing(true);
    setAiStatusText('Đang gửi ảnh bảng điểm đến AI Gemini để quét danh sách...');
    setErrorMsg(null);

    try {
      setAiStatusText('AI Gemini đang nhận diện STT, Họ và tên học sinh theo thứ tự bảng...');
      const res = await api.parseRosterImage(imagePreview);

      if (res && res.students && res.students.length > 0) {
        const mapped: ParsedStudent[] = res.students.map((st, idx) => ({
          stt: typeof st.stt === 'number' ? st.stt : idx + 1,
          name: st.name.trim(),
          class: targetClass,
        }));
        // Sort strictly by STT
        mapped.sort((a, b) => (a.stt || 0) - (b.stt || 0));
        setParsedStudents(mapped);
        setAiStatusText(`✅ Đã quét thành công ${mapped.length} học sinh theo đúng thứ tự!`);
      } else {
        setErrorMsg('AI không tìm thấy danh sách học sinh rõ ràng từ ảnh này. Cô vui lòng kiểm tra lại ảnh chụp hoặc sử dụng tab Dán văn bản.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi phân tích ảnh bằng AI Gemini.');
    } finally {
      setAiParsing(false);
    }
  };

  // Generate and download sample Excel file for the chosen class
  const handleDownloadSampleForClass = (clsName: string) => {
    const sampleData = SAMPLE_50_NAMES.map((name, idx) => ({
      'STT': idx + 1,
      'Họ và tên': name,
      'Lớp': clsName,
      'BÀI 1': '',
      'BÀI 2': '',
      'BÀI 3': '',
      'BÀI 4': '',
      'BÀI 5': '',
      'BÀI 6': '',
      'BÀI 7': '',
      'BÀI 8': '',
      'BÀI 9': '',
      'BÀI 10': '',
    }));

    const ws = XLSX.utils.json_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Lop_${clsName}`);
    XLSX.writeFile(wb, `DanhSach_HocSinh_Mau_Lop_${clsName}_THCS_TanHai.xlsx`);
  };

  // Handle Excel file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rows.length < 2) {
        setErrorMsg('File Excel không có dữ liệu hoặc chỉ có dòng tiêu đề.');
        setIsProcessing(false);
        return;
      }

      // Find column indices
      const headerRow = rows[0] as any[];
      let sttIdx = -1;
      let nameIdx = -1;
      let classIdx = -1;

      headerRow.forEach((cell, idx) => {
        const text = String(cell || '').trim().toLowerCase();
        if (text === 'stt' || text === 'số thứ tự' || text === 'no') sttIdx = idx;
        if (text.includes('họ') || text.includes('tên') || text.includes('name')) nameIdx = idx;
        if (text === 'lớp' || text === 'class' || text === 'lớp học') classIdx = idx;
      });

      if (nameIdx === -1) {
        for (let r = 1; r < Math.min(5, rows.length); r++) {
          if (rows[r] && rows[r].length >= 2) {
            nameIdx = 1;
            sttIdx = 0;
            break;
          }
        }
      }

      if (nameIdx === -1) {
        nameIdx = 0;
      }

      const extracted: ParsedStudent[] = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const rawName = String(row[nameIdx] || '').trim();
        if (!rawName || rawName.length < 2) continue;

        const rawSTT = sttIdx !== -1 ? parseInt(String(row[sttIdx]), 10) : extracted.length + 1;
        const rawClass = classIdx !== -1 && row[classIdx] ? String(row[classIdx]).trim().toUpperCase() : targetClass;

        extracted.push({
          stt: isNaN(rawSTT) ? extracted.length + 1 : rawSTT,
          name: rawName,
          class: rawClass || targetClass,
        });
      }

      extracted.sort((a, b) => (a.stt || 0) - (b.stt || 0));

      if (extracted.length === 0) {
        setErrorMsg('Không tìm thấy học sinh nào trong file Excel.');
      } else {
        setParsedStudents(extracted);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file (.xlsx, .xls, .csv).');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle parsing pasted text
  const handleParsePasteText = () => {
    if (!pasteText.trim()) {
      setErrorMsg('Vui lòng dán danh sách học sinh vào ô bên dưới.');
      return;
    }

    const lines = pasteText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const list: ParsedStudent[] = [];

    lines.forEach((line, idx) => {
      let raw = line.trim();
      let extractedStt = idx + 1;

      // Check leading number like "1.", "1 -", "01\t", "1 "
      const numMatch = raw.match(/^(\d+)[\.\-\:\)\s\t]+/);
      if (numMatch) {
        extractedStt = parseInt(numMatch[1], 10);
        raw = raw.replace(/^(\d+)[\.\-\:\)\s\t]+/, '').trim();
      }

      // Check class token like "9A8", "9A9", etc.
      let foundClass = targetClass;
      const classMatch = raw.match(/\b(9A\d+)\b/i);
      if (classMatch) {
        foundClass = classMatch[1].toUpperCase();
        raw = raw.replace(classMatch[0], '').replace(/[\-\,\:\t]+/g, ' ').trim();
      }

      const cleanName = raw.replace(/^[\-\*•\d\.\s]+/, '').trim();
      if (cleanName.length >= 2) {
        list.push({
          stt: extractedStt,
          name: cleanName,
          class: foundClass,
        });
      }
    });

    list.sort((a, b) => (a.stt || 0) - (b.stt || 0));

    if (list.length === 0) {
      setErrorMsg('Không thể trích xuất tên học sinh từ nội dung vừa dán.');
    } else {
      setParsedStudents(list);
      setErrorMsg(null);
    }
  };

  const handleUpdateStudentName = (index: number, newName: string) => {
    setParsedStudents((prev) =>
      prev.map((st, i) => (i === index ? { ...st, name: newName } : st))
    );
  };

  const handleRemoveStudent = (index: number) => {
    setParsedStudents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmImport = async () => {
    if (parsedStudents.length === 0) {
      setErrorMsg('Chưa có học sinh nào được nạp vào danh sách.');
      return;
    }

    if (
      importMode === 'replace_class' &&
      !window.confirm(
        `XÁC NHẬN NẠP VÀO LỚP ${targetClass}:\n\nHệ thống sẽ nạp ${parsedStudents.length} học sinh theo đúng thứ tự (STT 1 → ${parsedStudents.length}) vào LỚP ${targetClass}.\n\nCô có chắc chắn muốn nạp không?`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await api.bulkImportStudents({
        students: parsedStudents,
        mode: importMode,
        targetClass: targetClass,
      });

      onSuccess(res.message);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi nạp danh sách học sinh lên máy chủ.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight uppercase flex items-center gap-2">
                <span>NẠP DANH SÁCH HỌC SINH THEO BẢNG</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-mono">LỚP {targetClass}</span>
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                Quét từ ảnh chụp bảng điểm bằng AI Gemini • Tải file Excel • Hoặc dán danh sách
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 🎯 Class Selector */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>1. CHỌN LỚP CẦN NẠP DANH SÁCH:</span>
              </label>
              <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-xl border border-indigo-200">
                Đang chọn: Lớp {targetClass}
              </span>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                Các lớp Khối 9:
              </span>
              {ALL_TARGET_CLASSES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTargetClass(c)}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    targetClass === c
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-300 ring-2 ring-indigo-400'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  Lớp {c}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Method tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTab('image')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
                  tab === 'image'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>📸 Quét từ Ảnh chụp bảng (AI Gemini)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('paste')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  tab === 'paste'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>📋 Dán danh sách văn bản (STT & Họ tên)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('excel')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                  tab === 'excel'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📁 Tải file Excel (.xlsx, .csv)</span>
              </button>
            </div>

            {/* TAB 1: IMAGE OCR VIA AI GEMINI */}
            {tab === 'image' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSelectImageFile(f);
                  }}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
                  >
                    <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl shadow-inner">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        Bấm để tải ảnh bảng điểm lớp {targetClass} lên hoặc Nhấn Ctrl + V để Dán ảnh
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Hỗ trợ ảnh chụp điện thoại, ảnh chụp màn hình, ảnh bảng điểm từ Word/Excel/sổ điểm
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm">
                      Chọn file ảnh từ máy
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          {imageFile ? imageFile.name : 'Ảnh bảng điểm đã chọn'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                        >
                          Đổi ảnh khác
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="max-h-60 overflow-hidden rounded-2xl border border-slate-300 bg-slate-900/5 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview Bảng điểm"
                        className="max-h-60 object-contain w-auto rounded-xl"
                      />
                    </div>

                    {/* AI OCR button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-slate-500">
                        {aiStatusText || 'Bấm nút bên cạnh để AI tự động bóc tách từng số thứ tự và họ tên học sinh:'}
                      </p>
                      <button
                        type="button"
                        onClick={handleRunAiImageOcr}
                        disabled={aiParsing}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-amber-200 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className={`w-4 h-4 text-yellow-300 ${aiParsing ? 'animate-spin' : ''}`} />
                        <span>{aiParsing ? 'AI Đang quét & nhận diện...' : '✨ BẮT ĐẦU QUÉT BẢNG BẰNG AI'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TEXTAREA PASTE */}
            {tab === 'paste' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Dán danh sách mỗi học sinh 1 dòng (ví dụ: "1. Nguyễn Văn An" hoặc "Trần Thị Bình"):</span>
                </div>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`1. Nguyễn Văn An\n2. Trần Thị Bảo Ngọc\n3. Lê Hoàng Long\n...`}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 outline-none text-xs sm:text-sm font-mono leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleParsePasteText}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Trích xuất danh sách vừa dán vào Lớp {targetClass}</span>
                </button>
              </div>
            )}

            {/* TAB 3: EXCEL UPLOAD */}
            {tab === 'excel' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {fileName ? (
                        <span className="text-emerald-700 font-black">📄 {fileName}</span>
                      ) : (
                        `Bấm để chọn file Excel danh sách học sinh Lớp ${targetClass}`
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Hỗ trợ các định dạng .xlsx, .xls, .csv</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <span className="text-slate-600">Hoặc tải file Excel mẫu chuẩn:</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadSampleForClass(targetClass)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải mẫu Lớp {targetClass}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ⚠️ Error message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 📋 PREVIEW PARSED STUDENTS TABLE */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DANH SÁCH {parsedStudents.length} HỌC SINH SẼ NẠP VÀO LỚP {targetClass}:</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {parsedStudents.length} em học sinh
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 sticky top-0 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2 px-3 text-center w-12">STT</th>
                      <th className="py-2 px-4">Họ và tên</th>
                      <th className="py-2 px-3 text-center w-20">Lớp</th>
                      <th className="py-2 px-3 text-right w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedStudents.map((st, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-slate-500 font-mono">
                          {st.stt || i + 1}
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={st.name}
                            onChange={(e) => handleUpdateStudentName(i, e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                            {st.class}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(i)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ⚙️ Import Mode Options */}
          {parsedStudents.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-black uppercase text-slate-700 block">
                Chế độ nạp danh sách:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition ${
                    importMode === 'replace_class'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace_class'}
                    onChange={() => setImportMode('replace_class')}
                    className="mt-0.5 text-amber-600"
                  />
                  <div>
                    <p className="font-bold">Làm mới danh sách riêng Lớp {targetClass} (Khuyên dùng)</p>
                    <p className="text-[11px] font-normal text-slate-500">
                      Chỉ cập nhật danh sách lớp {targetClass}, không ảnh hưởng các lớp khác.
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-start gap-2 cursor-pointer transition ${
                    importMode === 'append'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="mt-0.5 text-emerald-600"
                  />
                  <div>
                    <p className="font-bold">Thêm vào danh sách hiện tại</p>
                    <p className="text-[11px] font-normal text-slate-500">
                      Giữ nguyên học sinh cũ và thêm các học sinh mới này vào.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedStudents.length === 0 || isProcessing}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-amber-200 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ĐANG NẠP LÊN MÁY CHỦ...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>LƯU {parsedStudents.length > 0 ? `${parsedStudents.length} HỌC SINH` : ''} VÀO LỚP {targetClass}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
