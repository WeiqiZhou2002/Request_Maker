export class AcademicCalendarService {
    async getAcademicCalendar(university: string, term: string, year: number) {
      // Pre-configured calendar data
      const calendars: any = {
        UCLA: {
          Fall: {
            holidays: [
              { date: "2024-11-11", name: "Veterans Day" },
              { date: "2024-11-28", name: "Thanksgiving Day" },
              { date: "2024-11-29", name: "Day after Thanksgiving" }
            ],
            breaks: [
              {
                name: "Thanksgiving Break",
                startDate: "2024-11-25",
                endDate: "2024-12-01"
              }
            ]
          }
        },
        USC: {
          Fall: {
            holidays: [
              { date: "2024-09-02", name: "Labor Day" },
              { date: "2024-11-28", name: "Thanksgiving Day" },
              { date: "2024-11-29", name: "Day after Thanksgiving" }
            ],
            breaks: [
              {
                name: "Thanksgiving Break",
                startDate: "2024-11-27",
                endDate: "2024-12-01"
              }
            ]
          }
        }
      };
  
      return calendars[university]?.[term] || { holidays: [], breaks: [] };
    }
  }
  