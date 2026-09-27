import React, { useState } from 'react';
import { Shield, KeyRound, User, AlertCircle, X, Sparkles } from 'lucide-react';
import { api, authStorage } from '../lib/api.ts';
import { AdminUser } from '../types.ts';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('coanna');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.adminLogin({ username, password });
      authStorage.setAdminToken(res.token);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl mb-3 shadow-inner">
            👩‍🏫
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            QUẢN TRỊ VIÊN — CÔ AN NA
          </h3>
          <p className="text-purple-100 text-xs mt-1">
            Email: lathianna@gmail.com • Hệ thống môn Giáo dục Công dân 9
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-600" />
              <span>Tài khoản Cô An Na</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="coanna hoặc lathianna@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-slate-800 text-sm font-medium transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-purple-600" />
              <span>Mật khẩu quản trị</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-slate-800 text-sm font-medium transition"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong>Quy định bảo mật:</strong> Học sinh chỉ có chức năng làm bài tập, toàn bộ chức năng khác đã được khóa an toàn. Chỉ duy nhất một mình Cô An Na được đăng nhập, chỉnh sửa và xóa các nội dung.
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md shadow-purple-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>ĐĂNG NHẬP HỆ THỐNG</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
