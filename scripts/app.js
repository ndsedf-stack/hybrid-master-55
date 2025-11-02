// ===================================================================
// HYBRID MASTER 51 - APPLICATION PRINCIPALE CORRIGÉE
// ===================================================================

import { PROGRAM_DATA } from './core/program-data.js';
import { ProgressionEngine } from './modules/progression-engine.js';

class HybridMasterApp {
  constructor() {
    this.currentWeek = 1;
    this.selectedDay = null;
    this.programData = PROGRAM_DATA;
    this.progressionEngine = new ProgressionEngine();
    
    this.init();
  }

  init() {
    console.log('🚀 Hybrid Master 51 - Initialisation...');
    
    // Vérifier que les données sont chargées
    if (!this.programData || !this.programData.workouts) {
      console.error('❌ Erreur: Données du programme non chargées');
      return;
    }
    
    console.log('✅ Programme chargé:', this.programData);
    
    // Initialiser l'interface
    this.initUI();
    this.setupEventListeners();
    this.renderWeek(this.currentWeek);
    
    console.log('✅ Application initialisée avec succès');
  }

  initUI() {
    // Générer la grille des semaines
    this.renderWeekGrid();
  }

  setupEventListeners() {
    // Navigation semaines
    const prevBtn = document.getElementById('prevWeek');
    const nextBtn = document.getElementById('nextWeek');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.changeWeek(-1));
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.changeWeek(1));
    }
  }

  renderWeekGrid() {
    const weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) return;
    
    let html = '';
    for (let i = 1; i <= 26; i++) {
      const blockInfo = this.getBlockForWeek(i);
      const isDeload = this.isDeloadWeek(i);
      const activeClass = i === this.currentWeek ? 'active' : '';
      const deloadClass = isDeload ? 'deload' : '';
      
      html += `
        <button 
          class="week-btn ${activeClass} ${deloadClass}" 
          data-week="${i}"
          onclick="window.app.selectWeek(${i})"
        >
          S${i}
        </button>
      `;
    }
    
    weekGrid.innerHTML = html;
  }

  selectWeek(week) {
    this.currentWeek = week;
    this.renderWeek(week);
    this.renderWeekGrid(); // Refresh pour mettre à jour le bouton actif
  }

  changeWeek(delta) {
    const newWeek = this.currentWeek + delta;
    if (newWeek >= 1 && newWeek <= 26) {
      this.selectWeek(newWeek);
    }
  }

  renderWeek(weekNumber) {
    console.log(`📅 Affichage semaine ${weekNumber}`);
    
    // Mettre à jour l'affichage de la semaine
    const weekDisplay = document.getElementById('weekDisplay');
    const blockBadge = document.getElementById('blockBadge');
    
    if (weekDisplay) {
      weekDisplay.textContent = `Semaine ${weekNumber}`;
    }
    
    const blockInfo = this.getBlockForWeek(weekNumber);
    if (blockBadge) {
      blockBadge.textContent = `Bloc ${blockInfo.block}`;
      blockBadge.className = 'block-badge block-' + blockInfo.block;
    }
    
    // Afficher les séances
    this.renderWorkoutDays(weekNumber);
    
    // Mettre à jour les stats
    this.updateStats(weekNumber);
  }

  renderWorkoutDays(weekNumber) {
    const workoutDays = document.getElementById('workoutDays');
    if (!workoutDays) return;
    
    const days = ['dimanche', 'mardi', 'jeudi', 'maison'];
    const dayLabels = {
      'dimanche': 'Dimanche',
      'mardi': 'Mardi',
      'jeudi': 'Jeudi',
      'maison': 'Maison'
    };
    
    let html = '';
    
    days.forEach(day => {
      const workout = this.programData.workouts[day];
      if (!workout) return;
      
      const exerciseCount = workout.exercises.length;
      const estimatedTime = this.calculateWorkoutTime(workout);
      
      html += `
        <div class="workout-card" onclick="window.app.showWorkoutDetails('${day}', ${weekNumber})">
          <div class="workout-card-header">
            <h3>${dayLabels[day]}</h3>
            <span class="workout-badge">${exerciseCount} exercices</span>
          </div>
          <div class="workout-card-body">
            <p class="workout-time">⏱️ ~${estimatedTime} min</p>
            <p class="workout-focus">${workout.focus || 'Séance complète'}</p>
          </div>
          <button class="btn-primary">Voir les exercices →</button>
        </div>
      `;
    });
    
    workoutDays.innerHTML = html;
  }

  showWorkoutDetails(day, weekNumber) {
    console.log(`📋 Affichage détails: ${day}, semaine ${weekNumber}`);
    
    const detailsContainer = document.getElementById('workoutDetails');
    if (!detailsContainer) return;
    
    const workout = this.programData.workouts[day];
    if (!workout) return;
    
    const isDeload = this.isDeloadWeek(weekNumber);
    const blockInfo = this.getBlockForWeek(weekNumber);
    
    let html = `
      <div class="workout-details-header">
        <h2>Séance ${day.charAt(0).toUpperCase() + day.slice(1)}</h2>
        <p class="workout-details-meta">
          Semaine ${weekNumber} - Bloc ${blockInfo.block}
          ${isDeload ? '<span class="badge-deload">DELOAD -40%</span>' : ''}
        </p>
      </div>
      
      <div class="exercises-list">
    `;
    
    workout.exercises.forEach((exercise, index) => {
      // Calculer les poids avec progression
      const calculatedExercise = this.progressionEngine.calculateExercise(
        exercise,
        weekNumber,
        blockInfo,
        isDeload
      );
      
      html += this.renderExerciseCard(calculatedExercise, index + 1);
    });
    
    html += '</div>';
    
    detailsContainer.innerHTML = html;
    detailsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  renderExerciseCard(exercise, number) {
    const weight = exercise.weight > 0 ? `${exercise.weight} kg` : 'Poids du corps';
    const rest = exercise.rest || '60-90s';
    const technique = exercise.technique || '';
    
    return `
      <div class="exercise-card">
        <div class="exercise-number">${number}</div>
        <div class="exercise-content">
          <h3 class="exercise-name">${exercise.name}</h3>
          
          <div class="exercise-specs">
            <span class="spec-item">
              <strong>Sets:</strong> ${exercise.sets}
            </span>
            <span class="spec-item">
              <strong>Reps:</strong> ${exercise.reps}
            </span>
            <span class="spec-item">
              <strong>Poids:</strong> ${weight}
            </span>
            <span class="spec-item">
              <strong>Repos:</strong> ${rest}
            </span>
          </div>
          
          ${technique ? `
            <div class="exercise-technique">
              <span class="technique-badge">${technique}</span>
            </div>
          ` : ''}
          
          ${exercise.notes ? `
            <div class="exercise-notes">
              💡 ${exercise.notes}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  calculateWorkoutTime(workout) {
    // Estimation simple: 3-4 min par set
    let totalSets = 0;
    workout.exercises.forEach(ex => {
      totalSets += ex.sets;
    });
    return Math.round(totalSets * 3.5);
  }

  updateStats(weekNumber) {
    const workout = this.programData.workouts;
    let totalExercises = 0;
    let totalVolume = 0;
    let totalTime = 0;
    
    ['dimanche', 'mardi', 'jeudi', 'maison'].forEach(day => {
      if (workout[day]) {
        totalExercises += workout[day].exercises.length;
        totalTime += this.calculateWorkoutTime(workout[day]);
        
        workout[day].exercises.forEach(ex => {
          totalVolume += ex.sets * parseInt(ex.reps || 10);
        });
      }
    });
    
    // Mettre à jour l'affichage
    const volumeEl = document.getElementById('totalVolume');
    const exercisesEl = document.getElementById('totalExercises');
    const timeEl = document.getElementById('estimatedTime');
    
    if (volumeEl) volumeEl.textContent = totalVolume + ' reps';
    if (exercisesEl) exercisesEl.textContent = totalExercises;
    if (timeEl) timeEl.textContent = totalTime + ' min';
  }

  getBlockForWeek(week) {
    if (week <= 6) return { block: 1, technique: 'Tempo 3-1-2' };
    if (week <= 12) return { block: 2, technique: 'Rest-Pause' };
    if (week <= 18) return { block: 3, technique: 'Drop-sets + Myo-reps' };
    return { block: 4, technique: 'Clusters + Partials' };
  }

  isDeloadWeek(week) {
    return [6, 12, 18, 24, 26].includes(week);
  }
}

// ✅ INITIALISATION AUTOMATIQUE
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM chargé - Démarrage application');
  window.app = new HybridMasterApp();
});

export default HybridMasterApp;
