import {State} from "../../state";
import {inject} from "aurelia-framework";

@inject(State)
export class List {
  constructor(state) {
    this.state = state;
  }
}
