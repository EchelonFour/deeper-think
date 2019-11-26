import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as Tone from 'tone';

@Injectable()
export class MusicService {

  pianoLoop: Tone.Loop;
  noiseLoop: Tone.Loop;
  noise: Tone.Noise;
  private lastNoteIndex: number = 0;
  constructor() {
    const NOTES = ['D2', 'Eb2', 'F2', 'G2', 'A2', 'Bb2', 'C2', 'D3', 'Eb3', 'F3', 'G3', 'A3', 'Bb3', 'C3', 'D4']
    const reverb = new Tone.JCReverb().toMaster()
    const piano = new Tone.PolySynth().set({
      "volume" : -25,
      "envelope" : {
        attackCurve: "sine",
        releaseCurve: "sine",
        attack: 0.4,
        decay: 0.1,
        sustain: 0.1,
        release: 0.4
      },
      "oscillator" : {
        type: "sine4"
      },
      "portamento" : 0.05
    }).connect(reverb)

    this.pianoLoop = new Tone.Loop((time) => {
      const toneLength = Tone.Time('4n') + _.random(-0.3, 0.3)
      if (toneLength > 0) {
        let newNoteIndex = (this.lastNoteIndex + _.random(-1, 1)) % NOTES.length
        if (newNoteIndex < 0) {
          newNoteIndex = NOTES.length + newNoteIndex //wrap it around
        }
        piano.triggerAttackRelease(Tone.Frequency(NOTES[newNoteIndex]), toneLength)
        this.lastNoteIndex = newNoteIndex
      }
    }, "8n")
    this.pianoLoop.humanize = true
    this.pianoLoop.probability = 0.7
    this.noise = new Tone.Noise({type: 'brown', playbackRate: 0.1}).toMaster()
    this.noise.volume.value = -20
    this.noiseLoop = new Tone.Loop(() => {
      this.noise.volume.rampTo(_.random(-20, -10), Tone.Time('2m') - Tone.Time('8n'))
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
