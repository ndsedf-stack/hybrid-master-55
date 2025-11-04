/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 * Point d'entrée de l'application
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { PROGRAM } from './core/program-data.js';
import { ProgressionEngine } from './core/progression-engine.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
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
        this.progressionEngine = new ProgressionEngine(PROGRAM);
        this.session = new WorkoutSession(this.storage);
        this.timer = new TimerManager();
        this.navigation = new NavigationUI();
        
        // Container pour l'affichage
        this.workoutContainer = document.getElementById('workout-container');
        this.workoutRenderer = new WorkoutRenderer(this.workoutContainer, this.session);
        
        // État actuel
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
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

            // Charger l'état sauvegardé
            const savedState = this.storage.loadNavigationState();
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
            // ... (logique d'affichage personnalisée ici)
        } catch (error) {
            console.error('❌ Erreur d\'affichage du workout:', error);
            this.displayError(error.message);
        }
    }

    /**
     * Affichage d'une erreur dans l'UI
     */
    displayError(message) {
        if (this.workoutContainer) {
            this.workoutContainer.innerHTML = `
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
