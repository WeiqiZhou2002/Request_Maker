import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { OAuth2Client } from "google-auth-library";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { RequestEnvelope, RequestProcessor } from "../../GenericRequestProcessor.js";

export class MakeRequestHandler extends BaseToolHandler {
    async runTool(args: any, auth: OAuth2Client): Promise<CallToolResult> {
        if (!args.verb || !args.endpoint || !args.payload) {
            return {
              content: [{ type: "text", text: "Error: verb, endpoint, and payload are required." }]
            };
          }
      
      const envelope: RequestEnvelope = {
        verb: args.verb,
        endpoint: args.endpoint, 
        auth,                               
        payload: args.payload,
        }
      const rp   = new RequestProcessor();
      const res  = await rp.process(envelope);
      try {
        const result = await rp.process(envelope);
        return {
          content: [
            { type: "text", text: `Request executed successfully: ${JSON.stringify(result)}` }
          ]
        };
      } catch (error: any) {
        return {
          content: [
            { type: "text", text: `Request failed: ${error.message}` }
          ]
        };
      }
    }
}

