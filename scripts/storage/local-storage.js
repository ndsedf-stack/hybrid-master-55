/**
 * LOCAL STORAGE - Gestion du stockage local
 * Module pour gérer la persistance des données
 * 
 * @module storage/local-storage
 * @version 1.0.0
 */

export class LocalStorage {
  constructor() {
    this.prefix = 'hybrid_master_';
    this.checkAvailability();
  }

  /**
   * Vérifie la disponibilité de localStorage
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('localStorage not available:', e);
      return false;
    }
  }

  /**
   * Sauvegarde une valeur
   * @param {string} key - Clé
   * @param {any} value - Valeur (sera JSONifiée)
   */
  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(fullKey, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Récupère une valeur
   * @param {string} key - Clé
   * @param {any} defaultValue - Valeur par défaut
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Supprime une valeur
   * @param {string} key - Clé
   */
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Vide tout le stockage de l'app
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Obtient toutes les clés de l'app
   */
  keys() {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  /**
   * Obtient la taille utilisée (approximatif)
   */
  getSize() {
    let size = 0;
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          size += localStorage.getItem(key).length;
        }
      });
      return size;
    } catch (error) {
      console.error('Error calculating size:', error);
      return 0;
    }
  }

  /**
   * Exporte toutes les données
   */
  export() {
    const data = {};
    
    try {
      this.keys().forEach(key => {
        data[key] = this.get(key);
      });
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Importe des données
   * @param {Object} data - Données à importer
   * @param {boolean} overwrite - Écraser les données existantes
   */
  import(data, overwrite = false) {
    if (!data || typeof data !== 'object') {
      console.error('Invalid data for import');
      return false;
    }

    try {
      Object.entries(data).forEach(([key, value]) => {
        if (overwrite || !this.get(key)) {
          this.set(key, value);
        }
      });
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Sauvegarde la progression d'une semaine
   */
  saveWeekProgress(week, day, progress) {
    return this.set(`week_${week}_${day}`, progress);
  }

  /**
   * Récupère la progression d'une semaine
   */
  getWeekProgress(week, day) {
    return this.get(`week_${week}_${day}`, {
      completed: false,
      completedSets: [],
      modifiedWeights: {},
      notes: ''
    });
  }

  /**
   * Sauvegarde un poids modifié
   */
  saveWeight(exerciseId, week, weight) {
    return this.set(`weight_${exerciseId}_${week}`, weight);
  }

  /**
   * Récupère un poids modifié
   */
  getWeight(exerciseId, week, defaultWeight) {
    return this.get(`weight_${exerciseId}_${week}`, defaultWeight);
  }

  /**
   * Sauvegarde les préférences utilisateur
   */
  savePreferences(prefs) {
    return this.set('user_preferences', prefs);
  }

  /**
   * Récupère les préférences utilisateur
   */
  getPreferences() {
    return this.get('user_preferences', {
      soundEnabled: true,
      vibrationEnabled: true,
      autoTimer: true,
      theme: 'dark'
    });
  }
}
