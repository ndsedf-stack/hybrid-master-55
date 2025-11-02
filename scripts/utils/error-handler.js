// ==================================
// ERROR HANDLER
// ==================================

export function handleError(err) {
  console.error("❌ Erreur :", err);
  alert(`Erreur : ${err.message || err}`);
}

window.addEventListener("error", e => {
  handleError(e.error || e.message);
});
