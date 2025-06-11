import { OAuth2Client } from "google-auth-library";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseToolHandler } from "./BaseToolHandler.js";
import { CourseInputSchema } from "../../schemas/validators.js";
import { RequestEnvelope, RequestProcessor } from "../../GenericRequestProcessor.js";
import { google, calendar_v3 } from "googleapis";


import { z } from "zod";
import {
  addDays,
  eachDayOfInterval,
  isAfter,
  isBefore,
  parseISO,
  isSameDay,
} from "date-fns";

type CourseInput = z.infer<typeof CourseInputSchema>;
const DAY_MAP: Record<string, number> = {
    M: 1,
    T: 2,
    W: 3,
    R: 4,
    F: 5,
    S: 6,
    U: 0,
  };
  
  function parseTimeHHMM(time: string): { hours: number; minutes: number } {
    const [h, m] = time.split(":").map((n) => Number(n));
    return { hours: h, minutes: m };
  }
  
  function isHoliday(date: Date, holidays: { date: string }[]): boolean {
    return holidays.some((h) => isSameDay(date, parseISO(h.date)));
  }

  
export class CreateCourseScheduleHandler extends BaseToolHandler {
    async runTool(
      args: any,
      auth: OAuth2Client
    ): Promise<CallToolResult> {
      const input = CourseInputSchema.parse(args) as CourseInput;
  
      const createdIds: string[] = [];
  
      /* -- 1. Build list of meeting dates ---------------------------- */
      const semesterStart = parseISO(input.semester.startDate);
      const semesterEnd = parseISO(input.semester.endDate);
  
      const patternDays = input.recurrence.pattern
        .split("")
        .map((c) => DAY_MAP[c]);
  
      const { hours: startH, minutes: startM } = parseTimeHHMM(input.startTime);
      const { hours: endH, minutes: endM } = parseTimeHHMM(input.endTime);
  
      const allDays = eachDayOfInterval({ start: semesterStart, end: semesterEnd });
    
  
      for (const day of allDays) {
        /* skip if not a meeting day or a holiday */
        if (!patternDays.includes(day.getDay())) continue;
        if (isHoliday(day, input.semester.holidays)) continue;
  
        const startDateTime = new Date(
          Date.UTC(
            day.getUTCFullYear(),
            day.getUTCMonth(),
            day.getUTCDate(),
            startH,
            startM
          )
        );
        const endDateTime = new Date(
          Date.UTC(
            day.getUTCFullYear(),
            day.getUTCMonth(),
            day.getUTCDate(),
            endH,
            endM
          )
        );
  
        /* –– 2. create event ------------------------- */
        const createCourseMeeting: RequestEnvelope = {
            verb: "INSERT",                                
            endpoint: "google.calendar.events",  
            auth: auth,         
            payload: {
              calendarId: "primary",
              requestBody: {
                summary:       `${input.courseCode} – ${input.courseName} (${input.courseType})`,
                location:      `${input.location.building} ${input.location.roomNumber}`,
                description:   `Instructor: ${input.instructor.name} <${input.instructor.email}>`,
                start: { dateTime: startDateTime.toISOString(), timeZone: input.timeZone },
                end:   { dateTime: endDateTime.toISOString(),   timeZone: input.timeZone },
                extendedProperties: {
                  private: {
                    courseSeriesId: `${input.courseCode}-${input.semester.name}`,
                  },
                },
              },
            },
          };
        const rp   = new RequestProcessor();
        const res  = await rp.process(createCourseMeeting);

        // const res = await CalendarApi.createEvent(auth, {
        //   calendarId: "primary",
        //   requestBody: {
        //     summary: `${input.courseCode} – ${input.courseName} (${input.courseType})`,
        //     location: `${input.location.building} ${input.location.roomNumber}`,
        //     description: `Instructor: ${input.instructor.name} <${input.instructor.email}>`,
        //     start: { dateTime: startDateTime.toISOString(), timeZone:input.timeZone },
        //     end: { dateTime: endDateTime.toISOString(), timeZone:input.timeZone },
        //     extendedProperties: {
        //       private: { courseSeriesId: `${input.courseCode}-${input.semester.name}` },
        //     },
        //   },
        // });
        
        // createdIds.push(res.data.id as string);
          
      }
  
      return {
        content: [
          {
            type: "text",
            text: `✅ Created ${createdIds.length} events for ${input.courseCode}.`,
          },
        //   {
        //     type: "json",
        //     json: { eventIds: createdIds },
        //   },
        ],
      };
    }
  }