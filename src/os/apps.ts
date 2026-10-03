export type AppDef = {
  id: string;
  name: string;
  icon: string;
  w?: number;
  h?: number;
  external?: string;
  /** whether multiple instances allowed */
  multi?: boolean;
};

export const APPS: AppDef[] = [
  { id: "explorer", name: "文件资源管理器", icon: "explorer", w: 960, h: 600, multi: true },
  { id: "edge", name: "Microsoft Edge", icon: "edge", w: 1100, h: 680 },
  { id: "store", name: "Microsoft Store", icon: "store", w: 1100, h: 680 },
  { id: "settings", name: "设置", icon: "settings", w: 1040, h: 680 },
  { id: "notepad", name: "记事本", icon: "notepad", w: 760, h: 520, multi: true },
  { id: "calculator", name: "计算器", icon: "calculator", w: 330, h: 520 },
  { id: "terminal", name: "终端", icon: "terminal", w: 820, h: 500, multi: true },
  { id: "paint", name: "画图", icon: "board", w: 980, h: 640 },
  { id: "photos", name: "照片", icon: "photos", w: 1000, h: 640 },
  { id: "taskmanager", name: "任务管理器", icon: "taskmanager", w: 860, h: 580 },
  { id: "recycle", name: "回收站", icon: "bin0", w: 860, h: 540 },
  { id: "thispc", name: "此电脑", icon: "thispc", w: 960, h: 600 },
  { id: "user", name: "用户", icon: "win/user", w: 960, h: 600 },
  { id: "code", name: "Visual Studio Code", icon: "code", w: 1040, h: 660 },
  { id: "camera", name: "相机", icon: "camera", w: 820, h: 560 },
  { id: "calendar", name: "日历", icon: "calendar", w: 900, h: 600 },
  { id: "mail", name: "邮件", icon: "mail", w: 900, h: 600 },
  { id: "alarm", name: "时钟", icon: "alarm", w: 780, h: 540 },
  { id: "spotify", name: "Spotify", icon: "spotify", w: 1000, h: 640 },
  { id: "github", name: "GitHub", icon: "github", external: "https://github.com" },
  { id: "twitter", name: "X", icon: "twitter", external: "https://x.com" },
  { id: "discord", name: "Discord", icon: "discord", external: "https://discord.com" },
  { id: "teams", name: "Microsoft Teams", icon: "teams", w: 900, h: 600 },
  { id: "msoffice", name: "Microsoft 365 (Office)", icon: "msoffice", w: 900, h: 600 },
  { id: "outlook", name: "Outlook", icon: "outlook", w: 900, h: 600 },
  { id: "onenote", name: "OneNote", icon: "onenote", w: 900, h: 600 },
  { id: "todo", name: "Microsoft To Do", icon: "todo", w: 820, h: 560 },
  { id: "xbox", name: "Xbox", icon: "xbox", w: 1000, h: 620 },
  { id: "movies", name: "电影和电视", icon: "movies", w: 900, h: 600 },
  { id: "groove", name: "媒体播放器", icon: "groove", w: 900, h: 600 },
  { id: "weather", name: "天气", icon: "weather", w: 900, h: 600 },
  { id: "maps", name: "地图", icon: "maps", w: 900, h: 600 },
  { id: "news", name: "资讯", icon: "news", w: 900, h: 600 },
  { id: "notes", name: "便笺", icon: "notes", w: 360, h: 420 },
  { id: "snip", name: "截图工具", icon: "snip", w: 600, h: 300 },
  { id: "security", name: "Windows 安全中心", icon: "security", w: 900, h: 600 },
  { id: "tips", name: "提示", icon: "tips", w: 860, h: 560 },
  { id: "getstarted", name: "入门", icon: "getstarted", w: 860, h: 560 },
  { id: "feedback", name: "反馈中心", icon: "feedback", w: 860, h: 560 },
  { id: "yphone", name: "手机连接", icon: "yphone", w: 860, h: 560 },
  { id: "people", name: "人脉", icon: "people", w: 860, h: 560 },
  { id: "voice", name: "录音机", icon: "voice", w: 700, h: 480 },
  { id: "skype", name: "Skype", icon: "skype", w: 860, h: 560 },
  { id: "onedrive", name: "OneDrive", icon: "oneDrive", w: 960, h: 600 },
  { id: "help", name: "获取帮助", icon: "help", w: 860, h: 560 },
];

export const appById = (id: string) => APPS.find((a) => a.id === id)!;

export const PINNED_START = [
  "edge",
  "msoffice",
  "outlook",
  "store",
  "photos",
  "settings",
  "calculator",
  "alarm",
  "notepad",
  "paint",
  "explorer",
  "terminal",
  "spotify",
  "code",
  "todo",
  "xbox",
  "camera",
  "calendar",
  "mail",
  "weather",
  "maps",
  "news",
  "teams",
  "taskmanager",
];

export const TASKBAR_PINNED = ["explorer", "edge", "store", "notepad", "terminal", "settings"];
