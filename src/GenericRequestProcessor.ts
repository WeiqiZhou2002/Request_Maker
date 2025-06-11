
import { OAuth2Client } from "google-auth-library";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";         
import { URLSearchParams } from "url";
import { CalendarApi } from "./calendarAPI.js";
import { Verb, logRest } from "./RestAction.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";



export interface RequestEnvelope {
  verb: Verb;
  auth: OAuth2Client;
  endpoint: string;
  payload: any;
}

export class RequestProcessor {

  async process(r: RequestEnvelope) {
    const verb = r.verb.toUpperCase() as Verb;
    const dotted = r.endpoint;
    if (!dotted.startsWith("google.calendar.")) {
      throw new Error(`Endpoint '${dotted}' not supported (expect 'google.calendar.*').`);
    }

    const [, , resource] = r.endpoint.split(".") as ["google","calendar","events"|"calendars"];
    const resolved = this.dispatchGoogle(resource, r.verb, r.auth, r.payload);

    logRest({
        ts: new Date().toISOString(),
        verb: verb,
        endpoint: r.endpoint,
        payload: r.payload,
      });
  
      return resolved.promise;  

  }

  private dispatchGoogle(resource: "events" | "calendars", verb: Verb, auth: OAuth2Client, p:any) {
    switch (resource) {
      case "events":
        switch (verb) {
          case "INSERT": return { dotted: "google.calendar.events.insert",
                                  promise: CalendarApi.insertEvent(auth, p) };
          case "LIST":   return { dotted: "google.calendar.events.list",
                                  promise: CalendarApi.listEvents(auth, p) };
          case "UPDATE": return { dotted: "google.calendar.events.update",
                                  promise: CalendarApi.updateEvent(auth, p) };
          case "DELETE": return { dotted: "google.calendar.events.delete",
                                  promise: CalendarApi.deleteEvent(auth, p) };
          case "GET":    return { dotted: "google.calendar.events.get",
                                  promise: CalendarApi.getEvent(auth, p) };
        }
        break;
      case "calendars":
        switch (verb) {
          case "INSERT": return { dotted: "google.calendar.calendars.insert",
                                  promise: CalendarApi.insertCalendar(auth, p) };
          case "LIST":   return { dotted: "google.calendar.calendars.list",
                                  promise: CalendarApi.listCalendars(auth) };
          case "UPDATE": return { dotted: "google.calendar.calendars.update",
                                  promise: CalendarApi.updateCalendar(auth, p) };
          case "DELETE": return { dotted: "google.calendar.calendars.delete",
                                  promise: CalendarApi.deleteCalendar(auth, p) };
          case "GET":    return { dotted: "google.calendar.calendars.get",
                                  promise: CalendarApi.getCalendar(auth, p) };
        }
    }
    throw new Error(`Verb '${verb}' not supported for resource '${resource}'.`);
  }
}


