/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE CORRIGÉE
 * Tous les événements fonctionnels
 */

// ============================================================================
// IMPORTS
// ============================================================================
import ProgramData from './core/program-data.js';
import ProgressionEngine from './core/progression-engine.js';
import WorkoutRenderer from './ui/workout-renderer.js';
import WorkoutSession from './modules/workout-session.js';

// ============================================================================
// ÉTAT DE L'APPLICATION
// ============================================================================
class App {
    constructor() {
        this.currentWeek = 1;
        this.maxWeeks = 26;
        this.currentDay = 0; // 0 = Dimanche
        this.programData = null;
        this.renderer = new WorkoutRenderer();
        this.session = new WorkoutSession();
        this.restTimer = null;
        this.restTimeRemaining = 0;
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        console.log('🚀 Initialisation de l\'application...');

        try {
            // Charger les données du programme
            this.programData = new ProgramData();
            console.log('✅ Données du programme chargées');

            // Initialiser le renderer
            this.renderer.init();
            console.log('✅ Renderer initialisé');

            // Initialiser la session
            this.session.init();
            console.log('✅ Session initialisée');

            // Définir le jour actuel
            this.currentDay = new Date().getDay(); // 0 = Dimanche, 1 = Lundi...
            
            // Attacher les événements
            this.attachEventListeners();
            console.log('✅ Événements attachés');

            // Afficher la séance du jour
            this.renderCurrentWorkout();
            console.log('✅ Application prête !');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur de chargement du programme');
        }
    }

    /**
     * Attacher tous les event listeners
     */
    attachEventListeners() {
        // Navigation de semaine
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');

        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
        }

        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
        }

        // Navigation du bas (onglets)
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => this.handleNavClick(index));
        });

        // Boutons de timer
        const timerStart = document.getElementById('timer-start');
        const timerPause = document.getElementById('timer-pause');
        const timerReset = document.getElementById('timer-reset');

        if (timerStart) {
            timerStart.addEventListener('click', () => this.startTimer());
        }

        if (timerPause) {
            timerPause.addEventListener('click', () => this.pauseTimer());
        }

        if (timerReset) {
            timerReset.addEventListener('click', () => this.resetTimer());
        }

        // Événements des séries (checkboxes)
        document.addEventListener('click', (e) => {
            const checkButton = e.target.closest('.serie-check');
            if (!checkButton) return;

            e.preventDefault();
            e.stopPropagation();

            this.handleSetCompletion(checkButton);
        });

        // Écouter les événements de completion
        document.addEventListener('set-completed', (e) => {
            this.onSetCompleted(e.detail);
        });

        // Écouter les demandes de timer
        document.addEventListener('start-rest-timer', (e) => {
            this.startRestTimer(e.detail.duration);
        });
    }

    /**
     * Gérer le clic sur une série
     */
    handleSetCompletion(checkButton) {
        const exerciseId = checkButton.dataset.exerciseId;
        const setNumber = checkButton.dataset.setNumber;
        const serieItem = checkButton.closest('.serie-item');
        
        if (!serieItem) return;

        // Toggle l'état
        const isCompleted = serieItem.classList.toggle('completed');
        
        // Mettre à jour l'icône
        const checkIcon = checkButton.querySelector('.check-icon');
        if (checkIcon) {
            checkIcon.textContent = isCompleted ? '✓' : '';
        }

        // Sauvegarder l'état
        this.session.markSetCompleted(exerciseId, parseInt(setNumber), isCompleted);

        // Démarrer le timer de repos si série complétée
        if (isCompleted) {
            const exerciseCard = checkButton.closest('.exercise-card');
            const restParam = exerciseCard?.querySelector('.param-item .param-label');
            
            if (restParam && restParam.textContent === 'REPOS') {
                const restValue = restParam.nextElementSibling?.textContent;
                const restSeconds = parseInt(restValue);
                
                if (restSeconds) {
                    this.startRestTimer(restSeconds);
                }
            }
        }

        console.log(`Série ${setNumber} de ${exerciseId}: ${isCompleted ? 'complétée' : 'annulée'}`);
    }

    /**
     * Changer de semaine
     */
    changeWeek(direction) {
        const newWeek = this.currentWeek + direction;

        if (newWeek < 1 || newWeek > this.maxWeeks) {
            console.log('⚠️ Limite de semaines atteinte');
            return;
        }

        this.currentWeek = newWeek;
        console.log(`📅 Semaine ${this.currentWeek}`);
        
        this.updateWeekDisplay();
        this.renderCurrentWorkout();
    }

    /**
     * Mettre à jour l'affichage de la semaine
     */
    updateWeekDisplay() {
        const weekDisplay = document.getElementById('week-display');
        if (!weekDisplay) return;

        const bloc = Math.ceil(this.currentWeek / 4);
        const weekInBloc = ((this.currentWeek - 1) % 4) + 1;
        
        // Déterminer le tempo selon le bloc
        const tempos = ['3-1-2', '2-0-2', '4-0-1', '1-0-1', '3-0-3', '2-1-1'];
        const tempo = tempos[(bloc - 1) % tempos.length];

        weekDisplay.innerHTML = `
            <div class="week-current">Semaine ${this.currentWeek}/${this.maxWeeks}</div>
            <div class="week-date">Bloc ${bloc} • Tempo ${tempo}</div>
        `;

        // Gérer les boutons
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) prevBtn.disabled = this.currentWeek === 1;
        if (nextBtn) nextBtn.disabled = this.currentWeek === this.maxWeeks;
    }

    /**
     * Afficher la séance actuelle
     */
    renderCurrentWorkout() {
        if (!this.programData) {
            console.error('❌ Pas de données de programme');
            return;
        }

        const weekData = this.programData.getWeek(this.currentWeek);
        
        if (!weekData || !weekData.days) {
            console.error('❌ Pas de données pour cette semaine');
            this.showError('Aucune séance trouvée pour cette semaine');
            return;
        }

        // Trouver la séance du jour
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const todayName = dayNames[this.currentDay];
        
        const workoutDay = weekData.days.find(day => 
            day.day.toLowerCase() === todayName
        );

        if (!workoutDay) {
            console.log(`🏖️ Repos le ${todayName}`);
            this.renderer.render(null, this.currentWeek);
            return;
        }

        console.log(`💪 Séance du ${todayName}:`, workoutDay);
        this.renderer.render(workoutDay, this.currentWeek);
    }

    /**
     * Gérer les clics sur la navigation du bas
     */
    handleNavClick(index) {
        // Retirer la classe active de tous les items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));

        // Ajouter la classe active à l'item cliqué
        navItems[index].classList.add('active');

        // Gérer les différentes sections
        switch(index) {
            case 0: // Séance
                this.renderCurrentWorkout();
                break;
            case 1: // Stats
                this.showStats();
                break;
            case 2: // Progrès
                this.showProgress();
                break;
            case 3: // Profil
                this.showProfile();
                break;
        }

        console.log(`📱 Navigation: onglet ${index}`);
    }

    /**
     * Démarrer le timer de repos
     */
    startRestTimer(seconds) {
        // Arrêter le timer existant
        if (this.restTimer) {
            clearInterval(this.restTimer);
        }

        this.restTimeRemaining = seconds;
        
        // Afficher la section timer
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) {
            timerSection.style.display = 'block';
        }

        // Mettre à jour l'affichage
        this.updateTimerDisplay();

        // Démarrer le compte à rebours
        this.restTimer = setInterval(() => {
            this.restTimeRemaining--;
            this.updateTimerDisplay();

            if (this.restTimeRemaining <= 0) {
                this.onTimerComplete();
            }
        }, 1000);

        console.log(`⏱️ Timer démarré: ${seconds}s`);
    }

    /**
     * Mettre à jour l'affichage du timer
     */
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) return;

        const minutes = Math.floor(this.restTimeRemaining / 60);
        const seconds = this.restTimeRemaining % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Changer la couleur selon le temps restant
        if (this.restTimeRemaining <= 10) {
            timerDisplay.style.color = '#ef4444'; // Rouge
        } else if (this.restTimeRemaining <= 30) {
            timerDisplay.style.color = '#f59e0b'; // Orange
        } else {
            timerDisplay.style.color = '#22c55e'; // Vert
        }
    }

    /**
     * Timer terminé
     */
    onTimerComplete() {
        clearInterval(this.restTimer);
        this.restTimer = null;

        // Notification sonore (optionnel)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Masquer le timer après 2 secondes
        setTimeout(() => {
            const timerSection = document.querySelector('.timer-section');
            if (timerSection) {
                timerSection.style.display = 'none';
            }
        }, 2000);

        console.log('✅ Timer terminé !');
    }

    /**
     * Contrôles du timer
     */
    startTimer() {
        if (!this.restTimer && this.restTimeRemaining > 0) {
            this.startRestTimer(this.restTimeRemaining);
        }
    }

    pauseTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
            console.log('⏸️ Timer en pause');
        }
    }

    resetTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
        this.restTimeRemaining = 0;
        
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) {
            timerSection.style.display = 'none';
        }
        
        console.log('🔄 Timer réinitialisé');
    }

    /**
     * Afficher les stats (placeholder)
     */
    showStats() {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-workout">
                <h2>📊 Statistiques</h2>
                <p>Section en cours de développement...</p>
            </div>
        `;
    }

    /**
     * Afficher les progrès (placeholder)
     */
    showProgress() {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-workout">
                <h2>📈 Progression</h2>
                <p>Section en cours de développement...</p>
            </div>
        `;
    }

    /**
     * Afficher le profil (placeholder)
     */
    showProfile() {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-workout">
                <h2>👤 Profil</h2>
                <p>Section en cours de développement...</p>
            </div>
        `;
    }

    /**
     * Gérer la completion d'une série
     */
    onSetCompleted(detail) {
        console.log('✅ Série complétée:', detail);
        // Logique additionnelle si nécessaire
    }

    /**
     * Afficher une erreur
     */
    showError(message) {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-workout">
                <p style="color: #ef4444;">❌ ${message}</p>
            </div>
        `;
    }
}

// ============================================================================
// DÉMARRAGE DE L'APPLICATION
// ============================================================================
const app = new App();

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export pour utilisation externe
export default app;
