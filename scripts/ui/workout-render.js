/**
 * HYBRID MASTER 51 - WORKOUT RENDERER
 * Affiche les séances d'entraînement dans le DOM
 * 
 * @module ui/workout-renderer
 * @version 1.0.0
 */

export class WorkoutRenderer {
  constructor() {
    this.container = document.getElementById('workout-container');
    
    if (!this.container) {
      console.error('❌ Element #workout-container not found');
    }
  }

  /**
   * Affiche un workout complet
   * @param {Object} workout - Les données du workout
   * @param {number} weekNumber - Numéro de la semaine
   */
  render(workout, weekNumber) {
    if (!this.container) {
      console.error('❌ Cannot render: container not found');
      return;
    }

    // Vider le container
    this.container.innerHTML = '';

    // Créer le header du workout
    const header = this.createWorkoutHeader(workout, weekNumber);
    this.container.appendChild(header);

    // Créer la liste des exercices
    const exercisesList = this.createExercisesList(workout.exercises, weekNumber);
    this.container.appendChild(exercisesList);

    console.log(`✅ Rendered ${workout.exercises.length} exercises`);
  }

  /**
   * Crée le header du workout
   */
  createWorkoutHeader(workout, weekNumber) {
    const header = document.createElement('div');
    header.className = 'workout-header';

    header.innerHTML = `
      <h2>${workout.name}</h2>
      <div class="workout-meta">
        <span class="meta-item">
          <strong>Durée :</strong> ${workout.duration} min
        </span>
        <span class="meta-item">
          <strong>Séries :</strong> ${workout.totalSets}
        </span>
        ${workout.daysPerWeek ? `
          <span class="meta-item">
            <strong>Jours :</strong> ${workout.daysPerWeek.join(', ')}
          </span>
        ` : ''}
      </div>
    `;

    return header;
  }

  /**
   * Crée la liste des exercices
   */
  createExercisesList(exercises, weekNumber) {
    const list = document.createElement('div');
    list.className = 'exercises-list';

    exercises.forEach((exercise, index) => {
      const exerciseCard = this.createExerciseCard(exercise, index + 1, weekNumber);
      list.appendChild(exerciseCard);
    });

    return list;
  }

  /**
   * Crée une carte d'exercice
   */
  createExerciseCard(exercise, number, weekNumber) {
    const card = document.createElement('div');
    card.className = `exercise-card ${exercise.isSuperset ? 'superset' : ''}`;
    card.dataset.exerciseId = exercise.id;

    // Header de l'exercice
    const cardHeader = document.createElement('div');
    cardHeader.className = 'exercise-header';
    cardHeader.innerHTML = `
      <div class="exercise-title">
        <span class="exercise-number">${number}</span>
        <h3>${exercise.name}</h3>
      </div>
      <div class="exercise-badges">
        ${this.createBadges(exercise)}
      </div>
    `;

    // Métadonnées
    const cardMeta = document.createElement('div');
    cardMeta.className = 'exercise-meta';
    cardMeta.innerHTML = `
      <div class="meta-row">
        <span class="meta-label">Séries :</span>
        <span class="meta-value">${exercise.sets}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Reps :</span>
        <span class="meta-value">${exercise.reps}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Poids :</span>
        <span class="meta-value">
          <button class="weight-btn weight-decrease" data-exercise-id="${exercise.id}">-</button>
          <input 
            type="number" 
            class="weight-input" 
            value="${exercise.weight}" 
            data-exercise-id="${exercise.id}"
            min="0"
            step="2.5"
          />
          <button class="weight-btn weight-increase" data-exercise-id="${exercise.id}">+</button>
          <span class="weight-unit">kg</span>
        </span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Repos :</span>
        <span class="meta-value">
          ${exercise.rest}s
          <button class="timer-start-btn" data-rest="${exercise.rest}">⏱️ Timer</button>
        </span>
      </div>
      ${exercise.tempo ? `
        <div class="meta-row tempo-row">
          <span class="meta-label">Tempo :</span>
          <span class="meta-value tempo-value">${exercise.tempo}</span>
          <span class="tempo-help" title="Descente-Pause-Montée">ℹ️</span>
        </div>
      ` : ''}
    `;

    // Checkboxes pour les séries
    const setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    
    for (let i = 1; i <= exercise.sets; i++) {
      const setCheckbox = document.createElement('label');
      setCheckbox.className = 'set-checkbox';
      setCheckbox.innerHTML = `
        <input 
          type="checkbox" 
          data-exercise-id="${exercise.id}"
          data-set-number="${i}"
          class="set-check"
        />
        <span>Série ${i}</span>
      `;
      setsContainer.appendChild(setCheckbox);
    }

    // Notes
    const notes = document.createElement('div');
    notes.className = 'exercise-notes';
    notes.innerHTML = `<p>📝 ${exercise.notes}</p>`;

    // Assembler la carte
    card.appendChild(cardHeader);
    card.appendChild(cardMeta);
    card.appendChild(setsContainer);
    card.appendChild(notes);

    // Attacher les event listeners
    this.attachExerciseListeners(card, exercise);

    return card;
  }

  /**
   * Crée les badges d'un exercice
   */
  createBadges(exercise) {
    let badges = '';

    // Badge catégorie
    badges += `<span class="badge badge-${exercise.category}">${exercise.category === 'compound' ? 'Polyarticulaire' : 'Isolation'}</span>`;

    // Badge superset
    if (exercise.isSuperset) {
      badges += `<span class="badge badge-superset">SUPERSET avec ${exercise.supersetWith}</span>`;
    }

    return badges;
  }

  /**
   * Attache les event listeners d'un exercice
   */
  attachExerciseListeners(card, exercise) {
    // Checkboxes séries
    const checkboxes = card.querySelectorAll('.set-check');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const event = new CustomEvent('setCompleted', {
          detail: {
            exerciseId: e.target.dataset.exerciseId,
            setNumber: parseInt(e.target.dataset.setNumber),
            completed: e.target.checked
          }
        });
        window.dispatchEvent(event);
      });
    });

    // Boutons poids
    const decreaseBtn = card.querySelector('.weight-decrease');
    const increaseBtn = card.querySelector('.weight-increase');
    const weightInput = card.querySelector('.weight-input');

    if (decreaseBtn) {
      decreaseBtn.addEventListener('click', () => {
        const currentWeight = parseFloat(weightInput.value);
        const newWeight = Math.max(0, currentWeight - 2.5);
        weightInput.value = newWeight;
        this.dispatchWeightChange(exercise.id, newWeight);
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', () => {
        const currentWeight = parseFloat(weightInput.value);
        const newWeight = currentWeight + 2.5;
        weightInput.value = newWeight;
        this.dispatchWeightChange(exercise.id, newWeight);
      });
    }

    if (weightInput) {
      weightInput.addEventListener('change', (e) => {
        const newWeight = parseFloat(e.target.value);
        this.dispatchWeightChange(exercise.id, newWeight);
      });
    }

    // Bouton timer
    const timerBtn = card.querySelector('.timer-start-btn');
    if (timerBtn) {
      timerBtn.addEventListener('click', (e) => {
        const restTime = parseInt(e.target.dataset.rest);
        const event = new CustomEvent('startTimer', {
          detail: { duration: restTime }
        });
        window.dispatchEvent(event);
      });
    }
  }

  /**
   * Dispatch un événement de changement de poids
   */
  dispatchWeightChange(exerciseId, weight) {
    const event = new CustomEvent('weightChanged', {
      detail: {
        exerciseId: exerciseId,
        weight: weight
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Vide le container
   */
  clear() {
    if (this.container) {
      this.container.innerHTML = '<div class="no-workout"><p>Aucune séance disponible</p></div>';
    }
  }
}
