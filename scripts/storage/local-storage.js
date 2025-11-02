// ===================================================================
// HYBRID MASTER 51 - GESTION DU STOCKAGE LOCAL
// ===================================================================
// Sauvegarde et récupération des données utilisateur

export class LocalStorage {
  constructor() {
    this.storageKey = 'hybrid_master_51_data';
    this.version = '1.0.0';
  }

  /**
   * Initialise le stockage avec des valeurs par défaut
   */
  initialize() {
    if (!this.hasData()) {
      this.saveData({
        version: this.version,
        currentWeek: 1,
        userProfile: {
          name: '',
          startDate: new Date().toISOString(),
          bodyWeight: null,
          benchPR: null,
          squatPR: null,
          deadliftPR: null
        },
        workoutHistory: [],
        settings: {
          units: 'kg',
          restTimerSound: true,
          darkMode: false
        }
      });
    }
  }

  /**
   * Vérifie si des données existent
   */
  hasData() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  /**
   * Récupère toutes les données
   */
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
      return null;
    }
  }

  /**
   * Sauvegarde toutes les données
   */
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
      return false;
    }
  }

  /**
   * Récupère la semaine actuelle
   */
  getCurrentWeek() {
    const data = this.getData();
    return data?.currentWeek || 1;
  }

  /**
   * Définit la semaine actuelle
   */
  setCurrentWeek(weekNumber) {
    const data = this.getData();
    if (data) {
      data.currentWeek = weekNumber;
      this.saveData(data);
    }
  }

  /**
   * Récupère le profil utilisateur
   */
  getUserProfile() {
    const data = this.getData();
    return data?.userProfile || {};
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateUserProfile(profile) {
    const data = this.getData();
    if (data) {
      data.userProfile = { ...data.userProfile, ...profile };
      this.saveData(data);
    }
  }

  /**
   * Ajoute une séance à l'historique
   */
  addWorkoutToHistory(workout) {
    const data = this.getData();
    if (data) {
      const workoutEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        week: workout.week,
        day: workout.day,
        exercises: workout.exercises,
        duration: workout.duration,
        notes: workout.notes || ''
      };
      
      data.workoutHistory.push(workoutEntry);
      
      // Limiter l'historique à 100 séances
      if (data.workoutHistory.length > 100) {
        data.workoutHistory = data.workoutHistory.slice(-100);
      }
      
      this.saveData(data);
      return workoutEntry;
    }
    return null;
  }

  /**
   * Récupère l'historique des séances
   */
  getWorkoutHistory(limit = 10) {
    const data = this.getData();
    if (data?.workoutHistory) {
      return data.workoutHistory.slice(-limit).reverse();
    }
    return [];
  }

  /**
   * Récupère une séance spécifique
   */
  getWorkout(workoutId) {
    const data = this.getData();
    return data?.workoutHistory.find(w => w.id === workoutId);
  }

  /**
   * Supprime une séance de l'historique
   */
  deleteWorkout(workoutId) {
    const data = this.getData();
    if (data) {
      data.workoutHistory = data.workoutHistory.filter(w => w.id !== workoutId);
      this.saveData(data);
      return true;
    }
    return false;
  }

  /**
   * Récupère les paramètres
   */
  getSettings() {
    const data = this.getData();
    return data?.settings || {};
  }

  /**
   * Met à jour les paramètres
   */
  updateSettings(settings) {
    const data = this.getData();
    if (data) {
      data.settings = { ...data.settings, ...settings };
      this.saveData(data);
    }
  }

  /**
   * Calcule les statistiques globales
   */
  getStatistics() {
    const data = this.getData();
    const history = data?.workoutHistory || [];

    return {
      totalWorkouts: history.length,
      totalDuration: history.reduce((sum, w) => sum + (w.duration || 0), 0),
      currentStreak: this.calculateStreak(history),
      bestStreak: this.calculateBestStreak(history),
      lastWorkout: history[history.length - 1]?.date,
      workoutsByWeek: this.groupWorkoutsByWeek(history),
      exerciseFrequency: this.calculateExerciseFrequency(history)
    };
  }

  /**
   * Calcule la série actuelle d'entraînements
   */
  calculateStreak(history) {
    if (history.length === 0) return 0;

    let streak = 1;
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i].date);
      const next = new Date(sortedHistory[i + 1].date);
      const daysDiff = Math.floor((current - next) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 3) { // Tolérance de 3 jours
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calcule la meilleure série d'entraînements
   */
  calculateBestStreak(history) {
    if (history.length === 0) return 0;

    let bestStreak = 1;
    let currentStreak = 1;

    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = new Date(sortedHistory[i].date);
      const next = new Date(sortedHistory[i + 1].date);
      const daysDiff = Math.floor((next - current) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 3) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  }

  /**
   * Groupe les séances par semaine
   */
  groupWorkoutsByWeek(history) {
    const byWeek = {};
    history.forEach(workout => {
      if (!byWeek[workout.week]) {
        byWeek[workout.week] = [];
      }
      byWeek[workout.week].push(workout);
    });
    return byWeek;
  }

  /**
   * Calcule la fréquence des exercices
   */
  calculateExerciseFrequency(history) {
    const frequency = {};
    history.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const name = exercise.name;
        if (!frequency[name]) {
          frequency[name] = 0;
        }
        frequency[name]++;
      });
    });
    return frequency;
  }

  /**
   * Exporte toutes les données en JSON
   */
  exportData() {
    const data = this.getData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `hybrid_master_51_backup_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Importe des données depuis un fichier JSON
   */
  importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Validation basique
      if (data.version && data.currentWeek) {
        this.saveData(data);
        return true;
      }
      
      throw new Error('Format de données invalide');
    } catch (error) {
      console.error('Erreur import données:', error);
      return false;
    }
  }

  /**
   * Réinitialise toutes les données
   */
  resetData() {
    localStorage.removeItem(this.storageKey);
    this.initialize();
  }

  /**
   * Nettoie les anciennes données
   */
  cleanupOldData(daysToKeep = 90) {
    const data = this.getData();
    if (data?.workoutHistory) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      data.workoutHistory = data.workoutHistory.filter(workout => 
        new Date(workout.date) > cutoffDate
      );
      
      this.saveData(data);
    }
  }
}
