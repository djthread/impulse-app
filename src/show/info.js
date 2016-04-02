import {State} from "../state";
import {inject} from "aurelia-framework";

@inject(State)
export class Info {
  constructor(state) {
    this.state = state;
  }
}
