# 🏆 HYBRID MASTER 51 - Application Web Complète

Application web interactive pour le programme de musculation **Hybrid Master 51** (26 semaines).

## 🚀 Installation Instantanée

1. **Téléchargez** tous les fichiers dans un dossier
2. **Ouvrez** `index.html` dans votre navigateur
3. **C'est tout !** Aucune installation nécessaire

## 📁 Structure des Fichiers

```
hybrid-master-51/
├── index.html                    # Page principale
├── styles/
│   ├── 01-reset.css             # Reset CSS
│   ├── 02-variables.css         # 🎨 VARIABLES MODIFIABLES
│   ├── 03-base.css              # Styles de base
│   ├── 04-layout.css            # Layout et grilles
│   ├── 05-components.css        # Composants UI
│   ├── 06-workout-mode.css      # Mode séance
│   ├── 07-statistics.css        # Statistiques
│   └── 08-responsive.css        # Responsive design
├── scripts/
│   ├── core/
│   │   ├── program-data.js      # 📊 DONNÉES PROGRAMME (structure complète exercices)
│   │   ├── progression-engine.js # Calculs progression
│   ├── modules/
│   │   ├── timer-manager.js     # Timer séances
│   │   ├── workout-session.js   # Suivi séances
│   ├── storage/
│   │   ├── local-storage.js     # Sauvegarde progression/navigation
│   ├── ui/
│   │   ├── workout-renderer.js  # Affichage dynamique des exercices
│   │   ├── navigation-ui.js     # UI navigation semaines/jours
│   ├── app.js                   # Application principale (point d'entrée)
└── README.md                    # Ce fichier
```

## 🎯 Fonctionnement : Séances dynamiques et navigation

- Le programme (tous les exercices et semaines) est généré dynamiquement dans `scripts/core/program-data.js`.
- La navigation (changement de semaine/jour) est gérée côté JS (`navigation-ui.js` + `app.js`).
- L’affichage des exercices se fait “à la volée” via le renderer (`workout-renderer.js`).
- Les modules principaux sont instanciés dans `app.js` (voir plus bas pour le lien entre eux).
- Toute la logique d’UI, de rendering et de navigation est codée en JavaScript natif ES6+.

## ✅ Points-clés du code (modifications récentes)

- **Méthode `displayWorkout(week, day)` dans `app.js`** :
  - Utilise `ProgramData.getWorkout(week, day)` pour récupérer la séance courante.
  - Affiche la séance à l’aide de `workout-renderer.js`.
  - Permet l’affichage interactif des exercices et du suivi de progression.

- **Modularité** :
  - Toutes les entités (data, rendering, navigation, timer, storage) sont en modules JS (import/export ES6).
  - Index.html inclut le JS principal en mode module :
    ```html
    <script type="module" src="./scripts/app.js"></script>
    ```

## 📚 Dépannage et points de vérification

- **Si rien ne s’affiche** :
  - Vérifiez que la fonction `displayWorkout` dans `app.js` appelle vraiment `workoutRenderer.render(...)`.
  - Assurez-vous que le container `<div id="workout-container"></div>` existe dans le HTML.
  - Ouvrez la console JS (F12) pour voir d’éventuelles erreurs d’import ou de méthode.

- **Pour avoir les exercices affichés** :
  - `program-data.js` doit contenir la structure complète (voir le fichier pour exemple).
  - Tous les modules JS doivent exister dans le dossier `/scripts/`.

## 🌐 Hébergement

### GitHub Pages (Recommandé)

1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans Settings → Pages
4. Votre app est en ligne !

**URL finale** : `https://votre-username.github.io/hybrid-master-51/`

### Autres Options

- **Netlify**
- **Vercel**
- **Serveur web** classique

## 🔧 Technologies

- **Frontend** : HTML5, CSS3, JavaScript Modules ES6+
- **Styling** : CSS Variables, Flexbox, Grid
- **Storage local** (LocalStorage)
- **Architecture** : Composants et modules JS

---

**Prêt à utiliser et à modifier** :  
-> Editez le CSS via `styles/02-variables.css`  
-> Modifiez les séances via `scripts/core/program-data.js` (toute la structure des programmes est commentée dans le fichier)

---

**Dépannage courant :**
- Console JS vide = tout fonctionne.
- Erreur de module = vérifier le chemin, les imports ou le type="module" sur le script.
- Rien dans le container = vérifier l'appel à `render(...)`, l'existence du div `#workout-container` et le format des données.

---

Version 1.0 - 2025

## 🆕 Recent Critical Fixes (Latest Update)

This version includes 6 critical fixes for improved robustness and user experience:

### 1. **Robust Event Listeners** (`app.js`)
- Added `setupWorkoutEvents()` method with idempotent event listener registration
- Event listeners for: `start-rest-timer`, `set-completed`, `weight-changed`
- All handlers use optional chaining, Number/parseInt with radix, and existence checks
- Prevents duplicate event listeners with `_workoutEventsSetup` flag

### 2. **Enhanced WorkoutSession** (`workout-session.js`)
- Uses Maps for `completedSets` and `customWeights` (better performance)
- Serializes `startTime` in ISO format for proper JSON serialization
- Parameter validation for all methods
- Checks for storage methods before calling
- Compatible `start()` method

### 3. **Timer & Rest Button CSS** (`05-components.css`)
- Timer display states: `.running`, `.paused`, `.finished`
- Animated states with keyframes: `pulse`, `alert-pulse`
- Rest button styles with active/disabled states

### 4. **UTF-8 & Unicode Labels** (`index.html`)
- Explicit UTF-8 encoding guarantee
- Unicode symbols: ◀ Précédent, Suivant ▶, ▶️ Start, ⏸️ Pause, 🔄 Reset

### 5. **RPE Values** (`program-data.js`)
- Added default `rpe: "7-8"` to all 30 exercises
- Consistent RPE tracking across all workouts

### 6. **TimerManager Improvements** (`timer-manager.js`)
- Finished state handling (add/remove `.finished` class)
- Automatic Notification permission request on init
- Visual notification popup and sound alerts on completion

## 🧪 Testing Instructions

### Manual Testing Steps

1. **Open the application**: Simply open `index.html` or use local server
2. **Test Timer**: Click Start/Pause/Reset, press SPACE, verify animations
3. **Test Events** (in console):
   ```javascript
   document.dispatchEvent(new CustomEvent('start-rest-timer', {detail: {seconds: 5}}));
   document.dispatchEvent(new CustomEvent('set-completed', {detail: {exerciseId: 'test', setIndex: 0, completed: true}}));
   ```
4. **Test Navigation**: Navigate weeks/days, verify workout content changes
5. **Test RPE**: Check exercises have RPE values in console

### Console Checklist
```javascript
console.log('Event listeners:', app._workoutEventsSetup);
console.log('Timer state:', app.timer.getState());
console.log('Session Maps:', app.session.completedSets instanceof Map);
console.log('Exercise RPE:', ProgramData.getWorkout(1, 'dimanche').exercises[0].rpe);
```

### Expected Results
✅ All tests pass without console errors  
✅ Timer animates with visual/audio alerts  
✅ Events trigger appropriate actions  
✅ All exercises have RPE values  
✅ Unicode symbols display correctly

