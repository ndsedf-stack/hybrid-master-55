/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 * Point d'entrée de l'application
 */

// ============================================================================
// IMPORTS - Commentés car les fichiers n'existent pas encore
// ============================================================================
// import ProgramData from './core/program-data.js';
// import { ProgressionEngine } from './core/progression-engine.js';
// import WorkoutRenderer from './ui/workout-renderer.js';
// import { NavigationUI } from './ui/navigation-ui.js';
// import { TimerManager } from './modules/timer-manager.js';
// import { WorkoutSession } from './modules/workout-session.js';
// import { LocalStorage } from './storage/local-storage.js';

// ============================================================================
// APPLICATION PRINCIPALE
// ============================================================================
class HybridMasterApp {
    constructor() {
        console.log('🚀 Démarrage de Hybrid Master 51...');
        
        // Vérifier les éléments DOM requis
        this.validateDOM();
        
        // État actuel
        this.currentWeek = 1;
        this.currentDay = 'dimanche';

        // Initialiser les gestionnaires basiques
        this.initBasicHandlers();
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
     * Initialise les gestionnaires basiques
     */
    initBasicHandlers() {
        // Boutons de navigation
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeWeek(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeWeek(1));
        }

        // Boutons du timer (basique)
        const timerStart = document.getElementById('timer-start');
        const timerPause = document.getElementById('timer-pause');
        const timerReset = document.getElementById('timer-reset');

        if (timerStart) {
            timerStart.addEventListener('click', () => {
                console.log('⏱️ Timer démarré');
                // TODO: implémenter le timer
            });
        }

        if (timerPause) {
            timerPause.addEventListener('click', () => {
                console.log('⏸️ Timer en pause');
                // TODO: implémenter le timer
            });
        }

        if (timerReset) {
            timerReset.addEventListener('click', () => {
                console.log('🔄 Timer réinitialisé');
                // TODO: implémenter le timer
            });
        }

        console.log('✅ Gestionnaires basiques initialisés');
    }

    /**
     * Change de semaine
     */
    changeWeek(delta) {
        const newWeek = this.currentWeek + delta;
        
        // Limiter entre 1 et 26
        if (newWeek < 1 || newWeek > 26) {
            console.warn('⚠️ Semaine hors limites:', newWeek);
            return;
        }

        this.currentWeek = newWeek;
        this.updateDisplay();
    }

    /**
     * Met à jour l'affichage
     */
    updateDisplay() {
        // Mettre à jour l'affichage de la semaine
        const weekDisplay = document.getElementById('week-display');
        if (weekDisplay) {
            const weekCurrent = weekDisplay.querySelector('.week-current');
            if (weekCurrent) {
                weekCurrent.textContent = `Semaine ${this.currentWeek}/26`;
            }

            // Déterminer le bloc et la technique
            let bloc = 1;
            let technique = 'Tempo 3-1-2';
            
            if (this.currentWeek >= 7 && this.currentWeek <= 12) {
                bloc = 2;
                technique = 'Rest-Pause';
            } else if (this.currentWeek >= 13 && this.currentWeek <= 18) {
                bloc = 3;
                technique = 'Drop-sets + Myo-reps';
            } else if (this.currentWeek >= 19) {
                bloc = 4;
                technique = 'Cluster sets + Partials';
            }

            const weekDate = weekDisplay.querySelector('.week-date');
            if (weekDate) {
                weekDate.textContent = `Bloc ${bloc} • ${technique}`;
            }
        }

        // Activer/désactiver les boutons
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) {
            prevBtn.disabled = this.currentWeek === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentWeek === 26;
        }

        // Afficher le message temporaire dans workout-container
        const container = document.getElementById('workout-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #9BA3B0;">
                    <h2 style="color: #00d4aa; margin-bottom: 1rem;">
                        📅 Semaine ${this.currentWeek} - ${this.currentDay}
                    </h2>
                    <p>Les données du programme seront chargées depuis program-data.js</p>
                    <p style="margin-top: 1rem; font-size: 0.9rem;">
                        ℹ️ Il faut maintenant corriger les autres fichiers JS pour que le contenu s'affiche
                    </p>
                </div>
            `;
        }

        console.log(`✅ Affichage mis à jour: Semaine ${this.currentWeek}`);
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            console.log('✅ Initialisation de l\'application...');

            // Affichage initial
            this.updateDisplay();

            console.log('✅ Application initialisée !');
            console.log('ℹ️  Navigation fonctionnelle - Les autres modules seront ajoutés progressivement');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
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
                <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 1rem; padding: 1.5rem; margin: 2rem 0;">
                    <h3 style="color: #ef4444; margin-bottom: 0.5rem;">🚨 Erreur</h3>
                    <p style="color: #E6E9EF;">${message}</p>
                </div>
            `;
        }
    }
}

// ============================================================================
// Point d'entrée --- démarre l'application au chargement
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HybridMasterApp();
    window.app.init();
});
