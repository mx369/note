import { Environment, VariableRow } from "../types";

export type VariableScope = {
  globals: VariableRow[];
  environment?: Environment;
  collection?: VariableRow[];
  local?: VariableRow[];
};

const toRecord = (rows?: VariableRow[]) =>
  (rows ?? []).reduce<Record<string, string>>((acc, row) => {
    if (row.enabled) {
      acc[row.key] = row.value;
    }
    return acc;
  }, {});

export const resolveVariable = (key: string, scope: VariableScope) => {
  const local = toRecord(scope.local);
  const collection = toRecord(scope.collection);
  const env = toRecord(scope.environment?.variables);
  const globals = toRecord(scope.globals);

  if (key in local) return local[key];
  if (key in collection) return collection[key];
  if (key in env) return env[key];
  if (key in globals) return globals[key];
  return "";
};

export const resolveTemplate = (input: string, scope: VariableScope) => {
  return input.replace(/\{\{(.*?)\}\}/g, (_, raw) => {
    const key = raw.trim();
    return resolveVariable(key, scope) ?? "";
  });
};
