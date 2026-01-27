import { useMemo, useRef } from "react";
import { Download, Upload, Sun, Moon, Users, User } from "lucide-react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { useThemeStore } from "../../store/useThemeStore";
import { useAppStore } from "../../store/useAppStore";
import { exportState, importState, saveState } from "../../utils/storage";
import { useToast } from "../ui/toast";

export const TopBar = () => {
  const { toggle, theme } = useThemeStore();
  const { notify } = useToast();
  const {
    workspace,
    setWorkspace,
    environments,
    activeEnvironmentId,
    setActiveEnvironment,
    requests,
    history,
    collections,
    globals,
  } = useAppStore((state) => state);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportPayload = useMemo(
    () => ({
      version: 1,
      requests,
      history,
      collections,
      environments,
      globals,
      workspace,
    }),
    [collections, environments, globals, history, requests, workspace]
  );

  const handleExport = async () => {
    const blob = await exportState(exportPayload);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "orbit-api-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify({ title: "Export ready", description: "JSON export generated." });
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    const state = await importState(file);
    if (!state) {
      notify({ title: "Import failed", description: "Invalid JSON bundle.", variant: "error" });
      return;
    }
    useAppStore.setState({
      requests: state.requests,
      history: state.history,
      collections: state.collections,
      environments: state.environments,
      globals: state.globals,
      workspace: state.workspace,
    });
    saveState(state);
    notify({ title: "Import complete", description: "Workspace restored." });
  };

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-semibold">Orbit API Studio</p>
          <p className="text-xs text-muted-foreground">Modern API workspace</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background p-1">
          <button
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
              workspace === "personal" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setWorkspace("personal")}
          >
            <User className="h-4 w-4" />
            Personal
          </button>
          <button
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
              workspace === "team" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setWorkspace("team")}
          >
            <Users className="h-4 w-4" />
            Team
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-[180px]">
          <Select
            value={activeEnvironmentId}
            onChange={(event) => setActiveEnvironment(event.target.value)}
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
            <option value="">No Environment</option>
          </Select>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="application/json"
          onChange={(event) => {
            const file = event.target.files?.[0];
            handleImport(file);
            event.target.value = "";
          }}
        />
        <Button variant="secondary" size="sm" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};
