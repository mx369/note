import { RequestConfig } from "../types";
import { buildRequest } from "./request";
import { VariableScope } from "./variables";

export const generateSnippets = (request: RequestConfig, scope: VariableScope) => {
  const prepared = buildRequest(request, scope);
  const headerEntries = Object.entries(
    prepared.headers instanceof Headers
      ? Object.fromEntries(prepared.headers.entries())
      : prepared.headers
  );

  const curlLines = [
    `curl -X ${prepared.method} \\`,
    `  "${prepared.url}" \\`,
    ...headerEntries.map(([key, value]) => `  -H "${key}: ${value}" \\`),
  ];
  if (prepared.body && typeof prepared.body === "string") {
    curlLines.push(`  -d '${prepared.body}'`);
  }

  const fetchCode = `fetch("${prepared.url}", {
  method: "${prepared.method}",
  headers: ${JSON.stringify(Object.fromEntries(headerEntries), null, 2)},
  body: ${prepared.body ? JSON.stringify(prepared.body) : "undefined"},
}).then(res => res.text()).then(console.log);`;

  const axiosCode = `axios({
  method: "${prepared.method.toLowerCase()}",
  url: "${prepared.url}",
  headers: ${JSON.stringify(Object.fromEntries(headerEntries), null, 2)},
  data: ${prepared.body ? JSON.stringify(prepared.body) : "undefined"},
}).then(res => console.log(res.data));`;

  return [
    { id: "curl", label: "cURL", language: "bash", code: curlLines.join("\n") },
    { id: "fetch", label: "fetch", language: "javascript", code: fetchCode },
    { id: "axios", label: "axios", language: "javascript", code: axiosCode },
  ];
};
