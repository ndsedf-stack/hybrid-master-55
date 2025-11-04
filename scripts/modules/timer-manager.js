/**
 * TIMER MANAGER - Gestion du chronomètre
 */

export class TimerManager {
    constructor() {
        this.seconds = 0;
        this.isRunning = false;
        this.isFinished = false;
        this.interval = null;
        this.targetSeconds = null;
        this.onTick = null;
        this.onComplete = null;

        // Éléments DOM
        this.display = document.getElementById('timer-display');
        this.startBtn = document.getElementById('timer-start');
        this.pauseBtn = document.getElementById('timer-pause');
        this.resetBtn = document.getElementById('timer-reset');
    }

    /**
     * Initialise le timer
     */
    init() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }

        // Raccourci clavier ESPACE
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Request notification permission if default
        this.requestNotificationPermission();

        this.updateDisplay();
        this.updateButtons();
        console.log('✅ TimerManager initialisé');
    }

    /**
     * Request notification permission
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ Notification permission granted');
                } else {
                    console.log('ℹ️ Notification permission denied');
                }
            });
        }
    }

    /**
     * Démarre le timer
     */
    start(targetSeconds = null) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isFinished = false;
        this.targetSeconds = targetSeconds;
        
        // Remove finished class when starting
        if (this.display) {
            this.display.classList.remove('finished');
        }

        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();

            if (this.onTick) {
                this.onTick(this.seconds);
            }

            // Vérifier si l'objectif est atteint
            if (this.targetSeconds && this.seconds >= this.targetSeconds) {
                this.complete();
            }
        }, 1000);

        this.updateButtons();
        this.updateDisplay();
    }

    /**
     * Met en pause
     */
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.updateButtons();
        this.updateDisplay();
    }

    /**
     * Toggle start/pause
     */
    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    /**
     * Réinitialise
     */
    reset() {
        this.pause();
        this.seconds = 0;
        this.targetSeconds = null;
        this.isFinished = false;
        
        // Remove finished class on reset
        if (this.display) {
            this.display.classList.remove('finished');
        }
        
        this.updateDisplay();
        this.updateButtons();
    }

    /**
     * Timer terminé
     */
    complete() {
        this.pause();
        this.isFinished = true;
        
        // Add finished class for visual alert
        if (this.display) {
            this.display.classList.add('finished');
        }
        
        // Play sound
        this.playSound();
        
        // Show visual notification
        this.showVisualNotification();
        
        if (this.onComplete) {
            this.onComplete(this.seconds);
        }

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('⏱️ Timer terminé !', {
                body: `Temps écoulé : ${this.formatTime(this.seconds)}`,
                icon: '/icon.png'
            });
        }
        
        this.updateDisplay();
    }

    /**
     * Show visual notification
     */
    showVisualNotification() {
        // Create a temporary visual notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px 50px;
            border-radius: 15px;
            font-size: 2rem;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(220, 53, 69, 0.6);
            animation: alert-bounce 0.5s ease-out;
        `;
        notification.textContent = '⏱️ Timer terminé !';
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes alert-bounce {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s ease-out';
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 500);
        }, 3000);
    }

    /**
     * Joue un son
     */
    playSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvPaiTcIG2m98OScTgwOUKru97RgGgU7k9n0x3QoBS1+zPLaizsJHGu+8eadUQ0PWKvm9LFeFQU=');
        audio.play().catch(() => {});
    }

    /**
     * Formate le temps
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Met à jour l'affichage
     */
    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.formatTime(this.seconds);

            // Classe CSS selon l'état
            this.display.classList.toggle('running', this.isRunning);
            this.display.classList.toggle('paused', !this.isRunning && this.seconds > 0 && !this.isFinished);
            this.display.classList.toggle('finished', this.isFinished);
        }
    }

    /**
     * Met à jour les boutons
     */
    updateButtons() {
        if (this.startBtn) {
            this.startBtn.style.display = this.isRunning ? 'none' : 'inline-flex';
        }
        if (this.pauseBtn) {
            this.pauseBtn.style.display = this.isRunning ? 'inline-flex' : 'none';
        }
    }

    /**
     * Récupère l'état actuel
     */
    getState() {
        return {
            seconds: this.seconds,
            isRunning: this.isRunning,
            isFinished: this.isFinished,
            targetSeconds: this.targetSeconds
        };
    }

    /**
     * Restaure un état
     */
    setState(seconds, isRunning = false) {
        this.reset();
        this.seconds = seconds;
        if (isRunning) {
            this.start();
        }
        this.updateDisplay();
    }
}
