document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener('resize', resize);
  resize();

  // ==========================================
  // 1. GERADOR DE SPRITES PIXEL ART (ANIMATRÔNICOS)
  // ==========================================
  const SPRITES = {};

  function createPixelSprite(matrix, palette, scale = 8) {
    const h = matrix.length;
    const w = matrix[0].length;
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const sctx = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const ch = matrix[y][x];
        if (palette[ch]) {
          sctx.fillStyle = palette[ch];
          sctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
    return c;
  }

  function buildSprites() {
    const pal = {
      '.': null,
      'K': '#09090b', // Preto
      'B': '#78350f', // Marrom Freddy
      'L': '#a16207', // Marrom Claro
      'P': '#4338ca', // Azul/Roxo Bonnie
      'V': '#6366f1', // Roxo Claro
      'Y': '#eab308', // Amarelo Chica
      'O': '#f97316', // Laranja Bico
      'R': '#b91c1c', // Vermelho Foxy
      'C': '#ef4444', // Vermelho Brilho
      'G': '#ca8a04', // Dourado Golden Freddy
      'W': '#f8fafc', // Branco
      'E': '#38bdf8'  // Olho Azul
    };

    // Freddy Fazbear
    SPRITES['Freddy'] = createPixelSprite([
      '....KKKK....',
      '....KKKK....',
      '..KKKKKKKK..',
      '.KKBBBBBBKK.',
      'KKBBBBBBBBKK',
      'KBBKKWWKKBBK',
      'KBBKKEWKKBBK',
      'KBLLLLLLLLBK',
      'KBLLLKKLLLBK',
      'KBLLLLLLLLBK',
      '.KBBKKKKBBK.',
      '..KKKKKKKK..'
    ], pal, 9);
    SPRITES['Freddy Fazbear'] = SPRITES['Freddy'];

    // Bonnie
    SPRITES['Bonnie'] = createPixelSprite([
      '..KK....KK..',
      '.KPPK..KPPK.',
      '.KPVK..KPVK.',
      '.KPPK..KPPK.',
      '.KKPPPPPPKK.',
      'KPPPPPPPPPPK',
      'KPPKKCCKKPPK',
      'KPPKKCCKKPPK',
      'KPVVVVVVVVPK',
      'KPVVVKKVVVPK',
      '.KPPKKKKPPK.',
      '..KKKKKKKK..'
    ], pal, 9);

    // Chica
    SPRITES['Chica'] = createPixelSprite([
      '....KKKK....',
      '...KYYYYK...',
      '..KYYYYYYK..',
      '.KYYYYYYYYK.',
      'KYYYYYYYYYYK',
      'KYYKKVVKKYYK',
      'KYYKKVVKKYYK',
      'KYYYOOOOYYYK',
      'KYYOOOOOOYYK',
      '.KYYOOOOYYK.',
      '.KWWWWWWWWK.',
      '..KKKKKKKK..'
    ], pal, 9);

    // Foxy
    SPRITES['Foxy'] = createPixelSprite([
      '.KK......KK.',
      'KRRK....KRRK',
      'KRRKK..KKRRK',
      'KRRRRRRRRRRK',
      'KRRRRRRRRRRK',
      'KRRKKKKYYRRK',
      'KRRKKKKYYRRK',
      'KRRRRKKRRRRK',
      'KRRWWWWWRRRK',
      '.KRRWWWWWRK.',
      '..KKKKKKKK..'
    ], pal, 9);

    // Golden Freddy
    SPRITES['Golden Freddy'] = createPixelSprite([
      '....KKKK....',
      '....KKKK....',
      '..KKKKKKKK..',
      '.KKGGGGGGKK.',
      'KKGGGGGGGGKK',
      'KGGKKKKKKGGK',
      'KGGKKWWKKGGK',
      'KGYYYYYYYYGK',
      'KGYYYKKYYYGK',
      'KGYYYYYYYYGK',
      '.KGGKKKKGGK.',
      '..KKKKKKKK..'
    ], pal, 10);
  }
  buildSprites();

  // ==========================================
  // 2. SINTETIZADOR DE ÁUDIO SEGURO
  // ==========================================
  class SoundEngine {
    constructor() { this.ctx = null; }
    init() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      } catch (e) {}
    }
    playTone(freq, duration, type = 'sine', vol = 0.15) {
      try {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }
    doorSlam() { this.playTone(95, 0.25, 'sawtooth', 0.28); this.playTone(55, 0.3, 'square', 0.25); }
    lightBuzz() { this.playTone(120, 0.08, 'sawtooth', 0.07); }
    camSwitch() { this.playTone(680, 0.06, 'square', 0.12); }
    noseHonk() { this.playTone(520, 0.12, 'triangle', 0.25); setTimeout(() => this.playTone(440, 0.18, 'triangle', 0.25), 90); }
    jumpscare() { for (let i = 0; i < 6; i++) this.playTone(160 + i * 110, 0.9, 'sawtooth', 0.18); }
    playToreadorMarch() {
      const notes = [392, 440, 392, 330, 330, 330, 330, 349, 392, 349, 330, 293];
      notes.forEach((n, idx) => {
        setTimeout(() => { if (gameState.powerOut) this.playTone(n, 0.35, 'triangle', 0.16); }, idx * 420);
      });
    }
  }
  const sfx = new SoundEngine();

  // ==========================================
  // 3. ESTADO DO JOGO E PROGRESSÃO
  // ==========================================
  let savedNight = 1;
  let starsUnlocked = 0;
  try {
    savedNight = parseInt(localStorage.getItem('fnaf1_night') || '1', 10);
    starsUnlocked = parseInt(localStorage.getItem('fnaf1_stars') || '0', 10);
  } catch (e) {}

  const CAMERAS = {
    '1A': 'Palco Principal', '1B': 'Área de Refeições', '1C': 'Enseada do Pirata',
    '5': 'Bastidores', '7': 'Banheiros', '6': 'Cozinha',
    '3': 'Armário de Suprimentos', '2A': 'Corredor Oeste', '2B': 'Canto Corredor Oeste',
    '4A': 'Corredor Leste', '4B': 'Canto Corredor Leste'
  };

  const gameState = {
    screen: 'menu', night: 1, timeElapsed: 0, power: 100.0,
    powerOut: false, powerOutTimer: 0, panX: 0.5,
    leftDoor: false, rightDoor: false, leftLight: false, rightLight: false,
    monitorOpen: false, currentCam: '1A', callActive: false, callTimer: 0,
    jumpscareTarget: null, jumpscareTimer: 0, goldenFreddyActive: false
  };

  const aiLevels = { freddy: 0, bonnie: 0, chica: 0, foxy: 0 };
  const animatronics = {
    bonnie: { loc: '1A', timer: 0, interval: 4.97, atDoor: false },
    chica: { loc: '1A', timer: 0, interval: 4.98, atDoor: false },
    freddy: { loc: '1A', timer: 0, interval: 3.02, atDoor: false },
    foxy: { stage: 0, timer: 0, interval: 5.01, running: false, runTimer: 0 }
  };

  function getNightAI(night) {
    const presets = {
      1: { freddy: 0, bonnie: 3, chica: 2, foxy: 1 },
      2: { freddy: 1, bonnie: 4, chica: 3, foxy: 2 },
      3: { freddy: 2, bonnie: 5, chica: 5, foxy: 3 },
      4: { freddy: 4, bonnie: 7, chica: 7, foxy: 5 },
      5: { freddy: 6, bonnie: 10, chica: 9, foxy: 7 },
      6: { freddy: 10, bonnie: 14, chica: 13, foxy: 11 }
    };
    return presets[night] || aiLevels;
  }

  function refreshMenuUI() {
    const lbl = document.getElementById('saved-night-label');
    if (lbl) lbl.textContent = `Noite ${Math.min(5, savedNight)}`;
    if (savedNight > 5 || starsUnlocked >= 1) {
      document.getElementById('btn-night6')?.classList.remove('hidden');
      document.getElementById('btn-custom')?.classList.remove('hidden');
    }
    const stars = document.getElementById('stars-row');
    if (stars) stars.textContent = '★'.repeat(starsUnlocked);
  }
  refreshMenuUI();

  document.getElementById('btn-new-game').addEventListener('click', () => {
    sfx.init();
    savedNight = 1;
    try { localStorage.setItem('fnaf1_night', '1'); } catch (e) {}
    startNight(1);
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    sfx.init();
    startNight(Math.min(5, savedNight));
  });

  document.getElementById('btn-night6').addEventListener('click', () => { sfx.init(); startNight(6); });
  document.getElementById('btn-custom').addEventListener('click', () => { sfx.init(); document.getElementById('custom-modal').classList.remove('hidden'); });
  document.getElementById('btn-cancel-custom').addEventListener('click', () => { document.getElementById('custom-modal').classList.add('hidden'); });

  document.querySelectorAll('.ai-controls button').forEach(btn => {
    btn.addEventListener('click', () => {
      const who = btn.dataset.ai;
      const delta = parseInt(btn.dataset.d, 10);
      aiLevels[who] = Math.max(0, Math.min(20, aiLevels[who] + delta));
      document.getElementById(`val-${who}`).textContent = aiLevels[who];
    });
  });

  document.getElementById('btn-20202020').addEventListener('click', () => {
    ['freddy', 'bonnie', 'chica', 'foxy'].forEach(k => { aiLevels[k] = 20; document.getElementById(`val-${k}`).textContent = '20'; });
  });

  document.getElementById('btn-start-custom').addEventListener('click', () => {
    document.getElementById('custom-modal').classList.add('hidden');
    startNight(7, true);
  });

  function startNight(nightNum, isCustom = false) {
    gameState.night = nightNum;
    gameState.screen = 'intro';
    gameState.timeElapsed = 0;
    gameState.power = 100.0;
    gameState.powerOut = false;
    gameState.powerOutTimer = 0;
    gameState.leftDoor = false;
    gameState.rightDoor = false;
    gameState.leftLight = false;
    gameState.rightLight = false;
    gameState.monitorOpen = false;
    gameState.currentCam = '1A';
    gameState.goldenFreddyActive = false;

    const levels = isCustom ? aiLevels : getNightAI(nightNum);
    Object.assign(aiLevels, levels);

    animatronics.bonnie = { loc: '1A', timer: 0, interval: 4.97, atDoor: false };
    animatronics.chica = { loc: '1A', timer: 0, interval: 4.98, atDoor: false };
    animatronics.freddy = { loc: '1A', timer: 0, interval: 3.02, atDoor: false };
    animatronics.foxy = { stage: 0, timer: 0, interval: 5.01, running: false, runTimer: 0 };

    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('win-screen').classList.add('hidden');

    const intro = document.getElementById('night-intro');
    document.getElementById('intro-night').textContent = nightNum === 7 ? 'Noite Customizada' : `${nightNum}ª Noite`;
    intro.classList.remove('hidden');

    setTimeout(() => {
      intro.classList.add('hidden');
      gameState.screen = 'playing';
      document.getElementById('game-hud').classList.remove('hidden');
      document.getElementById('night-text').textContent = nightNum === 7 ? 'Noite Custom' : `Noite ${nightNum}`;
      if (nightNum <= 5) {
        gameState.callActive = true;
        gameState.callTimer = 18;
        document.getElementById('mute-call-btn').classList.remove('hidden');
      }
      updateMonitorUI();
    }, 1800);
  }

  let mouseX = window.innerWidth / 2;
  window.addEventListener('mousemove', (e) => { mouseX = e.clientX; });

  window.addEventListener('keydown', (e) => {
    if (gameState.screen !== 'playing' || gameState.powerOut) return;
    if (e.code === 'Space') { e.preventDefault(); toggleMonitor(); }
    else if (e.code === 'KeyA' && !gameState.monitorOpen) toggleLeftDoor();
    else if (e.code === 'KeyD' && !gameState.monitorOpen) toggleRightDoor();
    else if (e.code === 'KeyQ' && !gameState.monitorOpen) { gameState.leftLight = !gameState.leftLight; gameState.rightLight = false; }
    else if (e.code === 'KeyE' && !gameState.monitorOpen) { gameState.rightLight = !gameState.rightLight; gameState.leftLight = false; }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (gameState.screen !== 'playing' || gameState.powerOut || gameState.monitorOpen) return;
    const cx = e.clientX;
    const cy = e.clientY;
    const worldX = cx + gameState.panX * 420;

    if (worldX >= 115 && worldX <= 165) {
      if (cy >= canvas.height * 0.44 && cy <= canvas.height * 0.52) toggleLeftDoor();
      if (cy >= canvas.height * 0.54 && cy <= canvas.height * 0.62) { gameState.leftLight = !gameState.leftLight; gameState.rightLight = false; }
    }

    const rightPanelX = canvas.width + 420 - 165;
    if (worldX >= rightPanelX && worldX <= rightPanelX + 50) {
      if (cy >= canvas.height * 0.44 && cy <= canvas.height * 0.52) toggleRightDoor();
      if (cy >= canvas.height * 0.54 && cy <= canvas.height * 0.62) { gameState.rightLight = !gameState.rightLight; gameState.leftLight = false; }
    }

    const posterX = (canvas.width + 420) * 0.43;
    if (Math.hypot(worldX - (posterX + 55), cy - (canvas.height * 0.34)) < 25) sfx.noseHonk();
  });

  function toggleLeftDoor() { gameState.leftDoor = !gameState.leftDoor; sfx.doorSlam(); }
  function toggleRightDoor() { gameState.rightDoor = !gameState.rightDoor; sfx.doorSlam(); }

  function toggleMonitor() {
    if (gameState.powerOut) return;
    gameState.monitorOpen = !gameState.monitorOpen;
    gameState.leftLight = false;
    gameState.rightLight = false;
    sfx.camSwitch();
    if (!gameState.monitorOpen && gameState.goldenFreddyActive) triggerJumpscare('Golden Freddy');
    updateMonitorUI();
  }

  document.getElementById('monitor-toggle-btn').addEventListener('click', toggleMonitor);
  document.getElementById('mute-call-btn').addEventListener('click', () => {
    gameState.callActive = false;
    document.getElementById('mute-call-btn').classList.add('hidden');
  });

  document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameState.currentCam = btn.dataset.cam;
      sfx.camSwitch();
      gameState.goldenFreddyActive = (gameState.currentCam === '2B' && Math.random() < 0.06);
      updateMonitorUI();
    });
  });

  function updateMonitorUI() {
    const camUi = document.getElementById('cam-ui');
    if (gameState.monitorOpen) {
      camUi.classList.remove('hidden');
      document.getElementById('cam-name').textContent = `CAM ${gameState.currentCam} - ${CAMERAS[gameState.currentCam]}`;
      document.getElementById('cam-audio-only').classList.toggle('hidden', gameState.currentCam !== '6');
      document.querySelectorAll('.cam-btn').forEach(b => b.classList.toggle('active', b.dataset.cam === gameState.currentCam));
    } else {
      camUi.classList.add('hidden');
    }
  }

  function rollOpportunity(level) { return level > 0 && Math.floor(Math.random() * 20) + 1 <= level; }

  function updateAI(dt) {
    const b = animatronics.bonnie;
    b.timer += dt;
    if (b.timer >= b.interval) {
      b.timer = 0;
      if (rollOpportunity(aiLevels.bonnie)) {
        const path = { '1A': '1B', '1B': '5', '5': '2A', '2A': '3', '3': '2B', '2B': 'DOOR' };
        if (b.atDoor) {
          if (!gameState.leftDoor) triggerJumpscare('Bonnie');
          else { b.atDoor = false; b.loc = '1B'; }
        } else if (path[b.loc] === 'DOOR') b.atDoor = true;
        else b.loc = path[b.loc] || '1B';
      }
    }

    const c = animatronics.chica;
    c.timer += dt;
    if (c.timer >= c.interval) {
      c.timer = 0;
      if (rollOpportunity(aiLevels.chica)) {
        const path = { '1A': '1B', '1B': '7', '7': '6', '6': '4A', '4A': '4B', '4B': 'DOOR' };
        if (c.atDoor) {
          if (!gameState.rightDoor) triggerJumpscare('Chica');
          else { c.atDoor = false; c.loc = '1B'; }
        } else if (path[c.loc] === 'DOOR') c.atDoor = true;
        else c.loc = path[c.loc] || '1B';
      }
    }

    const f = animatronics.freddy;
    f.timer += dt;
    if (f.timer >= f.interval) {
      f.timer = 0;
      const beingWatched = gameState.monitorOpen && gameState.currentCam === f.loc;
      if (!beingWatched && rollOpportunity(aiLevels.freddy)) {
        const path = { '1A': '1B', '1B': '7', '7': '6', '6': '4A', '4A': '4B', '4B': 'DOOR' };
        if (f.loc === '4B') { if (!gameState.rightDoor) triggerJumpscare('Freddy Fazbear'); }
        else f.loc = path[f.loc] || '1B';
      }
    }

    const fx = animatronics.foxy;
    if (fx.running) {
      fx.runTimer -= dt;
      if (fx.runTimer <= 0) {
        fx.running = false;
        fx.stage = 0;
        if (gameState.leftDoor) { sfx.doorSlam(); gameState.power = Math.max(0, gameState.power - 4); }
        else triggerJumpscare('Foxy');
      }
    } else {
      fx.timer += dt;
      if (fx.timer >= fx.interval) {
        fx.timer = 0;
        if (!gameState.monitorOpen && rollOpportunity(aiLevels.foxy)) {
          fx.stage++;
          if (fx.stage >= 3) { fx.running = true; fx.runTimer = 3.2; }
        }
      }
    }
  }

  function triggerJumpscare(killerName) {
    if (gameState.screen !== 'playing') return;
    gameState.screen = 'jumpscare';
    gameState.jumpscareTarget = killerName;
    gameState.jumpscareTimer = 1.4;
    gameState.monitorOpen = false;
    document.getElementById('game-hud').classList.add('hidden');
    sfx.jumpscare();
  }

  let lastTime = performance.now();
  function update(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (gameState.screen === 'playing') {
      gameState.timeElapsed += dt;
      const hour = Math.floor(gameState.timeElapsed / 60);
      document.getElementById('clock-text').textContent = `${hour === 0 ? 12 : hour} AM`;

      if (gameState.timeElapsed >= 360) { winNight(); return; }

      if (gameState.callActive) {
        gameState.callTimer -= dt;
        if (gameState.callTimer <= 0) { gameState.callActive = false; document.getElementById('mute-call-btn').classList.add('hidden'); }
      }

      if (!gameState.powerOut) {
        let usage = 1;
        if (gameState.leftDoor) usage++;
        if (gameState.rightDoor) usage++;
        if (gameState.leftLight || gameState.rightLight) usage++;
        if (gameState.monitorOpen) usage++;

        document.querySelectorAll('.u-bar').forEach((bar, idx) => bar.classList.toggle('active', idx < usage));
        if (gameState.leftLight || gameState.rightLight) sfx.lightBuzz();

        gameState.power -= dt * (0.14 * usage);
        document.getElementById('power-text').textContent = Math.max(0, Math.ceil(gameState.power));

        if (gameState.power <= 0) {
          gameState.power = 0;
          gameState.powerOut = true;
          gameState.leftDoor = false; gameState.rightDoor = false;
          gameState.leftLight = false; gameState.rightLight = false;
          gameState.monitorOpen = false;
          updateMonitorUI();
          gameState.powerOutTimer = 7.5;
          sfx.playToreadorMarch();
        } else {
          updateAI(dt);
        }
      } else {
        gameState.powerOutTimer -= dt;
        if (gameState.powerOutTimer <= 0) triggerJumpscare('Freddy Fazbear');
      }

      const targetPan = Math.max(0, Math.min(1, mouseX / window.innerWidth));
      gameState.panX += (targetPan - gameState.panX) * 0.08;
    } else if (gameState.screen === 'jumpscare') {
      gameState.jumpscareTimer -= dt;
      if (gameState.jumpscareTimer <= 0) {
        gameState.screen = 'gameover';
        document.getElementById('killer-text').textContent = `Você foi pego por ${gameState.jumpscareTarget}.`;
        document.getElementById('gameover-screen').classList.remove('hidden');
      }
    }

    render();
    requestAnimationFrame(update);
  }

  function winNight() {
    gameState.screen = 'win';
    document.getElementById('game-hud').classList.add('hidden');
    document.getElementById('win-screen').classList.remove('hidden');

    if (gameState.night <= 5) {
      savedNight = Math.max(savedNight, gameState.night + 1);
      try { localStorage.setItem('fnaf1_night', savedNight.toString()); } catch (e) {}
      if (gameState.night === 5) starsUnlocked = Math.max(starsUnlocked, 1);
    } else if (gameState.night === 6) starsUnlocked = Math.max(starsUnlocked, 2);
    else if (gameState.night === 7 && aiLevels.freddy === 20 && aiLevels.bonnie === 20 && aiLevels.chica === 20 && aiLevels.foxy === 20) starsUnlocked = 3;
    try { localStorage.setItem('fnaf1_stars', starsUnlocked.toString()); } catch (e) {}

    setTimeout(() => {
      document.getElementById('win-screen').classList.add('hidden');
      document.getElementById('main-menu').classList.remove('hidden');
      gameState.screen = 'menu';
      refreshMenuUI();
    }, 3800);
  }

  document.getElementById('btn-retry').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    gameState.screen = 'menu';
    refreshMenuUI();
  });

  function drawAnimatronicSprite(x, y, size, name) {
    const spr = SPRITES[name] || SPRITES['Freddy'];
    ctx.drawImage(spr, x - size / 2, y - size / 2, size, size);
  }

  function render() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState.screen === 'jumpscare') {
      const shakeX = (Math.random() - 0.5) * 45;
      const shakeY = (Math.random() - 0.5) * 45;
      drawAnimatronicSprite(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY, 440, gameState.jumpscareTarget);
      return;
    }

    if (gameState.screen !== 'playing') return;
    if (gameState.monitorOpen) renderCameraFeed();
    else renderOffice();
  }

  function renderOffice() {
    const totalW = canvas.width + 420;
    const offsetX = -gameState.panX * 420;

    ctx.save();
    ctx.translate(offsetX, 0);

    const dim = gameState.powerOut ? 0.18 : 1;
    ctx.fillStyle = `rgb(${28 * dim}, ${26 * dim}, ${32 * dim})`;
    ctx.fillRect(0, 0, totalW, canvas.height);

    for (let x = 0; x < totalW; x += 40) {
      ctx.fillStyle = (x / 40) % 2 === 0 ? '#111' : '#262626';
      ctx.fillRect(x, canvas.height * 0.52, 40, 26);
    }

    // Pôster CELEBRATE! com sprite do Freddy
    const posterX = totalW * 0.43;
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(posterX, canvas.height * 0.2, 110, 145);
    ctx.strokeStyle = '#737373';
    ctx.strokeRect(posterX, canvas.height * 0.2, 110, 145);
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px Courier New';
    ctx.fillText('CELEBRATE!', posterX + 14, canvas.height * 0.24);
    drawAnimatronicSprite(posterX + 55, canvas.height * 0.35, 68, 'Freddy');

    // Mesa de Segurança e Ventilador
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(totalW * 0.28, canvas.height * 0.68, totalW * 0.44, canvas.height * 0.32);

    const fanX = totalW * 0.52;
    const fanY = canvas.height * 0.62;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(fanX - 6, fanY, 12, 45);
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fanX, fanY, 26, 0, Math.PI * 2);
    ctx.stroke();

    drawDoorway(180, totalW, true);
    drawDoorway(totalW - 310, totalW, false);

    if (gameState.goldenFreddyActive) {
      drawAnimatronicSprite(totalW * 0.5, canvas.height * 0.62, 180, 'Golden Freddy');
    }

    ctx.restore();
  }

  function drawDoorway(x, totalW, isLeft) {
    const doorOpen = isLeft ? !gameState.leftDoor : !gameState.rightDoor;
    const lightOn = isLeft ? gameState.leftLight : gameState.rightLight;
    const enemyHere = isLeft ? animatronics.bonnie.atDoor : animatronics.chica.atDoor;

    ctx.fillStyle = lightOn ? '#3f3f46' : '#09090b';
    ctx.fillRect(x, canvas.height * 0.16, 130, canvas.height * 0.72);

    if (lightOn && enemyHere) {
      drawAnimatronicSprite(x + 65, canvas.height * 0.45, 120, isLeft ? 'Bonnie' : 'Chica');
    }

    if (!doorOpen) {
      ctx.fillStyle = '#52525b';
      ctx.fillRect(x, canvas.height * 0.16, 130, canvas.height * 0.72);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 6, canvas.height * 0.18, 118, canvas.height * 0.68);
    }

    const panelX = isLeft ? 115 : totalW - 165;
    ctx.fillStyle = '#27272a';
    ctx.fillRect(panelX, canvas.height * 0.43, 50, 120);

    ctx.fillStyle = !doorOpen ? '#ef4444' : '#7f1d1d';
    ctx.fillRect(panelX + 10, canvas.height * 0.44, 30, 38);

    ctx.fillStyle = lightOn ? '#fef08a' : '#71717a';
    ctx.fillRect(panelX + 10, canvas.height * 0.54, 30, 38);
  }

  function renderCameraFeed() {
    const cam = gameState.currentCam;
    ctx.fillStyle = '#0d130f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (cam === '6') return;

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width * 0.15, canvas.height * 0.15, canvas.width * 0.7, canvas.height * 0.7);

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.52;

    if (animatronics.freddy.loc === cam) drawAnimatronicSprite(cx - 130, cy, 135, 'Freddy');
    if (animatronics.bonnie.loc === cam) drawAnimatronicSprite(cx, cy, 135, 'Bonnie');
    if (animatronics.chica.loc === cam) drawAnimatronicSprite(cx + 130, cy, 135, 'Chica');

    if (cam === '1C') {
      const stageNames = ['Cortinas Fechadas', 'Foxy Espiando', 'Foxy Pronto para Sair', 'Enseada Vazia!'];
      ctx.fillStyle = '#a855f7';
      ctx.font = '20px Courier New';
      ctx.fillText(stageNames[animatronics.foxy.stage], cx - 130, cy - 95);
      if (animatronics.foxy.stage > 0 && animatronics.foxy.stage < 3) {
        drawAnimatronicSprite(cx, cy, 145, 'Foxy');
      }
    }

    if (cam === '2B' && gameState.goldenFreddyActive) {
      drawAnimatronicSprite(cx, cy, 175, 'Golden Freddy');
    }

    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 18, 2);
    }
  }

  requestAnimationFrame(update);
});