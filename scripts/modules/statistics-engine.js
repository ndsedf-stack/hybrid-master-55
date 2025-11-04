// ============================================================================
// 📈 scripts/modules/statistics-engine.js
// Moteur de calcul des statistiques d'entraînement
// ============================================================================

class StatisticsEngine {
  constructor(programData) {
    this.programData = programData;
    this.history = this.loadHistory();
  }
  
  loadHistory() {
    const saved = localStorage.getItem('hybrid_master_history');
    return saved ? JSON.parse(saved) : this.createEmptyHistory();
  }
  
  createEmptyHistory() {
    const history = {};
    for (let week = 1; week <= 26; week++) {
      history[`week_${week}`] = {
        dimanche: { completed: false, volume: 0, exercises: [] },
        mardi: { completed: false, volume: 0, exercises: [] },
        vendredi: { completed: false, volume: 0, exercises: [] }
      };
    }
    return history;
  }
  
  saveHistory() {
    localStorage.setItem('hybrid_master_history', JSON.stringify(this.history));
  }
  
  // ==================== CALCULS VOLUME ====================
  
  calculateWeeklyVolume(week) {
    const weekData = this.history[`week_${week}`];
    if (!weekData) return 0;
    
    let total = 0;
    for (const day in weekData) {
      total += weekData[day].volume || 0;
    }
    return Math.round(total);
  }
  
  calculateTotalVolume() {
    let total = 0;
    for (const week in this.history) {
      total += this.calculateWeeklyVolume(parseInt(week.split('_')[1]));
    }
    return Math.round(total);
  }
  
  calculateAverageWeeklyVolume() {
    const completedWeeks = Object.keys(this.history).filter(week => {
      const weekData = this.history[week];
      return Object.values(weekData).some(day => day.completed);
    });
    
    if (completedWeeks.length === 0) return 0;
    
    const totalVolume = completedWeeks.reduce((sum, week) => {
      return sum + this.calculateWeeklyVolume(parseInt(week.split('_')[1]));
    }, 0);
    
    return Math.round(totalVolume / completedWeeks.length);
  }
  
  // ==================== CALCULS SÉANCES ====================
  
  calculateTotalSessions() {
    let count = 0;
    for (const week in this.history) {
      for (const day in this.history[week]) {
        if (this.history[week][day].completed) count++;
      }
    }
    return count;
  }
  
  getCompletionRate() {
    const total = 26 * 3; // 26 semaines × 3 séances
    const completed = this.calculateTotalSessions();
    return Math.round((completed / total) * 100);
  }
  
  getWeekCompletionRate(week) {
    const weekData = this.history[`week_${week}`];
    if (!weekData) return 0;
    
    const completed = Object.values(weekData).filter(d => d.completed).length;
    return Math.round((completed / 3) * 100);
  }
  
  // ==================== ANALYSE PAR MUSCLE ====================
  
  getVolumeByMuscleGroup() {
    const groups = {};
    
    for (const week in this.history) {
      for (const day in this.history[week]) {
        const dayData = this.history[week][day];
        if (dayData.exercises) {
          dayData.exercises.forEach(ex => {
            if (!groups[ex.muscleGroup]) {
              groups[ex.muscleGroup] = 0;
            }
            groups[ex.muscleGroup] += ex.volume || 0;
          });
        }
      }
    }
    
    return Object.entries(groups)
      .map(([name, value]) => ({ 
        name, 
        value: Math.round(value)
      }))
      .sort((a, b) => b.value - a.value);
  }
  
  // ==================== PROGRESSION TEMPORELLE ====================
  
  getProgressionData(weeksToShow = 8) {
    const data = [];
    const currentWeek = this.getCurrentWeek();
    const startWeek = Math.max(1, currentWeek - weeksToShow + 1);
    
    for (let i = startWeek; i <= Math.min(currentWeek, 26); i++) {
      const weekData = this.history[`week_${i}`];
      const volume = this.calculateWeeklyVolume(i);
      const sessions = Object.values(weekData || {}).filter(d => d.completed).length;
      
      data.push({
        week: `S${i}`,
        weekNumber: i,
        volume,
        sessions,
        completionRate: Math.round((sessions / 3) * 100)
      });
    }
    
    return data;
  }
  
  getCurrentWeek() {
    // Trouver la dernière semaine avec au moins une séance complétée
    for (let week = 26; week >= 1; week--) {
      const weekData = this.history[`week_${week}`];
      if (Object.values(weekData).some(d => d.completed)) {
        return week;
      }
    }
    return 1; // Par défaut semaine 1
  }
  
  // ==================== RECORDS PERSONNELS ====================
  
  getPersonalRecords() {
    const prs = {};
    
    for (const week in this.history) {
      for (const day in this.history[week]) {
        const exercises = this.history[week][day].exercises || [];
        
        exercises.forEach(ex => {
          if (!prs[ex.id] || ex.avgWeight > prs[ex.id].weight) {
            prs[ex.id] = {
              name: ex.name,
              weight: ex.avgWeight,
              reps: ex.totalReps,
              volume: ex.volume,
              week: parseInt(week.split('_')[1]),
              date: this.history[week][day].date || 'N/A'
            };
          }
        });
      }
    }
    
    return Object.values(prs).sort((a, b) => b.weight - a.weight);
  }
  
  // ==================== PROGRESSION EXERCICE SPÉCIFIQUE ====================
  
  getExerciseProgress(exerciseId) {
    const progress = [];
    
    for (let week = 1; week <= 26; week++) {
      const weekData = this.history[`week_${week}`];
      
      for (const day in weekData) {
        const exercise = weekData[day].exercises?.find(ex => ex.id === exerciseId);
        if (exercise && exercise.avgWeight) {
          progress.push({
            week,
            day,
            weight: exercise.avgWeight,
            reps: exercise.totalReps,
            volume: exercise.volume,
            rpe: exercise.avgRpe
          });
        }
      }
    }
    
    return progress;
  }
  
  // ==================== ANALYSE TENDANCES ====================
  
  getVolumeGrowthRate() {
    const progression = this.getProgressionData(26);
    if (progression.length < 2) return 0;
    
    const firstWeek = progression[0].volume;
    const lastWeek = progression[progression.length - 1].volume;
    
    return Math.round(((lastWeek - firstWeek) / firstWeek) * 100);
  }
  
  getAverageSessionDuration() {
    let totalDuration = 0;
    let count = 0;
    
    for (const week in this.history) {
      for (const day in this.history[week]) {
        const session = this.history[week][day];
        if (session.completed && session.duration) {
          totalDuration += session.duration;
          count++;
        }
      }
    }
    
    return count > 0 ? Math.round(totalDuration / count) : 0;
  }
  
  // ==================== UTILITAIRES ====================
  
  formatVolume(volume) {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}t`;
    }
    return `${volume}kg`;
  }
  
  refreshHistory() {
    this.history = this.loadHistory();
  }
}

// Export pour utilisation dans app.js
export { StatisticsEngine };
