import { useEffect, useRef, useState } from "react";
import {
  ChevronUp16Regular,
  Wifi120Regular,
  WifiOff20Regular,
  Speaker220Regular,
  Speaker120Regular,
  Speaker020Regular,
  SpeakerMute20Regular,
  Airplane20Regular,
  Alert20Regular,
  AlertSnooze20Regular,
  Settings20Regular,
  TaskListLtr20Regular,
  Dismiss16Regular,
  Pin20Regular,
  PinOff20Regular,
} from "@fluentui/react-icons";
import { useOS, useClock, fmtTime, fmtDate } from "./store";
import { APPS, appById, TASKBAR_PINNED } from "./apps";
import { AppIcon, StartLogo } from "./assets";
import { BatteryGlyph, TaskViewGlyph, WeatherGlyph, SearchGlyph, CopilotGlyph } from "./glyphs";
import { ContextMenu, type MenuSpec } from "./ContextMenu";

export function VolumeIcon({ v, className = "" }: { v: number; className?: string }) {
  if (v === 0) return <SpeakerMute20Regular className={className} />;
  if (v < 33) return <Speaker020Regular className={className} />;
  if (v < 66) return <Speaker120Regular className={className} />;
  return <Speaker220Regular className={className} />;
}

export function Taskbar() {
  const os = useOS();
  const now = useClock(1000);
  const [menu, setMenu] = useState<MenuSpec | null>(null);
  const [pinned, setPinned] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("w11.pinned") || "") || TASKBAR_PINNED;
    } catch {
      return TASKBAR_PINNED;
    }
  });
  useEffect(() => localStorage.setItem("w11.pinned", JSON.stringify(pinned)), [pinned]);
  const [hover, setHover] = useState<{ appId: string; x: number } | null>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const widgetTimer = useRef<number | undefined>(undefined);

  const running = Array.from(new Set(os.wins.filter((w) => !w.closing).map((w) => w.appId)));
  const list = [...pinned, ...running.filter((r) => !pinned.includes(r))];
  const activeApp = os.wins.find((w) => w.id === os.activeId && !w.min)?.appId;
  const s = os.settings;

  const btn = "h-10 rounded-md flex items-center justify-center transition-colors hover:bg-white/70 dark:hover:bg-white/[.07] active:bg-white/50 dark:active:bg-white/[.04]";

  const appMenu = (appId: string, x: number) => {
    const app = appById(appId);
    const isPinned = pinned.includes(appId);
    const hasWin = running.includes(appId);
    setMenu({
      x: x - 110,
      y: window.innerHeight - 56,
      up: true,
      items: [
        { label: app.name, icon: <AppIcon icon={app.icon} size={16} />, onClick: () => os.openApp(appId) },
        isPinned
          ? { label: "从任务栏取消固定", icon: <PinOff20Regular />, onClick: () => setPinned((p) => p.filter((x) => x !== appId)) }
          : { label: "固定到任务栏", icon: <Pin20Regular />, onClick: () => setPinned((p) => [...p, appId]) },
        ...(hasWin
          ? [
              {
                label: running.length && os.wins.filter((w) => w.appId === appId).length > 1 ? "关闭所有窗口" : "关闭窗口",
                icon: <Dismiss16Regular />,
                onClick: () => os.wins.filter((w) => w.appId === appId).forEach((w) => os.closeWin(w.id)),
              },
            ]
          : []),
      ],
    });
  };

  const iconDown = (key: string) => (e: React.MouseEvent) => {
    const t = e.currentTarget as HTMLElement;
    t.style.transform = "scale(0.86)";
    setTimeout(() => (t.style.transform = ""), 140);
    void key;
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-12 taskbar-bg z-[9000] flex items-center text-black dark:text-white"
        onContextMenu={(e) => {
          e.preventDefault();
          if ((e.target as HTMLElement).closest("[data-tbapp]")) return;
          setMenu({
            x: e.clientX,
            y: e.clientY,
            up: true,
            items: [
              { label: "任务管理器", icon: <TaskListLtr20Regular />, onClick: () => os.openApp("taskmanager") },
              { divider: true },
              { label: "任务栏设置", icon: <Settings20Regular />, onClick: () => os.openApp("settings", { page: "personalization" }) },
            ],
          });
        }}
        style={{ ["--glyph-bg" as any]: s.theme === "dark" ? "#1c1c1c" : "#f3f3f3" }}
      >
        {/* Left: widgets weather */}
        <div className="absolute left-1 h-full flex items-center">
          <button
            className={`${btn} px-2 gap-2 ${os.panel === "widgets" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onClick={() => os.togglePanel("widgets")}
            onMouseEnter={() => {
              widgetTimer.current = window.setTimeout(() => os.setPanel("widgets"), 700);
            }}
            onMouseLeave={() => window.clearTimeout(widgetTimer.current)}
          >
            <WeatherGlyph size={26} />
            <div className="text-left leading-tight hidden md:block">
              <div className="text-[12px]">26°C</div>
              <div className="text-[12px] opacity-70">多云</div>
            </div>
          </button>
        </div>

        {/* Center */}
        <div className="flex-1 flex justify-center items-center gap-[2px] h-full">
          <button
            title="开始"
            className={`${btn} w-10 ${os.panel === "start" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onMouseDown={iconDown("start")}
            onClick={() => os.togglePanel("start")}
          >
            <StartLogo size={24} />
          </button>
          <button
            className={`h-8 mx-1 rounded-full hidden sm:flex items-center gap-2 pl-3 pr-14 border transition-colors ${
              os.panel === "search"
                ? "bg-white dark:bg-[#2b2b2b] border-black/10 dark:border-white/10"
                : "bg-white/60 hover:bg-white/90 dark:bg-white/[.06] dark:hover:bg-white/10 border-black/[.06] dark:border-white/[.08]"
            }`}
            onClick={() => os.togglePanel("search")}
          >
            <SearchGlyph size={14} />
            <span className="text-[13px] opacity-70">搜索</span>
          </button>
          <button className={`${btn} w-10 sm:hidden`} onClick={() => os.togglePanel("search")}>
            <SearchGlyph size={18} />
          </button>
          <button
            title="任务视图"
            className={`${btn} w-10 ${os.panel === "taskview" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onMouseDown={iconDown("tv")}
            onClick={() => os.togglePanel("taskview")}
          >
            <TaskViewGlyph size={22} />
          </button>
          <button
            title="Copilot"
            className={`${btn} w-10`}
            onMouseDown={iconDown("cp")}
            onClick={() => os.openApp("edge", { url: "https://www.bing.com/chat" })}
          >
            <CopilotGlyph size={22} />
          </button>
          {list.map((appId) => {
            const app = appById(appId);
            if (!app) return null;
            const isRunning = running.includes(appId);
            const isActive = activeApp === appId;
            return (
              <div key={appId} className="relative" data-tbapp>
                <button
                  className={`${btn} w-10 relative ${isActive ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
                  style={{ transition: "transform .14s, background-color .1s" }}
                  onMouseDown={iconDown(appId)}
                  onClick={() => {
                    setHover(null);
                    os.taskbarClick(appId);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    appMenu(appId, (e.currentTarget as HTMLElement).getBoundingClientRect().left + 20);
                  }}
                  onMouseEnter={(e) => {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => setHover({ appId, x: r.left + r.width / 2 }), isRunning ? 350 : 800);
                  }}
                  onMouseLeave={() => {
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => setHover(null), 200);
                  }}
                >
                  <AppIcon icon={app.icon} size={24} />
                </button>
                {isRunning && (
                  <span
                    className={`absolute bottom-[3px] left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-200 ${
                      isActive ? "w-4 accent-bg" : "w-1.5 bg-black/45 dark:bg-white/55"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right: tray */}
        <div className="absolute right-0 h-full flex items-center pr-0">
          <button
            title="显示隐藏的图标"
            className={`${btn} w-8 ${os.panel === "tray" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onClick={() => os.togglePanel("tray")}
          >
            <ChevronUp16Regular className={`transition-transform ${os.panel === "tray" ? "rotate-180" : ""}`} />
          </button>
          <button className={`${btn} w-8 text-[13px] hidden sm:flex`} title="中文(简体) 微软拼音">
            中
          </button>
          <button
            className={`${btn} px-2 gap-[10px] ${os.panel === "quick" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onClick={() => os.togglePanel("quick")}
            title="网络 / 音量 / 电池"
          >
            {s.airplane ? (
              <Airplane20Regular className="text-[17px]" />
            ) : s.wifi ? (
              <Wifi120Regular className="text-[17px]" />
            ) : (
              <WifiOff20Regular className="text-[17px]" />
            )}
            <VolumeIcon v={s.volume} className="text-[17px]" />
            <BatteryGlyph level={s.saver ? 42 : 86} charging={!s.saver} size={18} />
          </button>
          <button
            className={`${btn} px-2 gap-2 ${os.panel === "calendar" ? "bg-white/70 dark:bg-white/[.07]" : ""}`}
            onClick={() => os.togglePanel("calendar")}
          >
            <div className="text-right leading-[17px] text-[12px]">
              <div>{fmtTime(now)}</div>
              <div>{fmtDate(now)}</div>
            </div>
            <div className="relative">
              {s.focus ? <AlertSnooze20Regular className="text-[16px]" /> : <Alert20Regular className="text-[16px]" />}
              {os.notifs.length > 0 && !s.focus && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full accent-bg text-[10px] flex items-center justify-center font-semibold">
                  {os.notifs.length}
                </span>
              )}
            </div>
          </button>
          <button
            title="显示桌面"
            className="w-[10px] h-full ml-1 border-l border-black/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
            onClick={os.showDesktop}
          />
        </div>
      </div>

      {/* Hover preview */}
      {hover && (
        <TaskPreview
          appId={hover.appId}
          x={hover.x}
          onEnter={() => window.clearTimeout(hoverTimer.current)}
          onLeave={() => setHover(null)}
        />
      )}

      {menu && <ContextMenu spec={menu} onClose={() => setMenu(null)} />}
    </>
  );
}

function TaskPreview({ appId, x, onEnter, onLeave }: { appId: string; x: number; onEnter: () => void; onLeave: () => void }) {
  const os = useOS();
  const app = appById(appId);
  const wins = os.wins.filter((w) => w.appId === appId && !w.closing);
  if (!wins.length) {
    return (
      <div
        className="fixed z-[9001] acrylic-strong flyout px-3 py-1.5 text-xs text-black dark:text-white anim-fade pointer-events-none"
        style={{ left: x, bottom: 56, transform: "translateX(-50%)" }}
      >
        {app.name}
      </div>
    );
  }
  return (
    <div
      className="fixed z-[9001] flex gap-2 acrylic-strong flyout p-2 text-black dark:text-white anim-slide-up"
      style={{ left: Math.max(8, Math.min(x - (wins.length * 216) / 2, window.innerWidth - wins.length * 216 - 8)), bottom: 56 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {wins.map((w) => (
        <div
          key={w.id}
          className="w-[200px] rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-default group"
          onClick={() => {
            os.focusWin(w.id);
            onLeave();
          }}
        >
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <AppIcon icon={app.icon} size={16} />
            <span className="flex-1 truncate">{w.title}</span>
            <button
              className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#c42b1c] hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                os.closeWin(w.id);
              }}
            >
              <Dismiss16Regular />
            </button>
          </div>
          <div className="h-[112px] rounded mica border border-black/10 dark:border-white/10 flex items-center justify-center overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-3 bg-black/5 dark:bg-white/5" />
            <AppIcon icon={app.icon} size={44} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const ALL_APPS_SORTED = [...APPS].filter((a) => !["thispc", "user", "recycle"].includes(a.id)).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
