import { useEffect, useRef, useState } from "react";
import {
  Pen20Regular,
  PaintBrush20Regular,
  Eraser20Regular,
  PaintBucket20Regular,
  Line20Regular,
  RectangleLandscape20Regular,
  Circle20Regular,
  Delete20Regular,
  Save20Regular,
  Home20Regular,
  Apps20Regular,
  Games20Regular,
  MoviesAndTv20Regular,
  Library20Regular,
  Search20Regular,
  StarFilled,
  Image20Regular,
  Heart20Regular,
  HeartFilled,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  ArrowRotateClockwise20Regular,
  ZoomIn20Regular,
  ZoomOut20Regular,
  Dismiss20Regular,
  Navigation20Regular,
  DataArea20Regular,
  History20Regular,
  Rocket20Regular,
  People20Regular,
  TextBulletListLtr20Regular,
  PuzzlePiece20Regular,
  Add20Regular,
  ArrowUndo20Regular,
  Camera20Regular,
  Cloud20Regular,
  Folder20Regular,
  Play20Filled,
  Pause20Filled,
  ArrowReset20Regular,
  Flag20Regular,
} from "@fluentui/react-icons";
import { useOS, type Win } from "../os/store";
import { appById } from "../os/apps";
import { AppIcon, FileIcon, Img, iconUrl } from "../os/assets";

/* ======================= Paint ======================= */
const PALETTE = ["#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7"];
type Tool = "pencil" | "brush" | "eraser" | "fill" | "line" | "rect" | "ellipse";

export function Paint() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#000000");
  const [color2, setColor2] = useState("#ffffff");
  const [size, setSize] = useState(5);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const undo = useRef<ImageData[]>([]);
  const W = 960;
  const H = 560;

  useEffect(() => {
    const c = cv.current!.getContext("2d")!;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, W, H);
  }, []);

  const pt = (e: React.PointerEvent) => {
    const r = cv.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const flood = (x: number, y: number, hex: string) => {
    const c = cv.current!.getContext("2d")!;
    const img = c.getImageData(0, 0, W, H);
    const d = img.data;
    const i0 = (Math.floor(y) * W + Math.floor(x)) * 4;
    const t = [d[i0], d[i0 + 1], d[i0 + 2]];
    const n = parseInt(hex.slice(1), 16);
    const f = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    if (t[0] === f[0] && t[1] === f[1] && t[2] === f[2]) return;
    const st = [[Math.floor(x), Math.floor(y)]];
    const match = (i: number) => Math.abs(d[i] - t[0]) < 24 && Math.abs(d[i + 1] - t[1]) < 24 && Math.abs(d[i + 2] - t[2]) < 24;
    while (st.length) {
      const [px, py] = st.pop()!;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const i = (py * W + px) * 4;
      if (!match(i)) continue;
      d[i] = f[0];
      d[i + 1] = f[1];
      d[i + 2] = f[2];
      d[i + 3] = 255;
      st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    c.putImageData(img, 0, 0);
  };

  const down = (e: React.PointerEvent) => {
    const c = cv.current!.getContext("2d")!;
    undo.current.push(c.getImageData(0, 0, W, H));
    if (undo.current.length > 30) undo.current.shift();
    const col = e.button === 2 ? color2 : color;
    const s = pt(e);
    if (tool === "fill") return flood(s.x, s.y, col);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const snap = c.getImageData(0, 0, W, H);
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = tool === "eraser" ? "#ffffff" : col;
    c.lineWidth = tool === "pencil" ? 1.5 : tool === "eraser" ? size * 3 : size;
    let last = s;
    const move = (ev: PointerEvent) => {
      const r = cv.current!.getBoundingClientRect();
      const p = { x: ((ev.clientX - r.left) / r.width) * W, y: ((ev.clientY - r.top) / r.height) * H };
      if (tool === "pencil" || tool === "brush" || tool === "eraser") {
        c.beginPath();
        c.moveTo(last.x, last.y);
        c.lineTo(p.x, p.y);
        c.stroke();
        last = p;
      } else {
        c.putImageData(snap, 0, 0);
        c.beginPath();
        if (tool === "line") {
          c.moveTo(s.x, s.y);
          c.lineTo(p.x, p.y);
        } else if (tool === "rect") c.rect(s.x, s.y, p.x - s.x, p.y - s.y);
        else c.ellipse((s.x + p.x) / 2, (s.y + p.y) / 2, Math.abs(p.x - s.x) / 2, Math.abs(p.y - s.y) / 2, 0, 0, Math.PI * 2);
        c.stroke();
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    move(e.nativeEvent);
  };

  const tools: { id: Tool; icon: React.ReactNode; l: string }[] = [
    { id: "pencil", icon: <Pen20Regular />, l: "铅笔" },
    { id: "brush", icon: <PaintBrush20Regular />, l: "画笔" },
    { id: "eraser", icon: <Eraser20Regular />, l: "橡皮擦" },
    { id: "fill", icon: <PaintBucket20Regular />, l: "颜色填充" },
  ];
  const shapes: { id: Tool; icon: React.ReactNode; l: string }[] = [
    { id: "line", icon: <Line20Regular />, l: "直线" },
    { id: "rect", icon: <RectangleLandscape20Regular />, l: "矩形" },
    { id: "ellipse", icon: <Circle20Regular />, l: "椭圆" },
  ];
  const tb = (active: boolean) => `w-9 h-9 rounded flex items-center justify-center ${active ? "bg-black/10 dark:bg-white/15 ring-1 ring-black/10" : "hover:bg-black/5 dark:hover:bg-white/10"}`;

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      <div className="h-[88px] flex items-stretch gap-4 px-3 py-2 border-b border-black/10 dark:border-white/10 shrink-0 overflow-x-auto no-scroll">
        <div className="flex flex-col items-center justify-between">
          <div className="flex gap-1">
            <button className={tb(false)} title="撤消" onClick={() => { const d = undo.current.pop(); if (d) cv.current!.getContext("2d")!.putImageData(d, 0, 0); }}>
              <ArrowUndo20Regular />
            </button>
            <button className={tb(false)} title="保存" onClick={() => { const a = document.createElement("a"); a.download = "画图.png"; a.href = cv.current!.toDataURL(); a.click(); }}>
              <Save20Regular />
            </button>
            <button className={tb(false)} title="清除" onClick={() => { const c = cv.current!.getContext("2d")!; c.fillStyle = "#fff"; c.fillRect(0, 0, W, H); }}>
              <Delete20Regular />
            </button>
          </div>
          <span className="text-[11px] opacity-60">文件</span>
        </div>
        <div className="w-px bg-black/10 dark:bg-white/10" />
        <div className="flex flex-col items-center justify-between">
          <div className="grid grid-cols-4 gap-1">
            {tools.map((t) => (
              <button key={t.id} title={t.l} className={tb(tool === t.id)} onClick={() => setTool(t.id)}>
                {t.icon}
              </button>
            ))}
          </div>
          <span className="text-[11px] opacity-60">工具</span>
        </div>
        <div className="w-px bg-black/10 dark:bg-white/10" />
        <div className="flex flex-col items-center justify-between">
          <div className="flex gap-1">
            {shapes.map((t) => (
              <button key={t.id} title={t.l} className={tb(tool === t.id)} onClick={() => setTool(t.id)}>
                {t.icon}
              </button>
            ))}
          </div>
          <span className="text-[11px] opacity-60">形状</span>
        </div>
        <div className="w-px bg-black/10 dark:bg-white/10" />
        <div className="flex flex-col items-center justify-between w-32">
          <div className="flex items-center gap-2 w-full h-9">
            <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} className="win-range w-full" style={{ ["--val" as any]: `${((size - 1) / 39) * 100}%` }} />
          </div>
          <span className="text-[11px] opacity-60">大小 {size}px</span>
        </div>
        <div className="w-px bg-black/10 dark:bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <div className="absolute right-0 bottom-0 w-7 h-7 rounded-full border border-black/30" style={{ background: color2 }} />
            <div className="absolute left-0 top-0 w-8 h-8 rounded-full border-2 border-white ring-1 ring-black/30" style={{ background: color }} />
          </div>
          <div className="grid grid-cols-10 gap-1">
            {PALETTE.map((c) => (
              <button
                key={c}
                className={`w-5 h-5 rounded-full border ${color === c ? "ring-2 ring-[var(--accent)] ring-offset-1" : "border-black/20"}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                onContextMenu={(e) => { e.preventDefault(); setColor2(c); }}
              />
            ))}
          </div>
          <label className="w-8 h-8 rounded-full overflow-hidden border border-black/20 cursor-pointer relative" title="编辑颜色" style={{ background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="opacity-0 absolute inset-0 cursor-pointer" />
          </label>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto win-scroll bg-[#e6ebf2] dark:bg-[#1a1a1a] p-6">
        <canvas
          ref={cv}
          width={W}
          height={H}
          onPointerDown={down}
          onPointerMove={(e) => { const p = pt(e); setPos({ x: Math.round(p.x), y: Math.round(p.y) }); }}
          onPointerLeave={() => setPos(null)}
          onContextMenu={(e) => e.preventDefault()}
          className="bg-white shadow-[0_2px_12px_rgba(0,0,0,.15)] cursor-crosshair touch-none"
          style={{ width: (W * zoom) / 100, height: (H * zoom) / 100 }}
        />
      </div>
      <div className="h-7 flex items-center px-3 text-[12px] gap-6 border-t border-black/10 dark:border-white/10 shrink-0">
        <span className="w-28">{pos ? `${pos.x}, ${pos.y}像素` : ""}</span>
        <span>{W} × {H}像素</span>
        <div className="flex-1" />
        <button onClick={() => setZoom((z) => Math.max(25, z - 25))}><ZoomOut20Regular className="text-[16px]" /></button>
        <span className="w-10 text-center">{zoom}%</span>
        <button onClick={() => setZoom((z) => Math.min(300, z + 25))}><ZoomIn20Regular className="text-[16px]" /></button>
      </div>
    </div>
  );
}

/* ======================= Store ======================= */
const STORE_APPS = [
  { i: "spotify", n: "Spotify - 音乐和播客", c: "音乐", r: 4.6 },
  { i: "discord", n: "Discord", c: "社交", r: 4.5 },
  { i: "code", n: "Visual Studio Code", c: "开发人员工具", r: 4.8 },
  { i: "teams", n: "Microsoft Teams", c: "效率", r: 4.3 },
  { i: "xbox", n: "Xbox", c: "娱乐", r: 4.4 },
  { i: "msoffice", n: "Microsoft 365 (Office)", c: "效率", r: 4.6 },
  { i: "onenote", n: "OneNote", c: "效率", r: 4.5 },
  { i: "skype", n: "Skype", c: "社交", r: 4.1 },
  { i: "todo", n: "Microsoft To Do", c: "效率", r: 4.7 },
  { i: "whiteboard", n: "Microsoft Whiteboard", c: "效率", r: 4.4 },
  { i: "twitter", n: "X", c: "社交", r: 4.0 },
  { i: "github", n: "GitHub Desktop", c: "开发人员工具", r: 4.6 },
];
const HERO = [
  { t: "Xbox Game Pass", s: "畅玩数百款高品质游戏", seed: "game1", g: "#107c10" },
  { t: "Microsoft 365", s: "Word、Excel、PowerPoint 等应用", seed: "office2", g: "#c43e1c" },
  { t: "最佳创意应用", s: "释放你的创造力", seed: "art3", g: "#5c2e91" },
];

export function Store() {
  const os = useOS();
  const [hero, setHero] = useState(0);
  const [state, setState] = useState<Record<string, "get" | "loading" | "open">>({});
  const [nav, setNav] = useState(0);
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setInterval(() => setHero((h) => (h + 1) % HERO.length), 5000);
    return () => clearInterval(t);
  }, []);
  const get = (i: string, n: string) => {
    if (state[i] === "open") {
      const map: Record<string, string> = { whiteboard: "paint" };
      const id = map[i] || (appById(i) ? i : "");
      if (id) os.openApp(id);
      return;
    }
    setState((s) => ({ ...s, [i]: "loading" }));
    setTimeout(() => {
      setState((s) => ({ ...s, [i]: "open" }));
      os.notify({ icon: "store", app: "Microsoft Store", title: "已安装", body: `${n} 已经安装，可以使用了。` });
    }, 2200);
  };
  const navs = [
    { l: "主页", i: <Home20Regular /> },
    { l: "应用", i: <Apps20Regular /> },
    { l: "游戏", i: <Games20Regular /> },
    { l: "电影和电视", i: <MoviesAndTv20Regular /> },
  ];
  const list = STORE_APPS.filter((a) => a.n.toLowerCase().includes(q.toLowerCase()));
  const h = HERO[hero];
  return (
    <div className="absolute inset-0 flex text-black dark:text-white">
      <div className="w-[72px] shrink-0 flex flex-col items-center pt-2 gap-1">
        {navs.map((n, i) => (
          <button key={n.l} onClick={() => setNav(i)} className={`relative w-[64px] h-[56px] rounded-md flex flex-col items-center justify-center gap-1 text-[10px] ${nav === i ? "bg-black/5 dark:bg-white/[.07]" : "hover:bg-black/[.04] dark:hover:bg-white/5"}`}>
            {nav === i && <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full accent-bg" />}
            <span className={nav === i ? "accent-text" : ""}>{n.i}</span>
            {n.l}
          </button>
        ))}
        <div className="flex-1" />
        <button className="w-[64px] h-[56px] rounded-md flex flex-col items-center justify-center gap-1 text-[10px] hover:bg-black/[.04] dark:hover:bg-white/5 mb-2">
          <Library20Regular />
          库
        </button>
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto win-scroll rounded-tl-lg bg-white/60 dark:bg-white/[.03] border-l border-t border-black/5 dark:border-white/5">
        <div className="sticky top-0 z-10 flex justify-center py-3 backdrop-blur-xl bg-white/40 dark:bg-black/20">
          <div className="w-full max-w-[520px] h-9 rounded win-input flex items-center gap-2 px-3 text-[13px]">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索应用、游戏、电影及更多内容" className="flex-1 bg-transparent outline-none" />
            <Search20Regular className="opacity-60 text-[16px]" />
          </div>
        </div>
        <div className="px-8 pb-10">
          {!q && (
            <div className="relative h-[300px] rounded-xl overflow-hidden mb-8 text-white">
              <img key={h.seed} src={`https://picsum.photos/seed/${h.seed}/1400/600`} className="absolute inset-0 w-full h-full object-cover anim-fade" alt="" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${h.g}ee 0%, ${h.g}55 50%, transparent 100%)` }} />
              <div className="absolute left-8 bottom-10">
                <div className="text-[13px] opacity-90">{["主页", "应用", "游戏", "电影和电视"][nav]}</div>
                <div className="text-[36px] font-semibold font-display">{h.t}</div>
                <div className="text-[15px] opacity-90">{h.s}</div>
                <button className="mt-4 px-5 h-9 rounded bg-white text-black text-[14px] font-semibold hover:bg-white/90">查看详情</button>
              </div>
              <div className="absolute right-6 bottom-6 flex gap-2">
                {HERO.map((_, i) => (
                  <button key={i} onClick={() => setHero(i)} className={`h-1.5 rounded-full transition-all ${i === hero ? "w-6 bg-white" : "w-1.5 bg-white/60"}`} />
                ))}
              </div>
            </div>
          )}
          <div className="text-[20px] font-semibold mb-3 font-display">{q ? `“${q}”的结果` : "热门免费应用"}</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {list.map((a) => (
              <div key={a.i} className="card rounded-lg p-4 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <Img src={iconUrl(a.i)} className="w-16 h-16 mb-3" alt="" />
                <div className="text-[14px] font-semibold line-clamp-1">{a.n}</div>
                <div className="text-[12px] opacity-60">{a.c}</div>
                <div className="flex items-center gap-1 text-[12px] mt-1">
                  {a.r} <StarFilled className="text-[11px]" />
                </div>
                <button
                  className={`mt-3 h-8 rounded text-[13px] ${state[a.i] === "open" ? "win-btn" : "win-btn-accent"}`}
                  onClick={() => get(a.i, a.n)}
                  disabled={state[a.i] === "loading"}
                >
                  {state[a.i] === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="progress-ring" width="14" height="14" viewBox="0 0 34 34">
                        <circle cx="17" cy="17" r="14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      正在安装
                    </span>
                  ) : state[a.i] === "open" ? "打开" : "免费获取"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================= Photos ======================= */
export function Photos() {
  const [view, setView] = useState<number | null>(null);
  const [fav, setFav] = useState<number[]>([]);
  const [rot, setRot] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState<"all" | "fav">("all");
  const imgs = Array.from({ length: 30 }, (_, i) => i).filter((i) => filter === "all" || fav.includes(i));
  useEffect(() => {
    setRot(0);
    setZoom(1);
  }, [view]);
  useEffect(() => {
    if (view === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setView((v) => (v! + 1) % 30);
      if (e.key === "ArrowLeft") setView((v) => (v! + 29) % 30);
      if (e.key === "Escape") setView(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [view]);
  return (
    <div className="absolute inset-0 flex text-black dark:text-white">
      <div className="w-[220px] shrink-0 p-2 space-y-0.5 max-md:hidden">
        {[
          { l: "全部照片", i: <Image20Regular />, k: "all" },
          { l: "收藏夹", i: <Heart20Regular />, k: "fav" },
        ].map((n) => (
          <button key={n.l} onClick={() => setFilter(n.k as any)} className={`w-full h-9 flex items-center gap-3 px-3 rounded text-[13px] relative ${filter === n.k ? "bg-black/5 dark:bg-white/[.07]" : "hover:bg-black/[.04] dark:hover:bg-white/5"}`}>
            {filter === n.k && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full accent-bg" />}
            {n.i}
            {n.l}
          </button>
        ))}
        <div className="h-px bg-black/10 dark:bg-white/10 my-2" />
        <div className="h-9 flex items-center gap-3 px-3 text-[13px]"><Cloud20Regular /> OneDrive - 个人</div>
        <div className="h-9 flex items-center gap-3 px-3 text-[13px]"><Folder20Regular /> 图片</div>
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto win-scroll p-4 bg-white/50 dark:bg-white/[.02] rounded-tl-lg border-l border-t border-black/5 dark:border-white/5">
        <div className="text-[20px] font-semibold mb-1 font-display">{filter === "all" ? "全部照片" : "收藏夹"}</div>
        <div className="text-[13px] opacity-60 mb-4">2025年5月 · {imgs.length} 个项目</div>
        {imgs.length === 0 && <div className="text-[13px] opacity-60 mt-10 text-center">还没有收藏的照片</div>}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-1">
          {imgs.map((i) => (
            <button key={i} className="relative aspect-[4/3] overflow-hidden rounded-sm group" onClick={() => setView(i)}>
              <img src={`https://picsum.photos/seed/photo${i}/400/300`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
              {fav.includes(i) && <HeartFilled className="absolute right-1.5 bottom-1.5 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </div>
      {view !== null && (
        <div className="absolute inset-0 z-10 mica flex flex-col anim-fade">
          <div className="h-12 flex items-center gap-1 px-2 shrink-0">
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView(null)}><ChevronLeft20Regular /></button>
            <span className="text-[13px] ml-2">IMG_2025052{view}.jpg</span>
            <div className="flex-1" />
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}><ZoomIn20Regular /></button>
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}><ZoomOut20Regular /></button>
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setRot((r) => r + 90)}><ArrowRotateClockwise20Regular /></button>
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setFav((f) => (f.includes(view) ? f.filter((x) => x !== view) : [...f, view]))}>
              {fav.includes(view) ? <HeartFilled className="text-[#e81123]" /> : <Heart20Regular />}
            </button>
            <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView(null)}><Dismiss20Regular /></button>
          </div>
          <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden bg-black/[.03] dark:bg-black/30">
            <img src={`https://picsum.photos/seed/photo${view}/1600/1200`} className="max-w-full max-h-full object-contain transition-transform duration-300" style={{ transform: `rotate(${rot}deg) scale(${zoom})` }} alt="" />
            <button className="absolute left-3 w-10 h-16 rounded acrylic-strong flex items-center justify-center" onClick={() => setView((v) => (v! + 29) % 30)}><ChevronLeft20Regular /></button>
            <button className="absolute right-3 w-10 h-16 rounded acrylic-strong flex items-center justify-center" onClick={() => setView((v) => (v! + 1) % 30)}><ChevronRight20Regular /></button>
          </div>
          <div className="h-16 flex items-center justify-center gap-1 px-2 overflow-x-auto no-scroll shrink-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <img key={i} src={`https://picsum.photos/seed/photo${i}/120/90`} onClick={() => setView(i)} className={`h-11 w-14 object-cover rounded-sm cursor-pointer ${i === view ? "ring-2 ring-[var(--accent)]" : "opacity-70 hover:opacity-100"}`} alt="" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================= Task Manager ======================= */
const BG_PROCS = ["Antimalware Service Executable", "Microsoft Edge WebView2", "Windows 资源管理器", "桌面窗口管理器", "Runtime Broker", "Search Host", "Windows 输入体验", "OneDrive", "Service Host: 本地系统", "System", "注册表", "Windows 安全中心通知图标"];

export function TaskManager() {
  const os = useOS();
  const [tab, setTab] = useState(0);
  const [tick, setTick] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [cpuHist, setCpuHist] = useState<number[]>(Array(60).fill(10));
  const [memHist, setMemHist] = useState<number[]>(Array(60).fill(40));
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setCpuHist((h) => [...h.slice(1), Math.max(2, Math.min(98, h[h.length - 1] + (Math.random() - 0.5) * 18 + os.wins.length * 0.4))]);
      setMemHist((h) => [...h.slice(1), Math.max(30, Math.min(80, 38 + os.wins.length * 3 + Math.random() * 3))]);
    }, 1000);
    return () => clearInterval(t);
  }, [os.wins.length]);
  const rnd = (seed: string, max: number) => {
    let h = tick * 31;
    for (const c of seed) h = (h * 33 + c.charCodeAt(0)) % 9973;
    return ((h % 1000) / 1000) * max;
  };
  const apps = os.wins.filter((w) => !w.closing && w.title.toLowerCase().includes(q.toLowerCase()));
  const bg = BG_PROCS.filter((p) => p.toLowerCase().includes(q.toLowerCase()));
  const heat = (v: number, max: number) => ({ background: `rgba(255, ${210 - (v / max) * 90}, 0, ${0.12 + (v / max) * 0.45})` });
  const cpu = Math.round(cpuHist[cpuHist.length - 1]);
  const mem = Math.round(memHist[memHist.length - 1]);

  const navs = [
    { l: "进程", i: <Apps20Regular /> },
    { l: "性能", i: <DataArea20Regular /> },
    { l: "应用历史记录", i: <History20Regular /> },
    { l: "启动应用", i: <Rocket20Regular /> },
    { l: "用户", i: <People20Regular /> },
    { l: "详细信息", i: <TextBulletListLtr20Regular /> },
    { l: "服务", i: <PuzzlePiece20Regular /> },
  ];

  const Graph = ({ data, color }: { data: number[]; color: string }) => (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 60} y1="0" x2={i * 60} y2="200" stroke={color} strokeOpacity=".15" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1="0" y1={i * 40} x2="600" y2={i * 40} stroke={color} strokeOpacity=".15" />
      ))}
      <polygon points={`0,200 ${data.map((v, i) => `${i * 10.17},${200 - v * 2}`).join(" ")} 600,200`} fill={color} fillOpacity=".15" />
      <polyline points={data.map((v, i) => `${i * 10.17},${200 - v * 2}`).join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      <div className="h-11 flex items-center gap-2 px-3 shrink-0">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[460px] h-8 rounded win-input flex items-center gap-2 px-3 text-[13px]">
            <Search20Regular className="text-[15px] opacity-60" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="键入要搜索的名称、发布者或 PID" className="flex-1 bg-transparent outline-none" />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex">
        <div className="w-[52px] md:w-[200px] shrink-0 flex flex-col gap-0.5 px-1">
          <button className="w-10 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 mb-1"><Navigation20Regular /></button>
          {navs.map((n, i) => (
            <button key={n.l} onClick={() => setTab(i)} className={`relative h-9 flex items-center gap-3 px-3 rounded text-[13px] ${tab === i ? "bg-black/5 dark:bg-white/[.07]" : "hover:bg-black/[.04] dark:hover:bg-white/5"}`}>
              {tab === i && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full accent-bg" />}
              {n.i}
              <span className="max-md:hidden">{n.l}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 flex flex-col rounded-tl-lg bg-white/60 dark:bg-white/[.03] border-l border-t border-black/5 dark:border-white/5">
          <div className="h-12 flex items-center gap-2 px-5 shrink-0">
            <span className="text-[16px] font-semibold flex-1">{navs[tab].l}</span>
            <button className="h-8 px-3 rounded flex items-center gap-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10" onClick={() => os.openApp("terminal")}>
              <Add20Regular className="text-[16px]" /> 运行新任务
            </button>
            <button
              className="h-8 px-3 rounded flex items-center gap-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40"
              disabled={!sel}
              onClick={() => {
                if (sel) os.closeWin(sel);
                setSel(null);
              }}
            >
              <Dismiss20Regular className="text-[16px]" /> 结束任务
            </button>
          </div>
          {tab === 1 ? (
            <div className="flex-1 min-h-0 flex gap-4 p-4 pt-0">
              <div className="w-[220px] space-y-1 shrink-0">
                {[
                  { n: "CPU", v: `${cpu}% 3.20 GHz`, d: cpuHist, c: "#1191d6" },
                  { n: "内存", v: `${((mem / 100) * 16).toFixed(1)}/16.0 GB (${mem}%)`, d: memHist, c: "#9b34c4" },
                  { n: "磁盘 0 (C:)", v: "SSD · 2%", d: memHist.map((x) => x / 12), c: "#4caf50" },
                  { n: "WLAN", v: `发送: ${Math.round(rnd("s", 200))} 接收: ${Math.round(rnd("r", 900))} Kbps`, d: cpuHist.map((x) => x / 3), c: "#d58e1a" },
                ].map((x, i) => (
                  <div key={x.n} className={`flex gap-3 p-2 rounded ${i === 0 ? "bg-black/5 dark:bg-white/10" : ""}`}>
                    <div className="w-16 h-11 border shrink-0" style={{ borderColor: x.c }}>
                      <Graph data={x.d} color={x.c} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px]">{x.n}</div>
                      <div className="text-[11px] opacity-70 truncate">{x.v}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-[24px] font-semibold">CPU</span>
                  <span className="text-[13px] opacity-70">Virtual Processor @ 3.20GHz</span>
                </div>
                <div className="text-[12px] opacity-60 mb-1">60 秒内的利用率 %</div>
                <div className="flex-1 min-h-[160px] border border-[#1191d6]/60">
                  <Graph data={cpuHist} color="#1191d6" />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 text-[12px]">
                  {[
                    ["利用率", `${cpu}%`],
                    ["速度", "3.20 GHz"],
                    ["进程", `${152 + os.wins.length}`],
                    ["线程", `${2140 + os.wins.length * 23}`],
                    ["句柄", "84213"],
                    ["正常运行时间", `0:${String(Math.floor(performance.now() / 3600000)).padStart(2, "0")}:${String(Math.floor(performance.now() / 60000) % 60).padStart(2, "0")}`],
                    ["逻辑处理器", `${navigator.hardwareConcurrency || 8}`],
                    ["虚拟化", "已启用"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="opacity-60">{k}</div>
                      <div className="text-[18px]">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : tab === 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto win-scroll">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-[#f9f9f9] dark:bg-[#272727] z-[1]">
                  <tr className="h-12 text-left">
                    <th className="font-normal pl-5">名称</th>
                    <th className="font-normal w-20">状态</th>
                    <th className="font-normal w-20 text-right pr-2"><div className="text-[16px]">{cpu}%</div>CPU</th>
                    <th className="font-normal w-24 text-right pr-2"><div className="text-[16px]">{mem}%</div>内存</th>
                    <th className="font-normal w-20 text-right pr-2"><div className="text-[16px]">1%</div>磁盘</th>
                    <th className="font-normal w-20 text-right pr-3"><div className="text-[16px]">0%</div>网络</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={6} className="pl-5 h-8 font-semibold text-[13px]">应用 ({apps.length})</td></tr>
                  {apps.map((w) => {
                    const c = rnd(w.id, 8);
                    const m = 40 + rnd(w.id + "m", 400);
                    return (
                      <tr key={w.id} className={`h-8 ${sel === w.id ? "bg-[var(--accent)]/20" : "hover:bg-black/[.04] dark:hover:bg-white/5"}`} onClick={() => setSel(w.id)} onDoubleClick={() => os.focusWin(w.id)}>
                        <td className="pl-5"><span className="flex items-center gap-2"><AppIcon icon={appById(w.appId).icon} size={16} />{w.title}</span></td>
                        <td className="opacity-70">{w.min ? "已挂起" : ""}</td>
                        <td className="text-right pr-2" style={heat(c, 10)}>{c.toFixed(1)}%</td>
                        <td className="text-right pr-2" style={heat(m, 600)}>{m.toFixed(1)} MB</td>
                        <td className="text-right pr-2" style={heat(0.1, 10)}>0 MB/秒</td>
                        <td className="text-right pr-3" style={heat(0.1, 10)}>0 Mbps</td>
                      </tr>
                    );
                  })}
                  <tr><td colSpan={6} className="pl-5 h-8 font-semibold text-[13px]">后台进程 ({bg.length})</td></tr>
                  {bg.map((p) => {
                    const c = rnd(p, 3);
                    const m = 5 + rnd(p + "m", 180);
                    return (
                      <tr key={p} className="h-8 hover:bg-black/[.04] dark:hover:bg-white/5">
                        <td className="pl-5"><span className="flex items-center gap-2"><span className="w-4 h-4 rounded-sm bg-[#0078d4]/80 inline-block" />{p}</span></td>
                        <td />
                        <td className="text-right pr-2" style={heat(c, 10)}>{c.toFixed(1)}%</td>
                        <td className="text-right pr-2" style={heat(m, 600)}>{m.toFixed(1)} MB</td>
                        <td className="text-right pr-2" style={heat(0.1, 10)}>0 MB/秒</td>
                        <td className="text-right pr-3" style={heat(0.1, 10)}>0 Mbps</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[13px] opacity-60">“{navs[tab].l}”暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================= Recycle Bin ======================= */
export function RecycleBin() {
  const os = useOS();
  const [sel, setSel] = useState<string[]>([]);
  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      <div className="h-12 flex items-center gap-1 px-3 border-b border-black/[.06] dark:border-white/[.06] shrink-0">
        <button className="h-8 px-3 rounded flex items-center gap-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40" disabled={!os.recycle.length} onClick={() => os.emptyRecycle()}>
          <Delete20Regular /> 清空回收站
        </button>
        <button className="h-8 px-3 rounded flex items-center gap-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40" disabled={!os.recycle.length} onClick={() => os.restoreItems(os.recycle.map((r) => r.id))}>
          <ArrowUndo20Regular /> 还原所有项目
        </button>
        <button className="h-8 px-3 rounded flex items-center gap-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40" disabled={!sel.length} onClick={() => { os.restoreItems(sel); setSel([]); }}>
          <ArrowUndo20Regular /> 还原选定的项目
        </button>
      </div>
      <div className="flex-1 overflow-y-auto win-scroll p-2 bg-white/60 dark:bg-[#1c1c1c]/60">
        {os.recycle.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-70">
            <Img src={iconUrl("bin0")} className="w-16 h-16" alt="" />
            <div className="text-[13px]">回收站为空</div>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="h-8 text-left text-[12px] opacity-70">
                <th className="font-normal pl-8">名称</th>
                <th className="font-normal">原位置</th>
                <th className="font-normal">类型</th>
              </tr>
            </thead>
            <tbody>
              {os.recycle.map((r) => (
                <tr key={r.id} className={`h-8 ${sel.includes(r.id) ? "bg-[var(--accent)]/15" : "hover:bg-black/[.04] dark:hover:bg-white/5"}`} onClick={(e) => setSel(e.ctrlKey ? [...sel, r.id] : [r.id])}>
                  <td className="pl-2">
                    <span className="flex items-center gap-2">
                      {r.kind === "folder" ? <Img src={iconUrl("win/folder-sm")} className="w-4 h-4" alt="" /> : r.kind === "app" ? <AppIcon icon={appById(r.appId!).icon} size={16} /> : <FileIcon size={16} />}
                      {r.name}
                    </span>
                  </td>
                  <td className="opacity-70">桌面</td>
                  <td className="opacity-70">{r.kind === "folder" ? "文件夹" : r.kind === "app" ? "快捷方式" : "文本文档"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="h-7 flex items-center px-3 text-[12px] shrink-0">{os.recycle.length} 个项目</div>
    </div>
  );
}

/* ======================= Camera ======================= */
export function CameraApp() {
  const v = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const [shots, setShots] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((s) => {
        stream = s;
        if (v.current) v.current.srcObject = s;
      })
      .catch(() => setErr("找不到你的相机，或者相机访问权限被拒绝。"));
    if (!navigator.mediaDevices) setErr("此浏览器不支持相机。");
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);
  const snap = () => {
    if (!v.current || err) return;
    const c = document.createElement("canvas");
    c.width = v.current.videoWidth;
    c.height = v.current.videoHeight;
    c.getContext("2d")!.drawImage(v.current, 0, 0);
    setShots((s) => [c.toDataURL("image/jpeg"), ...s]);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };
  return (
    <div className="absolute inset-0 bg-black flex text-white">
      <div className="flex-1 relative flex items-center justify-center">
        {err ? (
          <div className="text-center px-6">
            <Camera20Regular className="text-[48px] opacity-70" />
            <div className="mt-3 text-[15px]">{err}</div>
            <div className="text-[12px] opacity-60 mt-1">错误代码 0xA00F4244</div>
          </div>
        ) : (
          <video ref={v} autoPlay playsInline muted className="max-w-full max-h-full" style={{ transform: "scaleX(-1)" }} />
        )}
        {flash && <div className="absolute inset-0 bg-white" />}
      </div>
      <div className="w-24 flex flex-col items-center justify-center gap-6 bg-black/60">
        <button onClick={snap} className="w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-black">
          <Camera20Regular className="text-[26px]" />
        </button>
        {shots[0] && <img src={shots[0]} className="w-14 h-14 object-cover rounded border border-white/40" alt="" />}
      </div>
    </div>
  );
}

/* ======================= Clock ======================= */
export function ClockApp() {
  const [t, setT] = useState(0);
  const [run, setRun] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (!run) return;
    const start = Date.now() - t;
    const i = setInterval(() => setT(Date.now() - start), 31);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
  const fmt = (ms: number) => `${String(Math.floor(ms / 3600000)).padStart(2, "0")}:${String(Math.floor(ms / 60000) % 60).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}.${String(Math.floor(ms / 10) % 100).padStart(2, "0")}`;
  const cities = [
    { n: "北京", o: 8 },
    { n: "伦敦", o: 1 },
    { n: "纽约", o: -4 },
    { n: "东京", o: 9 },
  ];
  return (
    <div className="absolute inset-0 overflow-y-auto win-scroll p-6 text-black dark:text-white">
      <div className="text-[20px] font-semibold font-display mb-4">秒表</div>
      <div className="card rounded-lg p-6 flex flex-col items-center">
        <div className="text-[56px] font-semibold font-display tabular-nums">{fmt(t)}</div>
        <div className="flex gap-3 mt-3">
          <button className="w-12 h-12 rounded-full accent-bg flex items-center justify-center" onClick={() => setRun(!run)}>{run ? <Pause20Filled /> : <Play20Filled />}</button>
          <button className="w-12 h-12 rounded-full win-btn flex items-center justify-center" onClick={() => run && setLaps((l) => [t, ...l])}><Flag20Regular /></button>
          <button className="w-12 h-12 rounded-full win-btn flex items-center justify-center" onClick={() => { setRun(false); setT(0); setLaps([]); }}><ArrowReset20Regular /></button>
        </div>
        {laps.length > 0 && (
          <div className="w-full max-w-[360px] mt-4 text-[13px]">
            {laps.map((l, i) => (
              <div key={i} className="flex justify-between h-8 items-center border-b border-black/5 dark:border-white/5">
                <span>计次 {laps.length - i}</span>
                <span className="tabular-nums">{fmt(l)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-[20px] font-semibold font-display mt-6 mb-4">世界时钟</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cities.map((c) => {
          const d = new Date(now.getTime() + (now.getTimezoneOffset() + c.o * 60) * 60000);
          return (
            <div key={c.n} className="card rounded-lg p-4">
              <div className="text-[13px] opacity-70">{c.n}</div>
              <div className="text-[28px] font-semibold font-display tabular-nums">{d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
              <div className="text-[12px] opacity-60">{d.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ======================= Embeds & Placeholder ======================= */
export function Embed({ src }: { src: string }) {
  return <iframe src={src} className="absolute inset-0 w-full h-full border-0 bg-black" allow="autoplay; encrypted-media; clipboard-write" title="embed" />;
}

export function Placeholder({ win }: { win: Win }) {
  const os = useOS();
  const app = appById(win.appId);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-black dark:text-white p-8 text-center">
      <AppIcon icon={app.icon} size={96} />
      <div className="text-[24px] font-semibold font-display">{app.name}</div>
      <div className="text-[13px] opacity-70 max-w-[420px]">此应用在 Windows 11 网页版中仅作演示。你可以在 Microsoft Store 中探索更多应用，或使用 Edge 浏览网页。</div>
      <div className="flex gap-2 mt-2">
        <button className="win-btn-accent" onClick={() => os.openApp("store")}>在 Microsoft Store 中查看</button>
        <button className="win-btn" onClick={() => os.openApp("edge", { url: "https://www.google.com/search?igu=1&q=" + encodeURIComponent(app.name) })}>在网上搜索</button>
      </div>
    </div>
  );
}
