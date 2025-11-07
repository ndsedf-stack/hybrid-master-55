document.addEventListener("DOMContentLoaded", () => {
  console.log("Initialisation de l'application...");

  if (!isLocalStorageAvailable()) {
    alert("LocalStorage est désactivé ou inaccessible. Certaines fonctionnalités peuvent ne pas fonctionner.");
  }

  if (typeof programData === "undefined" || programData.length === 0) {
    console.error("Les données du programme ne sont pas disponibles.");
    return;
  }

  const currentWeek = getCurrentWeek();
  const currentBlock = getCurrentBlock(currentWeek);
  renderWeek(currentWeek, currentBlock);
  setupNavigation();
  setupTouchEvents();
  detectMobileEnvironment();
});

function isLocalStorageAvailable() {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn("LocalStorage inaccessible : mode privé ou restriction.");
    return false;
  }
}

function getCurrentWeek() {
  const savedWeek = isLocalStorageAvailable() ? localStorage.getItem("currentWeek") : null;
  return savedWeek ? parseInt(savedWeek) : 1;
}

function getCurrentBlock(week) {
  // Exemple : Bloc 1 pour semaines 1 à 4, Bloc 2 pour 5 à 8, etc.
  return Math.ceil(week / 4);
}

function renderWeek(week, block) {
  document.getElementById("week-title").textContent = `Semaine ${week}/26`;
  document.getElementById("block-title").textContent = `Bloc ${block} - Tempo 3-1-2`;

  const sessionData = programData[week - 1];
  if (!sessionData) {
    console.error("Aucune donnée pour cette semaine.");
    return;
  }

  document.getElementById("session-content").innerHTML = generateSessionHTML(sessionData);
}

function generateSessionHTML(data) {
  return data.exercises.map(ex => `
    <div class="exercise">
      <h3>${ex.name}</h3>
      <p>Répétitions : ${ex.reps}</p>
      <p>Tempo : ${ex.tempo}</p>
    </div>
  `).join("");
}

function setupNavigation() {
  bindButtonEvents(document.getElementById("btn-next"), () => changeWeek(1));
  bindButtonEvents(document.getElementById("btn-prev"), () => changeWeek(-1));
}

function changeWeek(delta) {
  let week = getCurrentWeek() + delta;
  if (week < 1) week = 1;
  if (week > 26) week = 26;

  if (isLocalStorageAvailable()) {
    localStorage.setItem("currentWeek", week);
  }

  const block = getCurrentBlock(week);
  renderWeek(week, block);
}

function bindButtonEvents(button, callback) {
  button.addEventListener("click", callback);
  button.addEventListener("touchstart", callback);
}

function setupTouchEvents() {
  const swipeArea = document.getElementById("swipe-zone");
  let touchStartX = 0;

  swipeArea.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  swipeArea.addEventListener("touchend", e => {
    const touchEndX = e.changedTouches[0].screenX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 50) changeWeek(-1); // Swipe droite
    else if (deltaX < -50) changeWeek(1); // Swipe gauche
  });
}

function detectMobileEnvironment() {
  if (/Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
    document.body.classList.add("mobile");
    console.log("Mode mobile détecté.");
  }
}
