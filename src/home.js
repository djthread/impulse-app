import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Live {
  constructor(state) {
    this.state = state;
  }
}
