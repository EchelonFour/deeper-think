import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import Tone from 'tone';

@Injectable()
export class MusicService {
  constructor() {
    const synth = new Tone.Synth().toMaster()
    const piano = new Tone.PolySynth(4, Tone.Synth, {
			"volume" : -8,
			"oscillator" : {
				"partials" : [1, 2, 1],
			},
			"portamento" : 0.05
		}).toMaster()
    const loop = new Tone.Loop((time: any) =>{
      //triggered every eighth note. 
      console.log(time);
    }, "8n")
    loop.humanize = true
    loop.probability = 0.8
    loop.start(0)
  }
  play(): void {
    Tone.Transport.start(0)
  }
  stop(): void {
    Tone.Transport.stop(0)
  }
}
