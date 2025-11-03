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

            // Mettre à jour l'état
            this.currentWeek = week;
            this.currentDay = day;

            // Sauvegarder l'état
            this.storage.saveNavigationState(week, day);

            // Récupérer le workout
            const workout = this.getWorkout(week, day);

            if (!workout) {
                throw new Error(`Aucun workout trouvé pour S${week} - ${day}`);
            }

            // Démarrer la session
            this.session.start(week, day, workout.exercices || []);

            // Afficher le workout via le renderer
            this.workoutRenderer.render(workout);

            // Mettre à jour les statistiques
            this.updateStats();

        } catch (error) {
            console.error('❌ Erreur lors de l\'affichage:', error);
            this.workoutRenderer.renderError(error.message);
        }
    }

    /**
     * Récupère le workout pour une semaine/jour
     */
    getWorkout(week, day) {
        if (!PROGRAM || !PROGRAM.semaines) {
            console.error('❌ Programme non chargé');
            return null;
        }

        const semaine = PROGRAM.semaines.find(s => s.numero === week);
        
        if (!semaine || !semaine.jours) {
            console.error(`❌ Semaine ${week} introuvable`);
            return null;
        }

        const workout = semaine.jours[day];

        if (!workout) {
            console.error(`❌ Jour ${day} introuvable pour semaine ${week}`);
            return null;
        }

        return workout;
    }

    /**
     * Met à jour les statistiques
     */
    updateStats() {
        const stats = this.session.getStats();
        const statsPanel = document.getElementById('stats-panel');
        const statsContent = document.getElementById('stats-content');

        if (statsPanel && statsContent) {
            statsContent.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Exercices:</span>
                    <span class="stat-value">${stats.totalExercises}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Séries totales:</span>
                    <span class="stat-value">${stats.totalSets}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Séries complétées:</span>
                    <span class="stat-value">${stats.completedSets} / ${stats.totalSets}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Progression:</span>
                    <span class="stat-value">${stats.completionRate}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Volume total:</span>
                    <span class="stat-value">${stats.totalVolume} kg</span>
                </div>
            `;
            statsPanel.classList.remove('hidden');
        }
    }

    /**
     * Affiche une erreur
     */
    displayError(message) {
        if (this.workoutContainer) {
            this.workoutContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Erreur de chargement</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-btn">
                        🔄 Recharger la page
                    </button>
                </div>
            `;
        }
    }
}

// ============================================================================
// DÉMARRAGE DE L'APPLICATION
// ============================================================================

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

async function startApp() {
    try {
        const app = new HybridMasterApp();
        await app.init();
        
        // Exposer l'app globalement pour le debugging
        window.hybridMasterApp = app;
        
    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        
        const container = document.getElementById('workout-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">💥</div>
                    <h3>Erreur fatale</h3>
                    <p>${error.message}</p>
                    <p style="font-size: 0.875rem; color: #6b7280; margin-top: 12px;">
                        Ouvrez la console (F12) pour plus de détails
                    </p>
                    <button onclick="location.reload()" class="retry-btn">
                        🔄 Recharger la page
                    </button>
                </div>
            `;
        }
    }
}
