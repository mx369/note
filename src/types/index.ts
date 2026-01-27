export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type KeyValueRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  type?: "text" | "file";
  fileMeta?: {
    name: string;
    size: number;
    type: string;
  };
};

export type RequestAuth =
  | { type: "none" }
  | { type: "bearer"; token: string }
  | { type: "basic"; username: string; password: string }
  | { type: "apiKey"; key: string; value: string; placement: "header" | "query" };

export type RawBody = {
  format: "json" | "text" | "xml";
  value: string;
};

export type RequestBody =
  | { type: "none" }
  | { type: "form-data"; rows: KeyValueRow[] }
  | { type: "x-www-form-urlencoded"; rows: KeyValueRow[] }
  | { type: "raw"; raw: RawBody };

export type RequestScripts = {
  preRequest: string;
  tests: string;
};

export type RequestConfig = {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  params: KeyValueRow[];
  headers: KeyValueRow[];
  auth: RequestAuth;
  body: RequestBody;
  scripts: RequestScripts;
  updatedAt: number;
};

export type ResponseData = {
  status: number;
  statusText: string;
  time: number;
  size: number;
  headers: Record<string, string>;
  body: string;
  json?: unknown;
  error?: string;
  cookies?: Record<string, string>;
  testResults?: TestResult[];
};

export type HistoryEntry = {
  id: string;
  request: RequestConfig;
  response?: ResponseData;
  createdAt: number;
};

export type CollectionItem = {
  id: string;
  name: string;
  type: "folder" | "request";
  children?: CollectionItem[];
  request?: RequestConfig;
  sortOrder: number;
};

export type Environment = {
  id: string;
  name: string;
  variables: VariableRow[];
};

export type VariableRow = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  secret?: boolean;
};

export type WorkspaceKind = "personal" | "team";

export type TabState = {
  id: string;
  title: string;
  requestId: string;
  isDirty: boolean;
};

export type TestResult = {
  id: string;
  name: string;
  status: "pass" | "fail";
  message?: string;
};

export type CodeSnippet = {
  id: string;
  label: string;
  language: "bash" | "javascript";
  code: string;
};

export type PersistedState = {
  version: number;
  requests: RequestConfig[];
  collections: CollectionItem[];
  history: HistoryEntry[];
  environments: Environment[];
  globals: VariableRow[];
  workspace: WorkspaceKind;
};
