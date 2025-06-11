import { z } from 'zod';

// Zod schemas for input validation

export const ReminderSchema = z.object({
  method: z.enum(['email', 'popup']).default('popup'),
  minutes: z.number(),
});

export const RemindersSchema = z.object({
  useDefault: z.boolean(),
  overrides: z.array(ReminderSchema).optional(),
});

// ISO datetime regex that requires timezone designator (Z or +/-HH:MM)
const isoDateTimeWithTimezone = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

export const ListEventsArgumentsSchema = z.object({
  calendarId: z.string(),
  timeMin: z.string()
    .regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-01-01T00:00:00Z)")
    .optional(),
  timeMax: z.string()
    .regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-12-31T23:59:59Z)")
    .optional(),
});

export const SearchEventsArgumentsSchema = z.object({
  calendarId: z.string(),
  query: z.string(),
  timeMin: z.string()
    .regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-01-01T00:00:00Z)")
    .optional(), 
  timeMax: z.string()
    .regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-12-31T23:59:59Z)")
    .optional(),
});

export const CreateEventArgumentsSchema = z.object({
  calendarId: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.string().regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-01-01T00:00:00Z)"), 
  end: z.string().regex(isoDateTimeWithTimezone, "Must be ISO format with timezone (e.g., 2024-01-01T00:00:00Z)"),
  timeZone: z.string(),
  attendees: z
    .array(
      z.object({
        email: z.string(),
      })
    )
    .optional(),
  location: z.string().optional(),
  colorId: z.string().optional(),
  reminders: RemindersSchema.optional(),
  recurrence: z.array(z.string()).optional(),
});

const RecurrenceSchema = z.object({
  /* e.g. "MWF", "TR", "SU" – any subset of MTWRFSU */
  pattern: z
    .string()
    .regex(/^[MTWRFSU]+$/, "pattern must be combination of MTWRFSU letters"),
});


export const CourseInputSchema = z.object({
  courseName: z.string(),
  courseCode: z.string(),
  courseType: z.string(), // lecture / lab / etc.
  startTime: z.string().regex(/^\d{2}:\d{2}$/), // "14:00"
  endTime: z.string().regex(/^\d{2}:\d{2}$/), // "15:30"
  timeZone:  z.string(),
  recurrence: RecurrenceSchema,
  location: z.object({
    building: z.string(),
    roomNumber: z.string(),
    coordinates: z
      .object({ latitude: z.number(), longitude: z.number() })
      .optional(),
  }),
  instructor: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  semester: z.object({
    name: z.string(),
    startDate: z.string(), // ISO date‑times
    endDate: z.string(),
    holidays: z
      .array(z.object({ date: z.string(), name: z.string() }))
      .default([]),
  }),
});


export const DeleteEventArgumentsSchema = z.object({
  calendarId: z.string(),
  eventId: z.string(),
}); 