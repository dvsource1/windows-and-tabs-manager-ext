import * as _ from "lodash";
import { Tab } from "./@types/tabs";
import { getAllWindows, removeWindowId } from "./api/windows";
import { map_monitorsAndWindows } from "./mapper";
import "./style.css";
import { Action, view_actions } from "./ui/actions";
import { view_windows } from "./ui/windows";
import { getDomain } from "./util";

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

const createTabsMap = async (tabs) => {
  const tabGroups = new Map<string, Tab[]>();

  _.forEach(tabs, async (tab) => {
    const { url, favIconUrl } = tab;
    console.log(url, favIconUrl);

    const domain = getDomain(tab.url);

    if (!tabGroups.has(domain)) {
      tabGroups.set(domain, []);
    }
    tabGroups.get(domain).push(tab);
  });
  return tabGroups;
};

const getCurrentWindowTabs = async () => {
  const currentWindow = await chrome.windows.getCurrent({ populate: true });
  return currentWindow.tabs;
};

const getTabs = async () => {
  const tabs = await getCurrentWindowTabs();
  console.log(tabs);

  const tabGroups = await createTabsMap(tabs);
  console.log(tabGroups);
};

const sortTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  const tabGroups = await createTabsMap(tabs);

  tabGroups.forEach((tg, key) => {
    console.log(key, tg);
    _.forEach(tg, (tgg) => {
      chrome.tabs.move(tgg.id, { index: -1 });
    });
  });
};

const groupTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  const tabGroups = await createTabsMap(tabs);
  tabGroups.forEach((tbs) => {
    if (tbs.length > 1) {
      chrome.tabs.group({ tabIds: _.map(tbs, "id") });
    }
  });

  const newTabs = await getCurrentWindowTabs();
  newTabs.forEach((t) => {
    if (t.groupId === -1) {
      chrome.tabs.move(t.id, { index: -1 });
    }
  });
};

// ACTIONS

const actions: Action[] = [
  {
    id: "getAllMonitors",
    name: "getAllMonitors",
    disable: true,
    callback: getAllMonitors,
  },
  {
    id: "getAllWindows",
    name: "getAllWindows",
    disable: true,
    callback: getAllWindowsWithTabs,
  },
  {
    id: "mapMonitorsAndWindows",
    name: "mapMonitorsAndWindows",
    disable: true,
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
  {
    id: "getTabs",
    name: "getTabs",
    callback: getTabs,
  },
  {
    id: "sortTabs",
    name: "sortTabs",
    callback: sortTabs,
  },
  {
    id: "groupTabs",
    name: "groupTabs",
    callback: groupTabs,
  },
];

// DOM

const containerElm = document.getElementById("app") as HTMLDivElement;
view_actions(containerElm, actions);
