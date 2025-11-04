/**
 * Web Audio API Sound Generator
 * Generates ambient sounds programmatically without external files
 */

export class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private activeNodes: Map<string, { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode }> = new Map();

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Resume AudioContext (required for autoplay policy)
   */
  async resumeContext() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Generate White Noise
   */
  createWhiteNoise(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Generate Brown Noise (Brownian/Red Noise)
   */
  createBrownNoise(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Amplify
    }

    return buffer;
  }

  /**
   * Generate Pink Noise (1/f noise)
   */
  createPinkNoise(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // Adjust volume
      b6 = white * 0.115926;
    }

    return buffer;
  }

  /**
   * Generate Rain Sound (using filtered noise)
   */
  createRainSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 4; // 4 seconds
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      // Generate filtered white noise for rain effect
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Low-pass filter for rain sound
        const filtered = (lastOut * 0.95 + white * 0.05);
        lastOut = filtered;
        
        // Add random intensity variations
        const intensity = 0.3 + Math.random() * 0.4;
        data[i] = filtered * intensity;
      }
    }

    return buffer;
  }

  /**
   * Generate Ocean Waves (using low-frequency oscillation)
   */
  createOceanWaves(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 8; // 8 seconds
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
    const sampleRate = this.audioContext.sampleRate;

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // Wave oscillation (slow)
        const wave1 = Math.sin(2 * Math.PI * 0.1 * t);
        const wave2 = Math.sin(2 * Math.PI * 0.15 * t + Math.PI / 3);
        const wave3 = Math.sin(2 * Math.PI * 0.08 * t + Math.PI / 2);
        
        // Add filtered noise for texture
        const noise = (Math.random() * 2 - 1) * 0.3;
        
        // Combine waves
        data[i] = (wave1 * 0.3 + wave2 * 0.2 + wave3 * 0.15 + noise) * 0.4;
      }
    }

    return buffer;
  }

  /**
   * Generate Forest Ambience (birds + rustling)
   */
  createForestSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 6; // 6 seconds
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
    const sampleRate = this.audioContext.sampleRate;

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // Background rustling (filtered noise)
        const noise = (Math.random() * 2 - 1) * 0.15;
        
        // Occasional bird chirps (simple high-frequency tones)
        let bird = 0;
        if (Math.random() < 0.001) {
          bird = Math.sin(2 * Math.PI * (2000 + Math.random() * 1000) * t) * 0.2;
        }
        
        // Wind through leaves
        const wind = Math.sin(2 * Math.PI * 0.3 * t) * noise * 0.5;
        
        data[i] = noise + bird + wind;
      }
    }

    return buffer;
  }

  /**
   * Generate Fireplace Crackling
   */
  createFireplaceSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < bufferSize; i++) {
        // Low rumble
        const rumble = (Math.random() * 2 - 1) * 0.1;
        
        // Random crackles
        let crackle = 0;
        if (Math.random() < 0.002) {
          crackle = (Math.random() * 2 - 1) * 0.8;
        }
        
        data[i] = rumble + crackle;
      }
    }

    return buffer;
  }

  /**
   * Generate Thunder Sound
   */
  createThunderSound(): AudioBuffer | null {
    if (!this.audioContext) return null;

    const bufferSize = this.audioContext.sampleRate * 5;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
    const sampleRate = this.audioContext.sampleRate;

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        
        // Low rumble with decay
        const rumble = Math.sin(2 * Math.PI * 40 * t) * Math.exp(-t * 0.5) * 0.6;
        
        // Random thunder crack
        let crack = 0;
        if (Math.random() < 0.0005) {
          crack = (Math.random() * 2 - 1) * Math.exp(-t * 2);
        }
        
        data[i] = rumble + crack;
      }
    }

    return buffer;
  }

  /**
   * Play a generated sound
   */
  async playSound(soundType: string, volume: number = 0.5): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not supported');
    }

    await this.resumeContext();

    // Stop existing sound if playing
    this.stopSound(soundType);

    let buffer: AudioBuffer | null = null;

    switch (soundType) {
      case 'whitenoise':
        buffer = this.createWhiteNoise();
        break;
      case 'brownnoise':
        buffer = this.createBrownNoise();
        break;
      case 'pinknoise':
        buffer = this.createPinkNoise();
        break;
      case 'rain':
        buffer = this.createRainSound();
        break;
      case 'ocean':
        buffer = this.createOceanWaves();
        break;
      case 'forest':
        buffer = this.createForestSound();
        break;
      case 'fireplace':
        buffer = this.createFireplaceSound();
        break;
      case 'thunder':
        buffer = this.createThunderSound();
        break;
      default:
        return;
    }

    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);

    this.activeNodes.set(soundType, { source, gain: gainNode });
  }

  /**
   * Stop a playing sound
   */
  stopSound(soundType: string): void {
    const nodes = this.activeNodes.get(soundType);
    if (nodes) {
      try {
        nodes.source.stop();
      } catch (e) {
        // Already stopped
      }
      this.activeNodes.delete(soundType);
    }
  }

  /**
   * Update volume of playing sound
   */
  setVolume(soundType: string, volume: number): void {
    const nodes = this.activeNodes.get(soundType);
    if (nodes) {
      nodes.gain.gain.value = volume;
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.activeNodes.forEach((nodes, soundType) => {
      this.stopSound(soundType);
    });
  }

  /**
   * Check if a sound is currently playing
   */
  isPlaying(soundType: string): boolean {
    return this.activeNodes.has(soundType);
  }
}

// Singleton instance
export const soundGenerator = new SoundGenerator();
