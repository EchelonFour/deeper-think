import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as _ from 'lodash';

declare interface Voice {
  lang: string;
}

declare class SpeechSynthesisUtterance {
  voice: Voice;
  text: string;
  pitch: number;
  rate: number;
}

declare var speechSynthesis: {
  cancel(): void;
  getVoices(): Voice[];
  speak(utterance: SpeechSynthesisUtterance): void;
};

@Injectable()
export class SpeechService {
  speak$(phrase: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      const msg = new SpeechSynthesisUtterance();
      msg.voice = _.sample(_.filter(speechSynthesis.getVoices(), (voice) => _.startsWith(voice.lang, 'en-')));
      msg.text = phrase;
      msg.pitch = _.random(0.5, 1.2, true);
      msg.rate = _.random(0.6, 0.7, true);
      speechSynthesis.speak(msg);

      return () => speechSynthesis.cancel();
    }).do({ error: (err) => console.error('Speak Error', err) });
  }
}
