import { CheckCircle2, XCircle } from "lucide-react";
import { TestResult } from "../../types";

export const TestResults = ({ results }: { results: TestResult[] }) => {
  if (!results.length) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
        No tests executed.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <div
          key={result.id}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <div>
            <p className="font-medium">{result.name}</p>
            {result.message && <p className="text-xs text-muted-foreground">{result.message}</p>}
          </div>
          {result.status === "pass" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )}
        </div>
      ))}
    </div>
  );
};
