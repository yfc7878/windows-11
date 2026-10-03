import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight16Regular } from "@fluentui/react-icons";

export type MenuItem =
  | {
      label: string;
      icon?: ReactNode;
      onClick?: () => void;
      sub?: MenuItem[];
      shortcut?: string;
      disabled?: boolean;
      checked?: boolean;
    }
  | { divider: true };

export type MenuSpec = {
  x: number;
  y: number;
  items: MenuItem[];
  top?: { icon: ReactNode; label: string; onClick: () => void }[];
  up?: boolean;
};

export function ContextMenu({ spec, onClose }: { spec: MenuSpec; onClose: () => void }) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-ctxmenu]")) onClose();
    };
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const t = setTimeout(() => {
      window.addEventListener("pointerdown", h);
      window.addEventListener("keydown", k);
    }, 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", h);
      window.removeEventListener("keydown", k);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
      <MenuList x={spec.x} y={spec.y} items={spec.items} top={spec.top} onClose={onClose} up={spec.up} />
    </div>
  );
}

function MenuList({
  x,
  y,
  items,
  top,
  onClose,
  up,
  isSub,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  top?: MenuSpec["top"];
  onClose: () => void;
  up?: boolean;
  isSub?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y, ready: false });
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [subPos, setSubPos] = useState({ x: 0, y: 0 });
  const timer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let nx = x;
    let ny = up ? y - r.height : y;
    if (nx + r.width > window.innerWidth - 4) nx = isSub ? x - r.width - (ref.current?.dataset.pw ? Number(ref.current.dataset.pw) : 0) : window.innerWidth - r.width - 4;
    if (ny + r.height > window.innerHeight - 52) ny = Math.max(4, window.innerHeight - 52 - r.height);
    if (nx < 4) nx = 4;
    setPos({ x: nx, y: ny, ready: true });
  }, [x, y, up, isSub]);

  return (
    <>
      <div
        ref={ref}
        data-ctxmenu
        className="fixed pointer-events-auto acrylic-strong flyout py-1 min-w-[220px] text-[13.5px] text-black dark:text-white anim-menu"
        style={{ left: pos.x, top: pos.y, visibility: pos.ready ? "visible" : "hidden" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {top && (
          <>
            <div className="flex px-1 gap-0.5 pb-1">
              {top.map((t, i) => (
                <button
                  key={i}
                  title={t.label}
                  className="w-9 h-8 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => {
                    t.onClick();
                    onClose();
                  }}
                >
                  {t.icon}
                </button>
              ))}
            </div>
            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
          </>
        )}
        {items.map((it, i) =>
          "divider" in it ? (
            <div key={i} className="h-px bg-black/10 dark:bg-white/10 my-1" />
          ) : (
            <div key={i} className="px-1">
              <button
                disabled={it.disabled}
                className={`w-full h-8 flex items-center gap-3 px-3 rounded text-left ${
                  it.disabled ? "opacity-40" : "hover:bg-black/5 dark:hover:bg-white/10"
                } ${openSub === i ? "bg-black/5 dark:bg-white/10" : ""}`}
                onMouseEnter={(e) => {
                  window.clearTimeout(timer.current);
                  if (it.sub) {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    timer.current = window.setTimeout(() => {
                      setSubPos({ x: r.right + 2, y: r.top - 4 });
                      setOpenSub(i);
                    }, 180);
                  } else timer.current = window.setTimeout(() => setOpenSub(null), 200);
                }}
                onClick={() => {
                  if (it.sub) {
                    setOpenSub(i);
                    return;
                  }
                  it.onClick?.();
                  onClose();
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0 text-[16px]">
                  {it.checked ? <span className="w-1.5 h-1.5 rounded-full bg-current" /> : it.icon}
                </span>
                <span className="flex-1 truncate">{it.label}</span>
                {it.shortcut && <span className="text-xs opacity-60">{it.shortcut}</span>}
                {it.sub && <ChevronRight16Regular className="opacity-70" />}
              </button>
            </div>
          )
        )}
      </div>
      {openSub !== null && "sub" in items[openSub] && (items[openSub] as any).sub && (
        <MenuList x={subPos.x} y={subPos.y} items={(items[openSub] as any).sub} onClose={onClose} isSub />
      )}
    </>
  );
}
