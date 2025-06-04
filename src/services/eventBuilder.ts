import { RRule } from "rrule";

export class EventBuilder {
  private defaultColorMap: { [key: string]: string } = {
    lecture: "9",      // Blue
    discussion: "11",  // Red  
    lab: "10",        // Green
    seminar: "5",     // Yellow
    other: "8"        // Gray
  };

  buildCourseEvent(params: any) {
    const { course, section, semester, academicCalendar, university, options } = params;

    // Build summary
    const summary = `${course.courseCode} - ${this.formatType(section.type)}`;

    // Build comprehensive description
    const description = this.buildDescription(course, section);

    // Calculate first occurrence
    const firstDate = this.findFirstOccurrence(
      new Date(semester.startDate),
      section.days[0]
    );

    // Build datetime strings
    const startDateTime = this.buildDateTime(firstDate, section.startTime);
    const endDateTime = this.buildDateTime(firstDate, section.endTime);

    // Build recurrence rule with exclusions
    const recurrence = this.buildRecurrenceWithExclusions(
      section.days,
      semester.endDate,
      academicCalendar,
      options
    );

    // Build event
    const event: any = {
      summary,
      description,
      location: section.location || section.room || "TBD",
      start: {
        dateTime: startDateTime,
        timeZone: this.getTimezone(university)
      },
      end: {
        dateTime: endDateTime,
        timeZone: this.getTimezone(university)
      },
      recurrence: [recurrence]
    };

    // Apply color coding
    if (options?.colorByType !== false) {
      const colorMap = options?.colorMap || this.defaultColorMap;
      event.colorId = colorMap[section.type] || this.defaultColorMap.other;
    }

    // Add reminders
    if (options?.addReminders !== false) {
      const reminderMinutes = options?.reminderMinutes || [15, 1440];
      event.reminders = {
        useDefault: false,
        overrides: reminderMinutes.map((minutes: number) => ({
          method: minutes >= 1440 ? "email" : "popup",
          minutes
        }))
      };
    }

    return event;
  }

  private buildDescription(course: any, section: any): string {
    const parts = [
      `Course: ${course.courseCode}`,
      course.courseName && `Title: ${course.courseName}`,
      course.instructor && `Instructor: ${course.instructor}`,
      course.credits && `Credits: ${course.credits}`,
      `Type: ${this.formatType(section.type)}`,
      `Schedule: ${section.days.join(", ")} ${section.startTime}-${section.endTime}`
    ].filter(Boolean);

    return parts.join("\n");
  }

  private formatType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  private findFirstOccurrence(startDate: Date, dayName: string): Date {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDay = days.indexOf(dayName);
    const date = new Date(startDate);
    
    while (date.getDay() !== targetDay) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  private buildDateTime(date: Date, timeStr: string): string {
    const [time, period] = timeStr.split(/\s+/);
    const [hours, minutes] = time.split(":").map(Number);
    
    let hour = hours;
    if (period === "PM" && hours !== 12) hour += 12;
    if (period === "AM" && hours === 12) hour = 0;
    
    const dateTime = new Date(date);
    dateTime.setHours(hour, minutes || 0, 0, 0);
    
    return dateTime.toISOString();
  }

  private buildRecurrenceWithExclusions(
    days: string[], 
    endDate: string,
    academicCalendar: any,
    options: any
  ): string {
    const dayMap: { [key: string]: any } = {
      Monday: RRule.MO,
      Tuesday: RRule.TU,
      Wednesday: RRule.WE,
      Thursday: RRule.TH,
      Friday: RRule.FR,
      Saturday: RRule.SA,
      Sunday: RRule.SU
    };

    const byweekday = days.map(d => dayMap[d]).filter(Boolean);

    const rule = new RRule({
      freq: RRule.WEEKLY,
      until: new Date(endDate),
      byweekday
    });

    let rruleStr = rule.toString();

    // Add EXDATE for holidays and breaks if requested
    const excludeDates: Date[] = [];

    if (options?.skipHolidays !== false && academicCalendar.holidays) {
      academicCalendar.holidays.forEach((holiday: any) => {
        excludeDates.push(new Date(holiday.date));
      });
    }

    if (options?.skipBreaks !== false && academicCalendar.breaks) {
      academicCalendar.breaks.forEach((breakPeriod: any) => {
        const start = new Date(breakPeriod.startDate);
        const end = new Date(breakPeriod.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          excludeDates.push(new Date(d));
        }
      });
    }

    if (excludeDates.length > 0) {
      const exdateStr = excludeDates
        .map(date => {
          // Format as YYYYMMDD for all-day exclusion
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        })
        .join(',');
      
      rruleStr += `\nEXDATE;VALUE=DATE:${exdateStr}`;
    }

    return rruleStr;
  }

  private getTimezone(university: string): string {
    // Common US university timezones
    const timezones: { [key: string]: string } = {
      // West Coast
      UCLA: "America/Los_Angeles",
      USC: "America/Los_Angeles",
      Berkeley: "America/Los_Angeles",
      Stanford: "America/Los_Angeles",
      UCSD: "America/Los_Angeles",
      
      // East Coast
      Harvard: "America/New_York",
      MIT: "America/New_York",
      Columbia: "America/New_York",
      NYU: "America/New_York",
      Yale: "America/New_York",
      
      // Central
      "UT Austin": "America/Chicago",
      "UChicago": "America/Chicago",
      Northwestern: "America/Chicago",
      
      // Mountain
      "CU Boulder": "America/Denver",
      "Arizona State": "America/Phoenix"
    };
    
    return timezones[university] || "America/Los_Angeles";
  }
}