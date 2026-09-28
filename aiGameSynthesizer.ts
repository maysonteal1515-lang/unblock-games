export interface SynthesizedGame {
  title: string;
  category: string;
  badge: string;
  accentColor: string;
  aspectRatio: string;
  description: string;
  controls: string[];
  tags: string[];
  html: string;
}

export function synthesizeProceduralGame(
  urlOrConcept: string,
  userPrompt: string = '',
  preferredCategory: string = 'Arcade'
): SynthesizedGame {
  const combined = `${urlOrConcept} ${userPrompt}`.toLowerCase();

  // Determine game archetype
  if (combined.includes('slope') || combined.includes('runner') || combined.includes('speed') || combined.includes('tunnel') || combined.includes('subway') || combined.includes('dash')) {
    return createSlopeRunnerGame(urlOrConcept, userPrompt, preferredCategory);
  } else if (combined.includes('space') || combined.includes('asteroid') || combined.includes('star') || combined.includes('galaxy') || combined.includes('shooter') || combined.includes('invader')) {
    return createSpaceShooterGame(urlOrConcept, userPrompt, preferredCategory);
  } else if (combined.includes('race') || combined.includes('kart') || combined.includes('car') || combined.includes('drive') || combined.includes('highway') || combined.includes('drift')) {
    return createRetroRacerGame(urlOrConcept, userPrompt, preferredCategory);
  } else if (combined.includes('jump') || combined.includes('platform') || combined.includes('mario') || combined.includes('climb') || combined.includes('doodle') || combined.includes('ninja')) {
    return createPlatformJumperGame(urlOrConcept, userPrompt, preferredCategory);
  } else {
    // Default high-energy Cyber Neon Ball / Block Arcade
    return createSlopeRunnerGame(urlOrConcept, userPrompt, preferredCategory);
  }
}

// 1. Slope 3D Cyber Runner
function createSlopeRunnerGame(url: string, prompt: string, category: string): SynthesizedGame {
  const title = prompt && prompt.length < 25 ? prompt : 'Neon Slope Rush 3D';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #030712; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      color: #38bdf8; font-size: 14px; text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
      pointer-events: none;
    }
    .hud-box { background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; padding: 8px 16px; border-radius: 8px; backdrop-filter: blur(4px); }
    #keys-hud {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 8px; pointer-events: none;
    }
    .key-cap {
      background: #0f172a; border: 1px solid #334155; color: #94a3b8;
      padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold;
      transition: all 0.1s;
    }
    .key-cap.active { background: #06b6d4; color: #020617; border-color: #22d3ee; box-shadow: 0 0 12px #06b6d4; }
    #overlay {
      position: absolute; inset: 0; background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(6px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #f8fafc; z-index: 10;
    }
    #overlay.hidden { display: none; }
    h1 { font-size: 32px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; text-shadow: 0 0 20px #0284c7; }
    p { color: #94a3b8; margin-bottom: 24px; font-size: 14px; }
    .btn {
      background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #020617; font-weight: bold;
      border: none; padding: 12px 28px; border-radius: 8px; cursor: pointer; font-size: 14px;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn:hover { transform: scale(1.05); box-shadow: 0 0 25px rgba(6, 182, 212, 0.7); }
  </style>
</head>
<body>
  <div id="hud">
    <div class="hud-box">SPEED: <span id="speedVal">100</span> km/h | DISTANCE: <span id="scoreVal">0</span>m</div>
    <div class="hud-box">BEST: <span id="bestVal">0</span>m</div>
  </div>

  <div id="keys-hud">
    <div class="key-cap" id="k-left">◄ A / LEFT</div>
    <div class="key-cap" id="k-jump">SPACE / JUMP</div>
    <div class="key-cap" id="k-right">► D / RIGHT</div>
  </div>

  <div id="overlay">
    <h1 id="overlayTitle">⚡ ${title.toUpperCase()}</h1>
    <p id="overlaySub">Dodge obstacles on the endless neon slope using your PC keyboard</p>
    <button class="btn" id="startBtn">START RUN (SPACE)</button>
  </div>

  <canvas id="c"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Sound Synth
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTone(freq, type, dur, vol = 0.1) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    // Input
    const keys = { left: false, right: false, space: false };
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft','KeyA'].includes(e.code)) { keys.left = true; updateKeyHud(); e.preventDefault(); }
      if (['ArrowRight','KeyD'].includes(e.code)) { keys.right = true; updateKeyHud(); e.preventDefault(); }
      if (['Space','ArrowUp','KeyW'].includes(e.code)) {
        keys.space = true; updateKeyHud(); e.preventDefault();
        if (gameState !== 'playing') startGame();
        else if (player.grounded) {
          player.vy = -14;
          player.grounded = false;
          playTone(480, 'sine', 0.15, 0.15);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowLeft','KeyA'].includes(e.code)) { keys.left = false; updateKeyHud(); }
      if (['ArrowRight','KeyD'].includes(e.code)) { keys.right = false; updateKeyHud(); }
      if (['Space','ArrowUp','KeyW'].includes(e.code)) { keys.space = false; updateKeyHud(); }
    });

    function updateKeyHud() {
      document.getElementById('k-left').className = 'key-cap' + (keys.left ? ' active' : '');
      document.getElementById('k-right').className = 'key-cap' + (keys.right ? ' active' : '');
      document.getElementById('k-jump').className = 'key-cap' + (keys.space ? ' active' : '');
    }

    // Game state
    let gameState = 'start';
    let distance = 0;
    let bestDistance = Number(localStorage.getItem('slope_high_score') || 0);
    document.getElementById('bestVal').innerText = bestDistance;

    const player = {
      x: 0,
      y: 0,
      vy: 0,
      grounded: true,
      radius: 18,
      speed: 8
    };

    let segments = [];
    let obstacles = [];
    let particles = [];

    function initTrack() {
      segments = [];
      obstacles = [];
      particles = [];
      distance = 0;
      player.x = 0;
      player.y = 0;
      player.vy = 0;
      player.grounded = true;
      player.speed = 8;

      for (let i = 0; i < 60; i++) {
        segments.push({ z: i * 30 });
      }
    }

    function spawnObstacle(z) {
      const lane = (Math.random() - 0.5) * 320;
      const type = Math.random() > 0.3 ? 'block' : 'ramp';
      obstacles.push({ x: lane, z: z, w: 40, h: 40, type });
    }

    function startGame() {
      initTrack();
      gameState = 'playing';
      document.getElementById('overlay').classList.add('hidden');
      playTone(600, 'triangle', 0.2, 0.2);
    }

    function gameOver() {
      gameState = 'over';
      playTone(150, 'sawtooth', 0.5, 0.25);
      if (distance > bestDistance) {
        bestDistance = distance;
        localStorage.setItem('slope_high_score', bestDistance);
        document.getElementById('bestVal').innerText = bestDistance;
      }
      document.getElementById('overlayTitle').innerText = '💥 CRASHED!';
      document.getElementById('overlaySub').innerText = 'Final Distance: ' + distance + 'm | Best: ' + bestDistance + 'm';
      document.getElementById('startBtn').innerText = 'RETRY (SPACE)';
      document.getElementById('overlay').classList.remove('hidden');
    }

    document.getElementById('startBtn').onclick = startGame;
    window.onclick = () => window.focus();

    // Loop
    let lastTime = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Clear
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Starfield / Horizon
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fillRect(0, height * 0.45, width, 1);

      if (gameState === 'playing') {
        // Player Movement
        if (keys.left) player.x -= 380 * dt;
        if (keys.right) player.x += 380 * dt;
        player.x = Math.max(-280, Math.min(280, player.x));

        // Physics
        player.vy += 32 * dt;
        player.y += player.vy;
        if (player.y >= 0) {
          player.y = 0;
          player.vy = 0;
          player.grounded = true;
        }

        player.speed += 0.25 * dt;
        distance += Math.floor(player.speed * 60 * dt);
        document.getElementById('scoreVal').innerText = distance;
        document.getElementById('speedVal').innerText = Math.floor(player.speed * 12);

        // Track progression
        const speedAdvance = player.speed * 60 * dt;
        for (let i = 0; i < segments.length; i++) {
          segments[i].z -= speedAdvance;
        }
        if (segments[0].z < 0) {
          segments.shift();
          const lastZ = segments[segments.length - 1].z;
          segments.push({ z: lastZ + 30 });
          if (Math.random() < 0.45) spawnObstacle(lastZ + 30);
        }

        // Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.z -= speedAdvance;

          // Collision
          if (obs.z > 20 && obs.z < 60) {
            const dx = Math.abs(player.x - obs.x);
            if (dx < 35 && player.y > -25) {
              if (obs.type === 'ramp') {
                player.vy = -18;
                player.grounded = false;
                playTone(700, 'sine', 0.2, 0.2);
                obstacles.splice(i, 1);
                continue;
              } else {
                gameOver();
                break;
              }
            }
          }

          if (obs.z < -20) obstacles.splice(i, 1);
        }
      }

      // 3D Projection
      const horizonY = height * 0.48;
      const fov = 350;

      // Draw Slope Grid
      ctx.lineWidth = 1.5;
      for (let i = 0; i < segments.length - 1; i++) {
        const z1 = segments[i].z + 60;
        const z2 = segments[i + 1].z + 60;
        if (z1 <= 0 || z2 <= 0) continue;

        const scale1 = fov / z1;
        const scale2 = fov / z2;
        const y1 = horizonY + 120 * scale1;
        const y2 = horizonY + 120 * scale2;

        const left1 = width / 2 - 320 * scale1;
        const right1 = width / 2 + 320 * scale1;
        const left2 = width / 2 - 320 * scale2;
        const right2 = width / 2 + 320 * scale2;

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(30, 58, 138, 0.3)';
        ctx.beginPath();
        ctx.moveTo(left1, y1);
        ctx.lineTo(right1, y1);
        ctx.stroke();

        if (i === 0) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.beginPath();
          ctx.moveTo(left1, y1); ctx.lineTo(left2, y2);
          ctx.moveTo(right1, y1); ctx.lineTo(right2, y2);
          ctx.stroke();
        }
      }

      // Draw Obstacles
      for (const obs of obstacles) {
        const z = obs.z + 60;
        if (z <= 10) continue;
        const scale = fov / z;
        const sx = width / 2 + obs.x * scale;
        const sy = horizonY + 120 * scale;
        const sw = obs.w * scale;
        const sh = obs.h * scale;

        if (obs.type === 'ramp') {
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(sx - sw/2, sy);
          ctx.lineTo(sx + sw/2, sy);
          ctx.lineTo(sx, sy - sh);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillRect(sx - sw / 2, sy - sh, sw, sh);
        }
        ctx.shadowBlur = 0;
      }

      // Draw Player Sphere
      const pScale = fov / 80;
      const px = width / 2 + player.x * pScale;
      const py = horizonY + (120 + player.y) * pScale;
      const pr = player.radius * pScale;

      // Glow & Sphere
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      const grad = ctx.createRadialGradient(px - pr*0.3, py - pr*0.3, pr*0.1, px, py, pr);
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.5, '#0ea5e9');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Shadow on track
      if (player.y < 0) {
        const shadowY = horizonY + 120 * pScale;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(px, shadowY, pr * 1.2, pr * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    initTrack();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

  return {
    title,
    category: category || 'Arcade',
    badge: 'AI Created',
    accentColor: '#06b6d4',
    aspectRatio: '16:9',
    description: `High-speed 3D neon runner with dynamic obstacles, ramp jumping, and instant PC keyboard responsiveness.`,
    controls: ['A / D or Left / Right to Steer', 'Space or Up to Jump on Ramps', 'Full PC Keyboard support'],
    tags: ['3D', 'Runner', 'Speed', 'Keyboard', 'Arcade'],
    html
  };
}

// 2. Space Rail / Asteroid Shooter
function createSpaceShooterGame(url: string, prompt: string, category: string): SynthesizedGame {
  const title = prompt && prompt.length < 25 ? prompt : 'Galaxy Starfighter 3D';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: monospace; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      color: #38bdf8; font-size: 14px; pointer-events: none;
    }
    .hud-box { background: rgba(15, 23, 42, 0.85); border: 1px solid #1e293b; padding: 8px 16px; border-radius: 8px; }
    #overlay {
      position: absolute; inset: 0; background: rgba(2, 6, 23, 0.85); backdrop-filter: blur(6px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #f8fafc; z-index: 10;
    }
    #overlay.hidden { display: none; }
    h1 { font-size: 32px; font-weight: 800; color: #38bdf8; margin-bottom: 8px; }
    p { color: #94a3b8; margin-bottom: 24px; font-size: 14px; }
    .btn {
      background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #020617; font-weight: bold;
      border: none; padding: 12px 28px; border-radius: 8px; cursor: pointer; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="hud">
    <div class="hud-box">SCORE: <span id="scoreVal">0</span> | SHIELDS: <span id="shieldVal">100%</span></div>
    <div class="hud-box">SPACE TO FIRE | WASD / ARROWS TO FLY</div>
  </div>

  <div id="overlay">
    <h1 id="overlayTitle">🚀 ${title.toUpperCase()}</h1>
    <p id="overlaySub">Defend the sector against asteroid storms and alien drones</p>
    <button class="btn" id="startBtn">LAUNCH FIGHTER (SPACE)</button>
  </div>

  <canvas id="c"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    // Sound
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTone(freq, type, dur, vol = 0.1) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (gameState !== 'playing' && e.code === 'Space') startGame();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    let gameState = 'start';
    let score = 0, shields = 100;
    const ship = { x: 0, y: 0, vx: 0, vy: 0, cooldown: 0 };
    let stars = [], lasers = [], enemies = [], particles = [];

    for (let i = 0; i < 120; i++) {
      stars.push({ x: Math.random()*2000 - 1000, y: Math.random()*2000 - 1000, z: Math.random()*1000 });
    }

    function startGame() {
      score = 0; shields = 100; lasers = []; enemies = []; particles = [];
      ship.x = width / 2; ship.y = height * 0.75;
      gameState = 'playing';
      document.getElementById('overlay').classList.add('hidden');
      document.getElementById('shieldVal').innerText = shields + '%';
      document.getElementById('scoreVal').innerText = score;
    }

    function gameOver() {
      gameState = 'over';
      playTone(100, 'sawtooth', 0.6, 0.3);
      document.getElementById('overlayTitle').innerText = '💥 SHIP DESTROYED';
      document.getElementById('overlaySub').innerText = 'Final Score: ' + score;
      document.getElementById('startBtn').innerText = 'RESTART (SPACE)';
      document.getElementById('overlay').classList.remove('hidden');
    }

    document.getElementById('startBtn').onclick = startGame;
    window.onclick = () => window.focus();

    function loop() {
      requestAnimationFrame(loop);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Starfield warp
      for (const s of stars) {
        s.z -= 4;
        if (s.z <= 0) s.z = 1000;
        const k = 250 / s.z;
        const px = width/2 + s.x * k;
        const py = height/2 + s.y * k;
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(1, (1 - s.z/1000) * 3);
          ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - s.z/1000) + ')';
          ctx.fillRect(px, py, size, size);
        }
      }

      if (gameState === 'playing') {
        // Controls
        const speed = 7;
        if (keys['ArrowLeft'] || keys['KeyA']) ship.x -= speed;
        if (keys['ArrowRight'] || keys['KeyD']) ship.x += speed;
        if (keys['ArrowUp'] || keys['KeyW']) ship.y -= speed;
        if (keys['ArrowDown'] || keys['KeyS']) ship.y += speed;
        ship.x = Math.max(40, Math.min(width - 40, ship.x));
        ship.y = Math.max(40, Math.min(height - 40, ship.y));

        // Fire Laser
        ship.cooldown--;
        if (keys['Space'] && ship.cooldown <= 0) {
          lasers.push({ x: ship.x - 14, y: ship.y - 20 });
          lasers.push({ x: ship.x + 14, y: ship.y - 20 });
          ship.cooldown = 10;
          playTone(880, 'square', 0.08, 0.12);
        }

        // Spawn Enemies
        if (Math.random() < 0.04) {
          enemies.push({
            x: Math.random() * (width - 80) + 40,
            y: -30,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 2,
            hp: 2,
            r: 20
          });
        }
      }

      // Lasers
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.y -= 14;
        ctx.fillRect(l.x - 2, l.y, 4, 16);
        if (l.y < -20) lasers.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += e.vx; e.y += e.vy;
        if (e.x < 30 || e.x > width - 30) e.vx *= -1;

        // Draw Asteroid / Enemy
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();

        // Check laser hits
        for (let j = lasers.length - 1; j >= 0; j--) {
          const l = lasers[j];
          const dist = Math.hypot(e.x - l.x, e.y - l.y);
          if (dist < e.r + 5) {
            lasers.splice(j, 1);
            e.hp--;
            playTone(300, 'sawtooth', 0.1, 0.1);
            if (e.hp <= 0) {
              score += 100;
              document.getElementById('scoreVal').innerText = score;
              // Explode
              for (let p = 0; p < 8; p++) {
                particles.push({ x: e.x, y: e.y, vx: (Math.random()-0.5)*8, vy: (Math.random()-0.5)*8, life: 20 });
              }
              enemies.splice(i, 1);
              break;
            }
          }
        }

        // Check ship collision
        if (gameState === 'playing') {
          const shipDist = Math.hypot(e.x - ship.x, e.y - ship.y);
          if (shipDist < e.r + 20) {
            shields -= 25;
            document.getElementById('shieldVal').innerText = shields + '%';
            playTone(120, 'sawtooth', 0.3, 0.3);
            enemies.splice(i, 1);
            if (shields <= 0) gameOver();
          }
        }

        if (e.y > height + 40) enemies.splice(i, 1);
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        ctx.fillStyle = 'rgba(251, 146, 60, ' + (p.life / 20) + ')';
        ctx.fillRect(p.x, p.y, 4, 4);
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Draw Ship
      if (gameState === 'playing') {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(20, 18);
        ctx.lineTo(0, 10);
        ctx.lineTo(-20, 18);
        ctx.closePath();
        ctx.fill();

        // Thruster flame
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-6, 12);
        ctx.lineTo(0, 22 + Math.random()*8);
        ctx.lineTo(6, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

  return {
    title,
    category: category || 'Action',
    badge: 'AI Created',
    accentColor: '#38bdf8',
    aspectRatio: '16:9',
    description: `Full 60 FPS galactic rail fighter with lasers, particle explosions, responsive keyboard controls and audio.`,
    controls: ['WASD / Arrows to Fly Ship', 'Space to Fire Plasma Lasers', 'Full PC Keyboard support'],
    tags: ['Space', 'Shooter', 'Action', 'Keyboard', 'Arcade'],
    html
  };
}

// 3. Retro Kart Racer
function createRetroRacerGame(url: string, prompt: string, category: string): SynthesizedGame {
  const title = prompt && prompt.length < 25 ? prompt : 'Retro Cyber Grand Prix';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #030712; font-family: monospace; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      color: #a855f7; font-size: 14px; pointer-events: none;
    }
    .hud-box { background: rgba(15, 23, 42, 0.85); border: 1px solid #3b0764; padding: 8px 16px; border-radius: 8px; }
    #overlay {
      position: absolute; inset: 0; background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(6px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #f8fafc; z-index: 10;
    }
    #overlay.hidden { display: none; }
    h1 { font-size: 32px; font-weight: 800; color: #c084fc; margin-bottom: 8px; }
    p { color: #94a3b8; margin-bottom: 24px; font-size: 14px; }
    .btn {
      background: linear-gradient(135deg, #a855f7, #ec4899); color: #020617; font-weight: bold;
      border: none; padding: 12px 28px; border-radius: 8px; cursor: pointer; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="hud">
    <div class="hud-box">SPEED: <span id="speedVal">0</span> MPH | SCORE: <span id="scoreVal">0</span></div>
    <div class="hud-box">STEER: A/D OR ARROWS | ACCELERATE: W / SPACE</div>
  </div>

  <div id="overlay">
    <h1 id="overlayTitle">🏎️ ${title.toUpperCase()}</h1>
    <p id="overlaySub">Outrun rival traffic and dominate the neon speedway</p>
    <button class="btn" id="startBtn">START ENGINE (SPACE)</button>
  </div>

  <canvas id="c"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTone(freq, type, dur, vol = 0.1) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (gameState !== 'playing' && e.code === 'Space') startGame();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    let gameState = 'start';
    let carX = 0, speed = 0, distance = 0;
    let traffic = [];

    function startGame() {
      carX = 0; speed = 60; distance = 0; traffic = [];
      gameState = 'playing';
      document.getElementById('overlay').classList.add('hidden');
    }

    function gameOver() {
      gameState = 'over';
      playTone(90, 'sawtooth', 0.5, 0.3);
      document.getElementById('overlayTitle').innerText = '💥 HIGHWAY CRASH!';
      document.getElementById('overlaySub').innerText = 'Distance Survived: ' + Math.floor(distance) + ' miles';
      document.getElementById('startBtn').innerText = 'RACE AGAIN (SPACE)';
      document.getElementById('overlay').classList.remove('hidden');
    }

    document.getElementById('startBtn').onclick = startGame;
    window.onclick = () => window.focus();

    let roadOffset = 0;
    function loop() {
      requestAnimationFrame(loop);
      ctx.fillStyle = '#090514';
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.45;

      if (gameState === 'playing') {
        if (keys['ArrowLeft'] || keys['KeyA']) carX -= 0.035;
        if (keys['ArrowRight'] || keys['KeyD']) carX += 0.035;
        if (keys['ArrowUp'] || keys['KeyW'] || keys['Space']) speed = Math.min(180, speed + 1);
        else speed = Math.max(70, speed - 0.5);

        carX = Math.max(-0.85, Math.min(0.85, carX));
        distance += (speed / 3600);
        roadOffset = (roadOffset + speed * 0.2) % 60;

        document.getElementById('speedVal').innerText = Math.floor(speed);
        document.getElementById('scoreVal').innerText = Math.floor(distance * 100);

        // Spawn traffic
        if (Math.random() < 0.035) {
          traffic.push({
            x: (Math.random() - 0.5) * 1.5,
            z: 1000,
            color: ['#f43f5e','#10b981','#38bdf8','#f59e0b'][Math.floor(Math.random()*4)]
          });
        }
      }

      // Draw Perspective Road
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(width/2 - 60, horizon);
      ctx.lineTo(width/2 + 60, horizon);
      ctx.lineTo(width/2 + width*0.5, height);
      ctx.lineTo(width/2 - width*0.5, height);
      ctx.closePath();
      ctx.fill();

      // Road Stripes
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      for (let y = horizon; y < height; y += 30) {
        const rel = (y - horizon) / (height - horizon);
        const w = (width * 0.5) * rel;
        ctx.beginPath();
        ctx.moveTo(width/2 - 4, y + roadOffset * rel);
        ctx.lineTo(width/2 + 4, y + roadOffset * rel);
        ctx.stroke();
      }

      // Traffic
      for (let i = traffic.length - 1; i >= 0; i--) {
        const t = traffic[i];
        t.z -= (speed - 40) * 0.35;
        if (t.z <= 0) { traffic.splice(i, 1); continue; }

        const rel = 1 - t.z / 1000;
        const ty = horizon + (height - horizon) * rel;
        const roadW = (width * 0.5) * rel;
        const tx = width/2 + t.x * roadW;
        const tw = 35 * rel * 2;
        const th = 20 * rel * 2;

        ctx.fillStyle = t.color;
        ctx.fillRect(tx - tw/2, ty - th, tw, th);

        // Collision check
        if (rel > 0.82 && rel < 0.96) {
          if (Math.abs(tx - (width/2 + carX * (width * 0.5) * 0.88)) < 36) {
            gameOver();
          }
        }
      }

      // Player Car
      const playerY = height - 70;
      const playerX = width/2 + carX * (width * 0.5) * 0.88;
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 15;
      ctx.fillRect(playerX - 32, playerY, 64, 32);
      ctx.fillStyle = '#fdf2f8';
      ctx.fillRect(playerX - 22, playerY + 4, 44, 12);
      ctx.shadowBlur = 0;
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

  return {
    title,
    category: category || 'Sports',
    badge: 'AI Created',
    accentColor: '#a855f7',
    aspectRatio: '16:9',
    description: `High-octane pseudo-3D highway racer with traffic overtaking, boost physics, and PC keyboard steering.`,
    controls: ['A / D or Left / Right to Steer', 'W / Space to Accelerate / Boost', 'Full PC Keyboard support'],
    tags: ['Racing', 'Sports', 'Cars', 'Keyboard', 'Arcade'],
    html
  };
}

// 4. Platformer Jumper
function createPlatformJumperGame(url: string, prompt: string, category: string): SynthesizedGame {
  const title = prompt && prompt.length < 25 ? prompt : 'Cyber Ninja Climber';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #030712; font-family: monospace; }
    canvas { display: block; width: 100%; height: 100%; }
    #hud {
      position: absolute; top: 16px; left: 16px; right: 16px;
      display: flex; justify-content: space-between; align-items: center;
      color: #10b981; font-size: 14px; pointer-events: none;
    }
    .hud-box { background: rgba(15, 23, 42, 0.85); border: 1px solid #064e3b; padding: 8px 16px; border-radius: 8px; }
    #overlay {
      position: absolute; inset: 0; background: rgba(3, 7, 18, 0.85); backdrop-filter: blur(6px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #f8fafc; z-index: 10;
    }
    #overlay.hidden { display: none; }
    h1 { font-size: 32px; font-weight: 800; color: #34d399; margin-bottom: 8px; }
    p { color: #94a3b8; margin-bottom: 24px; font-size: 14px; }
    .btn {
      background: linear-gradient(135deg, #10b981, #059669); color: #020617; font-weight: bold;
      border: none; padding: 12px 28px; border-radius: 8px; cursor: pointer; font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="hud">
    <div class="hud-box">HEIGHT: <span id="scoreVal">0</span>m</div>
    <div class="hud-box">A/D: MOVE | SPACE: SPRING JUMP</div>
  </div>

  <div id="overlay">
    <h1 id="overlayTitle">🥷 ${title.toUpperCase()}</h1>
    <p id="overlaySub">Jump across infinite cyber platforms to reach the stratosphere</p>
    <button class="btn" id="startBtn">START CLIMB (SPACE)</button>
  </div>

  <canvas id="c"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    function playTone(freq, type, dur, vol = 0.1) {
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
      } catch(e) {}
    }

    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
      if (gameState !== 'playing' && e.code === 'Space') startGame();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    let gameState = 'start';
    let altitude = 0, bestAlt = 0;
    const player = { x: 0, y: 0, vx: 0, vy: 0, r: 16 };
    let platforms = [];

    function startGame() {
      altitude = 0;
      player.x = width / 2;
      player.y = height * 0.7;
      player.vx = 0;
      player.vy = -12;
      platforms = [{ x: width/2 - 50, y: height * 0.75, w: 100 }];
      for (let i = 1; i < 15; i++) {
        platforms.push({
          x: Math.random() * (width - 120) + 20,
          y: (height * 0.75) - i * 65,
          w: Math.random() * 40 + 70
        });
      }
      gameState = 'playing';
      document.getElementById('overlay').classList.add('hidden');
    }

    function gameOver() {
      gameState = 'over';
      playTone(110, 'sawtooth', 0.5, 0.3);
      document.getElementById('overlayTitle').innerText = 'FALLEN FROM CLOUD';
      document.getElementById('overlaySub').innerText = 'Max Altitude: ' + Math.floor(altitude) + 'm';
      document.getElementById('startBtn').innerText = 'CLIMB AGAIN (SPACE)';
      document.getElementById('overlay').classList.remove('hidden');
    }

    document.getElementById('startBtn').onclick = startGame;
    window.onclick = () => window.focus();

    function loop() {
      requestAnimationFrame(loop);
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      if (gameState === 'playing') {
        if (keys['ArrowLeft'] || keys['KeyA']) player.vx -= 0.8;
        else if (keys['ArrowRight'] || keys['KeyD']) player.vx += 0.8;
        else player.vx *= 0.88;

        player.vx = Math.max(-8, Math.min(8, player.vx));
        player.x += player.vx;
        if (player.x < 0) player.x = width;
        if (player.x > width) player.x = 0;

        player.vy += 0.42; // Gravity
        player.y += player.vy;

        // Platform bounce
        if (player.vy > 0) {
          for (const plat of platforms) {
            if (player.x > plat.x && player.x < plat.x + plat.w &&
                player.y + player.r >= plat.y && player.y + player.r <= plat.y + 16) {
              player.vy = -13;
              playTone(550, 'sine', 0.12, 0.15);
              break;
            }
          }
        }

        // Camera scroll
        if (player.y < height * 0.4) {
          const delta = (height * 0.4) - player.y;
          player.y = height * 0.4;
          altitude += delta * 0.1;
          document.getElementById('scoreVal').innerText = Math.floor(altitude);

          for (const plat of platforms) plat.y += delta;
        }

        // Recycle platforms
        for (let i = platforms.length - 1; i >= 0; i--) {
          if (platforms[i].y > height) {
            platforms.splice(i, 1);
            platforms.push({
              x: Math.random() * (width - 120) + 20,
              y: platforms[platforms.length - 1]?.y - 65 || 0,
              w: Math.random() * 40 + 70
            });
          }
        }

        if (player.y > height + 40) gameOver();
      }

      // Draw Platforms
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, 10);
      }
      ctx.shadowBlur = 0;

      // Draw Player
      if (gameState === 'playing') {
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

  return {
    title,
    category: category || 'Action',
    badge: 'AI Created',
    accentColor: '#10b981',
    aspectRatio: '16:9',
    description: `Vertical cyber climber platformer with elastic spring physics, infinite procedural jumps and responsive keyboard controls.`,
    controls: ['A / D or Left / Right to Move', 'Bounce on Platforms to Climb', 'Full PC Keyboard support'],
    tags: ['Platformer', 'Action', 'Climb', 'Keyboard', 'Arcade'],
    html
  };
}
