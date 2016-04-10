import {State} from "../state";
import {inject} from "aurelia-framework";

@inject(State)
export class Info {
  constructor(state) {
    this.state = state;
  }

  attached() {
    this.show = this.state.show;
  }
}
