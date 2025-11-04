// ============================================================================
// 📊 scripts/core/program-data.js
// Programme Hybrid Master 51 complet - 26 semaines
// ============================================================================

class ProgramData {
  constructor() {
    this.program = {
      metadata: {
        name: "Hybrid Master 51",
        version: "1.0",
        duration: 26,
        frequency: 3,
        daysPerWeek: ["dimanche", "mardi", "vendredi"],
        deloadWeeks: [6, 12, 18, 24, 26]
      },
      
      blocks: [
        // ====================== BLOC 1 : FONDATION TECHNIQUE ======================
        {
          id: 1,
          name: "Fondation Technique",
          weeks: [1, 2, 3, 4, 5],
          technique: {
            name: "Tempo 3-1-2",
            description: "3s descente, 1s pause étirée, 2s montée",
            rpe: "6-7",
            details: "Pauses stratégiques sur exercices isolation"
          },
          workouts: {
            // ==================== DIMANCHE ====================
            dimanche: {
              name: "DOS + JAMBES LOURDES + BRAS",
              duration: 68,
              totalSets: 31,
              exercises: [
                {
                  id: "ex_dim_1",
                  name: "Trap Bar Deadlift",
                  sets: 5,
                  reps: "6-8",
                  rest: 120,
                  startWeight: 75,
                  targetWeight: 120, // Semaine 26
                  progression: { increment: 5, every: 3 },
                  muscleGroup: "Dos",
                  rir: 2,
                  notes: "Exercice principal - Technique parfaite prioritaire"
                },
                {
                  id: "ex_dim_2",
                  name: "Goblet Squat",
                  sets: 4,
                  reps: 10,
                  rest: 75,
                  startWeight: 25,
                  targetWeight: 57.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Quadriceps",
                  rir: 2,
                  notes: "Haltère tenu devant poitrine, amplitude complète"
                },
                {
                  id: "ex_dim_3",
                  name: "Leg Press",
                  sets: 4,
                  reps: 10,
                  rest: 75,
                  startWeight: 110,
                  targetWeight: 240,
                  progression: { increment: 10, every: 2 },
                  muscleGroup: "Quadriceps",
                  rir: 2,
                  notes: "Pieds largeur épaules, descente contrôlée"
                },
                {
                  id: "ex_dim_4a",
                  name: "Lat Pulldown (prise large)",
                  sets: 4,
                  reps: 10,
                  rest: 90,
                  startWeight: 60,
                  targetWeight: 92.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Dos",
                  rir: 2,
                  superset: "ex_dim_4b",
                  notes: "Mains écartées 1.5× largeur épaules, tirer vers haut pecs"
                },
                {
                  id: "ex_dim_4b",
                  name: "Landmine Press",
                  sets: 4,
                  reps: 10,
                  rest: 90,
                  startWeight: 35,
                  targetWeight: 67.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Épaules",
                  rir: 2,
                  superset: "ex_dim_4a",
                  notes: "Barre calée dans coin, presse oblique"
                },
                {
                  id: "ex_dim_5",
                  name: "Rowing Machine (prise large)",
                  sets: 4,
                  reps: 10,
                  rest: 75,
                  startWeight: 50,
                  targetWeight: 82.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Dos",
                  rir: 2,
                  notes: "Coudes vers extérieur, tirer vers bas des pecs"
                },
                {
                  id: "ex_dim_6a",
                  name: "Incline Curl",
                  sets: 4,
                  reps: 12,
                  rest: 75,
                  startWeight: 12,
                  targetWeight: 34.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Biceps",
                  rir: 2,
                  superset: "ex_dim_6b",
                  notes: "Bloc 1 & 3 / Spider Curl pour Bloc 2 & 4 - Pause 2s bras tendus"
                },
                {
                  id: "ex_dim_6b",
                  name: "Cable Pushdown",
                  sets: 3,
                  reps: 12,
                  rest: 75,
                  startWeight: 20,
                  targetWeight: 42.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Triceps",
                  rir: 2,
                  superset: "ex_dim_6a",
                  notes: "Coudes fixes le long du corps, extension complète"
                }
              ]
            },
            
            // ==================== MARDI ====================
            mardi: {
              name: "PECS + ÉPAULES + TRICEPS",
              duration: 70,
              totalSets: 35,
              exercises: [
                {
                  id: "ex_mar_1",
                  name: "Dumbbell Press",
                  sets: 5,
                  reps: 10,
                  rest: 105,
                  startWeight: 22,
                  targetWeight: 45,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Pectoraux",
                  rir: 2,
                  notes: "22kg PAR haltère (44kg total) - Mouvement principal"
                },
                {
                  id: "ex_mar_2",
                  name: "Cable Fly (poulies moyennes)",
                  sets: 4,
                  reps: 12,
                  rest: 60,
                  startWeight: 10,
                  targetWeight: 32.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Pectoraux",
                  rir: 2,
                  notes: "Poulies à hauteur épaules, pause 2s bras écartés"
                },
                {
                  id: "ex_mar_3",
                  name: "Leg Press léger",
                  sets: 3,
                  reps: 15,
                  rest: 60,
                  startWeight: 80,
                  targetWeight: 170,
                  progression: { increment: 10, every: 3 },
                  muscleGroup: "Quadriceps",
                  rir: 2,
                  notes: "Volume léger pour fréquence jambes, contrôle"
                },
                {
                  id: "ex_mar_4a",
                  name: "Extension Triceps Corde",
                  sets: 5,
                  reps: 12,
                  rest: 75,
                  startWeight: 20,
                  targetWeight: 42.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Triceps",
                  rir: 2,
                  superset: "ex_mar_4b",
                  notes: "Coudes hauts et fixes, extension complète"
                },
                {
                  id: "ex_mar_4b",
                  name: "Lateral Raises",
                  sets: 5,
                  reps: 15,
                  rest: 75,
                  startWeight: 8,
                  targetWeight: 23,
                  progression: { increment: 2.5, every: 4 },
                  muscleGroup: "Épaules",
                  rir: 2,
                  superset: "ex_mar_4a",
                  notes: "Pause 1s bras horizontaux, contrôle descente"
                },
                {
                  id: "ex_mar_5",
                  name: "Face Pull",
                  sets: 5,
                  reps: 15,
                  rest: 60,
                  startWeight: 20,
                  targetWeight: 42.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Épaules",
                  rir: 2,
                  notes: "Pause 1s contraction arrière, coudes hauts"
                },
                {
                  id: "ex_mar_6",
                  name: "Rowing Machine (prise serrée)",
                  sets: 4,
                  reps: 12,
                  rest: 75,
                  startWeight: 50,
                  targetWeight: 82.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Dos",
                  rir: 2,
                  notes: "Mains largeur épaules, tirer vers nombril, coudes le long du corps"
                },
                {
                  id: "ex_mar_7",
                  name: "Overhead Extension (corde, assis)",
                  sets: 4,
                  reps: 12,
                  rest: 60,
                  startWeight: 15,
                  targetWeight: 37.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Triceps",
                  rir: 2,
                  notes: "Coudes fixes près de la tête, étirement maximal"
                }
              ]
            },
            
            // ==================== VENDREDI ====================
            vendredi: {
              name: "DOS + JAMBES LÉGÈRES + BRAS + ÉPAULES",
              duration: 73,
              totalSets: 33,
              exercises: [
                {
                  id: "ex_ven_1",
                  name: "Landmine Row",
                  sets: 5,
                  reps: 10,
                  rest: 105,
                  startWeight: 55,
                  targetWeight: 87.5,
                  progression: { increment: 2.5, every: 2 },
                  muscleGroup: "Dos",
                  rir: 2,
                  notes: "Rowing unilatéral, barre calée dans coin"
                },
                {
                  id: "ex_ven_2a",
                  name: "Leg Curl",
                  sets: 5,
                  reps: 12,
                  rest: 75,
                  startWeight: 40,
                  targetWeight: 85,
                  progression: { increment: 5, every: 3 },
                  muscleGroup: "Ischio-jambiers",
                  rir: 2,
                  superset: "ex_ven_2b",
                  notes: "Contrôler la descente, contraction maximale"
                },
                {
                  id: "ex_ven_2b",
                  name: "Leg Extension",
                  sets: 4,
                  reps: 15,
                  rest: 75,
                  startWeight: 35,
                  targetWeight: 80,
                  progression: { increment: 5, every: 3 },
                  muscleGroup: "Quadriceps",
                  rir: 2,
                  superset: "ex_ven_2a",
                  notes: "Extension complète, pause 1s en haut"
                },
                {
                  id: "ex_ven_3a",
                  name: "Cable Fly",
                  sets: 4,
                  reps: 15,
                  rest: 60,
                  startWeight: 10,
                  targetWeight: 32.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Pectoraux",
                  rir: 2,
                  superset: "ex_ven_3b",
                  notes: "Poulies moyennes, tempo contrôlé"
                },
                {
                  id: "ex_ven_3b",
                  name: "Dumbbell Fly",
                  sets: 4,
                  reps: 12,
                  rest: 60,
                  startWeight: 10,
                  targetWeight: 32.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Pectoraux",
                  rir: 2,
                  superset: "ex_ven_3a",
                  notes: "Pause 2s bras écartés, étirement maximal"
                },
                {
                  id: "ex_ven_4a",
                  name: "EZ Bar Curl",
                  sets: 5,
                  reps: 12,
                  rest: 75,
                  startWeight: 25,
                  targetWeight: 47.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Biceps",
                  rir: 2,
                  superset: "ex_ven_4b",
                  notes: "Pause 2s bras tendus, pas de swing"
                },
                {
                  id: "ex_ven_4b",
                  name: "Overhead Extension",
                  sets: 3,
                  reps: 12,
                  rest: 75,
                  startWeight: 15,
                  targetWeight: 37.5,
                  progression: { increment: 2.5, every: 3 },
                  muscleGroup: "Triceps",
                  rir: 2,
                  superset: "ex_ven_4a",
                  notes: "Assis, corde, coudes fixes"
                },
                {
                  id: "ex_ven_5",
                  name: "Lateral Raises",
                  sets: 3,
                  reps: 15,
                  rest: 60,
                  startWeight: 8,
                  targetWeight: 23,
                  progression: { increment: 2.5, every: 4 },
                  muscleGroup: "Épaules",
                  rir: 2,
                  notes: "Deuxième session de la semaine"
                },
                {
                  id: "ex_ven_6",
                  name: "Wrist Curl",
                  sets: 3,
                  reps: 20,
                  rest: 45,
                  startWeight: 30,
                  targetWeight: 47.5,
                  progression: { increment: 2.5, every: 4 },
                  muscleGroup: "Avant-bras",
                  rir: 2,
                  notes: "Barre EZ, avant-bras sur banc, amplitude complète"
                }
              ]
            }
          }
        },
        
        // ====================== BLOC 2 : SURCHARGE PROGRESSIVE ======================
        {
          id: 2,
          name: "Surcharge Progressive",
          weeks: [7, 8, 9, 10, 11],
          technique: {
            name: "Tempo 2-1-2 + Rest-Pause",
            description: "Tempo plus rapide, Rest-Pause sur dernière série exercices principaux",
            rpe: "7-8",
            details: "Dimanche: Trap Bar S5 | Mardi: Dumbbell Press S5 | Vendredi: Landmine Row S5"
          },
          workouts: {} // Hérite des exercices du Bloc 1
        },
        
        // ====================== BLOC 3 : SURCOMPENSATION ======================
        {
          id: 3,
          name: "Surcompensation",
          weeks: [13, 14, 15, 16, 17],
          technique: {
            name: "Drop-sets + Myo-reps",
            description: "Intensification métabolique, stress musculaire maximal",
            rpe: "8",
            details: "Drop-sets S4 sur composés | Myo-reps S4/S5 sur isolations"
          },
          workouts: {} // Hérite des exercices du Bloc 1
        },
        
        // ====================== BLOC 4 : INTENSIFICATION MAXIMALE ======================
        {
          id: 4,
          name: "Intensification Maximale",
          weeks: [19, 20, 21, 22, 23, 25],
          technique: {
            name: "Clusters + Myo-reps + Partials",
            description: "Toutes techniques avancées combinées",
            rpe: "8-9",
            details: "Clusters exercices lourds | Myo-reps isolations | Partials jambes"
          },
          workouts: {} // Hérite des exercices du Bloc 1
        }
      ],
      
      // ==================== EXERCICES MAISON ====================
      homeWorkouts: {
        hammerCurl: {
          name: "Hammer Curl (Maison)",
          frequency: "2×/semaine (Mardi soir + Jeudi soir)",
          sets: 3,
          reps: 12,
          startWeight: 12,
          targetWeight: 34.5,
          progression: { increment: 2.5, every: 3 },
          muscleGroup: "Biceps",
          notes: "Complément au programme, prise neutre (marteau)"
        }
      }
    };
  }
  
  // ==================== MÉTHODES PUBLIQUES ====================
  
  getWeekWorkouts(week) {
    const block = this.program.blocks.find(b => b.weeks.includes(week));
    if (!block) return null;
    
    const isDeload = this.program.metadata.deloadWeeks.includes(week);
    
    // Si le bloc n'a pas de workouts définis, hériter du Bloc 1
    const workouts = Object.keys(block.workouts).length > 0 
      ? block.workouts 
      : this.program.blocks[0].workouts;
    
    return {
      block: block.name,
      technique: block.technique,
      isDeload,
      workouts
    };
  }
  
  getExerciseCurrentWeight(exerciseId, week) {
    // Trouver l'exercice dans tous les blocs
    for (const block of this.program.blocks) {
      for (const day in block.workouts) {
        const exercise = block.workouts[day].exercises?.find(ex => ex.id === exerciseId);
        if (exercise) {
          const weeksProgressed = Math.floor((week - 1) / exercise.progression.every);
          return exercise.startWeight + (weeksProgressed * exercise.progression.increment);
        }
      }
    }
    return null;
  }
  
  getAllExercises() {
    const exercises = [];
    this.program.blocks[0].workouts.dimanche.exercises.forEach(ex => exercises.push(ex));
    this.program.blocks[0].workouts.mardi.exercises.forEach(ex => exercises.push(ex));
    this.program.blocks[0].workouts.vendredi.exercises.forEach(ex => exercises.push(ex));
    return exercises;
  }
  
  getVolumeMetrics() {
    return {
      quadriceps: { direct: 16, indirect: 7, total: 23, frequency: 3 },
      ischiojambiers: { direct: 10, indirect: 7, total: 17, frequency: 2 },
      fessiers: { direct: 9, indirect: 10, total: 19, frequency: 3 },
      dos: { direct: 22, indirect: 8, total: 30, frequency: 3 },
      pectoraux: { direct: 17, indirect: 5, total: 22, frequency: 3 },
      epaulesPost: { direct: 9, indirect: 3, total: 12, frequency: 2 },
      epaulesLat: { direct: 8, indirect: 2, total: 10, frequency: 3 },
      biceps: { direct: 9, indirect: 10, total: 19, frequency: 3 },
      triceps: { direct: 15, indirect: 5, total: 20, frequency: 3 },
      avantBras: { direct: 3, indirect: 13, total: 16, frequency: 3 }
    };
  }
}

// Export pour utilisation dans app.js
export { ProgramData };
