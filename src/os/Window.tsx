import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useOS, TASKBAR_H, type Win, type Frac } from "./store";
import { AppIcon } from "./assets";
import { appById } from "./apps";

type WinCtx = { win: Win; titleSlot: HTMLElement | null; active: boolean };
const WindowContext = createContext<WinCtx | null>(null);
export const useWin = () => useContext(WindowContext)!;

/** apps that draw their own content inside the title bar (tabs) */
const TAB_APPS: Record<string, number> = { edge: 40, terminal: 40, explorer: 40 };

const LAYOUTS: Frac[][] = [
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 2 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ],
  [
    { x: 0, y: 0, w: 1 / 3, h: 1 },
    { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ],
  [
    { x: 0, y: 0, w: 0.25, h: 1 },
    { x: 0.25, y: 0, w: 0.5, h: 1 },
    { x: 0.75, y: 0, w: 0.25, h: 1 },
  ],
];

type Geo = { x: number; y: number; w: number; h: number };

export function WindowFrame({ win, children }: { win: Win; children: ReactNode }) {
  const os = useOS();
  const app = appById(win.appId);
  const active = os.activeId === win.id;
  const [geo, setGeo] = useState<Geo | null>(null);
  const [preview, setPreview] = useState<Frac | null>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const layoutTimer = useRef<number | undefined>(undefined);
  const titleH = TAB_APPS[win.appId] || 32;
  const minW = win.appId === "calculator" ? 320 : 380;
  const minH = win.appId === "calculator" ? 460 : 260;

  const vw = window.innerWidth;
  const vh = window.innerHeight - TASKBAR_H;

  let rect: Geo;
  if (geo) rect = geo;
  else if (win.max) rect = { x: 0, y: 0, w: vw, h: vh };
  else if (win.snap) rect = { x: win.snap.x * vw, y: win.snap.y * vh, w: win.snap.w * vw, h: win.snap.h * vh };
  else rect = { x: win.x, y: win.y, w: win.w, h: win.h };

  const fullBleed = win.max && !geo;

  const onTitleDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-nodrag]") || t.closest("[data-tab]") || t.closest("button") || t.closest("input")) return;
    os.focusWin(win.id);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const sx = e.clientX;
    const sy = e.clientY;
    let start: Geo = { ...rect };
    let restored = !(win.max || win.snap);
    let moved = false;
    let snapTarget: Frac | null = null;
    let lastG: Geo | null = null;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      if (!restored) {
        restored = true;
        const ratio = (sx - rect.x) / rect.w;
        const w = win.w;
        start = { x: sx - w * ratio, y: 0, w, h: win.h };
        os.updateWin(win.id, { max: false, snap: null });
      }
      const nx = start.x + dx;
      const ny = Math.max(0, start.y + dy);
      lastG = { x: nx, y: ny, w: start.w, h: start.h };
      setGeo(lastG);
      const px = ev.clientX;
      const py = ev.clientY;
      const W = window.innerWidth;
      if (py <= 2 && px > 40 && px < W - 40) snapTarget = { x: 0, y: 0, w: 1, h: 1 };
      else if (px <= 2 && py < 80) snapTarget = { x: 0, y: 0, w: 0.5, h: 0.5 };
      else if (px <= 2 && py > vh - 80) snapTarget = { x: 0, y: 0.5, w: 0.5, h: 0.5 };
      else if (px >= W - 3 && py < 80) snapTarget = { x: 0.5, y: 0, w: 0.5, h: 0.5 };
      else if (px >= W - 3 && py > vh - 80) snapTarget = { x: 0.5, y: 0.5, w: 0.5, h: 0.5 };
      else if (px <= 2) snapTarget = { x: 0, y: 0, w: 0.5, h: 1 };
      else if (px >= W - 3) snapTarget = { x: 0.5, y: 0, w: 0.5, h: 1 };
      else snapTarget = null;
      setPreview(snapTarget);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      setPreview(null);
      if (!moved) return;
      const g = lastG;
      if (g) {
        if (snapTarget && snapTarget.w === 1 && snapTarget.h === 1)
          os.updateWin(win.id, { x: g.x, y: Math.max(0, g.y), w: g.w, h: g.h, max: true, snap: null });
        else if (snapTarget) os.updateWin(win.id, { x: g.x, y: g.y, w: g.w, h: g.h, snap: snapTarget, max: false });
        else os.updateWin(win.id, { x: g.x, y: Math.min(Math.max(0, g.y), vh - 40), w: g.w, h: g.h });
      }
      setGeo(null);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const onResizeDown = (dir: string) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    os.focusWin(win.id);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const sx = e.clientX;
    const sy = e.clientY;
    const s = { ...rect };
    let last: Geo = s;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      let { x, y, w, h } = s;
      if (dir.includes("e")) w = Math.max(minW, s.w + dx);
      if (dir.includes("s")) h = Math.max(minH, s.h + dy);
      if (dir.includes("w")) {
        w = Math.max(minW, s.w - dx);
        x = s.x + s.w - w;
      }
      if (dir.includes("n")) {
        h = Math.max(minH, s.h - dy);
        y = Math.max(0, s.y + s.h - h);
      }
      last = { x, y, w, h };
      setGeo(last);
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      os.updateWin(win.id, { ...last, max: false, snap: null });
      setGeo(null);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  useEffect(() => () => window.clearTimeout(layoutTimer.current), []);

  const hidden = win.min || win.closing;
  const transform = win.closing ? "scale(0.94)" : win.min ? `translateY(${vh - rect.y}px) scale(0.6)` : "none";

  return (
    <WindowContext.Provider value={{ win, titleSlot: slot, active }}>
      {preview && (
        <div
          className="fixed pointer-events-none rounded-lg border border-white/40 transition-all duration-150"
          style={{
            left: preview.x * vw + 6,
            top: preview.y * vh + 6,
            width: preview.w * vw - 12,
            height: preview.h * vh - 12,
            zIndex: win.z - 1,
            background: "rgba(255,255,255,0.22)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 8px 32px rgba(0,0,0,.25)",
          }}
        />
      )}
      <div
        className={`fixed flex flex-col mica overflow-hidden win-shadow ${active ? "" : "inactive"} ${
          fullBleed ? "" : "rounded-lg"
        } anim-win-open`}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.w,
          height: rect.h,
          zIndex: win.z,
          opacity: hidden ? 0 : 1,
          transform,
          pointerEvents: hidden ? "none" : "auto",
          transformOrigin: "center bottom",
          transition: geo
            ? "none"
            : "left .2s cubic-bezier(.1,.9,.2,1), top .2s cubic-bezier(.1,.9,.2,1), width .2s cubic-bezier(.1,.9,.2,1), height .2s cubic-bezier(.1,.9,.2,1), opacity .18s, transform .22s cubic-bezier(.1,.9,.2,1)",
        }}
        data-winid={win.id}
        onPointerDownCapture={() => {
          if (!active) os.focusWin(win.id);
        }}
      >
        {/* Title bar */}
        <div
          className={`flex items-stretch shrink-0 ${active ? "text-black dark:text-white" : "text-black/45 dark:text-white/45"}`}
          style={{ height: titleH }}
          onPointerDown={onTitleDown}
          onDoubleClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest("[data-nodrag]") || t.closest("[data-tab]") || t.closest("button")) return;
            os.toggleMax(win.id);
          }}
        >
          {TAB_APPS[win.appId] ? (
            <div ref={setSlot} className="flex-1 min-w-0 flex items-end" />
          ) : (
            <div className="flex-1 min-w-0 flex items-center gap-3 pl-3 text-xs">
              <AppIcon icon={app.icon} size={16} />
              <span className="truncate">{win.title}</span>
            </div>
          )}
          <div className="flex shrink-0" data-nodrag>
            <CaptionBtn onClick={() => os.minimizeWin(win.id)} label="最小化">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0 5h10" stroke="currentColor" strokeWidth="1" />
              </svg>
            </CaptionBtn>
            <div
              className="relative"
              onMouseEnter={() => {
                window.clearTimeout(layoutTimer.current);
                layoutTimer.current = window.setTimeout(() => setLayoutOpen(true), 450);
              }}
              onMouseLeave={() => {
                window.clearTimeout(layoutTimer.current);
                layoutTimer.current = window.setTimeout(() => setLayoutOpen(false), 250);
              }}
            >
              <CaptionBtn
                onClick={() => {
                  setLayoutOpen(false);
                  os.toggleMax(win.id);
                }}
                label={win.max || win.snap ? "向下还原" : "最大化"}
              >
                {win.max || win.snap ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="0.5" y="2.5" width="7" height="7" rx="1" />
                    <path d="M2.5 2.5V1.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="0.5" y="0.5" width="9" height="9" rx="1.2" />
                  </svg>
                )}
              </CaptionBtn>
              {layoutOpen && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 acrylic-strong flyout p-3 grid grid-cols-3 gap-3 anim-menu"
                  style={{ width: 300 }}
                >
                  {LAYOUTS.map((layout, li) => (
                    <div key={li} className="relative h-[54px] rounded-md bg-black/5 dark:bg-white/5 p-[3px]">
                      {layout.map((z, zi) => (
                        <button
                          key={zi}
                          className="absolute rounded-[3px] bg-white/80 dark:bg-white/15 border border-black/15 dark:border-white/15 hover:!bg-[var(--accent)]"
                          style={{
                            left: `calc(${z.x * 100}% + 3px)`,
                            top: `calc(${z.y * 100}% + 3px)`,
                            width: `calc(${z.w * 100}% - 3px)`,
                            height: `calc(${z.h * 100}% - 3px)`,
                          }}
                          onClick={() => {
                            setLayoutOpen(false);
                            os.updateWin(win.id, { snap: z, max: false });
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <CaptionBtn onClick={() => os.closeWin(win.id)} close label="关闭">
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" stroke="currentColor" strokeWidth="1" />
              </svg>
            </CaptionBtn>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative">{children}</div>

        {/* resize handles */}
        {!win.max && (
          <>
            {[
              ["n", "top-0 left-2 right-2 h-1 cursor-n-resize"],
              ["s", "bottom-0 left-2 right-2 h-1 cursor-s-resize"],
              ["w", "left-0 top-2 bottom-2 w-1 cursor-w-resize"],
              ["e", "right-0 top-2 bottom-2 w-1 cursor-e-resize"],
              ["nw", "left-0 top-0 w-2 h-2 cursor-nw-resize"],
              ["ne", "right-0 top-0 w-2 h-2 cursor-ne-resize"],
              ["sw", "left-0 bottom-0 w-2 h-2 cursor-sw-resize"],
              ["se", "right-0 bottom-0 w-3 h-3 cursor-se-resize"],
            ].map(([d, cls]) => (
              <div key={d} className={`absolute z-40 ${cls}`} onPointerDown={onResizeDown(d)} />
            ))}
          </>
        )}
      </div>
    </WindowContext.Provider>
  );
}

function CaptionBtn({
  children,
  onClick,
  close,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  close?: boolean;
  label: string;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`w-[46px] h-8 flex items-center justify-center transition-colors duration-100 ${
        close ? "hover:bg-[#c42b1c] hover:text-white active:bg-[#c42b1c]/80" : "hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10"
      }`}
    >
      {children}
    </button>
  );
}
