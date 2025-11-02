/**
 * NAVIGATION UI - Interface de navigation
 * Gère la navigation entre semaines et jours
 * 
 * @module ui/navigation-ui
 * @version 1.0.0
 */

export class NavigationUI {
  constructor(programData) {
    this.programData = programData;
    this.currentWeek = this.loadCurrentWeek();
    this.currentDay = this.loadCurrentDay();
    
    this.initElements();
    this.attachEventListeners();
    this.render();
  }

  /**
   * Initialise les éléments DOM
   */
  initElements() {
    this.weekDisplay = document.getElementById('week-display');
    this.prevWeekBtn = document.getElementById('prev-week');
    this.nextWeekBtn = document.getElementById('next-week');
    this.dayTabs = document.querySelectorAll('.day-tab');
  }

  /**
   * Attache les event listeners
   */
  attachEventListeners() {
    // Navigation semaines
    if (this.prevWeekBtn) {
      this.prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
    }
    if (this.nextWeekBtn) {
      this.nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
    }

    // Navigation jours
    this.dayTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const day = e.target.dataset.day;
        if (day) this.changeDay(day);
      });
    });

    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.changeWeek(-1);
      if (e.key === 'ArrowRight') this.changeWeek(1);
    });
  }

  /**
   * Change de semaine
   */
  changeWeek(delta) {
    const newWeek = this.currentWeek + delta;
    
    if (newWeek < 1 || newWeek > 26) {
      return;
    }

    this.currentWeek = newWeek;
    this.saveCurrentWeek();
    this.render();

    // Émettre événement
    window.dispatchEvent(new CustomEvent('weekChanged', {
      detail: { week: this.currentWeek, day: this.currentDay }
    }));
  }

  /**
   * Change de jour
   */
  changeDay(day) {
    const validDays = ['dimanche', 'mardi', 'vendredi', 'maison'];
    
    if (!validDays.includes(day)) {
      return;
    }

    this.currentDay = day;
    this.saveCurrentDay();
    this.updateDayTabs();

    // Émettre événement
    window.dispatchEvent(new CustomEvent('dayChanged', {
      detail: { week: this.currentWeek, day: this.currentDay }
    }));
  }

  /**
   * Affiche la navigation
   */
  render() {
    this.updateWeekDisplay();
    this.updateButtons();
    this.updateDayTabs();
  }

  /**
   * Met à jour l'affichage de la semaine
   */
  updateWeekDisplay() {
    if (!this.weekDisplay) return;

    const weekData = this.programData.getWeek(this.currentWeek);
    const isDeload = weekData?.isDeload || false;
    const block = weekData?.block || 1;

    this.weekDisplay.innerHTML = `
      <div class="week-info">
        <span class="week-number">Semaine ${this.currentWeek}</span>
        <span class="week-total">/ 26</span>
      </div>
      <div class="week-meta">
        <span class="badge badge-block">Bloc ${block}</span>
        ${isDeload ? '<span class="badge badge-deload">DELOAD</span>' : ''}
      </div>
    `;
  }

  /**
   * Met à jour les boutons de navigation
   */
  updateButtons() {
    if (this.prevWeekBtn) {
      this.prevWeekBtn.disabled = this.currentWeek === 1;
    }
    if (this.nextWeekBtn) {
      this.nextWeekBtn.disabled = this.currentWeek === 26;
    }
  }

  /**
   * Met à jour les onglets de jours
   */
  updateDayTabs() {
    this.dayTabs.forEach(tab => {
      const day = tab.dataset.day;
      tab.classList.toggle('active', day === this.currentDay);
    });
  }

  /**
   * Charge la semaine actuelle depuis localStorage
   */
  loadCurrentWeek() {
    const saved = localStorage.getItem('currentWeek');
    return saved ? parseInt(saved) : 1;
  }

  /**
   * Sauvegarde la semaine actuelle
   */
  saveCurrentWeek() {
    localStorage.setItem('currentWeek', this.currentWeek.toString());
  }

  /**
   * Charge le jour actuel depuis localStorage
   */
  loadCurrentDay() {
    const saved = localStorage.getItem('currentDay');
    return saved || 'dimanche';
  }

  /**
   * Sauvegarde le jour actuel
   */
  saveCurrentDay() {
    localStorage.setItem('currentDay', this.currentDay);
  }

  /**
   * Obtient la semaine actuelle
   */
  getCurrentWeek() {
    return this.currentWeek;
  }

  /**
   * Obtient le jour actuel
   */
  getCurrentDay() {
    return this.currentDay;
  }
}
