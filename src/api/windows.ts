import { QueryOptions } from "../@types/windows";

export const getAllWindows = (queryOptions?: Partial<QueryOptions>) => {
  return chrome.windows.getAll(queryOptions);
};

export const removeWindowId = (windowId: number) => {
  try {
    chrome.windows
      .remove(windowId)
      .then((w) => {
        console.log("removed: w:", w);
      })
      .catch((we) => {
        console.error(we);
      });
  } catch (error) {
    console.error(error);
  }
}; 