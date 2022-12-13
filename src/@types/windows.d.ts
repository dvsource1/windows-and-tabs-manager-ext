import { Tab } from "./tabs";

export type CreateType = "normal" | "panel" | "popup";
export type WindowType = "normal" | "panel" | "popup" | "app" | "devtools";
export type WindowState =
  | "normal"
  | "minimized"
  | "maximized"
  | "fullscreen"
  | "locked-fullscreen";

export interface QueryOptions {
  populate: boolean;
  windowTypes: WindowType[];
}

export interface Window {
  id: number;
  sessionId: string;
  type: WindowType;
  state: WindowState;
  alwaysOnTop: boolean;
  focused: boolean;
  incognito: boolean;
  tabs: Tab[];
  left: number;
  top: number;
  width: number;
  height: number;
}
