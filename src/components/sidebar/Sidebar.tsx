import { useMemo, useState } from "react";
import { BookOpen, Clock, PlusCircle, Settings } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, Tab } from "../ui/tabs";
import { createId } from "../../utils/id";
import { CollectionItem, RequestConfig } from "../../types";
import { EnvironmentEditor } from "./EnvironmentEditor";

const defaultRequest = (): RequestConfig => ({
  id: createId(),
  name: "Untitled",
  method: "GET",
  url: "https://",
  params: [{ id: createId(), key: "", value: "", enabled: true }],
  headers: [{ id: createId(), key: "", value: "", enabled: true }],
  auth: { type: "none" },
  body: { type: "none" },
  scripts: { preRequest: "", tests: "" },
  updatedAt: Date.now(),
});

export const Sidebar = () => {
  const [tab, setTab] = useState<"collections" | "history" | "envs">("collections");
  const [search, setSearch] = useState("");
  const {
    collections,
    setCollections,
    requests,
    updateRequest,
    history,
    openRequestInTab,
  } = useAppStore((state) => state);

  const filteredHistory = useMemo(() => {
    return history.filter((entry) =>
      entry.request.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const handleNewRequest = () => {
    const request = defaultRequest();
    updateRequest(request);
    openRequestInTab(request.id);
  };

  const createCollection = () => {
    const next: CollectionItem = {
      id: createId(),
      name: "New Folder",
      type: "folder",
      children: [],
      sortOrder: collections.length,
    };
    setCollections([...collections, next]);
  };

  return (
    <aside className="flex w-[280px] flex-col border-r border-border bg-card">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Workspace</h2>
          <Button size="sm" variant="secondary" onClick={handleNewRequest}>
            <PlusCircle className="h-4 w-4" />
            New
          </Button>
        </div>
        <Input
          className="mt-3"
          placeholder="Search history & collections"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <Tabs className="px-4">
        <Tab active={tab === "collections"} onClick={() => setTab("collections")}> 
          <BookOpen className="mr-2 inline h-4 w-4" />Collections
        </Tab>
        <Tab active={tab === "history"} onClick={() => setTab("history")}> 
          <Clock className="mr-2 inline h-4 w-4" />History
        </Tab>
        <Tab active={tab === "envs"} onClick={() => setTab("envs")}> 
          <Settings className="mr-2 inline h-4 w-4" />Envs
        </Tab>
      </Tabs>
      <div className="flex-1 overflow-auto px-4 py-3">
        {tab === "collections" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-muted-foreground">Collections</p>
              <Button size="sm" variant="ghost" onClick={createCollection}>
                + Folder
              </Button>
            </div>
            {collections.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                No collections yet. Create a folder to organize requests.
              </div>
            )}
            {collections.map((item) => (
              <div key={item.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">0 requests</p>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Quick Requests</p>
              <div className="mt-2 space-y-2">
                {requests
                  .filter((request) =>
                    request.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((request) => (
                    <button
                      key={request.id}
                      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                      onClick={() => openRequestInTab(request.id)}
                    >
                      <span>{request.name}</span>
                      <span className="text-xs text-muted-foreground">{request.method}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
        {tab === "history" && (
          <div className="space-y-2">
            {filteredHistory.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                No history yet. Send a request to see it here.
              </div>
            )}
            {filteredHistory.map((entry) => (
              <button
                key={entry.id}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-left hover:bg-secondary"
                onClick={() => openRequestInTab(entry.request.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{entry.request.name}</span>
                  <span className="text-xs text-muted-foreground">{entry.request.method}</span>
                </div>
                <p className="text-xs text-muted-foreground">{entry.request.url}</p>
              </button>
            ))}
          </div>
        )}
        {tab === "envs" && <EnvironmentEditor />}
      </div>
    </aside>
  );
};
