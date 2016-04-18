import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Podcast {
  constructor(state) {
    this.state = state;
    console.log('OKWAT', state.latest_episodes);
  }
}
