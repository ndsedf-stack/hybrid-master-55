/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 * Point d'entrée de l'application
 * 
 * @module app
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { ProgramData } from './core/program-data.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { TimerManager } from './modules/timer-manager.js';
import { WorkoutSession } from './modules/workout-session.js';
import { LocalStorage } from './storage/local-storage.js';

// ============================================================================
// CLASSE APPLICATION
// ============================================================================

class HybridMasterApp {
  constructor() {
    this.programData = null;
    this.workoutRenderer = null;
    this.navigationUI = null;
    this.timerManager = null;
    this.workoutSession = null;
    this.storage = null;

    this.init();
  }

  /**
   * Initialise l'application
   */
  async init() {
    console.log('🚀 Initializing Hybrid Master 51...');

    try {
      // 1. Initialiser le stockage
      this.storage = new LocalStorage();
      console.log('✅ Storage initialized');

      // 2. Charger les données du programme
      this.programData = new ProgramData();
      console.log('✅ Program data loaded');

      // 3. Initialiser les modules UI
      this.workoutRenderer = new WorkoutRenderer();
      this.navigationUI = new NavigationUI(this.programData);
      console.log('✅ UI modules initialized');

      // 4. Initialiser les modules fonctionnels
      this.timerManager = new TimerManager();
      this.workoutSession = new WorkoutSession(this.programData);
      console.log('✅ Functional modules initialized');

      // 5. Attacher les event listeners
      this.attachEventListeners();
      console.log('✅ Event listeners attached');

      // 6. Afficher le workout initial
      this.renderCurrentWorkout();
      console.log('✅ Initial workout rendered');

      console.log('🎉 Application ready!');

    } catch (error) {
      console.error('❌ Error initializing app:', error);
      this.showError('Erreur lors du chargement de l\'application');
    }
  }

  /**
   * Attache tous les event listeners
   */
  attachEventListeners() {
    // Navigation : changement de semaine
    window.addEventListener('weekChanged', (e) => {
      console.log('Week changed:', e.detail);
      this.renderCurrentWorkout();
    });

    // Navigation : changement de jour
    window.addEventListener('dayChanged', (e) => {
      console.log('Day changed:', e.detail);
      this.renderCurrentWorkout();
    });

    // Workout : série complétée
    window.addEventListener('setCompleted', (e) => {
      console.log('Set completed:', e.detail);
      this.handleSetCompleted(e.detail);
    });

    // Workout : poids modifié
    window.addEventListener('weightChanged', (e) => {
      console.log('Weight changed:', e.detail);
      this.handleWeightChanged(e.detail);
    });

    // Session : démarrage
    window.addEventListener('workoutStarted', (e) => {
      console.log('Workout started:', e.detail);
      this.handleWorkoutStarted(e.detail);
    });

    // Session : fin
    window.addEventListener('sessionEnded', (e) => {
      console.log('Session ended:', e.detail);
      this.handleSessionEnded(e.detail);
    });

    // Timer : fin
    window.addEventListener('timerCompleted', () => {
      console.log('Timer completed');
      this.handleTimerCompleted();
    });
  }

  /**
   * Affiche le workout actuel
   */
  renderCurrentWorkout() {
    const week = this.navigationUI.getCurrentWeek();
    const day = this.navigationUI.getCurrentDay();

    console.log(`Rendering workout: Week ${week}, ${day}`);

    const workout = this.programData.getWorkout(week, day);

    if (!workout) {
      console.warn(`No workout found for week ${week}, day ${day}`);
      this.workoutRenderer.clear();
      return;
    }

    this.workoutRenderer.render(workout, week);
  }

  /**
   * Gère la complétion d'une série
   */
  handleSetCompleted(detail) {
    const { exerciseId, setNumber, completed } = detail;

    if (this.workoutSession.isSessionActive()) {
      if (completed) {
        this.workoutSession.completeSet(exerciseId, setNumber);
      } else {
        this.workoutSession.uncompleteSet(exerciseId, setNumber);
      }
    }

    // Sauvegarder dans le storage
    const week = this.navigationUI.getCurrentWeek();
    const day = this.navigationUI.getCurrentDay();
    const progress = this.storage.getWeekProgress(week, day);
    
    const key = `${exerciseId}_${setNumber}`;
    if (completed) {
      if (!progress.completedSets.includes(key)) {
        progress.completedSets.push(key);
      }
    } else {
      progress.completedSets = progress.completedSets.filter(s => s !== key);
    }

    this.storage.saveWeekProgress(week, day, progress);
  }

  /**
   * Gère le changement de poids
   */
  handleWeightChanged(detail) {
    const { exerciseId, weight } = detail;

    if (this.workoutSession.isSessionActive()) {
      this.workoutSession.updateWeight(exerciseId, weight);
    }

    // Sauvegarder dans le storage
    const week = this.navigationUI.getCurrentWeek();
    this.storage.saveWeight(exerciseId, week, weight);
  }

  /**
   * Gère le démarrage d'une séance
   */
  handleWorkoutStarted(detail) {
    const { week, day } = detail;

    try {
      this.workoutSession.start(week, day);
      console.log('Session started successfully');
      
      // Afficher un message de confirmation
      this.showNotification('Séance démarrée !');
    } catch (error) {
      console.error('Error starting session:', error);
      this.showError('Erreur lors du démarrage de la séance');
    }
  }

  /**
   * Gère la fin d'une séance
   */
  handleSessionEnded(detail) {
    const { week, day, duration, completion } = detail;

    console.log(`Session ended: ${completion}% complete in ${duration}s`);

    // Afficher un résumé
    this.showNotification(
      `Séance terminée ! ${completion}% de complétion en ${Math.floor(duration / 60)} minutes`
    );
  }

  /**
   * Gère la fin du timer
   */
  handleTimerCompleted() {
    this.showNotification('Repos terminé ! Prêt pour la prochaine série');
  }

  /**
   * Affiche une notification
   */
  showNotification(message) {
    // TODO: Implémenter un système de notifications toast
    console.log('Notification:', message);

    // Notification navigateur si autorisée
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Hybrid Master 51', {
        body: message,
        icon: '/icon-192x192.png'
      });
    }
  }

  /**
   * Affiche une erreur
   */
  showError(message) {
    console.error('Error:', message);
    // TODO: Implémenter un système d'affichage d'erreurs
    alert(message);
  }

  /**
   * Obtient les stats de l'app
   */
  getStats() {
    return {
      totalWeeks: 26,
      currentWeek: this.navigationUI.getCurrentWeek(),
      currentDay: this.navigationUI.getCurrentDay(),
      sessionActive: this.workoutSession.isSessionActive(),
      timerRunning: this.timerManager.isTimerRunning(),
      storageSize: this.storage.getSize()
    };
  }
}

// ============================================================================
// INITIALISATION
// ============================================================================

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new HybridMasterApp();
  });
} else {
  window.app = new HybridMasterApp();
}

// Exposer l'app globalement pour le debug
console.log('💪 Hybrid Master 51 - Module loaded');
console.log('Use window.app to access the application');

// Export pour les tests
export { HybridMasterApp };
