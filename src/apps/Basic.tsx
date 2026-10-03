import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Settings20Regular, Navigation20Regular, History20Regular, Dismiss12Regular, Add16Regular, ChevronDown12Regular, WindowNew20Regular } from "@fluentui/react-icons";
import { useOS, type Win } from "../os/store";
import { useWin } from "../os/Window";
import { AppIcon } from "../os/assets";
import { APPS } from "../os/apps";

/* ======================= Notepad ======================= */
export function Notepad({ win }: { win: Win }) {
  const os = useOS();
  const fileId: string | undefined = win.payload?.fileId;
  const item = fileId ? os.desktop.find((d) => d.id === fileId) : undefined;
  const [text, setText] = useState(() => item?.content ?? "");
  const [saved, setSaved] = useState(item?.content ?? "");
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const [menu, setMenu] = useState<string | null>(null);
  const [wrap, setWrap] = useState(true);
  const [status, setStatus] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [curId, setCurId] = useState(fileId);
  const ta = useRef<HTMLTextAreaElement>(null);
  const name = (curId && os.desktop.find((d) => d.id === curId)?.name) || win.payload?.name || "无标题";
  const dirty = text !== saved;

  useEffect(() => {
    os.updateWin(win.id, { title: `${dirty ? "*" : ""}${name} - 记事本` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, name]);

  const save = () => {
    if (curId) os.updateDesktopItem(curId, { content: text });
    else {
      const id = os.createDesktopItem("file", name.endsWith(".txt") ? name : "无标题.txt", "txt");
      setTimeout(() => os.updateDesktopItem(id, { content: text }), 0);
      setCurId(id);
    }
    setSaved(text);
  };

  const updatePos = () => {
    const el = ta.current;
    if (!el) return;
    const before = el.value.slice(0, el.selectionStart);
    const lines = before.split("\n");
    setPos({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  };

  const insert = (s: string) => {
    const el = ta.current!;
    const st = el.selectionStart;
    const v = text.slice(0, st) + s + text.slice(el.selectionEnd);
    setText(v);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = st + s.length;
      el.focus();
    }, 0);
  };

  const menus: Record<string, { l: string; s?: string; a: () => void; check?: boolean }[]> = {
    文件: [
      { l: "新建标签页", s: "Ctrl+N", a: () => os.openApp("notepad") },
      { l: "新建窗口", s: "Ctrl+Shift+N", a: () => os.openApp("notepad") },
      { l: "保存", s: "Ctrl+S", a: save },
      { l: "关闭窗口", s: "Ctrl+Shift+W", a: () => os.closeWin(win.id) },
    ],
    编辑: [
      { l: "撤消", s: "Ctrl+Z", a: () => document.execCommand("undo") },
      { l: "全选", s: "Ctrl+A", a: () => ta.current?.select() },
      { l: "时间/日期", s: "F5", a: () => insert(new Date().toLocaleString("zh-CN")) },
    ],
    查看: [
      { l: "放大", s: "Ctrl+加号", a: () => setZoom((z) => Math.min(300, z + 10)) },
      { l: "缩小", s: "Ctrl+减号", a: () => setZoom((z) => Math.max(30, z - 10)) },
      { l: "还原默认缩放", s: "Ctrl+0", a: () => setZoom(100) },
      { l: "状态栏", a: () => setStatus((s) => !s), check: status },
      { l: "自动换行", a: () => setWrap((s) => !s), check: wrap },
    ],
  };

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white">
      <div className="h-9 flex items-center px-1 text-[13px] relative shrink-0">
        {Object.keys(menus).map((m) => (
          <div key={m} className="relative">
            <button className={`h-7 px-3 rounded ${menu === m ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"}`} onClick={() => setMenu(menu === m ? null : m)}>
              {m}
            </button>
            {menu === m && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                <div className="absolute top-8 left-0 z-20 w-60 acrylic-strong flyout py-1 anim-menu">
                  {menus[m].map((it) => (
                    <button
                      key={it.l}
                      className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => {
                        it.a();
                        setMenu(null);
                      }}
                    >
                      <span className="w-3">{it.check ? "✓" : ""}</span>
                      <span className="flex-1 text-left">{it.l}</span>
                      <span className="text-[12px] opacity-60">{it.s}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        <div className="flex-1" />
        <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => os.openApp("settings", { page: "apps" })}>
          <Settings20Regular className="text-[16px]" />
        </button>
      </div>
      <textarea
        ref={ta}
        value={text}
        spellCheck={false}
        autoFocus
        onChange={(e) => {
          setText(e.target.value);
          updatePos();
        }}
        onKeyUp={updatePos}
        onClick={updatePos}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            save();
          }
          if (e.key === "F5") {
            e.preventDefault();
            insert(new Date().toLocaleString("zh-CN"));
          }
        }}
        className="flex-1 resize-none outline-none px-3 py-2 bg-white dark:bg-[#272727] select-text win-scroll border-t border-black/5 dark:border-white/5"
        style={{
          fontFamily: "Consolas, 'Cascadia Mono', 'Microsoft YaHei UI', monospace",
          fontSize: (14.5 * zoom) / 100,
          whiteSpace: wrap ? "pre-wrap" : "pre",
          lineHeight: 1.45,
        }}
      />
      {status && (
        <div className="h-7 flex items-center text-[12px] px-3 gap-0 shrink-0 bg-[#f3f3f3] dark:bg-[#202020]">
          <span className="pr-4">行 {pos.ln}，列 {pos.col}</span>
          <span className="px-4 border-l border-black/10 dark:border-white/10">{text.length} 个字符</span>
          <div className="flex-1" />
          <span className="px-4 border-l border-black/10 dark:border-white/10">{zoom}%</span>
          <span className="px-4 border-l border-black/10 dark:border-white/10">Windows (CRLF)</span>
          <span className="px-4 border-l border-black/10 dark:border-white/10">UTF-8</span>
        </div>
      )}
    </div>
  );
}

/* ======================= Calculator ======================= */
const fmtNum = (n: number) => {
  if (!isFinite(n)) return "除数不能为零";
  const s = Math.abs(n) >= 1e16 || (Math.abs(n) < 1e-10 && n !== 0) ? n.toExponential(8) : String(parseFloat(n.toPrecision(16)));
  if (s.includes("e")) return s;
  const [i, d] = s.split(".");
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d !== undefined ? "." + d : "");
};

export function Calculator() {
  const { active } = useWin();
  const [disp, setDisp] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [expr, setExpr] = useState("");
  const [fresh, setFresh] = useState(true);
  const [mem, setMem] = useState<number | null>(null);
  const [hist, setHist] = useState<{ e: string; r: string }[]>([]);
  const [showHist, setShowHist] = useState(false);
  const cur = () => parseFloat(disp.replace(/,/g, "")) || 0;
  const calc = (a: number, o: string, b: number) => (o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b === 0 ? Infinity : a / b);
  const err = disp === "除数不能为零";

  const press = (k: string) => {
    if (err && !["C", "CE"].includes(k) && !/\d/.test(k)) return;
    if (/^\d$/.test(k)) {
      if (fresh || err) {
        setDisp(k);
        setFresh(false);
        if (!op) setExpr("");
      } else if (disp.replace(/[,.-]/g, "").length < 16) setDisp(addDigit(disp, k));
      return;
    }
    switch (k) {
      case ".":
        if (fresh) {
          setDisp("0.");
          setFresh(false);
        } else if (!disp.includes(".")) setDisp(disp + ".");
        break;
      case "+":
      case "−":
      case "×":
      case "÷": {
        let a = cur();
        if (acc !== null && op && !fresh) {
          a = calc(acc, op, cur());
          setDisp(fmtNum(a));
        }
        setAcc(a);
        setOp(k);
        setExpr(`${fmtNum(a)} ${k}`);
        setFresh(true);
        break;
      }
      case "=": {
        if (acc === null || !op) {
          setExpr(`${fmtNum(cur())} =`);
          setFresh(true);
          break;
        }
        const b = cur();
        const r = calc(acc, op, b);
        const e = `${fmtNum(acc)} ${op} ${fmtNum(b)} =`;
        setExpr(e);
        setDisp(fmtNum(r));
        setHist((h) => [{ e, r: fmtNum(r) }, ...h]);
        setAcc(null);
        setOp(null);
        setFresh(true);
        break;
      }
      case "CE":
        setDisp("0");
        setFresh(true);
        break;
      case "C":
        setDisp("0");
        setAcc(null);
        setOp(null);
        setExpr("");
        setFresh(true);
        break;
      case "⌫":
        if (!fresh) {
          const raw = disp.replace(/,/g, "");
          const n = raw.length <= 1 || (raw.length === 2 && raw.startsWith("-")) ? "0" : raw.slice(0, -1);
          setDisp(n.endsWith(".") ? fmtNum(parseFloat(n)) + "." : fmtNum(parseFloat(n)));
        }
        break;
      case "±":
        setDisp(fmtNum(-cur()));
        break;
      case "%":
        setDisp(fmtNum(acc !== null ? (acc * cur()) / 100 : cur() / 100));
        setFresh(true);
        break;
      case "1/x":
        setExpr(`1/(${fmtNum(cur())})`);
        setDisp(fmtNum(cur() === 0 ? Infinity : 1 / cur()));
        setFresh(true);
        break;
      case "x²":
        setExpr(`sqr(${fmtNum(cur())})`);
        setDisp(fmtNum(cur() ** 2));
        setFresh(true);
        break;
      case "√x":
        setExpr(`√(${fmtNum(cur())})`);
        setDisp(cur() < 0 ? "无效输入" : fmtNum(Math.sqrt(cur())));
        setFresh(true);
        break;
    }
  };

  function addDigit(d: string, k: string) {
    const raw = d.replace(/,/g, "") + k;
    if (raw.includes(".")) {
      const [i, dec] = raw.split(".");
      return fmtNum(parseFloat(i)) + "." + dec;
    }
    return fmtNum(parseFloat(raw));
  }

  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      const m: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷", Enter: "=", "=": "=", Backspace: "⌫", Escape: "C", Delete: "CE", ".": ".", "%": "%" };
      if (/^\d$/.test(e.key)) press(e.key);
      else if (m[e.key]) {
        e.preventDefault();
        press(m[e.key]);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const keys = ["%", "CE", "C", "⌫", "1/x", "x²", "√x", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "±", "0", ".", "="];
  const fontSize = disp.length > 14 ? 28 : disp.length > 10 ? 36 : 46;

  return (
    <div className="absolute inset-0 flex flex-col text-black dark:text-white px-1 pb-1">
      <div className="flex items-center h-11 px-1">
        <button className="w-10 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10">
          <Navigation20Regular />
        </button>
        <span className="text-[20px] font-semibold ml-2 font-display">标准</span>
        <button className="w-9 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 ml-1" title="保持在顶部">
          <WindowNew20Regular className="text-[16px]" />
        </button>
        <div className="flex-1" />
        <button className="w-10 h-9 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setShowHist(!showHist)} title="历史记录">
          <History20Regular />
        </button>
      </div>
      <div className="px-3 text-right">
        <div className="h-5 text-[14px] opacity-60 truncate">{expr}</div>
        <div className="font-semibold font-display truncate leading-tight" style={{ fontSize }}>
          {disp}
        </div>
      </div>
      <div className="flex text-[12px] mt-1 mb-1">
        {["MC", "MR", "M+", "M−", "MS", "M˅"].map((m) => {
          const disabled = (m === "MC" || m === "MR" || m === "M˅") && mem === null;
          return (
            <button
              key={m}
              disabled={disabled}
              className="flex-1 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
              onClick={() => {
                if (m === "MC") setMem(null);
                if (m === "MR" && mem !== null) {
                  setDisp(fmtNum(mem));
                  setFresh(true);
                }
                if (m === "M+") setMem((x) => (x ?? 0) + cur());
                if (m === "M−") setMem((x) => (x ?? 0) - cur());
                if (m === "MS") setMem(cur());
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 gap-[2px]">
          {keys.map((k) => {
            const isNum = /^\d$|^[.±]$/.test(k);
            const isEq = k === "=";
            return (
              <button
                key={k}
                onClick={() => press(k)}
                className={`rounded-[4px] text-[15px] border border-black/[.05] dark:border-white/[.04] transition-colors ${
                  isEq
                    ? "accent-bg text-[20px] hover:brightness-110 active:brightness-90"
                    : isNum
                    ? "bg-white/90 dark:bg-white/[.09] hover:bg-white/60 dark:hover:bg-white/[.06] text-[17px] font-semibold"
                    : "bg-white/50 dark:bg-white/[.05] hover:bg-white/90 dark:hover:bg-white/[.08]"
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>
        {showHist && (
          <div className="absolute inset-0 mica rounded-t-lg p-3 overflow-y-auto win-scroll anim-slide-up border-t border-black/10 dark:border-white/10">
            <div className="text-[14px] font-semibold mb-2">历史记录</div>
            {hist.length === 0 ? (
              <div className="text-[13px] opacity-60">尚无历史记录</div>
            ) : (
              hist.map((h, i) => (
                <button
                  key={i}
                  className="w-full text-right p-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => {
                    setDisp(h.r);
                    setFresh(true);
                    setShowHist(false);
                  }}
                >
                  <div className="text-[12px] opacity-60">{h.e}</div>
                  <div className="text-[20px] font-semibold">{h.r}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================= Terminal ======================= */
type Line = { t: string; c?: string };
const BANNER: Line[] = [
  { t: "Windows PowerShell" },
  { t: "版权所有（C） Microsoft Corporation。保留所有权利。" },
  { t: "" },
  { t: "安装最新的 PowerShell，了解新功能和改进！https://aka.ms/PSWindows" },
  { t: "" },
];

function Session({ visible, onExit, onCmdTitle }: { visible: boolean; onExit: () => void; onCmdTitle?: (t: string) => void }) {
  const os = useOS();
  const home = `C:\\Users\\${os.settings.userName}`;
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [cwd, setCwd] = useState(home);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.scrollTo(0, ref.current.scrollHeight);
  }, [lines]);
  useEffect(() => {
    if (visible) inRef.current?.focus();
  }, [visible]);

  const print = (...l: (string | Line)[]) => setLines((x) => [...x, ...l.map((v) => (typeof v === "string" ? { t: v } : v))]);

  const DIRS: Record<string, string[]> = {
    [home.toLowerCase()]: ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos", "OneDrive", ".vscode"],
    "c:\\": ["PerfLogs", "Program Files", "Program Files (x86)", "Users", "Windows"],
    "c:\\users": [os.settings.userName, "Public"],
    "c:\\windows": ["System32", "Fonts", "Temp", "Web", "explorer.exe", "notepad.exe"],
  };

  const run = async (raw: string) => {
    const prompt = `PS ${cwd}> `;
    print({ t: prompt + raw, c: "cmd" });
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const a = args.join(" ");
    if (!cmd) return;
    setHist((h) => [raw, ...h]);
    const c = cmd.toLowerCase();
    switch (c) {
      case "help":
      case "get-help":
        print(
          "可用命令：",
          "  help              显示帮助",
          "  cls / clear       清屏",
          "  dir / ls          列出目录内容",
          "  cd <路径>         切换目录",
          "  echo <文本>       输出文本",
          "  date / time       显示日期时间",
          "  whoami / hostname 当前用户 / 计算机名",
          "  ver / systeminfo  系统版本 / 系统信息",
          "  ipconfig          网络配置",
          "  ping <主机>       测试网络连通性",
          "  start <应用>      启动应用（如 start edge、start notepad）",
          "  notepad / calc / explorer   快速启动",
          "  winfetch          显示系统信息（彩色）",
          "  color <主题>      设置主题: dark | light",
          "  history           命令历史",
          "  exit              关闭标签页"
        );
        break;
      case "cls":
      case "clear":
        setLines([]);
        break;
      case "echo":
      case "write-host":
        print(a.replace(/^["']|["']$/g, ""));
        break;
      case "date":
      case "get-date":
      case "time":
        print("", new Date().toLocaleString("zh-CN", { dateStyle: "full", timeStyle: "medium" }), "");
        break;
      case "whoami":
        print(`desktop-w11web\\${os.settings.userName.toLowerCase().replace(/\s/g, "")}`);
        break;
      case "hostname":
        print("DESKTOP-W11WEB");
        break;
      case "ver":
        print("", "Microsoft Windows [版本 10.0.22631.3593]", "");
        break;
      case "dir":
      case "ls":
      case "get-childitem": {
        const list = DIRS[cwd.toLowerCase()] || [];
        print("", `    目录: ${cwd}`, "", "Mode                 LastWriteTime         Length Name", "----                 -------------         ------ ----");
        list.forEach((n) => print(`${n.includes(".") && !n.startsWith(".") ? "-a----" : "d-----"}          2025/5/20     10:${String(10 + n.length).padStart(2, "0")}        ${n.includes(".exe") ? "  5,128" : "       "} ${n}`));
        print("");
        break;
      }
      case "cd":
      case "set-location": {
        if (!a || a === "~") setCwd(home);
        else if (a === "..") setCwd((p) => (p.length > 3 ? p.slice(0, p.lastIndexOf("\\")) || "C:\\" : p).replace(/^C:$/, "C:\\"));
        else if (a === "\\" || a === "/") setCwd("C:\\");
        else if (/^[a-z]:/i.test(a)) setCwd(a.toUpperCase().replace(/\/$/, ""));
        else setCwd((p) => (p.endsWith("\\") ? p : p + "\\") + a);
        break;
      }
      case "systeminfo":
        print(
          "",
          "主机名:           DESKTOP-W11WEB",
          "OS 名称:          Microsoft Windows 11 专业版",
          "OS 版本:          10.0.22631 暂缺 Build 22631",
          "OS 制造商:        Microsoft Corporation",
          "系统制造商:       React Foundation",
          "系统型号:         Vite Virtual Machine",
          "系统类型:         x64-based PC",
          `处理器:           ${navigator.hardwareConcurrency || 8} 个逻辑处理器`,
          `物理内存总量:     ${((navigator as any).deviceMemory || 16) * 1024} MB`,
          `浏览器:           ${navigator.userAgent.slice(0, 60)}...`,
          ""
        );
        break;
      case "ipconfig":
        print(
          "",
          "Windows IP 配置",
          "",
          "无线局域网适配器 WLAN:",
          "",
          "   连接特定的 DNS 后缀 . . . . . . . : lan",
          "   IPv6 地址 . . . . . . . . . . . . : fe80::1c2b:3d4e:5f60:7a8b%12",
          "   IPv4 地址 . . . . . . . . . . . . : 192.168.1.108",
          "   子网掩码  . . . . . . . . . . . . : 255.255.255.0",
          "   默认网关. . . . . . . . . . . . . : 192.168.1.1",
          ""
        );
        break;
      case "ping": {
        const host = a || "bing.com";
        setBusy(true);
        print("", `正在 Ping ${host} [13.107.21.200] 具有 32 字节的数据:`);
        for (let i = 0; i < 4; i++) {
          await new Promise((r) => setTimeout(r, 600));
          print(`来自 13.107.21.200 的回复: 字节=32 时间=${18 + Math.floor(Math.random() * 20)}ms TTL=117`);
        }
        print("", `13.107.21.200 的 Ping 统计信息:`, "    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，", "");
        setBusy(false);
        break;
      }
      case "start":
      case "start-process": {
        const q = a.toLowerCase();
        const app = APPS.find((x) => x.id === q || x.name.toLowerCase().includes(q));
        if (app) os.openApp(app.id);
        else print({ t: `start: 找不到应用“${a}”。`, c: "err" });
        break;
      }
      case "notepad":
      case "calc":
      case "explorer":
        os.openApp(c === "calc" ? "calculator" : c);
        break;
      case "color":
        if (a === "dark" || a === "light") os.setTheme(a);
        else print("用法: color dark | light");
        break;
      case "history":
        hist.slice().reverse().forEach((h, i) => print(`  ${i + 1}  ${h}`));
        break;
      case "winfetch":
      case "neofetch": {
        const user = os.settings.userName;
        const art = [
          ["################  ################", `${user}@DESKTOP-W11WEB`],
          ["################  ################", "-----------------------"],
          ["################  ################", "OS: Windows 11 专业版 x64"],
          ["################  ################", "Kernel: 10.0.22631"],
          ["################  ################", `Uptime: ${Math.floor(performance.now() / 60000)} 分钟`],
          ["################  ################", "Shell: PowerShell 5.1"],
          ["", `Resolution: ${window.screen.width}x${window.screen.height}`],
          ["################  ################", `Theme: ${os.settings.theme === "dark" ? "深色" : "浅色"}`],
          ["################  ################", "Terminal: Windows Terminal"],
          ["################  ################", `CPU: ${navigator.hardwareConcurrency || 8} 核`],
          ["################  ################", "GPU: WebGL Renderer"],
          ["################  ################", "Memory: 6.2 GiB / 16 GiB"],
          ["################  ################", ""],
        ];
        print("");
        art.forEach(([l, r]) => print({ t: l.padEnd(36, " ") + "  " + r, c: "fetch" }));
        print("");
        break;
      }
      case "exit":
        onExit();
        break;
      default:
        print(
          { t: `${cmd} : 无法将“${cmd}”项识别为 cmdlet、函数、脚本文件或可运行程序的名称。请检查名称的拼写，`, c: "err" },
          { t: "如果包括路径，请确保路径正确，然后再试一次。输入 help 查看可用命令。", c: "err" }
        );
    }
    onCmdTitle?.(cmd);
  };

  return (
    <div
      ref={ref}
      className="absolute inset-0 overflow-y-auto win-scroll p-2 terminal-font text-[14px] leading-[1.35] text-[#cccccc] select-text cursor-text"
      style={{ display: visible ? "block" : "none", background: "#0c0c0c" }}
      onClick={() => inRef.current?.focus()}
    >
      {lines.map((l, i) => (
        <div
          key={i}
          className="whitespace-pre-wrap break-all min-h-[1.35em]"
          style={{ color: l.c === "err" ? "#f14c4c" : l.c === "fetch" ? undefined : undefined }}
        >
          {l.c === "fetch" ? (
            <>
              <span style={{ color: "#3b9cff" }}>{l.t.slice(0, 38)}</span>
              <span className="text-[#e5e5e5]">{l.t.slice(38)}</span>
            </>
          ) : (
            l.t
          )}
        </div>
      ))}
      {!busy && (
        <div className="flex whitespace-pre">
          <span>PS {cwd}&gt; </span>
          <input
            ref={inRef}
            value={input}
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                run(input);
                setInput("");
                setHi(-1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                const n = Math.min(hist.length - 1, hi + 1);
                if (hist[n] !== undefined) {
                  setHi(n);
                  setInput(hist[n]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const n = hi - 1;
                setHi(Math.max(-1, n));
                setInput(n >= 0 ? hist[n] : "");
              } else if (e.key === "l" && e.ctrlKey) {
                e.preventDefault();
                setLines([]);
              }
            }}
            className="flex-1 bg-transparent outline-none text-[#cccccc] caret-[#cccccc] terminal-font"
          />
        </div>
      )}
    </div>
  );
}

export function Terminal({ win }: { win: Win }) {
  const os = useOS();
  const { titleSlot } = useWin();
  const [tabs, setTabs] = useState<{ id: number; kind: "ps" | "cmd" }[]>([{ id: 1, kind: "ps" }]);
  const [cur, setCur] = useState(1);
  const [dd, setDd] = useState(false);

  const close = (id: number) => {
    if (tabs.length === 1) return os.closeWin(win.id);
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (cur === id) setCur(rest[rest.length - 1].id);
  };
  const add = (kind: "ps" | "cmd" = "ps") => {
    const id = Date.now();
    setTabs((t) => [...t, { id, kind }]);
    setCur(id);
    setDd(false);
  };

  const bar = (
    <div className="flex items-end h-full pl-2 gap-0.5 relative">
      {tabs.map((t) => (
        <div
          key={t.id}
          data-tab
          onMouseDown={() => setCur(t.id)}
          className={`group h-[34px] w-[220px] flex items-center gap-2 px-3 rounded-t-lg text-[12px] cursor-default ${cur === t.id ? "bg-[#0c0c0c] text-white" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
        >
          <AppIcon icon="terminal" size={16} />
          <span className="flex-1 truncate">{t.kind === "ps" ? "Windows PowerShell" : "命令提示符"}</span>
          <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10" onClick={(e) => { e.stopPropagation(); close(t.id); }}>
            <Dismiss12Regular />
          </button>
        </div>
      ))}
      <button className="w-8 h-8 mb-0.5 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => add()}>
        <Add16Regular />
      </button>
      <button className="w-6 h-8 mb-0.5 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setDd(!dd)}>
        <ChevronDown12Regular />
      </button>
      {dd && (
        <div className="absolute top-full right-0 z-30 w-56 acrylic-strong flyout py-1 text-[13px] text-black dark:text-white anim-menu">
          <button className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => add("ps")}>
            Windows PowerShell <span className="ml-auto text-[11px] opacity-60">Ctrl+Shift+1</span>
          </button>
          <button className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => add("cmd")}>
            命令提示符 <span className="ml-auto text-[11px] opacity-60">Ctrl+Shift+2</span>
          </button>
          <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
          <button className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { setDd(false); os.openApp("settings"); }}>
            设置
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0" style={{ background: "#0c0c0c" }}>
      {titleSlot && createPortal(bar, titleSlot)}
      {tabs.map((t) => (
        <Session key={t.id} visible={t.id === cur} onExit={() => close(t.id)} />
      ))}
    </div>
  );
}
