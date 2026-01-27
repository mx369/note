import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Save, Send, XCircle } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/button";
import { RequestBuilder } from "./RequestBuilder";
import { RequestTabs } from "./RequestTabs";
import { executeRequest, buildRequest } from "../../utils/request";
import { useToast } from "../ui/toast";
import { createId } from "../../utils/id";
import { runPreRequestScript, runTests } from "../../utils/sandbox";
import { resolveTemplate } from "../../utils/variables";

export const RequestWorkspace = ({
  scrollRef,
}: {
  scrollRef: RefObject<HTMLDivElement>;
}) => {
  const {
    tabs,
    activeTabId,
    requests,
    updateRequest,
    markTabDirty,
    openRequestInTab,
    addHistory,
    setResponse,
    setSending,
    isSending,
    globals,
    environments,
    activeEnvironmentId,
  } = useAppStore((state) => state);
  const { notify } = useToast();
  const [controller, setController] = useState<AbortController | null>(null);
  const urlHistory = useRef<string[]>([]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId]
  );
  const request = useMemo(
    () => requests.find((item) => item.id === activeTab?.requestId) ?? requests[0],
    [requests, activeTab]
  );

  useEffect(() => {
    if (!activeTab && request) {
      openRequestInTab(request.id);
    }
  }, [activeTab, openRequestInTab, request]);

  if (!request || !activeTab) return null;

  const env = environments.find((item) => item.id === activeEnvironmentId);

  const sendRequest = useCallback(async () => {
    if (!request.url) {
      notify({ title: "Missing URL", description: "Enter a valid URL.", variant: "error" });
      return;
    }
    const localVars = [{ id: createId(), key: "requestId", value: request.id, enabled: true }];
    const scope = {
      globals,
      environment: env,
      local: localVars,
    };

    const current = { ...request };
    try {
      setSending(true);
      setResponse(undefined);
      await runPreRequestScript(request.scripts.preRequest, {
        globals,
        environment: env?.variables ?? [],
        variables: localVars,
      });
      const prepared = buildRequest(request, scope);
      const abortController = new AbortController();
      setController(abortController);
      const response = await executeRequest(prepared, abortController);
      const testResults = await runTests(request.scripts.tests, response.body);
      response.testResults = testResults;
      setResponse(response);
      addHistory({ id: createId(), request: current, response, createdAt: Date.now() });
      urlHistory.current = Array.from(new Set([request.url, ...urlHistory.current])).slice(0, 10);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      notify({ title: "Request completed", description: `${response.status} ${response.statusText}` });
    } catch (error) {
      notify({
        title: "Request failed",
        description: (error as Error).message,
        variant: "error",
      });
    } finally {
      setSending(false);
      setController(null);
    }
  }, [
    request,
    globals,
    env,
    setSending,
    setResponse,
    addHistory,
    notify,
    scrollRef,
  ]);

  useEffect(() => {
    const handler = () => sendRequest();
    const cancelHandler = () => controller?.abort();
    document.addEventListener("send-request", handler);
    document.addEventListener("cancel-request", cancelHandler);
    return () => {
      document.removeEventListener("send-request", handler);
      document.removeEventListener("cancel-request", cancelHandler);
    };
  }, [controller, sendRequest]);

  const handleUrlChange = (value: string) => {
    updateRequest({ ...request, url: value });
    markTabDirty(activeTab.id, true);
  };

  const resolvedUrl = resolveTemplate(request.url, {
    globals,
    environment: env,
  });

  return (
    <section className="flex flex-1 flex-col overflow-hidden">
      <RequestTabs />
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2">
        <div className="flex flex-1 items-center gap-2">
          <input
            className="w-[160px] rounded-md border border-border bg-transparent px-2 py-1 text-sm"
            value={request.name}
            onChange={(event) => {
              updateRequest({ ...request, name: event.target.value });
              markTabDirty(activeTab.id, true);
            }}
            placeholder="Request name"
          />
          <select
            className="rounded-md border border-border bg-transparent px-2 py-1 text-sm"
            value={request.method}
            onChange={(event) => {
              updateRequest({ ...request, method: event.target.value as typeof request.method });
              markTabDirty(activeTab.id, true);
            }}
          >
            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
          <input
            className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm"
            value={request.url}
            onChange={(event) => handleUrlChange(event.target.value)}
            list="url-history"
            placeholder="{{baseUrl}}/users"
          />
          <datalist id="url-history">
            {urlHistory.current.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <Button size="sm" onClick={sendRequest} disabled={isSending}>
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => markTabDirty(activeTab.id, false)}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => controller?.abort()}
            disabled={!isSending}
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
      <div className="border-b border-border bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
        Resolved URL: {resolvedUrl}
        <span className="ml-3 text-[10px]">
          Web requests are subject to CORS. Use desktop/agent proxy for unrestricted access.
        </span>
      </div>
      <RequestBuilder request={request} tabId={activeTab.id} />
    </section>
  );
};
