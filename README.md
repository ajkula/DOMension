# Documentation DOM Visualizer

## Table des matières
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Concepts de base](#concepts-de-base)
4. [Guide de démarrage rapide](#guide-de-démarrage-rapide)
5. [Configuration avancée](#configuration-avancée)
6. [Composants principaux](#composants-principaux)
7. [Exemples d'utilisation](#exemples-dutilisation)
8. [FAQ](#faq)
9. [Dépannage](#dépannage)

## Introduction

DOM Visualizer est un outil qui transforme votre page web en une visualisation 3D interactive. Il crée une représentation isométrique de la structure de votre site, où chaque élément HTML devient un bloc 3D avec des propriétés visuelles correspondant à son style CSS.

### Fonctionnalités principales
- Vue isométrique 3D de votre page
- Transitions animées lors des changements du DOM
- Tooltips informatifs au survol
- Contrôles de zoom et de rotation
- Animations fluides

## Installation

### 1. Ajoutez les dépendances nécessaires
```html
<!-- Dans votre <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
```

### 2. Incluez les fichiers du visualiseur
```html
<script src="path/to/dom-visualizer/dist/dom-visualizer.min.js"></script>
<link rel="stylesheet" href="path/to/dom-visualizer/dist/dom-visualizer.css">
```

### 3. Préparez votre HTML
```html
<div id="visualizer-container"></div>
```

## Concepts de base

### Comment ça marche ?
1. **Analyse du DOM** : Le système analyse votre page web et crée une représentation structurée.
2. **Création 3D** : Chaque élément HTML est transformé en un bloc 3D.
3. **Mise à jour en temps réel** : Les changements dans votre page sont reflétés dans la vue 3D.

### Structure de base
```javascript
// 1. L'analyseur DOM
domAnalyzer = new DOMAnalyzer();
// ↓
// 2. Le gestionnaire de scène
sceneManager = new SceneManager();
// ↓
// 3. Le gestionnaire de transitions
transitionManager = new DOMTransitionManager();
```

## Guide de démarrage rapide

### Configuration minimale
```javascript
// 1. Initialisation
const container = document.getElementById('visualizer-container');
const visualizer = new SceneManagerWithTransitions(container);

// 2. Démarrage
visualizer.initFromDOM(document.body);
```

### Exemple complet
```html
<!DOCTYPE html>
<html>
<head>
    <title>Mon site avec DOM Visualizer</title>
    <!-- Dépendances -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
    <script src="path/to/dom-visualizer.min.js"></script>
    <link rel="stylesheet" href="path/to/dom-visualizer.css">
</head>
<body>
    <!-- Votre contenu HTML normal -->
    <div class="mon-site">
        <!-- ... -->
    </div>

    <!-- Conteneur pour la visualisation -->
    <div id="visualizer-container" style="position: fixed; right: 0; top: 0; width: 50%; height: 100vh;"></div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // 1. Configuration
            const container = document.getElementById('visualizer-container');
            const options = {
                backgroundColor: 0xf0f0f0,
                groundColor: 0xffffff,
                rotationSpeed: 0.5,
                zoomSpeed: 0.1
            };

            // 2. Initialisation
            const visualizer = new SceneManagerWithTransitions(container, options);

            // 3. Démarrage
            visualizer.initFromDOM(document.body);
        });
    </script>
</body>
</html>
```

## Configuration avancée

### Options disponibles
```javascript
const options = {
    // Apparence
    backgroundColor: 0xf0f0f0,    // Couleur de fond
    groundColor: 0xffffff,        // Couleur du sol
    gridSize: 1000,              // Taille de la grille

    // Contrôles
    rotationSpeed: 0.5,          // Vitesse de rotation
    zoomSpeed: 0.1,             // Vitesse de zoom
    minZoom: 0.5,               // Zoom minimum
    maxZoom: 2,                 // Zoom maximum

    // Animations
    transitionDuration: 0.5,     // Durée des transitions
};
```

### Personnalisation des éléments
```javascript
// Personnaliser l'apparence des blocs
const elementOptions = {
    baseHeight: 20,             // Hauteur de base
    depthStep: 10,             // Différence de hauteur par niveau
    colors: {
        default: 0x2196F3,     // Couleur par défaut
        hover: 0x1976D2        // Couleur au survol
    }
};
```

## Composants principaux

### DOMAnalyzer
Analyse la structure de votre page.
```javascript
const analyzer = new DOMAnalyzer({
    // Éléments à ignorer
    ignoredElements: ['script', 'style', 'noscript'],
    // Styles à extraire
    relevantStyles: ['backgroundColor', 'color', 'opacity']
});
```

### SceneManager
Gère la scène 3D et les contrôles.
```javascript
const sceneManager = new SceneManagerWithControls(container, {
    // Options de la scène
    backgroundColor: 0xf0f0f0,
    // Options des contrôles
    rotationSpeed: 0.5
});
```

### TransitionManager
Gère les animations lors des changements.
```javascript
const transitionManager = new DOMTransitionManager(sceneManager);
transitionManager.observeDOM(document.body);
```

## Exemples d'utilisation

### 1. Mode visualisation simple
```javascript
// Visualisation basique
const visualizer = new SceneManagerWithTransitions(container);
visualizer.initFromDOM(document.body);
```

### 2. Mode debug avec tooltips détaillés
```javascript
const visualizer = new SceneManagerWithTransitions(container, {
    debug: true,
    showTooltips: true,
    highlightUpdates: true
});
```

### 3. Mode personnalisé avec filtres
```javascript
const visualizer = new SceneManagerWithTransitions(container);

// Filtrer certains éléments
visualizer.setElementFilter((element) => {
    return !element.classList.contains('hidden');
});
```

## FAQ

### Q: Comment améliorer les performances ?
R: Plusieurs options :
- Utilisez l'option `ignoredElements` pour ignorer les éléments non essentiels
- Réduisez la fréquence des mises à jour avec `updateThrottle`
- Diminuez la qualité des ombres avec `shadowQuality: 'low'`

### Q: Les couleurs sont-elles exactes ?
R: Le visualiseur tente de reproduire les couleurs CSS, mais certaines propriétés comme les dégradés sont simplifiées.

### Q: Puis-je l'utiliser en production ?
R: Il est recommandé de l'utiliser principalement pour le développement et le debugging.

## Dépannage

### Problèmes courants

1. **La scène ne s'affiche pas**
   - Vérifiez que Three.js est bien chargé
   - Assurez-vous que le conteneur a une taille définie

2. **Performances faibles**
   - Réduisez le nombre d'éléments observés
   - Désactivez les ombres avec `shadows: false`
   - Utilisez `lowPerformanceMode: true`

3. **Animations saccadées**
   - Augmentez `transitionDuration`
   - Réduisez `rotationSpeed`
   - Activez `smoothAnimations: true`

### Support

Pour plus d'aide :
- Consultez les issues GitHub
- Vérifiez la compatibilité du navigateur
- Utilisez les outils de développement pour le debugging

## Pour aller plus loin

1. Intégration avec des frameworks :
   - React
   - Vue.js
   - Angular

2. Personnalisation avancée :
   - Shaders personnalisés
   - Systèmes de particules
   - Effets post-processing

3. Optimisation :
   - Instancing pour les éléments répétés
   - Level of Detail (LOD)
   - WebWorkers pour l'analyse DOM