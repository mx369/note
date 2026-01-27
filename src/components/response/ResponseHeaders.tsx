import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";

export const ResponseHeaders = ({ headers }: { headers: Record<string, string> }) => {
  const { notify } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(headers, null, 2));
    notify({ title: "Copied", description: "Headers copied." });
  };

  return (
    <div className="space-y-3">
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        <Copy className="h-4 w-4" /> Copy
      </Button>
      <div className="rounded-lg border border-border bg-background">
        {Object.entries(headers).length === 0 && (
          <div className="p-4 text-xs text-muted-foreground">No headers returned.</div>
        )}
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between border-b border-border px-3 py-2 text-xs last:border-b-0">
            <span className="font-semibold">{key}</span>
            <span className="text-muted-foreground">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
