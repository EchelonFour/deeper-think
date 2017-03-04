import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import Tone from 'tone';

@Injectable()
export class MusicService {

  pianoLoop: any;
  noiseLoop: any;
  constructor() {
    const TIME = ['-', '+']
    const reverb = new Tone.JCReverb().toMaster()
    const piano = new Tone.PolySynth(4, Tone.Synth, {
			"volume" : -16,
      "envelope" : {
        attackCurve: "exponential",
        releaseCurve: "sine",
				attack : 0.5,
				decay : 0.5,
				sustain : 0.2
			},
			"oscillator" : {
        type: "sine4"
			},
			"portamento" : 0.05
		}).connect(reverb)
    
    this.pianoLoop = new Tone.Loop((time: any) => {
      //triggered every eighth note. 
      piano.triggerAttackRelease(Tone.Frequency(_.random(46, 60), 'midi'), `4n ${_.sample(TIME)} ${_.random(0, 0.3)}`)
    }, "4n", {
      humanize: true,
      probability: 0.8
    })
    const noise = new Tone.Noise({
			"volume" : -40,
			"type" : "brown"
    }).toMaster().start();
    this.noiseLoop = new Tone.Loop((time: any) => {
      noise.volume.rampTo(_.random(-40, -35), '1m')
    }, '1m')
  }
  play(): void {
    this.noiseLoop.start()
    this.pianoLoop.start()
    Tone.Transport.start(0)    
  }
  stop(): void {
    Tone.Transport.stop(0)
  }
}
