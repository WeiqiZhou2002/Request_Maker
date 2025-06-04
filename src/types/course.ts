export interface CourseScheduleInput {
    university: string;
    semester: {
      term: string;      // "Fall", "Spring", "Summer", "Winter"
      year: number;
      startDate: string; // ISO date string
      endDate: string;   // ISO date string
    };
    academicCalendar: {
      holidays: Array<{
        date: string;    // ISO date string
        name: string;    // "Thanksgiving", "Labor Day", etc.
      }>;
      breaks: Array<{
        name: string;    // "Spring Break", "Thanksgiving Break"
        startDate: string;
        endDate: string;
      }>;
    };
    courses: CourseInput[];
  }
  
  export interface CourseInput {
    courseCode: string;      // e.g., "CS 131"
    courseName?: string;     // e.g., "Programming Languages"
    instructor?: string;     // e.g., "Prof. Smith"
    credits?: number;        // e.g., 4
    sections: SectionInput[];
  }
  
  export interface SectionInput {
    type: "lecture" | "discussion" | "lab" | "seminar" | "other";
    days: string[];          // ["Monday", "Wednesday", "Friday"]
    startTime: string;       // "10:00 AM" or "14:00"
    endTime: string;         // "11:50 AM" or "15:50"
    location?: string;       // "Boelter Hall 3400"
    room?: string;          // For more specific location info
  }
  