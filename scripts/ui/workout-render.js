// ===================================================================
// HYBRID MASTER 51 - MOTEUR DE RENDU DES SÉANCES
// ===================================================================
// Génère le HTML des séances d'entraînement

export class WorkoutRenderer {
  constructor(programData, progressionEngine) {
    this.programData = programData;
    this.progressionEngine = progressionEngine;
  }

  /**
   * Rend une semaine complète
   */
  renderWeek(weekNumber) {
    const workouts = this.programData.weeklySchedule;
    const container = document.createElement('div');
    container.className = 'workout-grid';

    Object.entries(workouts).forEach(([day, workout]) => {
      const card = this.renderWorkoutCard(day, workout, weekNumber);
      container.appendChild(card);
    });

    return container;
  }

  /**
   * Rend une carte de séance
   */
  renderWorkoutCard(day, workout, weekNumber) {
    const card = document.createElement('div');
    card.className = 'workout-card';
    card.dataset.day = day;

    // Header
    const header = this.createWorkoutHeader(day, workout);
    card.appendChild(header);

    // Échauffement
    if (day !== 'maison') {
      const warmup = this.createWarmupSection();
      card.appendChild(warmup);
    }

    // Exercices
    const exerciseList = this.createExerciseList(workout.exercises, weekNumber);
    card.appendChild(exerciseList);

    return card;
  }

  /**
   * Crée l'en-tête d'une séance
   */
  createWorkoutHeader(day, workout) {
    const header = document.createElement('div');
    header.className = 'workout-header';

    const dayIcon = this.getDayIcon(day);
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);

    header.innerHTML = `
      <h3 class="workout-day">
        <span class="workout-icon">${dayIcon}</span>
        ${dayName}
      </h3>
      <div class="workout-duration">
        <span>⏱️</span>
        <span>${workout.duration || '60-90min'}</span>
      </div>
    `;

    return header;
  }

  /**
   * Crée la section échauffement
   */
  createWarmupSection() {
    const section = document.createElement('div');
    section.className = 'warmup-section';
    section.innerHTML = `
      <div class="alert alert-info">
        <span class="alert-icon">🔥</span>
        <div class="alert-content">
          <div class="alert-title">Échauffement</div>
          <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.875rem;">
            <li>5-10min cardio léger</li>
            <li>Mobilité articulaire</li>
            <li>2 séries d'échauffement par exercice</li>
          </ul>
        </div>
      </div>
    `;
    return section;
  }

  /**
   * Crée la liste des exercices
   */
  createExerciseList(exercises, weekNumber) {
    const list = document.createElement('ul');
    list.className = 'exercise-list';

    exercises.forEach((exercise, index) => {
      const item = this.createExerciseItem(exercise, weekNumber, index);
      list.appendChild(item);
    });

    return list;
  }

  /**
   * Crée un élément d'exercice
   */
  createExerciseItem(exercise, weekNumber, index) {
    const item = document.createElement('li');
    item.className = 'exercise-item';
    item.dataset.exerciseIndex = index;

    // Marquer les supersets
    if (exercise.superset) {
      item.classList.add('superset');
    }

    // Nom de l'exercice
    const name = document.createElement('div');
    name.className = 'exercise-name';
    
    // Gestion de la rotation biceps
    let exerciseName = exercise.name;
    if (exercise.name === 'Biceps Rotation') {
      const isInclineWeek = this.progressionEngine.isBicepsInclineWeek(weekNumber);
      exerciseName = isInclineWeek ? 'Incline Curl' : 'Spider Curl';
    }
    
    name.textContent = exerciseName;
    item.appendChild(name);

    // Détails de l'exercice
    const details = this.createExerciseDetails(exercise, weekNumber);
    item.appendChild(details);

    // Techniques spéciales
    if (exercise.technique) {
      const technique = this.createTechniqueBadge(exercise.technique);
      item.appendChild(technique);
    }

    return item;
  }

  /**
   * Crée les détails d'un exercice
   */
  createExerciseDetails(exercise, weekNumber) {
    const details = document.createElement('div');
    details.className = 'exercise-details';

    // Calcul du poids pour cette semaine
    const weight = this.progressionEngine.calculateWeightForWeek(
      exercise,
      weekNumber
    );

    // Sets
    const sets = this.createDetailBadge('📊', `${exercise.sets} séries`);
    details.appendChild(sets);

    // Reps
    const reps = this.createDetailBadge('🔢', exercise.reps);
    details.appendChild(reps);

    // Poids
    if (weight) {
      const weightBadge = this.createDetailBadge('💪', weight);
      details.appendChild(weightBadge);
    }

    // Repos
    if (exercise.rest) {
      const rest = this.createDetailBadge('⏱️', exercise.rest);
      details.appendChild(rest);
    }

    // Tempo
    if (exercise.tempo) {
      const tempo = this.createDetailBadge('⏲️', `Tempo: ${exercise.tempo}`);
      details.appendChild(tempo);
    }

    return details;
  }

  /**
   * Crée un badge de détail
   */
  createDetailBadge(icon, text) {
    const badge = document.createElement('span');
    badge.className = 'detail-badge';
    badge.innerHTML = `
      <span>${icon}</span>
      <span>${text}</span>
    `;
    return badge;
  }

  /**
   * Crée un badge de technique
   */
  createTechniqueBadge(technique) {
    const badge = document.createElement('div');
    badge.className = 'technique-badge';
    badge.textContent = technique;
    return badge;
  }

  /**
   * Retourne l'icône pour un jour
   */
  getDayIcon(day) {
    const icons = {
      dimanche: '🏋️',
      mardi: '💪',
      jeudi: '🔥',
      maison: '🏠'
    };
    return icons[day] || '💪';
  }

  /**
   * Rend les statistiques de volume par muscle
   */
  renderVolumeStats(weekNumber) {
    const stats = this.calculateVolumeStats(weekNumber);
    
    const container = document.createElement('div');
    container.className = 'volume-chart';
    container.innerHTML = '<h4 class="volume-chart-title">📊 Volume par Groupe Musculaire</h4>';

    Object.entries(stats).forEach(([muscle, volume]) => {
      const maxVolume = Math.max(...Object.values(stats));
      const percentage = (volume / maxVolume) * 100;

      const bar = document.createElement('div');
      bar.className = 'muscle-group-bar';
      bar.innerHTML = `
        <div class="muscle-group-header">
          <span class="muscle-group-name">${muscle}</span>
          <span class="muscle-group-value">${volume} séries</span>
        </div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      container.appendChild(bar);
    });

    return container;
  }

  /**
   * Calcule les statistiques de volume
   */
  calculateVolumeStats(weekNumber) {
    const stats = {};
    const workouts = this.programData.weeklySchedule;

    Object.values(workouts).forEach(workout => {
      workout.exercises.forEach(exercise => {
        const muscle = this.getMuscleGroup(exercise.name);
        if (!stats[muscle]) stats[muscle] = 0;
        stats[muscle] += exercise.sets;
      });
    });

    return stats;
  }

  /**
   * Détermine le groupe musculaire d'un exercice
   */
  getMuscleGroup(exerciseName) {
    const mapping = {
      'Trap Bar': 'Jambes',
      'Split Squat': 'Jambes',
      'Leg Curl': 'Jambes',
      'Calf': 'Mollets',
      'Press': 'Pectoraux',
      'Bench': 'Pectoraux',
      'Fly': 'Pectoraux',
      'Row': 'Dos',
      'Pull': 'Dos',
      'Lat': 'Dos',
      'Overhead': 'Épaules',
      'Lateral': 'Épaules',
      'Curl': 'Biceps',
      'Extension': 'Triceps',
      'Dips': 'Triceps',
      'Cable Crunch': 'Abdos',
      'Crunch': 'Abdos',
      'Plank': 'Abdos'
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (exerciseName.includes(key)) return value;
    }

    return 'Autre';
  }
}
