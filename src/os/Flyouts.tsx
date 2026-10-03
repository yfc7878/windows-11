import { useMemo, useState } from "react";
import {
  Wifi120Regular,
  WifiOff20Regular,
  Bluetooth20Regular,
  Airplane20Regular,
  BatterySaver20Regular,
  WeatherMoon20Regular,
  Phone20Regular,
  Accessibility20Regular,
  Cast20Regular,
  ChevronRight16Regular,
  ChevronLeft16Regular,
  ChevronUp16Regular,
  ChevronDown16Regular,
  WeatherSunny20Regular,
  Edit20Regular,
  Settings20Regular,
  Dismiss16Regular,
  LockClosed16Regular,
  Add16Regular,
  Subtract16Regular,
  Play16Filled,
  Search20Regular,
  ArrowUp16Filled,
  ArrowDown16Filled,
  MoreHorizontal20Regular,
  Add20Regular,
} from "@fluentui/react-icons";
import { useOS, useClock, WEEK, type Settings } from "./store";
import { appById } from "./apps";
import { AppIcon } from "./assets";
import { BatteryGlyph, WeatherGlyph } from "./glyphs";
import { VolumeIcon } from "./Taskbar";
import { Avatar } from "./StartMenu";

/* ---------------- Quick Settings ---------------- */
const NETWORKS = [
  { name: "Home-5G", secure: true, strength: 3 },
  { name: "TP-LINK_8A2C", secure: true, strength: 3 },
  { name: "ChinaNet-7F3k", secure: true, strength: 2 },
  { name: "CMCC-Free", secure: false, strength: 2 },
  { name: "Starbucks WiFi", secure: false, strength: 1 },
  { name: "DIRECT-HP Printer", secure: true, strength: 1 },
];

export function QuickSettings() {
  const os = useOS();
  const s = os.settings;
  const [sub, setSub] = useState<null | "wifi">(null);
  const [connected, setConnected] = useState("Home-5G");
  const [connecting, setConnecting] = useState<string | null>(null);

  const tiles: { key: keyof Settings; label: string; icon: React.ReactNode; split?: boolean; sublabel?: string }[] = [
    { key: "wifi", label: s.wifi && !s.airplane ? connected : "WLAN", icon: s.wifi ? <Wifi120Regular /> : <WifiOff20Regular />, split: true },
    { key: "bluetooth", label: "蓝牙", icon: <Bluetooth20Regular />, split: true },
    { key: "airplane", label: "飞行模式", icon: <Airplane20Regular /> },
    { key: "saver", label: "节电模式", icon: <BatterySaver20Regular /> },
    { key: "nightlight", label: "夜间模式", icon: <WeatherMoon20Regular /> },
    { key: "hotspot", label: "移动热点", icon: <Phone20Regular /> },
    { key: "focus", label: "勿扰模式", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M10 3a5 5 0 0 0-5 5v3l-1.5 2.5h13L15 11V8a5 5 0 0 0-5-5zM8 16a2 2 0 0 0 4 0" /><path d="M3 3l14 14" /></svg> },
    { key: "transparency", label: "辅助功能", icon: <Accessibility20Regular /> },
    { key: "showIcons", label: "投放", icon: <Cast20Regular /> },
  ];

  const onTile = (k: keyof Settings) => {
    if (k === "airplane") {
      const nv = !s.airplane;
      os.set("airplane", nv);
      os.set("wifi", !nv);
      os.set("bluetooth", !nv);
    } else if (k === "transparency" || k === "showIcons") {
      os.openApp("settings", { page: "accessibility" });
    } else os.toggle(k);
  };

  return (
    <div
      className="fixed z-[8999] right-3 bottom-[60px] acrylic flyout text-black dark:text-white overflow-hidden anim-slide-up"
      style={{ width: 360 }}
      data-panel
    >
      {sub === null ? (
        <div className="p-6 pb-4">
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            {tiles.map((t) => {
              const on = !!s[t.key] && !(t.key === "transparency" || t.key === "showIcons");
              return (
                <div key={t.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-full h-12 rounded-md flex overflow-hidden border text-[18px] ${
                      on
                        ? "accent-bg border-transparent"
                        : "bg-white/70 dark:bg-white/[.06] border-black/[.07] dark:border-white/[.07]"
                    }`}
                  >
                    <button
                      className={`flex-1 flex items-center justify-center ${on ? "hover:brightness-110" : "hover:bg-white dark:hover:bg-white/10"}`}
                      onClick={() => onTile(t.key)}
                    >
                      {t.icon}
                    </button>
                    {t.split && (
                      <button
                        className={`w-8 flex items-center justify-center border-l ${
                          on ? "border-black/10 dark:border-black/20 hover:brightness-110" : "border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-white/10"
                        }`}
                        onClick={() => (t.key === "wifi" ? setSub("wifi") : os.openApp("settings", { page: "bluetooth" }))}
                      >
                        <ChevronRight16Regular />
                      </button>
                    )}
                  </div>
                  <span className="text-[12px] truncate max-w-full">{t.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-3">
            <WeatherSunny20Regular className="text-[18px] shrink-0" />
            <input
              type="range"
              min={10}
              max={100}
              value={s.brightness}
              className="win-range flex-1"
              style={{ ["--val" as any]: `${((s.brightness - 10) / 90) * 100}%` }}
              onChange={(e) => os.set("brightness", +e.target.value)}
            />
            <span className="w-6" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button className="shrink-0" onClick={() => os.set("volume", s.volume === 0 ? 50 : 0)}>
              <VolumeIcon v={s.volume} className="text-[18px]" />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={s.volume}
              className="win-range flex-1"
              style={{ ["--val" as any]: `${s.volume}%` }}
              onChange={(e) => os.set("volume", +e.target.value)}
            />
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" title="选择声音输出">
              <ChevronRight16Regular />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 anim-slide-left">
          <div className="flex items-center gap-2 mb-3">
            <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setSub(null)}>
              <ChevronLeft16Regular />
            </button>
            <span className="font-semibold flex-1">WLAN</span>
            <button className={`win-toggle ${s.wifi ? "on" : ""}`} onClick={() => os.toggle("wifi")} />
          </div>
          <div className="max-h-[300px] overflow-y-auto win-scroll space-y-0.5">
            {s.wifi ? (
              NETWORKS.map((n) => {
                const isC = connected === n.name;
                return (
                  <div
                    key={n.name}
                    className={`rounded-md px-3 py-2.5 ${isC ? "bg-white/70 dark:bg-white/[.07]" : "hover:bg-white/60 dark:hover:bg-white/5"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Wifi120Regular className="text-[20px]" style={{ opacity: 0.4 + n.strength * 0.2 }} />
                        {n.secure && <LockClosed16Regular className="absolute -bottom-1 -right-1 text-[10px]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] truncate">{n.name}</div>
                        <div className="text-[12px] opacity-60">
                          {isC ? "已连接，安全" : connecting === n.name ? "正在连接..." : n.secure ? "安全" : "开放"}
                        </div>
                      </div>
                    </div>
                    {(isC || connecting === null) && (
                      <div className="flex justify-end mt-2">
                        {isC ? (
                          <button className="win-btn text-[13px]" onClick={() => setConnected("")}>
                            断开连接
                          </button>
                        ) : (
                          <button
                            className="win-btn-accent text-[13px]"
                            onClick={() => {
                              setConnecting(n.name);
                              setTimeout(() => {
                                setConnected(n.name);
                                setConnecting(null);
                              }, 1400);
                            }}
                          >
                            连接
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-[13px] opacity-60 py-10">WLAN 已关闭</div>
            )}
          </div>
          <button className="text-[13px] accent-text mt-3 px-2 hover:underline" onClick={() => os.openApp("settings", { page: "network" })}>
            更多 WLAN 设置
          </button>
        </div>
      )}
      <div className="h-12 flex items-center justify-between px-6 border-t border-black/[.07] dark:border-white/[.07] bg-black/[.03] dark:bg-black/20">
        <div className="flex items-center gap-2 text-[12px]">
          <BatteryGlyph level={s.saver ? 42 : 86} charging={!s.saver} size={20} />
          {s.saver ? "42%" : "86%"}
        </div>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" title="编辑快速设置">
            <Edit20Regular className="text-[16px]" />
          </button>
          <button
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10"
            title="所有设置"
            onClick={() => os.openApp("settings")}
          >
            <Settings20Regular className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Calendar + Notification Center ---------------- */
export function CalendarPanel() {
  const os = useOS();
  const now = useClock(30000);
  const [view, setView] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [collapsed, setCollapsed] = useState(false);
  const [mins, setMins] = useState(30);
  const [sel, setSel] = useState<string | null>(null);

  const days = useMemo(() => {
    const first = new Date(view);
    const offset = (first.getDay() + 6) % 7; // monday first
    const start = new Date(first);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [view]);

  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <div className="fixed z-[8999] right-3 bottom-[60px] flex flex-col gap-3 text-black dark:text-white anim-slide-left" style={{ width: 360 }} data-panel>
      <div className="acrylic flyout overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <span className="text-[14px]">通知</span>
          {os.notifs.length > 0 ? (
            <button className="text-[12px] px-2 h-7 rounded card hover:bg-white dark:hover:bg-white/10" onClick={os.clearNotifs}>
              全部清除
            </button>
          ) : (
            <button
              className={`text-[12px] px-2 h-7 rounded flex items-center gap-1 ${os.settings.focus ? "accent-bg" : "card"}`}
              onClick={() => os.toggle("focus")}
            >
              勿扰模式
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto win-scroll px-3 pb-3 space-y-2">
          {os.notifs.length === 0 ? (
            <div className="text-center text-[13px] opacity-70 py-6">无新通知</div>
          ) : (
            os.notifs.map((n) => (
              <div key={n.id} className="card rounded-md p-3 group relative anim-fade">
                <div className="flex items-center gap-2 text-[12px] opacity-80 mb-1.5">
                  <AppIcon icon={n.icon} size={16} />
                  {n.app}
                  <span className="ml-auto opacity-60">{new Date(n.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                    onClick={() => os.removeNotif(n.id)}
                  >
                    <Dismiss16Regular />
                  </button>
                </div>
                <div className="text-[13px] font-semibold">{n.title}</div>
                <div className="text-[13px] opacity-80">{n.body}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="acrylic flyout overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-black/[.06] dark:border-white/[.06]">
          <span className="text-[14px] font-semibold">
            {now.getMonth() + 1}月{now.getDate()}日{WEEK[now.getDay()]}
          </span>
          <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? <ChevronUp16Regular /> : <ChevronDown16Regular />}
          </button>
        </div>
        {!collapsed && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <button className="text-[14px] font-semibold px-2 h-8 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView(new Date(now.getFullYear(), now.getMonth(), 1))}>
                {view.getFullYear()}年{view.getMonth() + 1}月
              </button>
              <div className="flex">
                <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
                  <ArrowUp16Filled className="text-[12px]" />
                </button>
                <button className="w-8 h-8 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
                  <ArrowDown16Filled className="text-[12px]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center text-[12px]">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                <div key={d} className="h-9 flex items-center justify-center">
                  {d}
                </div>
              ))}
              {days.map((d, i) => {
                const isToday = same(d, now);
                const inMonth = d.getMonth() === view.getMonth();
                const isSel = sel === d.toDateString();
                return (
                  <button
                    key={i}
                    onClick={() => setSel(d.toDateString())}
                    className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-[13px] ${
                      isToday ? "accent-bg font-semibold" : isSel ? "border-2 accent-border" : "hover:bg-black/5 dark:hover:bg-white/10"
                    } ${inMonth ? "" : "opacity-40"}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between px-4 h-14 border-t border-black/[.06] dark:border-white/[.06] bg-black/[.02] dark:bg-black/10">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded card flex items-center justify-center" onClick={() => setMins((m) => Math.max(5, m - 5))}>
              <Subtract16Regular />
            </button>
            <span className="text-[13px] w-16 text-center">{mins} 分钟</span>
            <button className="w-8 h-8 rounded card flex items-center justify-center" onClick={() => setMins((m) => Math.min(240, m + 5))}>
              <Add16Regular />
            </button>
          </div>
          <button
            className="h-8 px-3 rounded card text-[13px] flex items-center gap-2 hover:bg-white dark:hover:bg-white/10"
            onClick={() => {
              os.set("focus", true);
              os.setPanel(null);
              setTimeout(() => {
                os.set("focus", false);
                os.notify({ icon: "alarm", app: "时钟", title: "专注时段已结束", body: `你已专注 ${mins} 分钟，休息一下吧！` });
              }, 8000);
            }}
          >
            <Play16Filled /> 专注
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Hidden tray icons ---------------- */
export function TrayFlyout() {
  const os = useOS();
  const items = ["onedrive", "security", "teams", "spotify", "discord", "yphone"];
  return (
    <div
      className="fixed z-[8999] bottom-[60px] acrylic flyout p-2 grid grid-cols-3 gap-1 anim-slide-up"
      style={{ right: 260 }}
      data-panel
    >
      {items.map((id) => {
        const a = appById(id);
        return (
          <button key={id} title={a.name} className="w-10 h-10 rounded flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/10" onClick={() => os.openApp(id)}>
            <AppIcon icon={a.icon} size={20} />
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Widgets ---------------- */
const NEWS = [
  { t: "全球科技峰会开幕：AI 与可持续发展成为焦点", s: "科技日报", seed: "tech1" },
  { t: "春季赏花指南：全国十大最美花海推荐", s: "旅行家", seed: "flower2" },
  { t: "新能源汽车销量再创新高，市场格局生变", s: "财经网", seed: "car3" },
  { t: "深空探测新突破：科学家发现系外类地行星", s: "环球科学", seed: "space4" },
  { t: "城市马拉松周末开跑，三万名选手参赛", s: "体育周刊", seed: "run5" },
  { t: "夏季饮食健康小贴士：这些水果最消暑", s: "生活家", seed: "fruit6" },
  { t: "国产大片定档暑期，预告片获千万播放", s: "娱乐头条", seed: "film7" },
  { t: "研究表明：每天散步 30 分钟益处多多", s: "健康时报", seed: "walk8" },
];

export function Widgets() {
  const os = useOS();
  const now = useClock(30000);
  const stocks = [
    { n: "上证指数", v: "3,286.65", c: +0.82 },
    { n: "深证成指", v: "10,512.34", c: +1.15 },
    { n: "恒生指数", v: "19,374.12", c: -0.36 },
    { n: "纳斯达克", v: "17,862.23", c: +0.47 },
  ];
  return (
    <div
      className="fixed z-[8999] left-3 top-3 bottom-[60px] acrylic flyout text-black dark:text-white flex flex-col overflow-hidden anim-slide-right"
      style={{ width: Math.min(820, window.innerWidth - 24) }}
      data-panel
    >
      <div className="flex items-center gap-3 px-6 h-16 shrink-0">
        <span className="text-[16px] font-semibold font-display tabular-nums">{now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[380px] h-9 rounded-full card flex items-center gap-2 px-4 text-[13px]">
            <Search20Regular className="text-[16px] opacity-70" />
            <input
              placeholder="搜索网页"
              className="flex-1 bg-transparent outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") os.openApp("edge", { url: "https://www.google.com/search?igu=1&q=" + encodeURIComponent((e.target as HTMLInputElement).value) });
              }}
            />
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10">
          <Add20Regular />
        </button>
        <Avatar size={30} />
      </div>
      <div className="flex-1 overflow-y-auto win-scroll px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[300px_1fr] gap-3">
          <div className="space-y-3">
            <div className="rounded-xl p-4 text-white relative overflow-hidden" style={{ background: "linear-gradient(160deg,#3a8ee6 0%,#5ab0f5 55%,#9fd3ff 100%)" }}>
              <div className="flex justify-between text-[13px]">
                <span className="font-semibold">天气</span>
                <MoreHorizontal20Regular />
              </div>
              <div className="text-[12px] opacity-90 mt-1">北京市 · 朝阳区</div>
              <div className="flex items-center gap-3 mt-2">
                <WeatherGlyph size={56} />
                <div>
                  <div className="text-[40px] leading-none font-display">26°<span className="text-[18px] align-top">C</span></div>
                  <div className="text-[12px] opacity-90">多云 · 体感 27°</div>
                </div>
              </div>
              <div className="text-[12px] mt-2 opacity-90">💧 32% · 🌬️ 东南风 3 级 · AQI 46 优</div>
              <div className="grid grid-cols-5 mt-3 text-center text-[12px]">
                {["今天", "周四", "周五", "周六", "周日"].map((d, i) => (
                  <div key={d} className="rounded-md py-1.5 bg-white/15">
                    <div>{d}</div>
                    <div className="text-[16px] my-0.5">{["⛅", "☀️", "🌦️", "☀️", "⛅"][i]}</div>
                    <div>
                      {[28, 30, 24, 29, 27][i]}° <span className="opacity-70">{[17, 18, 16, 19, 18][i]}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl card p-4">
              <div className="flex justify-between text-[13px] font-semibold mb-2">
                <span>关注列表</span>
                <MoreHorizontal20Regular />
              </div>
              {stocks.map((st) => (
                <div key={st.n} className="flex items-center justify-between h-10 text-[13px] border-b last:border-0 border-black/5 dark:border-white/5">
                  <span>{st.n}</span>
                  <span className="tabular-nums">{st.v}</span>
                  <span className={`tabular-nums w-16 text-right ${st.c >= 0 ? "text-[#d13438]" : "text-[#107c10]"}`}>
                    {st.c >= 0 ? "+" : ""}
                    {st.c}%
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl card p-4">
              <div className="text-[13px] font-semibold mb-2">待办事项</div>
              {["完成季度报告", "预约牙医", "购买生日礼物"].map((t, i) => (
                <label key={t} className="flex items-center gap-2 h-8 text-[13px]">
                  <input type="checkbox" defaultChecked={i === 1} className="w-4 h-4 accent-[var(--accent)]" />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
            {NEWS.map((n, i) => (
              <button
                key={i}
                className={`rounded-xl overflow-hidden card text-left hover:brightness-[1.03] ${i === 0 ? "md:col-span-2" : ""}`}
                onClick={() => os.openApp("edge", { url: "https://www.google.com/search?igu=1&q=" + encodeURIComponent(n.t) })}
              >
                <img src={`https://picsum.photos/seed/${n.seed}/${i === 0 ? 800 : 400}/${i === 0 ? 300 : 220}`} className={`w-full object-cover ${i === 0 ? "h-48" : "h-32"}`} alt="" />
                <div className="p-3">
                  <div className="text-[11px] opacity-60 mb-1">{n.s} · {i + 1} 小时前</div>
                  <div className="text-[14px] font-semibold leading-snug line-clamp-2">{n.t}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Task View ---------------- */
export function TaskView() {
  const os = useOS();
  const wins = os.wins.filter((w) => !w.closing);
  return (
    <div
      className="fixed inset-0 bottom-12 z-[8998] anim-fade flex flex-col"
      style={{ background: "rgba(0,0,0,.25)", backdropFilter: "blur(40px)" }}
      onClick={() => os.setPanel(null)}
      data-panel
    >
      <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-6 p-10">
        {wins.length === 0 && <div className="text-white/80 text-[15px]">没有打开的窗口</div>}
        {wins.map((w) => {
          const a = appById(w.appId);
          return (
            <div
              key={w.id}
              className="group w-[260px] cursor-default anim-pop"
              onClick={(e) => {
                e.stopPropagation();
                os.focusWin(w.id);
                os.setPanel(null);
              }}
            >
              <div className="flex items-center gap-2 text-white text-[12px] mb-2 px-1">
                <AppIcon icon={a.icon} size={16} />
                <span className="flex-1 truncate">{w.title}</span>
                <button
                  className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#c42b1c]"
                  onClick={(e) => {
                    e.stopPropagation();
                    os.closeWin(w.id);
                  }}
                >
                  <Dismiss16Regular />
                </button>
              </div>
              <div className="h-[160px] rounded-lg mica flex items-center justify-center ring-0 group-hover:ring-4 ring-white/60 transition-all shadow-2xl">
                <AppIcon icon={a.icon} size={56} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-36 flex items-center justify-center gap-4 pb-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-[180px]">
          <div className="text-white text-[12px] mb-1.5 px-1">桌面 1</div>
          <div className="h-24 rounded-lg ring-2 ring-white/80 overflow-hidden bg-black/30" />
        </div>
        <button className="w-[180px] h-24 mt-5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[12px] flex flex-col items-center justify-center gap-1">
          <Add20Regular className="text-[22px]" />
          新建桌面
        </button>
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */
export function Toasts() {
  const os = useOS();
  return (
    <div className="fixed right-3 bottom-[60px] z-[9500] flex flex-col gap-2 pointer-events-none" style={{ width: 364 }}>
      {os.toasts.map((t) => (
        <div key={t.id} className="acrylic-strong flyout p-4 text-black dark:text-white pointer-events-auto anim-toast group">
          <div className="flex items-center gap-2 text-[12px] mb-2">
            <AppIcon icon={t.icon} size={16} />
            <span className="flex-1">{t.app}</span>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10" onClick={() => os.dismissToast(t.id)}>
              <Dismiss16Regular />
            </button>
          </div>
          <div className="text-[14px] font-semibold">{t.title}</div>
          <div className="text-[13px] opacity-80 mt-0.5">{t.body}</div>
        </div>
      ))}
    </div>
  );
}
