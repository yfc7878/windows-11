import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  ArrowUp20Regular,
  ArrowClockwise20Regular,
  ChevronRight12Regular,
  ChevronDown12Regular,
  Add20Regular,
  Add16Regular,
  Cut20Regular,
  Copy20Regular,
  ClipboardPaste20Regular,
  Rename20Regular,
  Share20Regular,
  Delete20Regular,
  ArrowSort20Regular,
  Grid20Regular,
  MoreHorizontal20Regular,
  Home20Regular,
  Image20Regular,
  Search16Regular,
  Dismiss12Regular,
  TextBulletListLtr16Regular,
  Grid16Regular,
  Pin12Regular,
  Globe20Regular,
  Info20Regular,
} from "@fluentui/react-icons";
import { useOS, type Win } from "../os/store";
import { useWin } from "../os/Window";
import { Img, iconUrl, ThisPCIcon, DriveIcon, FileIcon } from "../os/assets";

type Node = { name: string; type: "folder" | "file" | "drive"; icon?: string; ext?: string; children?: Node[]; size?: string; date?: string; total?: number; used?: number; ref?: string };

const KNOWN: Record<string, string> = { 桌面: "desk", 文档: "docs", 下载: "down", 图片: "pics", 音乐: "music", 视频: "vid" };
const f = (name: string, children: Node[] = []): Node => ({ name, type: "folder", children, date: "2025/5/12 14:20" });
const file = (name: string, size = "12 KB", date = "2025/5/18 09:31"): Node => ({ name, type: "file", ext: name.split(".").pop(), size, date });

function buildFS(userName: string, desktop: Node[]): Node[] {
  const user = f(userName, [
    { ...f("桌面", desktop), icon: "desk" },
    {
      ...f("文档", [
        f("Visual Studio 2022"),
        f("WindowsPowerShell"),
        f("自定义 Office 模板"),
        file("2025 年度总结.docx", "48 KB"),
        file("项目计划书.pdf", "1.2 MB"),
        file("会议纪要.txt", "3 KB"),
      ]),
      icon: "docs",
    },
    { ...f("下载", [file("vscode-setup-x64.exe", "96 MB"), file("壁纸合集.zip", "320 MB"), file("发票.pdf", "220 KB")]), icon: "down" },
    { ...f("图片", [f("屏幕截图"), f("本机照片"), file("旅行照片.jpg", "4.1 MB"), file("屏幕截图 2025-05-20.png", "860 KB")]), icon: "pics" },
    { ...f("音乐", [file("晴天.mp3", "9.8 MB"), file("夜曲.mp3", "8.6 MB")]), icon: "music" },
    { ...f("视频", [f("屏幕录制"), file("生日聚会.mp4", "1.4 GB")]), icon: "vid" },
    { ...f("OneDrive", [f("附件"), f("文档"), f("图片")]), icon: "onedrive" },
    f("AppData"),
    f("收藏夹"),
    f("联系人"),
  ]);
  user.icon = "user";
  const C: Node = {
    name: "C:",
    type: "drive",
    total: 476,
    used: 312,
    children: [
      f("PerfLogs"),
      f("Program Files", ["Common Files", "Microsoft Office", "Microsoft VS Code", "Windows Defender", "Windows Mail", "WindowsApps", "Git", "nodejs", "7-Zip"].map((n) => f(n))),
      f("Program Files (x86)", ["Google", "Microsoft", "Steam", "Windows Media Player"].map((n) => f(n))),
      f("Windows", [f("System32"), f("Fonts"), f("Web", [f("Wallpaper"), f("Screen")]), f("Temp"), file("explorer.exe", "5.1 MB"), file("notepad.exe", "360 KB")]),
      f("用户", [user, f("公用")]),
    ],
  };
  const D: Node = { name: "D:", type: "drive", total: 931, used: 405, children: [f("游戏"), f("学习资料"), f("备份"), f("影视"), file("说明.txt", "1 KB")] };
  return [C, D, user];
}

const tabTitle = (p: string[]) => p[p.length - 1] || "主文件夹";

function parsePayload(path: string | undefined, userName: string): string[] {
  if (!path) return ["主文件夹"];
  const seg = path.split("\\").filter(Boolean);
  if (seg[0] === "C:" || seg[0] === "D:") return ["此电脑", ...seg];
  if (KNOWN[seg[0]]) return ["此电脑", ...seg];
  if (seg[0] === "OneDrive") return ["此电脑", "C:", "用户", userName, "OneDrive", ...seg.slice(1)];
  return seg;
}

export function Explorer({ win }: { win: Win }) {
  const os = useOS();
  const { titleSlot } = useWin();
  const userName = os.settings.userName;

  const desktopNodes: Node[] = os.desktop
    .filter((d) => d.kind !== "app")
    .map((d) => (d.kind === "folder" ? { ...f(d.name), ref: d.id } : { ...file(d.name, `${Math.max(1, Math.round((d.content || "").length / 1024))} KB`), ref: d.id }));
  const fs = useMemo(() => buildFS(userName, desktopNodes), [userName, JSON.stringify(desktopNodes)]); // eslint-disable-line

  type Tab = { id: number; hist: string[][]; idx: number };
  const [tabs, setTabs] = useState<Tab[]>(() => [{ id: 1, hist: [parsePayload(win.payload?.path, userName)], idx: 0 }]);
  const [cur, setCur] = useState(1);
  const tab = tabs.find((t) => t.id === cur) || tabs[0];
  const path = tab.hist[tab.idx];
  const [sel, setSel] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editing, setEditing] = useState(false);
  const [addr, setAddr] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 此电脑: true });

  const firstPayload = useRef(win.payload);
  useEffect(() => {
    if (win.payload === firstPayload.current) return;
    firstPayload.current = win.payload;
    if (win.payload?.path) navigate(parsePayload(win.payload.path, userName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.payload]);

  const navigate = (p: string[]) => {
    setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, hist: [...t.hist.slice(0, t.idx + 1), p], idx: t.idx + 1 } : t)));
    setSel([]);
    setQuery("");
  };
  const go = (d: number) => setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, idx: Math.max(0, Math.min(t.hist.length - 1, t.idx + d)) } : t)));

  const userNode = fs[2];
  const resolve = (p: string[]): Node | null => {
    if (p[0] !== "此电脑") return null;
    if (p.length === 1) return null;
    let node: Node | undefined;
    let rest: string[];
    if (KNOWN[p[1]]) {
      node = userNode.children!.find((c) => c.name === p[1]);
      rest = p.slice(2);
    } else {
      node = fs.find((d) => d.name === p[1]);
      rest = p.slice(2);
    }
    for (const s of rest) {
      node = node?.children?.find((c) => c.name === s);
      if (!node) return null;
    }
    return node || null;
  };

  const special = path[0] === "主文件夹" || path[0] === "图库" || path[0] === "网络" || (path[0] === "此电脑" && path.length === 1);
  const node = special ? null : resolve(path);
  let items: Node[] = node?.children || [];
  if (query) items = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));
  const isDesktopDir = path.length === 2 && path[1] === "桌面";

  const open = (n: Node) => {
    if (n.type === "folder" || n.type === "drive") navigate([...path, n.name]);
    else if (n.ext === "txt") {
      if (n.ref) {
        const it = os.desktop.find((d) => d.id === n.ref);
        if (it) return os.openDesktopItem(it);
      }
      os.openApp("notepad", { name: n.name }, `${n.name} - 记事本`);
    } else if (["png", "jpg"].includes(n.ext || "")) os.openApp("photos");
    else if (["mp3", "mp4"].includes(n.ext || "")) os.openApp("groove");
    else os.notify({ icon: "explorer", app: "文件资源管理器", title: "无法打开此文件", body: `“${n.name}”是演示文件。` });
  };

  const iconFor = (n: Node, size: number) => {
    if (n.type === "drive") return <DriveIcon size={size} system={n.name === "C:"} />;
    if (n.type === "file") return <FileIcon size={size} ext={n.ext} />;
    const ic = n.icon || KNOWN[n.name];
    return <Img src={iconUrl("win/" + (ic || "folder") + (size <= 20 ? "-sm" : ""))} style={{ width: size, height: size }} alt="" />;
  };

  const newItem = (kind: "folder" | "file") => {
    if (!isDesktopDir) {
      navigate(["此电脑", "桌面"]);
    }
    if (kind === "folder") os.createDesktopItem("folder", "新建文件夹");
    else os.createDesktopItem("file", "新建 文本文档.txt", "txt");
  };

  const delSel = () => {
    if (!isDesktopDir) return;
    const ids = items.filter((i) => sel.includes(i.name) && i.ref).map((i) => i.ref!);
    os.deleteDesktopItems(ids);
    setSel([]);
  };

  const navItem = (label: string, icon: React.ReactNode, p: string[], opts?: { pin?: boolean; expandKey?: string; depth?: number }) => {
    const active = JSON.stringify(p) === JSON.stringify(path);
    return (
      <button
        key={label + p.join()}
        className={`group w-full h-8 flex items-center gap-2 rounded text-[13px] pr-2 relative ${active ? "bg-black/[.06] dark:bg-white/[.08]" : "hover:bg-black/[.04] dark:hover:bg-white/[.05]"}`}
        style={{ paddingLeft: 4 + (opts?.depth || 0) * 14 }}
        onClick={() => navigate(p)}
      >
        {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full accent-bg" />}
        <span
          className="w-4 h-4 flex items-center justify-center opacity-70"
          onClick={(e) => {
            if (!opts?.expandKey) return;
            e.stopPropagation();
            setExpanded((x) => ({ ...x, [opts.expandKey!]: !x[opts.expandKey!] }));
          }}
        >
          {opts?.expandKey ? expanded[opts.expandKey] ? <ChevronDown12Regular /> : <ChevronRight12Regular /> : null}
        </span>
        <span className="w-5 flex items-center justify-center">{icon}</span>
        <span className="flex-1 truncate text-left">{label}</span>
        {opts?.pin && <Pin12Regular className="opacity-50" />}
      </button>
    );
  };

  const tabsBar = (
    <div className="flex items-end h-full pl-2 gap-0.5 min-w-0">
      {tabs.map((t) => {
        const p = t.hist[t.idx];
        const active = t.id === tab.id;
        return (
          <div
            key={t.id}
            data-tab
            onClick={() => setCur(t.id)}
            className={`group h-[34px] w-[220px] min-w-[80px] flex items-center gap-2 px-3 rounded-t-lg text-[12px] relative cursor-default ${
              active ? "bg-white/90 dark:bg-[#2c2c2c] shadow-[0_0_0_1px_rgba(0,0,0,.05)]" : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span className="flex">{iconForPath(p, 16)}</span>
            <span className="flex-1 truncate">{tabTitle(p)}</span>
            <button
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                if (tabs.length === 1) return os.closeWin(win.id);
                const rest = tabs.filter((x) => x.id !== t.id);
                setTabs(rest);
                if (active) setCur(rest[rest.length - 1].id);
              }}
            >
              <Dismiss12Regular />
            </button>
          </div>
        );
      })}
      <button
        className="w-8 h-8 mb-0.5 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
        onClick={() => {
          const id = Date.now();
          setTabs((ts) => [...ts, { id, hist: [["主文件夹"]], idx: 0 }]);
          setCur(id);
        }}
      >
        <Add16Regular />
      </button>
    </div>
  );

  function iconForPath(p: string[], size: number) {
    const last = p[p.length - 1];
    if (p.length === 1) {
      if (last === "主文件夹") return <Home20Regular style={{ fontSize: size }} className="text-[#0078d4]" />;
      if (last === "此电脑") return <ThisPCIcon size={size} />;
      if (last === "图库") return <Image20Regular style={{ fontSize: size }} className="text-[#0078d4]" />;
      if (last === "网络") return <Globe20Regular style={{ fontSize: size }} className="text-[#0078d4]" />;
    }
    const n = resolve(p);
    if (n) return iconFor(n, size);
    return <Img src={iconUrl("win/folder-sm")} style={{ width: size, height: size }} alt="" />;
  }

  const toolBtn = "h-8 px-2 rounded flex items-center gap-1.5 text-[13px] hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40";

  const statusCount = special ? (path[0] === "此电脑" ? 8 : 12) : items.length;

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      {titleSlot && createPortal(tabsBar, titleSlot)}
      {/* address bar */}
      <div className="h-12 flex items-center gap-1 px-2 bg-white/90 dark:bg-[#2c2c2c] shrink-0">
        <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30" disabled={tab.idx === 0} onClick={() => go(-1)}>
          <ArrowLeft20Regular className="text-[16px]" />
        </button>
        <button
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
          disabled={tab.idx >= tab.hist.length - 1}
          onClick={() => go(1)}
        >
          <ArrowRight20Regular className="text-[16px]" />
        </button>
        <button
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
          disabled={path.length <= 1}
          onClick={() => navigate(path.slice(0, -1))}
        >
          <ArrowUp20Regular className="text-[16px]" />
        </button>
        <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => os.refresh()}>
          <ArrowClockwise20Regular className="text-[16px]" />
        </button>
        <div
          className="flex-1 h-8 mx-1 rounded win-input flex items-center px-2 gap-0.5 text-[13px] min-w-0 cursor-text"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setAddr(path.join("\\"));
              setEditing(true);
            }
          }}
        >
          {editing ? (
            <input
              autoFocus
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              onBlur={() => setEditing(false)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const seg = addr.split("\\").filter(Boolean);
                  navigate(seg[0] === "此电脑" || seg[0] === "主文件夹" ? seg : parsePayload(addr, userName));
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
              className="flex-1 bg-transparent outline-none"
            />
          ) : (
            <>
              <span className="flex mr-1">{iconForPath(path, 16)}</span>
              <ChevronRight12Regular className="opacity-60" />
              {path.map((s, i) => (
                <span key={i} className="flex items-center gap-0.5 shrink-0">
                  <button className="px-1.5 h-6 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => navigate(path.slice(0, i + 1))}>
                    {s}
                  </button>
                  {i < path.length - 1 && <ChevronRight12Regular className="opacity-60" />}
                </span>
              ))}
            </>
          )}
        </div>
        <div className="w-[240px] h-8 rounded win-input flex items-center px-2 gap-2 text-[13px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`搜索 ${tabTitle(path)}`} className="flex-1 bg-transparent outline-none min-w-0" />
          <Search16Regular className="opacity-70" />
        </div>
      </div>
      {/* command bar */}
      <div className="h-12 flex items-center gap-1 px-3 border-b border-black/[.06] dark:border-white/[.06] shrink-0 bg-white/50 dark:bg-white/[.02]">
        <NewMenu onNew={newItem} />
        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />
        <button className={toolBtn} title="剪切" disabled={!sel.length}>
          <Cut20Regular />
        </button>
        <button className={toolBtn} title="复制" disabled={!sel.length}>
          <Copy20Regular />
        </button>
        <button className={toolBtn} title="粘贴" disabled>
          <ClipboardPaste20Regular />
        </button>
        <button className={toolBtn} title="重命名" disabled={sel.length !== 1}>
          <Rename20Regular />
        </button>
        <button className={toolBtn} title="共享" disabled={!sel.length}>
          <Share20Regular />
        </button>
        <button className={toolBtn} title="删除" disabled={!sel.length || !isDesktopDir} onClick={delSel}>
          <Delete20Regular />
        </button>
        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />
        <button className={toolBtn}>
          <ArrowSort20Regular /> 排序 <ChevronDown12Regular />
        </button>
        <button className={toolBtn} onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}>
          <Grid20Regular /> 查看 <ChevronDown12Regular />
        </button>
        <button className={toolBtn}>
          <MoreHorizontal20Regular />
        </button>
        <div className="flex-1" />
        <button className={toolBtn}>
          <Info20Regular /> 详细信息
        </button>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* nav pane */}
        <div className="w-[210px] shrink-0 overflow-y-auto win-scroll p-1.5 border-r border-black/[.05] dark:border-white/[.05] hidden sm:block">
          {navItem("主文件夹", <Home20Regular className="text-[#0078d4] text-[18px]" />, ["主文件夹"])}
          {navItem("图库", <Image20Regular className="text-[#0078d4] text-[18px]" />, ["图库"])}
          {navItem("OneDrive - 个人", <Img src={iconUrl("win/onedrive-sm")} className="w-4 h-4" alt="" />, ["此电脑", "C:", "用户", userName, "OneDrive"], { expandKey: "od" })}
          <div className="h-px bg-black/10 dark:bg-white/10 my-2 mx-2" />
          {["桌面", "下载", "文档", "图片", "音乐", "视频"].map((k) =>
            navItem(k, <Img src={iconUrl("win/" + KNOWN[k] + "-sm")} className="w-4 h-4" alt="" />, ["此电脑", k], { pin: true })
          )}
          <div className="h-px bg-black/10 dark:bg-white/10 my-2 mx-2" />
          {navItem("此电脑", <ThisPCIcon size={16} />, ["此电脑"], { expandKey: "此电脑" })}
          {expanded["此电脑"] && (
            <>
              {navItem("Windows (C:)", <DriveIcon size={16} system />, ["此电脑", "C:"], { depth: 1 })}
              {navItem("Data (D:)", <DriveIcon size={16} />, ["此电脑", "D:"], { depth: 1 })}
            </>
          )}
          {navItem("网络", <Globe20Regular className="text-[#0078d4] text-[18px]" />, ["网络"], { expandKey: "net" })}
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 overflow-y-auto win-scroll p-3 bg-white/60 dark:bg-[#1c1c1c]/60" onClick={(e) => e.target === e.currentTarget && setSel([])}>
          {path[0] === "主文件夹" && path.length === 1 && (
            <HomeView
              onOpen={(p) => navigate(p)}
              iconOf={(k) => <Img src={iconUrl("win/" + KNOWN[k])} className="w-12 h-12" alt="" />}
              openFile={(n) => open(file(n))}
            />
          )}
          {path[0] === "此电脑" && path.length === 1 && (
            <div>
              <Section title="文件夹">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-1">
                  {Object.keys(KNOWN).map((k) => (
                    <button key={k} className="h-16 flex items-center gap-3 px-2 rounded hover:bg-black/[.04] dark:hover:bg-white/[.05] text-left" onDoubleClick={() => navigate(["此电脑", k])}>
                      <Img src={iconUrl("win/" + KNOWN[k])} className="w-12 h-12" alt="" />
                      <div className="text-[13px]">
                        <div>{k}</div>
                        <div className="text-[12px] opacity-60">存储在本地</div>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>
              <Section title="设备和驱动器">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-1">
                  {fs.slice(0, 2).map((d) => (
                    <button key={d.name} className="h-[72px] flex items-center gap-3 px-2 rounded hover:bg-black/[.04] dark:hover:bg-white/[.05] text-left" onDoubleClick={() => navigate(["此电脑", d.name])}>
                      <DriveIcon size={48} system={d.name === "C:"} />
                      <div className="flex-1 text-[13px]">
                        <div>{d.name === "C:" ? "Windows (C:)" : "Data (D:)"}</div>
                        <div className="h-[14px] mt-1 bg-black/10 dark:bg-white/15 border border-black/10">
                          <div className="h-full" style={{ width: `${(d.used! / d.total!) * 100}%`, background: d.used! / d.total! > 0.9 ? "#c42b1c" : "var(--accent)" }} />
                        </div>
                        <div className="text-[12px] opacity-60 mt-0.5">
                          {d.total! - d.used!} GB 可用，共 {d.total} GB
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>
            </div>
          )}
          {(path[0] === "图库" || path[0] === "网络") && (
            path[0] === "图库" ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <img key={i} src={`https://picsum.photos/seed/gal${i}/300/220`} className="w-full h-28 object-cover rounded hover:ring-2 ring-[var(--accent)]" onDoubleClick={() => os.openApp("photos")} alt="" />
                ))}
              </div>
            ) : (
              <div className="text-center text-[13px] opacity-60 mt-16">未发现网络设备。请确认已启用网络发现。</div>
            )
          )}
          {!special && !node && <div className="text-center text-[13px] opacity-60 mt-16">找不到“{path.join("\\")}”。请检查拼写并重试。</div>}
          {node && items.length === 0 && <div className="text-center text-[13px] opacity-60 mt-16">{query ? "没有与搜索条件匹配的项。" : "此文件夹为空。"}</div>}
          {node && items.length > 0 && view === "grid" && (
            <div className="grid grid-cols-[repeat(auto-fill,96px)] gap-1">
              {items.map((n) => (
                <button
                  key={n.name}
                  className={`h-[110px] flex flex-col items-center pt-2 gap-1 rounded border ${
                    sel.includes(n.name) ? "bg-[var(--accent)]/15 border-[var(--accent)]/30" : "border-transparent hover:bg-black/[.04] dark:hover:bg-white/[.05]"
                  }`}
                  onClick={(e) => setSel(e.ctrlKey ? [...sel, n.name] : [n.name])}
                  onDoubleClick={() => open(n)}
                >
                  {iconFor(n, 56)}
                  <span className="text-[12px] text-center leading-tight line-clamp-2 px-1 break-all">{n.type === "drive" ? (n.name === "C:" ? "Windows (C:)" : "Data (D:)") : n.name}</span>
                </button>
              ))}
            </div>
          )}
          {node && items.length > 0 && view === "list" && (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[12px] opacity-70 h-8">
                  <th className="font-normal pl-8">名称</th>
                  <th className="font-normal">修改日期</th>
                  <th className="font-normal">类型</th>
                  <th className="font-normal text-right pr-3">大小</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr
                    key={n.name}
                    className={`h-8 ${sel.includes(n.name) ? "bg-[var(--accent)]/15" : "hover:bg-black/[.04] dark:hover:bg-white/[.05]"}`}
                    onClick={() => setSel([n.name])}
                    onDoubleClick={() => open(n)}
                  >
                    <td className="pl-2">
                      <span className="flex items-center gap-2">
                        {iconFor(n, 18)}
                        {n.name}
                      </span>
                    </td>
                    <td className="opacity-70">{n.date || ""}</td>
                    <td className="opacity-70">{n.type === "folder" ? "文件夹" : n.type === "drive" ? "本地磁盘" : (n.ext || "").toUpperCase() + " 文件"}</td>
                    <td className="opacity-70 text-right pr-3">{n.type === "file" ? n.size : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* status bar */}
      <div className="h-7 flex items-center px-3 text-[12px] gap-4 shrink-0 bg-white/60 dark:bg-[#1c1c1c]/60 border-t border-black/[.04] dark:border-white/[.04]">
        <span>{statusCount} 个项目</span>
        {sel.length > 0 && <span>选中 {sel.length} 个项目</span>}
        <div className="flex-1" />
        <button className={`w-6 h-6 rounded flex items-center justify-center ${view === "list" ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5"}`} onClick={() => setView("list")}>
          <TextBulletListLtr16Regular />
        </button>
        <button className={`w-6 h-6 rounded flex items-center justify-center ${view === "grid" ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5"}`} onClick={() => setView("grid")}>
          <Grid16Regular />
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button className="flex items-center gap-2 h-8 px-1 text-[13px] font-semibold" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown12Regular /> : <ChevronRight12Regular />} {title}
      </button>
      {open && children}
    </div>
  );
}

function NewMenu({ onNew }: { onNew: (k: "folder" | "file") => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button className="h-8 px-2 rounded flex items-center gap-1.5 text-[13px] hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setOpen(!open)}>
        <Add20Regular className="accent-text" /> 新建 <ChevronDown12Regular />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-0 z-20 acrylic-strong flyout py-1 w-48 text-[13px] anim-menu">
            <button className="w-[calc(100%-8px)] mx-1 h-8 flex items-center gap-3 px-3 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { onNew("folder"); setOpen(false); }}>
              <Img src={iconUrl("win/folder-sm")} className="w-4 h-4" alt="" /> 文件夹
            </button>
            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
            <button className="w-[calc(100%-8px)] mx-1 h-8 flex items-center gap-3 px-3 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { onNew("file"); setOpen(false); }}>
              <FileIcon size={16} /> 文本文档
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function HomeView({ onOpen, iconOf, openFile }: { onOpen: (p: string[]) => void; iconOf: (k: string) => React.ReactNode; openFile: (n: string) => void }) {
  const recent = [
    { n: "会议纪要.txt", d: "2025/5/18 09:31", l: "文档" },
    { n: "2025 年度总结.docx", d: "2025/5/17 18:42", l: "文档" },
    { n: "屏幕截图 2025-05-20.png", d: "2025/5/20 11:02", l: "图片\\屏幕截图" },
    { n: "项目计划书.pdf", d: "2025/5/15 16:20", l: "文档" },
    { n: "旅行照片.jpg", d: "2025/5/12 08:12", l: "图片" },
  ];
  return (
    <div>
      <Section title="快速访问">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-1">
          {Object.keys(KNOWN).map((k) => (
            <button key={k} className="h-[70px] flex items-center gap-3 px-2 rounded hover:bg-black/[.04] dark:hover:bg-white/[.05] text-left" onDoubleClick={() => onOpen(["此电脑", k])}>
              {iconOf(k)}
              <div className="text-[13px]">
                <div>{k}</div>
                <div className="text-[11px] opacity-60 flex items-center gap-1">
                  <Pin12Regular /> 存储在本地
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>
      <Section title="最近使用的文件">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[12px] opacity-70 h-8">
              <th className="font-normal pl-8">名称</th>
              <th className="font-normal">修改日期</th>
              <th className="font-normal">文件位置</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.n} className="h-9 hover:bg-black/[.04] dark:hover:bg-white/[.05]" onDoubleClick={() => openFile(r.n)}>
                <td className="pl-2">
                  <span className="flex items-center gap-2">
                    <FileIcon size={20} ext={r.n.split(".").pop()} />
                    {r.n}
                  </span>
                </td>
                <td className="opacity-70">{r.d}</td>
                <td className="opacity-70">{r.l}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
