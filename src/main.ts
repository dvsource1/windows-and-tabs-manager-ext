import * as _ from "lodash";
import { getAllWindows, removeWindowId } from "./api/windows";
import { map_monitorsAndWindows } from "./mapper";
import "./style.css";
import { Action, view_actions } from "./ui/actions";
import { view_windows } from "./ui/windows";

const getAllMonitors = async () => {
  const monitors = await chrome.system.display.getInfo();
  console.log(monitors);
  return monitors;
};
const getAllWindowsWithTabs = async () => {
  const windows = await getAllWindows({ populate: true });
  console.log(windows);
  return windows;
};
const getAllNoneNormalWindows = async () => {
  const windows = await getAllWindows({
    windowTypes: ["panel", "popup", "devtools", "app"],
  });
  console.log(windows);
  return windows;
};
const mapMonitorsAndWindows = async () => {
  const monitors = await getAllMonitors();
  const windows = await getAllWindowsWithTabs();

  return map_monitorsAndWindows(monitors, windows);
};
const displayWindows = async () => {
  const monitersWithWindows = await mapMonitorsAndWindows();
  view_windows(containerElm, monitersWithWindows);
};
const removePopupPanels = async () => {
  const windows = await getAllNoneNormalWindows();
  if (!_.isEmpty(windows)) {
    _.forEach(windows, async (window) => {
      console.log("remove window: ", window);
      removeWindowId(window.id);
    });
  }
};

// ACTIONS

const actions: Action[] = [
  {
    id: "getAllMonitors",
    name: "getAllMonitors",
    callback: getAllMonitors,
  },
  {
    id: "getAllWindows",
    name: "getAllWindows",
    callback: getAllWindowsWithTabs,
  },
  {
    id: "mapMonitorsAndWindows",
    name: "mapMonitorsAndWindows",
    callback: mapMonitorsAndWindows,
  },
  {
    id: "displayWindows",
    name: "displayWindows",
    callback: displayWindows,
  },
  {
    id: "removePopupPanels",
    name: "removePopupPanels",
    callback: removePopupPanels,
  },
];

// DOM

const containerElm = document.getElementById("app") as HTMLDivElement;
view_actions(containerElm, actions);
