import * as _ from "lodash";
import { getDomain } from ".";
import { getTabGroup, Tab } from "../api/tabs";
import { getCurrentWindow } from "../api/windows";

export const getCurrentWindowTabs = async () => {
  const currentWindow = await getCurrentWindow(true);
  return currentWindow.tabs;
};

export const groupTabsByDomain = (tabs) => {
  const tabGroups = new Map<string, Tab[]>();

  _.forEach(tabs, (tab) => {
    const domain = getDomain(tab.url);

    if (!tabGroups.has(domain)) {
      tabGroups.set(domain, []);
    }
    tabGroups.get(domain).push(tab);
  });
  return tabGroups;
};

export const getTabGroups = async (tabs: Tab[]) => {
  const tabGroupsMap = new Map<number, Tab[]>();

  _.forEach(tabs, (tab) => {
    if (!tabGroupsMap.has(tab.groupId)) {
      tabGroupsMap.set(tab.groupId, []);
    }
    tabGroupsMap.get(tab.groupId).push(tab);
  });

  const groups = [];
  const tabGroupIds = Array.from(tabGroupsMap.keys()).filter((id) => id > 0);
  for (const groupId of tabGroupIds) {
    const group = await getTabGroup(groupId);
    _.set(group, "tabs", tabGroupsMap.get(groupId));
    groups.push(group);
  }

  return groups;
};
