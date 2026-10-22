// Illustrated artwork used instead of photos or real brand imagery, so fictional demo
// profiles and products are never mistaken for real people or real products.

function hash(value) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

const SKIN = ['#8d5a3b', '#a96c45', '#c58b60', '#74462b', '#b57a52'];
const HAIR = ['#1e1814', '#2c201a', '#3a2a20', '#161311'];
const BACKDROP = ['#dcebfb', '#e2edfb', '#fdf0df', '#ece9fb', '#e4f1fb'];

/** Flat illustrated doctor bust. `variant` "f" or "m" changes the hairstyle only. */
export function DoctorAvatar({ seed = 'doctor', variant = 'f', size = 56, className = '', rounded = 'circle' }) {
  const h = hash(seed);
  const skin = SKIN[h % SKIN.length];
  const hair = HAIR[(h >>> 3) % HAIR.length];
  const bg = BACKDROP[(h >>> 5) % BACKDROP.length];
  const clipId = `av-${h}-${size}`;
  const female = variant === 'f';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`doctor-avatar ${className}`}
      role="img"
      aria-label="Illustrated avatar"
    >
      <defs>
        <clipPath id={clipId}>
          {rounded === 'circle' ? <circle cx="60" cy="60" r="60" /> : <rect width="120" height="120" rx="22" />}
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="120" fill={bg} />
        {female && (
          <path d="M38 60c-2-24 9-35 22-35s24 11 22 35c-1 15-4 24-7 28H45c-3-4-6-13-7-28z" fill={hair} />
        )}
        <rect x="51" y="68" width="18" height="24" rx="7" fill={skin} />
        <path d="M10 124c3-26 22-37 50-37s47 11 50 37z" fill="#ffffff" stroke="#d8e2ec" strokeWidth="1.5" />
        <path d="M47 88l13 17 13-17z" fill="#1a72d6" />
        <path d="M47 88l-7 32M73 88l7 32" stroke="#d8e2ec" strokeWidth="1.5" fill="none" />
        <path d="M45 92c-2 14 4 22 11 23" stroke="#33454a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="57" cy="115" r="3.6" fill="#33454a" />
        <ellipse cx="60" cy="52" rx="20" ry="23" fill={skin} />
        {female ? (
          <path d="M39 51c0-19 10-26 21-26 13 0 22 8 21 25-6-10-15-14-26-12-7 1-12 6-16 13z" fill={hair} />
        ) : (
          <path d="M39 48c-1-18 10-25 22-25 14 0 21 8 20 25-3-8-9-13-21-13-10 0-17 5-21 13z" fill={hair} />
        )}
        <circle cx="53" cy="55" r="1.9" fill="#1d1d1d" />
        <circle cx="67" cy="55" r="1.9" fill="#1d1d1d" />
        <path d="M54 64q6 4.5 12 0" stroke="#5a2f22" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Large hero artwork on a soft arch: a photo when `photo` is given, otherwise the illustration. */
export function HeroIllustration({ photo }) {
  return (
    <div className="hero-art" aria-hidden="true">
      <svg className="hero-art__arch" viewBox="0 0 400 420">
        <defs>
          <linearGradient id="arch-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe3f8" />
            <stop offset="1" stopColor="#ebf4fd" />
          </linearGradient>
        </defs>
        <path d="M40 420V190C40 101 112 30 200 30s160 71 160 160v230z" fill="url(#arch-fill)" />
        <g fill="#1a72d6" opacity=".18">
          <path d="M318 70h8v-8h6v8h8v6h-8v8h-6v-8h-8z" />
          <path d="M48 120h6v-6h4v6h6v4h-6v6h-4v-6h-6z" />
        </g>
        <path d="M60 300h50l12-26 18 52 14-36h40" stroke="#1a72d6" strokeWidth="3" fill="none" opacity=".22" strokeLinejoin="round" />
      </svg>
      <div className="hero-art__person">
        {photo ? (
          <img src={photo} alt="" className="hero-art__photo" />
        ) : (
          <DoctorAvatar seed="hero-doctor" variant="f" size={330} rounded="none" />
        )}
      </div>
      <p className="hero-art__script">
        Better
        <br />
        Healthcare
        <br />
        Closer to You
      </p>
    </div>
  );
}

const PRODUCT_KIND_BY_ID = {
  'med-antiseptic-liquid': 'bottle',
  'med-hand-sanitiser': 'bottle',
  'med-levothyroxine-50': 'bottle',
  'med-ors-ready': 'carton',
  'med-povidone-ointment': 'tube',
  'med-first-aid-kit': 'kit',
  'med-cotton-roll': 'roll',
  'med-crepe-bandage': 'roll',
  'med-surgical-tape': 'roll',
  'med-digital-thermometer': 'thermometer',
  'med-infrared-thermometer': 'device',
  'med-pulse-oximeter': 'device',
  'med-adhesive-bandages': 'plaster',
  'med-gauze-pads': 'plaster',
  'med-ors-sachet': 'sachet',
  'med-face-masks': 'mask',
  'med-nitrile-gloves': 'box',
  'med-hot-water-bag': 'bag',
};

const ART = {
  strip: (c) => (
    <>
      <rect x="12" y="20" width="56" height="40" rx="8" fill="#e8edf0" stroke="#c9d3d8" />
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => <ellipse key={`${col}${row}`} cx={26 + col * 14} cy={32 + row * 16} rx="5" ry="5" fill={c} opacity=".85" />),
      )}
    </>
  ),
  bottle: (c) => (
    <>
      <rect x="30" y="10" width="20" height="10" rx="3" fill="#4b5d63" />
      <rect x="24" y="20" width="32" height="50" rx="9" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="24" y="36" width="32" height="20" fill={c} />
      <path d="M37 42h6v-4h2v4h6v2h-6v4h-2v-4h-6z" fill="#fff" />
    </>
  ),
  carton: (c) => (
    <>
      <path d="M26 18l14-8 14 8v52H26z" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="26" y="34" width="28" height="22" fill={c} />
      <rect x="44" y="6" width="4" height="10" rx="2" fill="#4b5d63" />
    </>
  ),
  tube: (c) => (
    <>
      <path d="M20 30h34l10 10-10 10H20z" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="20" y="30" width="18" height="20" fill={c} />
      <rect x="64" y="36" width="8" height="8" rx="2" fill="#4b5d63" />
    </>
  ),
  kit: (c) => (
    <>
      <rect x="32" y="16" width="16" height="10" rx="3" fill="none" stroke="#4b5d63" strokeWidth="3" />
      <rect x="12" y="24" width="56" height="40" rx="8" fill={c} />
      <path d="M37 38h6v-6h6v6h6v6h-6v6h-6v-6h-6z" fill="#fff" />
    </>
  ),
  roll: (c) => (
    <>
      <ellipse cx="40" cy="58" rx="24" ry="8" fill="#e8edf0" stroke="#c9d3d8" />
      <rect x="16" y="26" width="48" height="32" fill="#f4f7f8" />
      <ellipse cx="40" cy="26" rx="24" ry="8" fill="#fff" stroke="#c9d3d8" />
      <ellipse cx="40" cy="26" rx="9" ry="3" fill={c} opacity=".5" />
      <path d="M16 26v32M64 26v32" stroke="#c9d3d8" />
    </>
  ),
  thermometer: (c) => (
    <>
      <rect x="35" y="8" width="10" height="50" rx="5" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="38" y="24" width="4" height="36" rx="2" fill={c} />
      <circle cx="40" cy="64" r="9" fill={c} />
      <rect x="32" y="14" width="16" height="8" rx="2" fill="#4b5d63" />
    </>
  ),
  device: (c) => (
    <>
      <rect x="14" y="20" width="52" height="40" rx="14" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="24" y="30" width="32" height="18" rx="4" fill="#20313a" />
      <path d="M28 40h6l3-5 4 9 3-4h8" stroke={c} strokeWidth="2" fill="none" />
    </>
  ),
  plaster: (c) => (
    <>
      <rect x="10" y="30" width="60" height="20" rx="10" fill="#f0d2b4" transform="rotate(-18 40 40)" />
      <rect x="30" y="31" width="20" height="18" rx="3" fill="#fff" opacity=".85" transform="rotate(-18 40 40)" />
      <circle cx="40" cy="40" r="2" fill={c} />
    </>
  ),
  sachet: (c) => (
    <>
      <path d="M20 12h40v56H20z" fill={c} />
      <path d="M20 12l4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4M20 68l4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4" stroke="#fff" fill="none" />
      <rect x="26" y="30" width="28" height="18" rx="3" fill="#fff" />
      <text x="40" y="43" fontSize="9" textAnchor="middle" fill={c} fontWeight="700">ORS</text>
    </>
  ),
  mask: (c) => (
    <>
      <path d="M18 32c10-6 34-6 44 0v18c-10 8-34 8-44 0z" fill="#e3f1f8" stroke="#b7d3e2" />
      <path d="M22 38h36M22 44h36" stroke="#b7d3e2" />
      <path d="M18 34c-8 0-8 14 0 14M62 34c8 0 8 14 0 14" stroke={c} strokeWidth="2" fill="none" />
    </>
  ),
  box: (c) => (
    <>
      <rect x="12" y="22" width="56" height="40" rx="6" fill="#f4f7f8" stroke="#c9d3d8" />
      <rect x="12" y="22" width="56" height="12" rx="6" fill={c} />
      <ellipse cx="40" cy="28" rx="10" ry="3" fill="#fff" opacity=".7" />
    </>
  ),
  bag: (c) => (
    <>
      <rect x="34" y="10" width="12" height="12" rx="3" fill="#4b5d63" />
      <rect x="18" y="20" width="44" height="50" rx="16" fill={c} />
      <path d="M26 34h28M26 44h28M26 54h28" stroke="#fff" opacity=".5" strokeWidth="2" />
    </>
  ),
};

const CATEGORY_COLOR = {
  prescription: '#c2417a',
  otc: '#1a72d6',
  'first-aid': '#d14343',
  thermometers: '#2563eb',
  dressings: '#c47a2c',
  ors: '#ea7a1e',
  'personal-care': '#0369a1',
};

/** Product illustration chosen from the medicine's id/category (no real packaging). */
export function ProductArt({ medicine, size = 64 }) {
  const kind = PRODUCT_KIND_BY_ID[medicine.id] ?? 'strip';
  const color = CATEGORY_COLOR[medicine.categoryId] ?? '#1a72d6';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      {ART[kind](color)}
    </svg>
  );
}

const LOGO_COLORS = ['#1a72d6', '#1d4ed8', '#b45309', '#7c3aed', '#be123c', '#0369a1'];

/** Monogram mark for fictional pharmacies. */
export function PharmacyLogo({ pharmacy, size = 48 }) {
  const initials = pharmacy.name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const color = LOGO_COLORS[hash(pharmacy.id) % LOGO_COLORS.length];
  return (
    <span className="pharmacy-logo" style={{ width: size, height: size, background: color }} aria-hidden="true">
      <span>{initials}</span>
      <svg viewBox="0 0 10 10" className="pharmacy-logo__cross">
        <path d="M3.5 0h3v3.5H10v3H6.5V10h-3V6.5H0v-3h3.5z" fill="#fff" />
      </svg>
    </span>
  );
}
