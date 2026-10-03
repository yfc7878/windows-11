import { useEffect, useRef } from "react";
import { OSProvider, useOS } from "./os/store";
import { Wallpaper, Desktop } from "./os/Desktop";
import { Taskbar } from "./os/Taskbar";
import { StartMenu, SearchPanel } from "./os/StartMenu";
import { QuickSettings, CalendarPanel, TrayFlyout, Widgets, TaskView, Toasts } from "./os/Flyouts";
import { WindowFrame } from "./os/Window";
import { BootScreen, LockScreen, OffScreen, TransitionScreen } from "./os/Screens";
import { AppContent } from "./apps";

function Shell() {
  const os = useOS();
  const welcomed = useRef(false);

  // close flyouts when clicking elsewhere
  useEffect(() => {
    const h = (e: PointerEvent) => {
      if (!os.panel) return;
      const t = e.target as HTMLElement;
      if (t.closest("[data-panel]") || t.closest("[data-ctxmenu]")) return;
      if (t.closest(".taskbar-bg button") && !t.closest("[data-tbapp]")) return;
      os.setPanel(null);
    };
    window.addEventListener("pointerdown", h, true);
    return () => window.removeEventListener("pointerdown", h, true);
  }, [os]);

  // clicks inside iframes: focus that window & close flyouts
  useEffect(() => {
    const h = () =>
      setTimeout(() => {
        const el = document.activeElement as HTMLElement | null;
        if (el && el.tagName === "IFRAME") {
          const id = el.closest("[data-winid]")?.getAttribute("data-winid");
          if (id && id !== os.activeId) os.focusWin(id);
          if (os.panel) os.setPanel(null);
        }
      }, 0);
    window.addEventListener("blur", h);
    return () => window.removeEventListener("blur", h);
  }, [os]);

  // keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (os.phase !== "desktop") return;
      if (e.key === "Escape" && os.panel) os.setPanel(null);
      if (e.altKey && !e.ctrlKey) {
        const k = e.key.toLowerCase();
        const map: Record<string, () => void> = {
          t: () => os.openApp("terminal"),
          e: () => os.openApp("explorer"),
          s: () => os.togglePanel("start"),
          i: () => os.openApp("settings"),
          a: () => os.togglePanel("quick"),
          n: () => os.togglePanel("calendar"),
          w: () => os.togglePanel("widgets"),
          d: () => os.showDesktop(),
          l: () => os.power("lock"),
        };
        if (map[k]) {
          e.preventDefault();
          map[k]();
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [os]);

  useEffect(() => {
    if (os.phase === "desktop" && !welcomed.current) {
      welcomed.current = true;
      setTimeout(
        () =>
          os.notify({
            icon: "getstarted",
            app: "入门",
            title: "欢迎使用 Windows 11",
            body: "点击开始按钮探索应用，或右键桌面进行个性化设置。",
          }),
        1200
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [os.phase]);

  const s = os.settings;

  if (os.phase === "boot") return <BootScreen />;
  if (os.phase === "off") return <OffScreen />;
  if (os.phase === "shutdown") return <TransitionScreen text="正在关机" next={() => os.setPhase("off")} />;
  if (os.phase === "restart") return <TransitionScreen text="正在重新启动" next={() => os.setPhase("boot")} />;
  if (os.phase === "signout") return <TransitionScreen text="正在注销" next={() => os.setPhase("lock")} />;

  return (
    <div className={`fixed inset-0 overflow-hidden ${s.transparency ? "" : "no-transparency"}`} onContextMenu={(e) => e.preventDefault()}>
      <Wallpaper />
      <Desktop />
      {os.wins.map((w) => (
        <WindowFrame key={w.id} win={w}>
          <AppContent win={w} />
        </WindowFrame>
      ))}
      {os.panel === "start" && <StartMenu />}
      {os.panel === "search" && <SearchPanel />}
      {os.panel === "quick" && <QuickSettings />}
      {os.panel === "calendar" && <CalendarPanel />}
      {os.panel === "tray" && <TrayFlyout />}
      {os.panel === "widgets" && <Widgets />}
      {os.panel === "taskview" && <TaskView />}
      <Taskbar />
      <Toasts />
      {os.phase === "lock" && <LockScreen />}
      {/* display effects */}
      <div className="fixed inset-0 pointer-events-none z-[20000]" style={{ background: "#000", opacity: (1 - s.brightness / 100) * 0.75 }} />
      {s.nightlight && <div className="fixed inset-0 pointer-events-none z-[20001]" style={{ background: "rgba(255,147,41,.22)", mixBlendMode: "multiply" }} />}
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
