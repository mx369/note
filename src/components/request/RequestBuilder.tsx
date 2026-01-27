import { useState } from "react";
import { RequestConfig } from "../../types";
import { useAppStore } from "../../store/useAppStore";
import { Tabs, Tab } from "../ui/tabs";
import { KeyValueTable } from "./KeyValueTable";
import { AuthEditor } from "./auth/AuthEditor";
import { BodyEditor } from "./body/BodyEditor";
import { ScriptEditor } from "./scripts/ScriptEditor";
import { CodeSnippetPanel } from "./CodeSnippetPanel";

const tabs = ["Params", "Headers", "Auth", "Body", "Pre-request", "Tests", "Code"] as const;

export const RequestBuilder = ({ request, tabId }: { request: RequestConfig; tabId: string }) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Params");
  const updateRequest = useAppStore((state) => state.updateRequest);
  const markTabDirty = useAppStore((state) => state.markTabDirty);

  const update = (next: Partial<RequestConfig>) => {
    updateRequest({ ...request, ...next, updatedAt: Date.now() });
    markTabDirty(tabId, true);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Tabs className="px-4">
        {tabs.map((label) => (
          <Tab key={label} active={activeTab === label} onClick={() => setActiveTab(label)}>
            {label}
          </Tab>
        ))}
      </Tabs>
      <div className="flex-1 overflow-auto px-4 py-4">
        {activeTab === "Params" && (
          <KeyValueTable
            rows={request.params}
            onChange={(rows) => update({ params: rows })}
            hint="Query parameters appended to URL"
          />
        )}
        {activeTab === "Headers" && (
          <KeyValueTable
            rows={request.headers}
            onChange={(rows) => update({ headers: rows })}
            hint="Header keys are case-insensitive and merged"
            quickAdd={["Content-Type", "Authorization", "Accept"]}
          />
        )}
        {activeTab === "Auth" && (
          <AuthEditor auth={request.auth} onChange={(auth) => update({ auth })} />
        )}
        {activeTab === "Body" && (
          <BodyEditor body={request.body} onChange={(body) => update({ body })} />
        )}
        {activeTab === "Pre-request" && (
          <ScriptEditor
            label="Pre-request Script"
            description="Runs before sending the request. Access pm.environment/pm.globals/pm.variables."
            value={request.scripts.preRequest}
            onChange={(value) => update({ scripts: { ...request.scripts, preRequest: value } })}
          />
        )}
        {activeTab === "Tests" && (
          <ScriptEditor
            label="Tests"
            description="Runs after response. Use pm.test and pm.expect."
            value={request.scripts.tests}
            onChange={(value) => update({ scripts: { ...request.scripts, tests: value } })}
          />
        )}
        {activeTab === "Code" && <CodeSnippetPanel request={request} />}
      </div>
    </div>
  );
};
