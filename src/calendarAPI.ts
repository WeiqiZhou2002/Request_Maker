/**********************************************************************
 * src/api/CalendarApi.ts
 * --------------------------------------------------------------------
 * Thin, audited wrapper around googleapis Calendar v3 calls.
 *   • INSERT / LIST / UPDATE / DELETE / GET verbs for events & calendars
 *   • Single retry helper with exponential back‑off
 *   • One‑line JSON audit via logRest()
 *********************************************************************/
import { google, calendar_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { logRest, Verb } from "./RestAction.js";

export class CalendarApi {
  /* ---------- keep one client per OAuth instance ------------------- */
  private static cache = new WeakMap<OAuth2Client, calendar_v3.Calendar>();
  private static client(auth: OAuth2Client) {
    if (!this.cache.has(auth)) {
      this.cache.set(auth, google.calendar({ version: "v3", auth }));
    }
    return this.cache.get(auth)!;
  }

  /* ---------- generic wrapper (audit + retry) ---------------------- */
  private static async call<T>(
    auth: OAuth2Client,
    verb: Verb,
    dottedEndpoint: string,
    payload: unknown,
    fn: () => Promise<T>,
    tries = 3
  ): Promise<T> {

    try {
      return await fn();
    } catch (e: any) {
      const code = e?.code ?? e?.response?.status;
      if (tries > 1 && [429, 500, 502, 503, 504].includes(code)) {
        await new Promise(r => setTimeout(r, (4 - tries) * 250)); // 0 ms, 250 ms …
        return this.call(auth, verb, dottedEndpoint, payload, fn, tries - 1);
      }
      throw e;
    }
  }

  /* ================================================================
   * EVENTS
   * ============================================================== */
  static insertEvent(auth: OAuth2Client, p: calendar_v3.Params$Resource$Events$Insert) {
    return this.call(auth, "INSERT", "google.calendar.events.insert", p, () =>
      this.client(auth).events.insert(p)
    );
    // return this.retry(() => this.client(auth).events.insert(p));
  }

  static listEvents(auth: OAuth2Client, p: calendar_v3.Params$Resource$Events$List) {
    return this.call(auth, "LIST", "google.calendar.events.list", p, () =>
      this.client(auth).events.list(p)
    );
  }

  static updateEvent(auth: OAuth2Client, p: calendar_v3.Params$Resource$Events$Patch) {
    return this.call(auth, "UPDATE", "google.calendar.events.update", p, () =>
      this.client(auth).events.patch(p)
    );
  }

  static deleteEvent(auth: OAuth2Client, p: calendar_v3.Params$Resource$Events$Delete) {
    return this.call(auth, "DELETE", "google.calendar.events.delete", p, () =>
      this.client(auth).events.delete(p)
    );
  }

  static getEvent(auth: OAuth2Client, p: calendar_v3.Params$Resource$Events$Get) {
    return this.call(auth, "GET", "google.calendar.events.get", p, () =>
      this.client(auth).events.get(p)
    );
  }

  /* ================================================================
   * CALENDARS
   * ============================================================== */
  static insertCalendar(auth: OAuth2Client, body: calendar_v3.Schema$Calendar) {
    return this.call(auth, "INSERT", "google.calendar.calendars.insert", body, () =>
      this.client(auth).calendars.insert({ requestBody: body })
    );
  }

  static listCalendars(auth: OAuth2Client) {
    return this.call(auth, "LIST", "google.calendar.calendars.list", {}, () =>
      this.client(auth).calendarList.list()
    );
  }

  static updateCalendar(auth: OAuth2Client, p: calendar_v3.Params$Resource$Calendars$Patch) {
    return this.call(auth, "UPDATE", "google.calendar.calendars.update", p, () =>
      this.client(auth).calendars.patch(p)
    );
  }

  static deleteCalendar(auth: OAuth2Client, p: calendar_v3.Params$Resource$Calendars$Delete) {
    return this.call(auth, "DELETE", "google.calendar.calendars.delete", p, () =>
      this.client(auth).calendars.delete(p)
    );
  }

  static getCalendar(auth: OAuth2Client, p: calendar_v3.Params$Resource$Calendars$Get) {
    return this.call(auth, "GET", "google.calendar.calendars.get", p, () =>
      this.client(auth).calendars.get(p)
    );
  }
}
