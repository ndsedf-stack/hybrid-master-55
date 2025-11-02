/**
 * HYBRID MASTER 51 - TIMER MANAGER
 * Gère le timer de repos entre les séries
 * 
 * @module modules/timer-manager
 * @version 1.0.0
 */

export class TimerManager {
  constructor() {
    this.duration = 0;
    this.remaining = 0;
    this.intervalId = null;
    this.isRunning = false;

    this.initElements();
    this.attachListeners();
  }

  /**
   * Initialise les éléments DOM
   */
  initElements() {
    this.display = document.getElementById('timer-display');
    this.startBtn = document.getElementById('timer-start');
    this.resetBtn = document.getElementById('timer-reset');

    if (!this.display) {
      console.error('❌ Timer display element not found');
    }
  }

  /**
   * Attache les event listeners
   */
  attachListeners() {
    // Bouton start/pause
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        if (this.isRunning) {
          this.pause();
        } else {
          if (this.remaining > 0) {
            this.resume();
          }
        }
      });
    }

    // Bouton reset
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.reset();
      });
    }

    // Event custom pour démarrer le timer
    window.addEventListener('startTimer', (e) => {
      this.start(e.detail.duration);
    });

    // Raccourci clavier ESPACE
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (this.isRunning) {
            this.pause();
          } else if (this.remaining > 0) {
            this.resume();
          }
        }
      }
    });
  }

  /**
   * Démarre un nouveau timer
   * @param {number} seconds - Durée en secondes
   */
  start(seconds) {
    this.duration = seconds;
    this.remaining = seconds;
    this.isRunning = true;

    this.updateDisplay();
    this.updateButtonStates();

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);

    console.log(`⏱️ Timer started: ${seconds}s`);
  }

  /**
   * Tick du timer (chaque seconde)
   */
  tick() {
    if (this.remaining > 0) {
      this.remaining--;
      this.updateDisplay();

      // Animation quand proche de la fin
      if (this.remaining <= 10 && this.remaining > 0) {
        this.display?.classList.add('timer-warning');
      }

      // Timer terminé
      if (this.remaining === 0) {
        this.complete();
      }
    }
  }

  /**
   * Pause le timer
   */
  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.updateButtonStates();
    console.log('⏸️ Timer paused');
  }

  /**
   * Reprend le timer
   */
  resume() {
    if (this.remaining > 0) {
      this.isRunning = true;
      this.intervalId = setInterval(() => {
        this.tick();
      }, 1000);
      this.updateButtonStates();
      console.log('▶️ Timer resumed');
    }
  }

  /**
   * Reset le timer
   */
  reset() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.remaining = 0;
    this.duration = 0;
    this.isRunning = false;

    this.updateDisplay();
    this.updateButtonStates();
    this.display?.classList.remove('timer-warning', 'timer-complete');
    
    console.log('🔄 Timer reset');
  }

  /**
   * Timer terminé
   */
  complete() {
    this.pause();
    this.display?.classList.add('timer-complete');
    this.display?.classList.remove('timer-warning');

    // Notification sonore (si autorisée)
    this.playSound();

    // Vibration mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Event custom
    const event = new CustomEvent('timerCompleted', {
      detail: { duration: this.duration }
    });
    window.dispatchEvent(event);

    console.log('✅ Timer completed');

    // Auto-reset après 3 secondes
    setTimeout(() => {
      this.reset();
    }, 3000);
  }

  /**
   * Joue un son de notification
   */
  playSound() {
    // Créer un bip simple avec Web Audio API
    try {
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
      console.warn('Could not play sound:', error);
    }
  }

  /**
   * Met à jour l'affichage du timer
   */
  updateDisplay() {
    if (!this.display) return;

    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.display.textContent = formatted;

    // Animation pulse si en cours
    if (this.isRunning) {
      this.display.classList.add('timer-active');
    } else {
      this.display.classList.remove('timer-active');
    }
  }

  /**
   * Met à jour l'état des boutons
   */
  updateButtonStates() {
    if (!this.startBtn) return;

    if (this.isRunning) {
      this.startBtn.textContent = '⏸️';
      this.startBtn.title = 'Pause (ESPACE)';
    } else {
      this.startBtn.textContent = '▶️';
      this.startBtn.title = 'Démarrer/Reprendre (ESPACE)';
    }

    // Désactiver boutons si timer à 0
    if (this.startBtn) {
      this.startBtn.disabled = this.remaining === 0 && !this.isRunning;
    }
    if (this.resetBtn) {
      this.resetBtn.disabled = this.remaining === 0 && !this.isRunning;
    }
  }

  /**
   * Retourne si le timer est en cours
   */
  isTimerRunning() {
    return this.isRunning;
  }

  /**
   * Retourne le temps restant
   */
  getRemaining() {
    return this.remaining;
  }
}
