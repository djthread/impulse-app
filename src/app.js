import {State} from "./state";
import videojs from "video.js";
import {inject} from "aurelia-framework";

@inject(State)
export class App {

  configureRouter(config, router) {
    config.map([
      { route:    ['', 'live'],
        name:     'live',
        title:    'Live',
        moduleId: './live',
        nav:      true
      },
      { route:    'shows',
        name:     'shows',
        title:    'Shows',
        moduleId: './shows',
        nav:      true
      },
      { route:    'schedule',
        name:     'schedule',
        title:    'Schedule',
        moduleId: './schedule',
        nav:      true
      },
      { route:    'info',
        name:     'info',
        title:    'Info',
        moduleId: './info',
        nav:      true
      }
    ]);

    this.router = router;
  }

  constructor(state) {
    this.state = state;
  }

  activate() {
    return new Promise((accept, reject) => {
      this.state.initialize(() => {
        accept();
      });
    }.bind(this));
  }
}
