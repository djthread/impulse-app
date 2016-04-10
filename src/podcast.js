import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Podcast {
  constructor(state) {
    this.state = state;
  }
}
