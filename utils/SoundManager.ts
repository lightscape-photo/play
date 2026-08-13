export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.25; // 設定主音量
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 模擬打鐵聲：金屬敲擊 + 衝擊雜訊
  playAnvil() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. 金屬泛音 (Sine waves)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    // 隨機頻率增加自然感
    osc1.frequency.value = 800 + Math.random() * 50;
    osc2.frequency.value = 1200 + Math.random() * 50;

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.8);
    osc2.stop(t + 0.6);

    // 包絡：快速 Attack，指數 Decay
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.8, t + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.6, t + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    // 2. 衝擊雜訊 (White noise burst)
    const bufferSize = this.ctx.sampleRate * 0.1; // 0.1秒
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(t);
    
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
  }

  // 成功音效 (上行琶音)
  playSuccess() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
    freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.value = f;
        osc.type = 'triangle';
        
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        const startTime = t + i * 0.05;
        osc.start(startTime);
        osc.stop(startTime + 0.6);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    });
  }

  // 失敗音效 (低沈鋸齒波)
  playFail() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);
    osc.type = 'sawtooth';

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
  }

  // 魔法音效 (掃頻 + 閃爍感)
  playMagic() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // 1. 主要掃頻音 (Rising Tone)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.3); 

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.4);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);

    // 2. 閃爍高頻 (Sparkles)
    for(let i=0; i<3; i++) {
        const sOsc = this.ctx.createOscillator();
        const sGain = this.ctx.createGain();
        sOsc.type = 'sine';
        sOsc.frequency.value = 2000 + Math.random() * 1000;
        
        sOsc.connect(sGain);
        sGain.connect(this.masterGain);
        
        const start = t + Math.random() * 0.2;
        sOsc.start(start);
        sOsc.stop(start + 0.1);
        
        sGain.gain.setValueAtTime(0.1, start);
        sGain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
    }
  }
}

export const soundManager = new SoundManager();