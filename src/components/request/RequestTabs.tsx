import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { cn } from "../../utils/cn";

export const RequestTabs = () => {
  const { tabs, activeTabId, openRequestInTab, closeTab, requests } = useAppStore(
    (state) => state
  );

  return (
    <div className="flex items-center gap-2 overflow-auto border-b border-border bg-card px-4 py-2">
      {tabs.map((tab) => {
        const request = requests.find((item) => item.id === tab.requestId);
        return (
          <button
            key={tab.id}
            className={cn(
              "flex items-center gap-2 rounded-md border border-transparent px-3 py-1 text-sm",
              tab.id === activeTabId ? "bg-secondary text-foreground" : "text-muted-foreground"
            )}
            onClick={() => openRequestInTab(tab.requestId)}
          >
            <span>{request?.name ?? tab.title}</span>
            {tab.isDirty && <span className="h-2 w-2 rounded-full bg-primary" />}
            <span
              className="text-muted-foreground hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="h-3 w-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
};
