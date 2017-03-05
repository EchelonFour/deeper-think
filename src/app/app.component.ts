import { Component, OnDestroy } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2';
import * as _ from 'lodash';

import { MusicService } from '../services/music';
import { SpeechService } from '../services/speech';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  phrase$: Observable<string>;
  font$: Observable<string>;
  private FONTS = ['Baloo', 'Crimson Text', 'Gidugu', 'Griffy', 'Indie Flower', 'Raleway', 'Ranga', 'Roboto', 'Supermercado One'];

  constructor(private af: AngularFire, private music: MusicService, private speech: SpeechService) {
    this.phrase$ = this.af.database.object('/phrase' /** TODO **/)
      .map((ref) => ref.$value)
      .switchMap((phrase) => this.speech.speak$(phrase).startWith(phrase))
    this.font$ = this.phrase$.map((phrase) => this.newFont(phrase))

    this.music.play();
  }

  ngOnDestroy(): void {
    this.music.stop();
  }
  newFont(phrase: string): string {
    return `${_.sample(this.FONTS)}, sans-serif`;
  }
}
