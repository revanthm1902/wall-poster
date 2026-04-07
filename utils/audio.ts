// utils/audio.ts

class AudioEngine {
  context: AudioContext | null = null;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  // Generates a soft, mechanical "pop" for UI buttons
  playClick() {
    this.init();
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  // Generates a heavy, textured "whoosh" using filtered white noise to simulate thick paper
  playPaperFlip() {
    this.init();
    if (!this.context) return;
    
    const bufferSize = this.context.sampleRate * 0.15; // 150ms
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.context.currentTime);
    filter.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.15);
    
    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(0.2, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    noise.start();
  }

  // Simulates a heavy, satisfying camera shutter (Click-Clack)
  playShutter() {
    this.init();
    if (!this.context) return;
    this.playClick();
    setTimeout(() => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, this.context!.currentTime);
      gain.gain.setValueAtTime(0.1, this.context!.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.context!.destination);
      osc.start();
      osc.stop(this.context!.currentTime + 0.05);
    }, 80);
  }
}

export const audio = new AudioEngine();