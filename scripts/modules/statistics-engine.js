// ==================================
// STATISTICS ENGINE
// ==================================
// Gère la sauvegarde, la récupération et le suivi
// des statistiques d'entraînement via localStorage.

const statsKey = "hm51_stats";

export function saveSessionStat(day, week, completedExercises) {
  const stats = JSON.parse(localStorage.getItem(statsKey)) || [];
  stats.push({ day, week, completedExercises, date: new Date().toISOString() });
  localStorage.setItem(statsKey, JSON.stringify(stats));
}

export function getStats() {
  return JSON.parse(localStorage.getItem(statsKey)) || [];
}

export function getWeeklyProgression() {
  const stats = getStats();
  const byWeek = {};

  stats.forEach(s => {
    if (!byWeek[s.week]) byWeek[s.week] = 0;
    byWeek[s.week]++;
  });

  return Object.entries(byWeek).map(([week, sessions]) => ({
    week: parseInt(week),
    sessions
  }));
}
