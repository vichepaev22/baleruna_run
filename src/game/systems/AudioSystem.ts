export class AudioSystem {
  private ctx: AudioContext | null = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  private musicGain: GainNode | null = null;
  private musicOsc: OscillatorNode | null = null;

  init() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.musicGain.gain.value = 0.15;
    } catch {
      // Audio not available
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMusicEnabled(v: boolean) { this.musicEnabled = v; if (this.musicGain) this.musicGain.gain.value = v ? 0.15 : 0; }
  setSfxEnabled(v: boolean) { this.sfxEnabled = v; }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.ctx || !this.sfxEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() { this.playTone(440, 0.15, 'sine', 0.2); this.playTone(660, 0.1, 'sine', 0.15); }
  playCollect() { this.playTone(880, 0.1, 'sine', 0.2); setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.15), 50); }
  playHurt() { this.playTone(200, 0.3, 'sawtooth', 0.2); }
  playAbility() { this.playTone(523, 0.1, 'square', 0.15); setTimeout(() => this.playTone(659, 0.1, 'square', 0.15), 80); setTimeout(() => this.playTone(784, 0.15, 'square', 0.2), 160); }
  playClick() { this.playTone(600, 0.05, 'sine', 0.15); }
  playVictory() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.playTone(f, 0.2, 'sine', 0.2), i * 120)); }
  playDefeat() { [400, 350, 300, 250].forEach((f, i) => setTimeout(() => this.playTone(f, 0.3, 'sawtooth', 0.15), i * 150)); }
  playWarning() { this.playTone(300, 0.2, 'square', 0.2); setTimeout(() => this.playTone(300, 0.2, 'square', 0.2), 300); }

  startMusic() {
    if (!this.ctx || !this.musicEnabled) return;
    this.stopMusic();
    // Simple looping melody
    const notes = [262, 330, 392, 330, 262, 330, 392, 523];
    let noteIdx = 0;
    const playNote = () => {
      if (!this.ctx || !this.musicEnabled || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = notes[noteIdx % notes.length];
      gain.gain.value = 0.08;
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
      noteIdx++;
      this.musicOsc = osc;
    };
    playNote();
    const interval = setInterval(() => {
      if (!this.musicEnabled) { clearInterval(interval); return; }
      playNote();
    }, 500);
    (this as any)._musicInterval = interval;
  }

  stopMusic() {
    if ((this as any)._musicInterval) {
      clearInterval((this as any)._musicInterval);
      (this as any)._musicInterval = null;
    }
  }

  destroy() {
    this.stopMusic();
    if (this.ctx) this.ctx.close();
  }
}

export const audioSystem = new AudioSystem();
