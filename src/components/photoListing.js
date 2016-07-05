import {customElement, bindable, inject} from "aurelia-framework";
import {State} from "../state.js";

@inject(State)
@customElement("photo-listing")
export class PhotoListing {
  @bindable photos;

  constructor(state) {
    this.state = state;
  }

  attached() {
    this.state.setupLightbox();
  }
}
