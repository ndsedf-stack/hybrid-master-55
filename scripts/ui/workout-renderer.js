/**
 * WORKOUT RENDERER - Affichage des exercices
 */

export class WorkoutRenderer {
    constructor(container, session) {
        this.container = container;
        this.session = session;
    }

    /**
     * Affiche le workout complet
     */
    render(workout) {
        if (!workout || !workout.exercices || workout.exercices.length === 0) {
            this.renderEmpty();
            return;
        }

        this.container.innerHTML = '';
        
        // Regrouper les supersets
        const groups = this.groupExercises(workout.exercices);
        
        groups.forEach(group => {
            if (group.type === 'superset') {
                this.renderSuperset(group.exercises);
            } else {
                this.renderExercise(group.exercises[0]);
            }
        });
    }

    /**
     * Regroupe les exercices en supersets
     */
    groupExercises(exercises) {
        const groups = [];
        let currentSuperset = null;

        exercises.forEach(exercise => {
            if (exercise.superset) {
                if (!currentSuperset) {
                    currentSuperset = {
                        type: 'superset',
                        exercises: []
                    };
                    groups.push(currentSuperset);
                }
                currentSuperset.exercises.push(exercise);
            } else {
                if (currentSuperset) {
                    currentSuperset = null;
                }
                groups.push({
                    type: 'single',
                    exercises: [exercise]
                });
            }
        });

        return groups;
    }

    /**
     * Affiche un superset
     */
    renderSuperset(exercises) {
        const supersetCard = document.createElement('div');
        supersetCard.className = 'exercise-card superset-card';
        
        const header = document.createElement('div');
        header.className = 'superset-header';
        header.innerHTML = `
            <span class="superset-badge">🔗 SUPERSET</span>
            <span class="superset-info">${exercises.length} exercices</span>
        `;
        supersetCard.appendChild(header);

        exercises.forEach((exercise, index) => {
            const exerciseEl = this.createExerciseElement(exercise, true);
            exerciseEl.classList.add(`superset-item-${index + 1}`);
            supersetCard.appendChild(exerciseEl);
        });

        this.container.appendChild(supersetCard);
    }

    /**
     * Affiche un exercice simple
     */
    renderExercise(exercise) {
        const card = this.createExerciseElement(exercise, false);
        this.container.appendChild(card);
    }

    /**
     * Crée l'élément HTML d'un exercice
     */
    createExerciseElement(exercise, isSuperset) {
        const card = document.createElement('div');
        card.className = isSuperset ? 'exercise-item' : 'exercise-card';
        card.dataset.exerciseId = exercise.id || exercise.nom;

        // Header
        const header = this.createExerciseHeader(exercise);
        card.appendChild(header);

        // Séries
        const seriesContainer = this.createSeriesContainer(exercise);
        card.appendChild(seriesContainer);

        // Info repos
        const restInfo = this.createRestInfo(exercise);
        card.appendChild(restInfo);

        return card;
    }

    /**
     * Crée le header de l'exercice
     */
    createExerciseHeader(exercise) {
        const header = document.createElement('div');
        header.className = 'exercise-header';

        const title = document.createElement('h3');
        title.className = 'exercise-name';
        title.textContent = exercise.nom;

        const badges = document.createElement('div');
        badges.className = 'exercise-badges';

        // Badge technique
        if (exercise.technique) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-technique';
            badge.textContent = exercise.technique;
            badges.appendChild(badge);
        }

        // Badge type
        if (exercise.type) {
            const badge = document.createElement('span');
            badge.className = `badge badge-${exercise.type.toLowerCase()}`;
            badge.textContent = exercise.type;
            badges.appendChild(badge);
        }

        header.appendChild(title);
        header.appendChild(badges);

        return header;
    }

    /**
     * Crée le container des séries
     */
    createSeriesContainer(exercise) {
        const container = document.createElement('div');
        container.className = 'series-container';

        const exerciseId = exercise.id || exercise.nom;
        const series = Array.isArray(exercise.series) ? exercise.series : [];

        series.forEach((set, index) => {
            const setCard = this.createSetCard(exerciseId, set, index);
            container.appendChild(setCard);
        });

        return container;
    }

    /**
     * Crée une carte de série
     */
    createSetCard(exerciseId, set, index) {
        const card = document.createElement('div');
        card.className = 'set-card';

        // Checkbox
        const checkbox = document.createElement('label');
        checkbox.className = 'set-checkbox';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.exerciseId = exerciseId;
        input.dataset.setIndex = index;
        
        const isCompleted = this.session && this.session.isSetCompleted(exerciseId, index);
        input.checked = isCompleted;
        
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.session.completeSet(exerciseId, index);
                card.classList.add('completed');
            } else {
                this.session.uncompleteSet(exerciseId, index);
                card.classList.remove('completed');
            }
        });

        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';

        const setNumber = document.createElement('span');
        setNumber.className = 'set-number';
        setNumber.textContent = `Série ${index + 1}`;

        checkbox.appendChild(input);
        checkbox.appendChild(checkmark);
        checkbox.appendChild(setNumber);

        // Infos série
        const setInfo = document.createElement('div');
        setInfo.className = 'set-info';

        // Reps
        const reps = document.createElement('div');
        reps.className = 'set-reps';
        reps.innerHTML = `<strong>${set.reps || '?'}</strong> reps`;

        // Poids
        const weightControl = this.createWeightControl(exerciseId, index, set.poids || 0);

        // Tempo (si présent)
        if (set.tempo) {
            const tempo = document.createElement('div');
            tempo.className = 'set-tempo';
            tempo.textContent = `Tempo: ${set.tempo}`;
            setInfo.appendChild(tempo);
        }

        setInfo.appendChild(reps);
        setInfo.appendChild(weightControl);

        card.appendChild(checkbox);
        card.appendChild(setInfo);

        if (isCompleted) {
            card.classList.add('completed');
        }

        return card;
    }

    /**
     * Crée le contrôle de poids
     */
    createWeightControl(exerciseId, setIndex, defaultWeight) {
        const control = document.createElement('div');
        control.className = 'weight-control';

        const currentWeight = this.session 
            ? this.session.getWeight(exerciseId, setIndex, defaultWeight)
            : defaultWeight;

        // Bouton -
        const minusBtn = document.createElement('button');
        minusBtn.className = 'weight-btn weight-minus';
        minusBtn.textContent = '−';
        minusBtn.type = 'button';

        // Input poids
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'weight-input';
        input.value = currentWeight;
        input.min = '0';
        input.step = '2.5';

        // Label kg
        const label = document.createElement('span');
        label.className = 'weight-label';
        label.textContent = 'kg';

        // Bouton +
        const plusBtn = document.createElement('button');
        plusBtn.className = 'weight-btn weight-plus';
        plusBtn.textContent = '+';
        plusBtn.type = 'button';

        // Events
        const updateWeight = (newWeight) => {
            input.value = newWeight;
            if (this.session) {
                this.session.updateWeight(exerciseId, setIndex, parseFloat(newWeight));
            }
        };

        minusBtn.addEventListener('click', () => {
            const current = parseFloat(input.value) || 0;
            updateWeight(Math.max(0, current - 2.5));
        });

        plusBtn.addEventListener('click', () => {
            const current = parseFloat(input.value) || 0;
            updateWeight(current + 2.5);
        });

        input.addEventListener('change', (e) => {
            updateWeight(parseFloat(e.target.value) || 0);
        });

        control.appendChild(minusBtn);
        control.appendChild(input);
        control.appendChild(label);
        control.appendChild(plusBtn);

        return control;
    }

    /**
     * Crée les infos de repos
     */
    createRestInfo(exercise) {
        const info = document.createElement('div');
        info.className = 'rest-info';

        // Repos
        if (exercise.repos) {
            const rest = document.createElement('div');
            rest.className = 'rest-time';
            rest.innerHTML = `⏱️ Repos: <strong>${exercise.repos}</strong>`;
            info.appendChild(rest);
        }

        // Bouton timer
        const timerBtn = document.createElement('button');
        timerBtn.className = 'timer-btn-inline';
        timerBtn.innerHTML = '⏱️ Timer';
        timerBtn.type = 'button';
        timerBtn.addEventListener('click', () => {
            // Trigger timer global
            const startBtn = document.getElementById('timer-start');
            if (startBtn) startBtn.click();
        });
        info.appendChild(timerBtn);

        return info;
    }

    /**
     * Affiche un état vide
     */
    renderEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💪</div>
                <h3>Aucun exercice</h3>
                <p>Sélectionnez une semaine et un jour</p>
            </div>
        `;
    }

    /**
     * Affiche un message d'erreur
     */
    renderError(message) {
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Erreur</h3>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Affiche un loader
     */
    renderLoading() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Chargement du programme...</p>
            </div>
        `;
    }
}
