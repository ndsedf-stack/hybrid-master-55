// ============================================================================
// ⏱️ scripts/modules/timer-manager.js
// Gestion des timers de repos entre séries
// ============================================================================

class TimerManager {
  constructor(callbacks = {}) {
    this.timeRemaining = 0;
    this.totalTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.intervalId = null;
    this.startTime = null;
    
    // Callbacks
    this.onTick = callbacks.onTick || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});
    this.onPause = callbacks.onPause || (() => {});
    this.onResume = callbacks.onResume || (() => {});
  }
  
  // ==================== CONTRÔLES PRINCIPAUX ====================
  
  start(seconds) {
    if (seconds <= 0) {
      return { success: false, message: 'Durée invalide' };
    }
    
    this.reset(); // Nettoyer timer précédent
    
    this.timeRemaining = seconds;
    this.totalTime = seconds;
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.timeRemaining--;
        this.onTick({
          timeRemaining: this.timeRemaining,
          progress: this.getProgress(),
          formatted: this.formatTime(this.timeRemaining)
        });
        
        // Alertes sonores
        if (this.timeRemaining === 10 || this.timeRemaining === 5 || this.timeRemaining === 3) {
          this.playBeep('warning');
        }
        
        if (this.timeRemaining <= 0) {
          this.complete();
        }
      }
    }, 1000);
    
    return {
      success: true,
      totalTime: this.totalTime,
      formatted: this.formatTime(this.totalTime)
    };
  }
  
  pause() {
    if (!this.isRunning || this.isPaused) {
      return { success: false, message: 'Timer non actif' };
    }
    
    this.isPaused = true;
    this.onPause({
      timeRemaining: this.timeRemaining,
      formatted: this.formatTime(this.timeRemaining)
    });
    
    return { success: true, timeRemaining: this.timeRemaining };
  }
  
  resume() {
    if (!this.isRunning || !this.isPaused) {
      return { success: false, message: 'Rien à reprendre' };
    }
    
    this.isPaused = false;
    this.onResume({
      timeRemaining: this.timeRemaining,
      formatted: this.formatTime(this.timeRemaining)
    });
    
    return { success: true, timeRemaining: this.timeRemaining };
  }
  
  stop() {
    this.reset();
    return { success: true, message: 'Timer arrêté' };
  }
  
  reset() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.timeRemaining = 0;
    this.totalTime = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    
    this.onTick({
      timeRemaining: 0,
      progress: 0,
      formatted: '0:00'
    });
  }
  
  complete() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    this.isPaused = false;
    this.timeRemaining = 0;
    
    this.playBeep('complete');
    this.triggerNotification();
    this.triggerVibration();
    
    this.onComplete({
      totalTime: this.totalTime,
      message: 'Repos terminé !'
    });
  }
  
  // ==================== AJUSTEMENTS ====================
  
  addTime(seconds) {
    if (!this.isRunning) {
      return { success: false, message: 'Timer non actif' };
    }
    
    this.timeRemaining += seconds;
    this.totalTime += seconds;
    
    this.onTick({
      timeRemaining: this.timeRemaining,
      progress: this.getProgress(),
      formatted: this.formatTime(this.timeRemaining)
    });
    
    return {
      success: true,
      timeRemaining: this.timeRemaining,
      formatted: this.formatTime(this.timeRemaining)
    };
  }
  
  removeTime(seconds) {
    if (!this.isRunning) {
      return { success: false, message: 'Timer non actif' };
    }
    
    this.timeRemaining = Math.max(0, this.timeRemaining - seconds);
    
    if (this.timeRemaining === 0) {
      this.complete();
    } else {
      this.onTick({
        timeRemaining: this.timeRemaining,
        progress: this.getProgress(),
        formatted: this.formatTime(this.timeRemaining)
      });
    }
    
    return {
      success: true,
      timeRemaining: this.timeRemaining,
      formatted: this.formatTime(this.timeRemaining)
    };
  }
  
  // ==================== GETTERS ====================
  
  getTimeRemaining() {
    return this.timeRemaining;
  }
  
  getTotalTime() {
    return this.totalTime;
  }
  
  getProgress() {
    if (this.totalTime === 0) return 0;
    return Math.round(((this.totalTime - this.timeRemaining) / this.totalTime) * 100);
  }
  
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      timeRemaining: this.timeRemaining,
      totalTime: this.totalTime,
      progress: this.getProgress(),
      formatted: this.formatTime(this.timeRemaining)
    };
  }
  
  // ==================== FORMATAGE ====================
  
  formatTime(seconds) {
    if (seconds < 0) seconds = 0;
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  formatTimeVerbose(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (secs === 0) {
      return `${mins}min`;
    }
    
    return `${mins}min ${secs}s`;
  }
  
  // ==================== ALERTES ====================
  
  playBeep(type = 'warning') {
    // Créer un contexte audio si disponible
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (type === 'complete') {
        // Son de fin : double beep
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
        
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.frequency.value = 1000;
          gain2.gain.value = 0.3;
          osc2.start(audioCtx.currentTime);
          osc2.stop(audioCtx.currentTime + 0.2);
        }, 150);
      } else {
        // Son d'avertissement : beep simple
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.2;
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    }
  }
  
  triggerNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Repos terminé ! 💪', {
          body: 'C\'est parti pour la prochaine série',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: 'timer-complete',
          requireInteraction: false
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.triggerNotification();
          }
        });
      }
    }
  }
  
  triggerVibration() {
    if ('vibrate' in navigator) {
      // Pattern : court-pause-court-pause-long
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }
  
  // ==================== PRESETS ====================
  
  static getCommonDurations() {
    return [
      { label: '30s', value: 30 },
      { label: '45s', value: 45 },
      { label: '1min', value: 60 },
      { label: '1min 15s', value: 75 },
      { label: '1min 30s', value: 90 },
      { label: '1min 45s', value: 105 },
      { label: '2min', value: 120 },
      { label: '2min 30s', value: 150 },
      { label: '3min', value: 180 }
    ];
  }
  
  // ==================== SAUVEGARDE ====================
  
  saveState() {
    const state = {
      timeRemaining: this.timeRemaining,
      totalTime: this.totalTime,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      timestamp: Date.now()
    };
    
    localStorage.setItem('hybrid_master_timer', JSON.stringify(state));
  }
  
  loadState() {
    const saved = localStorage.getItem('hybrid_master_timer');
    if (!saved) return null;
    
    try {
      const state = JSON.parse(saved);
      
      // Vérifier si le timer n'est pas trop ancien (> 10 minutes)
      if (Date.now() - state.timestamp > 600000) {
        return null;
      }
      
      return state;
    } catch (error) {
      console.error('Erreur chargement timer:', error);
      return null;
    }
  }
}

// Export pour utilisation dans app.js
export { TimerManager };
