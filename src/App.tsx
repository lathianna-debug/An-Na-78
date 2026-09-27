import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Rocket,
  Shield,
  Compass,
  ArrowRight,
  BookOpen,
  Brain,
  Lightbulb,
  Sprout,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import { AdminUser } from './types.ts';
import { api, authStorage } from './lib/api.ts';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { MascotIllustration } from './components/MascotIllustration.tsx';
import { StudentJoinModal } from './components/StudentJoinModal.tsx';
import { StudentExamScreen } from './components/StudentExamScreen.tsx';
import { CompletionScreen } from './components/CompletionScreen.tsx';
import { TeacherLoginModal } from './components/TeacherLoginModal.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { ImageUploaderModal } from './components/ImageUploaderModal.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'student-join' | 'student-exam' | 'student-completion' | 'teacher-dashboard'>('home');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);

  // Custom Banner / Image replacement state
  const [customBannerImage, setCustomBannerImage] = useState<string>('');
  const [useCustomBanner, setUseCustomBanner] = useState<boolean>(false);
  const [bannerFitMode, setBannerFitMode] = useState<'contain' | 'cover' | 'original'>('contain');
  const [bannerBorderRadius, setBannerBorderRadius] = useState<string>('rounded-3xl');
  const [bannerShadow, setBannerShadow] = useState<string>('shadow-xl');
  const [backgroundTheme, setBackgroundTheme] = useState<string>('default');
  const [isBannerLocked, setIsBannerLocked] = useState<boolean>(true);
  const [showImageUploader, setShowImageUploader] = useState<boolean>(false);

  // Student active session state
  const [examSession, setExamSession] = useState<any>(null);
  const [completionResult, setCompletionResult] = useState<any>(null);

  // Load public settings and verify existing admin token on startup
  useEffect(() => {
    // 1. Immediately read any previously uploaded banner from local storage
    const localBanner =
      localStorage.getItem('htcdn_custom_banner') ||
      localStorage.getItem('htcdn_custom_image') ||
      localStorage.getItem('custom_banner_image');
    if (localBanner) {
      setCustomBannerImage(localBanner);
      setUseCustomBanner(true);
    }

    // 2. Fetch public settings (custom banner, etc.) from server
    api
      .getPublicSettings()
      .then((res) => {
        if (res.settings) {
          if (res.settings.customBannerImage) {
            setCustomBannerImage(res.settings.customBannerImage);
            setUseCustomBanner(true);
          } else if (localBanner) {
            // Server doesn't have it yet, but user previously uploaded in this browser: keep it!
            setCustomBannerImage(localBanner);
            setUseCustomBanner(true);
            api.changeBackground({
              image: localBanner,
              useCustom: true,
              overrideLock: true,
              isTeacherAction: true,
            }).catch(() => {});
          } else if (res.settings.useCustomBanner !== undefined) {
            setUseCustomBanner(res.settings.useCustomBanner);
          }
          if (res.settings.bannerFitMode) setBannerFitMode(res.settings.bannerFitMode as any);
          if (res.settings.bannerBorderRadius) setBannerBorderRadius(res.settings.bannerBorderRadius);
          if (res.settings.bannerShadow) setBannerShadow(res.settings.bannerShadow);
          if (res.settings.backgroundTheme) setBackgroundTheme(res.settings.backgroundTheme);
          if (res.settings.isBannerLocked !== undefined) setIsBannerLocked(res.settings.isBannerLocked);
        }
      })
      .catch(() => {
        // Fallback to local storage if offline
        if (localBanner) {
          setCustomBannerImage(localBanner);
          setUseCustomBanner(true);
        }
      });

    // 2. Check admin token
    const token = authStorage.getAdminToken();
    if (token) {
      api
        .getAdminMe()
        .then((res) => setAdminUser(res.user))
        .catch(() => {
          authStorage.removeAdminToken();
          setAdminUser(null);
        });
    }
  }, []);

  const handleAdminLogout = async () => {
    try {
      await api.adminLogout();
    } catch {
      // ignore
    }
    authStorage.removeAdminToken();
    setAdminUser(null);
    setCurrentView('home');
  };

  const handleStartMissionSuccess = (sessionData: any) => {
    setExamSession(sessionData);
    setCurrentView('student-exam');
  };

  const handleExamCompleted = (resultData: any) => {
    setCompletionResult(resultData);
    setCurrentView('student-completion');
  };

  const getThemeBackground = () => {
    switch (backgroundTheme) {
      case 'golden-tan-hai':
        return 'from-amber-100/90 via-yellow-50/70 to-orange-100/80';
      case 'ocean-blue':
        return 'from-sky-100/90 via-blue-50/70 to-cyan-100/80';
      case 'emerald-growth':
        return 'from-emerald-100/90 via-teal-50/70 to-green-100/80';
      case 'warm-sunset':
        return 'from-rose-100/90 via-pink-50/70 to-purple-100/80';
      case 'royal-purple':
        return 'from-purple-200/90 via-violet-100/80 to-indigo-200/90';
      default:
        return 'from-indigo-100/80 via-purple-50/60 to-pink-100/70';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getThemeBackground()} text-slate-900 flex flex-col justify-between font-sans selection:bg-purple-300 selection:text-purple-950 relative overflow-x-hidden transition-colors duration-500`}>
      {/* Dynamic Background Ambient Halos for vibrant visuals */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Universal Header */}
      {currentView !== 'student-exam' && (
        <Header
          currentView={currentView === 'teacher-dashboard' ? 'teacher-dashboard' : 'home'}
          onNavigate={(view) => {
            if (view === 'teacher-dashboard') {
              if (adminUser) setCurrentView('teacher-dashboard');
              else setShowTeacherLogin(true);
            } else if (view === 'student-mission') {
              setCurrentView('student-join');
            } else {
              setCurrentView('home');
            }
          }}
          adminUser={adminUser}
          onAdminLogout={handleAdminLogout}
          onOpenTeacherLogin={() => {
            if (adminUser) setCurrentView('teacher-dashboard');
            else setShowTeacherLogin(true);
          }}
          onOpenChangeBackground={() => {
            setShowImageUploader(true);
          }}
        />
      )}

      {/* VIEW ROUTING */}
      <main className="flex-1">
        {/* 1. HOME SCREEN */}
        {currentView === 'home' && (
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-12">
            {/* HERO SECTION */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              {/* School Name Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-black text-sm sm:text-base shadow-lg shadow-purple-500/25 border-2 border-amber-300 transform hover:scale-105 transition-transform">
                <span className="text-xl">🏫</span>
                <span>TRƯỜNG THCS TÂN HẢI</span>
              </div>

              {/* Slogan Pill */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100 via-indigo-100 to-amber-100 border-2 border-purple-300/80 text-purple-950 text-xs sm:text-sm font-extrabold shadow-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>📚 HỌC BÀI • 🧠 HIỂU BÀI • ✨ VẬN DỤNG • 🌱 TRƯỞNG THÀNH</span>
                </div>
              </div>

              {/* Title & Subject */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight drop-shadow-xs">
                🌟 HÀNH TRÌNH CÔNG DÂN NHÍ
              </h1>

              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700">
                  MÔN GIÁO DỤC CÔNG DÂN 9 — TRƯỜNG THCS TÂN HẢI
                </p>
                <p className="text-xs sm:text-sm font-bold text-amber-700">
                  Nền tảng học tập & rèn luyện phẩm chất công dân số dành cho học sinh Khối 9
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
                Khám phá các bài học đạo đức, lối sống, trách nhiệm công dân và pháp luật chuẩn chương trình lớp 9 thông qua hành trình nhiệm vụ tương tác hiện đại.
              </p>
            </div>

            {/* 3D LEARNING JOURNEY ILLUSTRATION */}
            <div className="px-2">
              <MascotIllustration
                className="py-2 max-w-2xl mx-auto"
                customImage={customBannerImage}
                useCustom={useCustomBanner}
                fitMode={bannerFitMode}
                borderRadius={bannerBorderRadius}
                shadow={bannerShadow}
                onOpenUploader={() => {
                  setShowImageUploader(true);
                }}
                onSelectFile={async (dataUrl) => {
                  setCustomBannerImage(dataUrl);
                  setUseCustomBanner(true);
                  localStorage.setItem('htcdn_custom_banner', dataUrl);
                  localStorage.setItem('htcdn_use_custom_banner', 'true');
                  try {
                    await api.changeBackground({
                      image: dataUrl,
                      useCustom: true,
                      overrideLock: true,
                      isTeacherAction: true,
                    });
                  } catch (e) {
                    console.error('Failed to sync to server', e);
                  }
                }}
                canEdit={!!adminUser}
                isLocked={isBannerLocked}
              />
            </div>

            {/* 2 CARD LỚN, NỔI BẬT & BẮT MẮT (HỌC SINH / GIÁO VIÊN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-2">
              {/* Card 1: 🎒 HỌC SINH */}
              <div className="bg-gradient-to-br from-white via-violet-50/60 to-indigo-50/80 rounded-3xl p-6 sm:p-8 border-2 border-violet-400 shadow-2xl shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-gradient-to-tr from-violet-300/40 to-cyan-300/40 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

                <div className="space-y-3.5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-violet-300">
                    🎒
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-violet-700 bg-violet-100/90 px-3 py-1 rounded-full border border-violet-300">
                      🎒 Dành cho học sinh 9A8 – 9A12
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                      KHÔNG GIAN HỌC SINH
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                    Không cần tạo tài khoản! Chỉ cần điền tên, chọn lớp (Khối 9: 9A8 – 9A12) của Trường THCS Tân Hải và chọn bài học hôm nay để bắt đầu.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-white text-violet-800 text-xs font-black border border-violet-200 shadow-xs">
                      ⚡ Vào làm bài ngay
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white text-cyan-800 text-xs font-black border border-cyan-200 shadow-xs">
                      💾 Tự động lưu bài
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-xs font-black border border-emerald-200 shadow-xs">
                      🔐 Khóa bài bảo mật
                    </span>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    onClick={() => setCurrentView('student-join')}
                    className="w-full py-4 px-6 rounded-2xl font-black text-white text-base bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] border border-white/25"
                  >
                    <Rocket className="w-5 h-5 text-yellow-300" />
                    <span>🚀 BẮT ĐẦU HÀNH TRÌNH HỌC TẬP</span>
                  </button>
                </div>
              </div>

              {/* Card 2: 👩‍🏫 GIÁO VIÊN */}
              <div className="bg-gradient-to-br from-white via-amber-50/50 to-purple-50/70 rounded-3xl p-6 sm:p-8 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-1.5 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-gradient-to-tr from-amber-300/40 to-purple-300/40 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

                <div className="space-y-3.5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-300">
                    👩‍🏫
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300">
                      👑 Dành riêng cho Cô An Na
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                      KHU VỰC CÔ AN NA
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
                    Quản lý toàn bộ hành trình bài học, mở/khóa nhiệm vụ, chấm bài, quan sát dữ liệu các lớp Khối 9 (9A8 – 9A12) Trường THCS Tân Hải và xuất file Excel.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-xl bg-white text-indigo-800 text-xs font-black border border-indigo-200 shadow-xs">
                      📚 Quản lý bài học & trắc nghiệm
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-xs font-black border border-emerald-200 shadow-xs">
                      📈 Biểu đồ tiến bộ 5 lớp
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white text-amber-800 text-xs font-black border border-amber-200 shadow-xs">
                      📥 Xuất Excel chuẩn
                    </span>
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <button
                    onClick={() => {
                      if (adminUser) setCurrentView('teacher-dashboard');
                      else setShowTeacherLogin(true);
                    }}
                    className="w-full py-4 px-6 rounded-2xl font-black text-white text-base bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-950 hover:from-slate-800 hover:via-purple-800 hover:to-indigo-900 shadow-xl shadow-purple-900/30 hover:shadow-2xl transition flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-[0.98] border border-amber-400/40"
                  >
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="text-yellow-300">🔐 ĐĂNG NHẬP QUẢN TRỊ VIÊN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 CORE VALUE PILLARS - VIBRANT & EYE-CATCHING */}
            <div className="max-w-4xl mx-auto pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 sm:p-5 bg-gradient-to-b from-blue-50 to-indigo-100/70 rounded-2xl border-2 border-blue-300/80 shadow-md shadow-blue-200/50 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mx-auto text-xl mb-2 shadow-md shadow-blue-300">
                    📚
                  </div>
                  <h4 className="font-black text-xs sm:text-sm text-blue-950">HỌC BÀI</h4>
                  <p className="text-[11px] font-bold text-blue-700 mt-1">Nắm vững lý thuyết GDCD</p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-b from-purple-50 to-fuchsia-100/70 rounded-2xl border-2 border-purple-300/80 shadow-md shadow-purple-200/50 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mx-auto text-xl mb-2 shadow-md shadow-purple-300">
                    🧠
                  </div>
                  <h4 className="font-black text-xs sm:text-sm text-purple-950">HIỂU BÀI</h4>
                  <p className="text-[11px] font-bold text-purple-700 mt-1">Thấu hiểu đạo đức & luật</p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-50 to-orange-100/70 rounded-2xl border-2 border-amber-300/80 shadow-md shadow-amber-200/50 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto text-xl mb-2 shadow-md shadow-amber-300">
                    ✨
                  </div>
                  <h4 className="font-black text-xs sm:text-sm text-amber-950">VẬN DỤNG</h4>
                  <p className="text-[11px] font-bold text-amber-700 mt-1">Xử lý tình huống thực tế</p>
                </div>

                <div className="p-4 sm:p-5 bg-gradient-to-b from-emerald-50 to-teal-100/70 rounded-2xl border-2 border-emerald-300/80 shadow-md shadow-emerald-200/50 hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl mb-2 shadow-md shadow-emerald-300">
                    🌱
                  </div>
                  <h4 className="font-black text-xs sm:text-sm text-emerald-950">TRƯỞNG THÀNH</h4>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1">Trở thành công dân tốt</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. STUDENT JOIN SCREEN */}
        {currentView === 'student-join' && (
          <StudentJoinModal
            onBack={() => setCurrentView('home')}
            onStartSuccess={handleStartMissionSuccess}
          />
        )}

        {/* 3. STUDENT EXAM RUNNER (Mobile-First) */}
        {currentView === 'student-exam' && examSession && (
          <StudentExamScreen
            sessionData={examSession}
            onCompleted={handleExamCompleted}
          />
        )}

        {/* 4. STUDENT COMPLETION CELEBRATION */}
        {currentView === 'student-completion' && completionResult && (
          <CompletionScreen
            result={completionResult}
            onGoHome={() => {
              setExamSession(null);
              setCompletionResult(null);
              setCurrentView('home');
            }}
          />
        )}

        {/* 5. TEACHER DASHBOARD */}
        {currentView === 'teacher-dashboard' && adminUser && (
          <TeacherDashboard adminUser={adminUser} onLogout={handleAdminLogout} />
        )}
      </main>

      {/* Universal Footer */}
      {currentView !== 'student-exam' && (
        <Footer
          onOpenTeacherLogin={() => {
            if (adminUser) setCurrentView('teacher-dashboard');
            else setShowTeacherLogin(true);
          }}
        />
      )}

      {/* Teacher Login Modal */}
      <TeacherLoginModal
        isOpen={showTeacherLogin}
        onClose={() => setShowTeacherLogin(false)}
        onLoginSuccess={(user) => {
          setAdminUser(user);
          setCurrentView('teacher-dashboard');
        }}
      />

      {/* Image Uploader & Replacement Modal */}
      <ImageUploaderModal
        isOpen={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        targetType="banner"
        currentImage={customBannerImage}
        isAdmin={!!adminUser}
        onSuccess={(newImgUrl, updatedSettings) => {
          if (updatedSettings) {
            setCustomBannerImage(updatedSettings.customBannerImage || '');
            setUseCustomBanner(!!updatedSettings.useCustomBanner);
            if (updatedSettings.bannerFitMode) setBannerFitMode(updatedSettings.bannerFitMode);
            if (updatedSettings.bannerBorderRadius) setBannerBorderRadius(updatedSettings.bannerBorderRadius);
            if (updatedSettings.bannerShadow) setBannerShadow(updatedSettings.bannerShadow);
            if (updatedSettings.backgroundTheme) setBackgroundTheme(updatedSettings.backgroundTheme);
          } else {
            setCustomBannerImage(newImgUrl);
            setUseCustomBanner(!!newImgUrl);
            localStorage.setItem('htcdn_custom_banner', newImgUrl);
            localStorage.setItem('htcdn_use_custom_banner', newImgUrl ? 'true' : 'false');
          }
        }}
        onResetOriginal={() => {
          setCustomBannerImage('');
          setUseCustomBanner(false);
          localStorage.removeItem('htcdn_custom_banner');
          localStorage.setItem('htcdn_use_custom_banner', 'false');
        }}
      />
    </div>
  );
}
