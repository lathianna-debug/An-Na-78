import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  School,
  Edit2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  UserCheck,
  Calendar,
  X,
  History,
  GitMerge,
  Filter,
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import { ClassGrade9, Student } from '../types.ts';
import { api } from '../lib/api.ts';
import { RosterImportModal } from './RosterImportModal.tsx';
import { getAll250PresetStudents, getPresetStudentsForClass, CLASS_NAMES } from '../data/classRosterPresets.ts';

export const ALL_CLASSES: ClassGrade9[] = [
  '9A8',
  '9A9',
  '9A10',
  '9A11',
  '9A12',
];

interface StudentManagementViewProps {
  onViewHistory?: (studentId: string) => void;
  initialOpenImport?: boolean;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({ onViewHistory, initialOpenImport }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [trashStudents, setTrashStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [filterDuplicatesOnly, setFilterDuplicatesOnly] = useState(false);

  // Modals
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [importTargetClass, setImportTargetClass] = useState<string>('9A8');
  const [editFormData, setEditFormData] = useState<{ name: string; className: ClassGrade9 }>({
    name: '',
    className: '9A8',
  });

  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);
  const [permanentDeleteConfirmStudent, setPermanentDeleteConfirmStudent] = useState<Student | null>(null);

  // Merge modal
  const [mergeSourceStudent, setMergeSourceStudent] = useState<Student | null>(null);
  const [mergeTargetStudentId, setMergeTargetStudentId] = useState<string>('');
  const [merging, setMerging] = useState(false);

  // Auto clean state
  const [cleaning, setCleaning] = useState(false);
  const [showRosterImportModal, setShowRosterImportModal] = useState(initialOpenImport || false);
  const [isResettingAll, setIsResettingAll] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleResetAllStudents = async () => {
    const confirmation = window.prompt(
      '⚠️ CẢNH BÁO QUAN TRỌNG TỪ HỆ THỐNG:\n\nCô An Na đang yêu cầu XÓA VÀ LÀM MỚI LẠI TOÀN BỘ dữ liệu thông tin học sinh, bài làm và lịch sử học tập để chuẩn bị nạp danh sách mới từ nhà trường.\n\nHành động này sẽ dọn dẹp sạch toàn bộ học sinh hiện có.\n\nNếu Cô chắc chắn, vui lòng nhập chữ "XOA" vào ô bên dưới rồi nhấn OK:'
    );

    if (confirmation !== 'XOA' && confirmation !== 'xoa') {
      return;
    }

    setIsResettingAll(true);
    try {
      const res = await api.resetAllStudents();
      showToast(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi làm mới dữ liệu.');
    } finally {
      setIsResettingAll(false);
    }
  };

  const handleLoadAllPresets = async () => {
    if (students.length > 0) {
      if (!window.confirm('Cô An Na có muốn nạp mới toàn bộ danh sách chuẩn 250 học sinh (50 học sinh/lớp cho 5 lớp 9A8 đến 9A12, danh sách hoàn toàn độc lập không trùng nhau)?')) {
        return;
      }
    }
    setLoading(true);
    try {
      const allPresets = getAll250PresetStudents();
      const payload = allPresets.map((st) => ({
        name: st.name,
        class: st.class,
        stt: st.stt,
      }));
      await api.bulkImportStudents({
        students: payload,
        mode: 'replace',
      });
      showToast('Đã nạp đầy đủ 250 học sinh độc lập cho 5 lớp 9A8 – 9A12!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể nạp danh sách lúc này');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadClassPreset = async (targetCls: ClassGrade9) => {
    setLoading(true);
    try {
      const list = getPresetStudentsForClass(targetCls as any);
      const payload = list.map((st) => ({
        name: st.name,
        class: st.class,
        stt: st.stt,
      }));
      await api.bulkImportStudents({
        students: payload,
        mode: 'replace_class',
        targetClass: targetCls,
      });
      showToast(`Đã nạp thành công ${list.length} học sinh cho lớp ${targetCls}!`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nạp danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const activeRes = await api.getStudents({
        search: searchQuery,
        classFilter: selectedClass === 'ALL' ? undefined : selectedClass,
      });
      setStudents(activeRes.students);

      const trashRes = await api.getTrash();
      setTrashStudents(trashRes.students);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // 🟢 Tự động cập nhật trực tiếp điểm số vào danh sách sau mỗi bài học sinh nộp
    const interval = setInterval(() => {
      if (activeTab === 'active') {
        api.getStudents({
          search: searchQuery,
          classFilter: selectedClass === 'ALL' ? undefined : selectedClass,
        }).then((res) => {
          setStudents(res.students);
        }).catch(() => {});
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [searchQuery, selectedClass, activeTab]);

  // Duplicate detection
  const duplicateGroups = useMemo(() => {
    const map = new Map<string, Student[]>();
    students.forEach((st) => {
      const key = `${st.class}_${st.name.trim().toLowerCase()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(st);
    });
    return map;
  }, [students]);

  const duplicateCount = useMemo(() => {
    let count = 0;
    duplicateGroups.forEach((group) => {
      if (group.length > 1) {
        count += group.length;
      }
    });
    return count;
  }, [duplicateGroups]);

  const displayedStudents = useMemo(() => {
    if (!filterDuplicatesOnly) return students;
    return students.filter((st) => {
      const key = `${st.class}_${st.name.trim().toLowerCase()}`;
      const group = duplicateGroups.get(key);
      return group && group.length > 1;
    });
  }, [students, filterDuplicatesOnly, duplicateGroups]);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditFormData({ name: student.name, className: student.class });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await api.updateStudent(editingStudent.id, editFormData);
      setEditingStudent(null);
      showToast('Đã cập nhật thông tin học sinh thành công!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await api.softDeleteStudent(deleteConfirmStudent.id);
      setDeleteConfirmStudent(null);
      showToast('Đã chuyển học sinh vào Thùng rác (Cô có thể khôi phục bất cứ lúc nào).');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestore = async (studentId: string) => {
    try {
      await api.restoreStudent(studentId);
      showToast('Khôi phục học sinh thành công!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteConfirmStudent) return;
    try {
      await api.permanentDeleteStudent(permanentDeleteConfirmStudent.id);
      setPermanentDeleteConfirmStudent(null);
      showToast('Đã xóa vĩnh viễn học sinh khỏi hệ thống.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAutoCleanDuplicates = async () => {
    if (
      !window.confirm(
        'Cô An Na có muốn tự động quét và gộp các học sinh bị trùng họ tên trong cùng một lớp? Toàn bộ bài nộp sẽ được giữ nguyên và gộp vào hồ sơ chính, các tên trùng dư thừa sẽ được dọn dẹp sạch sẽ.'
      )
    ) {
      return;
    }

    setCleaning(true);
    try {
      const res = await api.cleanDuplicateStudents();
      showToast(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Không thể dọn dẹp lúc này');
    } finally {
      setCleaning(false);
    }
  };

  const handleOpenMerge = (st: Student) => {
    setMergeSourceStudent(st);
    // Find candidate targets in the same class
    const candidates = students.filter((s) => s.id !== st.id && s.class === st.class);
    if (candidates.length > 0) {
      setMergeTargetStudentId(candidates[0].id);
    } else {
      setMergeTargetStudentId('');
    }
  };

  const handleConfirmMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceStudent || !mergeTargetStudentId) return;

    setMerging(true);
    try {
      const res = await api.mergeDuplicateStudents(mergeSourceStudent.id, mergeTargetStudentId);
      showToast(res.message);
      setMergeSourceStudent(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gộp học sinh');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>👨‍🎓</span>
            <span>QUẢN LÝ HỌC SINH & DANH SÁCH NHÀ TRƯỜNG</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Cô An Na có toàn quyền nạp danh sách học sinh từ file Excel, xóa sạch làm mới, sửa thông tin và tự động gộp tên trùng.
          </p>
        </div>

        {/* Action buttons & Tab switch */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setImportTargetClass(selectedClass !== 'ALL' ? selectedClass : '9A8');
              setShowRosterImportModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white text-xs font-black shadow-md shadow-purple-200 transition flex items-center gap-2 cursor-pointer active:scale-95"
            title="Tải lên danh sách học sinh mới (từ file Excel, danh sách chữ hoặc quét ảnh) cho các lớp 9A8 đến 9A12"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>📤 TẢI DANH SÁCH HỌC SINH MỚI (9A8 – 9A12)</span>
          </button>

          <button
            onClick={handleResetAllStudents}
            disabled={isResettingAll}
            className="px-3.5 py-2.5 rounded-2xl border-2 border-rose-200 hover:border-rose-400 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            title="Xóa và làm mới sạch dữ liệu học sinh để chuẩn bị tải danh sách mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResettingAll ? 'animate-spin' : ''}`} />
            <span>{isResettingAll ? 'Đang xóa...' : 'Làm mới / Xóa sạch'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'active'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang hoạt động ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                activeTab === 'trash'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>♻️ Thùng rác</span>
              {trashStudents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px]">
                  {trashStudents.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 🛠️ ACTION BAR FOR CÔ AN NA: CLEAN DUPLICATES & STATS */}
      {activeTab === 'active' && (
        <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-3xl border border-purple-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md shadow-purple-200">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Bộ lọc & Dọn dẹp học sinh bị trùng lặp
              </h3>
              <p className="text-xs text-slate-600">
                {duplicateCount > 0 ? (
                  <span className="text-amber-700 font-bold">
                    ⚠️ Phát hiện {duplicateCount} hồ sơ học sinh bị trùng họ tên trong cùng lớp.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    ✅ Danh sách chuẩn hóa, không phát hiện hồ sơ trùng tên.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterDuplicatesOnly(!filterDuplicatesOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                filterDuplicatesOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterDuplicatesOnly ? 'Đang lọc trùng' : 'Chỉ xem học sinh trùng'}</span>
              {duplicateCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                  {duplicateCount}
                </span>
              )}
            </button>

            <button
              onClick={handleAutoCleanDuplicates}
              disabled={cleaning}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{cleaning ? 'Đang dọn dẹp...' : '🧹 Tự động gộp & Dọn dẹp trùng'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔍 Search & Filters Bar */}
      {activeTab === 'active' && (
        <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm nhanh học sinh theo họ tên, lớp, ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 text-xs sm:text-sm font-medium outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:border-purple-500 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả các lớp (9A8 – 9A12)</option>
              {ALL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  Lớp {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ACTIVE STUDENTS TABLE */}
      {activeTab === 'active' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
          {/* Header Banner for Gradebook */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 text-base">
                📊
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase flex items-center gap-2">
                  <span>BẢNG ĐIỂM HỌC SINH THEO LỚP</span>
                  <span className="text-emerald-400 font-mono text-[11px] font-normal lowercase">(cột bài 1 → bài 10)</span>
                </h3>
                <p className="text-[11px] text-purple-200/80">
                  ⚡ Điểm số tự động cập nhật ngay lập tức vào đúng cột sau mỗi bài học sinh nộp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Tự động cập nhật (Live Sync)</span>
              </span>
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                title="Làm mới bảng điểm ngay"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-[11px] font-black uppercase tracking-wider text-slate-800">
                <tr>
                  <th className="py-3 px-3 text-center border-r border-slate-200 w-12 bg-slate-200/70">STT</th>
                  <th className="py-3 px-4 border-r border-slate-200 min-w-[200px]">Họ và tên</th>
                  {selectedClass === 'ALL' && (
                    <th className="py-3 px-2 text-center border-r border-slate-200 w-16">Lớp</th>
                  )}
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 1</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 2</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 3</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 4</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 5</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 6</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 7</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 8</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 9</th>
                  <th className="py-3 px-1.5 text-center border-r border-slate-200 min-w-[54px] bg-indigo-50/50">BÀI 10</th>
                  <th className="py-3 px-2 text-center border-r border-slate-200 min-w-[68px] bg-purple-100/70 text-purple-900 font-extrabold">ĐIỂM TB</th>
                  <th className="py-3 px-3 text-right min-w-[90px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={selectedClass === 'ALL' ? 15 : 14} className="py-14 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                          <FileSpreadsheet className="w-7 h-7" />
                        </div>
                        <h4 className="text-base font-bold text-slate-800">
                          {students.length === 0 ? 'Dữ liệu học sinh đã được làm mới hoàn toàn' : 'Không tìm thấy học sinh phù hợp'}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {students.length === 0
                            ? 'Hệ thống đã sẵn sàng cho năm học mới. Cô An Na hãy nhấn nút bên dưới để tải lên file Excel danh sách học sinh các lớp.'
                            : 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc lớp.'}
                        </p>
                        {students.length === 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleLoadAllPresets}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black text-xs shadow-md shadow-purple-200 transition active:scale-95 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>⚡ Nạp ngay 250 học sinh 5 lớp (9A8 – 9A12)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRosterImportModal(true)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition active:scale-95 cursor-pointer"
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>📥 Tải lên danh sách học sinh (Excel)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((st, idx) => {
                    const dupKey = `${st.class}_${st.name.trim().toLowerCase()}`;
                    const dupGroup = duplicateGroups.get(dupKey);
                    const isDuplicate = dupGroup && dupGroup.length > 1;

                    return (
                      <tr
                        key={st.id}
                        className={`transition ${
                          isDuplicate ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* STT */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 font-bold text-slate-500 text-xs bg-slate-50/50">
                          {st.stt ?? (idx + 1)}
                        </td>

                        {/* Họ và tên */}
                        <td className="py-3 px-4 border-r border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isDuplicate
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {st.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-slate-900 truncate">{st.name}</p>
                                {isDuplicate && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold inline-flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                    <span>Trùng</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {selectedClass !== 'ALL' ? `Lớp ${st.class}` : `ID: ${st.id.slice(0, 8)}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Lớp (chỉ hiển thị khi chọn Tất cả lớp) */}
                        {selectedClass === 'ALL' && (
                          <td className="py-3 px-2 text-center border-r border-slate-100">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100">
                              {st.class}
                            </span>
                          </td>
                        )}

                        {/* BÀI 1 ĐẾN BÀI 10 (Theo mẫu đính kèm) */}
                        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((num) => {
                          const score = st.lessonScores ? st.lessonScores[num] : null;
                          return (
                            <td
                              key={num}
                              className="py-2.5 px-1 text-center border-r border-slate-100 text-xs"
                            >
                              {score !== null && score !== undefined ? (
                                <button
                                  type="button"
                                  onClick={() => onViewHistory && onViewHistory(st.id)}
                                  title={`Bài ${num}: ${score} điểm (Bấm xem bài làm)`}
                                  className={`inline-flex items-center justify-center min-w-[34px] px-1.5 py-0.5 rounded-md font-black text-xs border transition cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                                    score >= 8
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                      : score >= 5
                                      ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                  }`}
                                >
                                  <span>{score.toFixed(1).replace('.0', '')}</span>
                                </button>
                              ) : (
                                <span className="text-slate-300 font-medium select-none">—</span>
                              )}
                            </td>
                          );
                        })}

                        {/* ĐIỂM TB */}
                        <td className="py-3 px-2 text-center border-r border-slate-100 bg-purple-50/40">
                          <span className="font-black text-xs text-purple-800">
                            {st.avgScore ? st.avgScore.toFixed(1).replace('.0', '') : '—'}
                          </span>
                        </td>

                        {/* THAO TÁC */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isDuplicate && (
                              <button
                                onClick={() => handleOpenMerge(st)}
                                title="Gộp bài của học sinh này vào bản ghi khác"
                                className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition text-xs font-bold flex items-center gap-1 border border-amber-300"
                              >
                                <GitMerge className="w-3.5 h-3.5" />
                                <span>Gộp</span>
                              </button>
                            )}

                            {onViewHistory && (
                              <button
                                onClick={() => onViewHistory(st.id)}
                                title="Xem lịch sử học tập & làm bài"
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenEdit(st)}
                              title="Sửa thông tin hoặc đổi lớp"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmStudent(st)}
                              title="Xóa học sinh bị sai / trùng"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ♻️ TRASH BIN TABLE */
        <div className="bg-white rounded-3xl border border-rose-200 shadow-sm overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
              <span>♻️ THÙNG RÁC HỌC SINH</span>
            </h3>
            <p className="text-xs text-slate-400">
              Các học sinh đã xóa tạm thời. Cô có thể khôi phục bất cứ lúc nào.
            </p>
          </div>

          {trashStudents.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Thùng rác trống. Không có học sinh nào bị xóa.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trashStudents.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{st.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      Lớp {st.class}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Đã xóa lúc: {st.deletedAt ? new Date(st.deletedAt).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore(st.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục</span>
                    </button>
                    <button
                      onClick={() => setPermanentDeleteConfirmStudent(st)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa vĩnh viễn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✏️ MODAL: SỬA THÔNG TIN HỌC SINH */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-purple-100">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-purple-600" />
              <span>SỬA THÔNG TIN HỌC SINH</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Họ và tên học sinh
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Lớp học
                </label>
                <select
                  value={editFormData.className}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, className: e.target.value as ClassGrade9 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      Lớp {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-200"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔗 MODAL: GỘP HỌC SINH TRÙNG LẶP THỦ CÔNG */}
      {mergeSourceStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-700">
              <div className="p-2 rounded-xl bg-indigo-50">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                GỘP HỌC SINH TRÙNG LẶP
              </h3>
            </div>

            <form onSubmit={handleConfirmMerge} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <span className="font-bold block uppercase text-[10px] text-amber-700 mb-1">
                  Hồ sơ nguồn (sẽ chuyển bài nộp và xóa tên này):
                </span>
                <p className="font-extrabold text-sm">
                  {mergeSourceStudent.name} – Lớp {mergeSourceStudent.class}
                </p>
                <p className="text-[11px] text-amber-800">
                  Số bài đã làm: {mergeSourceStudent.submissionsCount || 0} bài (ID: {mergeSourceStudent.id.slice(0, 8)})
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Chọn hồ sơ Đích (giữ lại và nhận toàn bộ bài làm):
                </label>
                <select
                  required
                  value={mergeTargetStudentId}
                  onChange={(e) => setMergeTargetStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                >
                  <option value="">-- Chọn học sinh đích --</option>
                  {students
                    .filter((s) => s.id !== mergeSourceStudent.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Lớp {s.class}, {s.submissionsCount || 0} bài)
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 border border-slate-200">
                💡 Toàn bộ bài kiểm tra và lịch sử sẽ được gộp sang hồ sơ đích. Cô An Na có thể hoàn tác trong Thùng rác nếu cần.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMergeSourceStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={merging || !mergeTargetStudentId}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {merging ? 'Đang gộp...' : 'Xác nhận gộp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ⚠️ XÁC NHẬN XÓA (Soft delete) */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center text-xl">
              ⚠️
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                XÁC NHẬN XÓA HỌC SINH
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Cô An Na có chắc muốn xóa học sinh này (do sai thông tin hoặc bị trùng)?
              </p>
              <div className="mt-2 p-2.5 bg-rose-50 rounded-xl text-rose-900 font-bold text-sm">
                {deleteConfirmStudent.name} – Lớp {deleteConfirmStudent.class}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Học sinh sẽ được chuyển vào <strong>Thùng rác</strong> và cô có thể khôi phục lại bất cứ khi nào.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md shadow-rose-200"
              >
                🗑️ XÁC NHẬN XÓA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PERMANENT DELETE */}
      {permanentDeleteConfirmStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-200 text-rose-700 mx-auto flex items-center justify-center text-xl">
              🚨
            </div>
            <div>
              <h4 className="text-base font-extrabold text-rose-900">
                XÓA VĨNH VIỄN?
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Hành động này sẽ xóa hoàn toàn khỏi cơ sở dữ liệu:
              </p>
              <div className="mt-2 p-2.5 bg-rose-50 rounded-xl text-rose-900 font-bold text-sm">
                {permanentDeleteConfirmStudent.name} – {permanentDeleteConfirmStudent.class}
              </div>
              <p className="text-[11px] text-rose-600 font-semibold mt-2">
                Không thể khôi phục sau khi xóa vĩnh viễn!
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteConfirmStudent(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-xs font-bold text-white shadow-md shadow-rose-300"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ROSTER IMPORT EXCEL & AI THEO LỚP */}
      <RosterImportModal
        isOpen={showRosterImportModal}
        initialClass={importTargetClass || (selectedClass !== 'ALL' ? selectedClass : '9A8')}
        onClose={() => setShowRosterImportModal(false)}
        onSuccess={(msg) => {
          showToast(msg);
          if (importTargetClass) {
            setSelectedClass(importTargetClass);
          }
          loadData();
        }}
      />
    </div>
  );
};
