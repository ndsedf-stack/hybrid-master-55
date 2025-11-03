/**
 * HYBRID MASTER 51 - WORKOUT RENDERER
 * Gère l'affichage des exercices dans le DOM
 */

export class WorkoutRenderer {
  constructor() {
    this.container = document.getElementById('workout-container');
  }

  /**
   * Affiche un workout complet
   */
  render(workout, weekNumber) {
    if (!workout || !workout.exercises) {
      this.container.innerHTML = `
        <div class="error-message">
          <h2>❌ Aucun exercice trouvé</h2>
          <p>Vérifiez que les données sont correctement chargées.</p>
        </div>
      `;
      return;
    }

    const exercisesHTML = workout.exercises.map((ex, index) => 
      this.renderExercise(ex, index, weekNumber)
    ).join('');

    this.container.innerHTML = `
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

    return `
      <div class="exercise-card ${isSuperset ? 'superset' : ''}" data-exercise-id="${index}">
        ${isSuperset ? '<div class="superset-label">SUPERSET</div>' : ''}
        
        <div class="exercise-header">
          <div class="exercise-title">
            <span class="exercise-number">${index + 1}.</span>
            <h3>${exercise.name}</h3>
          </div>
          ${badges}
        </div>

        <div class="exercise-meta">
          <div class="meta-item">
            <span class="meta-label">Séries</span>
            <span class="meta-value">${exercise.sets}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Reps</span>
            <span class="meta-value">${exercise.reps}</span>
          </div>
          <div class="meta-item weight-control">
            <span class="meta-label">Poids (kg)</span>
            <div class="weight-input-group">
              <button class="weight-btn" data-action="decrease">-</button>
              <input 
                type="number" 
                class="weight-input" 
                value="${exercise.weight || 0}" 
                step="2.5"
                data-exercise-id="${index}"
              />
              <button class="weight-btn" data-action="increase">+</button>
            </div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Repos</span>
            <span class="meta-value">${rest}s</span>
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
              🔥 ${exercise.technique}
            </div>
          ` : ''}

          ${exercise.notes ? `
            <div class="exercise-notes">
              📝 ${exercise.notes}
            </div>
          ` : ''}
        </div>

        <div class="sets-tracker">
          ${this.renderSetsCheckboxes(exercise.sets, index)}
        </div>

        <button class="rest-timer-btn" data-rest="${rest}">
          ⏱️ Lancer timer repos (${rest}s)
        </button>
      </div>
    `;
  }

  /**
   * Affiche les badges (type d'exercice, techniques, etc.)
   */
  renderBadges(exercise) {
    const badges = [];

    // Badge type d'exercice
    if (exercise.category) {
      const categoryClass = exercise.category === 'Polyarticulaire' ? 'poly' : 'iso';
      badges.push(`<span class="badge badge-${categoryClass}">${exercise.category}</span>`);
    }

    // Badge superset
    if (exercise.superset) {
      badges.push(`<span class="badge badge-superset">Superset</span>`);
    }

    // Badge technique
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
   * Affiche les checkboxes pour cocher les séries
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
          />
          <span class="set-label">Série ${i}</span>
        </label>
      `);
    }
    return checkboxes.join('');
  }

  /**
   * Attache les event listeners aux éléments
   */
  attachEventListeners() {
    // Event listeners pour les boutons +/-
    const weightBtns = this.container.querySelectorAll('.weight-btn');
    weightBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const input = btn.parentElement.querySelector('.weight-input');
        let currentValue = parseFloat(input.value) || 0;
        
        if (action === 'increase') {
          input.value = currentValue + 2.5;
        } else if (action === 'decrease' && currentValue >= 2.5) {
          input.value = currentValue - 2.5;
        }

        // Déclencher événement de changement
        input.dispatchEvent(new Event('change'));
      });
    });

    // Event listeners pour les inputs poids
    const weightInputs = this.container.querySelectorAll('.weight-input');
    weightInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const exerciseId = input.dataset.exerciseId;
        const newWeight = parseFloat(input.value) || 0;
        
        // Dispatcher un événement personnalisé pour app.js
        const event = new CustomEvent('weight-changed', {
          detail: { exerciseId, newWeight }
        });
        document.dispatchEvent(event);
      });
    });

    // Event listeners pour les checkboxes de séries
    const setCheckboxes = this.container.querySelectorAll('.set-checkbox input');
    setCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const exerciseId = checkbox.dataset.exerciseId;
        const setNumber = checkbox.dataset.set;
        const isChecked = checkbox.checked;

        // Dispatcher un événement personnalisé
        const event = new CustomEvent('set-completed', {
          detail: { exerciseId, setNumber, isChecked }
        });
        document.dispatchEvent(event);
      });
    });

    // Event listeners pour les boutons timer repos
    const timerBtns = this.container.querySelectorAll('.rest-timer-btn');
    timerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const restDuration = parseInt(btn.dataset.rest);
        
        // Dispatcher un événement pour démarrer le timer
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
        <h2>❌ Erreur</h2>
        <p>${message}</p>
      </div>
    `;
  }
}

export default WorkoutRenderer;
