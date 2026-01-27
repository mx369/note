import { Textarea } from "../../ui/textarea";

export const ScriptEditor = ({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="space-y-3">
    <div>
      <h3 className="text-sm font-semibold">{label}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Textarea
      rows={10}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="// pm.test('status code is 200', () => {\n//   pm.expect(pm.response.json().id).toBe(1)\n// })"
      className="font-mono text-xs"
    />
    <div className="rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
      Scripts run in a sandbox. Access pm.environment, pm.globals, pm.variables. No window/document.
    </div>
  </div>
);
