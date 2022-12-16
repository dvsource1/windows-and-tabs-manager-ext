import * as _ from "lodash";

export type Tab = chrome.tabs.Tab;
export type TabGroup = chrome.tabGroups.TabGroup;
export type UpdateProperties = chrome.tabGroups.UpdateProperties;
export type GroupOption = UpdateProperties & {
  windowId?: number;
};

export const moveTab = async (
  tabId,
  windowId = undefined,
  position = -1
): Promise<Tab> => {
  return chrome.tabs.move(tabId, { index: position, windowId });
};

export const groupTabs = async (
  tabIds: number[],
  optionsOrUngroup?: GroupOption | false
): Promise<TabGroup | void> => {
  if (!_.isEmpty(tabIds)) {
    if (optionsOrUngroup !== false) {
      const tabGroupId = await chrome.tabs.group({
        tabIds,
        createProperties: {
          windowId: optionsOrUngroup?.windowId,
        },
      });
      return await chrome.tabGroups.update(tabGroupId, optionsOrUngroup);
    } else {
      return chrome.tabs.ungroup(tabIds);
    }
  }
};

export const getTabGroup = async (groupId: number): Promise<TabGroup> => {
  return await chrome.tabGroups.get(groupId);
};

export const collapseTabGroup = async (
  groupId: number,
  collapsed = true
): Promise<TabGroup> => {
  return await chrome.tabGroups.update(groupId, { collapsed });
};
