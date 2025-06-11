export type Verb =
  | "INSERT"
  | "LIST"
  | "UPDATE"
  | "DELETE"
  | "GET"
  | "WATCH";
export interface RestAction {
  ts: string;
  verb: Verb;
  endpoint: string;      
  payload: unknown;
}
export function logRest(entry: RestAction) {
  if (process.env.MCP_AUDIT === "1") {
    process.stderr.write(JSON.stringify(entry) + "\n");
  }
}
