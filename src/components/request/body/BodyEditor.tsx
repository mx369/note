import { FileText, FileUp, Brackets } from "lucide-react";
import { RequestBody } from "../../../types";
import { Tabs, Tab } from "../../ui/tabs";
import { KeyValueTable } from "../KeyValueTable";
import { Textarea } from "../../ui/textarea";
import { Select } from "../../ui/select";
import { Button } from "../../ui/button";

const bodyTabs = ["none", "form-data", "x-www-form-urlencoded", "raw"] as const;

export const BodyEditor = ({
  body,
  onChange,
}: {
  body: RequestBody;
  onChange: (body: RequestBody) => void;
}) => {
  const currentTab = body.type;

  const handleTabChange = (next: (typeof bodyTabs)[number]) => {
    if (next === "none") onChange({ type: "none" });
    if (next === "form-data") onChange({ type: "form-data", rows: [] });
    if (next === "x-www-form-urlencoded") onChange({ type: "x-www-form-urlencoded", rows: [] });
    if (next === "raw") onChange({ type: "raw", raw: { format: "json", value: "" } });
  };

  return (
    <div className="space-y-4">
      <Tabs>
        {bodyTabs.map((tab) => (
          <Tab key={tab} active={currentTab === tab} onClick={() => handleTabChange(tab)}>
            {tab}
          </Tab>
        ))}
      </Tabs>
      {body.type === "none" && (
        <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
          No request body will be sent.
        </div>
      )}
      {body.type === "form-data" && (
        <div>
          <p className="text-xs text-muted-foreground">Supports text + file placeholders.</p>
          <KeyValueTable
            rows={body.rows}
            onChange={(rows) => onChange({ type: "form-data", rows })}
          />
        </div>
      )}
      {body.type === "x-www-form-urlencoded" && (
        <KeyValueTable
          rows={body.rows}
          onChange={(rows) => onChange({ type: "x-www-form-urlencoded", rows })}
        />
      )}
      {body.type === "raw" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Select
              value={body.raw.format}
              onChange={(event) =>
                onChange({
                  type: "raw",
                  raw: { ...body.raw, format: event.target.value as typeof body.raw.format },
                })
              }
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="xml">XML</option>
            </Select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (body.raw.format === "json") {
                  try {
                    const formatted = JSON.stringify(JSON.parse(body.raw.value), null, 2);
                    onChange({ type: "raw", raw: { ...body.raw, value: formatted } });
                  } catch {
                    onChange(body);
                  }
                }
              }}
            >
              <Brackets className="h-4 w-4" />
              Format
            </Button>
            <span className="text-xs text-muted-foreground">
              <FileText className="mr-1 inline h-4 w-4" /> Raw body
              <FileUp className="ml-2 mr-1 inline h-4 w-4" /> Upload (placeholder)
            </span>
          </div>
          <Textarea
            rows={12}
            value={body.raw.value}
            onChange={(event) =>
              onChange({ type: "raw", raw: { ...body.raw, value: event.target.value } })
            }
            placeholder="{
  \"id\": 1
}"
          />
        </div>
      )}
    </div>
  );
};
