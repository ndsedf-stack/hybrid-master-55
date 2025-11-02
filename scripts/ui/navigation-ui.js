/**
 * HYBRID MASTER 51 - NAVIGATION UI
 * Gère la navigation entre semaines et jours
 * 
 * @module ui/navigation-ui
 * @version 1.0.0
 */

export class NavigationUI {
  constructor(programData) {
    this.programData = programData;
    this.currentWeek = 1;
    this.currentDay = 'dimanche';
    
    this.initElements();
    this.attachListeners();
    this.updateDisplay();
  }

  /**
   * Initialise les éléments DOM
   */
  initElements() {
    this.prevBtn = document.getElementById('prev-week');
    this.nextBtn = document.getElementById('next-week');
    this.weekDisplay = document.getElementById('week-display');
    this.dayTabs = document.querySelectorAll('.day-tab');

    if (!this.prevBtn || !this.nextBtn || !this.weekDisplay) {
      console.error('❌ Navigation elements not found');
    }
  }

  /**
   * Attache les event listeners
   */
  attachListeners() {
    // Boutons semaine
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.previousWeek());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextWeek());
    }

    // Onglets jours
    this.dayTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const day = e.currentTarget.dataset.day;
        this.setDay(day);
      });
    });

    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return; // Ne pas intercepter si dans un input
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousWeek();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextWeek();
      }
    });
  }

  /**
   * Passe à la semaine précédente
   */
  previousWeek() {
    if (this.currentWeek > 1) {
      this.currentWeek--;
      this.updateDisplay();
      this.dispatchWeekChange();
    }
  }

  /**
   * Passe à la semaine suivante
   */
  nextWeek() {
    if (this.currentWeek < 26) {
      this.currentWeek++;
      this.updateDisplay();
      this.dispatchWeekChange();
    }
  }

  /**
   * Change le jour actuel
   */
  setDay(day) {
    this.currentDay = day;
    this.updateDayTabs();
    this.dispatchDayChange();
  }

  /**
   * Met à jour l'affichage de la semaine
   */
  updateDisplay() {
    if (!this.weekDisplay) return;

    const weekInfo = this.weekDisplay.querySelector('.week-info');
    if (weekInfo) {
      const weekNumber = weekInfo.querySelector('.week-number');
      if (weekNumber) {
        weekNumber.textContent = `Semaine ${this.currentWeek}`;
      }
    }

    // Désactiver boutons si limites atteintes
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentWeek === 1;
    }
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentWeek === 26;
    }
  }

  /**
   * Met à jour les onglets jours
   */
  updateDayTabs() {
    this.dayTabs.forEach(tab => {
      if (tab.dataset.day === this.currentDay) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  /**
   * Dispatch un événement de changement de semaine
   */
  dispatchWeekChange() {
    const event = new CustomEvent('weekChanged', {
      detail: {
        week: this.currentWeek,
        day: this.currentDay
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Dispatch un événement de changement de jour
   */
  dispatchDayChange() {
    const event = new CustomEvent('dayChanged', {
      detail: {
        week: this.currentWeek,
        day: this.currentDay
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Getters
   */
  getCurrentWeek() {
    return this.currentWeek;
  }

  getCurrentDay() {
    return this.currentDay;
  }

  /**
   * Setters
   */
  setWeek(weekNumber) {
    if (weekNumber >= 1 && weekNumber <= 26) {
      this.currentWeek = weekNumber;
      this.updateDisplay();
      this.dispatchWeekChange();
    }
  }
}
