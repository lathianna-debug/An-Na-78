// Curated background presets tailored for Môn GDCD 9 - Trường THCS Tân Hải
export interface BackgroundPreset {
  id: string;
  name: string;
  category: 'chuan' | 'phap_luat' | 'dao_duc' | 'tan_hai' | 'to_quoc';
  description: string;
  svgDataUri: string;
  thumbnailColor: string;
  badge: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'preset-gdcd9-original',
    name: 'Hành trình Công dân nhí 9 (Nguyên bản)',
    category: 'chuan',
    badge: 'Chuẩn GDCD 9',
    description: 'Con đường tri thức, ngọn đuốc soi sáng, sách mở và học sinh vươn tới tương lai rạng rỡ.',
    thumbnailColor: 'from-purple-600 via-indigo-600 to-cyan-500',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%234C1D95"/>
          <stop offset="45%" stop-color="%231E1B4B"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
        <linearGradient id="road" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="%238B5CF6"/>
          <stop offset="50%" stop-color="%2338BDF8"/>
          <stop offset="100%" stop-color="%2334D399"/>
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%23FDE047"/>
          <stop offset="100%" stop-color="%23F59E0B"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(%23bg)"/>
      <circle cx="400" cy="180" r="140" fill="url(%23road)" opacity="0.18" filter="blur(30px)"/>
      <path d="M 0 450 Q 250 360, 400 240 T 800 200 L 800 450 Z" fill="url(%23road)" opacity="0.75"/>
      <path d="M 120 450 Q 320 380, 400 280 T 680 230" stroke="white" stroke-width="4" stroke-dasharray="14 10" fill="none" opacity="0.8"/>
      <circle cx="400" cy="170" r="48" fill="url(%23gold)"/>
      <path d="M400 135 L408 158 L432 158 L413 172 L420 195 L400 181 L380 195 L387 172 L368 158 L392 158 Z" fill="%23FFFFFF"/>
      <text x="400" y="380" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle" letter-spacing="2">MÔN GIÁO DỤC CÔNG DÂN 9</text>
      <text x="400" y="415" fill="%23FDE047" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle" letter-spacing="3">TRƯỜNG THCS TÂN HẢI</text>
    </svg>`,
  },
  {
    id: 'preset-phap-luat',
    name: 'Cán cân Công lý & Pháp quyền Việt Nam',
    category: 'phap_luat',
    badge: 'Pháp luật & Kỷ luật',
    description: 'Cán cân công lý vàng óng, Hiến pháp và Pháp luật Nhà nước Việt Nam nghiêm minh, chuẩn mực.',
    thumbnailColor: 'from-amber-600 via-rose-700 to-indigo-900',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bgLaw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%231E1B4B"/>
          <stop offset="60%" stop-color="%2331103F"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
        <linearGradient id="goldLaw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%23FDE047"/>
          <stop offset="50%" stop-color="%23F59E0B"/>
          <stop offset="100%" stop-color="%23B45309"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(%23bgLaw)"/>
      <circle cx="400" cy="180" r="160" fill="%23F59E0B" opacity="0.12" filter="blur(40px)"/>
      <!-- Balance Scale -->
      <path d="M 394 100 L 406 100 L 406 280 L 394 280 Z" fill="url(%23goldLaw)"/>
      <path d="M 360 280 L 440 280 L 450 300 L 350 300 Z" fill="url(%23goldLaw)"/>
      <circle cx="400" cy="95" r="14" fill="url(%23goldLaw)"/>
      <path d="M 280 120 L 520 120" stroke="url(%23goldLaw)" stroke-width="8" stroke-linecap="round"/>
      <!-- Left pan -->
      <path d="M 280 120 L 250 200 L 310 200 Z" fill="none" stroke="%23FDE047" stroke-width="2.5"/>
      <path d="M 240 200 Q 280 230, 320 200 Z" fill="url(%23goldLaw)"/>
      <!-- Right pan -->
      <path d="M 520 120 L 490 200 L 550 200 Z" fill="none" stroke="%23FDE047" stroke-width="2.5"/>
      <path d="M 480 200 Q 520 230, 560 200 Z" fill="url(%23goldLaw)"/>
      <text x="400" y="360" fill="%23FFFFFF" font-family="sans-serif" font-size="26" font-weight="900" text-anchor="middle">SỐNG VÀ LÀM VIỆC THEO HIẾN PHÁP &amp; PHÁP LUẬT</text>
      <text x="400" y="398" fill="%23FBBF24" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">GDCD 9 • TRƯỜNG THCS TÂN HẢI</text>
    </svg>`,
  },
  {
    id: 'preset-tan-hai-school',
    name: 'Mái trường THCS Tân Hải Thân yêu',
    category: 'tan_hai',
    badge: 'THCS Tân Hải',
    description: 'Không gian trường học ngập tràn ánh nắng tri thức, tinh thần học tập hăng say của học trò Tân Hải.',
    thumbnailColor: 'from-blue-600 via-teal-600 to-emerald-700',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="skyTH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%230284C7"/>
          <stop offset="50%" stop-color="%2338BDF8"/>
          <stop offset="100%" stop-color="%23E0F2FE"/>
        </linearGradient>
        <linearGradient id="groundTH" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%2310B981"/>
          <stop offset="100%" stop-color="%23047857"/>
        </linearGradient>
      </defs>
      <rect width="800" height="300" fill="url(%23skyTH)"/>
      <rect y="300" width="800" height="150" fill="url(%23groundTH)"/>
      <circle cx="120" cy="90" r="50" fill="%23FEF08A" opacity="0.9"/>
      <!-- School Building Vector -->
      <rect x="250" y="170" width="300" height="130" fill="%23FFFBEB" rx="8"/>
      <polygon points="230,170 400,90 570,170" fill="%23DC2626"/>
      <!-- Flag pole -->
      <line x1="400" y1="90" x2="400" y2="40" stroke="%2394A3B8" stroke-width="4"/>
      <polygon points="400,40 440,55 400,70" fill="%23EF4444"/>
      <!-- Windows -->
      <rect x="280" y="190" width="40" height="35" fill="%2338BDF8" rx="4"/>
      <rect x="340" y="190" width="40" height="35" fill="%2338BDF8" rx="4"/>
      <rect x="420" y="190" width="40" height="35" fill="%2338BDF8" rx="4"/>
      <rect x="480" y="190" width="40" height="35" fill="%2338BDF8" rx="4"/>
      <!-- Door -->
      <rect x="380" y="240" width="40" height="60" fill="%23B45309" rx="3"/>
      <text x="400" y="380" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">TRƯỜNG THCS TÂN HẢI</text>
      <text x="400" y="415" fill="%23FEF08A" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">HỌC TẬP TỐT • RÈN LUYỆN TỐT • TRƯỞNG THÀNH TOÀN DIỆN</text>
    </svg>`,
  },
  {
    id: 'preset-to-quoc-bien-dao',
    name: 'Tự hào Tổ quốc & Biển đảo Quê hương',
    category: 'to_quoc',
    badge: 'Chủ quyền Đất nước',
    description: 'Cờ đỏ sao vàng tung bay trên biển trời Tổ quốc, ngọn hải đăng vững chãi bảo vệ chủ quyền biên cương.',
    thumbnailColor: 'from-red-600 via-rose-600 to-blue-900',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bgSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="%23BE123C"/>
          <stop offset="40%" stop-color="%231E3A8A"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(%23bgSea)"/>
      <!-- Waves -->
      <path d="M 0 320 Q 200 280, 400 320 T 800 320 L 800 450 L 0 450 Z" fill="%230284C7" opacity="0.6"/>
      <path d="M 0 350 Q 200 320, 400 350 T 800 350 L 800 450 L 0 450 Z" fill="%230369A1" opacity="0.8"/>
      <!-- Big Golden Star Glow -->
      <circle cx="400" cy="160" r="100" fill="%23FEF08A" opacity="0.15" filter="blur(30px)"/>
      <circle cx="400" cy="160" r="75" fill="%23DC2626"/>
      <!-- 5-point Star -->
      <path d="M400 100 L418 145 L465 145 L428 173 L442 218 L400 190 L358 218 L372 173 L335 145 L382 145 Z" fill="%23FACC15"/>
      <text x="400" y="380" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">HOÀNG SA - TRƯỜNG SA LÀ CỦA VIỆT NAM</text>
      <text x="400" y="415" fill="%23FDE047" font-family="sans-serif" font-size="19" font-weight="800" text-anchor="middle">MÔN GDCD 9 • TRƯỜNG THCS TÂN HẢI</text>
    </svg>`,
  },
  {
    id: 'preset-dao-duc-bac-ho',
    name: 'Hoa sen ngát hương & Đạo đức Lối sống',
    category: 'dao_duc',
    badge: 'Đạo đức & Nhân cách',
    description: 'Biểu tượng đóa sen hồng thuần khiết, học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh.',
    thumbnailColor: 'from-pink-600 via-rose-500 to-indigo-950',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bgLotus" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%23831843"/>
          <stop offset="50%" stop-color="%23312E81"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(%23bgLotus)"/>
      <circle cx="400" cy="180" r="120" fill="%23F472B6" opacity="0.2" filter="blur(35px)"/>
      <!-- Lotus Petals -->
      <path d="M 400 80 C 370 140, 370 200, 400 240 C 430 200, 430 140, 400 80 Z" fill="%23FB7185"/>
      <path d="M 400 120 C 340 160, 320 220, 370 245 C 390 220, 400 180, 400 120 Z" fill="%23F43F5E" opacity="0.9"/>
      <path d="M 400 120 C 460 160, 480 220, 430 245 C 410 220, 400 180, 400 120 Z" fill="%23F43F5E" opacity="0.9"/>
      <path d="M 370 170 C 300 190, 270 240, 330 260 C 360 250, 380 220, 370 170 Z" fill="%23FDA4AF" opacity="0.85"/>
      <path d="M 430 170 C 500 190, 530 240, 470 260 C 440 250, 420 220, 430 170 Z" fill="%23FDA4AF" opacity="0.85"/>
      <!-- Stem and leaves -->
      <path d="M 280 270 Q 400 290, 520 270 Q 400 310, 280 270 Z" fill="%2310B981"/>
      <text x="400" y="365" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">HỌC TẬP VÀ LÀM THEO TẤM GƯƠNG BÁC HỒ</text>
      <text x="400" y="405" fill="%23FBCFE8" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">MÔN GDCD 9 • TRƯỜNG THCS TÂN HẢI</text>
    </svg>`,
  },
  {
    id: 'preset-sach-tri-thuc',
    name: 'Sách GDCD 9 – Kết nối Tri thức & Hành động',
    category: 'chuan',
    badge: 'Sách Giáo Khoa 9',
    description: 'Cuốn sách mở ra chân trời hiểu biết về quyền, nghĩa vụ và trách nhiệm công dân của người học trò lớp 9.',
    thumbnailColor: 'from-violet-600 via-purple-600 to-indigo-800',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <linearGradient id="bgBook" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="%232E1065"/>
          <stop offset="50%" stop-color="%233B0764"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(%23bgBook)"/>
      <circle cx="400" cy="180" r="140" fill="%23A855F7" opacity="0.2" filter="blur(30px)"/>
      <!-- Open Book -->
      <path d="M 400 130 C 350 110, 250 120, 200 140 L 200 250 C 250 230, 350 220, 400 240 Z" fill="%23EDE9FE"/>
      <path d="M 400 130 C 450 110, 550 120, 600 140 L 600 250 C 550 230, 450 220, 400 240 Z" fill="%23F5F3FF"/>
      <!-- Center binding -->
      <line x1="400" y1="130" x2="400" y2="245" stroke="%237C3AED" stroke-width="4"/>
      <!-- Text Lines on book -->
      <line x1="240" y1="160" x2="360" y2="150" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <line x1="240" y1="180" x2="350" y2="170" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <line x1="240" y1="200" x2="330" y2="190" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <line x1="440" y1="150" x2="560" y2="160" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <line x1="440" y1="170" x2="550" y2="180" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <line x1="440" y1="190" x2="530" y2="200" stroke="%23A78BFA" stroke-width="3" stroke-linecap="round"/>
      <text x="400" y="355" fill="%23FFFFFF" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">HỌC BÀI • HIỂU BÀI • VẬN DỤNG • TRƯỞNG THÀNH</text>
      <text x="400" y="395" fill="%23C084FC" font-family="sans-serif" font-size="20" font-weight="800" text-anchor="middle">GIÁO DỤC CÔNG DÂN 9 • TRƯỜNG THCS TÂN HẢI</text>
    </svg>`,
  },
];
