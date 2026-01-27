import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { RequestConfig } from "../../types";
import { generateSnippets } from "../../utils/snippets";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";

export const CodeSnippetPanel = ({ request }: { request: RequestConfig }) => {
  const { globals, environments, activeEnvironmentId } = useAppStore((state) => state);
  const env = environments.find((item) => item.id === activeEnvironmentId);
  const snippets = useMemo(
    () => generateSnippets(request, { globals, environment: env }),
    [request, globals, env]
  );
  const [active, setActive] = useState(snippets[0]?.id ?? "curl");
  const { notify } = useToast();

  const current = snippets.find((item) => item.id === active) ?? snippets[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {snippets.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={active === item.id ? "primary" : "secondary"}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (!current) return;
            navigator.clipboard.writeText(current.code);
            notify({ title: "Copied", description: `${current.label} snippet copied.` });
          }}
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
      {current && (
        <pre className="rounded-lg border border-border bg-background p-3 text-xs">
          {current.code}
        </pre>
      )}
    </div>
  );
};
