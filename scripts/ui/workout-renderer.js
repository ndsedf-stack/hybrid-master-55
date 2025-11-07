/**
 * WORKOUT RENDERER - Affichage des séances d'entraînement
 * Génère le HTML pour afficher les exercices avec leurs séries
 */

export default class WorkoutRenderer {
    constructor() {
        this.container = null;
    }

    init() {
        this.container = document.getElementById('workout-container');
        if (!this.container) {
            console.error('❌ Container workout-container introuvable');
        }
    }

    /**
     * Rend un workout complet
     */
    render(workoutDay, week) {
        if (!this.container) {
            console.error('❌ Container non initialisé');
            return;
        }

        if (!workoutDay || !workoutDay.exercises || workoutDay.exercises.length === 0) {
            this.container.innerHTML = `
                <div class="empty-workout">
                    <p>🏖️ Repos aujourd'hui !</p>
                </div>
            `;
            return;
        }

        // Générer le HTML pour tous les exercices
        const exercisesHTML = workoutDay.exercises.map((exercise, index) => 
            this.renderExercise(exercise, index, week)
        ).join('');

        this.container.innerHTML = exercisesHTML;
    }

    /**
     * Rend un exercice avec ses séries
     */
    renderExercise(exercise, index, week) {
        const {
            id,
            name,
            type,
            category,
            muscles,
            sets,
            reps,
            weight,
            rpe,
            rest,
            tempo,
            notes
        } = exercise;

        // Déterminer l'icône et la classe selon le type
        const icon = type === 'cardio' ? '🔥' : '💪';
        const typeClass = type === 'cardio' ? 'cardio' : 'strength';
        const categoryLabel = category || '';
        const musclesLabel = muscles ? muscles.join(', ') : '';

        // Génération des paramètres principaux
        const paramsHTML = this.renderParams(exercise);

        // Génération des séries
        const seriesHTML = this.renderSeries(exercise, id);

        // Notes si présentes
        const notesHTML = notes ? `
            <div class="exercise-notes">
                <div class="notes-title">📝 Notes</div>
                <div class="notes-content">${notes}</div>
            </div>
        ` : '';

        return `
            <div class="exercise-card slide-up" data-exercise-id="${id}">
                <div class="exercise-header ${typeClass}">
                    <span class="exercise-icon">${icon}</span>
                    <div class="exercise-title">
                        <h3 class="exercise-name">${name}</h3>
                        <div class="exercise-details">
                            ${categoryLabel ? `<span>${categoryLabel}</span>` : ''}
                            ${musclesLabel ? `<span>🎯 ${musclesLabel}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="exercise-body">
                    ${paramsHTML}
                    ${seriesHTML}
                    ${notesHTML}
                </div>
            </div>
        `;
    }

    /**
     * Rend les paramètres principaux (séries, reps, poids, RPE, repos)
     */
    renderParams(exercise) {
        const { sets, reps, weight, rpe, rest, tempo } = exercise;

        const params = [];

        if (sets) {
            params.push({
                label: 'SÉRIES',
                value: sets
            });
        }

        if (reps) {
            params.push({
                label: 'REPS',
                value: reps
            });
        }

        if (weight) {
            params.push({
                label: 'POIDS',
                value: `${weight}kg`
            });
        }

        if (rpe) {
            params.push({
                label: 'RPE',
                value: rpe
            });
        }

        if (rest) {
            params.push({
                label: 'REPOS',
                value: `${rest}s`
            });
        }

        if (tempo) {
            params.push({
                label: 'TEMPO',
                value: tempo
            });
        }

        if (params.length === 0) return '';

        const paramsHTML = params.map(param => `
            <div class="param-item">
                <div class="param-label">${param.label}</div>
                <div class="param-value">${param.value}</div>
            </div>
        `).join('');

        return `
            <div class="exercise-params">
                ${paramsHTML}
            </div>
        `;
    }

    /**
     * Rend les séries individuelles avec checkboxes
     */
    renderSeries(exercise, exerciseId) {
        const { sets, reps, weight, rest, type } = exercise;

        if (!sets || sets === 0) return '';

        const seriesArray = Array.from({ length: sets }, (_, i) => i + 1);

        const seriesHTML = seriesArray.map(setNumber => {
            const isCompleted = false; // TODO: récupérer depuis le storage
            const completedClass = isCompleted ? 'completed' : '';

            return `
                <div class="serie-item ${completedClass}" data-set-number="${setNumber}">
                    <div class="serie-number">${setNumber}</div>
                    <div class="serie-info">
                        <div class="serie-reps">${reps} reps</div>
                        ${weight ? `<div class="serie-weight">${weight}kg</div>` : ''}
                    </div>
                    ${rest ? `
                        <div class="serie-rest">
                            <span class="rest-icon">⏱️</span>
                            <span class="rest-time">${rest}s repos</span>
                        </div>
                    ` : ''}
                    <button 
                        class="serie-check" 
                        data-exercise-id="${exerciseId}"
                        data-set-number="${setNumber}"
                        aria-label="Compléter la série ${setNumber}"
                    >
                        <span class="check-icon">${isCompleted ? '✓' : ''}</span>
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="series-container">
                ${seriesHTML}
            </div>
        `;
    }
}

// Ajouter les event listeners pour les interactions
document.addEventListener('DOMContentLoaded', () => {
    // Délégation d'événements pour les checkboxes de séries
    document.addEventListener('click', (e) => {
        const checkButton = e.target.closest('.serie-check');
        if (!checkButton) return;

        e.preventDefault();
        e.stopPropagation();

        const exerciseId = checkButton.dataset.exerciseId;
        const setNumber = checkButton.dataset.setNumber;
        const serieItem = checkButton.closest('.serie-item');
        
        if (!serieItem) return;

        // Toggle l'état
        const isCompleted = serieItem.classList.toggle('completed');
        
        // Mettre à jour l'icône
        const checkIcon = checkButton.querySelector('.check-icon');
        if (checkIcon) {
            checkIcon.textContent = isCompleted ? '✓' : '';
        }

        // Émettre l'événement pour la gestion d'état
        document.dispatchEvent(new CustomEvent('set-completed', {
            detail: {
                exerciseId,
                setNumber: parseInt(setNumber),
                isChecked: isCompleted
            }
        }));

        // Démarrer le timer de repos si série complétée
        if (isCompleted) {
            const restTime = checkButton.closest('.exercise-card')
                ?.querySelector('.param-value')
                ?.textContent
                ?.match(/(\d+)s/)?.[1];
            
            if (restTime) {
                document.dispatchEvent(new CustomEvent('start-rest-timer', {
                    detail: { duration: parseInt(restTime) }
                }));
            }
        }
    });
});
