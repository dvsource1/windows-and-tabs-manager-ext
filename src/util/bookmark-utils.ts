import * as _ from "lodash";
import { Bookmark, createBookmark } from "../api/bookmarks";
import { Tab } from "../api/tabs";

export const createBookmarkFromTab = async (tab: Tab, parent: string) => {
  return await createBookmark(parent, tab.url, tab.title);
};

const getBookmark = (
  bookmarks: Bookmark[],
  name: string,
  path = "ROOT",
  a = new Map<string, Bookmark[]>()
): Map<string, Bookmark[]> => {
  for (const btn of bookmarks) {
    if (btn.title === name) {
      if (!a.has(path)) {
        a.set(path, []);
      }
      a.get(path).push(btn);
    }
    if (btn.children?.length) {
      const newPath = btn.title ? `${path} / ${btn.title}` : path;
      getBookmark(btn.children, name, newPath, a);
    }
  }
  return a;
};

export const getFolderByTitle = async (name: string | string[]) => {
  const bookmarks = await chrome.bookmarks.getTree();

  const namePaths = _.isString(name)
    ? (name as string).split(".")
    : (name as string[]);
  const search = _.last(namePaths);

  const match = getBookmark(bookmarks, search);

  console.log(match);
};
