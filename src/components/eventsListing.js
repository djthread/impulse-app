import {customElement, bindable} from "aurelia-framework";

@customElement("events-listing")
export class EventsListing {
  @bindable events;
  @bindable showbtns;
  @bindable limit;

  constructor() {
    if (this.limit && this.events.length > this.limit) {
      this.events = this.events.slice(0, this.limit);
    }
  }
}
