'use client';

// Sound Effects Utility using Web Audio API
// Creates synthesized sounds for a premium user experience

type SoundType = 'click' | 'addToCart' | 'success' | 'error' | 'notification' | 'purchase' | 'hover';

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundEnabled', String(enabled));
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundVolume', String(this.volume));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  init() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('soundEnabled');
      const savedVolume = localStorage.getItem('soundVolume');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  play(type: SoundType) {
    if (!this.enabled || typeof window === 'undefined') return;

    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.value = this.volume;

      switch (type) {
        case 'click':
          this.playClick(ctx, gainNode);
          break;
        case 'hover':
          this.playHover(ctx, gainNode);
          break;
        case 'addToCart':
          this.playAddToCart(ctx, gainNode);
          break;
        case 'success':
          this.playSuccess(ctx, gainNode);
          break;
        case 'error':
          this.playError(ctx, gainNode);
          break;
        case 'notification':
          this.playNotification(ctx, gainNode);
          break;
        case 'purchase':
          this.playPurchase(ctx, gainNode);
          break;
      }
    } catch (e) {
      // Silently fail if audio context is not available
      console.warn('Sound effect failed:', e);
    }
  }

  // Simple click sound - short, subtle
  private playClick(ctx: AudioContext, gainNode: GainNode) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    osc.connect(env);
    env.connect(gainNode);
    
    osc.frequency.value = 800;
    osc.type = 'sine';
    
    env.gain.setValueAtTime(0.3, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  }

  // Subtle hover sound
  private playHover(ctx: AudioContext, gainNode: GainNode) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    osc.connect(env);
    env.connect(gainNode);
    
    gainNode.gain.value = this.volume * 0.3; // Quieter for hover
    
    osc.frequency.value = 600;
    osc.type = 'sine';
    
    env.gain.setValueAtTime(0.15, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  // Add to cart - satisfying "pop" sound
  private playAddToCart(ctx: AudioContext, gainNode: GainNode) {
    // First pop
    const osc1 = ctx.createOscillator();
    const env1 = ctx.createGain();
    
    osc1.connect(env1);
    env1.connect(gainNode);
    
    osc1.frequency.setValueAtTime(400, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc1.type = 'sine';
    
    env1.gain.setValueAtTime(0.4, ctx.currentTime);
    env1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    
    // Second higher pop
    const osc2 = ctx.createOscillator();
    const env2 = ctx.createGain();
    
    osc2.connect(env2);
    env2.connect(gainNode);
    
    osc2.frequency.setValueAtTime(600, ctx.currentTime + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.18);
    osc2.type = 'sine';
    
    env2.gain.setValueAtTime(0, ctx.currentTime);
    env2.gain.setValueAtTime(0.3, ctx.currentTime + 0.08);
    env2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  }

  // Success - ascending chime
  private playSuccess(ctx: AudioContext, gainNode: GainNode) {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      
      osc.connect(env);
      env.connect(gainNode);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + (i * 0.08);
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      env.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Error - descending buzz
  private playError(ctx: AudioContext, gainNode: GainNode) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    osc.connect(env);
    env.connect(gainNode);
    
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    osc.type = 'sawtooth';
    
    env.gain.setValueAtTime(0.2, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  // Notification - bell-like ding
  private playNotification(ctx: AudioContext, gainNode: GainNode) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    
    osc.connect(env);
    env.connect(gainNode);
    
    osc.frequency.value = 1046.5; // C6
    osc.type = 'sine';
    
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    
    // Add harmonics for bell sound
    const osc2 = ctx.createOscillator();
    const env2 = ctx.createGain();
    
    osc2.connect(env2);
    env2.connect(gainNode);
    
    osc2.frequency.value = 2093; // C7
    osc2.type = 'sine';
    
    env2.gain.setValueAtTime(0, ctx.currentTime);
    env2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    env2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.2);
  }

  // Purchase success - triumphant fanfare
  private playPurchase(ctx: AudioContext, gainNode: GainNode) {
    // Major chord arpeggio: C-E-G-C
    const notes = [523.25, 659.25, 783.99, 1046.5];
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      
      osc.connect(env);
      env.connect(gainNode);
      
      osc.frequency.value = freq;
      osc.type = 'sine';
      
      const startTime = ctx.currentTime + (i * 0.1);
      env.gain.setValueAtTime(0, startTime);
      env.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
      env.gain.setValueAtTime(0.35, startTime + 0.15);
      env.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
    
    // Final shimmer
    setTimeout(() => {
      const shimmer = ctx.createOscillator();
      const shimmerEnv = ctx.createGain();
      
      shimmer.connect(shimmerEnv);
      shimmerEnv.connect(gainNode);
      
      shimmer.frequency.value = 2093; // High C
      shimmer.type = 'sine';
      
      shimmerEnv.gain.setValueAtTime(0, ctx.currentTime);
      shimmerEnv.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      shimmerEnv.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      shimmer.start(ctx.currentTime);
      shimmer.stop(ctx.currentTime + 0.6);
    }, 350);
  }
}

// Singleton instance
export const soundEffects = new SoundEffects();

// Initialize on first load
if (typeof window !== 'undefined') {
  soundEffects.init();
}

// Export hook for React components
export function useSound() {
  return {
    play: (type: SoundType) => soundEffects.play(type),
    setEnabled: (enabled: boolean) => soundEffects.setEnabled(enabled),
    setVolume: (volume: number) => soundEffects.setVolume(volume),
    isEnabled: () => soundEffects.isEnabled(),
    getVolume: () => soundEffects.getVolume(),
  };
}

// Quick play functions
export const playClick = () => soundEffects.play('click');
export const playHover = () => soundEffects.play('hover');
export const playAddToCart = () => soundEffects.play('addToCart');
export const playSuccess = () => soundEffects.play('success');
export const playError = () => soundEffects.play('error');
export const playNotification = () => soundEffects.play('notification');
export const playPurchase = () => soundEffects.play('purchase');
