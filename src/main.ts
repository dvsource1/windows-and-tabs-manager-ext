import * as _ from "lodash";
import {
  collapseTabGroup,
  getCurrentTab,
  groupTabs,
  moveTab,
} from "./api/tabs";
import { getCurrentWindow, removeWindowId } from "./api/windows";
import { EventHandler } from "./core/evenr-handler";
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

const notifictaionTest = async () => {
  const options: chrome.notifications.NotificationOptions<true> = {
    iconUrl: "../icon32.png",
    title: "Title",
    message: "Hi Mom!",
    contextMessage: "lorem ipsum",
    type: "basic",
    requireInteraction: true,
    buttons: [{ title: "Save" }, { title: "Cancel" }],
  };
  chrome.notifications.create("TEST", options);

  chrome.notifications.onButtonClicked.addListener((e, i) => {
    console.log("onButtonClicked", e, i);
  });
};

const updateNotification = async () => {
  const options: chrome.notifications.NotificationOptions<true> = {
    iconUrl: "../icon32.png",
    title: "Title",
    message: "Hi Mom!",
    contextMessage: "lorem ipsum",
    type: "list",
    buttons: [{ title: "Save" }, { title: "Cancel" }],
    requireInteraction: false,
    items: [
      { title: "Sub Item 1", message: "Sum item content 1111" },
      { title: "Sub Item 2", message: "Sum item content 2222222" },
    ],
  };
  chrome.notifications.update("TEST", options);

  chrome.notifications.onClosed.addListener((e, u) =>
    console.log("onClosed", e, u)
  );
  chrome.notifications.onClicked.addListener((e) =>
    console.log("onClicked", e)
  );
};

const accessDOM = async () => {
  const currentTab = await getCurrentTab();

  if (!_.isNil(currentTab)) {
    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id, allFrames: true },
        func: () => {
          return document.getSelection
            ? document.getSelection().toString()
            : null;
        },
      },
      (injectionResults) => {
        for (const frameResult of injectionResults)
          console.log("Frame Title: ", frameResult.result);
      }
    );
  } else {
    console.log("no current tab");
  }
};

const saveLayout = async () => {};

const restoreLayout = async () => {};

// ACTIONS

const actions: (Action | Action[])[] = [
  { id: "displayWindows", name: "displayWindows", callback: displayWindows },
  { id: "removePopup", name: "removePopup", callback: removePopupPanels },
  [
    { id: "logTabs", name: "logTabs", callback: logTabs },
    { id: "sortTabs", name: "sortTabs", disable: true, callback: sortTabs },
    { id: "ungroupTabs", name: "ungroupTabs", callback: ungroupTabs },
    { id: "arrangeTabs", name: "arrangeTabs", callback: arrangeTabs },
  ],
  [
    { id: "mergeToCur", name: "mergeToCur", callback: mergeToCurrentWindows },
    { id: "backupWindow", name: "backupWindow", callback: backupWindow },
  ],
  [
    { id: "firebaseFS", name: "firebaseFS", callback: firebaseFSTest },
    { id: "firebaseDB", name: "firebaseDB", callback: firebaseDBTest },
  ],
  [
    { id: "notifictaion", name: "notifictaion", callback: notifictaionTest },
    { id: "updateNotif", name: "updateNotif", callback: updateNotification },
  ],
  { id: "accessDOM", name: "accessDOM", disable: true, callback: accessDOM },
  [
    { id: "saveLayout", name: "saveLayout", callback: saveLayout },
    { id: "restoreLayout", name: "restoreLayout", callback: restoreLayout },
  ],
];

// Event Handlers

const unrEventCallback =
  (key) =>
  (...eargs) => {
    console.log(key, eargs);
  };

EventHandler.register(
  "windows.onBoundsChanged",
  unrEventCallback("windows.onBoundsChanged")
);
EventHandler.register(
  "windows.onFocusChanged",
  unrEventCallback("windows.onFocusChanged")
);
EventHandler.register("tabs.onMoved", unrEventCallback("tabs.onMoved"));
EventHandler.register("tabs.onCreated", unrEventCallback("tabs.onCreated"));
EventHandler.register("tabs.onRemoved", unrEventCallback("tabs.onRemoved"));
EventHandler.register("tabs.onReplaced", unrEventCallback("tabs.onReplaced"));
EventHandler.register("tabs.onDetached", unrEventCallback("tabs.onDetached"));

EventHandler.listen();

// DOM

const containerElm = document.getElementById("app") as HTMLDivElement;
view_actions(containerElm, actions);
