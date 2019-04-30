import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { tap } from 'rxjs/operators';

@Injectable()
export class SpeechService {
  speak$(phrase: string): Observable<void> {
    return Observable.create(() => {
      const msg = new SpeechSynthesisUtterance();
      msg.voice = _.sample(_.filter(speechSynthesis.getVoices(), (voice) => _.startsWith(voice.lang, 'en-')));
      msg.text = phrase;
      msg.pitch = _.random(0.5, 1.2, true);
      msg.rate = _.random(0.6, 0.7, true);
      speechSynthesis.speak(msg);

      return () => speechSynthesis.cancel();
    }).pipe(tap({ error: (err) => console.error('Speak Error', err) }));
  }
}
