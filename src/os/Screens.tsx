import { useEffect, useRef, useState } from "react";
import { Wifi120Regular, Power20Regular, Accessibility20Regular, ArrowRight20Regular, Key20Regular } from "@fluentui/react-icons";
import { useOS, useClock, WEEK } from "./store";
import { Img, wallUrl, WinLogo, WALLPAPERS } from "./assets";
import { BatteryGlyph } from "./glyphs";
import { Avatar } from "./StartMenu";

function Loader() {
  return (
    <div className="win-loader">
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

export function BootScreen() {
  const os = useOS();
  useEffect(() => {
    const t = setTimeout(() => os.setPhase("lock"), 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center anim-fade">
      <div className="flex-1" />
      <WinLogo size={110} color="#0078d4" />
      <div className="flex-1 flex items-start justify-center pt-24">
        <Loader />
      </div>
    </div>
  );
}

export function TransitionScreen({ text, next }: { text: string; next: () => void }) {
  useEffect(() => {
    const t = setTimeout(next, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 text-white anim-fade" style={{ background: "#0b2a52" }}>
      <Loader />
      <div className="text-[22px] font-display font-light">{text}</div>
    </div>
  );
}

export function OffScreen() {
  const os = useOS();
  return (
    <div className="fixed inset-0 bg-black z-[10000] flex items-center justify-center">
      <button
        className="group flex flex-col items-center gap-3 text-white/40 hover:text-white/90 transition-colors"
        onClick={() => os.setPhase("boot")}
      >
        <span className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center">
          <Power20Regular className="text-[28px]" />
        </span>
        <span className="text-[13px]">按下电源键开机</span>
      </button>
    </div>
  );
}

export function LockScreen() {
  const os = useOS();
  const now = useClock(1000);
  const [stage, setStage] = useState<"lock" | "login" | "welcome">("lock");
  const [pin, setPin] = useState("");
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wall = wallUrl(WALLPAPERS[os.settings.wallpaper] || WALLPAPERS[0]);

  useEffect(() => {
    const k = () => {
      if (stage === "lock") setStage("login");
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [stage]);

  useEffect(() => {
    if (stage === "login") setTimeout(() => inputRef.current?.focus(), 350);
  }, [stage]);

  const signIn = () => {
    setStage("welcome");
    setTimeout(() => {
      setLeaving(true);
      setTimeout(() => os.setPhase("desktop"), 450);
    }, 1300);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] overflow-hidden text-white select-none"
      style={{ opacity: leaving ? 0 : 1, transition: "opacity .45s" }}
      onClick={() => stage === "lock" && setStage("login")}
    >
      <Img
        src={wall}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        style={{ filter: stage === "lock" ? "none" : "blur(40px) brightness(.8)", transform: stage === "lock" ? "scale(1)" : "scale(1.1)" }}
        alt=""
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* lock clock */}
      <div
        className="absolute inset-x-0 top-[9vh] flex flex-col items-center transition-all duration-500"
        style={{ transform: stage === "lock" ? "none" : "translateY(-40px)", opacity: stage === "lock" ? 1 : 0, pointerEvents: "none" }}
      >
        <div className="text-[18px] font-semibold font-display drop-shadow" style={{ textShadow: "0 2px 8px rgba(0,0,0,.3)" }}>
          {now.getMonth() + 1}月{now.getDate()}日{WEEK[now.getDay()]}
        </div>
        <div className="text-[112px] leading-none font-semibold font-display mt-1" style={{ textShadow: "0 2px 16px rgba(0,0,0,.25)" }}>
          {now.getHours()}:{String(now.getMinutes()).padStart(2, "0")}
        </div>
      </div>

      {/* login */}
      {stage !== "lock" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center anim-fade">
          <Avatar size={190} />
          <div className="text-[28px] mt-5 font-display font-semibold">{os.settings.userName}</div>
          {stage === "login" ? (
            <>
              <div className="mt-5 flex items-center w-[300px] h-9 rounded bg-white/10 backdrop-blur border border-white/20 border-b-white/60 focus-within:border-b-2 focus-within:border-b-[var(--accent)] focus-within:bg-black/30">
                <input
                  ref={inputRef}
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signIn()}
                  placeholder="PIN（任意输入或直接回车）"
                  className="flex-1 bg-transparent px-3 outline-none text-[14px] placeholder:text-white/70"
                />
                <button className="w-9 h-full flex items-center justify-center bg-white/15 hover:bg-white/25" onClick={signIn}>
                  <ArrowRight20Regular />
                </button>
              </div>
              <button className="mt-4 text-[13px] text-white/90 hover:underline">我忘记了我的 PIN</button>
              <div className="mt-3 text-[13px] text-white/80">登录选项</div>
              <div className="mt-2 flex gap-2">
                <button className="w-10 h-10 rounded flex items-center justify-center bg-white/20 border border-white/40">
                  <Key20Regular />
                </button>
              </div>
            </>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-4">
              <Loader />
              <div className="text-[18px]">欢迎</div>
            </div>
          )}
        </div>
      )}

      <div className="absolute right-6 bottom-6 flex items-center gap-4 text-white">
        {stage !== "lock" && (
          <>
            <Accessibility20Regular className="text-[20px]" />
            <Power20Regular className="text-[20px] cursor-pointer" onClick={(e) => { e.stopPropagation(); os.power("shutdown"); }} />
          </>
        )}
        <Wifi120Regular className="text-[20px]" />
        <span style={{ ["--glyph-bg" as any]: "#555" }}>
          <BatteryGlyph level={86} size={22} />
        </span>
      </div>
    </div>
  );
}
