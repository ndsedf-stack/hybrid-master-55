/**
 * HYBRID MASTER 51 - LOCAL STORAGE
 * Gère la sauvegarde et le chargement des données
 * 
 * @module storage/local-storage
 * @version 1.0.0
 */

export class LocalStorage {
  constructor() {
    this.storageKey = 'hybrid_master_51';
    this.init();
  }

  /**
   * Initialise le storage
   */
  init() {
    if (!this.isAvailable()) {
      console.error('❌ LocalStorage not available');
      return;
    }

    // Créer la structure si elle n'existe pas
    if (!localStorage.getItem(this.storageKey)) {
      this.createInitialStructure();
    }

    console.log('✅ LocalStorage initialized');
  }

  /**
   * Vérifie si localStorage est disponible
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Crée la structure initiale
   */
  createInitialStructure() {
    const initialData = {
      currentWeek: 1,
      currentDay: 'dimanche',
      weekProgress: {},
      modifiedWeights: {},
      sessionHistory: [],
      settings: {
        soundEnabled: true,
        vibrationEnabled: true,
        autoSave: true
      },
      lastSave: Date.now()
    };

    localStorage.setItem(this.storageKey, JSON.stringify(initialData));
  }

  /**
   * Charge toutes les données
   */
  loadAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  /**
   * Sauvegarde toutes les données
   */
  saveAll(data) {
    try {
      data.lastSave = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  /**
   * Charge la progression d'une semaine
   */
  getWeekProgress(week, day) {
    const data = this.loadAll();
    if (!data) return { completedSets: [], notes: '' };

    const key = `week${week}_${day}`;
    return data.weekProgress[key] || { completedSets: [], notes: '' };
  }

  /**
   * Sauvegarde la progression d'une semaine
   */
  saveWeekProgress(week, day, progress) {
    const data = this.loadAll();
    if (!data) return false;

    const key = `week${week}_${day}`;
    data.weekProgress[key] = progress;

    return this.saveAll(data);
  }

  /**
   * Charge le poids modifié d'un exercice
   */
  getWeight(exerciseId, week) {
    const data = this.loadAll();
    if (!data) return null;

    const key = `${exerciseId}_week${week}`;
    return data.modifiedWeights[key] || null;
  }

  /**
   * Sauvegarde un poids modifié
   */
  saveWeight(exerciseId, week, weight) {
    const data = this.loadAll();
    if (!data) return false;

    const key = `${exerciseId}_week${week}`;
    data.modifiedWeights[key] = weight;

    return this.saveAll(data);
  }

  /**
   * Sauvegarde l'état de navigation
   */
  saveNavigation(week, day) {
    const data = this.loadAll();
    if (!data) return false;

    data.currentWeek = week;
    data.currentDay = day;

    return this.saveAll(data);
  }

  /**
   * Charge l'état de navigation
   */
  getNavigation() {
    const data = this.loadAll();
    return data ? {
      week: data.currentWeek,
      day: data.currentDay
    } : { week: 1, day: 'dimanche' };
  }

  /**
   * Ajoute une session à l'historique
   */
  addSessionHistory(session) {
    const data = this.loadAll();
    if (!data) return false;

    data.sessionHistory.push({
      ...session,
      timestamp: Date.now()
    });

    return this.saveAll(data);
  }

  /**
   * Charge l'historique des sessions
   */
  getSessionHistory() {
    const data = this.loadAll();
    return data ? data.sessionHistory : [];
  }

  /**
   * Charge les paramètres
   */
  getSettings() {
    const data = this.loadAll();
    return data ? data.settings : {};
  }

  /**
   * Sauvegarde les paramètres
   */
  saveSettings(settings) {
    const data = this.loadAll();
    if (!data) return false;

    data.settings = { ...data.settings, ...settings };

    return this.saveAll(data);
  }

  /**
   * Efface toutes les données
   */
  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      this.createInitialStructure();
      console.log('✅ Storage cleared');
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Exporte les données en JSON
   */
  exportData() {
    const data = this.loadAll();
    return data ? JSON.stringify(data, null, 2) : null;
  }

  /**
   * Importe des données depuis JSON
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return this.saveAll(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Retourne la taille du storage utilisé
   */
  getSize() {
    const data = localStorage.getItem(this.storageKey);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * Retourne la taille en KB
   */
  getSizeKB() {
    return Math.round(this.getSize() / 1024 * 10) / 10;
  }
}
