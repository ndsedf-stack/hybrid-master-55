// ==================================
// NAVIGATION UI – version globale
// ==================================
window.renderNavigation = function (container, onChange) {
  if (!window.PROGRAM_DATA) {
    container.textContent = "Erreur : données du programme introuvables.";
    return;
  }

  const nav = document.createElement("div");
  nav.classList.add("nav");

  const weekSelect = document.createElement("select");
  weekSelect.id = "week-select";

  for (let i = 1; i <= PROGRAM_DATA.totalWeeks; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Semaine ${i}`;
    weekSelect.appendChild(opt);
  }

  const daySelect = document.createElement("select");
  daySelect.id = "day-select";
  PROGRAM_DATA.days.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  });

  weekSelect.addEventListener("change", onChange);
  daySelect.addEventListener("change", onChange);

  nav.append(weekSelect, daySelect);
  container.appendChild(nav);
};
