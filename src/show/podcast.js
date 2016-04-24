import {State} from "../state";
import {inject} from "aurelia-framework";

@inject(State)
export class Podcast {
  constructor(state) {
    this.state = state;
  }

  configureRouter(config, router) {
    this.router = router;

    config.map([
      { route:    ["", "/"],
        name:     "list",
        moduleId: "./podcast/list"
      },
      { route:    "/:numandslug",
        name:     "episodePage",
        moduleId: "./podcast/episodePage",
      }
    ]);
  }

  // activate() {
  //   return new Promise((accept, reject) => {
  //     this.
  //   });
  // }
}
