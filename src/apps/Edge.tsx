import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  ArrowClockwise20Regular,
  Home20Regular,
  LockClosed16Regular,
  Star20Regular,
  StarFilled,
  Dismiss12Regular,
  Add16Regular,
  MoreHorizontal20Regular,
  Open20Regular,
  Search20Regular,
  Settings20Regular,
  Collections20Regular,
  ArrowDownload20Regular,
} from "@fluentui/react-icons";
import { useOS, type Win } from "../os/store";
import { useWin } from "../os/Window";
import { AppIcon } from "../os/assets";
import { Avatar } from "../os/StartMenu";

const NEWTAB = "edge://newtab";
type Tab = { id: number; hist: string[]; idx: number; key: number };

const QUICK = [
  { n: "Google", u: "https://www.google.com/webhp?igu=1", c: "#4285f4", l: "G" },
  { n: "维基百科", u: "https://zh.wikipedia.org/wiki/Windows_11", c: "#333", l: "W" },
  { n: "OpenStreetMap", u: "https://www.openstreetmap.org/export/embed.html?bbox=116.30%2C39.88%2C116.48%2C39.97&layer=mapnik", c: "#7ebc6f", l: "M" },
  { n: "YouTube", u: "https://www.youtube.com/embed/jfKfPfyJRdk", c: "#ff0000", l: "▶" },
  { n: "Example", u: "https://example.com", c: "#6b6b6b", l: "E" },
  { n: "Win11 React", u: "https://win11.blueedge.me", c: "#0078d4", l: "⊞" },
  { n: "Bing", u: "https://www.bing.com", c: "#008373", l: "b" },
  { n: "GitHub", u: "https://github.com", c: "#24292f", l: "" },
];

const titleOf = (u: string) => {
  if (u === NEWTAB) return "新建标签页";
  try {
    const h = new URL(u).hostname.replace("www.", "");
    if (h.includes("google")) {
      const q = new URL(u).searchParams.get("q");
      return q ? `${q} - Google 搜索` : "Google";
    }
    return h;
  } catch {
    return u;
  }
};

export function Edge({ win }: { win: Win }) {
  const os = useOS();
  const { titleSlot } = useWin();
  const [tabs, setTabs] = useState<Tab[]>(() => [{ id: 1, hist: [win.payload?.url || NEWTAB], idx: 0, key: 0 }]);
  const [cur, setCur] = useState(1);
  const tab = tabs.find((t) => t.id === cur) || tabs[0];
  const url = tab.hist[tab.idx];
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [fav, setFav] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(false);
  const lastPayload = useRef(win.payload);

  useEffect(() => {
    if (win.payload && win.payload !== lastPayload.current && win.payload.url) {
      lastPayload.current = win.payload;
      const id = Date.now();
      setTabs((ts) => [...ts, { id, hist: [win.payload.url], idx: 0, key: 0 }]);
      setCur(id);
    }
  }, [win.payload]);

  useEffect(() => {
    if (!focused) setInput(url === NEWTAB ? "" : url);
  }, [url, focused]);

  useEffect(() => {
    if (url !== NEWTAB) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 1800);
      return () => clearTimeout(t);
    }
  }, [url, tab.key]);

  const navigate = (raw: string) => {
    let u = raw.trim();
    if (!u) return;
    if (!/^https?:\/\//.test(u) && u !== NEWTAB) {
      if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(u)) u = "https://" + u;
      else u = "https://www.google.com/search?igu=1&q=" + encodeURIComponent(u);
    }
    if (/^https?:\/\/(www\.)?google\.[a-z.]+\/?$/.test(u)) u = "https://www.google.com/webhp?igu=1";
    setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, hist: [...t.hist.slice(0, t.idx + 1), u], idx: t.idx + 1 } : t)));
  };
  const go = (d: number) => setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, idx: Math.max(0, Math.min(t.hist.length - 1, t.idx + d)) } : t)));
  const reload = () => setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, key: t.key + 1 } : t)));
  const newTab = () => {
    const id = Date.now();
    setTabs((ts) => [...ts, { id, hist: [NEWTAB], idx: 0, key: 0 }]);
    setCur(id);
  };

  const tabsBar = (
    <div className="flex items-end h-full pl-2 gap-0.5 min-w-0 flex-1">
      {tabs.map((t) => {
        const u = t.hist[t.idx];
        const active = t.id === tab.id;
        return (
          <div
            key={t.id}
            data-tab
            onMouseDown={() => setCur(t.id)}
            onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
            className={`group h-[34px] w-[240px] min-w-[60px] flex items-center gap-2 px-2.5 rounded-t-lg text-[12px] cursor-default ${
              active ? "bg-white dark:bg-[#2b2b2b] shadow-[0_-1px_0_rgba(0,0,0,.04)]" : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {u === NEWTAB ? (
              <AppIcon icon="edge" size={16} />
            ) : (
              <img src={`https://www.google.com/s2/favicons?sz=32&domain=${(() => { try { return new URL(u).hostname; } catch { return "google.com"; } })()}`} className="w-4 h-4" alt="" />
            )}
            <span className="flex-1 truncate">{titleOf(u)}</span>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}>
              <Dismiss12Regular />
            </button>
          </div>
        );
      })}
      <button className="w-8 h-8 mb-0.5 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0" onClick={newTab} title="新建标签页">
        <Add16Regular />
      </button>
    </div>
  );

  function closeTab(id: number) {
    if (tabs.length === 1) return os.closeWin(win.id);
    const rest = tabs.filter((x) => x.id !== id);
    setTabs(rest);
    if (id === tab.id) setCur(rest[rest.length - 1].id);
  }

  const ib = "w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 shrink-0";
  const isFav = fav.includes(url);

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      {titleSlot && createPortal(tabsBar, titleSlot)}
      <div className="h-11 flex items-center gap-1 px-2 bg-white dark:bg-[#2b2b2b] shrink-0 relative">
        <button className={ib} disabled={tab.idx === 0} onClick={() => go(-1)} title="后退">
          <ArrowLeft20Regular />
        </button>
        <button className={ib} disabled={tab.idx >= tab.hist.length - 1} onClick={() => go(1)} title="前进">
          <ArrowRight20Regular />
        </button>
        <button className={ib} onClick={reload} title="刷新">
          <ArrowClockwise20Regular />
        </button>
        <button className={ib} onClick={() => navigate(NEWTAB)} title="主页">
          <Home20Regular />
        </button>
        <div className={`flex-1 h-8 mx-1 rounded-full flex items-center gap-2 px-3 text-[13px] ${focused ? "bg-white dark:bg-[#1f1f1f] ring-2 ring-[var(--accent)]" : "bg-[#f1f1f1] dark:bg-[#1f1f1f] hover:bg-[#e9e9e9] dark:hover:bg-[#252525]"}`}>
          {url === NEWTAB ? <Search20Regular className="text-[15px] opacity-60" /> : <LockClosed16Regular className="opacity-60" />}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={(e) => {
              setFocused(true);
              setTimeout(() => e.target.select(), 0);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(input);
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="搜索或输入 Web 地址"
            className="flex-1 bg-transparent outline-none min-w-0"
          />
          {url !== NEWTAB && (
            <button onClick={() => setFav((f) => (isFav ? f.filter((x) => x !== url) : [...f, url]))} title="将此页面添加到收藏夹">
              {isFav ? <StarFilled className="text-[18px] accent-text" /> : <Star20Regular className="text-[18px] opacity-70" />}
            </button>
          )}
        </div>
        <button className={ib} title="收藏夹">
          <Collections20Regular />
        </button>
        <button className={ib} title="下载">
          <ArrowDownload20Regular />
        </button>
        <div className="px-1">
          <Avatar size={24} />
        </div>
        <button className={ib} onClick={() => setMenu(!menu)} title="设置及其他">
          <MoreHorizontal20Regular />
        </button>
        {menu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
            <div className="absolute right-2 top-11 z-20 w-64 acrylic-strong flyout py-1 text-[13px] anim-menu">
              {[
                { l: "新建标签页", s: "Ctrl+T", a: newTab },
                { l: "在新浏览器窗口中打开", s: "", a: () => url !== NEWTAB && window.open(url.replace("igu=1&", "").replace("?igu=1", ""), "_blank") },
                { l: "刷新", s: "F5", a: reload },
              ].map((m) => (
                <button key={m.l} className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { m.a(); setMenu(false); }}>
                  <span className="flex-1 text-left">{m.l}</span>
                  <span className="text-[12px] opacity-60">{m.s}</span>
                </button>
              ))}
              <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
              <button className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { os.openApp("settings"); setMenu(false); }}>
                <Settings20Regular className="text-[16px]" /> 设置
              </button>
            </div>
          </>
        )}
        {loading && (
          <div className="absolute left-0 right-0 bottom-0 h-[2px] overflow-hidden">
            <div className="absolute h-full w-1/3 accent-bg" style={{ animation: "indeterminate 1.1s ease-in-out infinite" }} />
          </div>
        )}
      </div>
      {fav.length > 0 && (
        <div className="h-8 flex items-center gap-1 px-3 bg-white dark:bg-[#2b2b2b] border-t border-black/5 dark:border-white/5 text-[12px] shrink-0">
          {fav.map((f) => (
            <button key={f} className="h-6 px-2 rounded flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10 max-w-[160px]" onClick={() => navigate(f)}>
              <img src={`https://www.google.com/s2/favicons?sz=32&domain=${new URL(f).hostname}`} className="w-3.5 h-3.5" alt="" />
              <span className="truncate">{titleOf(f)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 min-h-0 relative bg-white border-t border-black/5 dark:border-white/5">
        {url === NEWTAB ? (
          <NewTab onGo={navigate} />
        ) : (
          <>
            <iframe key={url + tab.key} src={url} className="absolute inset-0 w-full h-full border-0 bg-white" title="edge" onLoad={() => setLoading(false)} />
            {!url.includes("google.com") && !url.includes("wikipedia") && !url.includes("openstreetmap") && !url.includes("youtube.com/embed") && !url.includes("example.com") && !url.includes("blueedge") && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 acrylic-strong flyout px-4 py-2 text-[12px] flex items-center gap-3 text-black dark:text-white">
                某些网站会拒绝在框架内显示。
                <button className="accent-text flex items-center gap-1 hover:underline" onClick={() => window.open(url, "_blank")}>
                  <Open20Regular className="text-[14px]" /> 在新窗口中打开
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NewTab({ onGo }: { onGo: (u: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="absolute inset-0 overflow-y-auto win-scroll">
      <img src="https://picsum.photos/seed/edgentp/1600/900" className="absolute inset-0 w-full h-full object-cover" alt="" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative flex flex-col items-center pt-[12vh] px-6 text-white">
        <div className="w-full max-w-[640px] h-12 rounded-full bg-white text-black flex items-center gap-3 px-5 shadow-xl">
          <Search20Regular className="opacity-60" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onGo(q)}
            placeholder="搜索网页"
            className="flex-1 outline-none text-[15px]"
          />
          <span className="text-[13px] font-semibold text-[#4285f4]">Google</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-8">
          {QUICK.map((s) => (
            <button key={s.n} className="w-[84px] h-[84px] rounded-lg bg-white/15 backdrop-blur hover:bg-white/30 flex flex-col items-center justify-center gap-2" onClick={() => onGo(s.u)}>
              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                <img src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(s.u).hostname}`} className="w-6 h-6" alt={s.l} />
              </span>
              <span className="text-[12px] truncate max-w-[76px]">{s.n}</span>
            </button>
          ))}
        </div>
        <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-3 mt-12 pb-10">
          {["科技前沿：下一代芯片架构揭秘", "旅行：十个小众但绝美的海岛", "美食：在家也能做的米其林甜点"].map((t, i) => (
            <div key={t} className="rounded-xl overflow-hidden bg-white text-black shadow-lg">
              <img src={`https://picsum.photos/seed/ntp${i}/500/260`} className="w-full h-36 object-cover" alt="" />
              <div className="p-3 text-[14px] font-semibold">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
