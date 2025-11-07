# 🏆 HYBRID MASTER 51 - DESIGN MODERNE

Application web de musculation avec un design professionnel inspiré de Hevy.

## 🎨 Nouveau Design

### Améliorations visuelles
- ✨ Interface dark mode moderne et élégante
- 🎯 Design épuré inspiré de Hevy
- 📱 Optimisé pour iPhone 15 Pro Max
- 🌈 Animations fluides et interactives
- 💪 Cartes d'exercices redessinées
- 🔥 Badges et indicateurs visuels modernes

### Palette de couleurs
- **Background**: Noir profond (#0A0E14)
- **Primary**: Orange énergique (#FF6B35)
- **Success**: Vert néon (#00FF88)
- **Accent**: Cyan (#00D4FF)

## 📦 Installation

### 1. Remplacer les fichiers CSS

Remplacez vos fichiers CSS existants par les nouveaux :

```bash
styles/
├── 01-reset.css           # (garder votre version)
├── 02-variables.css       # ⭐ NOUVEAU - Variables modernes
├── 03-base.css            # ⭐ NOUVEAU - Styles de base
├── 04-layout.css          # (garder votre version)
├── 05-components.css      # ⭐ NOUVEAU - Composants exercices
└── 08-responsive.css      # ⭐ NOUVEAU - Responsive iPhone
```

### 2. Mettre à jour le HTML

Remplacez votre `index.html` par la nouvelle version fournie, ou ajoutez les classes modernes :

**Classes principales :**
- `.workout-header` - En-tête de séance avec stats
- `.exercise-card` - Carte d'exercice modernisée
- `.set-row` - Ligne de série avec checkbox
- `.technique-banner` - Bannière de technique
- `.progression-card` - Affichage de progression

### 3. Ajouter le JavaScript

Ajoutez le fichier `app.js` dans `scripts/` :

```javascript
// Fonctionnalités incluses :
// - Checkbox interactives pour les séries
// - Navigation entre semaines avec swipe
// - Animations d'entrée
// - Toast notifications
// - Sauvegarde automatique
// - Support PWA
```

### 4. Déployer sur GitHub Pages

```bash
# 1. Commit les changements
git add .
git commit -m "🎨 Design moderne inspiré Hevy"
git push origin main

# 2. Activer GitHub Pages
# Allez dans Settings → Pages
# Source: Deploy from branch → main → /root
```

### 5. Déployer sur Vercel

```bash
# Installation Vercel CLI
npm install -g vercel

# Déploiement
vercel

# Production
vercel --prod
```

## 📱 Installation sur iPhone

### Méthode 1 : Add to Home Screen

1. Ouvrez votre app dans Safari
2. Tapez sur l'icône "Partager" 📤
3. Sélectionnez "Sur l'écran d'accueil"
4. Tapez "Ajouter"

### Méthode 2 : PWA (Progressive Web App)

L'app propose maintenant une installation en tant qu'app native :

1. Visitez votre site
2. Un popup apparaîtra : "📱 Installer l'app"
3. Cliquez sur "Installer"
4. L'app s'ouvre en plein écran

## 🎯 Fonctionnalités interactives

### Checkbox de séries
- ✅ Cliquez pour marquer une série comme complétée
- 🎉 Animation de célébration avec confetti
- 💾 Sauvegarde automatique de votre progression

### Navigation entre semaines
- **Boutons** : Utilisez les flèches ← →
- **Swipe** : Glissez à gauche/droite sur mobile
- 📅 Affichage de la semaine et du bloc en cours

### Notifications Toast
- Messages de feedback élégants
- Animation fluide
- Positionnement optimisé mobile

## 🛠️ Personnalisation

### Modifier les couleurs

Éditez `styles/02-variables.css` :

```css
:root {
  /* Changez la couleur primaire */
  --color-primary: #FF6B35;  /* Orange par défaut */
  
  /* Ou utilisez d'autres couleurs */
  --color-primary: #00D4FF;  /* Cyan */
  --color-primary: #FF3366;  /* Rose */
  --color-primary: #00FF88;  /* Vert */
}
```

### Ajouter votre logo

Remplacez l'emoji dans le header :

```html
<span class="header-icon">🏆</span>
<!-- Par votre logo -->
<img src="logo.png" alt="Logo" class="header-icon">
```

### Personnaliser les exercices

Modifiez les icônes et badges :

```html
<!-- Icône d'exercice -->
<div class="exercise-icon">🏋️</div>

<!-- Badges -->
<span class="badge badge-primary">🔥 Composé</span>
<span class="badge badge-secondary">🦵 Quadriceps</span>
```

## 📊 Structure des fichiers

```
hybrid-master-55/
├── index.html              # Page principale modernisée
├── styles/
│   ├── 01-reset.css
│   ├── 02-variables.css    # ⭐ Variables design
│   ├── 03-base.css         # ⭐ Styles de base
│   ├── 04-layout.css
│   ├── 05-components.css   # ⭐ Composants modernes
│   └── 08-responsive.css   # ⭐ Mobile first
├── scripts/
│   ├── core/
│   │   └── program-data.js # Vos données
│   └── app.js              # ⭐ Interactivité
└── README.md
```

## 🚀 Performance

### Optimisations incluses
- ⚡ CSS optimisé et minimal
- 🎨 Variables CSS pour performance
- 📱 Mobile-first responsive
- 🔄 Animations hardware-accelerated
- 💾 LocalStorage pour persistance
- 🌐 PWA ready

### Taille des fichiers
- **CSS total** : ~15KB (gzipped)
- **JavaScript** : ~8KB (gzipped)
- **HTML** : ~10KB

## 🐛 Résolution de problèmes

### Les styles ne s'appliquent pas
1. Vérifiez l'ordre des imports CSS dans `index.html`
2. Videz le cache du navigateur (⌘+Shift+R)
3. Vérifiez la console pour les erreurs (F12)

### Les animations ne fonctionnent pas
1. Vérifiez que `app.js` est bien chargé
2. Ouvrez la console et recherchez des erreurs
3. Vérifiez que les classes CSS sont présentes

### L'app ne s'affiche pas bien sur mobile
1. Vérifiez la balise `viewport` dans `<head>`
2. Testez avec Chrome DevTools en mode mobile
3. Vérifiez que `08-responsive.css` est chargé

### Les checkbox ne fonctionnent pas
1. Vérifiez que `app.js` est chargé
2. Ouvrez la console pour voir les erreurs
3. Vérifiez que les classes `.set-row` et `.set-checkbox` sont présentes

## 📱 Compatibilité

### Navigateurs supportés
- ✅ Safari iOS 14+
- ✅ Chrome Mobile 90+
- ✅ Firefox Mobile 85+
- ✅ Edge Mobile 90+

### Appareils testés
- ✅ iPhone 15 Pro Max
- ✅ iPhone 14 Pro
- ✅ iPhone 13
- ✅ iPad Pro
- ✅ Android (Chrome)

## 🎓 Support et documentation

### Ressources utiles
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Vercel Docs](https://vercel.com/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### Besoin d'aide ?
1. Vérifiez la console navigateur (F12)
2. Consultez ce README
3. Vérifiez que tous les fichiers sont présents

## 🌟 Fonctionnalités à venir

- [ ] Timer de repos avec vibration
- [ ] Graphiques de progression
- [ ] Historique complet des séances
- [ ] Export PDF des programmes
- [ ] Mode hors ligne complet
- [ ] Synchronisation cloud
- [ ] Partage de progression

## 📝 Changelog

### Version 2.0 (Design Moderne)
- 🎨 Refonte complète du design
- 📱 Optimisation iPhone 15 Pro Max
- ✨ Animations fluides
- 🔥 Composants modernes
- 💪 Interface inspirée de Hevy

### Version 1.0
- ✅ Programme complet 26 semaines
- ✅ Calculs de progression
- ✅ Navigation basique

---

**Développé avec 💪 pour Hybrid Master 51**

*Transformez votre physique avec style !* 🏆
