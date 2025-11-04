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
        this._workoutEventsSetup = false;
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
            
            // Setup workout event listeners
            this.setupWorkoutEvents();

            // Afficher le workout initial
            await this.displayWorkout(this.currentWeek, this.currentDay);

            console.log('✅ Application initialisée !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.displayError(error.message);
        }
    }

    /**
     * Setup workout event listeners (idempotent)
     */
    setupWorkoutEvents() {
        if (this._workoutEventsSetup) {
            return; // Already setup, avoid duplicates
        }
        
        // Listen for rest timer start event
        document.addEventListener('start-rest-timer', (e) => {
            const seconds = e.detail?.seconds;
            if (seconds && this.timer) {
                const parsedSeconds = Number(seconds);
                if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
                    this.timer.reset();
                    this.timer.start(parsedSeconds);
                }
            }
        });
        
        // Listen for set completion event
        document.addEventListener('set-completed', (e) => {
            const { exerciseId, setIndex, completed } = e.detail || {};
            if (exerciseId != null && setIndex != null && this.session) {
                const parsedSetIndex = parseInt(setIndex, 10);
                if (!isNaN(parsedSetIndex)) {
                    if (completed) {
                        this.session.completeSet(exerciseId, parsedSetIndex);
                    } else {
                        this.session.uncompleteSet(exerciseId, parsedSetIndex);
                    }
                }
            }
        });
        
        // Listen for weight change event
        document.addEventListener('weight-changed', (e) => {
            const { exerciseId, setIndex, newWeight } = e.detail || {};
            if (exerciseId != null && setIndex != null && newWeight != null && this.session) {
                const parsedSetIndex = parseInt(setIndex, 10);
                const parsedWeight = Number(newWeight);
                if (!isNaN(parsedSetIndex) && !isNaN(parsedWeight)) {
                    this.session.updateWeight(exerciseId, parsedSetIndex, parsedWeight);
                }
            }
        });
        
        this._workoutEventsSetup = true;
        console.log('✅ Workout event listeners configured');
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
            
            // Start session with compatibility for both start() and startSession()
            if (this.session) {
                const exercises = workoutDay?.exercises || [];
                // Use start() method which is the standard method name
                if (typeof this.session.start === 'function') {
                    this.session.start(week, day, exercises);
                } else if (typeof this.session.startSession === 'function') {
                    // Fallback for compatibility
                    this.session.startSession(week, day, exercises);
                }
            }
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
