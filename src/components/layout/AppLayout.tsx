import { useEffect, useMemo, useRef } from "react";
import { useAppStore } from "../../store/useAppStore";
import { TopBar } from "./TopBar";
import { Sidebar } from "../sidebar/Sidebar";
import { RequestWorkspace } from "../request/RequestWorkspace";
import { ResponsePanel } from "../response/ResponsePanel";
import { CommandPalette } from "../commands/CommandPalette";
import { useToast } from "../ui/toast";

export const AppLayout = () => {
  const { notify } = useToast();
  const activeTabId = useAppStore((state) => state.activeTabId);
  const tabs = useAppStore((state) => state.tabs);
  const setResponse = useAppStore((state) => state.setResponse);
  const isSending = useAppStore((state) => state.isSending);
  const setSending = useAppStore((state) => state.setSending);
  const responseRef = useRef<HTMLDivElement>(null);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId]
  );

  useEffect(() => {
    if (!activeTab) return;
    if (!activeTabId) {
      useAppStore.setState({ activeTabId: activeTab.id });
    }
  }, [activeTab, activeTabId]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent("send-request"));
      }
      if (event.key === "Escape" && isSending) {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent("cancel-request"));
        notify({ title: "Request cancelled", description: "Abort signal sent." });
        setSending(false);
        setResponse(undefined);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSending, notify, setResponse, setSending]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <RequestWorkspace scrollRef={responseRef} />
        <ResponsePanel scrollRef={responseRef} />
      </div>
      <CommandPalette />
    </div>
  );
};
