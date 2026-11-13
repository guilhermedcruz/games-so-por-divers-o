// ==========================================
// CONFIGURAÇÕES E DADOS DAS FASES
// ==========================================
// Legenda do Mapa: '.' = vazio | '#' = bloco | '^' = espinho | 'F' = Fim (Vitória)
const CHAPTERS = [
  // Capítulo 0
  {
    name: "Capítulo 1: O Início",
    bgColor: "#1a365d", groundColor: "#2b6cb0",
    levels: [
      { name: "Fase 1", map: ["............................................................", "...................^..................#..............F......", ".........^...###..###..###..^^..#######....^^..#######......"] },
      { name: "Fase 2", map: ["...................................................#................", "......................#..........##....^.........###.........F......", ".......^^^....#......##...^^^...###...###..^^...####...^^^...#......"] },
      { name: "Fase 3", map: [".....................................................###..................", ".................................................###.....#...^............", "..........#...#...#...#...##..........^^......###.........####.....F......", "......^..##..##..##..##..###.........####....#............................"] },
      { name: "Fase 4", map: [".............................................................####.............", ".......................###.............^.......#.......###.........^..........", "............^^........#...#...........###.....###...###...........###....F....", "......^^...####...^..#.....#...^^^^..#####...#####.#.............#####........"] },
      { name: "Fase 5", map: ["...........................###.............................###.....................", "...................###.....................^.......###.....................#.......", "...........###.....................^......###.....................^.......##.F.....", "......^^..#####...^^^^...#######..###....#####...^^^^...#######..###.....###......."] }
    ]
  },
  // Capítulo 1
  {
    name: "Capítulo 2: A Evolução",
    bgColor: "#4a148c", groundColor: "#7b1fa2",
    levels: [
      { name: "Fase 1", map: ["..................#..............##...............#.......................", "........#........##.............###..............##..............#........", ".......##...^...###...^^^^.....####.....^^^.....###...^^^^......##...F....", "......###..###.####..######...#####....#####...####..######....###........"] },
      { name: "Fase 2", map: ["..................................###...........................................", ".......###..............###.....#.....#...............###.......................", "......#...#......^.....#...#...#.......#......^......#...#......^.........F.....", ".....#.....#....###...#.....#.#.........#....###....#.....#....###.............."] }
    ]
  },
  // Capítulo 2 (ESPECIAL - Níveis Demoniacos)
  {
    name: "CAPÍTULO ESPECIAL (EXTREME DEMON)",
    bgColor: "#2a0000", groundColor: "#550000",
    levels: [
      { 
        name: "Tidal Wave", 
        map: [
          ".................................#.......#.......#.......#...............................................",
          ".............^.......^..........###.....###.....###.....###........^^.......^^.......^^.......^^.......F.",
          ".......^^...###..^..###..^..^^.#####.^.#####.^.#####.^.#####..^^..####..^..####..^..####..^..####..^^..#."
        ] 
      },
      { 
        name: "Nullscapes", 
        map: [
          "...........................................###......#...#....................................",
          ".................................###......#...#....#.....#...................^.........#.....",
          ".........^...^...^.....###......#...#....#.....#..#.......#.......^^^^......###.......##...F.",
          ".....^^^^#^^^#^^^#^^^^#...#^^^^#.....#^^#.......##.........#^^^^^######^^^^#####^^^^^###...#."
        ] 
      },
      { 
        name: "Avernus", 
        map: [
          "...............................................##...............##..............##.....",
          ".....................^...........^............###.......^.......###......^......###....",
          ".......^^.......^...###....^....###....^.....####......###......####....###.....####.F.",
          ".....######^^^##########^^####.#####^^###.^^#####^^^^#######^^#######^^#####^^######.#."
        ] 
      },
      { 
        name: "Acheron", 
        map: [
          "...................#.............................#...........................................",
          "..................#.#...........#...............#.#........................#.....#...........",
          ".................#...#.........#.#......^......#...#.........^............#.#...#.#.....^..F.",
          "....^^^....^....#.....#...^...#...#....###....#.....#...^...###...^^^^...#...#.#...#...###.#."
        ] 
      },
      { 
        name: "Aquamarine", 
        map: [
          "............................##....................####.......................................",
          "..................##.......####.......##.........######.........^..........#.......^.........",
          "........##.......####.....######.....####.......########.......###........###.....###......F.",
          "....^..####..^..######.^.########.^.######..^..##########..^..#####...^..#####.^.#####..^..#."
        ] 
      }
    ]
  }
];

// ==========================================
// MOTOR DO JOGO E VARIÁVEIS
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let currentChapterIdx = 0;
let currentLevelIdx = 0;
let attempts = 1;
let gameState = "menu"; 
let reqAnimFrame;

// FÍSICA E CÂMERA
const TILE_SIZE = 50;
let cameraX = 0;
const SPEED = 8;
let levelWidth = 0;
let groundY = 0;
let blocks = [];
let spikes = [];
let finishLine = null;

const player = {
  x: 0, y: 0, size: 30,
  dy: 0, gravity: 1.2, jumpPower: -16,
  grounded: true, rotation: 0
};

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundY = canvas.height - 150;
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// MENUS E UI
// ==========================================
function showScreen(id) {
  document.querySelectorAll('.ui-layer').forEach(el => el.classList.add('hidden'));
  document.getElementById('hud').classList.add('hidden');
  
  // CORREÇÃO: Só tenta exibir a tela se o ID não for 'none'
  if (id && id !== 'none') {
    const screen = document.getElementById(id);
    if (screen) screen.classList.remove('hidden');
  }
  
  gameState = (id === 'none') ? "playing" : "menu";
  if (gameState === "menu") cancelAnimationFrame(reqAnimFrame);
}

function openChapter(idx) {
  currentChapterIdx = idx;
  const chap = CHAPTERS[idx];
  
  const titleEl = document.getElementById('chapter-title');
  titleEl.textContent = chap.name;
  if(idx === 2) titleEl.style.color = "#ff0000"; else titleEl.style.color = "#ffeb3b";

  const grid = document.getElementById('levels-grid');
  grid.innerHTML = "";
  
  chap.levels.forEach((lvl, i) => {
    const btn = document.createElement('div');
    btn.className = 'level-btn';
    if(idx === 2) btn.style.borderColor = "#aa0000";
    btn.textContent = lvl.name;
    btn.onclick = () => loadLevel(idx, i);
    grid.appendChild(btn);
  });
  
  showScreen('menu-levels');
}

function goBackFromLevels() {
  if(currentChapterIdx === 2) showScreen('menu-main'); // Do especial volta pro menu
  else showScreen('menu-chapters'); // Dos normais volta pros capitulos
}

// ==========================================
// LÓGICA DA FASE
// ==========================================
function loadLevel(chapIdx, lvlIdx) {
  currentChapterIdx = chapIdx;
  currentLevelIdx = lvlIdx;
  attempts = 1;
  document.getElementById('level-name-hud').textContent = CHAPTERS[chapIdx].levels[lvlIdx].name;
  startRun();
}

function restartLevel() {
  attempts++;
  startRun();
}

function startRun() {
  showScreen('none');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('attempts-count').textContent = attempts;
  
  const bar = document.getElementById('progress-bar');
  bar.style.width = "0%";
  bar.style.background = (currentChapterIdx === 2) ? "#ff0000" : "#00ffcc";

  const mapData = CHAPTERS[currentChapterIdx].levels[currentLevelIdx].map;
  blocks = []; spikes = []; finishLine = null; cameraX = 0;
  
  const mapHeight = mapData.length;
  levelWidth = mapData[0].length * TILE_SIZE;

  for (let row = 0; row < mapHeight; row++) {
    for (let col = 0; col < mapData[row].length; col++) {
      const char = mapData[row][col];
      const x = col * TILE_SIZE;
      const y = groundY - ((mapHeight - row) * TILE_SIZE);

      if (char === '#') blocks.push({ x, y, w: TILE_SIZE, h: TILE_SIZE });
      else if (char === '^') spikes.push({ x, y, w: TILE_SIZE, h: TILE_SIZE });
      else if (char === 'F') finishLine = { x, y: groundY - TILE_SIZE*5, w: TILE_SIZE, h: TILE_SIZE*5 };
    }
  }

  player.x = 200;
  player.y = groundY - player.size;
  player.dy = 0; player.rotation = 0; player.grounded = true;

  lastTime = performance.now();
  reqAnimFrame = requestAnimationFrame(gameLoop);
}

// ==========================================
// FÍSICA E INPUTS
// ==========================================
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    if (gameState === "playing" && player.grounded) {
      player.dy = player.jumpPower; player.grounded = false;
    } else if (gameState === "dead") { restartLevel(); }
  }
});
window.addEventListener('mousedown', () => {
  if (gameState === "playing" && player.grounded) {
    player.dy = player.jumpPower; player.grounded = false;
  }
});

function checkCollision(r1, r2) {
  return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);
}

// ==========================================
// LOOP PRINCIPAL
// ==========================================
let lastTime = 0;

function gameLoop(time) {
  if (gameState !== "playing") return;
  lastTime = time;
  update();
  draw();
  reqAnimFrame = requestAnimationFrame(gameLoop);
}

function update() {
  cameraX += SPEED;
  const progress = Math.min(100, (cameraX / (levelWidth - canvas.width/2)) * 100);
  document.getElementById('progress-bar').style.width = progress + "%";

  player.dy += player.gravity;
  player.y += player.dy;
  player.grounded = false;

  if (!player.grounded) player.rotation += 5;
  else player.rotation = Math.round(player.rotation / 90) * 90;

  const pBox = { x: cameraX + player.x, y: player.y, w: player.size, h: player.size };

  if (player.y + player.size >= groundY) {
    player.y = groundY - player.size;
    player.dy = 0; player.grounded = true;
    player.rotation = Math.round(player.rotation / 90) * 90;
  }

  for (let b of blocks) {
    if (checkCollision(pBox, b)) {
      if (player.dy > 0 && pBox.y + pBox.h - player.dy <= b.y + 12) {
        player.y = b.y - player.size;
        player.dy = 0; player.grounded = true;
        player.rotation = Math.round(player.rotation / 90) * 90;
      } else { die(); return; }
    }
  }

  const shrink = 12; // Hitbox do espinho
  const pBoxShrink = { x: pBox.x + shrink/2, y: pBox.y + shrink/2, w: pBox.w - shrink, h: pBox.h - shrink };
  for (let s of spikes) {
    const sBox = { x: s.x + 10, y: s.y + 15, w: s.w - 20, h: s.h - 15 };
    if (checkCollision(pBoxShrink, sBox)) { die(); return; }
  }

  if (finishLine && checkCollision(pBox, finishLine)) win();
}

function die() { gameState = "dead"; showScreen('screen-death'); }
function win() { gameState = "win"; showScreen('screen-win'); }

function draw() {
  const chap = CHAPTERS[currentChapterIdx];
  const isSpecial = currentChapterIdx === 2;

  ctx.fillStyle = chap.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  const offsetX = -(cameraX * 0.5) % 100;
  for (let i = 0; i < canvas.width / 100 + 2; i++) {
    ctx.beginPath(); ctx.moveTo(offsetX + i * 100, 0); ctx.lineTo(offsetX + i * 100, groundY); ctx.stroke();
  }

  ctx.fillStyle = chap.groundColor;
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  ctx.strokeStyle = isSpecial ? "#ff0000" : "#fff";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(canvas.width, groundY); ctx.stroke();

  ctx.save();
  ctx.translate(-cameraX, 0);

  if (finishLine) {
    ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
    ctx.fillRect(finishLine.x, finishLine.y, finishLine.w, finishLine.h);
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(finishLine.x + finishLine.w/2 - 2, finishLine.y, 4, finishLine.h);
  }

  ctx.fillStyle = "#111";
  ctx.strokeStyle = isSpecial ? "#ff0000" : (currentChapterIdx === 1 ? "#ff00ff" : "#00ffcc");
  ctx.lineWidth = 2;
  for (let b of blocks) {
    if (b.x + b.w > cameraX && b.x < cameraX + canvas.width) {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }
  }

  ctx.fillStyle = isSpecial ? "#ff3333" : "#ff4c4c";
  for (let s of spikes) {
    if (s.x + s.w > cameraX && s.x < cameraX + canvas.width) {
      ctx.beginPath();
      ctx.moveTo(s.x + s.w / 2, s.y); ctx.lineTo(s.x + s.w, s.y + s.h); ctx.lineTo(s.x, s.y + s.h);
      ctx.fill();
      ctx.strokeStyle = "#222"; ctx.stroke();
    }
  }

  ctx.restore();

  ctx.save();
  ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
  ctx.rotate((player.rotation * Math.PI) / 180);
  ctx.fillStyle = isSpecial ? "#ff0000" : (currentChapterIdx === 1 ? "#ff00ff" : "#00ffcc");
  ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
  ctx.strokeRect(-player.size / 2, -player.size / 2, player.size, player.size);
  
  ctx.fillStyle = "#000";
  ctx.fillRect(-player.size/2 + 20, -player.size/2 + 5, 6, 6);
  ctx.restore();
}