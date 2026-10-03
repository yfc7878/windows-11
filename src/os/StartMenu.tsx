import { useEffect, useMemo, useRef, useState } from "react";
import {
  Power20Regular,
  ChevronRight16Regular,
  ChevronLeft16Regular,
  WeatherMoon20Regular,
  ArrowClockwise20Regular,
  LockClosed20Regular,
  SignOut20Regular,
  PersonCircle20Regular,
  Open20Regular,
  Pin20Regular,
  Folder20Regular,
  Shield20Regular,
  Globe20Regular,
  ArrowRight16Regular,
  ArrowTrending16Regular,
} from "@fluentui/react-icons";
import { useOS } from "./store";
import { APPS, appById, PINNED_START } from "./apps";
import { AppIcon, FileIcon } from "./assets";
import { SearchGlyph } from "./glyphs";
import { ContextMenu, type MenuSpec } from "./ContextMenu";

const PY: Record<string, string> = {
  文: "W", 设: "S", 记: "J", 计: "J", 终: "Z", 画: "H", 照: "Z", 任: "R", 相: "X", 日: "R", 邮: "Y", 时: "S",
  电: "D", 媒: "M", 天: "T", 地: "D", 资: "Z", 便: "B", 截: "J", 提: "T", 入: "R", 反: "F", 手: "S", 人: "R",
  录: "L", 获: "H", 回: "H", 此: "C", 用: "Y",
};
export const initial = (name: string) => {
  const c = name[0];
  if (/[a-z]/i.test(c)) return c.toUpperCase();
  return PY[c] || "#";
};

const LISTABLE = APPS.filter((a) => !["thispc", "user", "recycle"].includes(a.id));

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white overflow-hidden shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg,#7fb2ff,#2b6fd6)" }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="currentColor">
        <circle cx="12" cy="8" r="4.2" />
        <path d="M3.5 21c.6-4.4 4.1-7 8.5-7s7.9 2.6 8.5 7z" />
      </svg>
    </div>
  );
}
export { Avatar };

export function StartMenu() {
  const os = useOS();
  const [view, setView] = useState<"pinned" | "all">("pinned");
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState<MenuSpec | null>(null);
  const pages = Math.ceil(PINNED_START.length / 18);
  const wheelLock = useRef(0);

  const recommended = useMemo(() => {
    const files = os.desktop.filter((d) => d.kind === "file").map((d) => ({ name: d.name, sub: "桌面", ext: d.ext || "txt", id: d.id }));
    return [
      ...files,
      { name: "2025 年度总结.docx", sub: "昨天 18:42", ext: "docx", id: "" },
      { name: "项目计划书.pdf", sub: "3 天前", ext: "pdf", id: "" },
      { name: "屏幕截图 2025-05-20.png", sub: "5 月 20 日", ext: "png", id: "" },
      { name: "会议纪要.txt", sub: "5 月 18 日", ext: "txt", id: "" },
      { name: "旅行照片.jpg", sub: "5 月 12 日", ext: "jpg", id: "" },
    ].slice(0, 6);
  }, [os.desktop]);

  const grouped = useMemo(() => {
    const m = new Map<string, typeof LISTABLE>();
    [...LISTABLE]
      .sort((a, b) => (initial(a.name) + a.name).localeCompare(initial(b.name) + b.name))
      .forEach((a) => {
        const k = initial(a.name);
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(a);
      });
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const powerMenu = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({
      x: r.left - 60,
      y: r.top - 4,
      up: true,
      items: [
        { label: "睡眠", icon: <WeatherMoon20Regular />, onClick: () => os.power("sleep") },
        { label: "关机", icon: <Power20Regular />, onClick: () => os.power("shutdown") },
        { label: "重启", icon: <ArrowClockwise20Regular />, onClick: () => os.power("restart") },
      ],
    });
  };
  const userMenu = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({
      x: r.left,
      y: r.top - 4,
      up: true,
      items: [
        { label: "更改帐户设置", icon: <PersonCircle20Regular />, onClick: () => os.openApp("settings", { page: "accounts" }) },
        { label: "锁定", icon: <LockClosed20Regular />, onClick: () => os.power("lock") },
        { label: "注销", icon: <SignOut20Regular />, onClick: () => os.power("signout") },
      ],
    });
  };

  const h = Math.min(726, window.innerHeight - 70);

  return (
    <div
      className="fixed z-[8999] left-1/2 acrylic flyout text-black dark:text-white flex flex-col overflow-hidden anim-slide-up"
      style={{ width: Math.min(642, window.innerWidth - 16), height: h, bottom: 60, marginLeft: -Math.min(642, window.innerWidth - 16) / 2 }}
      data-panel
    >
      <div className="px-8 pt-8 pb-2">
        <button
          className="w-full h-9 rounded-full flex items-center gap-3 px-4 bg-white/80 dark:bg-[#1f1f1f]/70 border border-black/[.06] dark:border-white/[.06] border-b-black/30 dark:border-b-white/30 text-left text-[13px]"
          onClick={() => os.setPanel("search")}
        >
          <SearchGlyph size={14} />
          <span className="opacity-60">搜索应用、设置和文档</span>
        </button>
      </div>

      {view === "pinned" ? (
        <div className="flex-1 min-h-0 flex flex-col px-8">
          <div className="flex items-center justify-between mt-4 mb-3 px-6">
            <span className="font-semibold text-[14px]">已固定</span>
            <button
              className="text-[12px] px-2 h-6 rounded flex items-center gap-1 bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/15"
              onClick={() => setView("all")}
            >
              所有应用 <ChevronRight16Regular className="text-[11px]" />
            </button>
          </div>
          <div
            className="relative"
            onWheel={(e) => {
              const n = Date.now();
              if (n - wheelLock.current < 350) return;
              wheelLock.current = n;
              if (e.deltaY > 0) setPage((p) => Math.min(pages - 1, p + 1));
              else setPage((p) => Math.max(0, p - 1));
            }}
          >
            <div key={page} className="grid grid-cols-6 gap-y-1 h-[264px] content-start anim-fade">
              {PINNED_START.slice(page * 18, page * 18 + 18).map((id) => {
                const app = appById(id);
                return (
                  <button
                    key={id}
                    className="h-[84px] rounded-md flex flex-col items-center justify-center gap-2 hover:bg-white/60 dark:hover:bg-white/[.07] active:opacity-80"
                    onClick={() => os.openApp(id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenu({
                        x: e.clientX,
                        y: e.clientY,
                        items: [
                          { label: "打开", icon: <Open20Regular />, onClick: () => os.openApp(id) },
                          { label: "固定到任务栏", icon: <Pin20Regular /> },
                          { divider: true },
                          { label: "应用设置", icon: <Shield20Regular />, onClick: () => os.openApp("settings", { page: "apps" }) },
                        ],
                      });
                    }}
                  >
                    <AppIcon icon={app.icon} size={32} />
                    <span className="text-[12px] leading-tight px-1 text-center line-clamp-1 max-w-full">{app.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-1.5 rounded-full transition-all ${i === page ? "h-3 bg-black/60 dark:bg-white/70" : "h-1.5 bg-black/30 dark:bg-white/30"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 mb-2 px-6">
            <span className="font-semibold text-[14px]">推荐的项目</span>
            <button className="text-[12px] px-2 h-6 rounded flex items-center gap-1 bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/15">
              更多 <ChevronRight16Regular className="text-[11px]" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 px-2 overflow-hidden">
            {recommended.map((r, i) => (
              <button
                key={i}
                className="h-[52px] rounded-md flex items-center gap-3 px-4 text-left hover:bg-white/60 dark:hover:bg-white/[.07]"
                onClick={() => {
                  if (r.id) {
                    const it = os.desktop.find((d) => d.id === r.id);
                    if (it) os.openDesktopItem(it);
                  } else if (r.ext === "txt") os.openApp("notepad", { name: r.name }, `${r.name} - 记事本`);
                  else if (r.ext === "png" || r.ext === "jpg") os.openApp("photos");
                  else os.openApp("explorer", { path: "文档" });
                }}
              >
                <FileIcon size={32} ext={r.ext} />
                <div className="min-w-0">
                  <div className="text-[12px] truncate">{r.name}</div>
                  <div className="text-[12px] opacity-60 truncate">{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col px-8 anim-slide-left">
          <div className="flex items-center justify-between mt-4 mb-3 px-6">
            <span className="font-semibold text-[14px]">所有应用</span>
            <button
              className="text-[12px] px-2 h-6 rounded flex items-center gap-1 bg-white/70 dark:bg-white/10 border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/15"
              onClick={() => setView("pinned")}
            >
              <ChevronLeft16Regular className="text-[11px]" /> 返回
            </button>
          </div>
          <div className="flex-1 overflow-y-auto win-scroll px-6 pb-4">
            {grouped.map(([letter, apps]) => (
              <div key={letter}>
                <div className="h-9 flex items-center px-3 text-[13px] font-semibold">
                  <span className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/10">{letter}</span>
                </div>
                {apps.map((a) => (
                  <button
                    key={a.id}
                    className="w-full h-10 flex items-center gap-4 px-4 rounded-md hover:bg-white/60 dark:hover:bg-white/[.07] text-[13px]"
                    onClick={() => os.openApp(a.id)}
                  >
                    <AppIcon icon={a.icon} size={24} />
                    {a.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-16 shrink-0 flex items-center justify-between px-12 border-t border-black/[.07] dark:border-white/[.07] bg-black/[.03] dark:bg-black/20">
        <button className="flex items-center gap-3 h-10 px-3 -ml-3 rounded-md hover:bg-white/60 dark:hover:bg-white/[.07]" onClick={userMenu}>
          <Avatar size={32} />
          <span className="text-[12px]">{os.settings.userName}</span>
        </button>
        <div className="flex items-center gap-1">
          <button
            title="文件资源管理器"
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/[.07]"
            onClick={() => os.openApp("explorer")}
          >
            <Folder20Regular />
          </button>
          <button
            title="设置"
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/[.07]"
            onClick={() => os.openApp("settings")}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.1">
              <path d="M10 2.5l1.3 1.6 2-.4.7 1.9 1.9.7-.4 2 1.6 1.3-1.6 1.3.4 2-1.9.7-.7 1.9-2-.4L10 17.5l-1.3-1.6-2 .4-.7-1.9-1.9-.7.4-2L2.5 10l1.6-1.3-.4-2 1.9-.7.7-1.9 2 .4z" />
              <circle cx="10" cy="10" r="2.6" />
            </svg>
          </button>
          <button
            title="电源"
            className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/[.07]"
            onClick={powerMenu}
          >
            <Power20Regular />
          </button>
        </div>
      </div>
      {menu && <ContextMenu spec={menu} onClose={() => setMenu(null)} />}
    </div>
  );
}

const TABS = ["全部", "应用", "文档", "网页", "设置", "文件夹", "照片"];

const SETTINGS_RESULTS = [
  { name: "显示设置", page: "system" },
  { name: "更改桌面背景", page: "personalization" },
  { name: "深色模式", page: "personalization" },
  { name: "蓝牙和其他设备", page: "bluetooth" },
  { name: "WLAN 设置", page: "network" },
  { name: "检查更新", page: "update" },
  { name: "关于你的电脑", page: "about" },
];

export function SearchPanel() {
  const os = useOS();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const query = q.trim().toLowerCase();
  const apps = query ? LISTABLE.filter((a) => a.name.toLowerCase().includes(query) || a.id.includes(query)) : [];
  const settingsRes = query ? SETTINGS_RESULTS.filter((s) => s.name.toLowerCase().includes(query)) : [];
  type R = { kind: "app" | "setting" | "web"; name: string; icon?: string; id?: string; page?: string };
  const results: R[] = [
    ...apps.map((a) => ({ kind: "app" as const, name: a.name, icon: a.icon, id: a.id })),
    ...settingsRes.map((s) => ({ kind: "setting" as const, name: s.name, page: s.page, icon: "settings" })),
    ...(query ? [{ kind: "web" as const, name: q }] : []),
  ];
  const best = results[Math.min(sel, results.length - 1)];

  const run = (r?: R) => {
    if (!r) return;
    if (r.kind === "app") os.openApp(r.id!);
    else if (r.kind === "setting") os.openApp("settings", { page: r.page });
    else os.openApp("edge", { url: "https://www.google.com/search?igu=1&q=" + encodeURIComponent(r.name) });
  };

  return (
    <div
      className="fixed z-[8999] left-1/2 acrylic flyout text-black dark:text-white flex flex-col overflow-hidden anim-slide-up"
      style={{ width: Math.min(800, window.innerWidth - 16), height: Math.min(700, window.innerHeight - 70), bottom: 60, marginLeft: -Math.min(800, window.innerWidth - 16) / 2 }}
      data-panel
    >
      <div className="px-6 pt-6">
        <div className="h-10 rounded-full flex items-center gap-3 px-4 bg-white dark:bg-[#1f1f1f] border border-black/[.06] dark:border-white/[.08] border-b-2 border-b-[var(--accent)]">
          <SearchGlyph size={15} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") run(best);
              if (e.key === "ArrowDown") setSel((s) => Math.min(results.length - 1, s + 1));
              if (e.key === "ArrowUp") setSel((s) => Math.max(0, s - 1));
            }}
            placeholder="在此键入以搜索"
            className="flex-1 bg-transparent outline-none text-[14px]"
          />
        </div>
        <div className="flex items-center gap-1 mt-3 text-[13px] overflow-x-auto no-scroll">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`relative px-3 h-8 rounded-md hover:bg-white/60 dark:hover:bg-white/[.07] whitespace-nowrap ${tab === i ? "font-semibold" : "opacity-80"}`}
            >
              {t}
              {tab === i && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 w-4 h-[3px] rounded-full accent-bg" />}
            </button>
          ))}
        </div>
      </div>

      {!query ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-4 p-6 pt-4 overflow-y-auto win-scroll">
          <div>
            <div className="font-semibold text-[14px] mb-2">热门应用</div>
            <div className="grid grid-cols-3 gap-2">
              {["edge", "explorer", "settings", "notepad", "calculator", "terminal"].map((id) => {
                const a = appById(id);
                return (
                  <button
                    key={id}
                    className="card rounded-md h-[86px] flex flex-col items-center justify-center gap-2 text-[12px] hover:bg-white dark:hover:bg-white/10"
                    onClick={() => os.openApp(id)}
                  >
                    <AppIcon icon={a.icon} size={30} />
                    <span className="truncate max-w-full px-1">{a.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="font-semibold text-[14px] mt-5 mb-2">快速搜索</div>
            <div className="flex flex-wrap gap-2">
              {["今天的天气", "热门新闻", "汇率换算", "翻译", "今日电影"].map((t) => (
                <button
                  key={t}
                  className="card rounded-full px-3 h-8 text-[12.5px] flex items-center gap-2 hover:bg-white dark:hover:bg-white/10"
                  onClick={() => run({ kind: "web", name: t })}
                >
                  <ArrowTrending16Regular /> {t}
                </button>
              ))}
            </div>
          </div>
          <div className="card rounded-lg p-5 overflow-hidden relative">
            <div className="absolute inset-0 opacity-90" style={{ background: "linear-gradient(135deg, rgba(76,194,255,.25), rgba(168,85,247,.2))" }} />
            <div className="relative">
              <div className="text-[12px] opacity-70">{new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}</div>
              <div className="text-[22px] font-semibold mt-1 font-display">今日搜索精选</div>
              <div className="text-[13px] opacity-80 mt-2 leading-relaxed">
                探索今天的热门话题、精选图片与小知识。点击下方卡片，在 Microsoft Edge 中查看更多内容。
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {["世界地球日", "春季旅行目的地", "AI 最新进展", "天文：流星雨"].map((t, i) => (
                  <button
                    key={t}
                    className="h-20 rounded-md overflow-hidden relative text-left text-white text-[12px]"
                    onClick={() => run({ kind: "web", name: t })}
                  >
                    <img src={`https://picsum.photos/seed/srch${i}/300/200`} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-1.5 left-2 font-semibold">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_1fr] gap-4 p-6 pt-3">
          <div className="overflow-y-auto win-scroll">
            {results.length > 0 && <div className="font-semibold text-[13px] mb-2">最佳匹配</div>}
            {results.map((r, i) => (
              <div key={i}>
                {i === 1 && <div className="font-semibold text-[13px] mt-3 mb-2">{r.kind === "web" ? "搜索网页" : "更多结果"}</div>}
                <button
                  onMouseEnter={() => setSel(i)}
                  onClick={() => run(r)}
                  className={`w-full flex items-center gap-3 px-3 rounded-md text-left ${i === 0 ? "h-16" : "h-11"} ${
                    sel === i ? "bg-white/80 dark:bg-white/10" : "hover:bg-white/60 dark:hover:bg-white/5"
                  }`}
                >
                  {r.kind === "web" ? (
                    <SearchGlyph size={i === 0 ? 28 : 18} />
                  ) : (
                    <AppIcon icon={r.icon!} size={i === 0 ? 32 : 22} />
                  )}
                  <div className="min-w-0">
                    <div className="text-[13px] truncate">{r.kind === "web" ? `${r.name} - 查看网页结果` : r.name}</div>
                    <div className="text-[12px] opacity-60">{r.kind === "app" ? "应用" : r.kind === "setting" ? "系统设置" : "网页"}</div>
                  </div>
                </button>
              </div>
            ))}
          </div>
          {best && (
            <div className="card rounded-lg flex flex-col items-center pt-8 overflow-hidden anim-fade" key={best.name}>
              {best.kind === "web" ? <Globe20Regular className="text-[56px] accent-text" /> : <AppIcon icon={best.icon!} size={64} />}
              <div className="mt-3 text-[18px] font-semibold text-center px-4">{best.name}</div>
              <div className="text-[12px] opacity-60">{best.kind === "app" ? "应用" : best.kind === "setting" ? "系统设置" : "网页搜索"}</div>
              <div className="w-full h-px bg-black/10 dark:bg-white/10 my-4" />
              <div className="w-full px-4 text-[13px]">
                {[
                  { l: "打开", ic: <Open20Regular /> },
                  ...(best.kind === "app"
                    ? [
                        { l: "以管理员身份运行", ic: <Shield20Regular /> },
                        { l: "打开文件位置", ic: <Folder20Regular /> },
                        { l: "固定到“开始”屏幕", ic: <Pin20Regular /> },
                      ]
                    : []),
                ].map((a, i) => (
                  <button
                    key={i}
                    className="w-full h-9 flex items-center gap-3 px-3 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => (i === 2 ? os.openApp("explorer", { path: "C:\\Program Files" }) : run(best))}
                  >
                    <span className="accent-text text-[16px] flex">{a.ic}</span>
                    {a.l}
                    {i === 0 && <ArrowRight16Regular className="ml-auto opacity-50" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
