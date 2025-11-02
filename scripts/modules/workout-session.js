/**
 * WORKOUT SESSION - Gestion des séances en cours
 * Module pour tracker la progression pendant une séance
 * 
 * @module modules/workout-session
 * @version 1.0.0
 */

export class WorkoutSession {
  constructor(programData) {
    this.programData = programData;
    this.currentSession = null;
    this.startTime = null;
    this.completedSets = new Set();
    this.modifiedWeights = new Map();
  }

  /**
   * Démarre une nouvelle séance
   * @param {number} week - Numéro de semaine
   * @param {string} day - Jour de la séance
   */
  start(week, day) {
    const workout = this.programData.getWorkout(week, day);
    
    if (!workout) {
      throw new Error(`Workout not found for week ${week}, day ${day}`);
    }

    this.currentSession = {
      week,
      day,
      workout,
      startTime: new Date(),
      completedSets: [],
      modifiedWeights: {},
      notes: ''
    };

    this.startTime = Date.now();
    this.completedSets.clear();
    this.modifiedWeights.clear();

    // Charger les données sauvegardées
    this.loadProgress();

    // Émettre événement
    window.dispatchEvent(new CustomEvent('sessionStarted', {
      detail: this.currentSession
    }));

    return this.currentSession;
  }

  /**
   * Termine la séance
   */
  end() {
    if (!this.currentSession) {
      return null;
    }

    const endTime = Date.now();
    const duration = Math.floor((endTime - this.startTime) / 1000);

    const summary = {
      ...this.currentSession,
      endTime: new Date(),
      duration, // en secondes
      totalSets: this.getTotalSets(),
      completedSets: this.completedSets.size,
      completion: this.getCompletionRate()
    };

    // Sauvegarder l'historique
    this.saveToHistory(summary);

    // Émettre événement
    window.dispatchEvent(new CustomEvent('sessionEnded', {
      detail: summary
    }));

    // Réinitialiser
    this.currentSession = null;
    this.startTime = null;

    return summary;
  }

  /**
   * Marque une série comme complétée
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} setNumber - Numéro de la série
   */
  completeSet(exerciseId, setNumber) {
    if (!this.currentSession) {
      console.warn('No active session');
      return;
    }

    const key = `${exerciseId}_${setNumber}`;
    this.completedSets.add(key);

    // Sauvegarder
    this.saveProgress();

    // Émettre événement
    window.dispatchEvent(new CustomEvent('setCompleted', {
      detail: { exerciseId, setNumber }
    }));
  }

  /**
   * Annule une série
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} setNumber - Numéro de la série
   */
  uncompleteSet(exerciseId, setNumber) {
    const key = `${exerciseId}_${setNumber}`;
    this.completedSets.delete(key);

    this.saveProgress();

    window.dispatchEvent(new CustomEvent('setUncompleted', {
      detail: { exerciseId, setNumber }
    }));
  }

  /**
   * Modifie le poids d'un exercice
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} weight - Nouveau poids
   */
  updateWeight(exerciseId, weight) {
    if (!this.currentSession) {
      return;
    }

    this.modifiedWeights.set(exerciseId, weight);
    this.saveProgress();

    window.dispatchEvent(new CustomEvent('weightUpdated', {
      detail: { exerciseId, weight }
    }));
  }

  /**
   * Ajoute une note à la séance
   * @param {string} note - Note textuelle
   */
  addNote(note) {
    if (!this.currentSession) {
      return;
    }

    this.currentSession.notes = note;
    this.saveProgress();
  }

  /**
   * Obtient le nombre total de séries
   */
  getTotalSets() {
    if (!this.currentSession) {
      return 0;
    }

    return this.currentSession.workout.exercises.reduce((total, ex) => {
      return total + (ex.sets || 0);
    }, 0);
  }

  /**
   * Calcule le taux de complétion
   */
  getCompletionRate() {
    const total = this.getTotalSets();
    if (total === 0) return 0;

    return Math.round((this.completedSets.size / total) * 100);
  }

  /**
   * Obtient les stats de la séance en cours
   */
  getSessionStats() {
    if (!this.currentSession) {
      return null;
    }

    const elapsed = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;

    return {
      week: this.currentSession.week,
      day: this.currentSession.day,
      elapsed, // secondes
      totalSets: this.getTotalSets(),
      completedSets: this.completedSets.size,
      completion: this.getCompletionRate(),
      modifiedWeights: Array.from(this.modifiedWeights.entries())
    };
  }

  /**
   * Sauvegarde la progression
   */
  saveProgress() {
    if (!this.currentSession) {
      return;
    }

    const key = `session_${this.currentSession.week}_${this.currentSession.day}`;
    const data = {
      completedSets: Array.from(this.completedSets),
      modifiedWeights: Array.from(this.modifiedWeights.entries()),
      notes: this.currentSession.notes,
      lastUpdate: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Charge la progression sauvegardée
   */
  loadProgress() {
    if (!this.currentSession) {
      return;
    }

    const key = `session_${this.currentSession.week}_${this.currentSession.day}`;
    const saved = localStorage.getItem(key);

    if (!saved) {
      return;
    }

    try {
      const data = JSON.parse(saved);
      
      if (data.completedSets) {
        this.completedSets = new Set(data.completedSets);
      }
      if (data.modifiedWeights) {
        this.modifiedWeights = new Map(data.modifiedWeights);
      }
      if (data.notes) {
        this.currentSession.notes = data.notes;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  /**
   * Sauvegarde dans l'historique
   */
  saveToHistory(summary) {
    const history = this.getHistory();
    history.push(summary);

    // Garder les 100 dernières séances
    if (history.length > 100) {
      history.shift();
    }

    localStorage.setItem('workout_history', JSON.stringify(history));
  }

  /**
   * Récupère l'historique
   */
  getHistory() {
    const saved = localStorage.getItem('workout_history');
    
    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }

  /**
   * Vérifie si une séance est en cours
   */
  isSessionActive() {
    return this.currentSession !== null;
  }

  /**
   * Obtient la séance en cours
   */
  getCurrentSession() {
    return this.currentSession;
  }
}
