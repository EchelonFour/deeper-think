import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import Tone from 'tone';

@Injectable()
export class MusicService {

  pianoLoop: any;
  noiseLoop: any;
  constructor() {
    const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const OCTIVES = [3, 4]
    const TIME = ['-', '+']
    const reverb = new Tone.JCReverb().toMaster()
    const piano = new Tone.PolySynth(4, Tone.Synth, {
			"volume" : -25,
      "envelope" : {
        attackCurve: "sine",
        releaseCurve: "sine",
				attack: 0.4,
				decay: 0.6,
				sustain: 0.1,
        release: 1
			},
			"oscillator" : {
        type: "sine4"
			},
			"portamento" : 0.05
		}).connect(reverb)
    
    this.pianoLoop = new Tone.Loop((time: any) => {
      //triggered every eighth note. 
      piano.triggerAttackRelease(Tone.Frequency(`${_.sample(NOTES)}${_.sample(OCTIVES)}`), `4n ${_.sample(TIME)} ${_.random(0, 0.3)}`)
    }, "4n")
    this.pianoLoop.humanize = true
    this.pianoLoop.probability = 0.7
    const noise = new Tone.Noise({
			"volume" : -40,
			"type" : "brown"
    }).toMaster().start();
    this.noiseLoop = new Tone.Loop((time: any) => {
      noise.volume.rampTo(_.random(-40, -20), '1m')
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
