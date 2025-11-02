/**
 * WORKOUT RENDERER - Affichage des séances d'entraînement
 * Module UI responsable du rendu visuel des workouts
 * 
 * @module ui/workout-renderer
 * @version 1.0.0
 */

export class WorkoutRenderer {
  constructor() {
    this.container = document.getElementById('workout-container');
    this.currentWeek = 1;
    this.currentDay = 'dimanche';
  }

  /**
   * Affiche une séance complète
   * @param {Object} workout - Données de la séance
   * @param {number} weekNumber - Numéro de semaine
   */
  render(workout, weekNumber) {
    if (!this.container) {
      console.error('Container #workout-container not found');
      return;
    }

    this.currentWeek = weekNumber;
    this.container.innerHTML = this.generateWorkoutHTML(workout, weekNumber);
    this.attachEventListeners();
  }

  /**
   * Génère le HTML d'une séance
   */
  generateWorkoutHTML(workout, weekNumber) {
    if (!workout || !workout.exercises) {
      return `
        <div class="no-workout">
          <p>Aucune séance disponible pour ce jour</p>
        </div>
      `;
    }

    const isDeload = workout.isDeload || false;
    const technique = workout.technique || '';

    return `
      <div class="workout-header">
        <h2>${workout.name}</h2>
        <div class="workout-meta">
          <span class="duration">⏱️ ${workout.duration} min</span>
          ${isDeload ? '<span class="badge badge-deload">DELOAD -40%</span>' : ''}
          ${technique ? `<span class="badge badge-technique">${technique}</span>` : ''}
        </div>
      </div>

      <div class="exercises-list" id="exercises-list">
        ${workout.exercises.map((ex, index) => this.generateExerciseHTML(ex, index)).join('')}
      </div>

      <div class="workout-footer">
        <button class="btn btn-primary" id="start-workout">
          ▶️ Démarrer la séance
        </button>
      </div>
    `;
  }

  /**
   * Génère le HTML d'un exercice
   */
  generateExerciseHTML(exercise, index) {
    if (exercise.category === 'superset') {
      return this.generateSupersetHTML(exercise, index);
    }

    const badgeClass = exercise.category === 'compound' ? 'badge-compound' : 'badge-isolation';
    const badgeText = exercise.category === 'compound' ? 'Polyarticulaire' : 'Isolation';

    return `
      <div class="exercise-card" data-exercise-id="${exercise.id}">
        <div class="exercise-header">
          <div class="exercise-number">${index + 1}</div>
          <div class="exercise-info">
            <h3 class="exercise-name">${exercise.name}</h3>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
        </div>

        <div class="exercise-details">
          <div class="detail-group">
            <label>Séries</label>
            <span class="detail-value">${exercise.sets}</span>
          </div>
          <div class="detail-group">
            <label>Répétitions</label>
            <span class="detail-value">${exercise.reps}</span>
          </div>
          <div class="detail-group">
            <label>Poids</label>
            <div class="weight-control">
              <button class="btn-adjust" data-action="decrease">-</button>
              <input type="number" 
                     class="weight-input" 
                     value="${exercise.weight}" 
                     step="2.5"
                     data-exercise-id="${exercise.id}">
              <span class="unit">kg</span>
              <button class="btn-adjust" data-action="increase">+</button>
            </div>
          </div>
          <div class="detail-group">
            <label>Repos</label>
            <span class="detail-value">${exercise.rest}s</span>
          </div>
        </div>

        ${exercise.tempo ? `
          <div class="tempo-display">
            <label>Tempo</label>
            <span class="tempo-value">${exercise.tempo}</span>
            <span class="tempo-help">(descente-pause-montée)</span>
          </div>
        ` : ''}

        ${exercise.rpe ? `
          <div class="rpe-display">
            <label>RPE</label>
            <span class="rpe-value">${exercise.rpe}/10</span>
          </div>
        ` : ''}

        ${exercise.notes ? `
          <div class="exercise-notes">
            <span class="notes-icon">📝</span>
            <p>${exercise.notes}</p>
          </div>
        ` : ''}

        <div class="sets-tracker">
          ${Array.from({length: exercise.sets}, (_, i) => `
            <label class="set-checkbox">
              <input type="checkbox" 
                     data-exercise-id="${exercise.id}" 
                     data-set="${i + 1}">
              <span>Série ${i + 1}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Génère le HTML d'un superset
   */
  generateSupersetHTML(superset, index) {
    return `
      <div class="exercise-card superset-card" data-exercise-id="${superset.id}">
        <div class="superset-header">
          <div class="exercise-number">${index + 1}</div>
          <div class="superset-info">
            <span class="badge badge-superset">SUPERSET</span>
            <h3 class="exercise-name">${superset.name}</h3>
          </div>
        </div>

        <div class="superset-exercises">
          ${superset.exercises.map((ex, i) => `
            <div class="superset-exercise">
              <h4>${String.fromCharCode(65 + i)}. ${ex.name}</h4>
              <div class="exercise-details">
                <div class="detail-group">
                  <label>Répétitions</label>
                  <span class="detail-value">${ex.reps}</span>
                </div>
                <div class="detail-group">
                  <label>Poids</label>
                  <div class="weight-control">
                    <button class="btn-adjust" data-action="decrease">-</button>
                    <input type="number" 
                           class="weight-input" 
                           value="${ex.weight}" 
                           step="2.5"
                           data-exercise-id="${superset.id}_${i}">
                    <span class="unit">kg</span>
                    <button class="btn-adjust" data-action="increase">+</button>
                  </div>
                </div>
                ${ex.tempo ? `
                  <div class="detail-group">
                    <label>Tempo</label>
                    <span class="detail-value">${ex.tempo}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('<div class="superset-divider">↓ puis ↓</div>')}
        </div>

        <div class="exercise-details">
          <div class="detail-group">
            <label>Séries totales</label>
            <span class="detail-value">${superset.sets}</span>
          </div>
          <div class="detail-group">
            <label>Repos après cycle</label>
            <span class="detail-value">${superset.rest}s</span>
          </div>
          ${superset.rpe ? `
            <div class="detail-group">
              <label>RPE</label>
              <span class="detail-value">${superset.rpe}/10</span>
            </div>
          ` : ''}
        </div>

        ${superset.notes ? `
          <div class="exercise-notes">
            <span class="notes-icon">📝</span>
            <p>${superset.notes}</p>
          </div>
        ` : ''}

        <div class="sets-tracker">
          ${Array.from({length: superset.sets}, (_, i) => `
            <label class="set-checkbox">
              <input type="checkbox" 
                     data-exercise-id="${superset.id}" 
                     data-set="${i + 1}">
              <span>Cycle ${i + 1}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attache les event listeners
   */
  attachEventListeners() {
    // Ajustement poids
    document.querySelectorAll('.btn-adjust').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleWeightAdjust(e));
    });

    // Input poids manuel
    document.querySelectorAll('.weight-input').forEach(input => {
      input.addEventListener('change', (e) => this.handleWeightChange(e));
    });

    // Checkboxes séries
    document.querySelectorAll('.set-checkbox input').forEach(cb => {
      cb.addEventListener('change', (e) => this.handleSetCheck(e));
    });

    // Bouton démarrer séance
    const startBtn = document.getElementById('start-workout');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startWorkout());
    }
  }

  /**
   * Gère l'ajustement du poids (+/-)
   */
  handleWeightAdjust(e) {
    const button = e.target;
    const action = button.dataset.action;
    const input = button.parentElement.querySelector('.weight-input');
    
    if (!input) return;

    const currentWeight = parseFloat(input.value) || 0;
    const newWeight = action === 'increase' 
      ? currentWeight + 2.5 
      : Math.max(0, currentWeight - 2.5);

    input.value = newWeight.toFixed(1);
    this.saveWeight(input.dataset.exerciseId, newWeight);
  }

  /**
   * Gère le changement manuel du poids
   */
  handleWeightChange(e) {
    const input = e.target;
    const weight = parseFloat(input.value) || 0;
    this.saveWeight(input.dataset.exerciseId, weight);
  }

  /**
   * Gère le check d'une série
   */
  handleSetCheck(e) {
    const checkbox = e.target;
    const exerciseId = checkbox.dataset.exerciseId;
    const setNumber = parseInt(checkbox.dataset.set);

    this.saveSetCompletion(exerciseId, setNumber, checkbox.checked);
  }

  /**
   * Sauvegarde un poids modifié
   */
  saveWeight(exerciseId, weight) {
    const key = `weight_${this.currentWeek}_${exerciseId}`;
    localStorage.setItem(key, weight.toString());
    
    // Émettre un événement custom
    window.dispatchEvent(new CustomEvent('weightChanged', {
      detail: { exerciseId, weight, week: this.currentWeek }
    }));
  }

  /**
   * Sauvegarde la complétion d'une série
   */
  saveSetCompletion(exerciseId, setNumber, completed) {
    const key = `set_${this.currentWeek}_${exerciseId}_${setNumber}`;
    localStorage.setItem(key, completed.toString());

    // Émettre un événement custom
    window.dispatchEvent(new CustomEvent('setCompleted', {
      detail: { exerciseId, setNumber, completed, week: this.currentWeek }
    }));
  }

  /**
   * Démarre le mode séance
   */
  startWorkout() {
    window.dispatchEvent(new CustomEvent('workoutStarted', {
      detail: { week: this.currentWeek, day: this.currentDay }
    }));
  }

  /**
   * Nettoie le rendu
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
