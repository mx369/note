import { TestResult, VariableRow } from "../types";
import { createId } from "./id";

const createVarProxy = (rows: VariableRow[]) => {
  return {
    get: (key: string) => rows.find((row) => row.key === key)?.value ?? "",
    set: (key: string, value: string) => {
      const existing = rows.find((row) => row.key === key);
      if (existing) {
        existing.value = value;
        existing.enabled = true;
      } else {
        rows.push({ id: createId(), key, value, enabled: true });
      }
    },
  };
};

export type ScriptContext = {
  globals: VariableRow[];
  environment: VariableRow[];
  variables: VariableRow[];
};

export const runPreRequestScript = async (
  script: string,
  context: ScriptContext,
  timeoutMs = 800
) => {
  if (!script.trim()) return;
  const pm = {
    environment: createVarProxy(context.environment),
    globals: createVarProxy(context.globals),
    variables: createVarProxy(context.variables),
    randomString: (len = 12) =>
      Array.from({ length: len }, () => Math.floor(Math.random() * 36).toString(36)).join(
        ""
      ),
    timestamp: () => Date.now(),
  };

  const runner = new Function(
    "pm",
    "console",
    `"use strict"; return (async () => { ${script} })();`
  );

  await Promise.race([
    runner(pm, console),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Script timeout")), timeoutMs)),
  ]);
};

export const runTests = async (
  script: string,
  responseBody: string,
  timeoutMs = 800
): Promise<TestResult[]> => {
  const results: TestResult[] = [];
  if (!script.trim()) return results;

  const expect = (value: unknown) => ({
    toBe: (expected: unknown) => {
      if (value !== expected) {
        throw new Error(`Expected ${String(value)} to be ${String(expected)}`);
      }
    },
    toContain: (expected: unknown) => {
      if (typeof value !== "string" || !value.includes(String(expected))) {
        throw new Error(`Expected ${String(value)} to contain ${String(expected)}`);
      }
    },
  });

  const pm = {
    response: {
      text: () => responseBody,
      json: () => JSON.parse(responseBody),
    },
    test: (name: string, fn: () => void) => {
      try {
        fn();
        results.push({ id: createId(), name, status: "pass" });
      } catch (error) {
        results.push({
          id: createId(),
          name,
          status: "fail",
          message: (error as Error).message,
        });
      }
    },
    expect,
  };

  const runner = new Function(
    "pm",
    "console",
    `"use strict"; return (async () => { ${script} })();`
  );

  await Promise.race([
    runner(pm, console),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Test timeout")), timeoutMs)),
  ]).catch((error) => {
    results.push({
      id: createId(),
      name: "Script error",
      status: "fail",
      message: (error as Error).message,
    });
  });

  return results;
};
