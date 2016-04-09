import {customElement, bindable} from "aurelia-framework";
import videojs from "video.js";

@customElement("episode-player")
export class EpisodePlayer {
  @bindable episode;

  attached() {
    this.sourceUrl = "https://threadbox.net/dnbcast/"+this.episode.filename;

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
