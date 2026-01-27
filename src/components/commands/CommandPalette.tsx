import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Input } from "../ui/input";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { requests, history, environments, globals, openRequestInTab } = useAppStore(
    (state) => state
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const results = useMemo(() => {
    const lower = query.toLowerCase();
    const requestItems = requests
      .filter((item) => item.name.toLowerCase().includes(lower) || item.url.includes(lower))
      .map((item) => ({
        id: item.id,
        label: `Request · ${item.name}`,
        action: () => openRequestInTab(item.id),
      }));
    const historyItems = history
      .filter((item) => item.request.name.toLowerCase().includes(lower))
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        label: `History · ${item.request.name}`,
        action: () => openRequestInTab(item.request.id),
      }));
    const variableItems = [
      ...globals,
      ...environments.flatMap((env) => env.variables),
    ]
      .filter((item) => item.key.toLowerCase().includes(lower))
      .slice(0, 4)
      .map((item) => ({ id: item.id, label: `Var · ${item.key}`, action: () => {} }));

    return [...requestItems, ...historyItems, ...variableItems].slice(0, 8);
  }, [query, requests, history, environments, globals, openRequestInTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-8">
      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="border-0 px-0 py-1"
            placeholder="Search requests, history, variables..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
        </div>
        <div className="mt-3 space-y-2">
          {results.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              No results. Try searching by request name, URL, or variable.
            </div>
          )}
          {results.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-secondary"
              onClick={() => {
                item.action();
                setOpen(false);
                setQuery("");
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Tip: Cmd/Ctrl+Enter to send request. Esc to close.
        </p>
      </div>
    </div>
  );
};
