import { Component, OnDestroy } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2';
import * as _ from 'lodash';
import * as Color from 'color';
import * as random from 'seedrandom';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';

@Component({
  selector: "body", 
  host: {
    "[style.background-color]":"currentColour.string()" 
  }, 
  templateUrl: './app.component.html'
})
export class AppComponent implements OnDestroy {
  phrase$: Observable<string>;
  font$: Observable<string>;
  currentColour: Color.Color;
  private FONTS = ['Baloo', 'Crimson Text', 'Gidugu', 'Griffy', 'Indie Flower', 'Raleway', 'Ranga', 'Roboto', 'Supermercado One'];

  constructor(private af: AngularFire, private music: MusicService, private speech: SpeechService) {
    this.phrase$ = this.af.database.object('/phrase' /** TODO **/)
      .map((ref) => ref.$value)
      .switchMap((phrase) => this.speech.speak$(phrase).startWith(phrase))
      .do((phrase) => this.currentColour = this.newColor(phrase))
    this.font$ = this.phrase$.map((phrase) => this.newFont(phrase))
    this.currentColour = Color('hsl(200, 50%, 90%)')
    this.music.play();
  }

  ngOnDestroy(): void {
    this.music.stop();
  }
  private range(seed: string, lower: number, upper: number) {
    const r = random(seed)
    return lower + Math.floor(r() * (upper - lower + 1))
  }
  newFont(phrase: string): string {
    return `${this.FONTS[this.range(phrase, 0, this.FONTS.length - 1)]}, sans-serif`;
  }
  newColor(phrase: string): Color.Color {
    return this.currentColour.hue(this.range(phrase, 0, 360))
  }
}
