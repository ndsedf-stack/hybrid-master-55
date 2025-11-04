/**
 * TIMER MANAGER - Gestion du chronomètre (corrigé)
 */

export class TimerManager {
    constructor() {
        this.seconds = 0;
        this.isRunning = false;
        this.interval = null;
        this.targetSeconds = null;
        this.onTick = null;
        this.onComplete = null;

        // Éléments DOM
        this.display = document.getElementById('timer-display');
        this.startBtn = document.getElementById('timer-start');
        this.pauseBtn = document.getElementById('timer-pause');
        this.resetBtn = document.getElementById('timer-reset');

        // Protection pour init
        this._listenersAdded = false;
    }

    /**
     * Initialise le timer
     */
    init() {
        if (this._listenersAdded) return;
        this._listenersAdded = true;

        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.reset());
        }

        // Raccourci clavier ESPACE — ignore INPUT, TEXTAREA et contentEditable
        document.addEventListener('keydown', (e) => {
            try {
                const tag = e.target?.tagName?.toUpperCase();
                const isEditable = e.target?.isContentEditable;
                if (e.code === 'Space' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !isEditable) {
                    e.preventDefault();
                    this.toggle();
                }
            } catch (err) {
                // defensive: ne pas planter si e.target inattendu
            }
        });

        this.updateDisplay();
        this.updateButtons();
        console.log('✅ TimerManager initialisé');
    }

    /**
     * Démarre le timer
     */
    start(targetSeconds = null) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.targetSeconds = targetSeconds;

        // Retirer état "finished" si présent
        if (this.display) this.display.classList.remove('finished');

        this.interval = setInterval(() => {
            this.seconds++;
            this.updateDisplay();

            if (typeof this.onTick === 'function') {
                try { this.onTick(this.seconds); } catch (e) { console.warn('onTick error', e); }
            }

            // Vérifier si l'objectif est atteint
            if (this.targetSeconds && this.seconds >= this.targetSeconds) {
                this.complete();
            }
        }, 1000);

        this.updateButtons();
        console.log(`▶️ Timer démarré ${targetSeconds ? `(${targetSeconds}s)` : ''}`);
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
        console.log('⏸️ Timer en pause');
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

        // Retirer classe finished si présente
        if (this.display) this.display.classList.remove('finished');

        this.updateDisplay();
        this.updateButtons();
        console.log('🔄 Timer réinitialisé');
    }

    /**
     * Timer terminé
     */
    complete() {
        this.pause();

        // Marquer comme terminé (classe .finished)
        if (this.display) {
            this.display.classList.remove('running', 'paused');
            this.display.classList.add('finished');
        }

        this.playSound();

        if (typeof this.onComplete === 'function') {
            try { this.onComplete(this.seconds); } catch (e) { console.warn('onComplete error', e); }
        }

        // Demander la permission si nécessaire et envoyer notification
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                try {
                    new Notification('⏱️ Timer terminé !', {
                        body: `Temps écoulé : ${this.formatTime(this.seconds)}`,
                        icon: '/icon.png'
                    });
                } catch (e) { /* ignore */ }
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then((result) => {
                    console.log('📬 Permission notification:', result);
                    if (result === 'granted') {
                        try {
                            new Notification('⏱️ Timer terminé !', {
                                body: `Temps écoulé : ${this.formatTime(this.seconds)}`
                            });
                        } catch (e) { /* ignore */ }
                    }
                }).catch(() => {/* ignore */});
            }
        }

        // Notification visuelle dans l'UI
        this.showNotification('✅ Timer terminé !');
        console.log('✅ Timer terminé');
    }

    /**
     * Affiche une notification visuelle (petit toast)
     */
    showNotification(message) {
        try {
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        } catch (e) {
            // ignore DOM errors
        }
    }

    /**
     * Joue un son
     */
    playSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvPaiTcIG2m98OScTgwOUKru97RgGgU7k9n0x3QoBS1+zPLaizsJHGu+8eadUQ0PWKvm9LFeFQU=');
            audio.play().catch(() => {});
        } catch (e) {
            // ignore audio errors
        }
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

            // Classes CSS selon l'état
            this.display.classList.toggle('running', this.isRunning);
            this.display.classList.toggle('paused', !this.isRunning && this.seconds > 0);
        }
    }

    /**
     * ✅ Utilise la classe .hidden pour masquer/afficher les boutons (préférer CSS)
     */
    updateButtons() {
        if (this.startBtn && this.pauseBtn) {
            if (this.isRunning) {
                this.startBtn.classList.add('hidden');
                this.pauseBtn.classList.remove('hidden');
            } else {
                this.startBtn.classList.remove('hidden');
                this.pauseBtn.classList.add('hidden');
            }
        } else {
            // Fallback si pas de classes disponibles : tenter style
            if (this.startBtn) this.startBtn.style.display = this.isRunning ? 'none' : 'inline-flex';
            if (this.pauseBtn) this.pauseBtn.style.display = this.isRunning ? 'inline-flex' : 'none';
        }
    }

    /**
     * Récupère l'état actuel
     */
    getState() {
        return {
            seconds: this.seconds,
            isRunning: this.isRunning,
            targetSeconds: this.targetSeconds
        };
    }

    /**
     * Restaure un état
     */
    setState(seconds, isRunning = false) {
        this.reset();
        this.seconds = Number(seconds) || 0;
        if (isRunning) this.start();
        this.updateDisplay();
    }
}
