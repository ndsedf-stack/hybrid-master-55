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

        // marqueur d'initialisation des listeners (idempotence)
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
            this.workoutRenderer.init?.();

            // Charger l'état sauvegardé (par défaut si rien dans le storage)
            const savedState = this.storage.loadNavigationState?.() || { week: 1, day: 'dimanche' };
            this.currentWeek = savedState.week;
            this.currentDay = savedState.day;

            // Configurer les callbacks de navigation
            this.navigation.onWeekChange = (week, day) => this.displayWorkout(week, day);
            this.navigation.onDayChange = (week, day) => this.displayWorkout(week, day);

            // Restaurer l'état de navigation
            this.navigation.setState(this.currentWeek, this.currentDay);

            // ✅ NOUVEAU : Connecter les événements du workout (idempotent)
            this.setupWorkoutEvents();

            // Afficher le workout initial
            await this.displayWorkout(this.currentWeek, this.currentDay);

            console.log('✅ Application initialisée !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.displayError(error?.message || String(error));
        }
    }

    /**
     * ✅ CORRECTION : Configure les écouteurs d'événements du workout (idempotent)
     */
    setupWorkoutEvents() {
        // Protection contre exécution multiple
        if (this._workoutEventsSetup) {
            console.warn('⚠️ Écouteurs déjà configurés, skip');
            return;
        }
        this._workoutEventsSetup = true;

        // 1. Événement : Démarrage du timer de repos
        document.addEventListener('start-rest-timer', (e) => {
            const duration = Number(e?.detail?.duration) || 0;
            if (duration <= 0) {
                console.warn('⚠️ Durée invalide pour le timer:', duration);
                return;
            }
            if (!this.timer || typeof this.timer.start !== 'function') {
                console.warn('⚠️ Timer non initialisé ou API start manquante');
                return;
            }
            console.log(`⏱️ Démarrage timer repos: ${duration}s`);
            this.timer.reset?.();
            this.timer.start(duration);
        });

        // 2. Événement : Changement de poids
        document.addEventListener('weight-changed', (e) => {
            const { exerciseId, newWeight } = e?.detail || {};
            if (exerciseId === undefined || newWeight === undefined) {
                console.warn('⚠️ Données invalides pour weight-changed:', e?.detail);
                return;
            }
            const w = Number(newWeight);
            if (!Number.isFinite(w)) {
                console.warn('⚠️ Poids non numérique:', newWeight);
                return;
            }
            console.log(`💪 Poids modifié: exercice ${exerciseId} → ${w}kg`);
            if (this.session && typeof this.session.updateWeight === 'function') {
                this.session.updateWeight(exerciseId, 0, w);
            }
        });

        // 3. Événement : Série complétée/décochée
        document.addEventListener('set-completed', (e) => {
            const { exerciseId, setNumber, isChecked } = e?.detail || {};
            if (exerciseId === undefined || setNumber === undefined) {
                console.warn('⚠️ Données invalides pour set-completed:', e?.detail);
                return;
            }
            
            const setIndex = Number.parseInt(setNumber, 10) - 1;
            if (!Number.isInteger(setIndex) || setIndex < 0) {
                console.warn('⚠️ Index de série invalide:', setNumber);
                return;
            }
            
            if (!this.session) {
                console.warn('⚠️ Session non initialisée');
                return;
            }
            
            if (isChecked) {
                console.log(`✅ Série ${setNumber} complétée (exercice ${exerciseId})`);
                if (typeof this.session.completeSet === 'function') {
                    this.session.completeSet(exerciseId, setIndex);
                }
            } else {
                console.log(`❌ Série ${setNumber} décochée (exercice ${exerciseId})`);
                if (typeof this.session.uncompleteSet === 'function') {
                    this.session.uncompleteSet(exerciseId, setIndex);
                }
            }
        });

        console.log('✅ Événements workout connectés (3 listeners)');
    }

    /**
     * Affiche le workout pour une semaine et un jour donnés
     */
    async displayWorkout(week, day) {
        try {
            console.log(`🎯 Affichage Semaine ${week} - ${day}`);
            // Récupérer le workout via ProgramData
            const workoutDay = ProgramData.getWorkout(week, day);
            if (!workoutDay) {
                throw new Error(`Workout introuvable pour S${week} - ${day}`);
            }

            // Mettre à jour l'état actuel
            this.currentWeek = week;
            this.currentDay = day;

            // Sauvegarder l'état de navigation si possible
            this.storage.saveNavigationState?.(week, day);

            // ✅ CORRIGÉ : Démarrer la session avec API compatible (start / startSession)
            if (this.session && typeof this.session.start === 'function') {
                this.session.start(week, day, workoutDay.exercises);
            } else if (this.session && typeof this.session.startSession === 'function') {
                this.session.startSession(week, day, workoutDay.exercises);
            } else {
                console.warn('⚠️ WorkoutSession.start() non disponible');
            }

            // Rendre le workout
            this.workoutRenderer.render?.(workoutDay, week);
        } catch (error) {
            console.error('❌ Erreur d\'affichage du workout:', error);
            this.displayError(error?.message || String(error));
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
// Expose app sur window pour faciliter le debug / tests console
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HybridMasterApp();
    window.app.init();
});
