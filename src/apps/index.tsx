import { memo } from "react";
import type { Win } from "../os/store";
import { Explorer } from "./Explorer";
import { Edge } from "./Edge";
import { Notepad, Calculator, Terminal } from "./Basic";
import { SettingsApp } from "./Settings";
import { Paint, Store, Photos, TaskManager, RecycleBin, CameraApp, ClockApp, Embed, Placeholder } from "./More";

function AppContentInner({ win }: { win: Win }) {
  switch (win.appId) {
    case "explorer":
      return <Explorer win={win} />;
    case "edge":
      return <Edge win={win} />;
    case "notepad":
      return <Notepad win={win} />;
    case "calculator":
      return <Calculator />;
    case "terminal":
      return <Terminal win={win} />;
    case "settings":
      return <SettingsApp win={win} />;
    case "paint":
      return <Paint />;
    case "store":
      return <Store />;
    case "photos":
      return <Photos />;
    case "taskmanager":
      return <TaskManager />;
    case "recycle":
      return <RecycleBin />;
    case "camera":
      return <CameraApp />;
    case "alarm":
      return <ClockApp />;
    case "spotify":
      return <Embed src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" />;
    case "code":
      return <Embed src="https://github1s.com/microsoft/vscode/blob/HEAD/README.md" />;
    case "maps":
      return <Embed src="https://www.openstreetmap.org/export/embed.html?bbox=116.20%2C39.80%2C116.60%2C40.05&layer=mapnik" />;
    default:
      return <Placeholder win={win} />;
  }
}

export const AppContent = memo(AppContentInner, (a, b) => a.win.payload === b.win.payload && a.win.id === b.win.id && a.win.title === b.win.title && a.win.appId === b.win.appId);
