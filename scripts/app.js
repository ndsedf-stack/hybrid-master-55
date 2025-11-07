/**
 * HYBRID MASTER 51 - APPLICATION PRINCIPALE SIMPLIFIÉE
 * Version sans imports complexes pour éviter les erreurs
 */

// ============================================================================
// ÉTAT DE L'APPLICATION
// ============================================================================
class App {
    constructor() {
        this.currentWeek = 1;
        this.maxWeeks = 26;
        this.currentDay = 0;
        this.completedSets = new Map();
        this.restTimer = null;
        this.restTimeRemaining = 0;
    }

    /**
     * Initialisation
     */
    async init() {
        console.log('🚀 Démarrage de l\'application...');

        try {
            // Attacher les événements
            this.attachEventListeners();
            console.log('✅ Événements attachés');

            // Afficher la séance
            this.renderCurrentWorkout();
            console.log('✅ Application prête !');

        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showError('Erreur de chargement');
        }
    }

    /**
     * Attacher TOUS les event listeners
     */
    attachEventListeners() {
        // Navigation semaine
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeWeek(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeWeek(1);
            });
        }

        // Navigation du bas
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavClick(index);
            });
        });

        // Checkboxes - DÉLÉGATION D'ÉVÉNEMENTS
        document.addEventListener('click', (e) => {
            const checkButton = e.target.closest('.serie-check');
            if (!checkButton) return;

            e.preventDefault();
            e.stopPropagation();

            this.handleSetCompletion(checkButton);
        });

        console.log('✅ Event listeners attachés');
    }

    /**
     * Gérer le clic sur checkbox
     */
    handleSetCompletion(checkButton) {
        const exerciseId = checkButton.dataset.exerciseId;
        const setNumber = parseInt(checkButton.dataset.setNumber);
        const serieItem = checkButton.closest('.serie-item');
        
        if (!serieItem) {
            console.error('❌ Serie item introuvable');
            return;
        }

        // Toggle l'état
        const isCompleted = serieItem.classList.toggle('completed');
        
        // Mettre à jour l'icône
        const checkIcon = checkButton.querySelector('.check-icon');
        if (checkIcon) {
            checkIcon.textContent = isCompleted ? '✓' : '';
        }

        // Sauvegarder
        if (!this.completedSets.has(exerciseId)) {
            this.completedSets.set(exerciseId, new Set());
        }

        const sets = this.completedSets.get(exerciseId);
        if (isCompleted) {
            sets.add(setNumber);
        } else {
            sets.delete(setNumber);
        }

        console.log(`${isCompleted ? '✅' : '❌'} Série ${setNumber} de ${exerciseId}`);

        // Démarrer le timer si complété
        if (isCompleted) {
            const restParam = serieItem.querySelector('.serie-rest .rest-time');
            if (restParam) {
                const restSeconds = parseInt(restParam.textContent);
                if (restSeconds > 0) {
                    this.startRestTimer(restSeconds);
                }
            }
        }
    }

    /**
     * Changer de semaine
     */
    changeWeek(direction) {
        const newWeek = this.currentWeek + direction;

        if (newWeek < 1 || newWeek > this.maxWeeks) {
            console.log('⚠️ Limite atteinte');
            return;
        }

        this.currentWeek = newWeek;
        console.log(`📅 Semaine ${this.currentWeek}`);
        
        this.updateWeekDisplay();
        this.renderCurrentWorkout();
    }

    /**
     * Mettre à jour l'affichage de la semaine
     */
    updateWeekDisplay() {
        const weekDisplay = document.getElementById('week-display');
        if (!weekDisplay) return;

        const bloc = Math.ceil(this.currentWeek / 4);
        const tempos = ['3-1-2', '2-0-2', '4-0-1', '1-0-1', '3-0-3', '2-1-1'];
        const tempo = tempos[(bloc - 1) % tempos.length];

        weekDisplay.innerHTML = `
            <div class="week-current">Semaine ${this.currentWeek}/${this.maxWeeks}</div>
            <div class="week-date">Bloc ${bloc} • Tempo ${tempo}</div>
        `;

        // Boutons
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');

        if (prevBtn) prevBtn.disabled = this.currentWeek === 1;
        if (nextBtn) nextBtn.disabled = this.currentWeek === this.maxWeeks;
    }

    /**
     * Afficher la séance actuelle
     */
    renderCurrentWorkout() {
        const container = document.getElementById('workout-container');
        if (!container) return;

        // Exemple de séance (vous remplacerez avec vos vraies données)
        const workout = this.getDemoWorkout();

        if (!workout) {
            container.innerHTML = '<div class="empty-workout"><p>🏖️ Repos aujourd\'hui</p></div>';
            return;
        }

        const html = this.generateWorkoutHTML(workout);
        container.innerHTML = html;
    }

    /**
     * Générer le HTML de la séance
     */
    generateWorkoutHTML(workout) {
        return workout.exercises.map(exercise => `
            <div class="exercise-card slide-up ${exercise.superset ? 'superset' : ''}">
                <div class="exercise-header strength">
                    <span class="exercise-icon">💪</span>
                    <div class="exercise-title">
                        <h3 class="exercise-name">${exercise.name}</h3>
                        <div class="exercise-details">
                            <span>🎯 ${exercise.muscles}</span>
                        </div>
                    </div>
                </div>
                
                <div class="exercise-body">
                    <div class="exercise-params">
                        <div class="param-item">
                            <div class="param-label">SÉRIES</div>
                            <div class="param-value">${exercise.sets}</div>
                        </div>
                        <div class="param-item">
                            <div class="param-label">REPS</div>
                            <div class="param-value">${exercise.reps}</div>
                        </div>
                        <div class="param-item">
                            <div class="param-label">POIDS</div>
                            <div class="param-value">${exercise.weight}kg</div>
                        </div>
                        <div class="param-item">
                            <div class="param-label">REPOS</div>
                            <div class="param-value">${exercise.rest}s</div>
                        </div>
                    </div>
                    
                    <div class="series-container">
                        ${this.generateSetsHTML(exercise)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Générer le HTML des séries
     */
    generateSetsHTML(exercise) {
        const sets = [];
        for (let i = 1; i <= exercise.sets; i++) {
            const isCompleted = this.completedSets.has(exercise.id) && 
                               this.completedSets.get(exercise.id).has(i);
            
            sets.push(`
                <div class="serie-item ${isCompleted ? 'completed' : ''}" data-set-number="${i}">
                    <div class="serie-number">${i}</div>
                    <div class="serie-info">
                        <div class="serie-reps">${exercise.reps} reps</div>
                        <div class="serie-weight">${exercise.weight}kg</div>
                    </div>
                    <div class="serie-rest">
                        <span class="rest-icon">⏱️</span>
                        <span class="rest-time">${exercise.rest}s repos</span>
                    </div>
                    <button 
                        class="serie-check" 
                        data-exercise-id="${exercise.id}"
                        data-set-number="${i}"
                    >
                        <span class="check-icon">${isCompleted ? '✓' : ''}</span>
                    </button>
                </div>
            `);
        }
        return sets.join('');
    }

    /**
     * Timer de repos
     */
    startRestTimer(seconds) {
        if (this.restTimer) {
            clearInterval(this.restTimer);
        }

        this.restTimeRemaining = seconds;
        
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) {
            timerSection.style.display = 'block';
        }

        this.updateTimerDisplay();

        this.restTimer = setInterval(() => {
            this.restTimeRemaining--;
            this.updateTimerDisplay();

            if (this.restTimeRemaining <= 0) {
                this.onTimerComplete();
            }
        }, 1000);

        console.log(`⏱️ Timer: ${seconds}s`);
    }

    /**
     * Mettre à jour l'affichage du timer
     */
    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-display');
        if (!timerDisplay) return;

        const minutes = Math.floor(this.restTimeRemaining / 60);
        const seconds = this.restTimeRemaining % 60;
        
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (this.restTimeRemaining <= 10) {
            timerDisplay.style.color = '#ef4444';
        } else if (this.restTimeRemaining <= 30) {
            timerDisplay.style.color = '#f59e0b';
        } else {
            timerDisplay.style.color = '#22c55e';
        }
    }

    /**
     * Timer terminé
     */
    onTimerComplete() {
        clearInterval(this.restTimer);
        this.restTimer = null;

        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        setTimeout(() => {
            const timerSection = document.querySelector('.timer-section');
            if (timerSection) {
                timerSection.style.display = 'none';
            }
        }, 2000);

        console.log('✅ Timer terminé !');
    }

    /**
     * Navigation du bas
     */
    handleNavClick(index) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        navItems[index].classList.add('active');

        const container = document.getElementById('workout-container');
        if (!container) return;

        switch(index) {
            case 0:
                this.renderCurrentWorkout();
                break;
            case 1:
                container.innerHTML = '<div class="empty-workout"><h2>📊 Stats</h2><p>En développement...</p></div>';
                break;
            case 2:
                container.innerHTML = '<div class="empty-workout"><h2>📈 Progrès</h2><p>En développement...</p></div>';
                break;
            case 3:
                container.innerHTML = '<div class="empty-workout"><h2>👤 Profil</h2><p>En développement...</p></div>';
                break;
        }

        console.log(`📱 Onglet ${index}`);
    }

    /**
     * Données de démo
     */
    getDemoWorkout() {
        return {
            day: 'Lundi',
            exercises: [
                {
                    id: 'squat',
                    name: 'Goblet Squat',
                    muscles: 'Quadriceps, Fessiers',
                    sets: 4,
                    reps: 10,
                    weight: 27.5,
                    rest: 75,
                    superset: false
                },
                {
                    id: 'legpress',
                    name: 'Leg Press',
                    muscles: 'Quadriceps, Fessiers',
                    sets: 4,
                    reps: 10,
                    weight: 120,
                    rest: 75,
                    superset: false
                },
                {
                    id: 'rdl',
                    name: 'Romanian Deadlift',
                    muscles: 'Ischio-jambiers',
                    sets: 3,
                    reps: 12,
                    weight: 60,
                    rest: 60,
                    superset: true
                },
                {
                    id: 'curls',
                    name: 'Leg Curl',
                    muscles: 'Ischio-jambiers',
                    sets: 3,
                    reps: 12,
                    weight: 40,
                    rest: 60,
                    superset: true
                }
            ]
        };
    }

    /**
     * Afficher une erreur
     */
    showError(message) {
        const container = document.getElementById('workout-container');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-workout">
                <p style="color: #ef4444;">❌ ${message}</p>
            </div>
        `;
    }
}

// ============================================================================
// DÉMARRAGE
// ============================================================================
const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

console.log('📱 App loaded');
