import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class App {

  configureRouter(config, router) {
    config.map([
      { route:    ['', 'home'],
        name:     'home',
        title:    'Home',
        moduleId: './home',
        nav:      false
      },
      { route:    'live',
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
      { route:    'podcast',
        name:     'podcast',
        title:    'Podcast',
        moduleId: './podcast',
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
      },
      { route:    'streaming',
        name:     'streaming',
        title:    'Streaming',
        moduleId: './streaming',
        nav:      false
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
