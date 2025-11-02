// ===================================================================
// HYBRID MASTER 51 - MOTEUR DE PROGRESSION
// ===================================================================

export class ProgressionEngine {
  
  constructor() {
    this.deloadWeeks = [6, 12, 18, 24, 26];
    this.deloadPercentage = 0.6; // -40%
  }

  /**
   * Calcule les poids pour un exercice donné à une semaine précise
   */
  calculateExercise(exercise, weekNumber, blockInfo, isDeload) {
    const calculatedExercise = { ...exercise };
    
    // Si pas de progression définie, retourner l'exercice tel quel
    if (!exercise.progression) {
      return calculatedExercise;
    }
    
    // Calculer le nombre de progressions depuis le début
    const weeksInProgram = weekNumber - 1; // Semaine 1 = 0 progressions
    const progressionFrequency = exercise.progression.frequency || 2;
    const increment = exercise.progression.increment || 2.5;
    
    // Nombre de fois où on a progressé
    const progressionsCount = Math.floor(weeksInProgram / progressionFrequency);
    
    // Poids de base + progressions
    let currentWeight = exercise.weight + (progressionsCount * increment);
    
    // Appliquer le deload si nécessaire
    if (isDeload) {
      currentWeight = Math.round(currentWeight * this.deloadPercentage * 2) / 2;
    }
    
    calculatedExercise.weight = Math.round(currentWeight * 2) / 2; // Arrondir à 0.5kg
    calculatedExercise.originalWeight = exercise.weight;
    calculatedExercise.progressionsApplied = progressionsCount;
    
    // Ajouter la technique du bloc
    calculatedExercise.technique = this.getTechniqueForBlock(blockInfo.block);
    
    return calculatedExercise;
  }

  /**
   * Retourne la technique d'entraînement pour un bloc donné
   */
  getTechniqueForBlock(blockNumber) {
    const techniques = {
      1: "Tempo 3-1-2",
      2: "Rest-Pause",
      3: "Drop-sets + Myo-reps",
      4: "Clusters + Partials + Myo-reps"
    };
    
    return techniques[blockNumber] || "";
  }

  /**
   * Vérifie si une semaine est une semaine de deload
   */
  isDeloadWeek(weekNumber) {
    return this.deloadWeeks.includes(weekNumber);
  }

  /**
   * Calcule les statistiques pour une semaine complète
   */
  calculateWeekStats(workouts, weekNumber) {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    
    Object.values(workouts).forEach(workout => {
      workout.exercises.forEach(exercise => {
        const sets = exercise.sets;
        const reps = parseInt(exercise.reps) || 10;
        const weight = exercise.weight || 0;
        
        totalSets += sets;
        totalReps += sets * reps;
        totalVolume += sets * reps * weight;
      });
    });
    
    return {
      totalVolume: Math.round(totalVolume),
      totalSets,
      totalReps,
      averageIntensity: totalVolume / totalReps
    };
  }

  /**
   * Gère la rotation des exercices biceps (Incline vs Spider Curl)
   */
  getBicepsCurlForWeek(weekNumber) {
    // Semaines impaires: Incline, Semaines paires: Spider
    return weekNumber % 2 === 1 ? "Curl Incliné Haltères" : "Curl Spider";
  }
}

export default ProgressionEngine;
