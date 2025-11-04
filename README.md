# HYBRID MASTER 51 - Application Web Complète

Application web interactive pour le programme de musculation Hybrid Master 51 (26 semaines).

🚀 Installation instantanée  
- Téléchargez tous les fichiers dans un dossier  
- Ouvrez `index.html` dans votre navigateur  
- C'est tout ! Aucune installation nécessaire

---

ℹ️ Remarque importante : j'ai ajouté des informations et corrections au README sans supprimer ton contenu d'origine. Ci‑dessous la version mise à jour qui reflète la structure réelle de ton dépôt (y compris le dossier `scripts/ui` tel qu'il apparaît dans ton repo).

---

📁 Structure des fichiers (structure réelle et recommandée)

hybrid-master-55/  
├── index.html  
├── styles/  
│   ├── 01-reset.css  
│   ├── 02-variables.css  
│   ├── 03-base.css  
│   ├── 04-layout.css  
│   ├── 05-components.css  
│   ├── 06-workout-mode.css  
│   ├── 07-statistics.css  
│   └── 08-responsive.css  
├── scripts/  
│   ├── app.js                         # Point d'entrée (chargé par index.html)  
│   ├── add-default-rpe.js             # (optionnel) utilitaire RPE  
│   ├── core/  
│   │   ├── program-data.js            # 📊 données programme (générateur 26 semaines)  
│   │   └── progression-engine.js      # calculs de progression  
│   ├── modules/  
│   │   ├── timer-manager.js           # Timer (start/pause/reset/finished)  
│   │   └── workout-session.js         # Gestion de la séance (progression, save/load)  
│   ├── storage/  
│   │   └── local-storage.js           # Persistance LocalStorage (API utilisée)  
│   ├── ui/                            # <-- dossier réel : contient les components UI
│   │   ├── modal-manager.js           # gestionnaire modales / toasts  
│   │   ├── navigation-ui.js           # navigation semaines / jours  
│   │   ├── statistics-ui.js           # affichage statistiques  
│   │   └── workout-renderer.js        # rendu dynamique des exercices  
└── README.md

Notes :
- L'arborescence ci‑dessus correspond à l'organisation attendue par `index.html` et par les imports relatifs présents dans `scripts/app.js` (ex. `import ProgramData from './core/program-data.js'` depuis `scripts/app.js`).
- Le dossier `scripts/ui` existe bien dans ton repo et contient : `modal-manager.js`, `navigation-ui.js`, `statistics-ui.js`, `workout-renderer.js`. J'ai listé ces fichiers explicitement pour éviter la confusion.

---

🔧 Pourquoi cette correction ?
- Le README précédent indiquait une structure générique mais omettait de préciser le contenu réel du dossier `scripts/ui`. Cela peut provoquer des erreurs d'import ou de troubleshooting. J'ai mis à jour la structure pour qu'elle reflète exactement ce que tu as dans le dépôt (capture fournie).
- Les imports ES modules sont relatifs au fichier qui les effectue. Par exemple `scripts/app.js` importe `./ui/workout-renderer.js` — donc `workout-renderer.js` doit être sous `scripts/ui/`.

---

✅ Ce que j’ai ajouté au README (sans supprimer l'existant)
- Correction de l'arborescence pour refléter le dossier `scripts/ui` et ses fichiers (modal-manager.js, navigation-ui.js, statistics-ui.js, workout-renderer.js).  
- Rappel sur la nécessité de cohérence entre chemins (imports relatifs) et emplacement des fichiers.  
- Checklist rapide (exécution console) et indications pour dépanner les erreurs d'import (casse, chemin, type="module").

---

📋 Checklist rapide pour vérifier que tout fonctionne
1. Ouvrir la page et vérifier l'absence d'erreurs JS dans la console (F12).  
2. Vérifier que `index.html` inclut bien :
```html
<script type="module" src="./scripts/app.js"></script>
```
3. Vérifier que `scripts/ui/workout-renderer.js` est accessible (Network / 200 OK).  
4. En console :
```js
console.log('app:', window.app);                 // devrait être défini après DOMContentLoaded
console.log('ProgramData:', typeof ProgramData); // module importé
```

---

📦 Options si tu veux changer l'architecture
- Option A (recommandée) : garder tous les scripts sous `scripts/` (structure ci‑dessus). Les imports actuels dans `scripts/app.js` fonctionneront sans changement.  
- Option B : si tu souhaites conserver `core/` ou `ui/` à la racine (en dehors de `scripts/`), il faudra modifier les imports dans `scripts/app.js` pour utiliser des chemins relatifs corrects (ex : `import ProgramData from '../core/program-data.js'`).

---

Ce que je fais maintenant
J'ai corrigé localement le texte du README pour refléter la structure réelle (capture fournie). Si tu veux, je peux :
- Générer le fichier README.md corrigé prêt à coller (je l'ai préparé ci‑dessus), ou  
- Te fournir un patch `fix-readme.patch` prêt à `git apply` pour l'ajouter au repo, ou  
- Modifier les imports dans `scripts/app.js` pour pointer vers les emplacements actuels (si tu préfères déplacer les fichiers au lieu de modifier README).

Dis‑moi quelle option tu préfères : "mettre README" (je fournis le fichier final), "générer patch" ou "modifier imports" — et je te fournis immédiatement le contenu/patch correspondant.
