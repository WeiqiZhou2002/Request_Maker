import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { OAuth2Client } from "google-auth-library";
import { CreateEventArgumentsSchema } from "../../schemas/validators.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { calendar_v3, google } from 'googleapis';
import { z } from 'zod';
import { CalendarApi } from "../../calendarAPI.js"
import { RequestEnvelope, RequestProcessor } from "../../GenericRequestProcessor.js";

export class CreateEventHandler extends BaseToolHandler {
    async runTool(args: any, auth: OAuth2Client): Promise<CallToolResult> {
      // const res = await CalendarApi.createEvent(auth, {
      //   calendarId: "primary",
      //   requestBody: {
      //       summary: args.summary,
      //       description: args.description,
      //       start: { dateTime: args.start, timeZone: args.timeZone },
      //       end: { dateTime: args.end, timeZone: args.timeZone },
      //       attendees: args.attendees,
      //       location: args.location,
      //       colorId: args.colorId,
      //       reminders: args.reminders,
      //       recurrence: args.recurrence,
      //   },
      // });
      // const event = res.data;
      
      const envelope: RequestEnvelope = {
        verb: "INSERT",
        endpoint: "google.calendar.events", 
        auth,                               
        payload: {
          calendarId: "primary",
          requestBody: {
            summary:     args.summary,
            description: args.description,
            start:       { dateTime: args.start, timeZone: args.timeZone },
            end:         { dateTime: args.end,   timeZone: args.timeZone },
            attendees:   args.attendees,
            location:    args.location,
            colorId:     args.colorId,
            reminders:   args.reminders,
            recurrence:  args.recurrence,
          },
        },
      };
      // const rp   = new RequestProcessor();
      // const res  = await rp.process(envelope);
      const envelopeString = JSON.stringify(envelope);
      return {
                    content: [
                      {
                        type: "text",
                        text: "please show this request to user natively, including the verb, endpoint, and even payload, and ask for permission to make this request to the server. Additionally, explain a bit to user what this request does. After getting approved, pass this json format request to another mcp server to make the real request"
                      },
                      {
                        type: "text",
                        text: envelopeString
                      },
                  ],
                };
    }
  }

// export class CreateEventHandler extends BaseToolHandler {
//     async runTool(args: any, oauth2Client: OAuth2Client): Promise<CallToolResult> {
//         const validArgs = CreateEventArgumentsSchema.parse(args);
//         const event = await this.createEvent(oauth2Client, validArgs);
//         return {
//             content: [{
//                 type: "text",
//                 text: `Event created: ${event.summary} (${event.id})`,
//             }],
//         };
//     }

//     private async createEvent(
//         client: OAuth2Client,
//         args: z.infer<typeof CreateEventArgumentsSchema>
//     ): Promise<calendar_v3.Schema$Event> {
//         try {
//             const calendar = this.getCalendar(client);
//             const requestBody: calendar_v3.Schema$Event = {
//                 summary: args.summary,
//                 description: args.description,
//                 start: { dateTime: args.start, timeZone: args.timeZone },
//                 end: { dateTime: args.end, timeZone: args.timeZone },
//                 attendees: args.attendees,
//                 location: args.location,
//                 colorId: args.colorId,
//                 reminders: args.reminders,
//                 recurrence: args.recurrence,
//             };
//             const response = await calendar.events.insert({
//                 calendarId: args.calendarId,
//                 requestBody: requestBody,
//             });
//             if (!response.data) throw new Error('Failed to create event, no data returned');
//             return response.data;
//         } catch (error) {
//             throw this.handleGoogleApiError(error);
//         }
//     }
// }
