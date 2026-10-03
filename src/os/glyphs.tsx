export function BatteryGlyph({ level = 86, charging = true, size = 16 }: { level?: number; charging?: boolean; size?: number }) {
  const w = (level / 100) * 13;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="7.5" width="17" height="9" rx="2" stroke="currentColor" />
      <rect x="20" y="10" width="2" height="4" rx="0.8" fill="currentColor" />
      <rect x="4.5" y="9.5" width={w} height="5" rx="0.8" fill="currentColor" />
      {charging && (
        <path d="M12.3 5.5 8.8 12.2h3.1l-1.1 6.3 3.9-7.4h-3.1z" fill="currentColor" stroke="var(--glyph-bg, #f3f3f3)" strokeWidth="0.9" />
      )}
    </svg>
  );
}

export function TaskViewGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="tvg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a7a7a" />
          <stop offset="1" stopColor="#3a3a3a" />
        </linearGradient>
      </defs>
      <rect x="2" y="4" width="13" height="14" rx="2" fill="#2b2b2b" />
      <rect x="3" y="5" width="11" height="12" rx="1.2" fill="#ffffff" />
      <rect x="9" y="7" width="13" height="13" rx="2" fill="#0a6fd1" />
      <rect x="10" y="8" width="11" height="11" rx="1.2" fill="#4cc2ff" />
    </svg>
  );
}

export function WeatherGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <radialGradient id="sun" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ffd84d" />
          <stop offset="1" stopColor="#ffb300" />
        </radialGradient>
        <linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6e4f0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="7" fill="url(#sun)" />
      <path d="M11 27h13a5 5 0 0 0 0-10 6.5 6.5 0 0 0-12.4 1.6A4.3 4.3 0 0 0 11 27z" fill="url(#cloud)" stroke="#b9c9d8" strokeWidth=".6" />
    </svg>
  );
}

export function SearchGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="9.5" cy="6.5" r="4.8" />
      <path d="M6 10 1.6 14.4" strokeLinecap="round" />
    </svg>
  );
}

export function CopilotGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <defs>
        <linearGradient id="cp1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3ccbf4" />
          <stop offset=".5" stopColor="#2f7cf6" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="cp2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb357" />
          <stop offset=".5" stopColor="#f75fa0" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path d="M11 4h8c1.5 0 2.6 1 3 2.3L26 21c.5 1.6-.7 3-2.3 3H18l-4-14c-.6-2-2-3-3.8-3H6.5C7.5 5.3 9 4 11 4z" fill="url(#cp1)" />
      <path d="M21 28h-8c-1.5 0-2.6-1-3-2.3L6 11c-.5-1.6.7-3 2.3-3H14l4 14c.6 2 2 3 3.8 3h3.7c-1 1.7-2.5 3-4.5 3z" fill="url(#cp2)" />
    </svg>
  );
}
