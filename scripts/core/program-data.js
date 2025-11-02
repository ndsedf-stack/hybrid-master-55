// ===================================================================
// HYBRID MASTER 51 - DONNÉES COMPLÈTES DU PROGRAMME
// ===================================================================

export const PROGRAM_DATA = {
  
  // Informations générales
  name: "Hybrid Master 51",
  duration: 26,
  blocksCount: 4,
  deloadWeeks: [6, 12, 18, 24, 26],
  
  // Programme d'entraînement complet
  workouts: {
    
    // ========================================
    // DIMANCHE - Pectoraux / Épaules / Triceps
    // ========================================
    dimanche: {
      name: "Dimanche",
      focus: "Pectoraux / Épaules / Triceps",
      warmup: "5-10min cardio léger + mobilité épaules",
      exercises: [
        {
          name: "Développé Couché Barre",
          sets: 5,
          reps: "5",
          weight: 80,
          rest: "3min",
          progression: { frequency: 2, increment: 2.5 },
          notes: "Technique stricte, contrôler la descente"
        },
        {
          name: "Développé Incliné Haltères",
          sets: 4,
          reps: "8-10",
          weight: 30,
          rest: "2min",
          progression: { frequency: 2, increment: 2.5 },
          notes: "Inclinaison 30-45°"
        },
        {
          name: "Dips Lestés",
          sets: 3,
          reps: "10-12",
          weight: 10,
          rest: "90s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Légèrement penché en avant"
        },
        {
          name: "Développé Militaire Barre",
          sets: 4,
          reps: "6-8",
          weight: 50,
          rest: "2min",
          progression: { frequency: 2, increment: 2.5 },
          notes: "Debout, gainage maximal"
        },
        {
          name: "Élévations Latérales",
          sets: 3,
          reps: "12-15",
          weight: 12,
          rest: "60s",
          progression: { frequency: 3, increment: 1 },
          notes: "Contrôler la montée et descente"
        },
        {
          name: "Barre au Front",
          sets: 3,
          reps: "10-12",
          weight: 25,
          rest: "90s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Coudes fixes, extension complète"
        },
        {
          name: "Extension Triceps Poulie Haute",
          sets: 3,
          reps: "12-15",
          weight: 20,
          rest: "60s",
          progression: { frequency: 4, increment: 2.5 },
          notes: "Superset possible avec élévations"
        }
      ]
    },
    
    // ========================================
    // MARDI - Dos / Biceps / Avant-bras
    // ========================================
    mardi: {
      name: "Mardi",
      focus: "Dos / Biceps / Avant-bras",
      warmup: "5-10min rameur + mobilité thoracique",
      exercises: [
        {
          name: "Trap Bar Deadlift",
          sets: 5,
          reps: "5",
          weight: 120,
          rest: "3min",
          progression: { frequency: 2, increment: 5 },
          notes: "Mouvement roi, explosif en montée"
        },
        {
          name: "Tractions Lestées",
          sets: 4,
          reps: "6-8",
          weight: 10,
          rest: "2min30",
          progression: { frequency: 2, increment: 2.5 },
          notes: "Prise large, amplitude complète"
        },
        {
          name: "Rowing Barre Buste Penché",
          sets: 4,
          reps: "8-10",
          weight: 60,
          rest: "2min",
          progression: { frequency: 2, increment: 2.5 },
          notes: "Tirage vers nombril, serrer omoplates"
        },
        {
          name: "Tirage Horizontal",
          sets: 3,
          reps: "10-12",
          weight: 50,
          rest: "90s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Squeeze de 1s en contraction"
        },
        {
          name: "Curl Incliné Haltères",
          sets: 4,
          reps: "8-10",
          weight: 14,
          rest: "90s",
          progression: { frequency: 3, increment: 1 },
          notes: "Rotation complète, étirement maximal",
          rotation: true,
          alternateWith: "Curl Spider"
        },
        {
          name: "Curl Barre EZ",
          sets: 3,
          reps: "10-12",
          weight: 30,
          rest: "75s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Amplitude complète, contrôle excentrique"
        },
        {
          name: "Curl Marteau",
          sets: 3,
          reps: "12-15",
          weight: 16,
          rest: "60s",
          progression: { frequency: 4, increment: 1 },
          notes: "Cibler brachial et avant-bras"
        }
      ]
    },
    
    // ========================================
    // JEUDI - Jambes Complètes
    // ========================================
    jeudi: {
      name: "Jeudi",
      focus: "Quadriceps / Ischio / Fessiers / Mollets",
      warmup: "10min vélo + mobilité hanches + activation fessiers",
      exercises: [
        {
          name: "Squat Barre Haute",
          sets: 5,
          reps: "5",
          weight: 100,
          rest: "3min",
          progression: { frequency: 2, increment: 5 },
          notes: "Profondeur ATG si mobilité OK"
        },
        {
          name: "Presse à Cuisses",
          sets: 4,
          reps: "8-10",
          weight: 150,
          rest: "2min",
          progression: { frequency: 2, increment: 10 },
          notes: "Amplitude maximale, genoux alignés"
        },
        {
          name: "Soulevé de Terre Roumain",
          sets: 4,
          reps: "8-10",
          weight: 80,
          rest: "2min",
          progression: { frequency: 2, increment: 5 },
          notes: "Étirement ischio maximal, dos plat"
        },
        {
          name: "Leg Curl Allongé",
          sets: 3,
          reps: "10-12",
          weight: 40,
          rest: "90s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Contraction de 1s en haut"
        },
        {
          name: "Extension Mollets Assis",
          sets: 4,
          reps: "12-15",
          weight: 30,
          rest: "60s",
          progression: { frequency: 3, increment: 2.5 },
          notes: "Amplitude complète, pause en haut"
        },
        {
          name: "Extension Mollets Debout",
          sets: 4,
          reps: "15-20",
          weight: 70,
          rest: "60s",
          progression: { frequency: 4, increment: 5 },
          notes: "Étirement complet en bas"
        },
        {
          name: "Hip Thrust",
          sets: 3,
          reps: "12-15",
          weight: 60,
          rest: "90s",
          progression: { frequency: 3, increment: 5 },
          notes: "Squeeze fessiers en haut 2s"
        }
      ]
    },
    
    // ========================================
    // MAISON - Séance Légère Mobilité/Rappel
    // ========================================
    maison: {
      name: "Maison",
      focus: "Mobilité / Récupération Active / Rappel Musculaire",
      warmup: "5min d'étirements dynamiques",
      exercises: [
        {
          name: "Pompes",
          sets: 3,
          reps: "15-20",
          weight: 0,
          rest: "60s",
          progression: { frequency: 4, increment: 0 },
          notes: "Tempo lent, focus contraction"
        },
        {
          name: "Tractions Australiennes",
          sets: 3,
          reps: "10-15",
          weight: 0,
          rest: "60s",
          progression: { frequency: 4, increment: 0 },
          notes: "Barre basse, corps tendu"
        },
        {
          name: "Pike Push-Ups",
          sets: 3,
          reps: "12-15",
          weight: 0,
          rest: "60s",
          progression: { frequency: 4, increment: 0 },
          notes: "Focus deltoïdes antérieurs"
        },
        {
          name: "Curl Haltères Légers",
          sets: 3,
          reps: "15-20",
          weight: 8,
          rest: "45s",
          progression: { frequency: 4, increment: 1 },
          notes: "Rappel musculaire, pump"
        },
        {
          name: "Extensions Triceps Haltères",
          sets: 3,
          reps: "15-20",
          weight: 8,
          rest: "45s",
          progression: { frequency: 4, increment: 1 },
          notes: "Amplitude complète"
        },
        {
          name: "Planche Abdominale",
          sets: 3,
          reps: "45-60s",
          weight: 0,
          rest: "45s",
          progression: { frequency: 4, increment: 0 },
          notes: "Gainage maximal, respiration contrôlée"
        },
        {
          name: "Étirements Complets",
          sets: 1,
          reps: "15min",
          weight: 0,
          rest: "0s",
          progression: { frequency: 0, increment: 0 },
          notes: "Tous les groupes musculaires, tenir 30s par étirement"
        }
      ]
    }
  },
  
  // Techniques par bloc
  blockTechniques: {
    1: {
      name: "Bloc 1 - Force Fondamentale",
      technique: "Tempo 3-1-2",
      description: "3s descente, 1s pause, 2s montée"
    },
    2: {
      name: "Bloc 2 - Hypertrophie",
      technique: "Rest-Pause",
      description: "Série principale + 2 mini-sets après 15s de repos"
    },
    3: {
      name: "Bloc 3 - Intensité",
      technique: "Drop-sets + Myo-reps",
      description: "Série max puis -20% immédiat + mini-sets"
    },
    4: {
      name: "Bloc 4 - Pic",
      technique: "Clusters + Partials",
      description: "Reps groupées + demi-amplitude en fin de série"
    }
  },
  
  // Nutrition
  nutrition: {
    calories: 3000,
    macros: {
      protein: 180,
      carbs: 350,
      fats: 90
    },
    meals: 5,
    hydration: "3-4L/jour"
  },
  
  // Supplémentation
  supplements: {
    essential: ["Créatine 5g", "Whey", "Oméga-3"],
    optional: ["Bêta-alanine", "Citrulline", "Vitamine D"]
  }
};

export default PROGRAM_DATA;
