export type DisplayInfo = chrome.system.display.DisplayInfo;

export const getDisplays = async (): Promise<DisplayInfo[]> => {
  return await chrome.system.display.getInfo();
};
