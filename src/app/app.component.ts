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

  constructor(private af: AngularFire, private music: MusicService, private speech: SpeechService) {
    this.phrase$ = this.af.database.object('/phrase' /** TODO **/)
      .map((ref) => ref.$value)
      .switchMap((phrase) => this.speech.speak$(phrase).startWith(phrase));

    this.music.play();
  }

  ngOnDestroy(): void {
    this.music.stop();
  }
}
