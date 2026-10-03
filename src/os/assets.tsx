import { useState, type ImgHTMLAttributes } from "react";

const CDN = "https://cdn.jsdelivr.net/gh/blueedgetechno/win11React@master/public/img/";
const RAW = "https://raw.githubusercontent.com/blueedgetechno/win11React/master/public/img/";

export const iconUrl = (name: string) => `${CDN}icon/${name}.png`;
export const wallUrl = (path: string) => `${CDN}wallpaper/${path}`;
export const assetUrl = (path: string) => `${CDN}${path}`;

export const WALLPAPERS = [
  "default/img0.jpg",
  "dark/img0.jpg",
  "ThemeA/img0.jpg",
  "ThemeA/img1.jpg",
  "ThemeA/img2.jpg",
  "ThemeA/img3.jpg",
  "ThemeB/img0.jpg",
  "ThemeB/img1.jpg",
  "ThemeB/img2.jpg",
  "ThemeB/img3.jpg",
  "ThemeC/img0.jpg",
  "ThemeC/img1.jpg",
  "ThemeC/img2.jpg",
  "ThemeC/img3.jpg",
  "ThemeD/img0.jpg",
  "ThemeD/img1.jpg",
  "ThemeD/img2.jpg",
  "ThemeD/img3.jpg",
];

const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc2ff"/><stop offset="1" stop-color="#0067c0"/></linearGradient></defs><rect x="6" y="6" width="36" height="36" rx="8" fill="url(#g)"/><rect x="14" y="14" width="9" height="9" fill="#fff" opacity=".9"/><rect x="25" y="14" width="9" height="9" fill="#fff" opacity=".9"/><rect x="14" y="25" width="9" height="9" fill="#fff" opacity=".9"/><rect x="25" y="25" width="9" height="9" fill="#fff" opacity=".9"/></svg>`
  );

/** Image with CDN -> raw.githubusercontent -> svg fallback chain */
export function Img({ src, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  const [stage, setStage] = useState(0);
  const [prev, setPrev] = useState(src);
  if (prev !== src) {
    setPrev(src);
    setStage(0);
  }
  const real = stage === 0 ? src : stage === 1 ? src.replace(CDN, RAW) : FALLBACK;
  return (
    <img
      draggable={false}
      {...rest}
      src={real}
      onError={() => setStage((s) => Math.min(2, s + 1))}
    />
  );
}

export function AppIcon({ icon, size = 24, className = "" }: { icon: string; size?: number; className?: string }) {
  if (icon === "thispc") return <ThisPCIcon size={size} className={className} />;
  return <Img src={iconUrl(icon)} width={size} height={size} className={className} style={{ width: size, height: size }} alt="" />;
}

export function ThisPCIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id="pcg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5ec7ff" />
          <stop offset="1" stopColor="#0a6fd1" />
        </linearGradient>
      </defs>
      <rect x="4" y="7" width="40" height="27" rx="3" fill="#2b2b2b" />
      <rect x="6" y="9" width="36" height="23" rx="1.5" fill="url(#pcg)" />
      <path d="M6 26 Q20 16 42 22 V32 H6Z" fill="#fff" opacity=".18" />
      <rect x="20" y="34" width="8" height="5" fill="#9a9a9a" />
      <rect x="13" y="39" width="22" height="3" rx="1.5" fill="#bdbdbd" />
    </svg>
  );
}

export function DriveIcon({ size = 24, system = false }: { size?: number; system?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="4" y="16" width="40" height="20" rx="3" fill="#cfcfcf" />
      <rect x="4" y="16" width="40" height="13" rx="3" fill="#e9e9e9" />
      <rect x="34" y="30" width="6" height="2.5" rx="1" fill="#3fbf3f" />
      {system && (
        <g transform="translate(8 9)">
          <rect width="7" height="7" fill="#0078d4" />
          <rect x="8" width="7" height="7" fill="#0078d4" />
          <rect y="8" width="7" height="7" fill="#0078d4" />
          <rect x="8" y="8" width="7" height="7" fill="#0078d4" />
        </g>
      )}
    </svg>
  );
}

export function FileIcon({ size = 24, ext = "txt" }: { size?: number; ext?: string }) {
  const color = ext === "png" || ext === "jpg" ? "#2fa84f" : ext === "docx" ? "#185abd" : ext === "pdf" ? "#d13438" : "#6b6b6b";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d="M11 4h18l10 10v30H11z" fill="#fff" stroke="#bdbdbd" />
      <path d="M29 4v10h10" fill="#e6e6e6" stroke="#bdbdbd" />
      {ext === "txt" ? (
        <g stroke="#8a8a8a" strokeWidth="1.6">
          <line x1="16" y1="22" x2="34" y2="22" />
          <line x1="16" y1="27" x2="34" y2="27" />
          <line x1="16" y1="32" x2="34" y2="32" />
          <line x1="16" y1="37" x2="28" y2="37" />
        </g>
      ) : (
        <rect x="14" y="26" width="20" height="12" rx="2" fill={color} />
      )}
    </svg>
  );
}

export function WinLogo({ size = 24, color = "#0078d4" }: { size?: number; color?: string }) {
  const s = size / 2 - size * 0.02;
  const g = size * 0.04;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={s} height={s} fill={color} />
      <rect x={s + g} y="0" width={s} height={s} fill={color} />
      <rect x="0" y={s + g} width={s} height={s} fill={color} />
      <rect x={s + g} y={s + g} width={s} height={s} fill={color} />
    </svg>
  );
}

/** Colourful Windows 11 start logo */
export function StartLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="slg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cc2ff" />
          <stop offset="1" stopColor="#0078d4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="10.6" height="10.6" rx="1" fill="url(#slg)" />
      <rect x="12.4" y="1" width="10.6" height="10.6" rx="1" fill="url(#slg)" />
      <rect x="1" y="12.4" width="10.6" height="10.6" rx="1" fill="url(#slg)" />
      <rect x="12.4" y="12.4" width="10.6" height="10.6" rx="1" fill="url(#slg)" />
    </svg>
  );
}
