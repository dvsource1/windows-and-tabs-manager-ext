import { FirebaseApp } from "firebase/app";
import {
  collection,
  DocumentData,
  Firestore,
  getDocs,
  getFirestore,
  QuerySnapshot,
} from "firebase/firestore";
import * as _ from "lodash";

import {
  child,
  Database,
  DataSnapshot,
  get,
  getDatabase,
  ref,
} from "firebase/database";

const COLLECTION = "tabs-and-window-manager-ext";

export enum DOCUMENTS {
  TAB_GROUPS = "TAB_GROUPS",
}

type DocIdOrPath = DOCUMENTS | string;

export const readData = async (
  app: FirebaseApp,
  docIdsOrPaths: string | string[],
  realtime = true
) => {
  const db: Firestore | Database = createDatabase(app, realtime);

  if (db instanceof Firestore) {
    const response = await getDocs(collection(db as Firestore, COLLECTION));
    return mapFiresore(response, docIdsOrPaths);
  } else {
    const response = await get(child(ref(db as Database), COLLECTION));
    return mapDatabase(response, docIdsOrPaths);
  }
};

const createDatabase = (
  app: FirebaseApp,
  realtime = true
): Firestore | Database => {
  if (realtime) {
    return getDatabase(app);
  } else {
    return getFirestore(app);
  }
};

const mapFiresore = (
  querySnapshot: QuerySnapshot<DocumentData>,
  docId: DocIdOrPath | DocIdOrPath[]
): any => {
  const data = {};

  let docIds = [];
  if (_.isString(docId)) {
    docIds = [docId];
  } else if (_.isArray(docId)) {
    docIds = docId as DOCUMENTS[];
  }

  querySnapshot.forEach(async (doc) => {
    console.log(doc.data());
    const { id, list } = doc.data();
    if (_.isEmpty(docIds) || docIds.includes(id)) {
      _.set(data, id, list);
    }
  });

  return data;
};

const mapDatabase = (
  response: DataSnapshot,
  path: DocIdOrPath | DocIdOrPath[]
) => {
  console.log(path);
  return response.val();
};
