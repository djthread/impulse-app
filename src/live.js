import {State} from "./state";
import {inject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {Cookie} from "aurelia-cookie";
import videojs from "video.js";

@inject(State, EventAggregator)
export class Live {
  constructor(state, eventAggregator) {
    this.state       = state;
    this.lots        = 9999999;
    this.scrollTop   = 0;
    this.username    = Cookie.get("username");
    this.message     = "";
    this.nameTimeout = null;

    this.scrollMessagesToBottom();

    eventAggregator.subscribe("message", message => {
      this.scrollMessagesToBottom();
    }.bind(this));
  }

  attached() {
    videojs.options.flash.swf = "/jspm_packages/npm/video.js@5.8.0/dist/video-js.swf"
    videojs(document.getElementById('thevideo'), {"fluid": true, "aspectRatio": "16:9"});
  }

  scrollMessagesToBottom() {
    setTimeout(() => {
      this.scrollTop = this.lots;
    }.bind(this), 50);
  }

  shout() {
    this.message  = this.message.trim();
    this.username = this.username.trim();
    Cookie.set("username", this.username);
    if (!this.message) return;
    this.state.lobby.push("new:msg", {user: this.username, body: this.message});
    this.message = '';
  }
}
