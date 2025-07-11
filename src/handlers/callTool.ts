import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { OAuth2Client } from 'google-auth-library';
import { BaseToolHandler } from "./core/BaseToolHandler.js";
import { MakeRequestHandler } from "./core/MakeRequestHandler.js";

/**
 * Handles incoming tool calls, validates arguments, calls the appropriate service,
 * and formats the response.
 *
 * @param request The CallToolRequest containing tool name and arguments.
 * @param oauth2Client The authenticated OAuth2 client instance.
 * @returns A Promise resolving to the CallToolResponse.
 */
export async function handleCallTool(request: typeof CallToolRequestSchema._type, oauth2Client: OAuth2Client) {
    const { name, arguments: args } = request.params;

    try {
        const handler = getHandler(name);
        return await handler.runTool(args, oauth2Client);
    } catch (error: unknown) {
        console.error(`Error executing tool '${name}':`, error);
        // Re-throw the error to be handled by the main server logic or error handler
        throw error;
    }
}

const handlerMap: Record<string, BaseToolHandler> = {
    "make-request": new MakeRequestHandler(),
};

function getHandler(toolName: string): BaseToolHandler {
    const handler = handlerMap[toolName];
    if (!handler) {
        throw new Error(`Unknown tool: ${toolName}`);
    }
    return handler;
}
