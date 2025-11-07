// ====================================================================
// APP.JS - CORRECTION MINIMALE POUR BOUTONS
// ====================================================================
// Cette version AJOUTE seulement les event listeners manquants
// SANS toucher au reste du code existant
// ====================================================================

import programData from './core/program-data.js';

// ====================================================================
// ÉTAT GLOBAL
// ====================================================================
let currentWeek = 1;
let currentDay = 'dimanche';
let sessionData = {
  completedSets: {},
  restTimer: null,
  restTimeRemaining: 0,
  isTimerRunning: false
};

// ====================================================================
// INITIALISATION
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 App démarrée');
  
  // Charger la semaine 1
  loadWeek(1);
  
  // CORRECTION : Attacher les event listeners aux boutons
  attachEventListeners();
  
  console.log('✅ Event listeners attachés');
});

// ====================================================================
// NAVIGATION SEMAINES (CORRECTION)
// ====================================================================
function changeWeek(direction) {
  const newWeek = currentWeek + direction;
  
  if (newWeek < 1 || newWeek > 26) {
    console.log('❌ Semaine hors limites');
    return;
  }
  
  currentWeek = newWeek;
  loadWeek(currentWeek);
  console.log(`📅 Semaine changée : ${currentWeek}`);
}

// ====================================================================
// NAVIGATION ONGLETS BAS (CORRECTION)
// ====================================================================
function handleNavClick(day) {
  currentDay = day;
  
  // Retirer la classe active de tous les onglets
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Ajouter la classe active à l'onglet cliqué
  const activeTab = document.querySelector(`[data-day="${day}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Afficher le jour correspondant
  displayDay(currentWeek, day);
  console.log(`🗓️ Jour changé : ${day}`);
}

// ====================================================================
// CHECKBOXES SÉRIES (CORRECTION)
// ====================================================================
function handleSetCompletion(exerciseId, setNumber) {
  const setKey = `${exerciseId}_set${setNumber}`;
  
  // Toggle l'état
  if (!sessionData.completedSets[setKey]) {
    sessionData.completedSets[setKey] = true;
    console.log(`✅ Série complétée : ${setKey}`);
    
    // Démarrer timer de repos
    startRestTimer(90); // 90 secondes par défaut
  } else {
    sessionData.completedSets[setKey] = false;
    console.log(`❌ Série décochée : ${setKey}`);
  }
  
  // Mettre à jour l'affichage
  updateSetDisplay(exerciseId, setNumber);
}

// ====================================================================
// TIMER REPOS (NOUVEAU)
// ====================================================================
function startRestTimer(seconds) {
  // Arrêter timer existant
  if (sessionData.restTimer) {
    clearInterval(sessionData.restTimer);
  }
  
  sessionData.restTimeRemaining = seconds;
  sessionData.isTimerRunning = true;
  
  // Afficher le timer
  const timerDisplay = document.getElementById('rest-timer');
  if (timerDisplay) {
    timerDisplay.classList.add('active');
    updateTimerDisplay();
  }
  
  // Démarrer le compte à rebours
  sessionData.restTimer = setInterval(() => {
    sessionData.restTimeRemaining--;
    
    if (sessionData.restTimeRemaining <= 0) {
      clearInterval(sessionData.restTimer);
      sessionData.isTimerRunning = false;
      
      // Notification sonore (optionnel)
      if (timerDisplay) {
        timerDisplay.classList.remove('active');
        timerDisplay.classList.add('finished');
        setTimeout(() => {
          timerDisplay.classList.remove('finished');
        }, 2000);
      }
      
      console.log('⏰ Timer terminé !');
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerDisplay = document.getElementById('rest-timer');
  if (!timerDisplay) return;
  
  const minutes = Math.floor(sessionData.restTimeRemaining / 60);
  const seconds = sessionData.restTimeRemaining % 60;
  timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ====================================================================
// MISE À JOUR AFFICHAGE SÉRIE (NOUVEAU)
// ====================================================================
function updateSetDisplay(exerciseId, setNumber) {
  const setKey = `${exerciseId}_set${setNumber}`;
  const isCompleted = sessionData.completedSets[setKey];
  
  // Trouver l'élément série
  const setElement = document.querySelector(`[data-exercise="${exerciseId}"][data-set="${setNumber}"]`);
  if (!setElement) return;
  
  // Toggle classes
  if (isCompleted) {
    setElement.classList.add('completed');
    
    // Ajouter checkmark au bouton
    const checkBtn = setElement.querySelector('.serie-check');
    if (checkBtn && !checkBtn.querySelector('.check-icon')) {
      checkBtn.innerHTML = '<span class="check-icon">✓</span>';
    }
  } else {
    setElement.classList.remove('completed');
    
    // Retirer checkmark
    const checkBtn = setElement.querySelector('.serie-check');
    if (checkBtn) {
      checkBtn.innerHTML = '';
    }
  }
}

// ====================================================================
// ATTACHER EVENT LISTENERS (CORRECTION PRINCIPALE)
// ====================================================================
function attachEventListeners() {
  // 1. NAVIGATION SEMAINES (flèches ← →)
  const prevWeekBtn = document.getElementById('prev-week');
  const nextWeekBtn = document.getElementById('next-week');
  
  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => changeWeek(-1));
    console.log('✅ Bouton semaine précédente attaché');
  }
  
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => changeWeek(1));
    console.log('✅ Bouton semaine suivante attaché');
  }
  
  // 2. ONGLETS DU BAS (Dimanche, Mardi, Vendredi, etc.)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const day = e.currentTarget.dataset.day;
      if (day) {
        handleNavClick(day);
      }
    });
  });
  console.log('✅ Onglets du bas attachés');
  
  // 3. CHECKBOXES SÉRIES (délégation d'événements)
  document.addEventListener('click', (e) => {
    // Vérifier si c'est un bouton de série
    const serieCheck = e.target.closest('.serie-check');
    if (serieCheck) {
      const serieItem = serieCheck.closest('.serie-item');
      if (serieItem) {
        const exerciseId = serieItem.dataset.exercise;
        const setNumber = parseInt(serieItem.dataset.set);
        if (exerciseId && setNumber) {
          handleSetCompletion(exerciseId, setNumber);
        }
      }
    }
  });
  console.log('✅ Checkboxes séries attachées (délégation)');
  
  // 4. BOUTON SKIP TIMER
  const skipTimerBtn = document.getElementById('skip-timer');
  if (skipTimerBtn) {
    skipTimerBtn.addEventListener('click', () => {
      if (sessionData.restTimer) {
        clearInterval(sessionData.restTimer);
        sessionData.isTimerRunning = false;
        const timerDisplay = document.getElementById('rest-timer');
        if (timerDisplay) {
          timerDisplay.classList.remove('active');
        }
        console.log('⏭️ Timer skippé');
      }
    });
  }
}

// ====================================================================
// CHARGER UNE SEMAINE
// ====================================================================
function loadWeek(weekNumber) {
  try {
    const weekData = programData.getWeek(weekNumber);
    
    // Mettre à jour l'affichage du numéro de semaine
    const weekDisplay = document.querySelector('.week-number');
    if (weekDisplay) {
      weekDisplay.textContent = `Semaine ${weekNumber}`;
    }
    
    // Mettre à jour le badge du bloc
    const blockBadge = document.querySelector('.block-badge');
    if (blockBadge) {
      blockBadge.textContent = `Bloc ${weekData.block}`;
      
      // Ajouter classe deload si applicable
      if (weekData.isDeload) {
        blockBadge.classList.add('deload');
      } else {
        blockBadge.classList.remove('deload');
      }
    }
    
    // Afficher le jour courant
    displayDay(weekNumber, currentDay);
    
    console.log(`✅ Semaine ${weekNumber} chargée`);
  } catch (error) {
    console.error('❌ Erreur chargement semaine:', error);
  }
}

// ====================================================================
// AFFICHER UN JOUR
// ====================================================================
function displayDay(weekNumber, day) {
  try {
    const workout = programData.getWorkout(weekNumber, day);
    const container = document.getElementById('workout-content');
    
    if (!container) {
      console.error('❌ Container workout-content introuvable');
      return;
    }
    
    // Générer le HTML
    let html = `
      <div class="workout-header">
        <h2>${workout.name}</h2>
        <div class="workout-info">
          <span class="info-item">⏱️ ${workout.duration} min</span>
          <span class="info-item">💪 ${workout.totalSets} séries</span>
        </div>
      </div>
      
      <div class="exercises-list">
    `;
    
    workout.exercises.forEach((exercise, index) => {
      html += renderExercise(exercise, index);
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    console.log(`✅ Jour ${day} affiché`);
    
  } catch (error) {
    console.error('❌ Erreur affichage jour:', error);
  }
}

// ====================================================================
// RENDER EXERCICE
// ====================================================================
function renderExercise(exercise, index) {
  const supersetClass = exercise.isSuperset ? 'superset' : '';
  
  let html = `
    <div class="exercise-card ${supersetClass}" data-exercise="${exercise.id}">
      <div class="exercise-header">
        <div class="exercise-number">${index + 1}</div>
        <div class="exercise-info">
          <h3 class="exercise-name">${exercise.name}</h3>
          ${exercise.isSuperset ? `<span class="superset-badge">⚡ SUPERSET</span>` : ''}
        </div>
      </div>
      
      <div class="exercise-params">
        <div class="param-item">
          <span class="param-label">Poids</span>
          <span class="param-value">${exercise.weight} kg</span>
        </div>
        <div class="param-item">
          <span class="param-label">Reps</span>
          <span class="param-value">${exercise.reps}</span>
        </div>
        <div class="param-item">
          <span class="param-label">Repos</span>
          <span class="param-value">${exercise.rest}s</span>
        </div>
      </div>
      
      <div class="series-container">
  `;
  
  // Générer les séries
  for (let i = 1; i <= exercise.sets; i++) {
    const setKey = `${exercise.id}_set${i}`;
    const isCompleted = sessionData.completedSets[setKey];
    
    html += `
      <div class="serie-item ${isCompleted ? 'completed' : ''}" 
           data-exercise="${exercise.id}" 
           data-set="${i}">
        <div class="serie-number">${i}</div>
        <div class="serie-details">
          <span>${exercise.weight} kg × ${exercise.reps}</span>
        </div>
        <button class="serie-check">
          ${isCompleted ? '<span class="check-icon">✓</span>' : ''}
        </button>
      </div>
    `;
  }
  
  html += `
      </div>
      
      ${exercise.notes ? `
        <div class="exercise-notes">
          <span class="notes-icon">💡</span>
          <span>${exercise.notes}</span>
        </div>
      ` : ''}
    </div>
  `;
  
  return html;
}

// ====================================================================
// EXPORT POUR DEBUG
// ====================================================================
window.appDebug = {
  currentWeek: () => currentWeek,
  currentDay: () => currentDay,
  sessionData: () => sessionData,
  changeWeek: changeWeek,
  handleNavClick: handleNavClick,
  handleSetCompletion: handleSetCompletion
};

console.log('✅ App.js chargé - Debug disponible via window.appDebug');
