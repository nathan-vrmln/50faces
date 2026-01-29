// Mini jeu P5.js - Grille de 49 visages - RESPONSIVE
// Mode Desktop: 8x6 | Mode Mobile: 3x7

let faces = {}; // Cache pour les images chargées
let faceNames = [
    "Abel B.png",
    "Anabelle M.png",
    "Angelo C.png",
    "Anlan C.png",
    "Arnaud P.png",
    "Blanca A.png",
    "Blandine D.png",
    "Béranger R.png",
    "Charlie B.png",
    "Charlotte A.png",
    "Christian G.png",
    "Clement B.png",
    "Corentin F.png",
    "David M.png",
    "Denis E.png",
    "Florent M.png",
    "Jean Charles Q.png",
    "Jean François A.png",
    "Jean Luc B.png",
    "Jerome M.png",
    "Laurence D.png",
    "Leo paul R.png",
    "Lisa V.png",
    "Mael C.png",
    "Marie D.png",
    "Marie F.png",
    "Marion D.png",
    "Martijn V.png",
    "Martin C.png",
    "Mateo P.png",
    "Mateusz M.png",
    "Mathieu P.png",
    "Maxime Z.png",
    "Michael L.png",
    "Natalie O.png",
    "Nathan V.png",
    "Noa D.png",
    "Raphael E.png",
    "Renata C.png",
    "Sarah M.png",
    "Stephanie M.png",
    "Stephane G.png",
    "Tersi B.png",
    "Victor P.png",
    "Xavier D.png",
    "Xavier R.png",
    "Yona M.png",
    "Zelia D.png"
];

let visibleFaces = []; // Liste des images visibles (indices)
let COLS = 8;
let ROWS = 6;
let cellSize;
let padding = 20;
let imagesLoaded = 0;
let currentTargetName = "";
let currentTargetIndex = -1;
let score = 0;
let isMobileMode = false; // Flag pour déterminer le mode

// Chrono et effets
let startTime = 0;
let gameStarted = false;
let gameFinished = false;
let wrongClickEffects = {}; // Effets de mauvais clic
let timerPenaltyEffect = { timer: 0, duration: 0 }; // Effet rouge du chrono
let correctClickEffects = []; // Effets de cercles jaunes
let particles = []; // Particules

function preload() {
    // Charger toutes les images du dossier faces
    for (let i = 0; i < faceNames.length; i++) {
        faces[i] = loadImage("assets/faces/" + faceNames[i], 
            () => { imagesLoaded++; },
            () => { console.log("Erreur chargement: " + faceNames[i]); }
        );
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    checkMobileMode();
    // Sélectionner aléatoirement COLS * ROWS images parmi les disponibles
    initializeVisibleFaces();
    updateGrid();
    pickRandomTarget();
    // Ne pas démarrer le chrono ici - il démarre au premier clic
}

function initializeVisibleFaces() {
    // Créer un tableau de tous les indices disponibles
    let allIndices = [];
    for (let i = 0; i < faceNames.length; i++) {
        allIndices.push(i);
    }
    
    // Mélanger les indices
    shuffle(allIndices, true);
    
    // Sélectionner le nombre exact de visages nécessaires pour la grille
    let gridSize = COLS * ROWS;
    visibleFaces = [];
    for (let i = 0; i < gridSize; i++) {
        visibleFaces.push(allIndices[i]);
    }
}

function draw() {
    // Gradient de fond moderne
    let c1 = color(248, 249, 250);
    let c2 = color(255, 255, 255);
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(0, y, width, y);
    }
    
    // Afficher la grille
    drawGrid();
    
    // Afficher le chrono
    drawTimer();
    
    // Afficher le nom à trouver
    drawTargetName();
    
    // Afficher les effets de cercles jaunes
    drawCorrectClickEffects();
    
    // Afficher les particules
    drawParticles();
}

function drawGrid() {
    // Calculer les positions pour centrer la grille
    let totalGridWidth = COLS * cellSize;
    let totalGridHeight = ROWS * cellSize;
    
    let startX = (width - totalGridWidth) / 2;
    let startY;
    
    if (isMobileMode) {
        // Mode mobile: grille après le chrono et le nom
        // Chrono: padding + 70 + padding = 110
        // Nom: 40 + padding = 70
        // Marges égales droite/gauche/bas
        let topReserved = padding + 70 + padding + 40 + padding;
        let availableHeightForGrid = height - topReserved - padding;
        startY = topReserved + (availableHeightForGrid - totalGridHeight) / 2;
    } else {
        // Mode desktop
        let availableHeight = height - padding * 2;
        startY = (availableHeight - totalGridHeight) / 2 + padding;
    }
    
    // Afficher la grille complète
    for (let displayIndex = 0; displayIndex < COLS * ROWS; displayIndex++) {
        let faceIndex = visibleFaces[displayIndex];
        
        let row = floor(displayIndex / COLS);
        let col = displayIndex % COLS;
        let x = startX + col * cellSize;
        let y = startY + row * cellSize;
        let size = cellSize - 10;
        
        // Afficher l'image si elle existe
        if (faceIndex !== null && faces[faceIndex]) {
            // Ombre subtile
            fill(0, 0, 0, 15);
            rect(x + 2, y + 2, size, size, 8);
            
            // Assombrir légèrement si trouvée
            noStroke();
            
            // Image avec coins arrondis
            image(faces[faceIndex], x, y, size, size);
        } else if (faceIndex === null) {
            // Trou vide - dégradé gris clair
            fill(220, 220, 225, 100);
            stroke(200, 200, 210);
            strokeWeight(1);
            rect(x, y, size, size, 8);
            noStroke();
        } else {
            // Placeholder pendant le chargement - dégradé
            fill(230, 230, 240);
            stroke(180, 180, 200);
            strokeWeight(1);
            rect(x, y, size, size, 8);
            fill(150, 150, 180);
            textAlign(CENTER, CENTER);
            textSize(12);
            text("...", x + size/2, y + size/2);
            noStroke();
        }
        
        // Effet de mauvais clic (flash rouge)
        if (wrongClickEffects[displayIndex]) {
            let effect = wrongClickEffects[displayIndex];
            let alpha = map(effect.timer, effect.duration, 0, 200, 0);
            fill(255, 100, 100, alpha);
            rect(x, y, size, size, 8);
            
            effect.timer -= 16;
            if (effect.timer <= 0) {
                delete wrongClickEffects[displayIndex];
            }
        }
        
        // Bordure moderne
        stroke(200, 200, 215);
        strokeWeight(1);
        noFill();
        rect(x, y, size, size, 8);
    }
}

function drawTextBox() {
    // Cette fonction n'est plus utilisée - la bande bleue a été supprimée
}

function drawTargetName() {
    // Nom de la personne à trouver
    fill(0, 0, 0);
    textFont("Satoshi");
    textStyle(BOLD);
    
    if (isMobileMode) {
        // Mode mobile: centré sur la largeur, comme le chrono
        textAlign(CENTER, TOP);
        textSize(40);
        text(currentTargetName, width / 2, padding + 80);
    } else {
        // Mode desktop: à gauche
        textAlign(LEFT, TOP);
        textSize(48);
        text(currentTargetName, padding + 20, padding + 120);
    }
}

function drawTimer() {
    let elapsedTime;
    if (!gameStarted) {
        elapsedTime = 0;
    } else if (gameFinished) {
        elapsedTime = startTime + 1000000;
    } else {
        elapsedTime = millis() - startTime;
    }
    
    let seconds = floor(elapsedTime / 1000);
    let minutes = floor(seconds / 60);
    let secs = seconds % 60;
    
    let timeString = nf(minutes, 2) + ":" + nf(secs, 2);
    
    if (isMobileMode) {
        // Mode mobile: centré en haut
        // Fond du timer avec ombre
        let boxWidth = 180;
        let boxHeight = 70;
        fill(255, 255, 255, 0.95);
        noStroke();
        rect((width - boxWidth) / 2, padding, boxWidth, boxHeight, 15);
        
        // Texte du timer
        fill(0, 0, 0);
        textFont("Satoshi");
        textStyle(NORMAL);
        
        // Effet rouge du chrono (malus) - appliqué au texte
        if (timerPenaltyEffect.timer > 0) {
            fill(255, 100, 100);
            timerPenaltyEffect.timer -= 16;
        }
        
        textAlign(CENTER, CENTER);
        textSize(36);
        text("⏱ " + timeString, width / 2, padding + 35);
    } else {
        // Mode desktop: à gauche
        // Fond du timer avec ombre
        fill(255, 255, 255, 0.95);
        noStroke();
        rect(padding, padding, 240, 100, 15);
        
        // Texte du timer
        fill(0, 0, 0);
        textFont("Satoshi");
        textStyle(NORMAL);
        
        // Effet rouge du chrono (malus) - appliqué au texte
        if (timerPenaltyEffect.timer > 0) {
            fill(255, 100, 100);
            timerPenaltyEffect.timer -= 16;
        }
        
        textAlign(CENTER, CENTER);
        textSize(48);
        text("⏱ " + timeString, padding + 120, padding + 50);
    }
}

function updateGrid() {
    // Calculer la taille de chaque cellule en fonction de la fenêtre
    let availableWidth = width - padding * 2;
    let availableHeight;
    
    if (isMobileMode) {
        // Mode mobile: réserver de l'espace en haut pour le chrono et le nom
        // Chrono: padding + 70px + padding = 110px
        // Nom: 40px + padding = 70px
        // Total: ~180px réservé
        availableHeight = height - padding * 2 - 180;
        
        let cellSizeByWidth = availableWidth / COLS;
        let cellSizeByHeight = availableHeight / ROWS;
        cellSize = min(cellSizeByWidth, cellSizeByHeight);
    } else {
        // Mode desktop
        availableHeight = height - padding * 3;
        let cellSizeByWidth = availableWidth / COLS;
        let cellSizeByHeight = availableHeight / ROWS;
        cellSize = min(cellSizeByWidth, cellSizeByHeight);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    checkMobileMode();
    updateGrid();
}

function checkMobileMode() {
    // Breakpoint: passer en mode mobile si largeur <= 1024px
    let wasMobileMode = isMobileMode;
    isMobileMode = windowWidth <= 1024;
    
    // Si changement de mode, adapter la grille
    if (wasMobileMode !== isMobileMode) {
        if (isMobileMode) {
            // Passage en mode mobile: 4 colonnes x 6 lignes
            COLS = 4;
            ROWS = 6;
        } else {
            // Passage en mode desktop: 8 colonnes x 6 lignes
            COLS = 8;
            ROWS = 6;
        }
        // Réinitialiser les visages avec le nouveau nombre de cases
        initializeVisibleFaces();
        updateGrid();
        pickRandomTarget();
    }
}

function pickRandomTarget() {
    // Choisir un visage aléatoire parmi ceux encore visibles
    let availableIndices = [];
    for (let i = 0; i < visibleFaces.length; i++) {
        if (visibleFaces[i] !== null) {
            availableIndices.push(i);
        }
    }
    
    if (availableIndices.length > 0) {
        let randomDisplayIndex = random(availableIndices);
        currentTargetIndex = randomDisplayIndex;
        let faceIndex = visibleFaces[randomDisplayIndex];
        // Extraire le nom sans l'extension
        currentTargetName = faceNames[faceIndex].replace(".png", "");
    } else {
        // Jeu terminé!
        gameFinished = true;
    }
}

function drawCorrectClickEffects() {
    // Calculer les positions de la grille
    let totalGridWidth = COLS * cellSize;
    let totalGridHeight = ROWS * cellSize;
    
    let startX = (width - totalGridWidth) / 2;
    let startY;
    
    if (isMobileMode) {
        let topReserved = padding + 70 + padding + 40 + padding;
        let availableHeightForGrid = height - topReserved - padding;
        startY = topReserved + (availableHeightForGrid - totalGridHeight) / 2;
    } else {
        let availableHeight = height - padding * 2;
        startY = (availableHeight - totalGridHeight) / 2 + padding;
    }
    
    for (let i = correctClickEffects.length - 1; i >= 0; i--) {
        let effect = correctClickEffects[i];
        let row = floor(effect.displayIndex / COLS);
        let col = effect.displayIndex % COLS;
        let x = startX + col * cellSize + cellSize / 2;
        let y = startY + row * cellSize + cellSize / 2;
        
        let size = cellSize - 10;
        let centerX = x;
        let centerY = y;
        
        // Cercle jaune non plein qui grandit rapidement
        let progress = map(effect.timer, effect.duration, 0, 0, 4);
        let radius = progress * progress * (size / 3); // Croissance rapide avec effet quadratique
        let alpha = map(effect.timer, effect.duration, 0, 255, 0); // Disparition lente
        
        noFill();
        stroke(255, 215, 0, alpha);
        strokeWeight(5);
        circle(centerX, centerY, radius * 2);
        
        effect.timer -= 16;
        if (effect.timer <= 0) {
            correctClickEffects.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        
        // Afficher la particule
        fill(255, 215, 0, p.alpha);
        noStroke();
        circle(p.x, p.y, p.size);
        
        // Appliquer la physique
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravité
        p.alpha -= 5;
        p.size -= 0.3;
        
        // Supprimer la particule quand elle disparaît
        if (p.alpha <= 0 || p.size <= 0) {
            particles.splice(i, 1);
        }
    }
}

function createParticles(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
        let angle = random(TWO_PI);
        let speed = random(2, 6);
        particles.push({
            x: x,
            y: y,
            vx: cos(angle) * speed,
            vy: sin(angle) * speed - 3,
            alpha: 255,
            size: random(4, 10)
        });
    }
}

function mousePressed() {
    // Démarrer le chrono au premier clic
    if (!gameStarted && !gameFinished) {
        gameStarted = true;
        startTime = millis();
    }
    
    // Calculer les positions de la grille
    let totalGridWidth = COLS * cellSize;
    let totalGridHeight = ROWS * cellSize;
    let startX = (width - totalGridWidth) / 2;
    let startY;
    
    if (isMobileMode) {
        let topReserved = padding + 70 + padding + 40 + padding;
        let availableHeightForGrid = height - topReserved - padding;
        startY = topReserved + (availableHeightForGrid - totalGridHeight) / 2;
    } else {
        let availableHeight = height - padding * 2;
        startY = (availableHeight - totalGridHeight) / 2 + padding;
    }
    
    // Vérifier si la zone de texte a été cliquée
    if (mouseY > height) {
        return false;
    }
    
    // Vérifier si le clic est dans la grille
    for (let displayIndex = 0; displayIndex < COLS * ROWS; displayIndex++) {
        let faceIndex = visibleFaces[displayIndex];
        
        // Ignorer les trous
        if (faceIndex === null) continue;
        
        let row = floor(displayIndex / COLS);
        let col = displayIndex % COLS;
        let x = startX + col * cellSize;
        let y = startY + row * cellSize;
        let size = cellSize - 10;
        
        if (mouseX > x && mouseX < x + size &&
            mouseY > y && mouseY < y + size) {
            
            // Vérifié si c'est la bonne image
            if (displayIndex === currentTargetIndex) {
                // Correct! Marquer l'image comme supprimée (remplacer par null)
                visibleFaces[displayIndex] = null;
                score++;
                
                // Calculer le centre de la case pour les particules
                let centerX = x + size / 2;
                let centerY = y + size / 2;
                
                // Créer les particules
                createParticles(centerX, centerY, 20);
                
                // Ajouter effet de cercle jaune
                correctClickEffects.push({
                    displayIndex: displayIndex,
                    timer: 800,
                    duration: 800
                });
                
                // Choisir une nouvelle cible
                pickRandomTarget();
            } else {
                // Mauvais clic - effet rouge sur la grille
                wrongClickEffects[displayIndex] = { timer: 300, duration: 300 };
                
                // Ajouter malus de 1 sec au chrono
                startTime -= 1000;
                timerPenaltyEffect = { timer: 300, duration: 300 };
            }
            return false;
        }
    }
    
    return false;
}
