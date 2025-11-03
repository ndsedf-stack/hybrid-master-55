/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE
 * Point d'entrée de l'application
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { ProgramData, PROGRAM } from './core/program-data.js';
import { ProgressionEngine } from './core/progression-engine.js';
import { WorkoutRenderer } from './ui/workout-renderer.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { TimerManager } from './modules/timer-manager.js';
import { LocalStorage } from './storage/local-storage.js';

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================
class HybridMasterApp {
  constructor() {
    // État de l'application
    this.currentWeek = 1;
    this.currentDay = 'dimanche';
    
    // Initialiser les modules
    this.programData = new ProgramData();
    this.progressionEngine = new ProgressionEngine(this.programData);
    this.storage = new LocalStorage();
    
    // Récupérer les éléments DOM
    this.elements = {
      app: document.getElementById('app'),
      workoutContainer: document.getElementById('workout-container'),
      weekDisplay: document.getElementById('week-display'),
      prevWeekBtn: document.getElementById('prev-week'),
      nextWeekBtn: document.getElementById('next-week'),
      timerDisplay: document.getElementById('timer-display'),
      timerStart: document.getElementById('timer-start'),
      timerPause: document.getElementById('timer-pause'),
      timerReset: document.getElementById('timer-reset'),
      dayTabs: document.querySelectorAll('.day-tab')
    };
    
    // Vérifier que tous les éléments existent
    if (!this.validateElements()) {
      console.error('❌ Éléments DOM manquants !');
      return;
    }
    
    // Initialiser les UI
    this.workoutRenderer = new WorkoutRenderer(
      this.elements.workoutContainer,
      this.programData,
      this.progressionEngine
    );
    
    this.navigationUI = new NavigationUI(
      this.elements.weekDisplay,
      this.elements.prevWeekBtn,
      this.elements.nextWeekBtn,
      (week) => this.changeWeek(week)
    );
    
    this.timerManager = new TimerManager(
      this.elements.timerDisplay,
      this.elements.timerStart,
      this.elements.timerPause,
      this.elements.timerReset
    );
    
    // Charger l'état sauvegardé
    this.loadState();
    
    // Initialiser l'application
    this.init();
  }

  /**
   * Valide la présence de tous les éléments DOM requis
   * @returns {boolean}
   */
  validateElements() {
    const required = [
      'app', 'workoutContainer', 'weekDisplay', 
      'prevWeekBtn', 'nextWeekBtn', 'timerDisplay',
      'timerStart', 'timerPause', 'timerReset'
    ];
    
    for (const key of required) {
      if (!this.elements[key]) {
        console.error(`❌ Élément manquant: ${key}`);
        return false;
      }
    }
    
    if (this.elements.dayTabs.length === 0) {
      console.error('❌ Aucun onglet jour trouvé');
      return false;
    }
    
    return true;
  }

  /**
   * Initialise l'application
   */
  init() {
    console.log('✅ Initialisation de l\'application...');
    
    // Attacher les event listeners
    this.attachEventListeners();
    
    // Afficher le workout initial
    this.render();
    
    console.log('✅ Application initialisée !');
  }

  /**
   * Attache tous les event listeners
   */
  attachEventListeners() {
    // Navigation semaines (déjà gérée par NavigationUI)
    
    // Navigation jours
    this.elements.dayTabs.forEach(tab => {
      tab.addEventListener('click', (e) => this.handleDayChange(e));
    });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Event timer personnalisé (déclenché par WorkoutRenderer)
    window.addEventListener('startTimer', (e) => {
      this.timerManager.start(e.detail.duration);
    });
  }

  /**
   * Gère le changement de jour
   * @param {Event} e - Event
   */
  handleDayChange(e) {
    const tab = e.currentTarget;
    const day = tab.dataset.day;
    
    if (day === this.currentDay) return;
    
    // Mettre à jour l'UI
    this.elements.dayTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Changer le jour
    this.currentDay = day;
    this.saveState();
    this.render();
  }

  /**
   * Gère les raccourcis clavier
   * @param {KeyboardEvent} e - Event
   */
  handleKeyboard(e) {
    // Flèches gauche/droite : changer de semaine
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.changeWeek(this.currentWeek - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.changeWeek(this.currentWeek + 1);
    }
    
    // Espace : toggle timer
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      this.timerManager.toggle();
    }
  }

  /**
   * Change de semaine
   * @param {number} week - Numéro de semaine (1-26)
   */
  changeWeek(week) {
    if (week < 1 || week > 26) return;
    
    this.currentWeek = week;
    this.navigationUI.updateWeek(week);
    this.saveState();
    this.render();
  }

  /**
   * Affiche le workout actuel
   */
  render() {
    console.log(`🎯 Affichage Semaine ${this.currentWeek} - ${this.currentDay}`);
    this.workoutRenderer.renderWorkout(this.currentWeek, this.currentDay);
  }

  /**
   * Sauvegarde l'état dans LocalStorage
   */
  saveState() {
    this.storage.save('currentWeek', this.currentWeek);
    this.storage.save('currentDay', this.currentDay);
  }

  /**
   * Charge l'état depuis LocalStorage
   */
  loadState() {
    const savedWeek = this.storage.load('currentWeek');
    const savedDay = this.storage.load('currentDay');
    
    if (savedWeek) {
      this.currentWeek = parseInt(savedWeek);
      this.navigationUI.updateWeek(this.currentWeek);
    }
    
    if (savedDay) {
      this.currentDay = savedDay;
      // Activer l'onglet correspondant
      this.elements.dayTabs.forEach(tab => {
        if (tab.dataset.day === savedDay) {
          this.elements.dayTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        }
      });
    }
  }
}

// ============================================================================
// INITIALISATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Démarrage de Hybrid Master 51...');
  
  try {
    window.app = new HybridMasterApp();
    console.log('✅ Application lancée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    
    // Afficher l'erreur dans l'UI
    const container = document.getElementById('workout-container');
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #ef4444;">
          <h2>❌ Erreur de chargement</h2>
          <p>${error.message}</p>
          <p style="font-size: 0.9rem; color: #999; margin-top: 20px;">
            Ouvrez la console (F12) pour plus de détails
          </p>
        </div>
      `;
    }
  }
});

// Export pour debugging
export default HybridMasterApp;
