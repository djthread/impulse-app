import {customElement, bindable} from "aurelia-framework";

@customElement("episodes-listing")
export class EpisodesListing {
  @bindable episodes;
  @bindable showbtns;
  @bindable limit;

  attached() {
    if (this.limit && this.episodes.length > this.limit) {
      this.episodes = this.episodes.slice(0, this.limit);
    }
  }
}
