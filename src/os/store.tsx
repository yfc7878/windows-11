import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { appById } from "./apps";

export type Phase = "boot" | "lock" | "desktop" | "shutdown" | "restart" | "off" | "signout";
export type Panel = "start" | "search" | "widgets" | "quick" | "calendar" | "tray" | "taskview" | null;
export type Frac = { x: number; y: number; w: number; h: number };

export type Win = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  min: boolean;
  max: boolean;
  snap: Frac | null;
  payload?: any;
  closing?: boolean;
};

export type DesktopItem = {
  id: string;
  name: string;
  kind: "app" | "folder" | "file";
  appId?: string;
  ext?: string;
  content?: string;
  col: number;
  row: number;
};

export type Notif = { id: string; icon: string; app: string; title: string; body: string; time: number };

export type Settings = {
  theme: "light" | "dark";
  wallpaper: number;
  accent: number;
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  saver: boolean;
  nightlight: boolean;
  focus: boolean;
  hotspot: boolean;
  volume: number;
  brightness: number;
  iconSize: "sm" | "md" | "lg";
  showIcons: boolean;
  transparency: boolean;
  userName: string;
};

export const ACCENTS: { name: string; light: string; dark: string }[] = [
  { name: "默认蓝", light: "#0067c0", dark: "#4cc2ff" },
  { name: "海军蓝", light: "#0063b1", dark: "#60cdff" },
  { name: "紫色", light: "#744da9", dark: "#c5a3ff" },
  { name: "玫红", light: "#c30052", dark: "#ff8fb7" },
  { name: "红色", light: "#c42b1c", dark: "#ff99a4" },
  { name: "橙色", light: "#ca5010", dark: "#ffb07a" },
  { name: "金色", light: "#986f0b", dark: "#f9d55a" },
  { name: "绿色", light: "#107c10", dark: "#6ccb5f" },
  { name: "青色", light: "#038387", dark: "#5ee0d8" },
  { name: "石板灰", light: "#515c6b", dark: "#b3c2d4" },
];

const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  wallpaper: 0,
  accent: 0,
  wifi: true,
  bluetooth: true,
  airplane: false,
  saver: false,
  nightlight: false,
  focus: false,
  hotspot: false,
  volume: 64,
  brightness: 100,
  iconSize: "md",
  showIcons: true,
  transparency: true,
  userName: "Windows 用户",
};

const DEFAULT_DESKTOP: DesktopItem[] = [
  { id: "d-pc", name: "此电脑", kind: "app", appId: "thispc", col: 0, row: 0 },
  { id: "d-bin", name: "回收站", kind: "app", appId: "recycle", col: 0, row: 1 },
  { id: "d-user", name: "用户", kind: "app", appId: "user", col: 0, row: 2 },
  { id: "d-edge", name: "Microsoft Edge", kind: "app", appId: "edge", col: 0, row: 3 },
  { id: "d-store", name: "Microsoft Store", kind: "app", appId: "store", col: 0, row: 4 },
  { id: "d-code", name: "Visual Studio Code", kind: "app", appId: "code", col: 0, row: 5 },
  { id: "d-term", name: "终端", kind: "app", appId: "terminal", col: 1, row: 0 },
  { id: "d-paint", name: "画图", kind: "app", appId: "paint", col: 1, row: 1 },
  { id: "d-spotify", name: "Spotify", kind: "app", appId: "spotify", col: 1, row: 2 },
  {
    id: "d-readme",
    name: "欢迎使用.txt",
    kind: "file",
    ext: "txt",
    col: 1,
    row: 3,
    content:
      "欢迎使用 Windows 11 网页版！\r\n\r\n小提示：\r\n• 点击任务栏中间的 Windows 徽标打开开始菜单\r\n• 拖动窗口到屏幕左/右边缘可贴靠，拖到顶部可最大化\r\n• 将鼠标悬停在最大化按钮上可使用贴靠布局\r\n• 桌面右键可新建文件夹/文本文档、刷新、个性化\r\n• 右下角的网络/音量图标可打开快速设置\r\n• 点击时间可打开通知中心与日历\r\n• 快捷键：Alt+T 打开终端，Esc 关闭弹出面板\r\n",
  },
];

function load<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return def;
    const parsed = JSON.parse(v);
    if (typeof def === "object" && !Array.isArray(def)) return { ...def, ...parsed };
    return parsed;
  } catch {
    return def;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

type Ctx = ReturnType<typeof useOSState>;
const OSContext = createContext<Ctx | null>(null);

export const TASKBAR_H = 48;

function useOSState() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [settings, setSettings] = useState<Settings>(() => load("w11.settings", DEFAULT_SETTINGS));
  const [desktop, setDesktop] = useState<DesktopItem[]>(() => load("w11.desktop", DEFAULT_DESKTOP));
  const [recycle, setRecycle] = useState<DesktopItem[]>(() => load("w11.recycle", []));
  const [wins, setWins] = useState<Win[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [panel, setPanelRaw] = useState<Panel>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [toasts, setToasts] = useState<Notif[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const zRef = useRef(10);

  useEffect(() => localStorage.setItem("w11.settings", JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem("w11.desktop", JSON.stringify(desktop)), [desktop]);
  useEffect(() => localStorage.setItem("w11.recycle", JSON.stringify(recycle)), [recycle]);

  // apply theme + accent
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    const a = ACCENTS[settings.accent] || ACCENTS[0];
    const c = settings.theme === "dark" ? a.dark : a.light;
    root.style.setProperty("--accent", c);
    root.style.setProperty("--accent-text", settings.theme === "dark" ? "#000" : "#fff");
  }, [settings.theme, settings.accent]);

  const setPanel = (p: Panel) => setPanelRaw(p);
  const togglePanel = (p: Panel) => setPanelRaw((cur) => (cur === p ? null : p));

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));
  const toggle = (k: keyof Settings) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const setTheme = (theme: "light" | "dark") =>
    setSettings((s) => ({
      ...s,
      theme,
      wallpaper: s.wallpaper <= 1 ? (theme === "dark" ? 1 : 0) : s.wallpaper,
    }));

  const notify = (n: Omit<Notif, "id" | "time">) => {
    const item = { ...n, id: uid(), time: Date.now() };
    setNotifs((l) => [item, ...l]);
    if (!settings.focus) {
      setToasts((l) => [...l, item]);
      setTimeout(() => setToasts((l) => l.filter((t) => t.id !== item.id)), 5200);
    }
  };
  const dismissToast = (id: string) => setToasts((l) => l.filter((t) => t.id !== id));
  const clearNotifs = () => setNotifs([]);
  const removeNotif = (id: string) => setNotifs((l) => l.filter((n) => n.id !== id));

  const focusWin = (id: string) => {
    zRef.current += 1;
    const z = zRef.current;
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z, min: false } : w)));
    setActiveId(id);
  };

  const openApp = (appId: string, payload?: any, title?: string) => {
    const app = appById(appId);
    if (!app) return;
    setPanelRaw(null);
    if (app.external) {
      window.open(app.external, "_blank");
      return;
    }
    // explorer-like aliases
    let realApp = appId;
    let realPayload = payload;
    if (appId === "thispc") {
      realApp = "explorer";
      realPayload = payload ?? { path: "此电脑" };
    } else if (appId === "user") {
      realApp = "explorer";
      realPayload = payload ?? { path: "C:\\用户\\" + settings.userName };
    } else if (appId === "onedrive") {
      realApp = "explorer";
      realPayload = payload ?? { path: "OneDrive" };
    }
    const def = appById(realApp);
    const existing = wins.find((w) => w.appId === realApp && !w.closing);
    if (existing && !def.multi) {
      if (realPayload !== undefined) {
        setWins((ws) => ws.map((w) => (w.id === existing.id ? { ...w, payload: realPayload } : w)));
      }
      focusWin(existing.id);
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight - TASKBAR_H;
    const w = Math.min(def.w || 900, vw - 40);
    const h = Math.min(def.h || 600, vh - 40);
    const offset = (wins.length % 6) * 26;
    zRef.current += 1;
    const id = uid();
    const win: Win = {
      id,
      appId: realApp,
      title: title || def.name,
      x: Math.max(10, Math.round((vw - w) / 2) - 60 + offset),
      y: Math.max(10, Math.round((vh - h) / 2) - 30 + offset),
      w,
      h,
      z: zRef.current,
      min: false,
      max: vw < 700,
      snap: null,
      payload: realPayload,
    };
    setWins((ws) => [...ws, win]);
    setActiveId(id);
  };

  const closeWin = (id: string) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, closing: true } : w)));
    setTimeout(() => setWins((ws) => ws.filter((w) => w.id !== id)), 160);
    setActiveId((a) => (a === id ? null : a));
  };

  const minimizeWin = (id: string) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
    setActiveId((a) => (a === id ? null : a));
  };

  const toggleMax = (id: string) => {
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max && !w.snap, snap: null } : w)));
    focusWin(id);
  };

  const updateWin = (id: string, patch: Partial<Win>) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));

  const showDesktop = () => {
    const anyVisible = wins.some((w) => !w.min);
    setWins((ws) => ws.map((w) => ({ ...w, min: anyVisible ? true : false })));
    setActiveId(null);
    setPanelRaw(null);
  };

  const taskbarClick = (appId: string) => {
    const list = wins.filter((w) => w.appId === appId && !w.closing);
    if (list.length === 0) return openApp(appId);
    const top = list.reduce((a, b) => (a.z > b.z ? a : b));
    if (top.id === activeId && !top.min) minimizeWin(top.id);
    else focusWin(top.id);
  };

  // desktop helpers
  const nextFreeCell = (items: DesktopItem[]) => {
    const rows = Math.max(1, Math.floor((window.innerHeight - TASKBAR_H - 8) / 104));
    for (let c = 0; c < 30; c++)
      for (let r = 0; r < rows; r++) if (!items.some((i) => i.col === c && i.row === r)) return { col: c, row: r };
    return { col: 0, row: 0 };
  };
  const createDesktopItem = (kind: "folder" | "file", baseName: string, ext?: string) => {
    let name = baseName;
    let i = 2;
    while (desktop.some((d) => d.name === name)) name = `${baseName.replace(/(\.\w+)$/, "")} (${i++})${ext ? "." + ext : ""}`;
    const cell = nextFreeCell(desktop);
    const item: DesktopItem = { id: uid(), name, kind, ext, content: kind === "file" ? "" : undefined, ...cell };
    setDesktop((d) => [...d, item]);
    return item.id;
  };
  const deleteDesktopItems = (ids: string[]) => {
    const removed = desktop.filter((d) => ids.includes(d.id) && d.appId !== "recycle");
    if (!removed.length) return;
    setRecycle((r) => [...r, ...removed]);
    setDesktop((d) => d.filter((x) => !removed.some((r) => r.id === x.id)));
  };
  const restoreItems = (ids: string[]) => {
    const items = recycle.filter((r) => ids.includes(r.id));
    setRecycle((r) => r.filter((x) => !ids.includes(x.id)));
    setDesktop((d) => {
      const out = [...d];
      for (const it of items) {
        const taken = out.some((o) => o.col === it.col && o.row === it.row);
        out.push(taken ? { ...it, ...nextFreeCell(out) } : it);
      }
      return out;
    });
  };
  const emptyRecycle = () => setRecycle([]);
  const updateDesktopItem = (id: string, patch: Partial<DesktopItem>) =>
    setDesktop((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const openDesktopItem = (it: DesktopItem) => {
    if (it.kind === "app" && it.appId) openApp(it.appId);
    else if (it.kind === "folder") openApp("explorer", { path: "桌面\\" + it.name });
    else if (it.kind === "file") openApp("notepad", { fileId: it.id }, `${it.name} - 记事本`);
  };

  const power = (act: "shutdown" | "restart" | "lock" | "signout" | "sleep") => {
    setPanelRaw(null);
    if (act === "lock") return setPhase("lock");
    if (act === "sleep") return setPhase("lock");
    setWins([]);
    setPhase(act === "signout" ? "signout" : act);
  };

  return {
    phase,
    setPhase,
    settings,
    set,
    toggle,
    setTheme,
    desktop,
    setDesktop,
    recycle,
    wins,
    activeId,
    setActiveId,
    panel,
    setPanel,
    togglePanel,
    notifs,
    toasts,
    notify,
    dismissToast,
    clearNotifs,
    removeNotif,
    openApp,
    closeWin,
    minimizeWin,
    toggleMax,
    focusWin,
    updateWin,
    showDesktop,
    taskbarClick,
    createDesktopItem,
    deleteDesktopItems,
    restoreItems,
    emptyRecycle,
    updateDesktopItem,
    openDesktopItem,
    refreshKey,
    refresh: () => setRefreshKey((k) => k + 1),
    power,
  };
}

export function OSProvider({ children }: { children: ReactNode }) {
  const value = useOSState();
  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const c = useContext(OSContext);
  if (!c) throw new Error("no os");
  return c;
}

export function useClock(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

export const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
export const fmtTime = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
export const fmtDate = (d: Date) => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
