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

        // ✅ CORRECTION TIMER - Écouter les événements de repos
        this._setupWorkoutEventListeners();
    }

    /**
     * Configure les écouteurs d'événements pour le workout
     */
    _setupWorkoutEventListeners() {
        // ✅ CORRECTION TIMER - Écouter les événements de repos
        document.addEventListener('start-rest-timer', (e) => {
            console.log('🕒 Timer démarré via événement:', e?.detail);
            const duration = Number(e?.detail?.duration) || 0;
            if (!this.timer) { console.warn('Timer non initialisé'); return; }
            if (duration > 0) { this.timer.reset?.(); this.timer.start?.(duration); }
        });

        document.addEventListener('set-completed', (e) => {
            const { exerciseId, setNumber, isChecked } = e?.detail || {};
            console.log(`✅ Série ${setNumber} ${isChecked ? 'cochée' : 'décochée'} pour ${exerciseId}`);
            if (!this.session || !exerciseId) return;
            const idx = Number.parseInt(setNumber, 10) - 1;
            if (Number.isNaN(idx) || idx < 0) return;
            if (isChecked) { this.session.completeSet(exerciseId, idx); } else { this.session.uncompleteSet(exerciseId, idx); }
        });

        document.addEventListener('weight-changed', (e) => {
            const { exerciseId, newWeight } = e?.detail || {};
            console.log(`⚖️ Poids changé: ${exerciseId} -> ${newWeight}kg`);
            if (!this.session || !exerciseId) return;
            const weight = Number(newWeight);
            if (Number.isFinite(weight)) { 
                // Update weight for set index 0 (all sets share the same weight)
                this.session.updateWeight(exerciseId, 0, weight); 
            }
        });

        console.log('✅ Événements de workout configurés');
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
