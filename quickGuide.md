# DOMension - Guide rapide

## Création d'un projet from scratch

### 1. Structure initiale
Créez un nouveau dossier et ajoutez les fichiers suivants :

```bash
mon-projet/
├── index.html
├── styles.css
└── main.js
```

### 2. Configuration de base
**index.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>DOMension Demo</title>
    <link rel="stylesheet" href="styles.css">
    
    <!-- Dépendances -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js"></script>
    
    <!-- Nos fichiers -->
    <script src="https://unpkg.com/domension@latest/dist/domension.min.js"></script>
    <script src="main.js" defer></script>
</head>
<body>
    <!-- Zone de contenu à visualiser -->
    <div class="content">
        <header class="header">
            <h1>Mon Site</h1>
            <nav>
                <a href="#">Accueil</a>
                <a href="#">À propos</a>
                <a href="#">Contact</a>
            </nav>
        </header>

        <main>
            <article class="card">
                <h2>Article 1</h2>
                <p>Lorem ipsum dolor sit amet...</p>
            </article>
            
            <aside class="sidebar">
                <h3>Menu latéral</h3>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            </aside>
        </main>

        <footer>
            <p>&copy; 2024 MonSite</p>
        </footer>
    </div>

    <!-- Conteneur pour la visualisation -->
    <div id="domension-container"></div>
</body>
</html>
```

**styles.css**
```css
body {
    margin: 0;
    display: flex;
    min-height: 100vh;
}

.content {
    width: 50%;
    padding: 20px;
}

#domension-container {
    width: 50%;
    height: 100vh;
    position: fixed;
    right: 0;
    top: 0;
}

/* Styles pour le contenu */
.header {
    background: #2196F3;
    color: white;
    padding: 20px;
    margin-bottom: 20px;
}

.card {
    background: #f5f5f5;
    padding: 15px;
    margin-bottom: 15px;
}

.sidebar {
    background: #e0e0e0;
    padding: 10px;
    width: 200px;
    float: right;
}

footer {
    background: #333;
    color: white;
    padding: 15px;
    margin-top: 20px;
}
```

**main.js**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Configuration de base
    const container = document.getElementById('domension-container');
    
    // Options de personnalisation
    const options = {
        // Apparence
        backgroundColor: 0xf0f0f0,
        groundColor: 0xffffff,
        
        // Animation
        transitionDuration: 0.5,
        
        // Contrôles
        rotationSpeed: 0.5,
        zoomSpeed: 0.1,
        
        // Éléments à ignorer
        ignoredElements: ['script', 'style', 'link'],
        
        // Activation des fonctionnalités
        showTooltips: true,
        enableShadows: true
    };

    // Initialisation
    const visualizer = new DOMension(container, options);
    
    // Démarrage de la visualisation
    visualizer.start();

    // Exemple : Réagir aux changements dynamiques
    document.querySelector('.card').addEventListener('click', () => {
        // Le changement sera automatiquement reflété dans la vue 3D
        this.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
    });
});
```

## Test et expérimentation

1. **Serveur local**
   Lancez un serveur local dans le dossier du projet :
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Ou avec Node.js et http-server
   npx http-server
   ```

2. **Ouvrez dans le navigateur**
   - Accédez à `http://localhost:8000`
   - Vous devriez voir votre page à gauche et la visualisation 3D à droite

3. **Interactions disponibles**
   - Faites glisser pour faire pivoter la vue
   - Utilisez la molette pour zoomer
   - Survolez les éléments pour voir les tooltips
   - Cliquez sur la carte pour voir les transitions de couleur

## Exemples d'utilisation avancée

### 1. Mode Debug
```javascript
const visualizer = new DOMension(container, {
    debug: true,
    showMetrics: true
});
```

### 2. Personnalisation des animations
```javascript
const visualizer = new DOMension(container, {
    animations: {
        hover: {
            scale: 1.1,
            duration: 0.3,
            ease: "back.out(1.7)"
        },
        transition: {
            duration: 0.8,
            ease: "power2.inOut"
        }
    }
});
```

### 3. Filtrage d'éléments
```javascript
const visualizer = new DOMension(container, {
    elementFilter: (element) => {
        // Ignorer les éléments cachés
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }
});
```

### 4. Événements personnalisés
```javascript
visualizer.on('elementHover', (element) => {
    console.log('Élément survolé:', element);
});

visualizer.on('sceneRotate', (angle) => {
    console.log('Angle de rotation:', angle);
});
```

### 5. Mode présentation
```javascript
const visualizer = new DOMension(container, {
    presentationMode: true,
    autoRotate: true,
    highlightSequence: ['.header', '.card', '.sidebar'],
    sequenceDuration: 2000
});
```

## Astuces et bonnes pratiques

1. **Performance**
   ```javascript
   const visualizer = new DOMension(container, {
       // Réduire la charge
       updateThrottle: 100,        // Limite les mises à jour
       simplifiedGeometry: true,   // Géométrie plus simple
       maxElements: 100           // Limite le nombre d'éléments
   });
   ```

2. **Responsive**
   ```javascript
   window.addEventListener('resize', () => {
       visualizer.updateSize();
   });
   ```

3. **États de chargement**
   ```javascript
   visualizer.on('loading', () => {
       showLoadingSpinner();
   });

   visualizer.on('ready', () => {
       hideLoadingSpinner();
   });
   ```

## Débogage

Si quelque chose ne fonctionne pas :

1. Vérifiez la console pour les erreurs
2. Activez le mode debug
3. Vérifiez que toutes les dépendances sont chargées
4. Assurez-vous que le conteneur a une taille définie