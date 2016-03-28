import {State} from "./state";
import videojs from "video.js";
import {inject} from "aurelia-framework";

@inject(State)
export class App {

  // ttTabs = [];
  // video  = null;  // dom element

  configureRouter(config, router) {
    // config.title = 'Techno Tuesday';

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
    console.log('navigatio', router.navigation);

    this.router = router;
  }

  constructor(state) {
    this.state = state;
    // this.ttTabs = [
    //   {id: "section-chat",     label: "Chat", selected: true},
    //   {id: "section-schedule", label: "Schedule"},
    //   {id: "section-podcast",  label: "Podcast"},
    //   {id: "section-info",     label: "Info"}
    // ];
  }
}
