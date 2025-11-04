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

## �� Changements Récents (v1.1)

### Corrections Critiques Appliquées

1. **Écouteurs d'Événements Robustes** (`scripts/app.js`)
   - Ajout de la fonction `registerWorkoutEventListeners()` pour gérer les événements workout
   - Protection contre les écouteurs en double avec `_workoutEventListenersAdded`
   - Gestion des événements : `start-rest-timer`, `set-completed`, `weight-changed`
   - Validation et conversions de type avec `Number()` et `parseInt()`

2. **Session d'Entraînement Renforcée** (`scripts/modules/workout-session.js`)
   - Utilisation de `Map` pour `completedSets` et `customWeights`
   - Sérialisation ISO pour `startTime` et `endTime`
   - Validation complète de tous les paramètres
   - Gestion d'erreurs robuste avec try-catch sur les opérations storage
   - Protection contre les valeurs null/undefined/invalides

3. **Styles Timer et Repos** (`styles/05-components.css`)
   - États du timer : `.timer-display.running`, `.paused`, `.finished`
   - État caché : `.timer-btn.hidden`
   - Animations : `@keyframes pulse` et `alert-pulse`
   - Styles de bouton repos : `.rest-btn` avec états hover/active

4. **UTF-8 et Interface** (`index.html`)
   - Charset UTF-8 vérifié
   - Titre et en-tête : "💪 HYBRID MASTER 51"
   - Boutons navigation : "◀ Précédent" / "Suivant ▶"
   - Boutons timer : "▶️ Start" / "⏸️ Pause" / "🔄 Reset"

5. **Valeurs RPE** (`scripts/core/program-data.js`)
   - Ajout de `rpe: "7-8"` pour tous les exercices
   - 27 exercices mis à jour avec valeurs RPE par défaut

### 🧪 Tests et Validation

**Tests Fonctionnels :**

1. **Test des Écouteurs d'Événements**
   ```javascript
   // Ouvrir la console (F12) et exécuter :
   
   // Test timer
   document.dispatchEvent(new CustomEvent('start-rest-timer', { 
     detail: { duration: 90 } 
   }));
   
   // Test série complétée
   document.dispatchEvent(new CustomEvent('set-completed', { 
     detail: { exerciseId: 'w1_dim_1', setNumber: '1', isChecked: true } 
   }));
   
   // Test changement de poids
   document.dispatchEvent(new CustomEvent('weight-changed', { 
     detail: { exerciseId: 'w1_dim_1', newWeight: 80 } 
   }));
   ```

2. **Test Session Storage**
   ```javascript
   // Vérifier la sérialisation ISO
   console.log(app.session.startTime); // Devrait être une chaîne ISO
   console.log(app.session.getState()); // Vérifier l'état complet
   ```

3. **Test RPE**
   ```javascript
   // Vérifier que tous les exercices ont un RPE
   const workout = ProgramData.getWorkout(1, 'dimanche');
   console.log(workout.exercises.every(ex => ex.rpe)); // Devrait être true
   ```

4. **Test Styles Timer**
   - Ouvrir la page et démarrer le timer
   - Vérifier l'animation de pulsation pendant l'exécution
   - Mettre en pause et vérifier le changement de couleur orange
   - Laisser terminer et vérifier l'animation d'alerte rouge

5. **Test Protection Écouteurs Doublons**
   ```javascript
   // Appeler displayWorkout plusieurs fois
   app.displayWorkout(1, 'dimanche');
   app.displayWorkout(2, 'mardi');
   app.displayWorkout(1, 'dimanche');
   // Vérifier dans la console qu'il n'y a pas de multiples handlers
   ```

**Validation Continue :**
- ✅ Syntaxe JavaScript validée avec `node --check`
- ✅ 5 commits séparés créés avec messages conventionnels
- ✅ Tous les fichiers modifiés testés et vérifiés

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
