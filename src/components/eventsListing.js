import {customElement, bindable} from "aurelia-framework";

@customElement("events-listing")
export class EventsListing {
  @bindable events;
  @bindable showslug;
}
