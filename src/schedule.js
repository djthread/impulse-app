import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Schedule {
  constructor(state, router) {
    this.state = state;
  }
}
