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
  return monitors;
};
const getAllWindowsWithTabs = async () => {
  const windows = await getAllWindows({ populate: true });
  return windows;
};
const getAllNoneNormalWindows = async () => {
  const windows = await getAllWindows({
    windowTypes: ["panel", "popup", "devtools", "app"],
  });
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
      removeWindowId(window.id);
    });
  }
};

const createTabsMap = async (tabs) => {
  const tabGroups = new Map<string, Tab[]>();

  _.forEach(tabs, async (tab) => {
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

  tabGroups.forEach((tg, __) => {
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

const mergeToCurrentWindows = async () => {
  const currentWindow = await chrome.windows.getCurrent({ populate: true });
  currentWindow.id;

  const monitersWithWindows = await mapMonitorsAndWindows();
  await _.forEach(monitersWithWindows, async (mw) => {
    if (!_.isEmpty(mw.windows)) {
      await _.forEach(mw.windows, async (win) => {
        if (win.id === currentWindow.id && mw.windows.length > 1) {
          const otherWindows = mw.windows.filter(
            (ww) => ww.id !== currentWindow.id
          );

          await _.forEach(otherWindows, async (ow) => {
            await _.forEach(ow.tabs, async (owt) => {
              await chrome.tabs.move(owt.id, {
                windowId: currentWindow.id,
                index: -1,
              });
            });
          });
        }
      });
    }
  });
  await sortTabs();
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
  {
    id: "mergeToCurrentWindows",
    name: "mergeToCurrentWindows",
    callback: mergeToCurrentWindows,
  },
];

// DOM

const containerElm = document.getElementById("app") as HTMLDivElement;
view_actions(containerElm, actions);
