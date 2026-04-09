class AudioEngine {
  context: AudioContext | null = null;
  ambientNodes: any[] = [];
  isPlayingAmbient = false;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  toggleAmbient(): boolean {
    this.init();
    if (!this.context) return false;

    if (this.isPlayingAmbient) {
      const masterGain = this.ambientNodes.find(n => n.id === 'master');
      if (masterGain) {
        masterGain.node.gain.setTargetAtTime(0, this.context.currentTime, 1);
        setTimeout(() => {
          this.ambientNodes.forEach(item => {
            try { item.node.stop(); } catch (e) { }
            try { item.node.disconnect(); } catch (e) { }
          });
          this.ambientNodes = [];
        }, 2000);
      }
      this.isPlayingAmbient = false;
      return false;
    } else {
      const root = 130.81;
      const fifth = 196.00;
      const maj7 = 246.94;
      const ninth = 293.66;
      const frequencies = [root, fifth, maj7, ninth];

      const masterGain = this.context.createGain();
      masterGain.gain.setValueAtTime(0, this.context.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.12, this.context.currentTime + 3);
      masterGain.connect(this.context.destination);
      this.ambientNodes.push({ id: 'master', node: masterGain });

      frequencies.forEach((freq, i) => {
        const osc = this.context!.createOscillator();
        const lfo = this.context!.createOscillator();
        const gain = this.context!.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        lfo.type = 'sine';
        lfo.frequency.value = 0.05 + (i * 0.02);

        const lfoGain = this.context!.createGain();
        lfoGain.gain.value = 0.8;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start();
        lfo.start();

        this.ambientNodes.push({ id: `osc-${i}`, node: osc });
        this.ambientNodes.push({ id: `lfo-${i}`, node: lfo });
        this.ambientNodes.push({ id: `gain-${i}`, node: gain });
        this.ambientNodes.push({ id: `lfoGain-${i}`, node: lfoGain });
      });

      this.isPlayingAmbient = true;
      return true;
    }
  }

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

  playPaperFlip() {
    this.init();
    if (!this.context) return;
    const bufferSize = this.context.sampleRate * 0.15;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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