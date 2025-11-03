/**
 * NAVIGATION UI - Gestion de l'interface de navigation
 */

export class NavigationUI {
    constructor() {
        this.currentWeek = 1;
        this.currentDay = 'dimanche';
        this.maxWeek = 26;
        
        // Éléments DOM
        this.weekDisplay = document.getElementById('week-display');
        this.prevWeekBtn = document.getElementById('prev-week');
        this.nextWeekBtn = document.getElementById('next-week');
        this.dayTabs = document.querySelectorAll('.day-tab');
        
        this.onWeekChange = null;
        this.onDayChange = null;
    }

    /**
     * Initialise les event listeners
     */
    init() {
        // Navigation semaines
        if (this.prevWeekBtn) {
            this.prevWeekBtn.addEventListener('click', () => this.previousWeek());
        }
        if (this.nextWeekBtn) {
            this.nextWeekBtn.addEventListener('click', () => this.nextWeek());
        }

        // Navigation jours
        this.dayTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const day = e.currentTarget.dataset.day;
                this.selectDay(day);
            });
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousWeek();
            if (e.key === 'ArrowRight') this.nextWeek();
        });

        this.updateDisplay();
        console.log('✅ NavigationUI initialisé');
    }

    /**
     * Change de semaine
     */
    goToWeek(weekNumber) {
        if (weekNumber < 1 || weekNumber > this.maxWeek) {
            console.warn(`⚠️ Semaine ${weekNumber} invalide`);
            return;
        }

        this.currentWeek = weekNumber;
        this.updateDisplay();

        if (this.onWeekChange) {
            this.onWeekChange(this.currentWeek, this.currentDay);
        }
    }

    /**
     * Semaine précédente
     */
    previousWeek() {
        if (this.currentWeek > 1) {
            this.goToWeek(this.currentWeek - 1);
        }
    }

    /**
     * Semaine suivante
     */
    nextWeek() {
        if (this.currentWeek < this.maxWeek) {
            this.goToWeek(this.currentWeek + 1);
        }
    }

    /**
     * Sélectionne un jour
     */
    selectDay(day) {
        this.currentDay = day;

        // Update active state
        this.dayTabs.forEach(tab => {
            if (tab.dataset.day === day) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        if (this.onDayChange) {
            this.onDayChange(this.currentWeek, this.currentDay);
        }
    }

    /**
     * Met à jour l'affichage
     */
    updateDisplay() {
        if (this.weekDisplay) {
            const weekInfo = this.weekDisplay.querySelector('.week-info');
            if (weekInfo) {
                const weekNumber = weekInfo.querySelector('.week-number');
                if (weekNumber) {
                    weekNumber.textContent = `Semaine ${this.currentWeek}`;
                }
            }
        }

        // Désactive les boutons si nécessaire
        if (this.prevWeekBtn) {
            this.prevWeekBtn.disabled = this.currentWeek <= 1;
        }
        if (this.nextWeekBtn) {
            this.nextWeekBtn.disabled = this.currentWeek >= this.maxWeek;
        }
    }

    /**
     * Récupère l'état actuel
     */
    getState() {
        return {
            week: this.currentWeek,
            day: this.currentDay
        };
    }

    /**
     * Restaure un état
     */
    setState(week, day) {
        this.goToWeek(week);
        this.selectDay(day);
    }
}
