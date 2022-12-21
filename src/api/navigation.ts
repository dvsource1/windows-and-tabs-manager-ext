export const getAllFrames = async (tabId) => {
  const allFrames = await chrome.webNavigation.getAllFrames({ tabId });
  return allFrames;
};
