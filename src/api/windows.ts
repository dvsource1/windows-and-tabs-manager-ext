export type Window = chrome.windows.Window;
export type QueryOptions = chrome.windows.QueryOptions;

export const getAllWindows = (
  queryOptions?: QueryOptions
): Promise<Window[]> => {
  return chrome.windows.getAll(queryOptions);
};

export const getCurrentWindow = async (withTabs = false): Promise<Window> => {
  return await chrome.windows.getCurrent({ populate: withTabs });
};

export const removeWindowId = (windowId: number) => {
  try {
    chrome.windows
      .remove(windowId)
      // .then((w) => {})
      .catch((we) => {
        console.error(we);
      });
  } catch (error) {
    console.error(error);
  }
};
