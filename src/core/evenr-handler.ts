import * as _ from "lodash";
export interface TEvent {
  id: string;
  callback: (...eargs) => void;
}

export class EventHandler {
  private static events: TEvent[] = [];

  static register(key, callback: (...eargs) => void) {
    const hasEventInKey = _.some(EventHandler.events, { id: key });
    if (!hasEventInKey) {
      const newEvent: TEvent = { id: key, callback };
      EventHandler.events.push(newEvent);
    }
  }

  static listen(): void {
    if (!_.isEmpty(EventHandler.events)) {
      for (const ev of EventHandler.events) {
        const fn = _.get(chrome, ev.id);
        if (!_.isNil(fn) && _.has(fn, "addListener")) {
          fn.addListener(ev.callback);
        }
        chrome.windows.onCreated;
      }
    }
  }
}
