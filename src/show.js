import {State} from "./state";
import {inject} from "aurelia-framework";

@inject(State)
export class Show {
  constructor(state) {
    this.state       = state;
    this.slug        = null;
    this.showInfoTab = true;

    this.faicons = {
      Home:     "home",
      Podcast:  "volume-up",
      Schedule: "calendar",
      Info:     "info-circle"
    };

    this.showTab = {
      Home:     true,
      Podcast:  true,
      Schedule: true,
      Info:     true,
    };
  }

  configureRouter(config, router) {
    this.router = router;

    config.map([
      { route:    ["", "/"],
        name:     "home",
        title:    "Home",
        moduleId: "./show/home",
        nav:      true
      },
      { route:    "/podcast",
        name:     "podcast",
        title:    "Podcast",
        moduleId: "./show/podcast",
        nav:      true
      },
      { route:    "/schedule",
        name:     "schedule",
        title:    "Schedule",
        moduleId: "./show/schedule",
        nav:      true
      },
      { route:    "/info",
        name:     "info",
        title:    "Info",
        moduleId: "./show/info",
        nav:      true
      }
    ]);
  }

  activate(params) {
    var state = this.state;

    this.slug = params.slug;

    return new Promise((accept, reject) => {
      state.getShow(this.slug, (show) => {
        this.show = show;
        state.show = show;

        if (!this.show.full_info) {
          this.showTab["Info"] = false;
        }

        accept();

      }.bind(this));
    }.bind(this));
  }

}
