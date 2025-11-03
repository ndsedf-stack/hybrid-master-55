/**
 * HYBRID MASTER 51 - MOTEUR DE PROGRESSION
 * Calcule la progression des poids et volumes sur 26 semaines
 */

export class ProgressionEngine {
  constructor(programData) {
    this.programData = programData;
    this.deloadWeeks = [6, 12, 18, 24, 26];
    this.deloadPercentage = 0.6; // -40%
  }

  /**
   * Calcule le poids pour un exercice à une semaine donnée
   * @param {Object} exercise - Exercice avec weight et progression
   * @param {number} weekNumber - Numéro de semaine (1-26)
   * @returns {number} Poids calculé
   */
  calculateWeight(exercise, weekNumber) {
    if (!exercise.progression) return exercise.weight;

    const baseWeight = exercise.weight;
    const increment = exercise.progression.increment || 2.5;
    const frequency = exercise.progression.frequency || 2;

    // Nombre de progressions depuis le début
    const progressionsCount = Math.floor((weekNumber - 1) / frequency);
    let currentWeight = baseWeight + (progressionsCount * increment);

    // Appliquer deload si nécessaire
    if (this.deloadWeeks.includes(weekNumber)) {
      currentWeight = Math.round(currentWeight * this.deloadPercentage * 2) / 2;
    }

    return Math.round(currentWeight * 2) / 2; // Arrondir à 0.5kg
  }

  /**
   * Obtient la progression complète d'un exercice sur 26 semaines
   * @param {string} exerciseName - Nom de l'exercice
   * @returns {Array} Tableau de {week, weight}
   */
  getExerciseProgression(exerciseName) {
    const progression = [];
    
    for (let week = 1; week <= 26; week++) {
      const weekData = this.programData.getWeek(week);
      if (!weekData) continue;

      // Chercher l'exercice dans tous les jours
      for (const day of Object.keys(weekData)) {
        if (day === 'block' || day === 'technique') continue;
        
        const workout = weekData[day];
        if (!workout || !workout.exercises) continue;

        const exercise = workout.exercises.find(ex => ex.name === exerciseName);
        if (exercise) {
          progression.push({
            week,
            weight: this.calculateWeight(exercise, week),
            isDeload: this.deloadWeeks.includes(week)
          });
          break;
        }
      }
    }

    return progression;
  }

  /**
   * Calcule le volume total d'un exercice
   * @param {Object} exercise - Exercice
   * @param {number} weight - Poids utilisé
   * @returns {number} Volume en kg
   */
  calculateExerciseVolume(exercise, weight) {
    const sets = exercise.sets;
    const reps = parseInt(exercise.reps) || 10;
    return sets * reps * weight;
  }

  /**
   * Calcule le volume total d'un workout
   * @param {number} weekNumber - Numéro de semaine
   * @param {string} day - Jour (dimanche, mardi, vendredi, maison)
   * @returns {Object} {totalVolume, exercises}
   */
  calculateWorkoutVolume(weekNumber, day) {
    const workout = this.programData.getWorkout(weekNumber, day);
    if (!workout || !workout.exercises) {
      return { totalVolume: 0, exercises: [] };
    }

    let totalVolume = 0;
    const exercises = workout.exercises.map(exercise => {
      const weight = this.calculateWeight(exercise, weekNumber);
      const volume = this.calculateExerciseVolume(exercise, weight);
      totalVolume += volume;
      
      return {
        name: exercise.name,
        weight,
        volume,
        sets: exercise.sets,
        reps: exercise.reps
      };
    });

    return { totalVolume, exercises };
  }

  /**
   * Calcule le volume total d'une semaine complète
   * @param {number} weekNumber - Numéro de semaine
   * @returns {Object} {totalVolume, byDay}
   */
  calculateWeekVolume(weekNumber) {
    const days = ['dimanche', 'mardi', 'vendredi', 'maison'];
    let totalVolume = 0;
    const byDay = {};

    days.forEach(day => {
      const dayVolume = this.calculateWorkoutVolume(weekNumber, day);
      byDay[day] = dayVolume;
      totalVolume += dayVolume.totalVolume;
    });

    return { totalVolume, byDay };
  }

  /**
   * Calcule le volume par groupe musculaire
   * @param {number} weekNumber - Numéro de semaine
   * @returns {Object} Volume par muscle
   */
  calculateVolumeByMuscle(weekNumber) {
    const muscleVolumes = {
      dos: 0,
      pecs: 0,
      jambes: 0,
      epaules: 0,
      biceps: 0,
      triceps: 0
    };

    const weekData = this.programData.getWeek(weekNumber);
    if (!weekData) return muscleVolumes;

    const days = ['dimanche', 'mardi', 'vendredi', 'maison'];
    
    days.forEach(day => {
      const workout = weekData[day];
      if (!workout || !workout.exercises) return;

      workout.exercises.forEach(exercise => {
        const weight = this.calculateWeight(exercise, weekNumber);
        const volume = this.calculateExerciseVolume(exercise, weight);
        
        // Mapper vers les groupes musculaires
        const category = exercise.category?.toLowerCase() || '';
        if (category.includes('dos')) muscleVolumes.dos += volume;
        if (category.includes('pec')) muscleVolumes.pecs += volume;
        if (category.includes('jambe') || category.includes('quad') || category.includes('ishio')) {
          muscleVolumes.jambes += volume;
        }
        if (category.includes('epaule')) muscleVolumes.epaules += volume;
        if (category.includes('biceps')) muscleVolumes.biceps += volume;
        if (category.includes('triceps')) muscleVolumes.triceps += volume;
      });
    });

    return muscleVolumes;
  }

  /**
   * Suggère une progression basée sur le RPE
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} currentWeek - Semaine actuelle
   * @param {number} currentWeight - Poids actuel
   * @param {number} rpe - RPE ressenti (1-10)
   * @returns {Object} Suggestion {action, newWeight, message}
   */
  suggestProgression(exerciseId, currentWeek, currentWeight, rpe) {
    if (rpe <= 6) {
      return {
        action: 'increase',
        newWeight: currentWeight + 2.5,
        message: 'RPE trop faible - Augmente de 2.5kg'
      };
    } else if (rpe >= 9) {
      return {
        action: 'decrease',
        newWeight: currentWeight - 2.5,
        message: 'RPE trop élevé - Diminue de 2.5kg'
      };
    } else {
      return {
        action: 'maintain',
        newWeight: currentWeight,
        message: 'RPE optimal - Continue ce poids'
      };
    }
  }

  /**
   * Calcule les statistiques de progression entre deux semaines
   * @param {number} startWeek - Semaine de début
   * @param {number} endWeek - Semaine de fin
   * @returns {Object} Statistiques
   */
  calculateProgressionStats(startWeek, endWeek) {
    const startVolume = this.calculateWeekVolume(startWeek);
    const endVolume = this.calculateWeekVolume(endWeek);
    
    const volumeIncrease = endVolume.totalVolume - startVolume.totalVolume;
    const percentageIncrease = (volumeIncrease / startVolume.totalVolume) * 100;

    return {
      startWeek,
      endWeek,
      startVolume: startVolume.totalVolume,
      endVolume: endVolume.totalVolume,
      volumeIncrease,
      percentageIncrease: Math.round(percentageIncrease * 10) / 10,
      weeks: endWeek - startWeek + 1
    };
  }

  /**
   * Sauvegarde un poids modifié par l'utilisateur
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} weekNumber - Numéro de semaine
   * @param {number} weight - Nouveau poids
   */
  saveUserWeight(exerciseId, weekNumber, weight) {
    const key = `weight_${exerciseId}_w${weekNumber}`;
    localStorage.setItem(key, weight.toString());
  }

  /**
   * Récupère un poids modifié par l'utilisateur
   * @param {string} exerciseId - ID de l'exercice
   * @param {number} weekNumber - Numéro de semaine
   * @returns {number|null} Poids modifié ou null
   */
  getUserWeight(exerciseId, weekNumber) {
    const key = `weight_${exerciseId}_w${weekNumber}`;
    const saved = localStorage.getItem(key);
    return saved ? parseFloat(saved) : null;
  }

  /**
   * Estime le 1RM basé sur poids et reps
   * @param {number} weight - Poids soulevé
   * @param {number} reps - Nombre de répétitions
   * @returns {number} 1RM estimé
   */
  estimate1RM(weight, reps) {
    // Formule Epley: 1RM = weight × (1 + reps/30)
    return Math.round(weight * (1 + reps / 30) * 2) / 2;
  }

  /**
   * Vérifie si une semaine est un deload
   * @param {number} weekNumber - Numéro de semaine
   * @returns {boolean}
   */
  isDeloadWeek(weekNumber) {
    return this.deloadWeeks.includes(weekNumber);
  }

  /**
   * Obtient la technique d'intensification pour un bloc
   * @param {number} blockNumber - Numéro de bloc (1-5)
   * @returns {string} Nom de la technique
   */
  getTechniqueForBlock(blockNumber) {
    const techniques = {
      1: 'Tempo 3-1-2',
      2: 'Rest-Pause',
      3: 'Drop-sets + Myo-reps',
      4: 'Clusters + Partials + Myo-reps',
      5: 'Peak Week'
    };
    return techniques[blockNumber] || '';
  }
}

export default ProgressionEngine;
