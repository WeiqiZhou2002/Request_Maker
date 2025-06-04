# Course Schedule MCP Server

An intelligent MCP (Model Context Protocol) server that automatically imports course schedules from registration PDFs into Google Calendar with full support for academic calendars, building locations, and holiday schedules.

## Features

### 🎓 Smart Course Extraction
- Automatically extracts course information from registration PDFs
- Recognizes course numbers, times, days, locations, and instructors
- Supports multiple university PDF formats

### 📅 Academic Calendar Integration
- Fetches official university academic calendars
- Automatically excludes holidays and break periods
- Supports different semester systems (quarters, semesters)

### 📍 Location Intelligence
- Geocodes classroom locations to physical addresses
- Adds Google Maps links to event descriptions
- Resolves building abbreviations to full names
- Caches location data for performance

### 🔄 Recurring Events
- Creates properly formatted recurring calendar events
- Handles different class meeting patterns (MWF, TR, etc.)
- Supports labs and discussion sections
- Excludes holidays and breaks automatically

## Installation

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with Calendar API enabled
- OAuth 2.0 credentials (Desktop application type)
- (Optional) Google Maps API key for geocoding

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/WeiqiZhou2002/course_calendar.git
cd course-schedule-mcp
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create or select a project
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Desktop app type)
   - Download credentials and save as `gcp-oauth.keys.json`

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. **Build the project**
```bash
npm run build
```

6. **Authenticate with Google**
```bash
npm run auth
```

7. **Configure Claude Desktop**
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "course-schedule": {
      "command": "node",
      "args": ["/absolute/path/to/course-schedule-mcp/build/index.js"]
    }
  }
}
```

## Usage

### Basic Commands

#### Import Course Schedule
```
Import my course schedule from the PDF at /path/to/registration.pdf for UCLA
```

#### Preview Before Import
```
Preview the courses found in my registration PDF for USC
```

#### Update Course Location
```
Update the location for CS 131 to Engineering VI 289
```

### Example Workflow

1. **Upload your registration PDF** to Claude Desktop

2. **Preview the extracted information**:
   ```
   Can you preview the courses in my registration PDF for UCLA?
   ```
   
   This will show:
   - Extracted courses with times and locations
   - Detected semester dates
   - Academic holidays and breaks
   - Any parsing issues

3. **Import to calendar**:
   ```
   Please import my course schedule to Google Calendar
   ```
   
   The server will:
   - Create recurring events for each course
   - Add location details with map links
   - Set up reminders
   - Exclude holidays and breaks

4. **Fix any issues**:
   ```
   The location for MATH 131A should be MS 4000A, can you update it?
   ```

### Advanced Features

#### Custom Color Coding
```
Import my schedule with lectures in blue, labs in green, and discussions in red
```

#### Specific Calendar
```
Import my courses to my "School" calendar instead of primary
```

#### Exclude Certain Courses
```
Import all courses except for the PE classes
```

## Supported Universities

The server comes pre-configured with support for:

- **UCLA** - University of California, Los Angeles
- **USC** - University of Southern California  
- **UC Berkeley** - University of California, Berkeley
- **Stanford** - Stanford University

### Adding a New University

1. Add university configuration to `src/config/universities.yml`:
```yaml
YourUniversity:
  full_name: "Your University Name"
  academic_calendar_url: "https://..."
  timezone: "America/New_York"
  semester_patterns:
    fall:
      typical_start: "late August"
      typical_end: "mid December"
```

2. Add building mappings for common abbreviations
3. Test with a sample PDF

## PDF Format Requirements

The PDF parser looks for common patterns in registration documents:

### Required Information
- **Course Number**: e.g., "CS 131", "MATH 32A"
- **Meeting Days**: e.g., "MWF", "TR"
- **Meeting Times**: e.g., "10:00 AM - 11:50 AM"

### Optional Information
- **Location**: e.g., "BOELTER 3400"
- **Instructor**: e.g., "Smith, John"
- **Units/Credits**: e.g., "4 units"
- **Course Title**: e.g., "Programming Languages"

### Example PDF Content
```
COMPUTER SCI 131 - Programming Languages (4 units)
Lecture: MWF 10:00 AM - 10:50 AM in BOELTER 3400
Discussion 1A: T 2:00 PM - 3:50 PM in BOELTER 2444
Instructor: Eggert, P.R.
```

## Configuration

### Policy Configuration (`src/config/policy.yml`)

Control server behavior with fine-grained policies:

```yaml
actions:
  import:
    enabled: true
    max_courses_per_import: 20
    
events:
  max_future_days: 365
  default_reminders:
    - method: "popup"
      minutes: 15
```

### University Configuration

Customize parsing patterns and calendar behavior per university:

```yaml
university_policies:
  UCLA:
    require_location: true
    default_event_duration_minutes: 50
```

## Troubleshooting

### Common Issues

#### PDF Parsing Issues
- **No courses found**: Check if PDF is text-based (not scanned image)
- **Missing information**: Ensure PDF follows expected format
- **Wrong semester detected**: Manually specify in the import command

#### Location Issues
- **Location not found**: Building might not be in geocoding database
- **Wrong location**: Use the update_location tool to correct
- **No map link**: Ensure GOOGLE_MAPS_API_KEY is set

#### Calendar Issues
- **Events not created**: Check OAuth authentication is valid
- **Wrong timezone**: Update timezone in university config
- **Holidays not excluded**: Verify academic calendar URL is correct

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm start
```

View logs in `course-schedule-mcp.log`

## Development

### Project Structure
```
course-schedule-mcp/
├── src/
│   ├── index.ts              # Main server entry
│   ├── parsers/              # PDF parsing logic
│   ├── services/             # Calendar, geocoding services
│   ├── tools/                # MCP tool definitions
│   ├── config/               # Configuration files
│   └── types/                # TypeScript types
├── tests/                    # Test suites
├── examples/                 # Sample PDFs
└── docs/                     # Additional documentation
```

### Running Tests
```bash
npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run coverage             # Coverage report
```

### Adding Features

1. **New PDF Format**: Add patterns to `pdfParser.ts`
2. **New University**: Update `universities.yml`
3. **New Tool**: Add to `src/tools/` and register in `index.ts`

## Security & Privacy

- **OAuth tokens** are stored locally in `.gcp-saved-tokens.json`
- **No data is sent** to external servers except Google APIs
- **PDF content** is processed locally and not stored
- **Location cache** is kept in memory only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built on top of:
- [Google Calendar MCP Server](https://github.com/WeiqiZhou2002/google-calendar-mcp) by WeiqiZhou2002
- Anthropic's MCP SDK
- Google Calendar API

## Support

For issues and questions:
- Check [existing issues](https://github.com/yourusername/course-schedule-mcp/issues)
- Review debug logs
- Create a new issue with:
  - University name
  - Sample PDF structure (anonymized)
  - Error messages
  - Debug logs

---

## Quick Start Example

```bash
# 1. Install and build
npm install && npm run build

# 2. Authenticate
npm run auth

# 3. Start server
npm start

# 4. In Claude Desktop:
# "Import my UCLA course schedule from ~/Downloads/registration.pdf"
```

The server will:
✅ Extract 5 courses from your PDF  
✅ Find Fall 2024 semester dates (Sep 26 - Dec 13)  
✅ Skip Thanksgiving break (Nov 25-29)  
✅ Add building locations with maps  
✅ Create recurring calendar events  
✅ Set up email and popup reminders  

Your courses are now in Google Calendar! 🎉