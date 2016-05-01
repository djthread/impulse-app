import {customElement, bindable, inject} from "aurelia-framework";
import {State} from "../state";
import {EventAggregator} from "aurelia-event-aggregator";
import {Cookie} from "aurelia-cookie";

@customElement("chat")
@inject(State, EventAggregator)
export class Chat {
  constructor(state, eventAggregator) {
    this.state       = state;
    this.scrollTop   = 0;
    this.username    = Cookie.get("username");
    this.message     = "";
    this.nameTimeout = null;

    this.scrollMessagesToBottom();

    eventAggregator.subscribe("message", message => {
      this.scrollMessagesToBottom();
    }.bind(this));
  }

  scrollMessagesToBottom() {
    setTimeout(() => {
      this.scrollTop = 9999999;
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
