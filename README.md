# Request Maker MCP Server

**Request Maker** is a Model Context Protocol (MCP) server that provides seamless integration with Google Calendar. It allows LLMs and other clients to read, create, update, and search calendar events through a standardized interface, supporting both simple queries and complex, multi-step workflows.

## Features

- **Event Management**: Create, read, update, and delete events using Google Calendar API.
- **Image-Based Event Creation**: Attach PNG, JPEG, or GIF images containing event details (date, time, location, description) and automatically convert them into calendar events.
- **Advanced Queries**: 
  - Identify routine vs. ad-hoc events.
  - Check attendee responses for upcoming events.
  - Auto-coordinate across multiple calendars to find mutually available times.
- **Policy Configuration**: Enforce read/write/delete permissions and time-window restrictions via a hot-reloadable `policy.yml`.
- **OAuth 2.0 Authentication**: Built-in Google OAuth flow with automatic token refresh and manual re-authentication commands.
- **Extensible & Configurable**: Easily whitelist calendars, adjust action limits, and integrate with clients like Claude Desktop.

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/WeiqiZhou2002/Request_Maker.git
   cd Request_Maker
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up Google OAuth credentials**
   - Download your OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Rename to `gcp-oauth.keys.json` and place in the project root.
4. **Configure Policy (optional)**
   - Edit `src/config/policy.yml` or set `MCP_POLICY_FILE` to customize calendar access policies.
5. **Authenticate**
   ```bash
   npm run auth
   ```
6. **Start the server**
   ```bash
   npm start
   ```

## Policy Configuration (`policy.yml`)

The policy file controls which calendars to access and enforces limits:

```yaml
timezone: America/Chicago

actions:
  read:
    enabled: true
    max_future_days: 3
  write:
    enabled: true
    max_future_days: 7
  delete:
    enabled: false

calendars:
  whitelist:
    - primary
    - personal_projects@group.calendar.google.com
```

- **Hot-reload**: Changes to `policy.yml` take effect immediately without restarting.

## Available Scripts

- `npm run build` – Compile TypeScript sources.
- `npm run typecheck` – Run TypeScript checks.
- `npm run start` – Launch the MCP server.
- `npm run auth` – Trigger OAuth authentication flow.
- `npm test` – Run unit and integration tests (using Vitest).
- `npm run test:watch` – Watch mode for tests.
- `npm run coverage` – Generate test coverage report.

## Authentication Flows

- **Automatic**: On server start, uses saved tokens in `.gcp-saved-tokens.json`, or opens browser for consent.
- **Manual**: `npm run auth` to launch the browser-based consent flow independently.

Tokens expire after 7 days in testing mode; refresh using the above commands.

## Testing

Unit and integration tests are implemented with [Vitest](https://vitest.dev/). External dependencies (Google API, filesystem) are mocked for isolated testing.

## Development & Debugging

1. **Debug mode**:
   ```bash
   npx @modelcontextprotocol/inspector node --inspect build/index.js
   ```
2. **Attach debugger**:
   - Open `chrome://inspect` in Chrome.
   - Configure to `localhost:9229` and click **inspect**.

## Contribution

Contributions are welcome! Please review the [Architecture Overview](docs/architecture.md) before submitting pull requests.

## License

This project is licensed under the MIT License.
