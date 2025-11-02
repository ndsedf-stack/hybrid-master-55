// ==================================
// ACCESSIBILITY UTILITIES
// ==================================

export function focusElement(el) {
  if (el && typeof el.focus === "function") el.focus();
}

export function announce(message) {
  const live = document.getElementById("aria-live");
  if (!live) {
    const div = document.createElement("div");
    div.id = "aria-live";
    div.setAttribute("aria-live", "polite");
    div.style.position = "absolute";
    div.style.left = "-9999px";
    document.body.appendChild(div);
    div.textContent = message;
  } else {
    live.textContent = message;
  }
}
