// ============================================================================
// 💪 scripts/modules/workout-session.js
// Gestion complète des séances d'entraînement
// ============================================================================

class WorkoutSession {
  constructor(weekNumber, dayName, workoutData) {
    this.week = weekNumber;
    this.day = dayName;
    this.workout = workoutData;
    this.currentExerciseIndex = 0;
    this.currentSet = 1;
    this.isActive = false;
    this.isPaused = false;
    this.completedExercises = [];
    this.sessionStartTime = null;
    this.sessionData = [];
    this.notes = {};
  }
  
  // ==================== GESTION SESSION ====================
  
  startSession() {
    this.isActive = true;
    this.sessionStartTime = Date.now();
    this.saveProgress();
    
    return {
      success: true,
      message: 'Séance démarrée',
      startTime: this.sessionStartTime
    };
  }
  
  pauseSession() {
    this.isPaused = true;
    this.saveProgress();
    return { success: true, message: 'Séance mise en pause' };
  }
  
  resumeSession() {
    this.isPaused = false;
    this.saveProgress();
    return { success: true, message: 'Séance reprise' };
  }
  
  endSession() {
    const duration = Math.round((Date.now() - this.sessionStartTime) / 60000); // minutes
    const totalVolume = this.calculateSessionVolume();
    const exercisesSummary = this.processSessionData();
    
    // Sauvegarder dans l'historique
    this.saveToHistory({
      completed: true,
      duration,
      volume: totalVolume,
      exercises: exercisesSummary,
      date: new Date().toISOString(),
      notes: this.notes
    });
    
    this.isActive = false;
    this.clearProgress();
    
    return {
      success: true,
      duration,
      volume: totalVolume,
      exercisesCompleted: this.completedExercises.length,
      totalExercises: this.workout.exercises.length
    };
  }
  
  // ==================== GESTION EXERCICES ====================
  
  startExercise(exerciseIndex) {
    if (exerciseIndex < 0 || exerciseIndex >= this.workout.exercises.length) {
      return { success: false, message: 'Exercice invalide' };
    }
    
    this.currentExerciseIndex = exerciseIndex;
    this.currentSet = 1;
    this.saveProgress();
    
    const exercise = this.workout.exercises[exerciseIndex];
    return {
      success: true,
      exercise,
      currentSet: this.currentSet,
      totalSets: exercise.sets
    };
  }
  
  completeSet(weight, reps, rpe = 7, notes = '') {
    const exercise = this.workout.exercises[this.currentExerciseIndex];
    
    // Validation
    if (!weight || !reps) {
      return { success: false, message: 'Poids et reps requis' };
    }
    
    // Enregistrer la série
    const setData = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      set: this.currentSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      rpe: parseInt(rpe),
      volume: parseFloat(weight) * parseInt(reps),
      timestamp: Date.now(),
      notes
    };
    
    this.sessionData.push(setData);
    
    // Progression
    const isLastSet = this.currentSet >= exercise.sets;
    
    if (isLastSet) {
      this.completeExercise();
      return {
        success: true,
        exerciseCompleted: true,
        restTime: 0,
        nextExercise: this.getNextExercise()
      };
    } else {
      this.currentSet++;
      this.saveProgress();
      return {
        success: true,
        exerciseCompleted: false,
        restTime: exercise.rest || 60,
        currentSet: this.currentSet,
        totalSets: exercise.sets
      };
    }
  }
  
  completeExercise() {
    const exercise = this.workout.exercises[this.currentExerciseIndex];
    this.completedExercises.push(exercise.id);
    this.currentSet = 1;
    this.saveProgress();
  }
  
  skipExercise() {
    this.currentExerciseIndex++;
    this.currentSet = 1;
    this.saveProgress();
    
    return {
      success: true,
      nextExercise: this.getCurrentExercise()
    };
  }
  
  skipSet() {
    const exercise = this.workout.exercises[this.currentExerciseIndex];
    
    if (this.currentSet >= exercise.sets) {
      this.completeExercise();
      return {
        success: true,
        exerciseCompleted: true,
        nextExercise: this.getNextExercise()
      };
    } else {
      this.currentSet++;
      this.saveProgress();
      return {
        success: true,
        exerciseCompleted: false,
        currentSet: this.currentSet
      };
    }
  }
  
  // ==================== GESTION NOTES ====================
  
  addExerciseNote(exerciseId, note) {
    this.notes[exerciseId] = note;
    this.saveProgress();
  }
  
  getExerciseNote(exerciseId) {
    return this.notes[exerciseId] || '';
  }
  
  // ==================== CALCULS ====================
  
  calculateSessionVolume() {
    let volume = 0;
    this.sessionData.forEach(set => {
      volume += set.volume;
    });
    return Math.round(volume);
  }
  
  processSessionData() {
    const exercisesSummary = [];
    const exerciseIds = [...new Set(this.sessionData.map(s => s.exerciseId))];
    
    exerciseIds.forEach(id => {
      const sets = this.sessionData.filter(s => s.exerciseId === id);
      const exercise = this.workout.exercises.find(ex => ex.id === id);
      
      exercisesSummary.push({
        id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        sets: sets.length,
        avgWeight: Math.round(sets.reduce((sum, s) => sum + s.weight, 0) / sets.length),
        totalReps: sets.reduce((sum, s) => sum + s.reps, 0),
        avgRpe: Math.round(sets.reduce((sum, s) => sum + s.rpe, 0) / sets.length),
        volume: Math.round(sets.reduce((sum, s) => sum + s.volume, 0)),
        notes: this.notes[id] || ''
      });
    });
    
    return exercisesSummary;
  }
  
  // ==================== GETTERS ====================
  
  getCurrentExercise() {
    return this.workout.exercises[this.currentExerciseIndex] || null;
  }
  
  getNextExercise() {
    const nextIndex = this.currentExerciseIndex + 1;
    return this.workout.exercises[nextIndex] || null;
  }
  
  getProgress() {
    return {
      currentExercise: this.currentExerciseIndex + 1,
      totalExercises: this.workout.exercises.length,
      currentSet: this.currentSet,
      completedExercises: this.completedExercises.length,
      percentage: Math.round((this.completedExercises.length / this.workout.exercises.length) * 100)
    };
  }
  
  getSessionSummary() {
    return {
      week: this.week,
      day: this.day,
      workoutName: this.workout.name,
      duration: this.sessionStartTime ? Math.round((Date.now() - this.sessionStartTime) / 60000) : 0,
      volume: this.calculateSessionVolume(),
      setsCompleted: this.sessionData.length,
      exercisesCompleted: this.completedExercises.length,
      totalExercises: this.workout.exercises.length
    };
  }
  
  // ==================== PERSISTANCE ====================
  
  saveProgress() {
    const state = {
      week: this.week,
      day: this.day,
      currentExerciseIndex: this.currentExerciseIndex,
      currentSet: this.currentSet,
      completedExercises: this.completedExercises,
      sessionData: this.sessionData,
      sessionStartTime: this.sessionStartTime,
      isPaused: this.isPaused,
      notes: this.notes
    };
    
    localStorage.setItem('hybrid_master_current_session', JSON.stringify(state));
  }
  
  saveToHistory(data) {
    const history = JSON.parse(localStorage.getItem('hybrid_master_history') || '{}');
    
    if (!history[`week_${this.week}`]) {
      history[`week_${this.week}`] = {
        dimanche: { completed: false, volume: 0, exercises: [] },
        mardi: { completed: false, volume: 0, exercises: [] },
        vendredi: { completed: false, volume: 0, exercises: [] }
      };
    }
    
    history[`week_${this.week}`][this.day] = data;
    
    localStorage.setItem('hybrid_master_history', JSON.stringify(history));
  }
  
  clearProgress() {
    localStorage.removeItem('hybrid_master_current_session');
  }
  
  // ==================== CHARGEMENT SESSION EN COURS ====================
  
  static loadInProgressSession() {
    const saved = localStorage.getItem('hybrid_master_current_session');
    if (!saved) return null;
    
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Erreur chargement session:', error);
      return null;
    }
  }
  
  static hasInProgressSession() {
    return localStorage.getItem('hybrid_master_current_session') !== null;
  }
  
  static clearInProgressSession() {
    localStorage.removeItem('hybrid_master_current_session');
  }
}

// Export pour utilisation dans app.js
export { WorkoutSession };
