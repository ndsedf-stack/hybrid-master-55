// ==================================
// HYBRID MASTER 51 — MAIN INITIALIZER
// ==================================
// Point d'entrée de l'application Web

import { renderWorkout } from "./ui/workout-renderer.js";
import { renderNavigation } from "./ui/navigation-ui.js";

// Lancement de l'application après le chargement du DOM
window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Hybrid Master 51 chargé et prêt !");

  const nav = document.getElementById("navigation");
  const container = document.getElementById("workout-container");

  function updateWorkout() {
    const weekSelect =
