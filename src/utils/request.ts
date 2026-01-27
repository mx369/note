import { RequestConfig, ResponseData } from "../types";
import { resolveTemplate, VariableScope } from "./variables";

export type PreparedRequest = {
  url: string;
  method: string;
  headers: HeadersInit;
  body?: BodyInit | null;
};

export const buildRequest = (
  config: RequestConfig,
  scope: VariableScope
): PreparedRequest => {
  const url = new URL(resolveTemplate(config.url, scope));
  config.params
    .filter((row) => row.enabled && row.key)
    .forEach((row) => {
      url.searchParams.set(row.key, resolveTemplate(row.value, scope));
    });

  const headers = new Headers();
  config.headers
    .filter((row) => row.enabled && row.key)
    .forEach((row) => {
      headers.set(row.key.toLowerCase(), resolveTemplate(row.value, scope));
    });

  if (config.auth.type === "bearer") {
    headers.set("authorization", `Bearer ${resolveTemplate(config.auth.token, scope)}`);
  }

  if (config.auth.type === "basic") {
    const token = btoa(
      `${resolveTemplate(config.auth.username, scope)}:${resolveTemplate(
        config.auth.password,
        scope
      )}`
    );
    headers.set("authorization", `Basic ${token}`);
  }

  if (config.auth.type === "apiKey") {
    if (config.auth.placement === "header") {
      headers.set(config.auth.key, resolveTemplate(config.auth.value, scope));
    } else {
      url.searchParams.set(
        config.auth.key,
        resolveTemplate(config.auth.value, scope)
      );
    }
  }

  let body: BodyInit | null | undefined = null;
  if (config.body.type === "raw") {
    body = resolveTemplate(config.body.raw.value, scope);
    if (config.body.raw.format === "json") {
      headers.set("content-type", "application/json");
    }
    if (config.body.raw.format === "xml") {
      headers.set("content-type", "application/xml");
    }
  }

  if (config.body.type === "x-www-form-urlencoded") {
    const params = new URLSearchParams();
    config.body.rows
      .filter((row) => row.enabled && row.key)
      .forEach((row) => {
        params.set(row.key, resolveTemplate(row.value, scope));
      });
    body = params;
    headers.set("content-type", "application/x-www-form-urlencoded");
  }

  if (config.body.type === "form-data") {
    const form = new FormData();
    config.body.rows
      .filter((row) => row.enabled && row.key)
      .forEach((row) => {
        if (row.type === "file" && row.fileMeta) {
          form.append(row.key, new File([], row.fileMeta.name, { type: row.fileMeta.type }));
        } else {
          form.append(row.key, resolveTemplate(row.value, scope));
        }
      });
    body = form;
  }

  return {
    url: url.toString(),
    method: config.method,
    headers,
    body,
  };
};

export const executeRequest = async (
  prepared: PreparedRequest,
  controller: AbortController
): Promise<ResponseData> => {
  const start = performance.now();
  try {
    const response = await fetch(prepared.url, {
      method: prepared.method,
      headers: prepared.headers,
      body: prepared.method === "GET" || prepared.method === "HEAD" ? null : prepared.body,
      signal: controller.signal,
    });
    const text = await response.text();
    const time = performance.now() - start;
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let json: unknown | undefined;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      time: Math.round(time),
      size: new Blob([text]).size,
      headers,
      body: text,
      json,
    };
  } catch (error) {
    const time = performance.now() - start;
    return {
      status: 0,
      statusText: "Request Failed",
      time: Math.round(time),
      size: 0,
      headers: {},
      body: "",
      error: (error as Error).message,
    };
  }
};
