import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
let transportRef: any = null;
export function initAudit(transport: any) {
    transportRef = transport;
  }
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname,  "..", "logs", "audit.log");
const dir = path.dirname(LOG_PATH);
if (dir !== path.parse(dir).root) {       // skip if it's "/"
  fs.mkdirSync(dir, { recursive: true });
}
const auditStream = fs.createWriteStream(LOG_PATH, { flags: "a" });
export function logRest(entry: RestAction) {
//   if (process.env.MCP_AUDIT === "1") {
//     process.stderr.write(JSON.stringify(entry) + "\n");
//   }
  auditStream.write(JSON.stringify(entry) + "\n");
}
