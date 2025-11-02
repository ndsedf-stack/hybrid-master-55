/**
 * HYBRID MASTER 51 - WORKOUT SESSION
 * Gère l'état d'une séance d'entraînement
 * 
 * @module modules/workout-session
 * @version 1.0.0
 */

export class WorkoutSession {
  constructor(programData) {
    this.programData = programData;
    this.isActive = false;
    this.currentWeek = null;
    this.currentDay = null;
    this.startTime = null;
    this.exercises = {};
    this.completedSets = [];
  }

  /**
   * Démarre une session
   */
  start(week, day) {
    if (this.isActive) {
      console.warn('⚠️ Session already active');
      return;
    }

    this.currentWeek = week;
    this.currentDay = day;
    this.startTime = Date.now();
    this.isActive = true;
    this.completedSets = [];

    // Charger les exercices
    const workout = this.programData.getWorkout(week, day);
    this.exercises = {};
    
    workout.exercises.forEach(ex => {
      this.exercises[ex.id] = {
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        completedSets: [],
        modifiedWeight: null
      };
    });

    console.log(`🏋️ Session started: Week ${week}, ${day}`);

    // Dispatch event
    const event = new CustomEvent('workoutStarted', {
      detail: {
        week: week,
        day: day,
        startTime: this.startTime
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Termine une session
   */
  end() {
    if (!this.isActive) {
      console.warn('⚠️ No active session to end');
      return;
    }

    const endTime = Date.now();
    const duration = Math.floor((endTime - this.startTime) / 1000);
    const completion = this.calculateCompletion();

    console.log(`✅ Session ended: ${completion}% complete in ${duration}s`);

    // Dispatch event
    const event = new CustomEvent('sessionEnded', {
      detail: {
        week: this.currentWeek,
        day: this.currentDay,
        duration: duration,
        completion: completion,
        exercises: this.exercises
      }
    });
    window.dispatchEvent(event);

    // Reset
    this.isActive = false;
    this.currentWeek = null;
    this.currentDay = null;
    this.startTime = null;
  }

  /**
   * Marque une série comme complétée
   */
  completeSet(exerciseId, setNumber) {
    if (!this.isActive) {
      console.warn('⚠️ No active session');
      return;
    }

    if (this.exercises[exerciseId]) {
      if (!this.exercises[exerciseId].completedSets.includes(setNumber)) {
        this.exercises[exerciseId].completedSets.push(setNumber);
        this.completedSets.push(`${exerciseId}_${setNumber}`);
        console.log(`✅ Set completed: ${exerciseId} - Set ${setNumber}`);
      }
    }
  }

  /**
   * Démarque une série
   */
  uncompleteSet(exerciseId, setNumber) {
    if (!this.isActive) {
      console.warn('⚠️ No active session');
      return;
    }

    if (this.exercises[exerciseId]) {
      this.exercises[exerciseId].completedSets = 
        this.exercises[exerciseId].completedSets.filter(s => s !== setNumber);
      
      this.completedSets = this.completedSets.filter(s => s !== `${exerciseId}_${setNumber}`);
      
      console.log(`❌ Set uncompleted: ${exerciseId} - Set ${setNumber}`);
    }
  }

  /**
   * Met à jour le poids d'un exercice
   */
  updateWeight(exerciseId, weight) {
    if (!this.isActive) {
      console.warn('⚠️ No active session');
      return;
    }

    if (this.exercises[exerciseId]) {
      this.exercises[exerciseId].modifiedWeight = weight;
      console.log(`⚖️ Weight updated: ${exerciseId} = ${weight}kg`);
    }
  }

  /**
   * Calcule le pourcentage de complétion
   */
  calculateCompletion() {
    if (!this.isActive || Object.keys(this.exercises).length === 0) {
      return 0;
    }

    let totalSets = 0;
    let completedSets = 0;

    Object.values(this.exercises).forEach(ex => {
      totalSets += ex.sets;
      completedSets += ex.completedSets.length;
    });

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  }

  /**
   * Retourne les stats de la session
   */
  getStats() {
    if (!this.isActive) {
      return null;
    }

    const duration = Math.floor((Date.now() - this.startTime) / 1000);
    const completion = this.calculateCompletion();

    return {
      week: this.currentWeek,
      day: this.currentDay,
      duration: duration,
      completion: completion,
      totalExercises: Object.keys(this.exercises).length,
      completedSets: this.completedSets.length
    };
  }

  /**
   * Vérifie si une session est active
   */
  isSessionActive() {
    return this.isActive;
  }

  /**
   * Retourne les données de la session
   */
  getSessionData() {
    return {
      isActive: this.isActive,
      currentWeek: this.currentWeek,
      currentDay: this.currentDay,
      startTime: this.startTime,
      exercises: this.exercises,
      completedSets: this.completedSets
    };
  }
}
