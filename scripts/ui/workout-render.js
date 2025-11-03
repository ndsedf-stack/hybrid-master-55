/**
 * WorkoutRenderer - Gère l'affichage des séances d'entraînement
 * @class
 */
export class WorkoutRenderer {
    constructor() {
        this.container = document.getElementById('workout-container');
        this.weekDisplay = document.getElementById('week-display');
        this.currentWeek = 1;
        this.totalWeeks = 26;
    }

    /**
     * Initialise le renderer
     */
    init() {
        if (!this.container) {
            console.error('❌ Workout container not found');
            return false;
        }
        this.updateWeekDisplay();
        console.log('✅ WorkoutRenderer initialisé');
        return true;
    }

    /**
     * Met à jour l'affichage de la semaine
     */
    updateWeekDisplay() {
        if (this.weekDisplay) {
            const weekNumber = this.weekDisplay.querySelector('.week-number');
            if (weekNumber) {
                weekNumber.textContent = `Semaine ${this.currentWeek}`;
            } else {
                this.weekDisplay.innerHTML = `
                    <div class="week-info">
                        <span class="week-number">Semaine ${this.currentWeek}</span>
                        <span class="week-total">/ ${this.totalWeeks}</span>
                    </div>
                `;
            }
        }
    }

    /**
     * Affiche une séance d'entraînement
     * @param {Object} workout - Données de la séance
     */
    renderWorkout(workout) {
        if (!workout || !this.container) return;

        const workoutElement = document.createElement('div');
        workoutElement.className = 'workout-day';
        workoutElement.innerHTML = this.generateWorkoutHTML(workout);
        
        this.container.appendChild(workoutElement);
    }

    /**
     * Génère le HTML pour une séance
     * @param {Object} workout - Données de la séance
     * @returns {string} HTML généré
     */
    generateWorkoutHTML(workout) {
        return `
            <div class="workout-header">
                <h3 class="workout-day">${workout.name || workout.day}</h3>
                <p class="workout-focus">${workout.focus || ''}</p>
            </div>
            <div class="exercises-list">
                ${workout.exercises.map((exercise, index) => 
                    this.generateExerciseHTML(exercise, index)
                ).join('')}
            </div>
        `;
    }

    /**
     * Génère le HTML pour un exercice
     * @param {Object} exercise - Données de l'exercice
     * @param {number} index - Index de l'exercice
     * @returns {string} HTML généré
     */
    generateExerciseHTML(exercise, index) {
        return `
            <div class="exercise-item" data-exercise-id="${index}">
                <div class="exercise-header">
                    <span class="exercise-number">${index + 1}</span>
                    <h4 class="exercise-name">${exercise.name}</h4>
                </div>
                <div class="exercise-details">
                    <div class="exercise-meta">
                        <span class="sets-reps">
                            <strong>${exercise.sets}</strong> séries × 
                            <strong>${exercise.reps}</strong> reps
                        </span>
                        <span class="weight">
                            💪 <strong>${exercise.weight || 0}</strong> kg
                        </span>
                        <span class="rest-time">
                            ⏱️ Repos: <strong>${exercise.rest}</strong>
                        </span>
                    </div>
                    ${exercise.notes ? `
                        <div class="exercise-notes">
                            📝 ${exercise.notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Affiche toutes les séances d'une semaine
     * @param {Object} weekData - Données de la semaine
     */
    renderWeekWorkouts(weekData) {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (!weekData || !weekData.workouts) {
            this.showError('Aucune donnée de séance disponible');
            return;
        }

        const workouts = Object.entries(weekData.workouts);
        
        if (workouts.length === 0) {
            this.container.innerHTML = '<div class="no-workouts">Aucune séance programmée cette semaine</div>';
            return;
        }

        workouts.forEach(([day, workout]) => {
            this.renderWorkout({ ...workout, day });
        });
    }

    /**
     * Change la semaine affichée
     * @param {number} week - Numéro de la semaine
     * @param {Object} weekData - Données de la semaine
     */
    changeWeek(week, weekData) {
        if (week < 1 || week > this.totalWeeks) return;
        
        this.currentWeek = week;
        this.updateWeekDisplay();
        this.renderWeekWorkouts(weekData);
        
        console.log(`✅ Semaine ${week} affichée`);
    }

    /**
     * Affiche un état de chargement
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Chargement des séances...</p>
                </div>
            `;
        }
    }

    /**
     * Affiche une erreur
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Met à jour les boutons de navigation
     * @param {boolean} hasPrev - Semaine précédente disponible
     * @param {boolean} hasNext - Semaine suivante disponible
     */
    updateNavigation(hasPrev, hasNext) {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) {
            prevBtn.disabled = !hasPrev;
            prevBtn.style.opacity = hasPrev ? '1' : '0.5';
        }

        if (nextBtn) {
            nextBtn.disabled = !hasNext;
            nextBtn.style.opacity = hasNext ? '1' : '0.5';
        }
    }
}

export default WorkoutRenderer;
