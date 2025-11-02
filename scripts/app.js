// ====================================================================
// HYBRID MASTER 51 - APPLICATION PRINCIPALE
// ====================================================================
// Version : 1.0 Corrigée
// Date : Novembre 2025
// ====================================================================

import ProgramData from './core/program-data.js';

// ====================================================================
// CLASSE PRINCIPALE APPLICATION
// ====================================================================
class HybridMasterApp {
  constructor() {
    // Initialisation
    this.programData = new ProgramData();
    this.currentWeek = 1;
    this.currentDay = 'dimanche';
    this.userData = this.loadUserData();
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.isTimerRunning = false;
    
    // Éléments DOM
    this.elements = {
      weekDisplay: document.getElementById('week-display'),
      prevWeek: document.getElementById('prev-week'),
      nextWeek: document.getElementById('next-week'),
      dayTabs: document.getElementById('day-tabs'),
      workoutContainer: document.getElementById('workout-container'),
      timerDisplay: document.getElementById('timer-display'),
      timerControls: document.getElementById('timer-controls'),
      statsContainer: document.getElementById('stats-container')
    };
    
    // Initialiser l'app
    this.init();
  }
  
  // ================================================================
  // INITIALISATION
  // ================================================================
  init() {
    console.log('🚀 Hybrid Master 51 - Initialisation...');
    
    // Valider le programme
    const validation = this.programData.validateProgram();
    if (!validation.isValid) {
      console.error('❌ Erreurs programme:', validation.errors);
      this.showError('Erreur de chargement du programme');
      return;
    }
    
    console.log('✅ Programme validé:', validation);
    
    // Attacher les événements
    this.attachEvents();
    
    // Charger semaine actuelle
    this.loadWeek(this.currentWeek);
    
    console.log('✅ Application prête !');
  }
  
  // ================================================================
  // ÉVÉNEMENTS
  // ================================================================
  attachEvents() {
    // Navigation semaines
    this.elements.prevWeek?.addEventListener('click', () => this.changeWeek(-1));
    this.elements.nextWeek?.addEventListener('click', () => this.changeWeek(1));
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.changeWeek(-1);
      if (e.key === 'ArrowRight') this.changeWeek(1);
      if (e.key === ' ' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        this.toggleTimer();
      }
    });
  }
  
  // ================================================================
  // NAVIGATION
  // ================================================================
  changeWeek(direction) {
    const newWeek = this.currentWeek + direction;
    
    if (newWeek < 1 || newWeek > 26) return;
    
    this.currentWeek = newWeek;
    this.loadWeek(this.currentWeek);
    this.saveUserData();
  }
  
  loadWeek(weekNumber) {
    try {
      const weekData = this.programData.getWeek(weekNumber);
      
      // Mettre à jour l'affichage
      this.updateWeekDisplay(weekNumber, weekData);
      this.renderDayTabs(weekNumber);
      this.renderWorkout(weekNumber, this.currentDay);
      this.updateStats(weekNumber);
      
    } catch (error) {
      console.error('Erreur chargement semaine:', error);
      this.showError(`Impossible de charger la semaine ${weekNumber}`);
    }
  }
  
  changeDay(day) {
    this.currentDay = day;
    this.renderWorkout(this.currentWeek, day);
    this.saveUserData();
  }
  
  // ================================================================
  // AFFICHAGE SEMAINE
  // ================================================================
  updateWeekDisplay(weekNumber, weekData) {
    if (!this.elements.weekDisplay) return;
    
    const isDeload = weekData.isDeload;
    const blockName = this.getBlockName(weekData.block);
    
    this.elements.weekDisplay.innerHTML = `
      <div class="week-info">
        <h1>Semaine ${weekNumber} / 26</h1>
        <div class="week-meta">
          <span class="badge badge-block">Bloc ${weekData.block}</span>
          <span class="badge badge-technique">${weekData.technique}</span>
          ${isDeload ? '<span class="badge badge-deload">DELOAD -40%</span>' : ''}
          <span class="badge badge-rpe">RPE ${weekData.rpeTarget}</span>
        </div>
        <p class="block-name">${blockName}</p>
      </div>
    `;
    
    // Activer/désactiver boutons
    if (this.elements.prevWeek) {
      this.elements.prevWeek.disabled = weekNumber === 1;
    }
    if (this.elements.nextWeek) {
      this.elements.nextWeek.disabled = weekNumber === 26;
    }
  }
  
  getBlockName(blockNumber) {
    const blocks = {
      1: '🏗️ Fondations Techniques',
      2: '💪 Surcharge Progressive',
      3: '🔥 Surcompensation Métabolique',
      4: '⚡ Intensification Maximale',
      5: '🏆 Peak Week'
    };
    return blocks[blockNumber] || '';
  }
  
  // ================================================================
  // ONGLETS JOURS
  // ================================================================
  renderDayTabs(weekNumber) {
    if (!this.elements.dayTabs) return;
    
    const days = [
      { key: 'dimanche', label: 'Dimanche', icon: '💪', duration: '68 min' },
      { key: 'mardi', label: 'Mardi', icon: '🔥', duration: '70 min' },
      { key: 'vendredi', label: 'Vendredi', icon: '⚡', duration: '73 min' },
      { key: 'maison', label: 'Maison', icon: '🏠', duration: '5 min' }
    ];
    
    this.elements.dayTabs.innerHTML = days.map(day => `
      <button 
        class="day-tab ${this.currentDay === day.key ? 'active' : ''}"
        onclick="window.app.changeDay('${day.key}')"
      >
        <span class="day-icon">${day.icon}</span>
        <span class="day-label">${day.label}</span>
        <span class="day-duration">${day.duration}</span>
      </button>
    `).join('');
  }
  
  // ================================================================
  // AFFICHAGE WORKOUT
  // ================================================================
  renderWorkout(weekNumber, day) {
    if (!this.elements.workoutContainer) return;
    
    try {
      const workout = this.programData.getWorkout(weekNumber, day);
      const weekData = this.programData.getWeek(weekNumber);
      
      this.elements.workoutContainer.innerHTML = `
        <div class="workout-header">
          <h2>${workout.name}</h2>
          <div class="workout-meta">
            <span class="meta-item">
              <strong>${workout.totalSets}</strong> séries
            </span>
            <span class="meta-item">
              <strong>${workout.duration}</strong> min
            </span>
            ${day === 'maison' ? `
              <span class="meta-item">
                <strong>${workout.daysPerWeek.join(' + ')}</strong>
              </span>
            ` : ''}
          </div>
        </div>
        
        <div class="exercises-list">
          ${this.renderExercises(workout.exercises, weekNumber, day, weekData)}
        </div>
      `;
      
    } catch (error) {
      console.error('Erreur affichage workout:', error);
      this.elements.workoutContainer.innerHTML = `
        <div class="error-message">
          <p>❌ Erreur lors du chargement de la séance</p>
          <p>${error.message}</p>
        </div>
      `;
    }
  }
  
  renderExercises(exercises, weekNumber, day, weekData) {
    let html = '';
    let currentSuperset = null;
    
    exercises.forEach((exercise, index) => {
      // Début superset
      if (exercise.isSuperset && !currentSuperset) {
        currentSuperset = exercise.supersetWith;
        html += '<div class="superset-container">';
        html += '<div class="superset-label">SUPERSET</div>';
      }
      
      // Rendu exercice
      html += this.renderExercise(exercise, index, weekNumber, day, weekData);
      
      // Fin superset
      if (exercise.isSuperset && currentSuperset && 
          exercise.name === currentSuperset) {
        html += '</div>';
        currentSuperset = null;
      }
    });
    
    return html;
  }
  
  renderExercise(exercise, index, weekNumber, day, weekData) {
    const exerciseKey = `w${weekNumber}_${day}_ex${index}`;
    const userData = this.getUserExerciseData(exerciseKey);
    const currentWeight = userData.weight || exercise.weight;
    
    // Badges techniques
    const badges = this.getExerciseBadges(exercise, weekData);
    
    return `
      <div class="exercise-card ${exercise.isSuperset ? 'is-superset' : ''}" 
           data-exercise-key="${exerciseKey}">
        
        <!-- Header exercice -->
        <div class="exercise-header">
          <div class="exercise-title">
            <span class="exercise-number">${index + 1}</span>
            <h3>${exercise.name}</h3>
          </div>
          <div class="exercise-badges">
            ${badges}
          </div>
        </div>
        
        <!-- Métadonnées -->
        <div class="exercise-meta">
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Séries</span>
              <span class="meta-value">${exercise.sets}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Reps</span>
              <span class="meta-value">${exercise.reps}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Poids</span>
              <div class="weight-control">
                <button class="btn-weight-adjust" onclick="window.app.adjustWeight('${exerciseKey}', -2.5)">−</button>
                <input 
                  type="number" 
                  class="weight-input" 
                  value="${currentWeight}" 
                  step="2.5"
                  onchange="window.app.updateWeight('${exerciseKey}', this.value)"
                />
                <span class="weight-unit">kg</span>
                <button class="btn-weight-adjust" onclick="window.app.adjustWeight('${exerciseKey}', 2.5)">+</button>
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-label">Repos</span>
              <span class="meta-value">${exercise.rest}s</span>
            </div>
          </div>
        </div>
        
        <!-- Tempo -->
        <div class="tempo-display">
          <span class="tempo-label">Tempo:</span>
          <span class="tempo-value">${exercise.tempo}</span>
          <span class="tempo-help">(descente-pause-montée)</span>
        </div>
        
        <!-- Checkboxes séries -->
        <div class="sets-tracker">
          <div class="sets-label">Séries effectuées:</div>
          <div class="sets-checkboxes">
            ${this.renderSetCheckboxes(exercise.sets, exerciseKey, userData)}
          </div>
        </div>
        
        <!-- Notes techniques -->
        ${exercise.notes ? `
          <div class="exercise-notes">
            <strong>📝 Technique:</strong> ${exercise.notes}
          </div>
        ` : ''}
        
        <!-- Bouton timer repos -->
        <button 
          class="btn-start-rest-timer" 
          onclick="window.app.startRestTimer(${exercise.rest})"
        >
          ⏱️ Timer repos (${exercise.rest}s)
        </button>
      </div>
    `;
  }
  
  getExerciseBadges(exercise, weekData) {
    let badges = [];
    
    // Badge catégorie
    if (exercise.category === 'compound') {
      badges.push('<span class="badge badge-compound">POLYARTICULAIRE</span>');
    } else {
      badges.push('<span class="badge badge-isolation">ISOLATION</span>');
    }
    
    // Badge superset
    if (exercise.isSuperset) {
      badges.push('<span class="badge badge-superset">SUPERSET</span>');
    }
    
    // Technique bloc
    const notes = exercise.notes?.toLowerCase() || '';
    if (notes.includes('rest-pause')) {
      badges.push('<span class="badge badge-technique-rp">REST-PAUSE</span>');
    }
    if (notes.includes('drop-set') || notes.includes('drop set')) {
      badges.push('<span class="badge badge-technique-ds">DROP-SET</span>');
    }
    if (notes.includes('myo-reps')) {
      badges.push('<span class="badge badge-technique-mr">MYO-REPS</span>');
    }
    if (notes.includes('clusters')) {
      badges.push('<span class="badge badge-technique-cl">CLUSTERS</span>');
    }
    if (notes.includes('partials')) {
      badges.push('<span class="badge badge-technique-pt">PARTIALS</span>');
    }
    
    return badges.join('');
  }
  
  renderSetCheckboxes(totalSets, exerciseKey, userData) {
    let html = '';
    const completedSets = userData.completedSets || [];
    
    for (let i = 1; i <= totalSets; i++) {
      const isChecked = completedSets.includes(i);
      html += `
        <label class="set-checkbox">
          <input 
            type="checkbox" 
            ${isChecked ? 'checked' : ''}
            onchange="window.app.toggleSet('${exerciseKey}', ${i})"
          />
          <span class="set-number">${i}</span>
        </label>
      `;
    }
    
    return html;
  }
  
  // ================================================================
  // GESTION POIDS
  // ================================================================
  adjustWeight(exerciseKey, delta) {
    const userData = this.getUserExerciseData(exerciseKey);
    const currentWeight = userData.weight || 0;
    const newWeight = Math.max(0, currentWeight + delta);
    
    this.updateWeight(exerciseKey, newWeight);
  }
  
  updateWeight(exerciseKey, newWeight) {
    newWeight = parseFloat(newWeight);
    
    if (!this.userData.exercises) {
      this.userData.exercises = {};
    }
    
    if (!this.userData.exercises[exerciseKey]) {
      this.userData.exercises[exerciseKey] = {};
    }
    
    this.userData.exercises[exerciseKey].weight = newWeight;
    this.saveUserData();
    
    // Mettre à jour l'affichage
    const input = document.querySelector(`[data-exercise-key="${exerciseKey}"] .weight-input`);
    if (input) input.value = newWeight;
  }
  
  // ================================================================
  // GESTION SÉRIES
  // ================================================================
  toggleSet(exerciseKey, setNumber) {
    if (!this.userData.exercises) {
      this.userData.exercises = {};
    }
    
    if (!this.userData.exercises[exerciseKey]) {
      this.userData.exercises[exerciseKey] = { completedSets: [] };
    }
    
    const completedSets = this.userData.exercises[exerciseKey].completedSets || [];
    const index = completedSets.indexOf(setNumber);
    
    if (index > -1) {
      completedSets.splice(index, 1);
    } else {
      completedSets.push(setNumber);
      completedSets.sort((a, b) => a - b);
    }
    
    this.userData.exercises[exerciseKey].completedSets = completedSets;
    this.saveUserData();
  }
  
  getUserExerciseData(exerciseKey) {
    return this.userData.exercises?.[exerciseKey] || {};
  }
  
  // ================================================================
  // TIMER
  // ================================================================
  startRestTimer(seconds) {
    this.stopTimer();
    this.timerSeconds = seconds;
    this.isTimerRunning = true;
    
    this.updateTimerDisplay();
    
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      this.updateTimerDisplay();
      
      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.playNotification();
      }
    }, 1000);
  }
  
  toggleTimer() {
    if (this.isTimerRunning) {
      this.stopTimer();
    } else if (this.timerSeconds > 0) {
      this.startRestTimer(this.timerSeconds);
    }
  }
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
    this.updateTimerDisplay();
  }
  
  updateTimerDisplay() {
    if (!this.elements.timerDisplay) return;
    
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    this.elements.timerDisplay.innerHTML = `
      <div class="timer ${this.isTimerRunning ? 'timer-running' : ''} ${this.timerSeconds <= 10 && this.timerSeconds > 0 ? 'timer-warning' : ''}">
        <div class="timer-display-value">${timeString}</div>
        <div class="timer-controls">
          <button onclick="window.app.toggleTimer()" class="btn-timer-control">
            ${this.isTimerRunning ? '⏸ Pause' : '▶️ Start'}
          </button>
          <button onclick="window.app.stopTimer(); window.app.timerSeconds = 0; window.app.updateTimerDisplay()" class="btn-timer-control">
            ⏹️ Reset
          </button>
        </div>
      </div>
    `;
  }
  
  playNotification() {
    // Son de notification (optionnel)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Repos terminé !', {
        body: 'Prêt pour la prochaine série',
        icon: '/favicon.ico'
      });
    }
    
    // Vibration mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    alert('⏰ Repos terminé ! Prêt pour la prochaine série.');
  }
  
  // ================================================================
  // STATISTIQUES
  // ================================================================
  updateStats(weekNumber) {
    if (!this.elements.statsContainer) return;
    
    try {
      const volume = this.programData.getWeekVolume(weekNumber);
      const weekData = this.programData.getWeek(weekNumber);
      
      this.elements.statsContainer.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Séries totales</div>
            <div class="stat-value">${volume.totalSets}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Répétitions</div>
            <div class="stat-value">${volume.totalReps}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Volume (kg)</div>
            <div class="stat-value">${volume.totalWeight.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Bloc</div>
            <div class="stat-value">${weekData.block}</div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }
  
  // ================================================================
  // SAUVEGARDE LOCALE
  // ================================================================
  loadUserData() {
    try {
      const saved = localStorage.getItem('hybrid_master_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentWeek = data.currentWeek || 1;
        this.currentDay = data.currentDay || 'dimanche';
        return data;
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
    
    return {
      currentWeek: 1,
      currentDay: 'dimanche',
      exercises: {}
    };
  }
  
  saveUserData() {
    try {
      this.userData.currentWeek = this.currentWeek;
      this.userData.currentDay = this.currentDay;
      localStorage.setItem('hybrid_master_data', JSON.stringify(this.userData));
    } catch (error) {
      console.error('Erreur sauvegarde données:', error);
    }
  }
  
  // ================================================================
  // UTILITAIRES
  // ================================================================
  showError(message) {
    console.error(message);
    if (this.elements.workoutContainer) {
      this.elements.workoutContainer.innerHTML = `
        <div class="error-message">
          <h3>❌ Erreur</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }
}

// ====================================================================
// INITIALISATION GLOBALE
// ====================================================================
window.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM chargé, initialisation app...');
  window.app = new HybridMasterApp();
});

// Export pour modules
export default HybridMasterApp;
