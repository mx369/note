import { RefObject, useMemo, useState } from "react";
import { FileText, RefreshCcw, Save, Copy } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/button";
import { Tabs, Tab } from "../ui/tabs";
import { ResponseBody } from "./ResponseBody";
import { ResponseHeaders } from "./ResponseHeaders";
import { TestResults } from "./TestResults";
import { useToast } from "../ui/toast";

const responseTabs = ["Body", "Headers", "Cookies", "Test Results"] as const;

export const ResponsePanel = ({
  scrollRef,
}: {
  scrollRef: RefObject<HTMLDivElement>;
}) => {
  const response = useAppStore((state) => state.currentResponse);
  const [activeTab, setActiveTab] = useState<(typeof responseTabs)[number]>("Body");
  const { notify } = useToast();

  const statusLabel = useMemo(() => {
    if (!response) return "Idle";
    return response.error ? "Error" : `${response.status} ${response.statusText}`;
  }, [response]);

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response.body);
    notify({ title: "Copied", description: "Response body copied to clipboard." });
  };

  return (
    <aside className="flex w-[360px] flex-col border-l border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Response</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy} disabled={!response}>
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button size="sm" variant="secondary" disabled={!response}>
              <Save className="h-4 w-4" />
              Save Example
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-1">{statusLabel}</span>
          <span>{response?.time ?? 0} ms</span>
          <span>{response?.size ?? 0} bytes</span>
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Body
          </span>
        </div>
      </div>
      <Tabs className="px-4">
        {responseTabs.map((tab) => (
          <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
            {tab}
          </Tab>
        ))}
      </Tabs>
      <div ref={scrollRef} className="flex-1 overflow-auto p-4">
        {!response ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            Send a request to see the response.
          </div>
        ) : (
          <>
            {activeTab === "Body" && <ResponseBody response={response} />}
            {activeTab === "Headers" && <ResponseHeaders headers={response.headers} />}
            {activeTab === "Cookies" && (
              <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                Cookies are captured when available. (Proxy recommended.)
              </div>
            )}
            {activeTab === "Test Results" && (
              <TestResults results={response.testResults ?? []} />
            )}
          </>
        )}
      </div>
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Response rendering uses chunking to avoid UI freezing on large payloads.
        </div>
      </div>
    </aside>
  );
};
