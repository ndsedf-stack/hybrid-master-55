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

## 🔄 Dernières Corrections (Novembre 2024)

Cette version inclut 5 corrections critiques implémentées en commits séparés :

### 1️⃣ Écouteurs d'événements dans app.js
- **Fichier modifié** : `scripts/app.js`
- **Changements** :
  - Ajout d'écouteurs pour les événements `start-rest-timer`, `set-completed`, et `weight-changed`
  - Protection contre les écouteurs en double avec le flag `_workoutEventListenersAdded`
  - Intégration avec le timer et la session de workout

### 2️⃣ Version robuste de workout-session.js
- **Fichier modifié** : `scripts/modules/workout-session.js`
- **Changements** :
  - Utilisation de `Map` pour une meilleure gestion des données
  - Sérialisation ISO des dates dans `getSessionProgress()` et `end()`
  - Validation améliorée des paramètres dans toutes les méthodes
  - Vérification de l'existence des méthodes de storage avant appel

### 3️⃣ Classes CSS pour le timer et les boutons de repos
- **Fichier modifié** : `styles/05-components.css`
- **Changements** :
  - Ajout de styles pour `.timer-section`, `.timer-display`, `.timer-controls`
  - Classes pour les boutons : `.start-btn`, `.pause-btn`, `.reset-btn`
  - Styles pour `.rest-timer-btn` avec animations et états hover
  - Animation `pulse` pour le timer en cours d'exécution

### 4️⃣ Correction des libellés dans index.html
- **Fichier modifié** : `index.html`
- **Changements** :
  - Vérification de l'encodage UTF-8 (déjà présent)
  - Correction des boutons du timer en français : "Démarrer", "Pause", "Réinitialiser"
  - Cohérence linguistique dans toute l'interface

### 5️⃣ Ajout du champ RPE aux exercices
- **Fichier modifié** : `scripts/core/program-data.js`
- **Changements** :
  - Ajout du champ `rpe: blockInfo.rpe` à tous les exercices (27 exercices)
  - Le RPE varie selon le bloc et la semaine (6-7, 7-8, 8, 8-9, 5-6 pour deload)
  - Permet un suivi de l'intensité perçue pour chaque exercice

## 🧪 Comment tester les modifications

### Test 1 : Écouteurs d'événements (pas de doublons)
1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console développeur (F12)
3. Changez de semaine ou de jour plusieurs fois
4. Vérifiez dans la console que le message "✅ Écouteurs d'événements workout configurés" n'apparaît qu'**une seule fois**

### Test 2 : Timer de repos
1. Naviguez vers une séance (ex: Dimanche)
2. Cliquez sur un bouton de repos (ex: "Repos 120s")
3. Vérifiez que le timer démarre automatiquement
4. Vérifiez dans la console : "⏱️ Timer de repos démarré: 120s"

### Test 3 : Sauvegarde des séries complétées
1. Cochez une série d'un exercice
2. Vérifiez dans la console : "✅ Série X complétée pour ..."
3. Rafraîchissez la page (F5)
4. Vérifiez que la série reste cochée (sauvegarde persistante)

### Test 4 : Modification des poids
1. Modifiez le poids d'une série
2. Vérifiez dans la console : "💪 Poids modifié: ..."
3. Rafraîchissez la page
4. Vérifiez que le poids personnalisé est conservé

### Test 5 : Sérialisation ISO des dates
1. Ouvrez la console développeur
2. Tapez : `app.session.getSessionProgress()`
3. Vérifiez que `startTime` et `endTime` (si présents) sont au format ISO
   - Exemple : `"2024-11-04T15:30:00.000Z"`

### Test 6 : Affichage du RPE
1. Inspectez un exercice dans la console : `console.log(ProgramData.getWorkout(1, 'dimanche'))`
2. Vérifiez que chaque exercice a un champ `rpe` (ex: "6-7", "7-8", etc.)
3. Le RPE doit varier selon le bloc et la semaine

### Test 7 : Styles CSS du timer
1. Vérifiez que le timer a un fond sombre et une police monospace
2. Cliquez sur "Démarrer" et vérifiez l'animation de pulsation
3. Les boutons doivent avoir des effets hover (élévation, ombre)
4. Les boutons de repos doivent avoir l'icône ⏱️

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
