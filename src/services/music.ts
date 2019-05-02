import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as Tone from 'tone';

@Injectable()
export class MusicService {

  pianoLoop: Tone.Loop;
  noiseLoop: Tone.Loop;
  noise: Tone.Noise;
  constructor() {
    const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    const OCTIVES = [3, 4]
    const reverb = new Tone.JCReverb().toMaster()
    const piano = new Tone.PolySynth().set({
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

    this.pianoLoop = new Tone.Loop((time) => {
      const toneLength = Tone.Time('4n') + _.random(-0.3, 0.3)
      if (toneLength > 0) {
        piano.triggerAttackRelease(Tone.Frequency(`${_.sample(NOTES)}${_.sample(OCTIVES)}`), toneLength)
      }
    }, "4n")
    this.pianoLoop.humanize = true
    this.pianoLoop.probability = 0.7
    this.noise = new Tone.Noise('brown').toMaster()
    this.noise.volume.value = -40
    this.noiseLoop = new Tone.Loop(() => {
      this.noise.volume.rampTo(_.random(-40, -20), Tone.Time('2m') - Tone.Time('8n'))
    }, '2m')
  }
  audioAllowed(): boolean {
    return ((Tone as any).context.rawContext as AudioContext).state === 'running'
  }
  async play(): Promise<void> {
    // debugger
    await this.resume()
    this.noise.start()
    this.noiseLoop.start(0)
    this.pianoLoop.start(0)
    Tone.Transport.start()
  }
  async resume(): Promise<any> {
    return await (Tone as any).start()
  }
  stop(): void {
    this.noise.stop()
    Tone.Transport.stop()
  }
}
