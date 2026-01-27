import { RequestAuth } from "../../../types";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";

export const AuthEditor = ({
  auth,
  onChange,
}: {
  auth: RequestAuth;
  onChange: (auth: RequestAuth) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select
          value={auth.type}
          onChange={(event) => {
            const type = event.target.value as RequestAuth["type"];
            if (type === "none") onChange({ type: "none" });
            if (type === "bearer") onChange({ type: "bearer", token: "" });
            if (type === "basic") onChange({ type: "basic", username: "", password: "" });
            if (type === "apiKey")
              onChange({ type: "apiKey", key: "", value: "", placement: "header" });
          }}
        >
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apiKey">API Key</option>
        </Select>
      </div>
      {auth.type === "bearer" && (
        <Input
          placeholder="Token"
          value={auth.token}
          onChange={(event) => onChange({ ...auth, token: event.target.value })}
        />
      )}
      {auth.type === "basic" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Username"
            value={auth.username}
            onChange={(event) => onChange({ ...auth, username: event.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={auth.password}
            onChange={(event) => onChange({ ...auth, password: event.target.value })}
          />
        </div>
      )}
      {auth.type === "apiKey" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Key"
            value={auth.key}
            onChange={(event) => onChange({ ...auth, key: event.target.value })}
          />
          <Input
            placeholder="Value"
            value={auth.value}
            onChange={(event) => onChange({ ...auth, value: event.target.value })}
          />
          <div className="col-span-2 max-w-xs">
            <Select
              value={auth.placement}
              onChange={(event) =>
                onChange({
                  ...auth,
                  placement: event.target.value as "header" | "query",
                })
              }
            >
              <option value="header">Header</option>
              <option value="query">Query</option>
            </Select>
          </div>
        </div>
      )}
      {auth.type === "none" && (
        <p className="text-xs text-muted-foreground">No authentication will be attached.</p>
      )}
    </div>
  );
};
