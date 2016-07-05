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
    this.photos    = [];
    this.lightbox  = null;

    this.latest_episodes = [];
    this.latest_events   = [];

    [this.socket, this.site, this.lobby, this.stat, this.photos] = this.startSocket();
  }

  initialize(cb) {
    this.getShows(() => {
      this.shows.forEach((show) => {
        this.latest_episodes = this.latest_episodes.concat(show.episodes);
        this.latest_events   = this.latest_events.concat(show.events);
      }.bind(this));
      this.latest_episodes.sort((e1, e2) => {
        return e1.posted_on < e2.posted_on ? 1 : -1;
      });
      this.latest_events.sort((e1, e2) => {
        return e1.happens_on > e2.happens_on ? 1 : -1;
      });
      cb();
    }.bind(this));
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

    var site   = this.setupSite(socket),
        lobby  = this.setupChat(socket),
        stat   = this.setupStat(socket),
        photos = this.setupPhotos(socket);

    return [socket, site, lobby, stat, photos];
  }

  setupSite(socket) {
    var site = socket.channel("site", {});

    site.join().receive("ignore", () => console.log("auth error"))
                .receive("ok",     () => console.log("join ok"))
                .receive("error",  () => console.log("Connection interruption"));

    site.onError(e => console.log("something went wrong", e));
    site.onClose(e => console.log("channel closed", e));

    return site;
  }

  setupChat(socket) {
    var lobby = socket.channel("rooms:lobby", {});

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
    var stat = socket.channel("rooms:stat", {});

    stat.join().receive("ignore", () => console.log("auth error"))
               .receive("ok",     () => console.log("join ok"))
               .receive("error",  () => console.log("Connection interruption"));

    stat.onError(e => console.log("something went wrong", e));
    stat.onClose(e => console.log("channel closed", e));

    stat.on("update", stat => {
      this.infoline = stat.viewers + " viewer" + (stat.viewers == 1 ? "" : "s")
                    + " / " + stat.listeners + " listener" + (stat.listeners == 1 ? "" : "s")
                    + " / " + stat.online + " online";
    }.bind(this));

  }

  setupPhotos(socket) {
    console.log('setupPhotos');
    var photos = socket.channel("photos", {});

    photos.join().receive("ignore", () => console.log("auth error"))
               .receive("ok",     () => console.log("join ok"))
               .receive("error",  () => console.log("Connection interruption"));

    photos.onError(e => console.log("something went wrong", e));
    photos.onClose(e => console.log("channel closed", e));

    photos.on("new", photo => {
      var img = new Image()
      img.src = photo.url;
      img.setAttribute("data-jslghtbx", photo.full_url);
      img.setAttribute('data-jslghtbx-index', this.lightbox.thumbnails.length)
      img.setAttribute("data-jslghtbx-group", "main");
      img.setAttribute("data-jslghtbx-caption",
        'See this image in the <a target="_blank" href="'+photo.gallery_url+'">Photo Gallery
        <sup><i class="fa fa-external-link" aria-hidden="true"></i></sup></a>.');

      this.photos.unshift(photo);
      this.photos.pop();

      this.pushEvent(null, {special: "A new photo has been added."});

      setTimeout(() => this.setupLightbox(), 800);
    }.bind(this));

    photos.on("refresh", photos => {
      this.photos = photos.reverse();
    }.bind(this));
  }

  getShows(cb) {
    this.push(this.site, "shows", {}, (data) => {
      console.log('SHOWS', data.shows);
      this.shows = data.shows.map((show) => {
        return this.situateShowInfo(show);
      }.bind(this));
      this.shows = this.sortShows(this.shows);
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
        var fullShow = this.situateShowInfo(response.show);
        fullShow.is_expanded = true;
        this.shows.splice(idx, 1, fullShow);
        cb(fullShow);
      }.bind(this));
    }
  }

  getEpisode(show, num, cb) {
    this.push(this.site, "episode", {slug: show.slug, num: num}, (response) => {
      cb(this.situateEpInfo(response.episode, show));
    }.bind(this));
  }

  showAndIdxBySlug(slug) {
    for (var i=0; i<this.shows.length; i++) {
      if (this.shows[i].slug == slug) {
        return {show: this.shows[i], idx: i};
      }
    }
    return null;
  }

  situateShowInfo(show) {
    var events, episodes;

    events = show.events.map((ev) => {
      ev.info     = JSON.parse(ev.info_json);
      ev.showslug = show.slug;
      ev.showname = show.name;
      delete ev.info_json;
      return ev;
    });

    episodes = show.episodes.map((ep) => {
      return this.situateEpInfo(ep, show);
    }.bind(this));

    show.events   = events;
    show.episodes = episodes;

    return show;
  }

  situateEpInfo(ep, show) {
    ep.showslug    = show.slug;
    ep.showname    = show.name;
    ep.downloadUrl = "/download/"+show.slug+"/"+ep.filename;
    ep.pageUrl     = "/#/shows/"+show.slug+"/podcast/"+this.slugifyEp(ep);
    ep.showUrl     = "/#/shows/"+show.slug;
    return ep;
  }

  slugifyEp(ep) {
    return ep.number + "-" +
      ep.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-*|-*$)/g, "");
  }

  sortShows(shows) {
    var ret = [], order = [
      "Techno Tuesday",
      "WobbleHead Radio",
      "SUB:Therapy Radio",
      // "Paris of the West",
      // "Headroom",
      "Specials"
    ];

    order.forEach((name) => {
      for (var i=0; i<shows.length; i++) {
        if (shows[i].name == name) {
          ret.push(shows[i]);
          break;
        }
      }
    });

    return ret;
  }

  setupStamps(msg) {
    let username  = msg.user || "anonymous";
    let body      = msg.body;
    let date      = msg.stamp ? new Date(msg.stamp) : new Date();

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

  setupLightbox() {
    var options = {
      boxId:              this.lightbox ? 'jslghtbx' : null,
			dimensions:         true,
			captions:           true,
			prevImg:            false,
			nextImg:            false,
			hideCloseBtn:       false,
			closeOnClick:       true,
			loadingAnimation:   200,
			animElCount:        4,
			preload:            true,
			carousel:           true,
			animation:          400,
			nextOnClick:        true,
			responsive:         true,
			maxImgSize:         0.8,
			keyControls:        true,
			// callbacks
			onopen: function(){
        console.log('onopen');
					// ...
			},
			onclose: function(){
        console.log('orncloase');
					// ...
			},
			onload: function(){
					console.log('onlead');
					// ...
			},
			onresize: function(event){
					// ...
			},
			onloaderror: function(event){
        console.log('onleoaderror');
					// ...
			}
		};

    this.lightbox = new Lightbox();
    this.lightbox.load(options);
  }
}
