// ==================================
// DOM HELPERS
// ==================================
// Petites fonctions utilitaires pour manipuler le DOM facilement.

export function createElement(tag, className = "", content = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (content) el.textContent = content;
  return el;
}

export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function appendChildren(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
}

export function setAttributes(el, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
}
