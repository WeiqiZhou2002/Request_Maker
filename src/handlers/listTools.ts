import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Extracted reminder properties definition for reusability
const remindersInputProperty = {
    type: "object",
    description: "Reminder settings for the event",
    properties: {
      useDefault: {
        type: "boolean",
        description: "Whether to use the default reminders",
      },
      overrides: {
        type: "array",
        description: "Custom reminders (uses popup notifications by default unless email is specified)",
        items: {
          type: "object",
          properties: {
            method: {
              type: "string",
              enum: ["email", "popup"],
              description: "Reminder method (defaults to popup unless email is specified)",
              default: "popup"
            },
            minutes: {
              type: "number",
              description: "Minutes before the event to trigger the reminder",
            }
          },
          required: ["minutes"]
        }
      }
    },
    required: ["useDefault"]
};

export function getToolDefinitions() {
  return {
    tools: [
      {
        name: "list-calendars",
        description: "List all available calendars",
        inputSchema: {
          type: "object",
          properties: {}, // No arguments needed
          required: [],
        },
      },
      {
        name: "list-colors",
        description: "List available color IDs and their meanings for calendar events",
        inputSchema: {
          type: "object",
          properties: {}, // No arguments needed
          required: [],
        },
      },
      {
        name: "create-event",
        description: "Create a new calendar event",
        inputSchema: {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar to create the event in (use 'primary' for the main calendar)",
            },
            summary: {
              type: "string",
              description: "Title of the event",
            },
            description: {
              type: "string",
              description: "Description/notes for the event (optional)",
            },
            start: {
              type: "string",
              format: "date-time",
              description: "Start time in ISO format with timezone required (e.g., 2024-08-15T10:00:00Z or 2024-08-15T10:00:00-07:00). Date-time must end with Z (UTC) or +/-HH:MM offset.",
            },
            end: {
              type: "string",
              format: "date-time",
              description: "End time in ISO format with timezone required (e.g., 2024-08-15T11:00:00Z or 2024-08-15T11:00:00-07:00). Date-time must end with Z (UTC) or +/-HH:MM offset.",
            },
            timeZone: {
              type: "string",
              description:
                "Timezone of the event start/end times, formatted as an IANA Time Zone Database name (e.g., America/Los_Angeles). Required if start/end times are specified, especially for recurring events.",
            },
            location: {
              type: "string",
              description: "Location of the event (optional)",
            },
            attendees: {
              type: "array",
              description: "List of attendee email addresses (optional)",
              items: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email address of the attendee",
                  },
                },
                required: ["email"],
              },
            },
            colorId: {
              type: "string",
              description: "Color ID for the event (optional, use list-colors to see available IDs)",
            },
            reminders: remindersInputProperty,
            recurrence: {
              type: "array",
              description:
                "List of recurrence rules (RRULE, EXRULE, RDATE, EXDATE) in RFC5545 format (optional). Example: [\"RRULE:FREQ=WEEKLY;COUNT=5\"]",
              items: {
                type: "string"
              }
            },
          },
          required: ["calendarId", "summary", "start", "end", "timeZone"],
        },
      },
      {
        name: "delete-event",
        description: "Delete a calendar event",
        inputSchema: {
          type: "object",
          properties: {
            calendarId: {
              type: "string",
              description: "ID of the calendar containing the event",
            },
            eventId: {
              type: "string",
              description: "ID of the event to delete",
            },
          },
          required: ["calendarId", "eventId"],
        },
      },
    ],
  };
} 