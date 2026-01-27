import { useEffect } from "react";
import { KeyValueRow } from "../../types";
import { createId } from "../../utils/id";
import { Button } from "../ui/button";

const ensureTrailingRow = (rows: KeyValueRow[]) => {
  const last = rows[rows.length - 1];
  if (!last || last.key || last.value) {
    return [...rows, { id: createId(), key: "", value: "", enabled: true }];
  }
  return rows;
};

export const KeyValueTable = ({
  rows,
  onChange,
  hint,
  quickAdd = [],
}: {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
  hint?: string;
  quickAdd?: string[];
}) => {
  useEffect(() => {
    onChange(ensureTrailingRow(rows));
  }, []);

  const updateRow = (id: string, updates: Partial<KeyValueRow>) => {
    const updated = rows.map((row) => (row.id === id ? { ...row, ...updates } : row));
    onChange(ensureTrailingRow(updated));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <div className="flex items-center gap-2">
          {quickAdd.map((item) => (
            <Button
              key={item}
              size="sm"
              variant="secondary"
              onClick={() =>
                onChange(
                  ensureTrailingRow([
                    ...rows,
                    { id: createId(), key: item, value: "", enabled: true },
                  ])
                )
              }
            >
              + {item}
            </Button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border">
        <div className="grid grid-cols-[40px_1fr_1fr_60px] gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
          <span>On</span>
          <span>Key</span>
          <span>Value</span>
          <span></span>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[40px_1fr_1fr_60px] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
          >
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={() => updateRow(row.id, { enabled: !row.enabled })}
            />
            <input
              className="rounded-md border border-border bg-transparent px-2 py-1 text-sm"
              value={row.key}
              onChange={(event) => updateRow(row.id, { key: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && index === rows.length - 1) {
                  onChange(ensureTrailingRow([...rows]));
                }
              }}
              placeholder="Key"
            />
            <input
              className="rounded-md border border-border bg-transparent px-2 py-1 text-sm"
              value={row.value}
              onChange={(event) => updateRow(row.id, { value: event.target.value })}
              placeholder="Value"
            />
            <button
              className="text-xs text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(row.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
