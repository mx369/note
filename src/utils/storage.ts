import { PersistedState } from "../types";

const DB_NAME = "orbit-api-studio";
const STORE_NAME = "state";
const VERSION = 1;
const LOCAL_KEY = "orbit-api-state";

const openDatabase = () =>
  new Promise<IDBDatabase | null>((resolve) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

export const loadState = async (): Promise<PersistedState | null> => {
  try {
    const db = await openDatabase();
    if (!db) {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as PersistedState) : null;
    }
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get("state");
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

export const saveState = async (state: PersistedState) => {
  try {
    const db = await openDatabase();
    if (!db) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
      return;
    }
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(state, "state");
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  }
};

export const exportState = async (state: PersistedState) => {
  const payload = {
    ...state,
    exportedAt: Date.now(),
  };
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
};

export const importState = async (file: File): Promise<PersistedState | null> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as PersistedState & { version?: number };
    if (!parsed.version) {
      return null;
    }
    return parsed as PersistedState;
  } catch {
    return null;
  }
};
