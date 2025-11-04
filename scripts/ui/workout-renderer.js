/**
 * HYBRID MASTER 51 - WORKOUT RENDERER
 * Version améliorée avec meilleur design
 */

export class WorkoutRenderer {
  constructor() {
    this.container = document.getElementById('workout-container');
  }

  /**
   * Affiche un workout complet
   */
  render(workout, weekNumber) {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      this.showError(`Aucun exercice trouvé pour cette séance`);
      return;
    }

    const exercisesHTML = workout.exercises.map((ex, index) => 
      this.renderExercise(ex, index, weekNumber)
    ).join('');

    this.container.innerHTML = `
      <div class="workout-header">
        <h2>${workout.name || 'Séance d\'entraînement'}</h2>
        <div class="workout-info">
          <span class="workout-duration">⏱️ ${workout.duration || '60'} min</span>
          <span class="workout-exercises">💪 ${workout.exercises.length} exercices</span>
        </div>
      </div>
      <div class="exercises-list">
        ${exercisesHTML}
      </div>
    `;

    // Attacher les event listeners après le rendu
    this.attachEventListeners();
  }

  /**
   * Affiche un exercice individuel
   */
  renderExercise(exercise, index, weekNumber) {
    const isSuperset = exercise.superset || false;
    const badges = this.renderBadges(exercise);
    const tempo = exercise.tempo || '2-0-2-0';
    const rest = exercise.rest || 90;
    const rpe = exercise.rpe || 'N/A';

    return `
      <div class="exercise-card ${isSuperset ? 'superset' : ''}" data-exercise-id="${index}">
        ${isSuperset ? '<div class="superset-label">⚡ SUPERSET</div>' : ''}
        
        <div class="exercise-header">
          <div class="exercise-title">
            <span class="exercise-number">${index + 1}</span>
            <h3>${exercise.name}</h3>
          </div>
          ${badges}
        </div>

        <div class="exercise-meta">
          <div class="meta-row">
            <div class="meta-item">
              <span class="meta-label">Séries</span>
              <span class="meta-value">${exercise.sets}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Reps</span>
              <span class="meta-value">${exercise.reps}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">RPE</span>
              <span class="meta-value">${rpe}</span>
            </div>
          </div>
          
          <div class="meta-row weight-row">
            <div class="meta-item weight-control">
              <span class="meta-label">💪 Poids (kg)</span>
              <div class="weight-input-group">
                <button class="weight-btn weight-btn-minus" data-action="decrease" title="Diminuer -2.5kg">−</button>
                <input 
                  type="number" 
                  class="weight-input" 
                  value="${exercise.weight || 0}" 
                  step="2.5"
                  min="0"
                  data-exercise-id="${index}"
                />
                <button class="weight-btn weight-btn-plus" data-action="increase" title="Augmenter +2.5kg">+</button>
              </div>
            </div>
            <div class="meta-item">
              <span class="meta-label">⏱️ Repos</span>
              <span class="meta-value">${rest}s</span>
            </div>
          </div>
        </div>

        <div class="exercise-details">
          <div class="tempo-display">
            <span class="tempo-label">Tempo:</span>
            <span class="tempo-value">${tempo}</span>
            <span class="tempo-help">(desc-pause-mont-pause)</span>
          </div>
          
          ${exercise.technique ? `
            <div class="technique-badge">
              🔥 <strong>${exercise.technique}</strong>
            </div>
          ` : ''}

          ${exercise.notes ? `
            <div class="exercise-notes">
              <strong>📝 Notes:</strong> ${exercise.notes}
            </div>
          ` : ''}
        </div>

        <div class="sets-tracker">
          <div class="sets-tracker-header">Cocher les séries complétées :</div>
          <div class="sets-checkboxes">
            ${this.renderSetsCheckboxes(exercise.sets, index)}
          </div>
        </div>

        <button class="rest-timer-btn" data-rest="${rest}">
          ⏱️ Démarrer repos (${rest}s)
        </button>
      </div>
    `;
  }

  /**
   * Affiche les badges
   */
  renderBadges(exercise) {
    const badges = [];

    if (exercise.category) {
      const categoryClass = exercise.category === 'Polyarticulaire' ? 'poly' : 'iso';
      badges.push(`<span class="badge badge-${categoryClass}">${exercise.category}</span>`);
    }

    if (exercise.superset) {
      badges.push(`<span class="badge badge-superset">Superset</span>`);
    }

    if (exercise.technique) {
      badges.push(`<span class="badge badge-technique">${exercise.technique}</span>`);
    }

    return badges.length > 0 ? `
      <div class="exercise-badges">
        ${badges.join('')}
      </div>
    ` : '';
  }

  /**
   * Affiche les checkboxes pour les séries
   */
  renderSetsCheckboxes(totalSets, exerciseIndex) {
    const checkboxes = [];
    for (let i = 1; i <= totalSets; i++) {
      checkboxes.push(`
        <label class="set-checkbox">
          <input 
            type="checkbox" 
            data-exercise-id="${exerciseIndex}" 
            data-set="${i}"
            id="set-${exerciseIndex}-${i}"
          />
          <span class="set-label">${i}</span>
        </label>
      `);
    }
    return checkboxes.join('');
  }

  /**
   * Attache les event listeners
   */
  attachEventListeners() {
    // Boutons +/-
    const weightBtns = this.container.querySelectorAll('.weight-btn');
    weightBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const input = btn.parentElement.querySelector('.weight-input');
        let currentValue = parseFloat(input.value) || 0;
        
        if (action === 'increase') {
          input.value = (currentValue + 2.5).toFixed(1);
        } else if (action === 'decrease' && currentValue >= 2.5) {
          input.value = (currentValue - 2.5).toFixed(1);
        }

        input.dispatchEvent(new Event('change'));
      });
    });

    // Inputs poids
    const weightInputs = this.container.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const exerciseId = input.dataset.exerciseId;
        const newWeight = parseFloat(input.value) || 0;
        
        const event = new CustomEvent('weight-changed', {
          detail: { exerciseId, newWeight }
        });
        document.dispatchEvent(event);
      });
    });

    // Checkboxes séries
    const setCheckboxes = this.container.querySelectorAll('.set-checkbox input');
    setCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const exerciseId = checkbox.dataset.exerciseId;
        const setNumber = checkbox.dataset.set;
        const isChecked = checkbox.checked;

        const event = new CustomEvent('set-completed', {
          detail: { exerciseId, setNumber, isChecked }
        });
        document.dispatchEvent(event);
      });
    });

    // Boutons timer repos
    const timerBtns = this.container.querySelectorAll('.rest-timer-btn');
    timerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const restDuration = parseInt(btn.dataset.rest);
        
        const event = new CustomEvent('start-rest-timer', {
          detail: { duration: restDuration }
        });
        document.dispatchEvent(event);
      });
    });
  }

  /**
   * Affiche un message de chargement
   */
  showLoading() {
    this.container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Chargement des exercices...</p>
      </div>
    `;
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h2>Erreur</h2>
        <p>${message}</p>
        <button onclick="location.reload()" class="retry-btn">
          🔄 Recharger la page
        </button>
      </div>
    `;
  }
}

export default WorkoutRenderer;
