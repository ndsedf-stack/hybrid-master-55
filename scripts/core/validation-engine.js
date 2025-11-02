// ==================================
// VALIDATION ENGINE
// ==================================
// Gère la vérification et la cohérence
// des données du programme et des exercices.

export function validateWorkout(workout) {
  if (!workout || !workout.exercises) {
    console.warn("⚠️ Données d'entraînement invalides :", workout);
    return false;
  }

  const isValid = workout.exercises.every(ex =>
    ex.name && ex.sets && ex.reps && ex.rest
  );

  if (!isValid) {
    console.warn("⚠️ Certaines données d'exercice sont manquantes :", workout);
  }

  return isValid;
}

export function validateNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}
