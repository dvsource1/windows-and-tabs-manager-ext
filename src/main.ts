import * as _ from "lodash";
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
  const tabGroups = new Map<string, chrome.tabs.Tab[]>();

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
const getTabGroups = async (tabs: chrome.tabs.Tab[]) => {
  const tabGroupsMap = new Map<number, chrome.tabs.Tab[]>();

  _.forEach(tabs, (tab) => {
    if (!tabGroupsMap.has(tab.groupId)) {
      tabGroupsMap.set(tab.groupId, []);
    }
    tabGroupsMap.get(tab.groupId).push(tab);
  });

  const groups = [];
  const tabGroupIds = Array.from(tabGroupsMap.keys()).filter((id) => id > 0);
  for (const groupId of tabGroupIds) {
    const group = await chrome.tabGroups.get(groupId);
    _.set(group, "tabs", tabGroupsMap.get(groupId));
    groups.push(group);
  }

  return groups;
};
const getTabs = async () => {
  const tabs = await getCurrentWindowTabs();
  console.log(tabs);

  const existingGroups = await getTabGroups(tabs);
  console.log(existingGroups);

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
const ungroupTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  // ungroup all tabs
  if (!_.isEmpty(tabs)) {
    await chrome.tabs.ungroup(
      tabs.filter((tab) => tab.groupId > 0).map((tab) => tab.id)
    );
  }
};
const groupTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  // ungroup all tabs
  if (!_.isEmpty(tabs)) {
    const tabIds = tabs.filter((tab) => tab.groupId > 0).map((tab) => tab.id);
    if (!_.isEmpty(tabIds)) {
      await chrome.tabs.ungroup(tabIds);
    }
  }

  await sortTabs();

  const tabGroups = await createTabsMap(tabs);
  tabGroups.forEach(async (tbs) => {
    if (tbs.length > 1) {
      await chrome.tabs.group({ tabIds: _.map(tbs, "id") });
    }
  });

  const newTabs = await getCurrentWindowTabs();

  const existingGroups = await getTabGroups(newTabs);
  console.log(existingGroups);
  _.forEach(existingGroups, async (group) => {
    if (group.id > 0) {
      await chrome.tabGroups.update(group.id, { collapsed: true });
    }
  });

  newTabs.forEach(async (t) => {
    if (t.groupId === -1) {
      await chrome.tabs.move(t.id, { index: -1 });
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
    disable: true,
    callback: sortTabs,
  },
  {
    id: "ungroupTabs",
    name: "ungroupTabs",
    callback: ungroupTabs,
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
