import { useMemo, useState } from "react";
import { Eye, Code2, FileText, Download } from "lucide-react";
import { ResponseData } from "../../types";
import { Button } from "../ui/button";

export const ResponseBody = ({ response }: { response: ResponseData }) => {
  const [mode, setMode] = useState<"pretty" | "raw" | "preview">("pretty");
  const [chunkCount, setChunkCount] = useState(1);

  const content = useMemo(() => {
    if (mode === "pretty" && response.json) {
      return JSON.stringify(response.json, null, 2);
    }
    return response.body;
  }, [mode, response.body, response.json]);

  const chunkSize = 4000;
  const chunks = useMemo(() => {
    if (content.length <= chunkSize) return [content];
    const list: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      list.push(content.slice(i, i + chunkSize));
    }
    return list;
  }, [content]);

  const renderedChunks = chunks.slice(0, chunkCount);

  const handleDownload = () => {
    const blob = new Blob([response.body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "response.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={mode === "pretty" ? "primary" : "secondary"} onClick={() => setMode("pretty")}>
          <Code2 className="h-4 w-4" /> Pretty
        </Button>
        <Button size="sm" variant={mode === "raw" ? "primary" : "secondary"} onClick={() => setMode("raw")}>
          <FileText className="h-4 w-4" /> Raw
        </Button>
        <Button size="sm" variant={mode === "preview" ? "primary" : "secondary"} onClick={() => setMode("preview")}>
          <Eye className="h-4 w-4" /> Preview
        </Button>
        <Button size="sm" variant="secondary" onClick={handleDownload}>
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
      {mode === "preview" ? (
        <div className="rounded-lg border border-border bg-background p-3">
          <iframe title="preview" srcDoc={response.body} className="h-64 w-full rounded-md" />
        </div>
      ) : (
        <pre className="max-h-[360px] overflow-auto rounded-lg border border-border bg-background p-3 text-xs">
          {renderedChunks.join("")}
        </pre>
      )}
      {chunks.length > chunkCount && (
        <Button size="sm" variant="ghost" onClick={() => setChunkCount((prev) => prev + 1)}>
          Load more ({chunkCount}/{chunks.length})
        </Button>
      )}
    </div>
  );
};
