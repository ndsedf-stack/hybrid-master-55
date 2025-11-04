/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 * Point d'entrée de l'application
 */

// ============================================================================
// IMPORTS
// ============================================================================
import ProgramData from './core/program-data.js';
import { ProgressionEngine } from './core/progression-engine.js';
// import { WorkoutRenderer } from './ui/workout-renderer.js'; // <- NE PAS UTILISER ACCOLADE sur un export default !
import WorkoutRenderer from './ui/workout-renderer.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { TimerManager } from './modules/timer-manager.js';
import { WorkoutSession } from './modules/workout-session.js';
import { LocalStorage } from './storage/local-storage.js';

// ============================================================================
// APPLICATION PRINCIPALE
// ============================================================================
class HybridMasterApp {
    constructor() {
        console.log('🚀 Démarrage de Hybrid Master 51...');
        
        // Vérifier les éléments DOM requis
        this.validateDOM();
        
        // Initialiser les modules
        this.storage = new LocalStorage();
        this.progressionEngine = new ProgressionEngine(ProgramData.program);

        // session = progression directe
        this.session = new WorkoutSession(this.storage);

        this.timer = new TimerManager();
        this.navigation = new NavigationUI();

        // Container pour l'affichage
        this.workoutRenderer = new WorkoutRenderer();

        // État actuel
        this.currentWeek = 1;
        this.currentDay = 'dimanche';

        // Flag to prevent duplicate event listeners
        this._workoutEventListenersAdded = false;

        // Setup workout event listeners
        this.setupWorkoutEventListeners();
    }

    /**
     * Configure les écouteurs d'événements pour le workout
     * Protégé contre les appels multiples
     */
    setupWorkoutEventListeners() {
        if (this._workoutEventListenersAdded) {
            console.log('⚠️ Event listeners déjà ajoutés, skip');
            return;
        }

        // Écouteur pour le démarrage du timer de repos
        document.addEventListener('start-rest-timer', (event) => {
            if (!this.timer) {
                console.warn('⚠️ Timer non disponible');
                return;
            }
            const duration = Number(event.detail?.duration) || 60;
            console.log(`⏱️ Démarrage timer repos: ${duration}s`);
            if (typeof this.timer.startRest === 'function') {
                this.timer.startRest(duration);
            }
        });

        // Écouteur pour la complétion d'une série
        document.addEventListener('set-completed', (event) => {
            if (!this.session) {
                console.warn('⚠️ Session non disponible');
                return;
            }
            const { exerciseId, setIndex, completed } = event.detail || {};
            if (!exerciseId || setIndex === undefined) {
                console.warn('⚠️ Données de série incomplètes');
                return;
            }

            const setNum = parseInt(setIndex, 10);
            if (isNaN(setNum)) {
                console.warn('⚠️ Index de série invalide');
                return;
            }

            if (completed) {
                if (typeof this.session.completeSet === 'function') {
                    this.session.completeSet(exerciseId, setNum);
                }
            } else {
                if (typeof this.session.uncompleteSet === 'function') {
                    this.session.uncompleteSet(exerciseId, setNum);
                }
            }
        });

        // Écouteur pour le changement de poids
        document.addEventListener('weight-changed', (event) => {
            if (!this.session) {
                console.warn('⚠️ Session non disponible');
                return;
            }
            const { exerciseId, setIndex, weight } = event.detail || {};
            if (!exerciseId || setIndex === undefined || weight === undefined) {
                console.warn('⚠️ Données de poids incomplètes');
                return;
            }

            const setNum = parseInt(setIndex, 10);
            const weightNum = Number(weight);
            if (isNaN(setNum) || isNaN(weightNum)) {
                console.warn('⚠️ Index ou poids invalide');
                return;
            }

            if (typeof this.session.updateWeight === 'function') {
                this.session.updateWeight(exerciseId, setNum, weightNum);
            }
        });

        this._workoutEventListenersAdded = true;
        console.log('✅ Event listeners configurés');
    }

    /**
     * Valide que tous les éléments DOM requis sont présents
     */
    validateDOM() {
        const requiredIds = [
            'app',
            'workout-container',
            'week-display',
            'prev-week',
            'next-week',
            'timer-display',
            'timer-start',
            'timer-pause',
            'timer-reset'
        ];

        const missing = requiredIds.filter(id => !document.getElementById(id));

        if (missing.length > 0) {
            console.error('❌ Éléments DOM manquants:', missing);
            throw new Error(`Éléments DOM manquants: ${missing.join(', ')}`);
        }

        console.log('✅ Tous les éléments DOM sont présents');
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            console.log('✅ Initialisation de l\'application...');

            // Initialiser les sous-modules
            this.timer.init();
            this.navigation.init();

            // Charger l'état sauvegardé (par défaut si rien dans le storage)
            const savedState = this.storage.loadNavigationState() || { week: 1, day: 'dimanche' };
            this.currentWeek = savedState.week;
            this.currentDay = savedState.day;

            // Configurer les callbacks de navigation
            this.navigation.onWeekChange = (week, day) => this.displayWorkout(week, day);
            this.navigation.onDayChange = (week, day) => this.displayWorkout(week, day);

            // Restaurer l'état de navigation
            this.navigation.setState(this.currentWeek, this.currentDay);

            // Afficher le workout initial
            await this.displayWorkout(this.currentWeek, this.currentDay);

            console.log('✅ Application initialisée !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.displayError(error.message);
        }
    }

    /**
     * Affiche le workout pour une semaine et un jour donnés
     */
    async displayWorkout(week, day) {
        try {
            console.log(`🎯 Affichage Semaine ${week} - ${day}`);
            // RECUPERER le bon workout via ProgramData
            const workoutDay = ProgramData.getWorkout(week, day);
            this.workoutRenderer.render(workoutDay, week);
        } catch (error) {
            console.error('❌ Erreur d\'affichage du workout:', error);
            this.displayError(error.message);
        }
    }

    /**
     * Affichage d'une erreur dans l'UI
     */
    displayError(message) {
        const container = document.getElementById('workout-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>🚨 Erreur : ${message}</p>
                </div>
            `;
        }
    }
}

// ============================================================================
// Point d'entrée --- démarre l'application au chargement
// ============================================================================
const app = new HybridMasterApp();
app.init();
