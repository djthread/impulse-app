import {Socket, LongPoller} from "phoenix.js";
import {EventAggregator} from "aurelia-event-aggregator";
import {inject} from "aurelia-framework";
import {Configure} from "aurelia-configuration";

@inject(Configure, EventAggregator)
export class State {
  constructor(config, eventAggregator) {
    this.ea        = eventAggregator;
    this.socketUri = config.get("socket.endpoint");
    this.messages  = [];
    this.lastStamp = null;
    this.infoline  = "";
    this.shows     = [];

    [this.socket, this.site, this.lobby, this.stat] = this.startSocket();
  }

  initialize(cb) {
    this.getShows(cb);
  }

  pushEvent(ev, msg) {
    msg = this.setupStamps(msg);
    msg.ev = ev;
    this.messages.push(msg);
    this.ea.publish("message", msg);
  }

  push(channel, message, args, happyCb) {
    var fail = function(msg) {
      console.log("ERROR: " + msg);
    }
    if (!channel) return fail("Whoa no channel!");
    channel.push(message, args, 10000)
      .receive("ok", happyCb)
      .receive("error", (reasons) => fail("Show list failed:", reasons))
      .receive("timeout", () => fail("Networking issue..."));
  }

  startSocket() {
    var socket = new Socket(this.socketUri, {
      logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) })
    });

    socket.connect();

    socket.onOpen(ev => {
        console.log("OPEN", ev)
        this.messages = [];
        this.stat     = {};
    }.bind(this));

    socket.onError(ev => console.log("ERROR", ev));
    socket.onClose(e => console.log("CLOSE", e));

    var site  = this.setupSite(socket),
        lobby = this.setupChat(socket),
        stat  = this.setupStat(socket);

    return [socket, site, lobby, stat];
  }

  setupSite(socket) {
    var site = socket.channel("site", {})

    site.join().receive("ignore", () => console.log("auth error"))
                .receive("ok",     () => console.log("join ok"))
                .receive("error",  () => console.log("Connection interruption"));

    site.onError(e => console.log("something went wrong", e));
    site.onClose(e => console.log("channel closed", e));

    return site;
  }

  setupChat(socket) {
    var lobby = socket.channel("rooms:lobby", {})

    lobby.join().receive("ignore", () => console.log("auth error"))
                .receive("ok",     () => console.log("join ok"))
                .receive("error",  () => console.log("Connection interruption"));

    lobby.onError(e => console.log("something went wrong", e));
    lobby.onClose(e => console.log("channel closed", e));

    lobby.on("new:msg", msg => {
      this.pushEvent("new:msg", msg);
    }.bind(this));

    lobby.on("user:entered", msg => {
      this.pushEvent("user:entered", msg);
    }.bind(this));

    return lobby;
  }

  setupStat(socket) {
    var stat = socket.channel("rooms:stat", {})

    stat.join().receive("ignore", () => console.log("auth error"))
               .receive("ok",     () => console.log("join ok"))
               .receive("error",  () => console.log("Connection interruption"));

    stat.onError(e => console.log("something went wrong", e));
    stat.onClose(e => console.log("channel closed", e));

    stat.on("update", stat => {
      this.infoline = stat.viewers + " viewer" + (stat.viewers == 1 ? "" : "s")
                    + " / " + stat.online + " online";
    }.bind(this));

  }

  getShows(cb) {
    this.push(this.site, "shows", {}, (data) => {
      this.shows = data.shows;
      cb();
    }.bind(this));
  }

  getShow(slug, cb) {
    var info = this.showAndIdxBySlug(slug),
        idx  = info["idx"],
        show = this.shows[idx];

    if (show.is_expanded) {
      cb(show);
    } else {
      this.push(this.site, "show", {slug: slug}, (response) => {
        var fullShow = response.show;
        console.log('fullshow', fullShow);
        fullShow.is_expanded = true;
        this.shows.splice(idx, 1, fullShow);
        cb(fullShow);
      }.bind(this));
    }
  }

  showAndIdxBySlug(slug) {
    console.log('SHOWS', this.shows);
    for (var i=0; i<this.shows.length; i++) {
      if (this.shows[i].slug == slug) {
        return {show: this.shows[i], idx: i};
      }
    }
    return null;
  }

  setupStamps(msg) {
    let username  = msg.user || "anonymous"
    let body      = msg.body
    let date      = new Date(msg.stamp)

    let ampm, hours;

    if (date.getHours() >= 12) {
      hours = date.getHours() - 12;
      ampm  = 'p';
    } else {
      hours = date.getHours();
      ampm  = 'a';
    }

    hours = hours || '12';

    let minutes   = (date.getMinutes() < 10 ? "0" : "")+date.getMinutes();
    let stamp     = hours+":"+minutes+ampm;
    let fullStamp = (date.getMonth()+1)+"/"+date.getDate()+" "+stamp;

    if (this.lastStamp === fullStamp) {
      stamp = fullStamp = null;
    }

    this.lastStamp = fullStamp;

    msg.stamp      = stamp;
    msg.fullStamp  = fullStamp;

    return msg;
  }
}
