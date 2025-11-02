// ===================================================================
// HYBRID MASTER 51 - GESTION DES SÉANCES EN TEMPS RÉEL
// ===================================================================
// Gère le déroulement d'une séance d'entraînement

import { TimerManager } from './timer-manager.js';

export class WorkoutSession {
  constructor(workout, weekNumber, storage) {
    this.workout = workout; // Données de la séance
    this.weekNumber = weekNumber;
    this.storage = storage;
    this.timerManager = new TimerManager();
    
    this.state = {
      isActive: false,
      startTime: null,
      endTime: null,
      currentExerciseIndex: 0,
      completedSets: {}, // { exerciseIndex: [set1, set2, ...] }
      notes: '',
      isPaused: false,
      pauseStartTime: null,
      totalPauseTime: 0
    };

    this.callbacks = {
      onStart: null,
      onComplete: null,
      onExerciseChange: null,
      onSetComplete: null,
      onPause: null,
      onResume: null
    };

    this.initializeCompletedSets();
  }

  /**
   * Initialise le tracking des sets
   */
  initializeCompletedSets() {
    this.workout.exercises.forEach((exercise, index) => {
      this.state.completedSets[index] = Array(exercise.sets).fill(false);
    });
  }

  /**
   * Démarre la séance
   */
  start() {
    if (this.state.isActive) return false;

    this.state.isActive = true;
    this.state.startTime = Date.now();
    this.state.isPaused = false;

    // Callback
    if (this.callbacks.onStart) {
      this.callbacks.onStart(this);
    }

    return true;
  }

  /**
   * Met en pause la séance
   */
  pause() {
    if (!this.state.isActive || this.state.isPaused) return false;

    this.state.isPaused = true;
    this.state.pauseStartTime = Date.now();

    // Mettre en pause tous les timers actifs
    const activeTimers = this.timerManager.getActiveTimers();
    activeTimers.forEach(timer => {
      this.timerManager.pauseTimer(timer.id);
    });

    // Callback
    if (this.callbacks.onPause) {
      this.callbacks.onPause(this);
    }

    return true;
  }

  /**
   * Reprend la séance
   */
  resume() {
    if (!this.state.isActive || !this.state.isPaused) return false;

    // Calculer le temps de pause
    const pauseDuration = Date.now() - this.state.pauseStartTime;
    this.state.totalPauseTime += pauseDuration;
    
    this.state.isPaused = false;
    this.state.pauseStartTime = null;

    // Reprendre tous les timers
    const pausedTimers = Array.from(this.timerManager.timers.values())
      .filter(timer => timer.isPaused);
    pausedTimers.forEach(timer => {
      this.timerManager.startTimer(timer.id);
    });

    // Callback
    if (this.callbacks.onResume) {
      this.callbacks.onResume(this);
    }

    return true;
  }

  /**
   * Termine la séance
   */
  complete() {
    if (!this.state.isActive) return false;

    this.state.isActive = false;
    this.state.endTime = Date.now();

    // Arrêter tous les timers
    this.timerManager.clearAllTimers();

    // Sauvegarder dans l'historique
    if (this.storage) {
      const workoutData = this.getWorkoutData();
      this.storage.addWorkoutToHistory(workoutData);
    }

    // Callback
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(this);
    }

    return true;
  }

  /**
   * Passe à l'exercice suivant
   */
  nextExercise() {
    if (this.state.currentExerciseIndex < this.workout.exercises.length - 1) {
      this.state.currentExerciseIndex++;
      
      // Callback
      if (this.callbacks.onExerciseChange) {
        this.callbacks.onExerciseChange(this.getCurrentExercise(), this.state.currentExerciseIndex);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Revient à l'exercice précédent
   */
  previousExercise() {
    if (this.state.currentExerciseIndex > 0) {
      this.state.currentExerciseIndex--;
      
      // Callback
      if (this.callbacks.onExerciseChange) {
        this.callbacks.onExerciseChange(this.getCurrentExercise(), this.state.currentExerciseIndex);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Va à un exercice spécifique
   */
  goToExercise(index) {
    if (index >= 0 && index < this.workout.exercises.length) {
      this.state.currentExerciseIndex = index;
      
      // Callback
      if (this.callbacks.onExerciseChange) {
        this.callbacks.onExerciseChange(this.getCurrentExercise(), index);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Marque un set comme complété
   */
  completeSet(exerciseIndex, setIndex, data = {}) {
    if (!this.state.completedSets[exerciseIndex]) return false;
    if (setIndex >= this.state.completedSets[exerciseIndex].length) return false;

    this.state.completedSets[exerciseIndex][setIndex] = {
      completed: true,
      timestamp: Date.now(),
      weight: data.weight || null,
      reps: data.reps || null,
      notes: data.notes || ''
    };

    // Callback
    if (this.callbacks.onSetComplete) {
      const exercise = this.workout.exercises[exerciseIndex];
      this.callbacks.onSetComplete(exercise, exerciseIndex, setIndex, data);
    }

    // Démarrer le timer de repos si configuré
    const exercise = this.workout.exercises[exerciseIndex];
    if (exercise.rest && !this.isExerciseComplete(exerciseIndex)) {
      this.startRestTimer(exercise.rest);
    }

    return true;
  }

  /**
   * Annule un set complété
   */
  uncompleteSet(exerciseIndex, setIndex) {
    if (!this.state.completedSets[exerciseIndex]) return false;
    if (setIndex >= this.state.completedSets[exerciseIndex].length) return false;

    this.state.completedSets[exerciseIndex][setIndex] = false;
    return true;
  }

  /**
   * Démarre un timer de repos
   */
  startRestTimer(restString) {
    // Arrêter les anciens timers de repos
    this.timerManager.clearAllTimers();

    const timer = this.timerManager.createRestTimer(restString, {
      autoStart: true,
      sound: true,
      onComplete: (timer) => {
        console.log('Repos terminé !');
      }
    });

    return timer;
  }

  /**
   * Récupère l'exercice actuel
   */
  getCurrentExercise() {
    return this.workout.exercises[this.state.currentExerciseIndex];
  }

  /**
   * Récupère l'index de l'exercice actuel
   */
  getCurrentExerciseIndex() {
    return this.state.currentExerciseIndex;
  }

  /**
   * Vérifie si un exercice est complété
   */
  isExerciseComplete(exerciseIndex) {
    const sets = this.state.completedSets[exerciseIndex];
    return sets && sets.every(set => set !== false);
  }

  /**
   * Vérifie si l'exercice actuel est complété
   */
  isCurrentExerciseComplete() {
    return this.isExerciseComplete(this.state.currentExerciseIndex);
  }

  /**
   * Vérifie si la séance est complète
   */
  isWorkoutComplete() {
    return Object.keys(this.state.completedSets).every(index => 
      this.isExerciseComplete(parseInt(index))
    );
  }

  /**
   * Récupère le nombre de sets complétés pour un exercice
   */
  getCompletedSetsCount(exerciseIndex) {
    const sets = this.state.completedSets[exerciseIndex];
    return sets ? sets.filter(set => set !== false).length : 0;
  }

  /**
   * Récupère le nombre total de sets complétés
   */
  getTotalCompletedSets() {
    let total = 0;
    Object.keys(this.state.completedSets).forEach(index => {
      total += this.getCompletedSetsCount(parseInt(index));
    });
    return total;
  }

  /**
   * Récupère le nombre total de sets
   */
  getTotalSets() {
    return this.workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  }

  /**
   * Récupère le pourcentage de progression
   */
  getProgress() {
    const total = this.getTotalSets();
    const completed = this.getTotalCompletedSets();
    return total > 0 ? (completed / total) * 100 : 0;
  }

  /**
   * Récupère la durée de la séance (en secondes)
   */
  getDuration() {
    if (!this.state.startTime) return 0;
    
    const endTime = this.state.endTime || Date.now();
    const duration = (endTime - this.state.startTime) / 1000;
    
    // Soustraire le temps de pause
    return Math.max(0, duration - (this.state.totalPauseTime / 1000));
  }

  /**
   * Récupère la durée formatée
   */
  getDurationFormatted() {
    const seconds = Math.floor(this.getDuration());
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min ${secs}s`;
  }

  /**
   * Ajoute une note à la séance
   */
  addNote(note) {
    this.state.notes = note;
  }

  /**
   * Récupère les données de la séance
   */
  getWorkoutData() {
    return {
      week: this.weekNumber,
      day: this.workout.day,
      exercises: this.workout.exercises.map((exercise, index) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        completedSets: this.state.completedSets[index] || [],
        isComplete: this.isExerciseComplete(index)
      })),
      duration: Math.floor(this.getDuration()),
      notes: this.state.notes,
      progress: this.getProgress(),
      startTime: this.state.startTime,
      endTime: this.state.endTime
    };
  }

  /**
   * Récupère l'état de la séance
   */
  getState() {
    return {
      ...this.state,
      currentExercise: this.getCurrentExercise(),
      progress: this.getProgress(),
      duration: this.getDuration(),
      durationFormatted: this.getDurationFormatted(),
      isComplete: this.isWorkoutComplete()
    };
  }

  /**
   * Définit un callback
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
  }

  /**
   * Réinitialise la séance
   */
  reset() {
    // Arrêter tous les timers
    this.timerManager.clearAllTimers();

    // Réinitialiser l'état
    this.state = {
      isActive: false,
      startTime: null,
      endTime: null,
      currentExerciseIndex: 0,
      completedSets: {},
      notes: '',
      isPaused: false,
      pauseStartTime: null,
      totalPauseTime: 0
    };

    this.initializeCompletedSets();
  }

  /**
   * Sauvegarde l'état actuel
   */
  saveState() {
    return JSON.stringify(this.state);
  }

  /**
   * Restaure un état sauvegardé
   */
  loadState(stateString) {
    try {
      const state = JSON.parse(stateString);
      this.state = { ...this.state, ...state };
      return true;
    } catch (error) {
      console.error('Erreur restauration état:', error);
      return false;
    }
  }
}
