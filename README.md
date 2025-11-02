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
│   ├── 06-workout-mode.css      # Mode séance (à venir)
│   ├── 07-statistics.css        # Statistiques (à venir)
│   └── 08-responsive.css        # Responsive design
├── scripts/
│   ├── core/
│   │   ├── program-data.js      # 📊 DONNÉES PROGRAMME
│   │   ├── progression-engine.js # Calculs progression
│   │   └── validation-engine.js  # Tests (à venir)
│   ├── modules/                  # Modules fonctionnels (à venir)
│   ├── ui/                       # Interfaces (à venir)
│   ├── storage/                  # Sauvegarde (à venir)
│   └── app.js                    # Application principale
└── README.md                     # Ce fichier
```

## 🎯 Fonctionnalités Actuelles

### ✅ Implémenté

- ✅ **Navigation** : 26 semaines complètes
- ✅ **Programme complet** : Tous les exercices Hybrid Master 51
- ✅ **Progression automatique** : Calcul des poids par semaine
- ✅ **Techniques d'intensification** : Par bloc (Tempo, Rest-Pause, Drop-sets, etc.)
- ✅ **Rotation biceps** : Incline/Spider Curl automatique
- ✅ **Deload** : Semaines 6, 12, 18, 24, 26 avec -40% poids
- ✅ **Protocole échauffement** : Complet (15 min)
- ✅ **Statistiques volume** : Par muscle et total
- ✅ **Responsive** : Mobile, tablette, desktop
- ✅ **Sauvegarde locale** : Progression automatique

### 🚧 En Développement

- 🚧 **Mode séance** : Timer, suivi séries en temps réel
- 🚧 **Graphiques** : Progression visuelle avec Chart.js
- 🚧 **Export/Import** : Sauvegarde données complètes
- 🚧 **Nutrition** : Suivi macros et timing
- 🚧 **Supplémentation** : Rappels et dosages

## 🛠️ Personnalisation

### Modifier le Design

**Éditez UNIQUEMENT** `styles/02-variables.css` :

```css
:root {
  --color-primary: #00d4aa;  /* Changez cette couleur */
  --font-family-primary: 'Inter', sans-serif;
  /* 50+ variables modifiables */
}
```

### Modifier le Programme

**Éditez** `scripts/core/program-data.js` :

```javascript
workouts: {
  dimanche: {
    exercises: [
      {
        name: "Trap Bar Deadlift",
        sets: 5,  // Modifiez ici
        reps: "6-8",
        // ...
      }
    ]
  }
}
```

### Ajouter des Fonctionnalités

1. Créez un nouveau fichier dans `scripts/modules/`
2. Importez-le dans `index.html` avant `app.js`
3. Initialisez dans `app.js`

## 🌐 Hébergement

### GitHub Pages (Recommandé)

1. Créez un repository GitHub
2. Uploadez tous les fichiers
3. Activez GitHub Pages dans Settings → Pages
4. Votre app est en ligne !

**URL finale** : `https://votre-username.github.io/hybrid-master-51/`

### Autres Options

- **Netlify** : Drag & drop le dossier
- **Vercel** : Import depuis GitHub
- **Serveur web** : Uploadez via FTP

## 📱 Compatibilité

- ✅ Chrome/Edge 90+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile iOS/Android
- ✅ Tablettes

## 🔧 Technologies

- **Frontend** : HTML5, CSS3, Vanilla JavaScript ES6+
- **Styling** : CSS Variables, Flexbox, Grid
- **Graphiques** : Chart.js (prêt à intégrer)
- **Stockage** : LocalStorage
- **Architecture** : Modules JavaScript natifs

## 🐛 Dépannage

### L'application ne se charge pas

- ✅ Vérifiez que tous les fichiers sont présents
- ✅ Ouvrez la console navigateur (F12) pour voir les erreurs
- ✅ Vérifiez les chemins des imports dans `index.html`

### Les données ne se sauvegardent pas

- ✅ Vérifiez que LocalStorage est activé
- ✅ Le navigateur peut bloquer en mode navigation privée
- ✅ Essayez de vider le cache et recharger

### Problèmes d'affichage mobile

- ✅ Vérifiez la balise viewport dans `index.html`
- ✅ Testez avec les outils de développement mobile (F12)

## 📚 Documentation Technique

### Calcul des Progressions

Les poids sont calculés automatiquement selon la formule :

```
Poids = Poids_départ + (Incrément × Nombre_progressions)

Nombre_progressions = (Semaine_actuelle - 1) ÷ Fréquence_progression

Si Deload : Poids × 0.6 (-40%)
```

### Techniques d'Intensification

- **Bloc 1** : Tempo 3-1-2 + Pauses isométriques
- **Bloc 2** : Rest-Pause (série 5 exercices principaux)
- **Bloc 3** : Drop-sets + Myo-reps
- **Bloc 4** : Cluster sets + Partials + Myo-reps (toutes isolations)

### Volume Hebdomadaire

```javascript
Volume = Poids × Reps × Séries

Volume_direct    = 100% (muscles primaires)
Volume_indirect  = 60%  (muscles secondaires)
Volume_tertiaire = 30%  (muscles tertiaires)
```

## 🔒 Sécurité et Confidentialité

- ✅ **Aucune donnée** n'est envoyée sur internet
- ✅ **Toutes les données** sont stockées localement dans votre navigateur
- ✅ **Application 100% client-side** : fonctionne hors ligne
- ✅ **Pas de tracking** ni d'analytics

## 📞 Support

Pour toute question ou problème :

1. Vérifiez la console navigateur (F12)
2. Consultez ce README
3. Vérifiez que tous les fichiers sont chargés

## 🎯 Programme Hybrid Master 51

### Caractéristiques

- **Durée** : 26 semaines
- **Fréquence** : 3 séances/semaine + 2 séances maison
- **Jours** : Dimanche, Mardi, Vendredi + Mardi/Jeudi soir
- **Blocs** : 4 blocs progressifs avec techniques spécifiques
- **Deloads** : Semaines 6, 12, 18, 24, 26

### Objectifs

- 🎯 Augmentation force : +40%
- 🎯 Masse maigre : +5.5kg
- 🎯 Technique parfaite
- 🎯 Progression constante sur 26 semaines

## 📈 Roadmap

### Version 1.0 (Actuelle) ✅
- Programme complet
- Navigation
- Calculs automatiques
- Statistiques basiques

### Version 2.0 (À venir)
- Mode séance avec timer
- Graphiques progression
- Export/Import données
- Nutrition intégrée

### Version 3.0 (Future)
- Synchronisation cloud
- Application mobile
- Communauté
- Coach virtuel IA

## 🙏 Remerciements

Programme créé pour maximiser les gains en force et masse musculaire après 50 ans.

---

**🏆 Prêt à transformer ton physique ! Commence dès aujourd'hui.**

Version 1.0 - Décembre 2024
