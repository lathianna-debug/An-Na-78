import React, { useState, useEffect } from 'react';
import {
  Settings,
  KeyRound,
  ShieldCheck,
  Eye,
  Database,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  Camera,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { AuditLog, SystemSettings } from '../types.ts';
import { api } from '../lib/api.ts';
import { ImageUploaderModal } from './ImageUploaderModal.tsx';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Image uploader state
  const [uploaderTarget, setUploaderTarget] = useState<'banner' | 'logo' | 'avatar' | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettingsAndLogs = async () => {
    setLoading(true);
    try {
      const s = await api.getSettings();
      setSettings(s.settings);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs.auditLogs);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
  }, []);

  const handleToggleSetting = async (key: keyof SystemSettings) => {
    if (!settings) return;
    const updated: SystemSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(updated);
    try {
      await api.updateSettings(updated);
      showToast('Đã lưu cấu hình hệ thống!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setPassLoading(true);
    setPassMsg(null);

    try {
      await api.changeAdminPassword({ currentPassword, newPassword });
      setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ type: 'error', text: err.message || 'Lỗi khi đổi mật khẩu.' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleCleanTestData = async () => {
    if (!window.confirm('Cô có chắc muốn dọn các bài nộp thử nghiệm? (Các bài học và bài tập vẫn được giữ nguyên).')) return;
    try {
      const res = await api.cleanTestData();
      showToast(res.message);
      loadSettingsAndLogs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>⚙️</span>
          <span>KHU VỰC CÀI ĐẶT HỆ THỐNG</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Quản lý tài khoản Cô An Na, chính sách bảo mật máy chủ, quyền xem bài và nhật ký hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Cài đặt bảo mật bài làm */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>CÀI ĐẶT BẢO MẬT BÀI LÀM</span>
          </h3>

          {settings ? (
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.lockImmediatelyOnSubmit}
                  onChange={() => handleToggleSetting('lockImmediatelyOnSubmit')}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-semibold text-slate-800">
                  Khóa ngay sau khi nộp (Server-Side Lock)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.hideAnswersAfterSubmit}
                  onChange={() => handleToggleSetting('hideAnswersAfterSubmit')}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-semibold text-slate-800">
                  Không hiện đáp án sau khi nộp
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.preventViewingOthersSubmissions}
                  onChange={() => handleToggleSetting('preventViewingOthersSubmissions')}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-semibold text-slate-800">
                  Không cho học sinh xem bài người khác
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.teacherOnlyReview}
                  onChange={() => handleToggleSetting('teacherOnlyReview')}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-semibold text-slate-800">
                  Chỉ giáo viên được xem bài làm chi tiết
                </span>
              </label>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Đang tải...</p>
          )}
        </div>

        {/* 2. Cài đặt kết quả hiển thị */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>CÀI ĐẶT HIỂN THỊ KẾT QUẢ</span>
          </h3>

          {settings ? (
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.showScoreAfterSubmit}
                  onChange={() => handleToggleSetting('showScoreAfterSubmit')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">
                  Hiện điểm sau khi nộp
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.showTimeAfterSubmit}
                  onChange={() => handleToggleSetting('showTimeAfterSubmit')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">
                  Hiện thời gian làm bài
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.showCorrectAnswersAfterSubmit}
                  onChange={() => handleToggleSetting('showCorrectAnswersAfterSubmit')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">
                  Hiện đáp án đúng (Mặc định tắt)
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={settings.allowReviewDetailAfterSubmit}
                  onChange={() => handleToggleSetting('allowReviewDetailAfterSubmit')}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="font-semibold text-slate-800">
                  Cho xem bài chi tiết (Mặc định tắt)
                </span>
              </label>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Đang tải...</p>
          )}
        </div>

        {/* 3. BẢO MẬT & KHÓA CỐ ĐỊNH HÌNH NỀN GIAO DIỆN (CHẾ ĐỘ AN TOÀN TUYỆT ĐỐI) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-md space-y-5 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 text-base">🔒</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  BẢO MẬT & KHÓA CỐ ĐỊNH HÌNH NỀN GIAO DIỆN (CHẾ ĐỘ AN TOÀN TUYỆT ĐỐI)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Khóa kiên cố hình nền trên trang chủ nhằm ngăn chặn tuyệt đối tình trạng học sinh hoặc người ngoài tự ý thay đổi, xóa ảnh.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-xs ${
                  settings?.isBannerLocked
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {settings?.isBannerLocked
                  ? '🔒 ĐÃ KHÓA BẢO VỆ TUYỆT ĐỐI'
                  : '🔓 Đang mở khóa (Cho phép sửa)'}
              </span>
            </div>
          </div>

          {/* Toggle Lock Checkbox */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings?.isBannerLocked ?? true}
                  onChange={() => handleToggleSetting('isBannerLocked')}
                  className="w-5 h-5 text-amber-600 rounded-md focus:ring-amber-500 border-slate-300"
                />
                <span className="font-black text-sm text-slate-900">
                  Kích hoạt Khóa bảo vệ hình nền giao diện (Khuyên dùng)
                </span>
              </label>
              <p className="text-xs text-slate-600 pl-8 font-medium">
                Khi bật: Nút tải ảnh ngoài trang chủ bị ẩn hoàn toàn. Toàn bộ giao diện học tập được giữ nguyên bản, không bị can thiệp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Thumbnail Preview */}
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-200 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group shadow-inner">
              {settings?.useCustomBanner && settings?.customBannerImage ? (
                <img
                  src={settings.customBannerImage}
                  alt="Ảnh minh họa hiện tại"
                  className="max-h-[140px] max-w-full object-contain rounded-xl shadow-xs"
                />
              ) : (
                <div className="text-center space-y-2 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                    🎨
                  </div>
                  <p className="text-xs font-bold text-slate-800">Hình vẽ Vector gốc GDCD 9</p>
                  <p className="text-[10px] text-slate-500">Hình học sinh và con đường tri thức</p>
                </div>
              )}
            </div>

            {/* Actions & Settings */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (settings?.isBannerLocked) {
                      alert('🔒 Hình nền đang được kích hoạt Khóa bảo vệ cố định bởi Cô An Na. Cô vui lòng bỏ chọn ô "Kích hoạt Khóa bảo vệ" ở trên nếu muốn mở khóa để chỉnh sửa.');
                      return;
                    }
                    setUploaderTarget('banner');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 ${
                    settings?.isBannerLocked
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-2 border-slate-300'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white shadow-purple-200 cursor-pointer'
                  }`}
                >
                  <span>{settings?.isBannerLocked ? '🔒' : '🎨'}</span>
                  <span>{settings?.isBannerLocked ? 'Hình nền đã khóa cố định (Được bảo vệ)' : 'Thay đổi hình nền theo yêu cầu (Thư viện mẫu / Tải ảnh)'}</span>
                </button>

                {typeof window !== 'undefined' && localStorage.getItem('htcdn_custom_banner') && (
                  <button
                    type="button"
                    onClick={async () => {
                      const localImg = localStorage.getItem('htcdn_custom_banner');
                      if (!localImg) return;
                      try {
                        const res = await api.changeBackground({
                          image: localImg,
                          useCustom: true,
                          overrideLock: true,
                          isTeacherAction: true,
                        });
                        setSettings(res.settings);
                        showToast('Đã chọn và áp dụng hình nền Cô An Na đã tải lên thành công!');
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>✨</span>
                    <span>Chọn ngay hình nền đã tải lên</span>
                  </button>
                )}

                {settings?.useCustomBanner && (
                  <button
                    type="button"
                    disabled={settings?.isBannerLocked}
                    onClick={async () => {
                      if (settings?.isBannerLocked) {
                        alert('🔒 Hình nền đang được khóa cố định. Không thể khôi phục khi chưa mở khóa.');
                        return;
                      }
                      try {
                        const res = await api.changeBackground({
                          image: '',
                          useCustom: false,
                        });
                        setSettings(res.settings);
                        showToast('Đã khôi phục về hình vẽ vector gốc!');
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition flex items-center gap-2 ${
                      settings?.isBannerLocked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200 opacity-60'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 cursor-pointer'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Khôi phục Vector gốc</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>🏫 Đơn vị:</span>
                  <span className="font-black text-indigo-900">MÔN GIÁO DỤC CÔNG DÂN 9 — TRƯỜNG THCS TÂN HẢI</span>
                </p>
                <p className="text-[11px] text-indigo-800">
                  Hệ thống thiết lập bảo mật cấp trường: Chỉ tài khoản quản trị viên của Cô An Na mới có quyền cấu hình dữ liệu và bài tập.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Đổi mật khẩu Cô An Na */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-600" />
            <span>ĐỔI MẬT KHẨU TÀI KHOẢN CÔ AN NA</span>
          </h3>

          {passMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
            >
              {passLoading ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>

        {/* 4. Quản lý dữ liệu hệ thống */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>QUẢN LÝ DỮ LIỆU</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Dọn dẹp bài làm thử nghiệm hoặc khôi phục danh sách học sinh từ Thùng rác.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleCleanTestData}
              className="w-full py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs text-left flex items-center justify-between transition"
            >
              <span>🧹 Dọn dữ liệu bài nộp thử nghiệm</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300">
                Làm sạch
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 📜 AUDIT LOGS TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>NHẬT KÝ HỆ THỐNG (AUDIT LOGS)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3">Thời gian</th>
                <th className="py-2.5 px-3">Tác nhân</th>
                <th className="py-2.5 px-3">Hành động</th>
                <th className="py-2.5 px-3">Đối tượng</th>
                <th className="py-2.5 px-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN')}{' '}
                    {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-purple-700">{log.actor}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{log.targetEntity}</td>
                  <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Image Upload & Replacement */}
      {uploaderTarget && (
        <ImageUploaderModal
          isOpen={true}
          onClose={() => setUploaderTarget(null)}
          targetType={uploaderTarget}
          currentImage={
            uploaderTarget === 'banner'
              ? settings?.customBannerImage
              : uploaderTarget === 'logo'
              ? settings?.schoolLogo
              : settings?.teacherAvatar
          }
          isAdmin={true}
          onSuccess={(newImgUrl, updatedSettings) => {
            if (updatedSettings) {
              setSettings(updatedSettings);
            } else if (settings) {
              setSettings({
                ...settings,
                customBannerImage: newImgUrl,
                useCustomBanner: true,
              });
            }
            showToast('Đã lưu và cập nhật hình ảnh thành công!');
          }}
          onResetOriginal={() => {
            if (settings) {
              setSettings({
                ...settings,
                useCustomBanner: false,
                customBannerImage: '',
              });
            }
            showToast('Đã khôi phục hình minh họa vector gốc!');
          }}
        />
      )}
    </div>
  );
};
