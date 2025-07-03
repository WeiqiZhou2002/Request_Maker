import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";


export function getToolDefinitions() {
  return {
    tools: [
      
      {
        name: "make-request",
        description: "Turn JSON-formatted request into a real API call and return the result",
        inputSchema: {
          type: "object",
          properties: {
            verb:       { type: "string", description: "HTTP verb or MCP action (e.g., INSERT, UPDATE)" },
            endpoint:   { type: "string", description: "Target MCP endpoint (e.g., google.calendar.events)" },
            payload:    { type: "object", description: "Request payload matching the endpoint’s schema" }
          },
          required: ["verb", "endpoint", "payload"]
        },
      },      
    ],
  };
} 