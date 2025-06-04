export const analyzeCourseDocumentTool = {
    name: "analyze_course_document",
    description: "Get schema and instructions for analyzing a course registration document",
    inputSchema: {
      type: "object",
      properties: {
        university: {
          type: "string",
          description: "University name to help with context"
        },
        documentType: {
          type: "string",
          description: "Type of document (pdf, image, text)",
          enum: ["pdf", "image", "text"]
        }
      },
      required: ["university"]
    },
    handler: (args: any) => {
      return {
        instructions: `Please extract course information from the document and format it according to the schema below. 
        
  IMPORTANT: You must also research and include the academic calendar information for ${args.university}, including:
  - All holidays during the semester
  - All break periods (Spring Break, Thanksgiving Break, etc.)
  - The exact semester start and end dates
  
  Here's the required format:`,
        
        schema: {
          university: args.university,
          semester: {
            term: "Fall|Spring|Summer|Winter",
            year: 2024,
            startDate: "2024-09-26",  // Must research actual date
            endDate: "2024-12-13"     // Must research actual date
          },
          academicCalendar: {
            holidays: [
              {
                date: "2024-11-28",
                name: "Thanksgiving Day"
              },
              {
                date: "2024-11-29", 
                name: "Day after Thanksgiving"
              }
              // Include ALL holidays in the semester
            ],
            breaks: [
              {
                name: "Thanksgiving Break",
                startDate: "2024-11-25",
                endDate: "2024-12-01"
              }
              // Include ALL break periods
            ]
          },
          courses: [
            {
              courseCode: "CS 131",
              courseName: "Programming Languages",
              instructor: "Prof. Eggert",
              credits: 4,
              sections: [
                {
                  type: "lecture",
                  days: ["Monday", "Wednesday", "Friday"],
                  startTime: "10:00 AM",
                  endTime: "10:50 AM",
                  location: "Boelter Hall 3400"
                },
                {
                  type: "discussion",
                  days: ["Tuesday"],
                  startTime: "2:00 PM", 
                  endTime: "3:50 PM",
                  location: "Boelter Hall 2444"
                }
              ]
            }
          ]
        },
        
        extractionGuidelines: [
          "Convert day codes: M=Monday, T=Tuesday, W=Wednesday, R=Thursday, F=Friday",
          "Keep times in 12-hour format with AM/PM",
          "Include all sections (lecture, discussion, lab) as separate entries",
          "If a course has multiple meeting patterns, create separate section entries",
          `Research ${args.university}'s academic calendar for the detected semester`,
          "Include ALL holidays that fall within the semester dates",
          "Include ALL break periods (even if just one day)",
          "Ensure semester start/end dates are accurate for the specific term and year"
        ]
      };
    }
  };
  
  export const importCourseScheduleTool = {
    name: "import_course_schedule",
    description: "Import parsed course schedule data with academic calendar to Google Calendar",
    inputSchema: {
      type: "object",
      properties: {
        schedule: {
          type: "object",
          description: "Complete course schedule including academic calendar",
          properties: {
            university: { type: "string" },
            semester: {
              type: "object",
              properties: {
                term: { type: "string" },
                year: { type: "number" },
                startDate: { type: "string", format: "date" },
                endDate: { type: "string", format: "date" }
              },
              required: ["term", "year", "startDate", "endDate"]
            },
            academicCalendar: {
              type: "object",
              properties: {
                holidays: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", format: "date" },
                      name: { type: "string" }
                    },
                    required: ["date", "name"]
                  }
                },
                breaks: {
                  type: "array", 
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      startDate: { type: "string", format: "date" },
                      endDate: { type: "string", format: "date" }
                    },
                    required: ["name", "startDate", "endDate"]
                  }
                }
              },
              required: ["holidays", "breaks"]
            },
            courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  courseCode: { type: "string" },
                  courseName: { type: "string" },
                  instructor: { type: "string" },
                  credits: { type: "number" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        days: { type: "array", items: { type: "string" } },
                        startTime: { type: "string" },
                        endTime: { type: "string" },
                        location: { type: "string" }
                      },
                      required: ["type", "days", "startTime", "endTime"]
                    }
                  }
                },
                required: ["courseCode", "sections"]
              }
            }
          },
          required: ["university", "semester", "academicCalendar", "courses"]
        },
        calendarId: {
          type: "string",
          description: "Google Calendar ID (default: 'primary')",
          default: "primary"
        },
        options: {
          type: "object",
          properties: {
            skipHolidays: {
              type: "boolean",
              description: "Skip creating events on holidays",
              default: true
            },
            skipBreaks: {
              type: "boolean", 
              description: "Skip creating events during break periods",
              default: true
            },
            addReminders: {
              type: "boolean",
              description: "Add default reminders to events",
              default: true
            },
            reminderMinutes: {
              type: "array",
              description: "Reminder times in minutes before event",
              items: { type: "number" },
              default: [15, 1440] // 15 min and 24 hours
            },
            colorByType: {
              type: "boolean",
              description: "Color code events by section type",
              default: true
            },
            colorMap: {
              type: "object",
              description: "Custom color mapping for section types",
              properties: {
                lecture: { type: "string" },
                discussion: { type: "string" },
                lab: { type: "string" },
                seminar: { type: "string" }
              }
            }
          }
        }
      },
      required: ["schedule"]
    }
  };