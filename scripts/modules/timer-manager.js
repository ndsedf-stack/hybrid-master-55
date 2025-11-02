// ===================================================================
// HYBRID MASTER 51 - GESTION DES TIMERS
// ===================================================================
// Gère les timers de repos et d'entraînement

export class TimerManager {
  constructor() {
    this.timers = new Map();
    this.activeTimer = null;
    this.callbacks = {
      onTick: null,
      onComplete: null,
      onStart: null,
      onPause: null,
      onReset: null
    };
  }

  /**
   * Crée un nouveau timer
   */
  createTimer(id, duration, options = {}) {
    const timer = {
      id,
      duration, // en secondes
      remaining: duration,
      startTime: null,
      pauseTime: null,
      isRunning: false,
      isPaused: false,
      interval: null,
      type: options.type || 'rest', // 'rest', 'work', 'warmup'
      autoStart: options.autoStart || false,
      sound: options.sound !== false,
      callbacks: {
        onTick: options.onTick || null,
        onComplete: options.onComplete || null
      }
    };

    this.timers.set(id, timer);

    if (timer.autoStart) {
      this.startTimer(id);
    }

    return timer;
  }

  /**
   * Démarre un timer
   */
  startTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    if (timer.isRunning) return false;

    timer.isRunning = true;
    timer.isPaused = false;
    timer.startTime = Date.now();

    // Si le timer était en pause, ajuster le temps de départ
    if (timer.pauseTime) {
      const pauseDuration = Date.now() - timer.pauseTime;
      timer.startTime += pauseDuration;
      timer.pauseTime = null;
    }

    // Démarrer l'intervalle
    timer.interval = setInterval(() => {
      this.tickTimer(id);
    }, 100); // Update every 100ms for smooth display

    this.activeTimer = id;

    // Callback
    if (this.callbacks.onStart) {
      this.callbacks.onStart(timer);
    }

    return true;
  }

  /**
   * Met en pause un timer
   */
  pauseTimer(id) {
    const timer = this.timers.get(id);
    if (!timer || !timer.isRunning) return false;

    timer.isRunning = false;
    timer.isPaused = true;
    timer.pauseTime = Date.now();

    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }

    // Callback
    if (this.callbacks.onPause) {
      this.callbacks.onPause(timer);
    }

    return true;
  }

  /**
   * Réinitialise un timer
   */
  resetTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    this.stopTimer(id);
    timer.remaining = timer.duration;
    timer.startTime = null;
    timer.pauseTime = null;
    timer.isRunning = false;
    timer.isPaused = false;

    // Callback
    if (this.callbacks.onReset) {
      this.callbacks.onReset(timer);
    }

    return true;
  }

  /**
   * Arrête complètement un timer
   */
  stopTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }

    timer.isRunning = false;
    timer.isPaused = false;

    if (this.activeTimer === id) {
      this.activeTimer = null;
    }

    return true;
  }

  /**
   * Tick du timer (appelé à chaque intervalle)
   */
  tickTimer(id) {
    const timer = this.timers.get(id);
    if (!timer || !timer.isRunning) return;

    const elapsed = (Date.now() - timer.startTime) / 1000;
    timer.remaining = Math.max(0, timer.duration - elapsed);

    // Callback personnalisé du timer
    if (timer.callbacks.onTick) {
      timer.callbacks.onTick(timer);
    }

    // Callback global
    if (this.callbacks.onTick) {
      this.callbacks.onTick(timer);
    }

    // Timer terminé
    if (timer.remaining <= 0) {
      this.completeTimer(id);
    }
  }

  /**
   * Termine un timer
   */
  completeTimer(id) {
    const timer = this.timers.get(id);
    if (!timer) return;

    this.stopTimer(id);
    timer.remaining = 0;

    // Son si activé
    if (timer.sound) {
      this.playSound();
    }

    // Callback personnalisé du timer
    if (timer.callbacks.onComplete) {
      timer.callbacks.onComplete(timer);
    }

    // Callback global
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(timer);
    }
  }

  /**
   * Ajoute du temps à un timer
   */
  addTime(id, seconds) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    timer.duration += seconds;
    timer.remaining += seconds;

    return true;
  }

  /**
   * Retire du temps à un timer
   */
  removeTime(id, seconds) {
    const timer = this.timers.get(id);
    if (!timer) return false;

    timer.duration = Math.max(0, timer.duration - seconds);
    timer.remaining = Math.max(0, timer.remaining - seconds);

    return true;
  }

  /**
   * Récupère un timer
   */
  getTimer(id) {
    return this.timers.get(id);
  }

  /**
   * Récupère le timer actif
   */
  getActiveTimer() {
    return this.activeTimer ? this.timers.get(this.activeTimer) : null;
  }

  /**
   * Supprime un timer
   */
  deleteTimer(id) {
    this.stopTimer(id);
    return this.timers.delete(id);
  }

  /**
   * Supprime tous les timers
   */
  clearAllTimers() {
    this.timers.forEach((timer, id) => {
      this.stopTimer(id);
    });
    this.timers.clear();
    this.activeTimer = null;
  }

  /**
   * Définit un callback global
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
  }

  /**
   * Formate le temps en mm:ss
   */
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Parse un temps "XXs" ou "XXmin" en secondes
   */
  static parseTime(timeString) {
    if (!timeString) return 0;

    const minMatch = timeString.match(/(\d+)\s*min/i);
    if (minMatch) {
      return parseInt(minMatch[1]) * 60;
    }

    const secMatch = timeString.match(/(\d+)\s*s/i);
    if (secMatch) {
      return parseInt(secMatch[1]);
    }

    return 0;
  }

  /**
   * Crée un timer de repos depuis une string (ex: "90s", "2min")
   */
  createRestTimer(restString, options = {}) {
    const duration = TimerManager.parseTime(restString);
    const timerId = `rest_${Date.now()}`;
    
    return this.createTimer(timerId, duration, {
      type: 'rest',
      ...options
    });
  }

  /**
   * Joue un son de notification
   */
  playSound() {
    try {
      // Utiliser l'API Web Audio pour créer un bip
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erreur lecture son:', error);
    }
  }

  /**
   * Récupère tous les timers actifs
   */
  getActiveTimers() {
    return Array.from(this.timers.values()).filter(timer => timer.isRunning);
  }

  /**
   * Récupère l'état de tous les timers
   */
  getTimersState() {
    const state = {};
    this.timers.forEach((timer, id) => {
      state[id] = {
        remaining: timer.remaining,
        duration: timer.duration,
        isRunning: timer.isRunning,
        isPaused: timer.isPaused,
        type: timer.type
      };
    });
    return state;
  }

  /**
   * Vérifie si un timer est en cours
   */
  hasActiveTimer() {
    return this.activeTimer !== null;
  }

  /**
   * Récupère le temps restant formaté
   */
  getRemainingFormatted(id) {
    const timer = this.timers.get(id);
    return timer ? TimerManager.formatTime(timer.remaining) : '00:00';
  }

  /**
   * Récupère le pourcentage de progression
   */
  getProgress(id) {
    const timer = this.timers.get(id);
    if (!timer) return 0;
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  }
}

// Export d'une instance singleton
export const timerManager = new TimerManager();
