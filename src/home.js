import {State} from "./state";
import {inject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {Cookie} from "aurelia-cookie";

@inject(State, EventAggregator)
export class Live {
  constructor(state, eventAggregator) {
    this.state = state;
  }
}
