import {State} from "../state";
import {inject} from "aurelia-framework";

@inject(State)
export class Schedule {
  constructor(state) {
    this.state = state;
    this.show  = null;
  }

  attached() {
    this.show = this.state.show;
  }
}
