import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Shows {
  constructor(state) {
    this.state = state;
  }

  configureRouter(config, router) {
    this.router = router;

    config.map([
      { route:    ["", "/"],
        name:     "list",
        moduleId: "./shows/list"
      },
      { route:    "/:slug",
        name:     "show",
        moduleId: "./show",
      }
    ]);
  }

  // activate() {
  //   return new Promise((accept, reject) => {
  //     this.
  //   });
  // }
}
