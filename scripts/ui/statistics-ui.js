// ==================================
// STATISTICS UI
// ==================================
// Gère l'affichage du suivi des statistiques utilisateur.

import { getWeeklyProgression } from "../modules/statistics-engine.js";

export function renderStatistics(container) {
  container.innerHTML = "<h2>📊 Statistiques</h2>";

  const data = getWeeklyProgression();
  if (!data.length) {
    container.innerHTML += "<p>Aucune donnée disponible pour le moment.</p>";
    return;
  }

  const list = document.createElement("ul");
  data.forEach(stat => {
    const li = document.createElement("li");
    li.textContent = `Semaine ${stat.week} — ${stat.sessions} séances terminées`;
    list.appendChild(li);
  });

  container.appendChild(list);
}
