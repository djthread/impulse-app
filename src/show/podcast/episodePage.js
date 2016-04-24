import {State} from "../../state";
import {inject} from "aurelia-framework";

@inject(State)
export class EpisodePage {
  constructor(state) {
    this.state = state;
  }

  activate(params) {
    var state      = this.state,
        regex      = /^(\d+)/,
        numandslug = params.numandslug,
        num        = parseInt(regex.exec(numandslug)[1]);

    return new Promise((accept, reject) => {
      if (!num) return reject();
      state.getEpisode(state.show, num, (ep) => {
        if (numandslug == state.slugifyEp(ep)) {
          this.ep = ep;
          accept();
        } else {
          reject();
        }
      });
    });
  }
}
