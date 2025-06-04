import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export class GoogleCalendarClient {
  private oauth2Client: OAuth2Client;
  private calendar: any;
  private tokensPath = join(process.cwd(), ".gcp-saved-tokens.json");
  private credentialsPath = join(process.cwd(), "gcp-oauth.keys.json");

  constructor() {
    this.oauth2Client = new OAuth2Client();
  }

  async authenticate() {
    try {
      // Load credentials
      const credentials = JSON.parse(await readFile(this.credentialsPath, "utf8"));
      const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
      
      this.oauth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
      
      // Load saved tokens
      const tokens = JSON.parse(await readFile(this.tokensPath, "utf8"));
      this.oauth2Client.setCredentials(tokens);
      
      // Refresh if needed
      if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
        const { credentials: newTokens } = await this.oauth2Client.refreshAccessToken();
        await writeFile(this.tokensPath, JSON.stringify(newTokens, null, 2));
        this.oauth2Client.setCredentials(newTokens);
      }
      
      this.calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}. Run 'npm run auth' first.`);
    }
  }

  async createEvent(calendarId: string, event: any) {
    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: event
    });
    
    return response.data;
  }
}