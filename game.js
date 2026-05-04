'use strict';
// ── FINANCE QUEST: Level Devil-style financial literacy game ──
// Shared by both index.html (app.js) and index-web.html (web-app.js)

const FG = {
  canvas: null, ctx: null,
  running: false, animId: null,
  score: 0, coins: 0, lives: 3, level: 1,
  xpEarned: 0,

  // Player
  P: { x:80, y:200, w:36, h:36, vy:0, vx:0, onGround:false, facing:1 },
  GRAVITY: 0.55, JUMP: -13, SPEED: 4,

  // Game objects
  platforms: [], hazards: [], collectibles: [], particles: [],
  scrollX: 0, levelWidth: 3000,

  // Input
  keys: {}, touchJump: false,

  // Level data
  TIPS: [
    '💡 Save 20% of your income every month to build wealth!',
    '💡 SIP in mutual funds from just ₹100/month beats inflation!',
    '💡 Emergency fund = 3–6 months of expenses. Start today!',
    '💡 Credit card debt costs 36–48% p.a. — always pay in full!',
    '💡 Invest early! ₹1000/month at 12% for 20 years = ₹9 lakhs!',
  ],

  HAZARD_TYPES: [
    { label:'EMI Trap',    emoji:'💸', color:'#E63946' },
    { label:'Impulse Buy', emoji:'🛍️', color:'#E76F51' },
    { label:'Loan Shark',  emoji:'🦈', color:'#C1121F' },
    { label:'OTP Scam',    emoji:'📲', color:'#9B2335' },
    { label:'Bad Debt',    emoji:'💳', color:'#E63946' },
  ],
  COIN_TYPES: [
    { label:'SIP',    emoji:'📈', color:'#0B6E4F', pts:10 },
    { label:'Savings',emoji:'🪙', color:'#F4A261', pts:5  },
    { label:'PPF',    emoji:'🏅', color:'#2196F3', pts:15 },
    { label:'Gold',   emoji:'🥇', color:'#FFD700', pts:20 },
  ],
};

// ── OPEN / CLOSE ──────────────────────────────────────────
function openFinanceGame() {
  document.getElementById('gameOverlay').style.display = 'flex';
  document.getElementById('gameStartScreen').style.display = 'flex';
  document.getElementById('gameOverScreen').style.display  = 'none';
  FG.canvas = document.getElementById('gameCanvas');
  FG.ctx    = FG.canvas.getContext('2d');
  resizeGameCanvas();
}
function closeFinanceGame() {
  document.getElementById('gameOverlay').style.display = 'none';
  fgStop();
}

function resizeGameCanvas() {
  const modal = FG.canvas.parentElement;
  FG.canvas.width  = modal.clientWidth  || 600;
  FG.canvas.height = 280;
}

// ── START / STOP ──────────────────────────────────────────
function startFinanceGame() {
  document.getElementById('gameStartScreen').style.display = 'none';
  document.getElementById('gameOverScreen').style.display  = 'none';
  FG.score = 0; FG.coins = 0; FG.lives = 3; FG.level = 1; FG.xpEarned = 0;
  fgUpdateHUD();
  fgBindInput();
  resizeGameCanvas();
  fgBuildLevel();
  FG.running = true;
  fgLoop();
}
function fgStop() {
  FG.running = false;
  if (FG.animId) { cancelAnimationFrame(FG.animId); FG.animId = null; }
  fgUnbindInput();
}

// ── LEVEL BUILDER ─────────────────────────────────────────
function fgBuildLevel() {
  const W = FG.canvas.width, H = FG.canvas.height;
  FG.scrollX = 0;
  FG.platforms = []; FG.hazards = []; FG.collectibles = []; FG.particles = [];

  const lvl = FG.level;
  FG.levelWidth = 2400 + lvl * 400;

  // Ground
  FG.platforms.push({ x:0, y:H-40, w:FG.levelWidth, h:40, color:'#2d6a4f' });

  // Floating platforms — more per level
  const ptCount = 8 + lvl * 2;
  for (let i = 0; i < ptCount; i++) {
    const px = 350 + i * (FG.levelWidth / ptCount);
    const py = H - 80 - Math.random() * 90;
    const pw = 80 + Math.random() * 60;
    FG.platforms.push({ x:px, y:py, w:pw, h:14, color:'#40916c' });
  }

  // Goal platform
  FG.platforms.push({ x:FG.levelWidth - 120, y:H-40, w:120, h:40, color:'#1b4332', isGoal:true });

  // Hazards
  const hCount = 4 + lvl * 2;
  for (let i = 0; i < hCount; i++) {
    const hType = FG.HAZARD_TYPES[(i + lvl) % FG.HAZARD_TYPES.length];
    const hx = 300 + (i / hCount) * (FG.levelWidth - 500) + Math.random() * 100;
    const hy = H - 40 - 32;
    FG.hazards.push({ x:hx, y:hy, w:32, h:32, ...hType,
      vx: (0.8 + lvl * 0.15) * (Math.random() > 0.5 ? 1 : -1),
      startX: hx, range: 80 + Math.random() * 60 });
  }

  // Collectible coins
  const cCount = 10 + lvl * 3;
  for (let i = 0; i < cCount; i++) {
    const cType = FG.COIN_TYPES[i % FG.COIN_TYPES.length];
    const cx = 200 + (i / cCount) * (FG.levelWidth - 300);
    const cy = H - 80 - Math.random() * 100;
    FG.collectibles.push({ x:cx, y:cy, r:14, ...cType, collected:false,
      bobOffset: Math.random() * Math.PI * 2 });
  }

  // Reset player
  FG.P.x = 80; FG.P.y = H - 80; FG.P.vy = 0; FG.P.vx = 0; FG.P.onGround = false;
}

// ── MAIN LOOP ─────────────────────────────────────────────
function fgLoop() {
  if (!FG.running) return;
  fgUpdate();
  fgDraw();
  FG.animId = requestAnimationFrame(fgLoop);
}

function fgUpdate() {
  const P = FG.P, H = FG.canvas.height;
  const t = performance.now() / 1000;

  // Input → velocity
  let moving = false;
  if (FG.keys['ArrowLeft']  || FG.keys['a']) { P.vx = -FG.SPEED; P.facing = -1; moving = true; }
  else if (FG.keys['ArrowRight'] || FG.keys['d']) { P.vx = FG.SPEED;  P.facing =  1; moving = true; }
  else P.vx *= 0.7;

  if ((FG.keys['ArrowUp'] || FG.keys['w'] || FG.keys[' '] || FG.touchJump) && P.onGround) {
    P.vy = FG.JUMP; P.onGround = false; FG.touchJump = false;
    fgSpawnParticles(P.x + P.w/2, P.y + P.h, '#40916c', 5);
  } else { FG.touchJump = false; }

  // Gravity
  P.vy += FG.GRAVITY;
  P.x  += P.vx;
  P.y  += P.vy;
  P.onGround = false;

  // Scroll camera
  const camTarget = P.x - FG.canvas.width / 3;
  FG.scrollX = Math.max(0, Math.min(camTarget, FG.levelWidth - FG.canvas.width));

  // Platform collision
  for (const pl of FG.platforms) {
    if (P.x + P.w > pl.x && P.x < pl.x + pl.w) {
      // Landing on top
      if (P.vy >= 0 && P.y + P.h >= pl.y && P.y + P.h <= pl.y + pl.h + Math.abs(P.vy) + 2) {
        P.y = pl.y - P.h; P.vy = 0; P.onGround = true;
        if (pl.isGoal) { fgLevelComplete(); return; }
      }
      // Hit bottom
      if (P.vy < 0 && P.y <= pl.y + pl.h && P.y >= pl.y) {
        P.y = pl.y + pl.h; P.vy = 0;
      }
    }
  }

  // Level bounds
  if (P.x < 0) P.x = 0;
  if (P.x + P.w > FG.levelWidth) P.x = FG.levelWidth - P.w;

  // Fall into pit
  if (P.y > H + 50) { fgLoseLife(); return; }

  // Move hazards
  for (const h of FG.hazards) {
    h.x += h.vx;
    if (Math.abs(h.x - h.startX) > h.range) h.vx *= -1;
    // Collision with player
    if (P.x < h.x+h.w && P.x+P.w > h.x && P.y < h.y+h.h && P.y+P.h > h.y) {
      fgLoseLife(); return;
    }
  }

  // Collect coins
  for (const c of FG.collectibles) {
    if (c.collected) continue;
    c.y = c.y + Math.sin(t * 3 + c.bobOffset) * 0.3; // bob
    const dx = (P.x + P.w/2) - c.x, dy = (P.y + P.h/2) - c.y;
    if (Math.sqrt(dx*dx + dy*dy) < c.r + 18) {
      c.collected = true;
      FG.score += c.pts; FG.coins++;
      fgSpawnParticles(c.x, c.y, c.color, 8);
      fgUpdateHUD();
      fgShowFloatingText(c.emoji + '+' + c.pts, c.x - FG.scrollX, c.y);
    }
  }

  // Update particles
  FG.particles = FG.particles.filter(p => p.life > 0);
  FG.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--; });
}

// ── DRAW ──────────────────────────────────────────────────
function fgDraw() {
  const ctx = FG.ctx, W = FG.canvas.width, H = FG.canvas.height;
  const sx = FG.scrollX;

  // Sky gradient
  const sky = ctx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#1a1a3e'); sky.addColorStop(1,'#0b6e4f');
  ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);

  // Stars (parallax)
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 30; i++) {
    const sx2 = ((i * 137 + 50) % W);
    const sy2 = ((i * 97)  % (H*0.6));
    ctx.fillRect(sx2 - (FG.scrollX * 0.1) % W, sy2, 2, 2);
  }

  ctx.save(); ctx.translate(-sx, 0);

  // Platforms
  for (const pl of FG.platforms) {
    if (pl.x + pl.w < sx || pl.x > sx + W) continue;
    ctx.fillStyle = pl.isGoal ? '#ffd700' : pl.color;
    ctx.beginPath();
    ctx.roundRect(pl.x, pl.y, pl.w, pl.h, pl.isGoal ? 6 : 4);
    ctx.fill();
    if (pl.isGoal) {
      ctx.fillStyle = '#1a1a3e'; ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏁 FINISH', pl.x + pl.w/2, pl.y + 26);
    }
  }

  // Collectibles
  const t = performance.now() / 1000;
  for (const c of FG.collectibles) {
    if (c.collected) continue;
    if (c.x < sx - 30 || c.x > sx + W + 30) continue;
    // Glow
    ctx.save();
    ctx.shadowColor = c.color; ctx.shadowBlur = 12;
    ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(c.emoji, c.x, c.y + 8);
    ctx.restore();
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 9px Poppins,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c.label, c.x, c.y + 22);
  }

  // Hazards
  for (const h of FG.hazards) {
    if (h.x + h.w < sx || h.x > sx + W) continue;
    // Shadow
    ctx.save();
    ctx.shadowColor = h.color; ctx.shadowBlur = 14;
    ctx.font = '26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(h.emoji, h.x + h.w/2, h.y + 26);
    ctx.restore();
    // Label
    ctx.fillStyle = '#ffccd5'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(h.label, h.x + h.w/2, h.y - 4);
  }

  // Player
  const P = FG.P;
  ctx.save();
  ctx.translate(P.x + P.w/2, P.y + P.h/2);
  if (P.facing < 0) ctx.scale(-1,1);
  ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🧑‍💼', 0, 0);
  ctx.restore();

  // Particles
  for (const p of FG.particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore(); // undo scroll translate

  // HUD overlay: progress bar
  const progress = Math.min(FG.P.x / (FG.levelWidth - 100), 1);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(10,10,W-20,8);
  const pg = ctx.createLinearGradient(10,0,W-10,0);
  pg.addColorStop(0,'#0B6E4F'); pg.addColorStop(1,'#F4A261');
  ctx.fillStyle = pg; ctx.fillRect(10,10,(W-20)*progress,8);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('Progress →', 14, 24);

  // Floating texts
  if (FG._floats) {
    FG._floats = FG._floats.filter(f => f.life > 0);
    for (const f of FG._floats) {
      ctx.globalAlpha = f.life / 40;
      ctx.fillStyle = '#FFD700'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y - (40 - f.life));
      f.life--;
    }
    ctx.globalAlpha = 1;
  }
}

// ── HELPERS ───────────────────────────────────────────────
function fgSpawnParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    FG.particles.push({
      x, y, color, r: 3 + Math.random()*3,
      vx: Math.cos(angle) * (2 + Math.random()*2),
      vy: Math.sin(angle) * (2 + Math.random()*2) - 2,
      life: 30, maxLife: 30,
    });
  }
}

function fgShowFloatingText(text, x, y) {
  if (!FG._floats) FG._floats = [];
  FG._floats.push({ text, x, y, life: 40 });
}

function fgUpdateHUD() {
  const set = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  set('gameScore', FG.score);
  set('gameLives', FG.lives);
  set('gameLevel', FG.level);
  set('gameCoins', FG.coins);
}

function fgLoseLife() {
  FG.lives--;
  fgUpdateHUD();
  fgSpawnParticles(FG.P.x + FG.P.w/2, FG.P.y + FG.P.h/2, '#E63946', 12);
  if (FG.lives <= 0) {
    fgGameOver(false);
  } else {
    // Respawn
    FG.P.x = 80; FG.P.y = 100; FG.P.vy = 0;
    fgShowTip('❤️ Life lost! ' + (FG.HAZARD_TYPES[FG.level % FG.HAZARD_TYPES.length].label) + ' is dangerous!');
  }
}

function fgLevelComplete() {
  fgStop();
  const tip = FG.TIPS[(FG.level - 1) % FG.TIPS.length];
  const xp = FG.level * 15 + FG.coins * 2;
  FG.xpEarned += xp;

  // Award XP to the Finora app
  if (typeof wAddXP === 'function') wAddXP(xp);
  else if (typeof addXP === 'function') addXP(xp);

  fgShowTip(tip, () => {
    FG.level++;
    fgUpdateHUD();
    fgBuildLevel();
    FG.running = true;
    fgLoop();
  });
}

function fgGameOver(won) {
  fgStop();
  document.getElementById('gameOverScreen').style.display = 'flex';
  const xp = Math.floor(FG.score / 2);
  if (typeof wAddXP === 'function') wAddXP(xp);
  else if (typeof addXP === 'function') addXP(xp);
  document.getElementById('goEmoji').textContent = won ? '🎉' : '😵';
  document.getElementById('goTitle').textContent = won ? 'You Win!' : 'Game Over!';
  document.getElementById('goMsg').textContent   = `Score: ${FG.score} · Coins: ${FG.coins} · Level ${FG.level}`;
  document.getElementById('goXP').textContent    = `+${xp} XP Earned!`;
}

// ── TIP POPUP ─────────────────────────────────────────────
let _tipCallback = null;
function fgShowTip(msg, cb) {
  _tipCallback = cb || null;
  const el = document.getElementById('gameTip');
  if (el) {
    el.textContent = msg;
    el.classList.add('tip-flash');
    setTimeout(() => {
      el.classList.remove('tip-flash');
      if (_tipCallback) { _tipCallback(); _tipCallback = null; }
    }, 2200);
  } else { if (cb) cb(); }
}

// ── INPUT ─────────────────────────────────────────────────
function _fgKeyDown(e) { FG.keys[e.key] = true; if([' ','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault(); }
function _fgKeyUp(e)   { FG.keys[e.key] = false; }
function _fgTouchStart(e) { e.preventDefault(); FG.touchJump = true; }
function _fgTouchRight(e) { e.preventDefault(); FG.keys['ArrowRight'] = true; }
function _fgTouchLeft(e)  { e.preventDefault(); FG.keys['ArrowLeft']  = true; }
function _fgTouchEnd(e)   { e.preventDefault(); FG.keys['ArrowRight'] = FG.keys['ArrowLeft'] = false; }

function fgBindInput() {
  window.addEventListener('keydown', _fgKeyDown);
  window.addEventListener('keyup',   _fgKeyUp);
  if (FG.canvas) {
    FG.canvas.addEventListener('touchstart', _fgTouchStart, { passive:false });
    FG.canvas.addEventListener('click', () => { if (FG.P.onGround) FG.P.vy = FG.JUMP; });
  }
}
function fgUnbindInput() {
  window.removeEventListener('keydown', _fgKeyDown);
  window.removeEventListener('keyup',   _fgKeyUp);
  FG.keys = {};
}

// ── Mobile auth functions (for index.html / app.js) ───────
const M_DEMO_EMAIL = 'demo@finora.in';
const M_DEMO_PASS  = 'finora123';
const M_DEMO_NAME  = 'Demo User';

function mDoLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value.trim();
  const err   = document.getElementById('loginError');
  if (email === M_DEMO_EMAIL && pass === M_DEMO_PASS) {
    err.style.display = 'none';
    const lp = document.getElementById('loginPage');
    lp.style.transition = 'opacity .4s'; lp.style.opacity = '0';
    setTimeout(() => {
      lp.style.display = 'none';
      const app = document.getElementById('app');
      app.style.display = 'flex'; app.style.opacity = '0';
      app.style.transition = 'opacity .4s';
      setTimeout(() => app.style.opacity = '1', 50);
      const ini = M_DEMO_NAME.split(' ').map(w=>w[0]).join('').toUpperCase();
      const el1 = document.getElementById('mProfileInitials');
      const el2 = document.getElementById('mAcctInitialsLg');
      if (el1) el1.textContent = ini;
      if (el2) el2.textContent = ini;
      const n = document.getElementById('mAcctName');     if(n) n.textContent = M_DEMO_NAME;
      const e = document.getElementById('mAcctEmail');    if(e) e.textContent = M_DEMO_EMAIL;
      const nv= document.getElementById('mAcctNameVal');  if(nv) nv.textContent = M_DEMO_NAME;
      const ev= document.getElementById('mAcctEmailVal'); if(ev) ev.textContent = M_DEMO_EMAIL;
    }, 400);
  } else {
    err.style.display = 'block';
    const card = document.querySelector('.login-card');
    if (card) { card.style.animation='loginShake .3s ease'; setTimeout(()=>card.style.animation='',400); }
  }
}

function mDoLogout() {
  mCloseSettings();
  const app = document.getElementById('app');
  if (!app) return;
  app.style.transition = 'opacity .3s'; app.style.opacity = '0';
  setTimeout(() => {
    app.style.display = 'none';
    const lp = document.getElementById('loginPage');
    if (!lp) return;
    lp.style.display = 'flex'; lp.style.opacity = '0';
    lp.style.transition = 'opacity .4s';
    setTimeout(() => lp.style.opacity = '1', 50);
  }, 300);
}

function mTogglePass() {
  const p = document.getElementById('loginPass');
  p.type = p.type === 'password' ? 'text' : 'password';
  const btn = document.getElementById('mEyeBtn');
  if (btn) btn.textContent = p.type === 'password' ? '👁️' : '🙈';
}

function mToggleSettings() {
  const ov = document.getElementById('mAccountOverlay');
  if (!ov) return;
  // Update live stats
  const xpEl = document.getElementById('mAcctXpVal');
  const lsEl = document.getElementById('mAcctLessonsVal');
  if (xpEl && typeof STATE !== 'undefined') xpEl.textContent = `${STATE.xp} XP · Level ${STATE.level}`;
  if (lsEl && typeof STATE !== 'undefined') lsEl.textContent = STATE.completedLessons.size;
  ov.classList.toggle('open');
}

function mCloseSettings(e) {
  const ov = document.getElementById('mAccountOverlay');
  if (!ov) return;
  if (e && e.target !== ov) return;
  ov.classList.remove('open');
}

function mToggleDark() {
  document.documentElement.classList.toggle('dark-mode');
}

// ── Boot: attach Enter key to login (runs once DOM is ready) ─
document.addEventListener('DOMContentLoaded', () => {
  const lp = document.getElementById('loginPass');
  const le = document.getElementById('loginEmail');
  if (lp) lp.addEventListener('keydown', e => { if(e.key==='Enter') mDoLogin(); });
  if (le) le.addEventListener('keydown', e => { if(e.key==='Enter') mDoLogin(); });
});
