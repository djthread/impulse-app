import {State} from "../state";
import {inject} from "aurelia-framework";

@inject(State)
export class Home {
  constructor(state) {
    this.state = state;
  }
}
