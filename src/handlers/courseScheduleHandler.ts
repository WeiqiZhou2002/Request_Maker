import { CourseScheduleInput } from "../types/course";
import { GoogleCalendarClient } from "../services/googleCalendarClient.js";
import { EventBuilder } from "../services/eventBuilder.js";

export class CourseScheduleHandler {
  private calendarClient: GoogleCalendarClient;
  private eventBuilder: EventBuilder;

  constructor() {
    this.calendarClient = new GoogleCalendarClient();
    this.eventBuilder = new EventBuilder();
  }

  async importSchedule(
    schedule: CourseScheduleInput,
    calendarId: string = "primary",
    options: any = {}
  ) {
    await this.calendarClient.authenticate();
    
    const results = {
      success: true,
      semester: `${schedule.semester.term} ${schedule.semester.year}`,
      coursesProcessed: 0,
      eventsCreated: 0,
      eventsSkipped: 0,
      errors: [] as any[],
      summary: [] as any[]
    };

    try {
      // Process each course
      for (const course of schedule.courses) {
        results.coursesProcessed++;
        
        for (const section of course.sections) {
          try {
            // Build calendar event with holidays/breaks from the provided calendar
            const event = this.eventBuilder.buildCourseEvent({
              course,
              section,
              semester: schedule.semester,
              academicCalendar: schedule.academicCalendar,
              university: schedule.university,
              options
            });

            // Create event in Google Calendar
            const created = await this.calendarClient.createEvent(calendarId, event);
            
            results.eventsCreated++;
            results.summary.push({
              course: course.courseCode,
              type: section.type,
              schedule: `${section.days.join(",")} ${section.startTime}-${section.endTime}`,
              location: section.location || "TBD",
              eventId: created.id
            });
          } catch (error: any) {
            results.errors.push({
              course: course.courseCode,
              section: section.type,
              error: error.message
            });
          }
        }
      }

      // Add summary of excluded dates
      if (options.skipHolidays || options.skipBreaks) {
        const excludedCount = this.countExcludedDates(
          schedule.academicCalendar,
          options
        );
        results.eventsSkipped = excludedCount;
      }

      return results;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        partialResults: results
      };
    }
  }

  private countExcludedDates(academicCalendar: any, options: any): number {
    let count = 0;
    
    if (options.skipHolidays) {
      count += academicCalendar.holidays.length;
    }
    
    if (options.skipBreaks) {
      academicCalendar.breaks.forEach((breakPeriod: any) => {
        const start = new Date(breakPeriod.startDate);
        const end = new Date(breakPeriod.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        count += days;
      });
    }
    
    return count;
  }
}
