/**
 * TIMER MANAGER - Gestion des timers de repos
 * Module pour gérer les temps de repos entre séries
 * 
 * @module modules/timer-manager
 * @version 1.0.0
 */

export class TimerManager {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.timeRemaining = 0;
    this.timerInterval = null;
    this.displayElement = null;
    
    this.initDisplay();
    this.attachEventListeners();
  }

  /**
   * Initialise l'affichage du timer
   */
  initDisplay() {
    this.displayElement = document.getElementById('timer-display');
    
    if (!this.displayElement) {
      console.warn('Timer display element not found');
    }
  }

  /**
   * Attache les event listeners
   */
  attachEventListeners() {
    // Boutons contrôle
    const startBtn = document.getElementById('timer-start');
    const pauseBtn = document.getElementById('timer-pause');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.toggle());
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pause());
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Raccourci clavier ESPACE
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Démarre un timer avec durée spécifiée
   * @param {number} seconds - Durée en secondes
   */
  start(seconds) {
    if (this.isRunning && !this.isPaused) {
      return;
    }

    this.timeRemaining = seconds;
    this.isRunning = true;
    this.isPaused = false;

    this.updateDisplay();
    this.startInterval();

    // Émettre événement
    window.dispatchEvent(new CustomEvent('timerStarted', {
      detail: { duration: seconds }
    }));
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (!this.isRunning) {
      // Démarrer avec temps par défaut (90s)
      this.start(90);
    } else if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Met en pause
   */
  pause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.isPaused = true;
    this.stopInterval();

    window.dispatchEvent(new CustomEvent('timerPaused'));
  }

  /**
   * Reprend après pause
   */
  resume() {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.startInterval();

    window.dispatchEvent(new CustomEvent('timerResumed'));
  }

  /**
   * Arrête et réinitialise
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.timeRemaining = 0;
    this.stopInterval();
    this.updateDisplay();

    window.dispatchEvent(new CustomEvent('timerStopped'));
  }

  /**
   * Réinitialise au temps initial
   */
  reset() {
    const initialTime = this.timeRemaining;
    this.stop();
    
    window.dispatchEvent(new CustomEvent('timerReset', {
      detail: { duration: initialTime }
    }));
  }

  /**
   * Démarre l'intervalle
   */
  startInterval() {
    this.stopInterval(); // Nettoie l'ancien intervalle

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Arrête l'intervalle
   */
  stopInterval() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Tick du timer (chaque seconde)
   */
  tick() {
    if (this.isPaused) {
      return;
    }

    this.timeRemaining--;

    // Notification à 10 secondes
    if (this.timeRemaining === 10) {
      this.playBeep();
      window.dispatchEvent(new CustomEvent('timerWarning'));
    }

    // Timer terminé
    if (this.timeRemaining <= 0) {
      this.complete();
      return;
    }

    this.updateDisplay();
  }

  /**
   * Timer terminé
   */
  complete() {
    this.stop();
    this.playEndSound();
    this.vibrate();

    window.dispatchEvent(new CustomEvent('timerCompleted'));

    // Notification navigateur
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Repos terminé !', {
        body: 'Prêt pour la prochaine série',
        icon: '/icon-192x192.png'
      });
    }
  }

  /**
   * Met à jour l'affichage
   */
  updateDisplay() {
    if (!this.displayElement) {
      return;
    }

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.displayElement.textContent = timeString;

    // Classes CSS selon état
    this.displayElement.classList.toggle('running', this.isRunning && !this.isPaused);
    this.displayElement.classList.toggle('paused', this.isPaused);
    this.displayElement.classList.toggle('warning', this.timeRemaining <= 10);
  }

  /**
   * Joue un bip
   */
  playBeep() {
    if ('AudioContext' in window) {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  }

  /**
   * Joue le son de fin
   */
  playEndSound() {
    if ('AudioContext' in window) {
      const audioCtx = new AudioContext();
      
      // Séquence de 3 bips
      [0, 0.15, 0.3].forEach(delay => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.1);

        oscillator.start(audioCtx.currentTime + delay);
        oscillator.stop(audioCtx.currentTime + delay + 0.1);
      });
    }
  }

  /**
   * Vibration (mobile)
   */
  vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  /**
   * Obtient le temps restant
   */
  getTimeRemaining() {
    return this.timeRemaining;
  }

  /**
   * Vérifie si le timer tourne
   */
  isTimerRunning() {
    return this.isRunning && !this.isPaused;
  }
}
