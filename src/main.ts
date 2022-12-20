import * as _ from "lodash";
import { collapseTabGroup, groupTabs, moveTab } from "./api/tabs";
import { getCurrentWindow, removeWindowId } from "./api/windows";
import { initFirebase } from "./firebase";
import { readData } from "./firebase/database";
import "./style.css";
import { Action, view_actions } from "./ui/actions";
import { view_windows } from "./ui/windows";
import { createBookmarkFromTab } from "./util/bookmark-utils";
import {
  getCurrentWindowTabs,
  getTabGroups,
  groupTabsByDomain,
} from "./util/tab-utils";
import {
  getAllMonitors,
  getAllNoneNormalWindows,
  getAllWindowsWithTabs,
  mapMonitorsAndWindows,
} from "./util/window-utils";

const firebase = initFirebase();

const firebaseFSTest = async () => {
  const response = await readData(firebase, [], false);
  console.log(response);
};

const firebaseDBTest = async () => {
  const response = await readData(firebase, [], true);
  console.log(response);
};

const displayWindows = async () => {
  const monitors = await getAllMonitors();
  const windows = await getAllWindowsWithTabs();
  const monitersWithWindows = await mapMonitorsAndWindows(monitors, windows);
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

const logTabs = async () => {
  const tabs = await getCurrentWindowTabs();
  console.log(tabs);

  const existingGroups = await getTabGroups(tabs);
  console.log(existingGroups);

  const tabGroups = await groupTabsByDomain(tabs);
  console.log(tabGroups);
};
const sortTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  const tabGroups = await groupTabsByDomain(tabs);

  tabGroups.forEach((tg, __) => {
    _.forEach(tg, async (tgg) => {
      await moveTab(tgg.id);
    });
  });
};
const ungroupTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  // ungroup all tabs
  if (!_.isEmpty(tabs)) {
    await groupTabs(
      tabs.filter((tab) => tab.groupId > 0).map((tab) => tab.id),
      false
    );
  }
};
const arrangeTabs = async () => {
  const tabs = await getCurrentWindowTabs();

  // ungroup all tabs
  if (!_.isEmpty(tabs)) {
    const tabIds = tabs.filter((tab) => tab.groupId > 0).map((tab) => tab.id);
    if (!_.isEmpty(tabIds)) {
      await groupTabs(tabIds, false);
    }
  }

  await sortTabs();

  const tabGroups = await groupTabsByDomain(tabs);
  tabGroups.forEach(async (tbs) => {
    if (tbs.length > 1) {
      await groupTabs(_.map(tbs, "id"));
    }
  });

  const newTabs = await getCurrentWindowTabs();

  const existingGroups = await getTabGroups(newTabs);
  console.log(existingGroups);
  _.forEach(existingGroups, async (group) => {
    if (group.id > 0) {
      await collapseTabGroup(group.id);
    }
  });

  newTabs.forEach(async (t) => {
    if (t.groupId === -1) {
      await moveTab(t.id);
    }
  });
};
const mergeToCurrentWindows = async () => {
  const currentWindow = await getCurrentWindow(true);
  currentWindow.id;

  const monitors = await getAllMonitors();
  const windows = await getAllWindowsWithTabs();
  const monitersWithWindows = await mapMonitorsAndWindows(monitors, windows);
  await _.forEach(monitersWithWindows, async (mw) => {
    if (!_.isEmpty(mw.windows)) {
      await _.forEach(mw.windows, async (win) => {
        if (win.id === currentWindow.id && mw.windows.length > 1) {
          const otherWindows = mw.windows.filter(
            (ww) => ww.id !== currentWindow.id
          );

          await _.forEach(otherWindows, async (ow) => {
            await _.forEach(ow.tabs, async (owt) => {
              await moveTab(owt.id, currentWindow.id);
            });
          });
        }
      });
    }
  });
  await sortTabs();
};

const backupWindow = async () => {
  const currentTabs = await getCurrentWindowTabs();
  // const

  // const bookmarks = [];
  for (const tab of currentTabs) {
    try {
      await createBookmarkFromTab(tab, "__BACKUP__");
    } catch (e) {
      console.log(e);
    }
    // bookmarks.push(bookmark);
  }

  // console.log(bookmarks);
};

// ACTIONS

const actions: (Action | Action[])[] = [
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
  [
    {
      id: "logTabs",
      name: "logTabs",
      callback: logTabs,
    },
    {
      id: "sortTabs",
      name: "sortTabs",
      disable: true,
      callback: sortTabs,
    },
  ],
  [
    {
      id: "ungroupTabs",
      name: "ungroupTabs",
      callback: ungroupTabs,
    },
    {
      id: "arrangeTabs",
      name: "arrangeTabs",
      callback: arrangeTabs,
    },
  ],
  [
    {
      id: "mergeToCurrentWindows",
      name: "mergeToCurrentWindows",
      callback: mergeToCurrentWindows,
    },
    {
      id: "backupWindow",
      name: "backupWindow",
      callback: backupWindow,
    },
  ],
  [
    {
      id: "firebaseFSTest",
      name: "firebaseFSTest",
      callback: firebaseFSTest,
    },
    {
      id: "firebaseDBTest",
      name: "firebaseDBTest",
      callback: firebaseDBTest,
    },
  ],
];

// DOM

const containerElm = document.getElementById("app") as HTMLDivElement;
view_actions(containerElm, actions);
