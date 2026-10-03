import { useEffect, useState, type ReactNode } from "react";
import {
  Laptop20Regular,
  Bluetooth20Regular,
  Wifi120Regular,
  PaintBrush20Regular,
  Apps20Regular,
  Person20Regular,
  Globe20Regular,
  Games20Regular,
  Accessibility20Regular,
  Shield20Regular,
  ArrowSync20Regular,
  ChevronRight16Regular,
  Search16Regular,
  Desktop20Regular,
  Speaker220Regular,
  Alert20Regular,
  Power20Regular,
  Storage20Regular,
  Info20Regular,
  WeatherMoon20Regular,
  Airplane20Regular,
  Phone20Regular,
  Image20Regular,
  Color20Regular,
  Window20Regular,
  LockClosed20Regular,
  MoreHorizontal20Regular,
  Add20Regular,
  Clock20Regular,
  Keyboard20Regular,
  Mic20Regular,
  Location20Regular,
  Camera20Regular,
  TextFont20Regular,
  Eye20Regular,
  CheckmarkCircle20Filled,
  Copy20Regular,
  Cloud20Regular,
  BatterySaver20Regular,
  Router20Regular,
  ShieldKeyhole20Regular,
} from "@fluentui/react-icons";
import { useOS, ACCENTS, type Win } from "../os/store";
import { APPS } from "../os/apps";
import { AppIcon, Img, wallUrl, WALLPAPERS, iconUrl } from "../os/assets";
import { Avatar } from "../os/StartMenu";

const NAV = [
  { id: "system", label: "系统", icon: <Laptop20Regular />, color: "#0078d4", kw: "显示 声音 通知 电源 存储 关于" },
  { id: "bluetooth", label: "蓝牙和其他设备", icon: <Bluetooth20Regular />, color: "#0078d4", kw: "鼠标 键盘 打印机" },
  { id: "network", label: "网络和 Internet", icon: <Wifi120Regular />, color: "#2b88d8", kw: "WLAN wifi 飞行 VPN" },
  { id: "personalization", label: "个性化", icon: <PaintBrush20Regular />, color: "#e3008c", kw: "背景 壁纸 主题 颜色 深色 任务栏" },
  { id: "apps", label: "应用", icon: <Apps20Regular />, color: "#5c2e91", kw: "安装 默认应用" },
  { id: "accounts", label: "帐户", icon: <Person20Regular />, color: "#107c10", kw: "用户 名称 登录" },
  { id: "time", label: "时间和语言", icon: <Globe20Regular />, color: "#0063b1", kw: "日期 时区 语言 输入" },
  { id: "gaming", label: "游戏", icon: <Games20Regular />, color: "#525e54", kw: "游戏模式 Xbox" },
  { id: "accessibility", label: "辅助功能", icon: <Accessibility20Regular />, color: "#0078d4", kw: "文本大小 放大镜 对比度" },
  { id: "privacy", label: "隐私和安全性", icon: <Shield20Regular />, color: "#525e54", kw: "权限 相机 麦克风 位置" },
  { id: "update", label: "Windows 更新", icon: <ArrowSync20Regular />, color: "#0078d4", kw: "更新 升级" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span>{on ? "开" : "关"}</span>
      <button className={`win-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} />
    </div>
  );
}

function Row({ icon, title, sub, right, onClick, children }: { icon?: ReactNode; title: string; sub?: string; right?: ReactNode; onClick?: () => void; children?: ReactNode }) {
  return (
    <div className={`card rounded-[5px] ${onClick ? "hover:bg-white dark:hover:bg-white/[.08] cursor-default" : ""}`} onClick={onClick}>
      <div className="min-h-[68px] flex items-center gap-4 px-4 py-3">
        {icon && <span className="text-[20px] flex w-5 justify-center">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="text-[14px]">{title}</div>
          {sub && <div className="text-[12px] opacity-70 mt-0.5">{sub}</div>}
        </div>
        {right}
        {onClick && !right && <ChevronRight16Regular className="opacity-70" />}
      </div>
      {children}
    </div>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-[3px] mb-6">{children}</div>;
}

export function SettingsApp({ win }: { win: Win }) {
  const os = useOS();
  const [page, setPage] = useState<string>(win.payload?.page || "system");
  const [q, setQ] = useState("");
  const [hist, setHist] = useState<string[]>([]);

  useEffect(() => {
    if (win.payload?.page) setPage(win.payload.page);
  }, [win.payload]);

  const go = (p: string) => {
    setHist((h) => [...h, page]);
    setPage(p);
  };

  const results = q ? NAV.filter((n) => (n.label + n.kw).toLowerCase().includes(q.toLowerCase())) : [];
  const navActive = page === "about" ? "system" : page;
  const cur = NAV.find((n) => n.id === navActive);
  const title = page === "about" ? "系统  ›  关于" : cur?.label;

  return (
    <div className="absolute inset-0 flex text-black dark:text-white">
      <div className="w-[300px] shrink-0 flex flex-col px-3 pt-1 overflow-y-auto win-scroll max-md:hidden">
        <div className="flex items-center gap-3 px-2 py-4">
          <Avatar size={64} />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold truncate">{os.settings.userName}</div>
            <div className="text-[12px] opacity-70">本地帐户</div>
          </div>
        </div>
        <div className="relative mb-3 px-1">
          <div className="h-8 rounded win-input flex items-center px-3 gap-2 text-[13px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  go(results[0].id);
                  setQ("");
                }
              }}
              placeholder="查找设置"
              className="flex-1 bg-transparent outline-none min-w-0"
            />
            <Search16Regular className="opacity-70" />
          </div>
          {q && (
            <div className="absolute left-1 right-1 top-9 z-20 acrylic-strong flyout py-1 anim-menu">
              {results.length === 0 && <div className="px-3 py-2 text-[13px] opacity-60">未找到结果</div>}
              {results.map((r) => (
                <button key={r.id} className="w-[calc(100%-8px)] mx-1 h-8 px-3 flex items-center gap-2 rounded text-[13px] hover:bg-black/5 dark:hover:bg-white/10" onClick={() => { go(r.id); setQ(""); }}>
                  <span style={{ color: r.color }} className="flex">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => go(n.id)}
            className={`relative h-9 flex items-center gap-4 px-3 rounded text-[14px] mb-[2px] ${navActive === n.id ? "bg-black/[.05] dark:bg-white/[.06]" : "hover:bg-black/[.04] dark:hover:bg-white/[.04]"}`}
          >
            {navActive === n.id && <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full accent-bg" />}
            <span className="flex text-[18px]" style={{ color: n.color }}>
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto win-scroll px-8 pb-8">
        <div className="flex items-center gap-2 mt-3 mb-6">
          {hist.length > 0 && (
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 md:hidden" onClick={() => { setPage(hist[hist.length - 1]); setHist((h) => h.slice(0, -1)); }}>
              ←
            </button>
          )}
          <h1 className="text-[28px] font-semibold font-display">{title}</h1>
        </div>
        <div className="max-w-[1000px] anim-fade" key={page}>
          {page === "system" && <SystemPage go={go} />}
          {page === "about" && <AboutPage />}
          {page === "bluetooth" && <BluetoothPage />}
          {page === "network" && <NetworkPage />}
          {page === "personalization" && <PersonalizationPage />}
          {page === "apps" && <AppsPage />}
          {page === "accounts" && <AccountsPage />}
          {page === "time" && <TimePage />}
          {page === "update" && <UpdatePage />}
          {page === "gaming" && (
            <Rows>
              <Row icon={<Games20Regular />} title="Xbox Game Bar" sub="配置游戏栏以及其识别游戏的方式" right={<Toggle on onChange={() => {}} />} />
              <Row icon={<Camera20Regular />} title="捕获" sub="保存位置、录制质量" onClick={() => {}} />
              <Row icon={<Power20Regular />} title="游戏模式" sub="通过关闭后台活动来优化电脑以便玩游戏" onClick={() => {}} />
            </Rows>
          )}
          {page === "accessibility" && <AccessibilityPage />}
          {page === "privacy" && (
            <>
              <div className="text-[14px] font-semibold mb-2">安全性</div>
              <Rows>
                <Row icon={<Img src={iconUrl("security")} className="w-5 h-5" alt="" />} title="Windows 安全中心" sub="适用于你设备的防病毒、浏览器、防火墙和网络保护" onClick={() => {}} />
                <Row icon={<Location20Regular />} title="查找我的设备" sub="如果丢失了设备，请跟踪它" onClick={() => {}} />
              </Rows>
              <div className="text-[14px] font-semibold mb-2">应用权限</div>
              <Rows>
                <Row icon={<Location20Regular />} title="位置" right={<Toggle on onChange={() => {}} />} />
                <Row icon={<Camera20Regular />} title="相机" right={<Toggle on onChange={() => {}} />} />
                <Row icon={<Mic20Regular />} title="麦克风" right={<Toggle on={false} onChange={() => {}} />} />
              </Rows>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemPage({ go }: { go: (p: string) => void }) {
  const os = useOS();
  const s = os.settings;
  return (
    <>
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-[150px] h-[92px] rounded-md bg-black p-[5px] shadow-lg">
            <Img src={wallUrl(WALLPAPERS[s.wallpaper])} className="w-full h-full object-cover rounded-sm" alt="" />
          </div>
          <div>
            <div className="text-[18px] font-semibold">DESKTOP-W11WEB</div>
            <div className="text-[13px] opacity-70">Web Virtual PC</div>
            <button className="text-[13px] accent-text hover:underline mt-1">重命名</button>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex gap-3">
          {[
            { i: "msoffice", t: "Microsoft 365", s: "查看权益" },
            { i: "oneDrive", t: "OneDrive", s: "• 已备份" },
            { i: "", t: "Windows 更新", s: "上次检查时间: 1 小时前" },
          ].map((x) => (
            <button key={x.t} className="flex items-center gap-2 text-left" onClick={() => x.i === "" && go("update")}>
              {x.i ? <AppIcon icon={x.i} size={28} /> : <ArrowSync20Regular className="text-[28px] accent-text" />}
              <div>
                <div className="text-[13px] font-semibold">{x.t}</div>
                <div className="text-[12px] opacity-70">{x.s}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <Rows>
        <Row icon={<Desktop20Regular />} title="屏幕" sub="显示器、亮度、夜间模式、显示描述">
          <div className="px-4 pb-4 pl-[52px] flex items-center gap-4">
            <span className="text-[13px] w-20">亮度</span>
            <input type="range" min={10} max={100} value={s.brightness} className="win-range flex-1 max-w-[320px]" style={{ ["--val" as any]: `${((s.brightness - 10) / 90) * 100}%` }} onChange={(e) => os.set("brightness", +e.target.value)} />
          </div>
          <div className="px-4 pb-4 pl-[52px] flex items-center gap-4">
            <span className="text-[13px] w-20 flex items-center gap-1">
              <WeatherMoon20Regular className="text-[16px]" />
              夜间模式
            </span>
            <Toggle on={s.nightlight} onChange={(v) => os.set("nightlight", v)} />
          </div>
        </Row>
        <Row icon={<Speaker220Regular />} title="声音" sub="音量级别、输出、输入、声音设备">
          <div className="px-4 pb-4 pl-[52px] flex items-center gap-4">
            <span className="text-[13px] w-20">音量</span>
            <input type="range" min={0} max={100} value={s.volume} className="win-range flex-1 max-w-[320px]" style={{ ["--val" as any]: `${s.volume}%` }} onChange={(e) => os.set("volume", +e.target.value)} />
            <span className="text-[13px] w-8">{s.volume}</span>
          </div>
        </Row>
        <Row icon={<Alert20Regular />} title="通知" sub="来自应用和系统的警报，勿扰模式" right={<Toggle on={!s.focus} onChange={(v) => os.set("focus", !v)} />} />
        <Row icon={<Power20Regular />} title="电源和电池" sub="睡眠、电池使用情况、节电模式" right={<Toggle on={s.saver} onChange={(v) => os.set("saver", v)} />} />
        <Row icon={<Storage20Regular />} title="存储" sub="存储空间、驱动器、配置规则" onClick={() => os.openApp("thispc")} />
        <Row icon={<Window20Regular />} title="多任务处理" sub="贴靠窗口、桌面、任务切换" onClick={() => {}} />
        <Row icon={<Info20Regular />} title="系统信息" sub="设备规格、重命名电脑、Windows 规格" onClick={() => go("about")} />
        <Row
          icon={<Alert20Regular />}
          title="发送测试通知"
          sub="在右下角显示一条通知"
          right={
            <button className="win-btn" onClick={() => os.notify({ icon: "settings", app: "设置", title: "这是一条测试通知", body: "通知系统工作正常 🎉" })}>
              发送
            </button>
          }
        />
      </Rows>
    </>
  );
}

function AboutPage() {
  const spec = [
    ["设备名称", "DESKTOP-W11WEB"],
    ["处理器", `Virtual CPU @ 3.20GHz (${navigator.hardwareConcurrency || 8} 核)`],
    ["机带 RAM", `${(navigator as any).deviceMemory || 16}.0 GB`],
    ["设备 ID", "8A3F2C1D-7B4E-4F9A-A1C2-5D6E7F8091AB"],
    ["产品 ID", "00330-80000-00000-AA123"],
    ["系统类型", "64 位操作系统, 基于 x64 的处理器"],
    ["笔和触控", "没有可用于此显示器的笔或触控输入"],
  ];
  const winSpec = [
    ["版本", "Windows 11 专业版"],
    ["版本号", "23H2"],
    ["安装日期", "2025/1/1"],
    ["操作系统版本", "22631.3593"],
    ["体验", "Windows Feature Experience Pack 1000.22700.1003.0"],
  ];
  const Block = ({ t, rows }: { t: string; rows: string[][] }) => (
    <div className="card rounded-[5px] mb-3">
      <div className="h-14 flex items-center gap-4 px-4">
        <Info20Regular className="text-[20px]" />
        <span className="flex-1 text-[14px] font-semibold">{t}</span>
        <button className="win-btn flex items-center gap-2" onClick={() => navigator.clipboard?.writeText(rows.map((r) => r.join("\t")).join("\n"))}>
          <Copy20Regular className="text-[14px]" /> 复制
        </button>
      </div>
      <div className="px-4 pb-4 pl-[52px] grid grid-cols-[160px_1fr] gap-y-2 text-[13px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <span className="opacity-70">{k}</span>
            <span className="select-text">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <>
      <Block t="设备规格" rows={spec} />
      <Block t="Windows 规格" rows={winSpec} />
    </>
  );
}

function BluetoothPage() {
  const os = useOS();
  const [devices, setDevices] = useState([
    { n: "Surface Arc Mouse", t: "鼠标", c: true },
    { n: "AirPods Pro", t: "音频", c: true },
    { n: "Keychron K2", t: "键盘", c: false },
  ]);
  return (
    <>
      <div className="card rounded-[5px] p-4 flex items-center gap-4 mb-6">
        <Bluetooth20Regular className="text-[32px] accent-text" />
        <div className="flex-1">
          <div className="text-[14px] font-semibold">蓝牙</div>
          <div className="text-[12px] opacity-70">{os.settings.bluetooth ? "可发现为“DESKTOP-W11WEB”" : "关闭"}</div>
        </div>
        <Toggle on={os.settings.bluetooth} onChange={(v) => os.set("bluetooth", v)} />
      </div>
      <Rows>
        <Row icon={<Add20Regular />} title="添加设备" right={<button className="win-btn-accent text-[13px]" onClick={() => setDevices((d) => [...d, { n: "Galaxy Buds", t: "音频", c: false }])}>添加设备</button>} />
        {os.settings.bluetooth &&
          devices.map((d, i) => (
            <Row
              key={d.n + i}
              icon={<Bluetooth20Regular />}
              title={d.n}
              sub={d.c ? `已连接 · ${d.t}` : `已配对 · ${d.t}`}
              right={
                <button className="win-btn text-[13px]" onClick={() => setDevices((x) => x.map((y, j) => (j === i ? { ...y, c: !y.c } : y)))}>
                  {d.c ? "断开连接" : "连接"}
                </button>
              }
            />
          ))}
      </Rows>
    </>
  );
}

function NetworkPage() {
  const os = useOS();
  const s = os.settings;
  return (
    <>
      <div className="card rounded-[5px] p-5 flex items-center gap-5 mb-6">
        <Wifi120Regular className="text-[40px] accent-text" />
        <div className="flex-1">
          <div className="text-[16px] font-semibold">{s.wifi ? "Home-5G" : "未连接"}</div>
          <div className="text-[12px] opacity-70">{s.wifi ? "已连接，安全 · 802.11ax · 5 GHz" : "WLAN 已关闭"}</div>
        </div>
        <div className="text-[12px] text-right opacity-80">
          <div>属性</div>
          <div className="opacity-70">公用网络</div>
        </div>
      </div>
      <Rows>
        <Row icon={<Wifi120Regular />} title="WLAN" sub="连接、管理已知网络、按流量计费的网络" right={<Toggle on={s.wifi} onChange={(v) => os.set("wifi", v)} />} />
        <Row icon={<Router20Regular />} title="以太网" sub="身份验证、IP 和 DNS 设置" onClick={() => {}} />
        <Row icon={<ShieldKeyhole20Regular />} title="VPN" sub="添加、连接、管理" onClick={() => {}} />
        <Row icon={<Phone20Regular />} title="移动热点" sub="共享你的 Internet 连接" right={<Toggle on={s.hotspot} onChange={(v) => os.set("hotspot", v)} />} />
        <Row icon={<Airplane20Regular />} title="飞行模式" sub="停止无线通信" right={<Toggle on={s.airplane} onChange={(v) => { os.set("airplane", v); os.set("wifi", !v); }} />} />
        <Row icon={<Globe20Regular />} title="代理" sub="用于 WLAN 和以太网连接的代理服务器" onClick={() => {}} />
      </Rows>
    </>
  );
}

const THEMES = [
  { w: 0, t: "light" as const, n: "Windows (浅色)" },
  { w: 1, t: "dark" as const, n: "Windows (深色)" },
  { w: 2, t: "light" as const, n: "辉光" },
  { w: 6, t: "dark" as const, n: "捕获的动态" },
  { w: 10, t: "light" as const, n: "日出" },
  { w: 14, t: "dark" as const, n: "流动" },
];

function PersonalizationPage() {
  const os = useOS();
  const s = os.settings;
  return (
    <>
      <div className="flex flex-wrap gap-6 mb-6">
        <div className="w-[340px] h-[200px] rounded-lg overflow-hidden relative shadow-lg shrink-0 border-4 border-black">
          <Img src={wallUrl(WALLPAPERS[s.wallpaper])} className="absolute inset-0 w-full h-full object-cover" alt="" />
          <div className={`absolute left-[25%] top-[18%] w-[50%] h-[55%] rounded ${s.theme === "dark" ? "bg-[#202020]" : "bg-[#f3f3f3]"} shadow-xl p-2`}>
            <div className="h-1.5 w-10 rounded-full accent-bg mb-2" />
            <div className={`h-1 w-16 rounded-full mb-1 ${s.theme === "dark" ? "bg-white/30" : "bg-black/20"}`} />
            <div className={`h-1 w-12 rounded-full ${s.theme === "dark" ? "bg-white/30" : "bg-black/20"}`} />
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-4 ${s.theme === "dark" ? "bg-[#1c1c1c]/90" : "bg-[#f3f3f3]/90"} flex items-center justify-center gap-1`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-2 h-2 rounded-sm accent-bg opacity-80" />
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-[300px]">
          <div className="text-[14px] mb-2">选择要应用的主题</div>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.n}
                title={t.n}
                className={`h-[72px] rounded-md overflow-hidden relative border-2 ${s.wallpaper === t.w && s.theme === t.t ? "accent-border" : "border-transparent hover:border-black/20 dark:hover:border-white/30"}`}
                onClick={() => {
                  os.set("theme", t.t);
                  os.set("wallpaper", t.w);
                }}
              >
                <Img src={wallUrl(WALLPAPERS[t.w])} className="w-full h-full object-cover" alt="" />
                <span className={`absolute right-1 bottom-1 w-6 h-4 rounded-sm ${t.t === "dark" ? "bg-[#202020]" : "bg-white"} flex items-center justify-center`}>
                  <span className="w-3 h-1 rounded-full accent-bg" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Rows>
        <Row icon={<Image20Regular />} title="背景" sub="背景图像、颜色、幻灯片放映">
          <div className="px-4 pb-4 pl-[52px] grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
            {WALLPAPERS.map((w, i) => (
              <button key={w} className={`h-[68px] rounded overflow-hidden border-2 relative ${s.wallpaper === i ? "accent-border" : "border-transparent hover:opacity-80"}`} onClick={() => os.set("wallpaper", i)}>
                <Img src={wallUrl(w)} className="w-full h-full object-cover" alt="" loading="lazy" />
                {s.wallpaper === i && <CheckmarkCircle20Filled className="absolute top-1 right-1 accent-text bg-white rounded-full" />}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={<Color20Regular />} title="颜色" sub="主题色、透明效果、颜色主题">
          <div className="px-4 pb-4 pl-[52px] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px]">选择模式</span>
              <select value={s.theme} onChange={(e) => os.setTheme(e.target.value as any)} className="win-btn min-w-[140px] outline-none">
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px]">透明效果</span>
              <Toggle on={s.transparency} onChange={(v) => os.set("transparency", v)} />
            </div>
            <div>
              <div className="text-[13px] mb-2">主题色</div>
              <div className="flex flex-wrap gap-1.5">
                {ACCENTS.map((a, i) => (
                  <button
                    key={a.name}
                    title={a.name}
                    className={`w-10 h-10 rounded relative ${s.accent === i ? "ring-2 ring-offset-2 ring-black/60 dark:ring-white/80 ring-offset-transparent" : ""}`}
                    style={{ background: s.theme === "dark" ? a.dark : a.light }}
                    onClick={() => os.set("accent", i)}
                  >
                    {s.accent === i && <span className="absolute inset-0 flex items-center justify-center text-white text-[16px] drop-shadow">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Row>
        <Row icon={<Window20Regular />} title="桌面图标" sub="显示或隐藏桌面图标" right={<Toggle on={s.showIcons} onChange={(v) => os.set("showIcons", v)} />} />
        <Row icon={<LockClosed20Regular />} title="锁屏界面" sub="锁屏界面图像、应用和动画" right={<button className="win-btn" onClick={() => os.power("lock")}>预览</button>} />
        <Row icon={<TextFont20Regular />} title="字体" sub="安装、管理" onClick={() => {}} />
        <Row icon={<Laptop20Regular />} title="开始" sub="最近使用的应用和项目、文件夹" onClick={() => os.setPanel("start")} />
        <Row icon={<Desktop20Regular />} title="任务栏" sub="任务栏行为、系统固定" onClick={() => {}} />
      </Rows>
    </>
  );
}

function AppsPage() {
  const os = useOS();
  const [q, setQ] = useState("");
  const list = APPS.filter((a) => !["thispc", "user", "recycle"].includes(a.id) && a.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="flex gap-3 mb-4">
        <div className="h-8 w-[300px] rounded win-input flex items-center px-3 gap-2 text-[13px]">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索应用" className="flex-1 bg-transparent outline-none" />
          <Search16Regular className="opacity-70" />
        </div>
        <span className="text-[13px] opacity-70 self-center">找到 {list.length} 个应用</span>
      </div>
      <Rows>
        {list.map((a, i) => (
          <Row
            key={a.id}
            icon={<AppIcon icon={a.icon} size={24} />}
            title={a.name}
            sub={`Microsoft Corporation | 2025/${(i % 5) + 1}/${(i % 27) + 1}`}
            right={
              <div className="flex items-center gap-4 text-[13px]">
                <span className="opacity-70">{((i * 37) % 400) + 12} MB</span>
                <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => os.openApp(a.id)} title="打开">
                  <MoreHorizontal20Regular />
                </button>
              </div>
            }
          />
        ))}
      </Rows>
    </>
  );
}

function AccountsPage() {
  const os = useOS();
  const [name, setName] = useState(os.settings.userName);
  return (
    <>
      <div className="card rounded-[5px] p-6 flex items-center gap-6 mb-6">
        <Avatar size={96} />
        <div>
          <div className="text-[18px] font-semibold">{os.settings.userName}</div>
          <div className="text-[13px] opacity-70">本地帐户</div>
          <div className="text-[13px] opacity-70">管理员</div>
        </div>
      </div>
      <Rows>
        <Row icon={<Person20Regular />} title="帐户名称" sub="更改显示在开始菜单、锁屏界面中的名称">
          <div className="px-4 pb-4 pl-[52px] flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="win-input h-8 px-3 text-[13px] w-[260px]" />
            <button className="win-btn-accent text-[13px]" onClick={() => name.trim() && os.set("userName", name.trim())}>
              保存
            </button>
          </div>
        </Row>
        <Row icon={<Cloud20Regular />} title="Windows 备份" sub="备份你的文件、应用、首选项" onClick={() => {}} />
        <Row icon={<LockClosed20Regular />} title="登录选项" sub="Windows Hello、安全密钥、密码、动态锁" onClick={() => {}} />
        <Row icon={<Keyboard20Regular />} title="家庭" sub="管理你的家庭组，编辑帐户类型和设备权限" onClick={() => {}} />
      </Rows>
    </>
  );
}

function TimePage() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <div className="flex items-end gap-6 mb-6">
        <div className="text-[44px] font-semibold font-display leading-none tabular-nums">{now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
        <div className="text-[14px] opacity-80 pb-1">
          {now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          <br />
          中国标准时间
        </div>
      </div>
      <Rows>
        <Row icon={<Clock20Regular />} title="日期和时间" sub="时区、自动时钟设置、日历显示" onClick={() => {}} />
        <Row icon={<Globe20Regular />} title="语言和区域" sub="Windows 和某些应用根据你所在的区域设置日期和时间格式" onClick={() => {}} />
        <Row icon={<Keyboard20Regular />} title="输入" sub="触摸键盘、文本建议、首选项" onClick={() => {}} />
        <Row icon={<Mic20Regular />} title="语音" sub="语音语言、语音识别麦克风设置、语音" onClick={() => {}} />
        <Row icon={<Clock20Regular />} title="自动设置时间" right={<Toggle on onChange={() => {}} />} />
      </Rows>
    </>
  );
}

function AccessibilityPage() {
  const os = useOS();
  return (
    <Rows>
      <Row icon={<TextFont20Regular />} title="文本大小" sub="出现在 Windows 和应用中的文本大小" onClick={() => {}} />
      <Row icon={<Eye20Regular />} title="视觉效果" sub="滚动条、透明度、动画、通知超时" right={<Toggle on={os.settings.transparency} onChange={(v) => os.set("transparency", v)} />} />
      <Row icon={<Desktop20Regular />} title="深色模式" sub="使用深色应用模式" right={<Toggle on={os.settings.theme === "dark"} onChange={(v) => os.setTheme(v ? "dark" : "light")} />} />
      <Row icon={<WeatherMoon20Regular />} title="夜间模式" sub="使用暖色以帮助你入睡" right={<Toggle on={os.settings.nightlight} onChange={(v) => os.set("nightlight", v)} />} />
      <Row icon={<BatterySaver20Regular />} title="节电模式" right={<Toggle on={os.settings.saver} onChange={(v) => os.set("saver", v)} />} />
    </Rows>
  );
}

function UpdatePage() {
  const os = useOS();
  const [st, setSt] = useState<"idle" | "checking" | "found" | "downloading" | "ready">("idle");
  const [pct, setPct] = useState(0);
  useEffect(() => {
    if (st === "checking") {
      const t = setTimeout(() => setSt("found"), 2600);
      return () => clearTimeout(t);
    }
    if (st === "downloading") {
      const t = setInterval(() => {
        setPct((p) => {
          if (p >= 100) {
            clearInterval(t);
            setSt("ready");
            os.notify({ icon: "settings", app: "Windows 更新", title: "需要重启", body: "重新启动设备以完成更新安装。" });
            return 100;
          }
          return p + 4;
        });
      }, 160);
      return () => clearInterval(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [st]);

  return (
    <>
      <div className="flex items-center gap-5 mb-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {st === "checking" ? (
            <svg className="progress-ring" width="56" height="56" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="15" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : st === "idle" ? (
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#107c10" }}>
              <ArrowSync20Regular className="text-white text-[28px]" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full accent-bg flex items-center justify-center">
              <ArrowSync20Regular className="text-[28px]" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-[20px] font-semibold">
            {st === "idle" && "你使用的是最新版本"}
            {st === "checking" && "正在检查更新..."}
            {st === "found" && "有可用更新"}
            {st === "downloading" && "正在下载并安装更新"}
            {st === "ready" && "需要重启"}
          </div>
          <div className="text-[13px] opacity-70">上次检查时间: 今天，{new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        {st === "idle" && <button className="win-btn-accent" onClick={() => setSt("checking")}>检查更新</button>}
        {st === "found" && <button className="win-btn-accent" onClick={() => { setPct(0); setSt("downloading"); }}>全部下载并安装</button>}
        {st === "ready" && <button className="win-btn-accent" onClick={() => os.power("restart")}>立即重新启动</button>}
      </div>
      {(st === "found" || st === "downloading" || st === "ready") && (
        <Rows>
          {["2025-05 适用于 Windows 11 Version 23H2 的累积更新 (KB5037853)", "适用于 x64 系统的 Windows 恶意软件删除工具 - v5.125"].map((u, i) => (
            <Row key={u} icon={<ArrowSync20Regular />} title={u} sub={st === "found" ? "等待下载" : st === "ready" ? "等待重启" : `正在下载 - ${Math.min(100, pct + i * 20)}%`}>
              {st === "downloading" && (
                <div className="px-4 pb-4 pl-[52px]">
                  <div className="h-1 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
                    <div className="h-full accent-bg transition-all" style={{ width: `${Math.min(100, pct + i * 20)}%` }} />
                  </div>
                </div>
              )}
            </Row>
          ))}
        </Rows>
      )}
      <div className="text-[14px] font-semibold mb-2">更多选项</div>
      <Rows>
        <Row icon={<Clock20Regular />} title="暂停更新" right={<select className="win-btn"><option>暂停 1 周</option><option>暂停 2 周</option></select>} />
        <Row icon={<Clock20Regular />} title="更新历史记录" onClick={() => {}} />
        <Row icon={<Shield20Regular />} title="高级选项" sub="传递优化、可选更新、活动时间以及其他更新设置" onClick={() => {}} />
        <Row icon={<img src={iconUrl("getstarted")} className="w-5 h-5" alt="" />} title="Windows 预览体验计划" sub="获取 Windows 的预览版本" onClick={() => {}} />
      </Rows>
    </>
  );
}
