import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Show {
  constructor(state) {
    this.state = state;
  }

  configureRouter(config, router) {
    this.router = router;

    config.map([
      { route:    ["", "/"],
        name:     "podcast",
        moduleId: "./show/podcast"
      },
      { route:    "/info",
        name:     "info",
        moduleId: "./show/info",
      }
    ]);
  }

}
