/**
 * HYBRID MASTER 51 - RENDU UI DES WORKOUTS
 * Affiche les séances, exercices, poids, séries
 */

export class WorkoutRenderer {
  constructor(container, programData, progressionEngine) {
    this.container = container;
    this.programData = programData;
    this.progressionEngine = progressionEngine;
  }

  /**
   * Affiche un workout complet
   * @param {number} weekNumber - Numéro de semaine
   * @param {string} day - Jour (dimanche, mardi, vendredi, maison)
   */
  renderWorkout(weekNumber, day) {
    const workout = this.programData.getWorkout(weekNumber, day);
    
    if (!workout || !workout.exercises) {
      this.renderEmpty(day);
      return;
    }

    const weekData = this.programData.getWeek(weekNumber);
    const isDeload = this.progressionEngine.isDeloadWeek(weekNumber);
    
    let html = `
      <div class="workout-header">
        <h2 class="workout-title">${workout.name}</h2>
        <div class="workout-meta">
          <span class="workout-duration">⏱️ ${workout.duration || '60'} min</span>
          <span class="workout-block">📊 Bloc ${weekData.block}</span>
          ${isDeload ? '<span class="workout-deload">💤 DELOAD -40%</span>' : ''}
        </div>
        ${weekData.technique ? `
          <div class="workout-technique">
            <span class="technique-label">Technique:</span>
            <span class="technique-value">${weekData.technique}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="exercises-list">
        ${this.renderExercises(workout.exercises, weekNumber)}
      </div>
      
      <div class="workout-stats">
        ${this.renderWorkoutStats(weekNumber, day)}
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEventListeners(weekNumber, day);
  }

  /**
   * Rend la liste des exercices
   * @param {Array} exercises - Liste d'exercices
   * @param {number} weekNumber - Numéro de semaine
   * @returns {string} HTML
   */
  renderExercises(exercises, weekNumber) {
    let html = '';
    let currentSuperset = null;

    exercises.forEach((exercise, index) => {
      const weight = this.progressionEngine.getUserWeight(exercise.name, weekNumber) ||
                    this.progressionEngine.calculateWeight(exercise, weekNumber);

      // Gérer les supersets
      if (exercise.superset) {
        if (currentSuperset !== exercise.superset) {
          if (currentSuperset !== null) html += '</div>'; // Fermer le superset précédent
          html += `<div class="superset-group" data-superset="${exercise.superset}">
                    <div class="superset-label">SUPERSET ${exercise.superset}</div>`;
          currentSuperset = exercise.superset;
        }
      } else {
        if (currentSuperset !== null) {
          html += '</div>'; // Fermer le superset
          currentSuperset = null;
        }
      }

      html += this.renderExercise(exercise, weight, weekNumber, index);
    });

    if (currentSuperset !== null) html += '</div>'; // Fermer le dernier superset
    return html;
  }

  /**
   * Rend un exercice individuel
   * @param {Object} exercise - Exercice
   * @param {number} weight - Poids calculé
   * @param {number} weekNumber - Numéro de semaine
   * @param {number} index - Index de l'exercice
   * @returns {string} HTML
   */
  renderExercise(exercise, weight, weekNumber, index) {
    const completedSets = this.getCompletedSets(exercise.name, weekNumber);
    
    return `
      <div class="exercise-card" data-exercise="${exercise.name}" data-index="${index}">
        <div class="exercise-header">
          <div class="exercise-number">${index + 1}</div>
          <h3 class="exercise-name">${exercise.name}</h3>
          <div class="exercise-badges">
            ${this.renderBadges(exercise)}
          </div>
        </div>
        
        <div class="exercise-details">
          <div class="exercise-sets">
            <span class="label">Séries:</span>
            <div class="sets-checkboxes">
              ${this.renderSetsCheckboxes(exercise.sets, completedSets, exercise.name, weekNumber)}
            </div>
          </div>
          
          <div class="exercise-reps">
            <span class="label">Reps:</span>
            <span class="value">${exercise.reps}</span>
          </div>
          
          <div class="exercise-weight">
            <span class="label">Poids:</span>
            <div class="weight-control">
              <button class="weight-btn decrease" data-exercise="${exercise.name}" data-week="${weekNumber}">
                −
              </button>
              <input 
                type="number" 
                class="weight-input" 
                value="${weight}" 
                step="0.5"
                data-exercise="${exercise.name}"
                data-week="${weekNumber}"
              />
              <span class="weight-unit">kg</span>
              <button class="weight-btn increase" data-exercise="${exercise.name}" data-week="${weekNumber}">
                +
              </button>
            </div>
          </div>
          
          ${exercise.rest ? `
            <div class="exercise-rest">
              <span class="label">Repos:</span>
              <span class="value">${exercise.rest}s</span>
              <button class="timer-trigger" data-duration="${exercise.rest}">
                ⏱️ Timer
              </button>
            </div>
          ` : ''}
          
          ${exercise.tempo ? `
            <div class="exercise-tempo">
              <span class="label">Tempo:</span>
              <span class="tempo-value">${exercise.tempo}</span>
              <span class="tempo-help" title="Descendante-Pause-Montante-Pause">
                ❓
              </span>
            </div>
          ` : ''}
          
          ${exercise.rpe ? `
            <div class="exercise-rpe">
              <span class="label">RPE:</span>
              <span class="value">${exercise.rpe}</span>
            </div>
          ` : ''}
        </div>
        
        ${exercise.notes ? `
          <div class="exercise-notes">
            <span class="notes-icon">📝</span>
            <span class="notes-text">${exercise.notes}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Rend les badges d'un exercice
   * @param {Object} exercise - Exercice
   * @returns {string} HTML
   */
  renderBadges(exercise) {
    let badges = [];

    if (exercise.category) {
      badges.push(`<span class="badge badge-category">${exercise.category}</span>`);
    }

    if (exercise.technique) {
      badges.push(`<span class="badge badge-technique">${exercise.technique}</span>`);
    }

    if (exercise.superset) {
      badges.push(`<span class="badge badge-superset">Superset ${exercise.superset}</span>`);
    }

    return badges.join('');
  }

  /**
   * Rend les checkboxes pour les séries
   * @param {number} totalSets - Nombre total de séries
   * @param {Array} completedSets - Séries complétées
   * @param {string} exerciseName - Nom de l'exercice
   * @param {number} weekNumber - Numéro de semaine
   * @returns {string} HTML
   */
  renderSetsCheckboxes(totalSets, completedSets, exerciseName, weekNumber) {
    let html = '';
    for (let i = 1; i <= totalSets; i++) {
      const checked = completedSets.includes(i) ? 'checked' : '';
      html += `
        <label class="set-checkbox">
          <input 
            type="checkbox" 
            ${checked}
            data-exercise="${exerciseName}"
            data-week="${weekNumber}"
            data-set="${i}"
          />
          <span class="set-number">${i}</span>
        </label>
      `;
    }
    return html;
  }

  /**
   * Rend les statistiques du workout
   * @param {number} weekNumber - Numéro de semaine
   * @param {string} day - Jour
   * @returns {string} HTML
   */
  renderWorkoutStats(weekNumber, day) {
    const volume = this.progressionEngine.calculateWorkoutVolume(weekNumber, day);
    
    return `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Séries totales</span>
          <span class="stat-value">${volume.exercises.reduce((sum, ex) => sum + ex.sets, 0)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Volume total</span>
          <span class="stat-value">${Math.round(volume.totalVolume)} kg</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Exercices</span>
          <span class="stat-value">${volume.exercises.length}</span>
        </div>
      </div>
    `;
  }

  /**
   * Affiche un message quand aucun workout
   * @param {string} day - Jour
   */
  renderEmpty(day) {
    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😴</div>
        <h3>Repos bien mérité !</h3>
        <p>Pas d'entraînement prévu le ${day}.</p>
      </div>
    `;
  }

  /**
   * Attache les event listeners
   * @param {number} weekNumber - Numéro de semaine
   * @param {string} day - Jour
   */
  attachEventListeners(weekNumber, day) {
    // Boutons poids +/-
    this.container.querySelectorAll('.weight-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleWeightChange(e, weekNumber));
    });

    // Inputs poids
    this.container.querySelectorAll('.weight-input').forEach(input => {
      input.addEventListener('change', (e) => this.handleWeightInput(e, weekNumber));
    });

    // Checkboxes séries
    this.container.querySelectorAll('.set-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.handleSetComplete(e));
    });

    // Boutons timer
    this.container.querySelectorAll('.timer-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTimerTrigger(e));
    });
  }

  /**
   * Gère le changement de poids (+/-)
   * @param {Event} e - Event
   * @param {number} weekNumber - Numéro de semaine
   */
  handleWeightChange(e, weekNumber) {
    const btn = e.target;
    const exerciseName = btn.dataset.exercise;
    const input = this.container.querySelector(`.weight-input[data-exercise="${exerciseName}"]`);
    
    let currentWeight = parseFloat(input.value);
    const increment = btn.classList.contains('increase') ? 2.5 : -2.5;
    const newWeight = Math.max(0, currentWeight + increment);
    
    input.value = newWeight;
    this.progressionEngine.saveUserWeight(exerciseName, weekNumber, newWeight);
    
    this.showNotification(`Poids modifié: ${newWeight} kg`);
  }

  /**
   * Gère l'input manuel du poids
   * @param {Event} e - Event
   * @param {number} weekNumber - Numéro de semaine
   */
  handleWeightInput(e, weekNumber) {
    const input = e.target;
    const exerciseName = input.dataset.exercise;
    const newWeight = parseFloat(input.value);
    
    this.progressionEngine.saveUserWeight(exerciseName, weekNumber, newWeight);
    this.showNotification(`Poids sauvegardé: ${newWeight} kg`);
  }

  /**
   * Gère la complétion d'une série
   * @param {Event} e - Event
   */
  handleSetComplete(e) {
    const checkbox = e.target;
    const exerciseName = checkbox.dataset.exercise;
    const weekNumber = parseInt(checkbox.dataset.week);
    const setNumber = parseInt(checkbox.dataset.set);
    
    this.saveSetCompletion(exerciseName, weekNumber, setNumber, checkbox.checked);
  }

  /**
   * Gère le déclenchement du timer
   * @param {Event} e - Event
   */
  handleTimerTrigger(e) {
    const duration = parseInt(e.target.dataset.duration);
    // Dispatch event pour le TimerManager
    window.dispatchEvent(new CustomEvent('startTimer', { detail: { duration } }));
  }

  /**
   * Récupère les séries complétées
   * @param {string} exerciseName - Nom de l'exercice
   * @param {number} weekNumber - Numéro de semaine
   * @returns {Array} Tableau des numéros de séries complétées
   */
  getCompletedSets(exerciseName, weekNumber) {
    const key = `sets_${exerciseName}_w${weekNumber}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Sauvegarde la complétion d'une série
   * @param {string} exerciseName - Nom de l'exercice
   * @param {number} weekNumber - Numéro de semaine
   * @param {number} setNumber - Numéro de série
   * @param {boolean} completed - Complété ou non
   */
  saveSetCompletion(exerciseName, weekNumber, setNumber, completed) {
    const key = `sets_${exerciseName}_w${weekNumber}`;
    let completedSets = this.getCompletedSets(exerciseName, weekNumber);
    
    if (completed) {
      if (!completedSets.includes(setNumber)) {
        completedSets.push(setNumber);
      }
    } else {
      completedSets = completedSets.filter(s => s !== setNumber);
    }
    
    localStorage.setItem(key, JSON.stringify(completedSets));
  }

  /**
   * Affiche une notification
   * @param {string} message - Message
   */
  showNotification(message) {
    // Simple notification (peut être amélioré)
    console.log(message);
  }
}

export default WorkoutRenderer;
