export const getAllWindows = (queryOptions?: chrome.windows.QueryOptions) => {
  return chrome.windows.getAll(queryOptions);
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
