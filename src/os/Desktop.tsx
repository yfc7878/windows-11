import { useEffect, useRef, useState } from "react";
import {
  Grid20Regular,
  ArrowSort20Regular,
  ArrowClockwise20Regular,
  AddCircle20Regular,
  Desktop20Regular,
  PaintBrush20Regular,
  WindowConsole20Regular,
  MoreHorizontal20Regular,
  Folder20Regular,
  Document20Regular,
  Cut20Regular,
  Copy20Regular,
  Rename20Regular,
  Delete20Regular,
  Open20Regular,
  Info20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import { useOS, TASKBAR_H, type DesktopItem } from "./store";
import { appById } from "./apps";
import { AppIcon, FileIcon, Img, wallUrl, WALLPAPERS, iconUrl } from "./assets";
import { ContextMenu, type MenuSpec } from "./ContextMenu";

const CELL_W = 84;
const CELL_H = 104;
const ICON = { sm: 32, md: 48, lg: 72 };

export function Wallpaper() {
  const { settings } = useOS();
  const src = wallUrl(WALLPAPERS[settings.wallpaper] || WALLPAPERS[0]);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a3b7c]">
      <Img key={src} src={src} className="absolute inset-0 w-full h-full object-cover anim-fade" alt="" />
    </div>
  );
}

function ItemIcon({ it, size }: { it: DesktopItem; size: number }) {
  const os = useOS();
  if (it.kind === "app" && it.appId) {
    if (it.appId === "recycle") return <Img src={iconUrl(os.recycle.length ? "bin1" : "bin0")} style={{ width: size, height: size }} alt="" />;
    return <AppIcon icon={appById(it.appId).icon} size={size} />;
  }
  if (it.kind === "folder") return <Img src={iconUrl("win/folder")} style={{ width: size, height: size }} alt="" />;
  return <FileIcon size={size} ext={it.ext} />;
}

export function Desktop() {
  const os = useOS();
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState<MenuSpec | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number; ids: string[] } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const size = ICON[os.settings.iconSize];

  const cellPos = (it: DesktopItem) => ({ left: 4 + it.col * CELL_W, top: 4 + it.row * CELL_H });

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea,[contenteditable]")) return;
      if (os.wins.some((w) => w.id === os.activeId && !w.min)) return;
      if (e.key === "Delete" && selected.length) {
        os.deleteDesktopItems(selected);
        setSelected([]);
      } else if (e.key === "F2" && selected.length === 1) setRenaming(selected[0]);
      else if (e.key === "Enter" && selected.length) selected.forEach((id) => {
        const it = os.desktop.find((d) => d.id === id);
        if (it) os.openDesktopItem(it);
      });
      else if (e.key === "F5") os.refresh();
      else if (e.key.toLowerCase() === "a" && e.ctrlKey) {
        e.preventDefault();
        setSelected(os.desktop.map((d) => d.id));
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const onBgDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    os.setPanel(null);
    os.setActiveId(null);
    setSelected([]);
    const sx = e.clientX;
    const sy = e.clientY;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const x = Math.min(sx, ev.clientX);
      const y = Math.min(sy, ev.clientY);
      const w = Math.abs(ev.clientX - sx);
      const h = Math.abs(ev.clientY - sy);
      setRect({ x, y, w, h });
      const sel = os.desktop
        .filter((it) => {
          const p = cellPos(it);
          const ix = p.left + 6;
          const iy = p.top + 2;
          return ix < x + w && ix + CELL_W - 12 > x && iy < y + h && iy + CELL_H - 8 > y;
        })
        .map((i) => i.id);
      setSelected(sel);
    };
    const up = () => {
      setRect(null);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const onItemDown = (it: DesktopItem) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    os.setPanel(null);
    let ids = selected;
    if (e.ctrlKey) {
      ids = selected.includes(it.id) ? selected.filter((s) => s !== it.id) : [...selected, it.id];
      setSelected(ids);
      return;
    }
    if (!selected.includes(it.id)) {
      ids = [it.id];
      setSelected(ids);
    }
    const sx = e.clientX;
    const sy = e.clientY;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    let moved = false;
    let last = { dx: 0, dy: 0 };
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      moved = true;
      last = { dx, dy };
      setDrag({ dx, dy, ids });
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      setDrag(null);
      if (!moved) return;
      const dc = Math.round(last.dx / CELL_W);
      const dr = Math.round(last.dy / CELL_H);
      if (!dc && !dr) return;
      const maxR = Math.floor((window.innerHeight - TASKBAR_H - 8) / CELL_H) - 1;
      const maxC = Math.floor(window.innerWidth / CELL_W) - 1;
      const moving = os.desktop.filter((d) => ids.includes(d.id));
      const targets = moving.map((m) => ({
        id: m.id,
        col: Math.max(0, Math.min(maxC, m.col + dc)),
        row: Math.max(0, Math.min(maxR, m.row + dr)),
      }));
      const others = os.desktop.filter((d) => !ids.includes(d.id));
      const conflict = targets.some((t) => others.some((o) => o.col === t.col && o.row === t.row));
      if (conflict) return;
      os.setDesktop((d) => d.map((x) => {
        const t = targets.find((tt) => tt.id === x.id);
        return t ? { ...x, col: t.col, row: t.row } : x;
      }));
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const autoArrange = (by: "name" | "type") => {
    const maxR = Math.max(1, Math.floor((window.innerHeight - TASKBAR_H - 8) / CELL_H));
    const sorted = [...os.desktop].sort((a, b) =>
      by === "name" ? a.name.localeCompare(b.name, "zh-CN") : a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, "zh-CN")
    );
    os.setDesktop(sorted.map((it, i) => ({ ...it, col: Math.floor(i / maxR), row: i % maxR })));
  };

  const bgMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelected([]);
    os.setPanel(null);
    const iconSize = os.settings.iconSize;
    setMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: "查看",
          icon: <Grid20Regular />,
          sub: [
            { label: "大图标", checked: iconSize === "lg", onClick: () => os.set("iconSize", "lg") },
            { label: "中等图标", checked: iconSize === "md", onClick: () => os.set("iconSize", "md") },
            { label: "小图标", checked: iconSize === "sm", onClick: () => os.set("iconSize", "sm") },
            { divider: true },
            { label: "显示桌面图标", checked: os.settings.showIcons, onClick: () => os.toggle("showIcons") },
          ],
        },
        {
          label: "排序方式",
          icon: <ArrowSort20Regular />,
          sub: [
            { label: "名称", onClick: () => autoArrange("name") },
            { label: "项目类型", onClick: () => autoArrange("type") },
          ],
        },
        {
          label: "刷新",
          icon: <ArrowClockwise20Regular />,
          onClick: () => os.refresh(),
        },
        { divider: true },
        {
          label: "新建",
          icon: <AddCircle20Regular />,
          sub: [
            {
              label: "文件夹",
              icon: <Folder20Regular />,
              onClick: () => {
                const id = os.createDesktopItem("folder", "新建文件夹");
                setSelected([id]);
                setTimeout(() => setRenaming(id), 50);
              },
            },
            { divider: true },
            {
              label: "文本文档",
              icon: <Document20Regular />,
              onClick: () => {
                const id = os.createDesktopItem("file", "新建 文本文档.txt", "txt");
                setSelected([id]);
                setTimeout(() => setRenaming(id), 50);
              },
            },
          ],
        },
        { divider: true },
        { label: "显示设置", icon: <Desktop20Regular />, onClick: () => os.openApp("settings", { page: "system" }) },
        { label: "个性化", icon: <PaintBrush20Regular />, onClick: () => os.openApp("settings", { page: "personalization" }) },
        { divider: true },
        { label: "在终端中打开", icon: <WindowConsole20Regular />, onClick: () => os.openApp("terminal") },
        { divider: true },
        { label: "显示更多选项", icon: <MoreHorizontal20Regular />, shortcut: "Shift+F10" },
      ],
    });
  };

  const itemMenu = (it: DesktopItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selected.includes(it.id)) setSelected([it.id]);
    const ids = selected.includes(it.id) ? selected : [it.id];
    const isBin = it.appId === "recycle";
    setMenu({
      x: e.clientX,
      y: e.clientY,
      top: isBin
        ? undefined
        : [
            { icon: <Cut20Regular />, label: "剪切", onClick: () => {} },
            { icon: <Copy20Regular />, label: "复制", onClick: () => {} },
            { icon: <Rename20Regular />, label: "重命名", onClick: () => setRenaming(it.id) },
            { icon: <Share20Regular />, label: "共享", onClick: () => {} },
            {
              icon: <Delete20Regular />,
              label: "删除",
              onClick: () => {
                os.deleteDesktopItems(ids);
                setSelected([]);
              },
            },
          ],
      items: [
        { label: "打开", icon: <Open20Regular />, shortcut: "Enter", onClick: () => os.openDesktopItem(it) },
        ...(it.kind === "file" ? [{ label: "使用记事本打开", icon: <AppIcon icon="notepad" size={16} />, onClick: () => os.openDesktopItem(it) }] : []),
        ...(isBin ? [{ label: "清空回收站", icon: <Delete20Regular />, disabled: os.recycle.length === 0, onClick: () => os.emptyRecycle() }] : []),
        { divider: true },
        {
          label: "属性",
          icon: <Info20Regular />,
          shortcut: "Alt+Enter",
          onClick: () =>
            os.notify({
              icon: "explorer",
              app: "文件资源管理器",
              title: `${it.name} 属性`,
              body: it.kind === "app" ? "类型：快捷方式" : it.kind === "folder" ? "类型：文件夹 · 0 个项目" : `类型：文本文档 · ${(it.content || "").length} 字节`,
            }),
        },
        { divider: true },
        { label: "显示更多选项", icon: <MoreHorizontal20Regular />, shortcut: "Shift+F10" },
      ],
    });
  };

  return (
    <div
      ref={ref}
      className="absolute inset-0 bottom-12"
      onPointerDown={onBgDown}
      onContextMenu={bgMenu}
    >
      {os.settings.showIcons && (
        <div key={os.refreshKey} className="anim-fade">
          {os.desktop.map((it) => {
            const p = cellPos(it);
            const isSel = selected.includes(it.id);
            const isDrag = drag && drag.ids.includes(it.id);
            return (
              <div
                key={it.id}
                className={`absolute flex flex-col items-center pt-1.5 rounded-[3px] border ${
                  isSel ? "bg-white/25 border-white/40" : "border-transparent hover:bg-white/10 hover:border-white/20"
                }`}
                style={{
                  left: p.left + (isDrag ? drag!.dx : 0),
                  top: p.top + (isDrag ? drag!.dy : 0),
                  width: CELL_W - 8,
                  minHeight: size + 30,
                  opacity: isDrag ? 0.75 : 1,
                  zIndex: isDrag ? 5 : 1,
                }}
                onPointerDown={onItemDown(it)}
                onDoubleClick={() => os.openDesktopItem(it)}
                onContextMenu={itemMenu(it)}
              >
                <div className="relative">
                  <ItemIcon it={it} size={size} />
                  {it.kind === "app" && !["recycle", "thispc", "user"].includes(it.appId!) && (
                    <svg className="absolute -left-0.5 bottom-0" width="14" height="14" viewBox="0 0 14 14">
                      <rect x="0.5" y="0.5" width="13" height="13" rx="1.5" fill="#fff" stroke="#bbb" />
                      <path d="M4 10.5c0-4 2-5.5 5.5-5.5M7 3l2.8 2-2.8 2.2" fill="none" stroke="#0067c0" strokeWidth="1.5" />
                    </svg>
                  )}
                </div>
                {renaming === it.id ? (
                  <textarea
                    autoFocus
                    defaultValue={it.name}
                    onFocus={(e) => {
                      const v = e.target.value;
                      const dot = v.lastIndexOf(".");
                      e.target.setSelectionRange(0, dot > 0 && it.kind === "file" ? dot : v.length);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v) os.updateDesktopItem(it.id, { name: v });
                      setRenaming(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLTextAreaElement).blur();
                      }
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    className="mt-1 w-full text-[12px] text-center text-black bg-white outline-none border border-[#0078d4] resize-none leading-tight"
                    rows={2}
                  />
                ) : (
                  <span
                    className={`mt-1 mb-1 px-0.5 text-[12px] leading-[15px] text-white text-center break-words w-full ${isSel ? "" : "line-clamp-2"}`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,.9), 0 0 4px rgba(0,0,0,.5)" }}
                  >
                    {it.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {rect && (
        <div
          className="fixed pointer-events-none border border-[#0078d7] bg-[#0078d7]/30"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      )}
      {menu && <ContextMenu spec={menu} onClose={() => setMenu(null)} />}
    </div>
  );
}
