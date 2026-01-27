import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { createId } from "../../utils/id";

export const EnvironmentEditor = () => {
  const { environments, setEnvironments, globals, setGlobals, activeEnvironmentId } =
    useAppStore((state) => state);
  const [showSecret, setShowSecret] = useState(false);

  const active = environments.find((env) => env.id === activeEnvironmentId) ?? environments[0];

  const updateVariable = (scope: "globals" | "environment", id: string, key: string, value: string) => {
    if (scope === "globals") {
      setGlobals(
        globals.map((row) => (row.id === id ? { ...row, key, value } : row))
      );
    } else if (active) {
      const updated = environments.map((env) =>
        env.id === active.id
          ? {
              ...env,
              variables: env.variables.map((row) =>
                row.id === id ? { ...row, key, value } : row
              ),
            }
          : env
      );
      setEnvironments(updated);
    }
  };

  const toggleRow = (scope: "globals" | "environment", id: string) => {
    if (scope === "globals") {
      setGlobals(
        globals.map((row) =>
          row.id === id ? { ...row, enabled: !row.enabled } : row
        )
      );
    } else if (active) {
      const updated = environments.map((env) =>
        env.id === active.id
          ? {
              ...env,
              variables: env.variables.map((row) =>
                row.id === id ? { ...row, enabled: !row.enabled } : row
              ),
            }
          : env
      );
      setEnvironments(updated);
    }
  };

  const addRow = (scope: "globals" | "environment") => {
    if (scope === "globals") {
      setGlobals([...globals, { id: createId(), key: "", value: "", enabled: true }]);
    } else if (active) {
      const updated = environments.map((env) =>
        env.id === active.id
          ? {
              ...env,
              variables: [
                ...env.variables,
                { id: createId(), key: "", value: "", enabled: true },
              ],
            }
          : env
      );
      setEnvironments(updated);
    }
  };

  const removeRow = (scope: "globals" | "environment", id: string) => {
    if (scope === "globals") {
      setGlobals(globals.filter((row) => row.id !== id));
    } else if (active) {
      const updated = environments.map((env) =>
        env.id === active.id
          ? { ...env, variables: env.variables.filter((row) => row.id !== id) }
          : env
      );
      setEnvironments(updated);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs uppercase text-muted-foreground">Globals</h3>
          <Button size="sm" variant="ghost" onClick={() => addRow("globals")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {globals.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={() => toggleRow("globals", row.id)}
              />
              <Input
                className="w-28"
                placeholder="key"
                value={row.key}
                onChange={(event) => updateVariable("globals", row.id, event.target.value, row.value)}
              />
              <Input
                type={row.secret && !showSecret ? "password" : "text"}
                placeholder="value"
                value={row.value}
                onChange={(event) => updateVariable("globals", row.id, row.key, event.target.value)}
              />
              <Button size="sm" variant="ghost" onClick={() => removeRow("globals", row.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs uppercase text-muted-foreground">Environment</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowSecret((prev) => !prev)}>
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addRow("environment")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!active ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            Select an environment to edit variables.
          </div>
        ) : (
          <div className="space-y-2">
            {active.variables.map((row) => (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={() => toggleRow("environment", row.id)}
                />
                <Input
                  className="w-28"
                  placeholder="key"
                  value={row.key}
                  onChange={(event) =>
                    updateVariable("environment", row.id, event.target.value, row.value)
                  }
                />
                <Input
                  type={row.secret && !showSecret ? "password" : "text"}
                  placeholder="value"
                  value={row.value}
                  onChange={(event) =>
                    updateVariable("environment", row.id, row.key, event.target.value)
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRow("environment", row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
