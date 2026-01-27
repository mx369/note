import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CollectionItem,
  Environment,
  HistoryEntry,
  PersistedState,
  RequestConfig,
  ResponseData,
  TabState,
  VariableRow,
  WorkspaceKind,
} from "../types";
import { createId } from "../utils/id";
import { saveState } from "../utils/storage";

const createEmptyRequest = (): RequestConfig => ({
  id: createId(),
  name: "New Request",
  method: "GET",
  url: "https://",
  params: [{ id: createId(), key: "", value: "", enabled: true }],
  headers: [{ id: createId(), key: "", value: "", enabled: true }],
  auth: { type: "none" },
  body: { type: "none" },
  scripts: { preRequest: "", tests: "" },
  updatedAt: Date.now(),
});

const defaultRequest = createEmptyRequest();
const initialTabId = createId();

type AppState = {
  requests: RequestConfig[];
  history: HistoryEntry[];
  collections: CollectionItem[];
  environments: Environment[];
  globals: VariableRow[];
  workspace: WorkspaceKind;
  activeEnvironmentId?: string;
  tabs: TabState[];
  activeTabId: string;
  currentResponse?: ResponseData;
  lastSentAt?: number;
  isSending: boolean;
  setWorkspace: (kind: WorkspaceKind) => void;
  setActiveEnvironment: (id?: string) => void;
  updateRequest: (request: RequestConfig) => void;
  openRequestInTab: (requestId: string) => void;
  closeTab: (tabId: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  addHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  setCollections: (collections: CollectionItem[]) => void;
  setGlobals: (rows: VariableRow[]) => void;
  setEnvironments: (envs: Environment[]) => void;
  setResponse: (response?: ResponseData) => void;
  setSending: (state: boolean) => void;
  resetToDefault: () => void;
};

const defaultState: PersistedState = {
  version: 1,
  requests: [defaultRequest],
  collections: [],
  history: [],
  environments: [
    { id: createId(), name: "Dev", variables: [] },
    { id: createId(), name: "Staging", variables: [] },
    { id: createId(), name: "Prod", variables: [] },
  ],
  globals: [],
  workspace: "personal",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      activeEnvironmentId: defaultState.environments[0]?.id,
      tabs: [
        { id: initialTabId, title: defaultRequest.name, requestId: defaultRequest.id, isDirty: false },
      ],
      activeTabId: initialTabId,
      currentResponse: undefined,
      lastSentAt: undefined,
      isSending: false,
      setWorkspace: (kind) => set({ workspace: kind }),
      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
      updateRequest: (request) =>
        set((state) => {
          const exists = state.requests.some((item) => item.id === request.id);
          const updated = exists
            ? state.requests.map((item) =>
                item.id === request.id ? { ...request, updatedAt: Date.now() } : item
              )
            : [request, ...state.requests];
          return { requests: updated };
        }),
      openRequestInTab: (requestId) =>
        set((state) => {
          const existing = state.tabs.find((tab) => tab.requestId === requestId);
          if (existing) {
            return { activeTabId: existing.id };
          }
          const request = state.requests.find((item) => item.id === requestId);
          if (!request) return {};
          const newTab = {
            id: createId(),
            title: request.name,
            requestId,
            isDirty: false,
          };
          return {
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          };
        }),
      closeTab: (tabId) =>
        set((state) => {
          const nextTabs = state.tabs.filter((tab) => tab.id !== tabId);
          const activeTabId =
            state.activeTabId === tabId
              ? nextTabs[0]?.id ?? ""
              : state.activeTabId;
          return { tabs: nextTabs, activeTabId };
        }),
      markTabDirty: (tabId, isDirty) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, isDirty } : tab)),
        })),
      addHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 200),
        })),
      clearHistory: () => set({ history: [] }),
      setCollections: (collections) => set({ collections }),
      setGlobals: (rows) => set({ globals: rows }),
      setEnvironments: (envs) => set({ environments: envs }),
      setResponse: (response) => set({ currentResponse: response }),
      setSending: (state) => set({ isSending: state }),
      resetToDefault: () => set(() => ({ ...defaultState })),
    }),
    {
      name: "orbit-api-studio",
      partialize: (state) => ({
        version: 1,
        requests: state.requests,
        history: state.history,
        collections: state.collections,
        environments: state.environments,
        globals: state.globals,
        workspace: state.workspace,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const firstTab = state.tabs[0];
          if (!state.activeTabId && firstTab) {
            state.activeTabId = firstTab.id;
          }
          saveState({
            version: 1,
            requests: state.requests,
            history: state.history,
            collections: state.collections,
            environments: state.environments,
            globals: state.globals,
            workspace: state.workspace,
          });
        }
      },
    }
  )
);
