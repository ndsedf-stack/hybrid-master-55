// ==================================
// MODAL MANAGER
// ==================================
// Gère les fenêtres modales (pop-ups) d'information dans l'application.

export function showModal(message, type = "info") {
  const modal = document.createElement("div");
  modal.className = `modal modal-${type}`;
  modal.innerHTML = `
    <div class="modal-content">
      <p>${message}</p>
      <button class="close-modal">Fermer</button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-modal").addEventListener("click", () => {
    modal.remove();
  });
}

export function showSuccess(message) {
  showModal(`✅ ${message}`, "success");
}

export function showError(message) {
  showModal(`❌ ${message}`, "error");
}
