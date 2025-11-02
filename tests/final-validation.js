// ==================================
// FINAL VALIDATION TEST — HYBRID MASTER 51
// ==================================
import { PROGRAM_DATA } from "../scripts/core/program-data.js";
import { validateProgram } from "../scripts/core/validation-engine.js";

function runFinalValidation() {
  console.log("🧪 Lancement de la validation finale du programme...");

  const valid = validateProgram();
  if (!valid) {
    console.error("❌ Le programme contient des erreurs !");
    return;
  }

  console.log("✅ Structure générale valide");

  // Vérification du contenu
  let allExercises = 0;
  for (const day of PROGRAM_DATA.days) {
    const w = PROGRAM_DATA.workouts[day];
    allExercises += w.exercises.length;
  }

  if (allExercises < 10) {
    console.warn("⚠️ Peu d’exercices trouvés :", allExercises);
  } else {
    console.log("💪 Nombre total d’exercices :", allExercises);
  }

  console.log("🎯 Validation terminée avec succès !");
}

runFinalValidation();
