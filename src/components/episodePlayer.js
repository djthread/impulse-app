import {customElement, bindable} from "aurelia-framework";

@customElement("episode-player")
export class EpisodePlayer {
  @bindable episode;

  attached() {
    // Pause everybody else
    this.audio.addEventListener("playing", () => {
      var i, nodelist = document.getElementsByTagName("audio");
      for (i=0; i<nodelist.length; i++) {
        var el = nodelist[i];
        if (el != this.audio) el.pause();
      };
    });
  }
}
