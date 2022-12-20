import * as _ from "lodash";

export type Bookmark = chrome.bookmarks.BookmarkTreeNode;

export const BOOKMARK_BAR = "Bookmarks bar";
export const OTHER_BOOKMARKS = "Other bookmarks";

export enum PREDEFINED_PARENTS {
  ROOT_ID = "0",
  BOOKMARK_BAR_ID = "1",
  OTHER_BOOKMARKS_ID = "2",
}

type ParentType = PREDEFINED_PARENTS | string;

export const createBookmarkFolder = async (
  parent: ParentType,
  name: string
): Promise<Bookmark> => {
  name =
    name +
    new Date().toJSON().split("T")[1].split(".").join(":").split(":").join("");
  return await chrome.bookmarks.create({ parentId: parent, title: name });
};

export const createBookmark = async (
  parent: ParentType,
  url: string,
  title?: string
): Promise<Bookmark | void> => {
  const isParentNumber =
    _.isNumber(_.toNumber(parent)) && !_.isNaN(_.toNumber(parent));
  if (!isParentNumber) {
    // create bookmark group by parent name [:TODO if not exists]
    const bookmarkFolder = await createBookmarkFolder(
      PREDEFINED_PARENTS.OTHER_BOOKMARKS_ID,
      parent
    );
    parent = bookmarkFolder.id;
    // console.log(bookmarkFolder);
    // return bookmarkFolder;
  }

  if (_.isNil(title)) {
    try {
      title = new URL(url).hostname
        .split(".")
        .filter((_, i, l) => l.length - 1 > i)
        .reverse()
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" | ");
    } catch (e) {
      title = url;
    }
  }
  return await chrome.bookmarks.create({ parentId: parent, url, title });
};
