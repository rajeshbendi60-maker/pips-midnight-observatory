/**
 * script.js — Pip's Midnight Observatory
 * haX.baby — Baby's First Website Hackathon, Track 1
 *
 * Sections:
 *  1. Utilities
 *  2. Starfield (canvas)
 *  3. Sparkle cursor trail
 *  4. Navigation
 *  5. Visitor counter
 *  6. Status messages (hero + Pip bio)
 *  7. Lullaby Lab (Web Audio API)
 *  8. Dream Nightlight
 *  9. Dream Delivery Map
 * 10. Origin Story (scene navigation)
 * 11. Guestbook (LocalStorage)
 * 12. Easter Egg (constellation)
 * 13. Theme toggle (day/night)
 * 14. Click sounds + mute
 * 15. Keyboard / accessibility helpers
 * 16. Init
 */

'use strict';

/* ============================================================
   1. UTILITIES
   ============================================================ */

function $(id) { return document.getElementById(id); }
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function formatNum(n) {
  return String(n).padStart(6, '0');
}

/* ============================================================
   2. STARFIELD CANVAS
   ============================================================ */

function initStarfield() {
  const canvas = $('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let raf;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createStars(n) {
    stars = [];
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.2,
        opacity: Math.random(),
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const op = 0.3 + 0.7 * Math.abs(Math.sin(ts * s.speed + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 184, 240, ${op})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resize();
  createStars(prefersReducedMotion ? 40 : 120);

  if (prefersReducedMotion) {
    // Draw once, no animation
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 184, 240, ${0.5 + s.opacity * 0.5})`;
      ctx.fill();
    });
  } else {
    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    createStars(prefersReducedMotion ? 40 : 120);
  });
}

/* ============================================================
   3. SPARKLE CURSOR TRAIL
   ============================================================ */

function initSparkleTrail() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const canvas = $('sparkle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const particles = [];
  let mouse = { x: -1000, y: -1000 };
  let raf;

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    // Cap max particles to prevent any potential memory leak
    if (particles.length < 45) {
      for (let i = 0; i < 2; i++) {
        spawnParticle(mouse.x, mouse.y);
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      particles.length = 0;
    }
  });

  function spawnParticle(x, y) {
    const colors = ['#C8B8F0', '#FFC875', '#F4A7C8', '#9FD8F2', '#ffffff'];
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 1) * 2,
      r: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: Math.random() * 0.03 + 0.02,
    });
  }

  function drawSparkles(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(drawSparkles);
  }

  raf = requestAnimationFrame(drawSparkles);
}

/* ============================================================
   4. NAVIGATION
   ============================================================ */

function initNav() {
  const hamburger = $('nav-hamburger');
  const mobileNav = $('mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    mobileNav.hidden = expanded;
  });

  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Active section scrollspy for desktop navigation
  const navLinks = qsa('.nav-links a');
  const sectionIds = ['meet-pip', 'projects', 'story', 'guestbook'];
  const sections = sectionIds.map(id => $(id)).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
              const href = link.getAttribute('href');
              link.classList.toggle('active', href === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );
    sections.forEach(s => observer.observe(s));
  }
}

/* ============================================================
   5. VISITOR COUNTER
   ============================================================ */

function initVisitorCounter() {
  const el = $('visitor-count');
  if (!el) return;

  let count = parseInt(localStorage.getItem('pmo_visits') || '0', 10);
  count++;
  try {
    localStorage.setItem('pmo_visits', String(count));
  } catch (e) {}

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderOdometer(n) {
    const formatted = String(n).padStart(6, '0');
    el.innerHTML = formatted
      .split('')
      .map(d => `<span class="odometer-digit" aria-hidden="true">${d}</span>`)
      .join('');
    el.setAttribute('aria-label', `${n} local dream visits in this browser`);
  }

  if (prefersReducedMotion) {
    renderOdometer(count);
    return;
  }

  // Animate counter to genuine local visit count
  const target = count;
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 25));

  function tick() {
    current = Math.min(current + step, target);
    renderOdometer(current);
    if (current < target) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   6. STATUS MESSAGES
   ============================================================ */

const heroStatuses = [
  'Pip is currently brewing dreams ✨',
  'Pip is polishing the moon 🌙',
  'Pip is sorting tonight\'s deliveries 📦',
  'Pip is composing a lullaby 🎵',
  'Pip is checking the star charts ⭐',
  'Pip is refilling the lantern 🏮',
  'Pip is napping on a cloud ☁',
];

const pipStatuses = [
  '😴 Currently napping between dream deliveries...',
  '🎵 Humming a new lullaby to myself...',
  '🔭 Studying tonight\'s constellation map...',
  '⭐ Catching falling stars for later use...',
  '🏮 Adjusting the lantern to maximum dreaminess...',
  '📜 Writing in my Dream Engineer logbook...',
  '☁ Fluffy cloud inspection in progress...',
  '🌙 Having a deep philosophical chat with the moon...',
];

function initStatusMessages() {
  const statusText = $('status-text');
  if (statusText) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % heroStatuses.length;
      statusText.style.opacity = '0';
      setTimeout(() => {
        statusText.textContent = heroStatuses[i];
        statusText.style.opacity = '1';
      }, 300);
    }, 5000);
    statusText.style.transition = 'opacity 0.3s';
  }

  const pipStatusBtn = $('pip-status-btn');
  const pipStatusMsg = $('pip-status-msg');
  if (pipStatusBtn && pipStatusMsg) {
    let idx = 0;
    pipStatusBtn.addEventListener('click', () => {
      idx = (idx + 1) % pipStatuses.length;
      pipStatusMsg.textContent = pipStatuses[idx];
      pipStatusBtn.classList.add('bounced');
      setTimeout(() => pipStatusBtn.classList.remove('bounced'), 300);
      playClickSound();
    });
  }
}

/* ============================================================
   7. LULLABY LAB — Web Audio API
   ============================================================ */

let audioCtx = null;
let isMuted = false;
let masterVolume = 0.5;
let melodyNotes = []; // Array of {freq, label}
let melodyPlaying = false;
let melodyOscillators = [];
let melodyTimeouts = [];

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq, duration = 0.45, vol = 0.4) {
  if (isMuted) return null;
  const ctx = getAudioCtx();
  if (!ctx) return null;
  if (ctx.state === 'suspended') ctx.resume();

  const t = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const harmonicGain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, t);

  // Soft overtone an octave above for music-box chime bell sound
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2, t);

  harmonicGain.gain.setValueAtTime(0.2, t);

  osc1.connect(gainNode);
  osc2.connect(harmonicGain);
  harmonicGain.connect(gainNode);
  gainNode.connect(ctx.destination);

  const actualVol = vol * masterVolume;
  gainNode.gain.setValueAtTime(0.0001, t);
  gainNode.gain.linearRampToValueAtTime(actualVol, t + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + duration + 0.05);
  osc2.stop(t + duration + 0.05);

  osc1.onended = () => {
    try {
      osc1.disconnect();
      osc2.disconnect();
      harmonicGain.disconnect();
      gainNode.disconnect();
    } catch (e) {}
  };

  return { osc: osc1, gainNode };
}

let lastClickSoundTime = 0;
function playClickSound() {
  if (isMuted) return;
  const now = performance.now();
  if (now - lastClickSoundTime < 65) return; // Prevent distortion on rapid clicks
  lastClickSoundTime = now;
  playTone(880, 0.07, 0.06);
}

function initUiClickSounds() {
  document.addEventListener('click', e => {
    const interactive = e.target.closest('button, a.btn, .note-pad, .preset-btn, .mode-btn, .tracker-dot, .scene-tab, .scene-dot, .hint-star, .map-destination');
    if (interactive && !interactive.id?.includes('mute-btn')) {
      playClickSound();
    }
  });
}

function stopMelody() {
  melodyTimeouts.forEach(t => clearTimeout(t));
  melodyTimeouts = [];
  melodyPlaying = false;
  qsa('.note-pad.playing').forEach(p => p.classList.remove('playing'));
  qsa('.melody-note-chip.active-playing').forEach(c => c.classList.remove('active-playing'));
  const stopBtn = $('stop-melody-btn');
  const playBtn = $('play-melody-btn');
  if (stopBtn) stopBtn.disabled = true;
  if (playBtn) playBtn.disabled = melodyNotes.length === 0;
  const feedback = $('lullaby-feedback');
  if (feedback && feedback.textContent.startsWith('▶')) feedback.textContent = '';
}

function initLullabyLab() {
  const notePads = qsa('.note-pad');
  const playBtn = $('play-melody-btn');
  const stopBtn = $('stop-melody-btn');
  const clearBtn = $('clear-melody-btn');
  const melodyDisplay = $('melody-display');
  const feedbackEl = $('lullaby-feedback');
  const volumeSlider = $('melody-volume');
  const audioFallback = $('audio-fallback');

  // Check audio support
  if (!window.AudioContext && !window.webkitAudioContext) {
    if (audioFallback) audioFallback.hidden = false;
    notePads.forEach(b => b.disabled = true);
    if (playBtn) playBtn.disabled = true;
    return;
  }

  // Presets definition (using notes available on pads)
  const lullabyPresets = {
    'sleepy-moon': [
      { freq: 261.63, label: 'Do' },
      { freq: 329.63, label: 'Mi' },
      { freq: 392.00, label: 'Sol' },
      { freq: 523.25, label: 'Do♪' },
      { freq: 440.00, label: 'La' },
      { freq: 392.00, label: 'Sol' },
      { freq: 329.63, label: 'Mi' },
      { freq: 261.63, label: 'Do' }
    ],
    'twinkle-cloud': [
      { freq: 261.63, label: 'Do' },
      { freq: 261.63, label: 'Do' },
      { freq: 392.00, label: 'Sol' },
      { freq: 392.00, label: 'Sol' },
      { freq: 440.00, label: 'La' },
      { freq: 440.00, label: 'La' },
      { freq: 392.00, label: 'Sol' }
    ],
    'starfall': [
      { freq: 523.25, label: 'Do♪' },
      { freq: 493.88, label: 'Si' },
      { freq: 440.00, label: 'La' },
      { freq: 392.00, label: 'Sol' },
      { freq: 349.23, label: 'Fa' },
      { freq: 329.63, label: 'Mi' },
      { freq: 293.66, label: 'Re' },
      { freq: 261.63, label: 'Do' }
    ]
  };

  const presetBtns = qsa('.preset-btn');
  function clearActivePresets() {
    presetBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (!lullabyPresets[presetKey]) return;
      stopMelody();
      clearActivePresets();
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      melodyNotes = lullabyPresets[presetKey].map(n => ({ ...n }));
      updateMelodyDisplay();
      if (feedbackEl) {
        const names = {
          'sleepy-moon': '🌙 Loaded "Sleepy Moon" lullaby! Press Play to hear.',
          'twinkle-cloud': '☁️ Loaded "Twinkle Cloud" lullaby! Press Play to hear.',
          'starfall': '⭐ Loaded "Starfall" lullaby! Press Play to hear.'
        };
        feedbackEl.textContent = names[presetKey] || '✨ Preset loaded!';
      }
      playClickSound();
    });
  });

  function updateMelodyDisplay() {
    if (!melodyDisplay) return;
    if (melodyNotes.length === 0) {
      melodyDisplay.innerHTML = '<span class="melody-placeholder">Your melody will appear here...</span>';
    } else {
      melodyDisplay.innerHTML = melodyNotes
        .map(n => `<span class="melody-note-chip">${n.label}</span>`)
        .join('');
    }
    if (playBtn) playBtn.disabled = melodyNotes.length === 0;
  }

  notePads.forEach(pad => {
    pad.addEventListener('click', () => {
      // If a melody is currently playing, stop it so manual notes do not collide
      if (melodyPlaying) {
        stopMelody();
      }

      // Auto-unmute on deliberate instrument play
      if (isMuted) {
        const muteBtn = $('mute-btn');
        if (muteBtn) muteBtn.click();
      }

      const freq = parseFloat(pad.dataset.freq);
      const label = pad.dataset.label;

      // Visual feedback
      pad.classList.add('playing');
      setTimeout(() => pad.classList.remove('playing'), 400);

      // Play the tone
      playTone(freq, 0.5, 0.4);

      // Add to melody
      if (melodyNotes.length < 24) {
        clearActivePresets();
        melodyNotes.push({ freq, label });
        updateMelodyDisplay();
        if (feedbackEl) {
          const msgs = [
            `✨ Beautiful ${label}!`,
            `🌙 A dream is taking shape...`,
            `⭐ Pip loves that note!`,
            `🎵 Keep going!`,
            `✨ ${label} sounds magical.`,
          ];
          feedbackEl.textContent = msgs[Math.floor(Math.random() * msgs.length)];
        }
      } else {
        if (feedbackEl) feedbackEl.textContent = '🌟 Melody complete! Press Play to hear it.';
      }
    });

    // Keyboard support: space/enter
    pad.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        pad.click();
      }
    });
  });

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (melodyNotes.length === 0) return;
      if (isMuted) {
        const muteBtn = $('mute-btn');
        if (muteBtn) muteBtn.click();
      }
      stopMelody();
      melodyPlaying = true;
      playBtn.disabled = true;
      stopBtn.disabled = false;
      if (feedbackEl) feedbackEl.textContent = '▶ Playing your lullaby...';

      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      melodyNotes.forEach((note, i) => {
        const t = setTimeout(() => {
          if (!melodyPlaying) return;
          playTone(note.freq, 0.48, 0.45);
          // Highlight pad
          const matchingPad = qsa('.note-pad').find(p => parseFloat(p.dataset.freq) === note.freq);
          if (matchingPad) {
            matchingPad.classList.add('playing');
            setTimeout(() => matchingPad.classList.remove('playing'), 400);
          }
          // Highlight active note chip
          const chips = qsa('.melody-note-chip', melodyDisplay);
          if (chips[i]) {
            chips[i].classList.add('active-playing');
            setTimeout(() => chips[i].classList.remove('active-playing'), 450);
          }
        }, i * 500);
        melodyTimeouts.push(t);
      });

      // End of melody
      const endTimeout = setTimeout(() => {
        if (feedbackEl) feedbackEl.textContent = '🌙 Sweet dreams! Your melody was beautiful.';
        stopMelody();
      }, melodyNotes.length * 500 + 600);
      melodyTimeouts.push(endTimeout);
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopMelody();
      if (feedbackEl) feedbackEl.textContent = '⏹ Paused. Press Play to listen again.';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      stopMelody();
      clearActivePresets();
      melodyNotes = [];
      updateMelodyDisplay();
      if (feedbackEl) feedbackEl.textContent = '';
      if (playBtn) playBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = true;
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      masterVolume = parseFloat(volumeSlider.value);
    });
  }

  updateMelodyDisplay();
}

/* ============================================================
   8. DREAM NIGHTLIGHT
   ============================================================ */

const nightlightModes = {
  midnight: {
    moon: '🌑',
    svg: `<svg class="nl-focal-svg nl-focal-moon-midnight" viewBox="0 0 120 120" width="86" height="86" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cratered midnight moon">
      <defs>
        <radialGradient id="nl-mid-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f5f3ff" stop-opacity="0.9"/>
          <stop offset="45%" stop-color="#c4b5fd" stop-opacity="0.75"/>
          <stop offset="75%" stop-color="#8b5cf6" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#6d28d9" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="nl-mid-moon-surf" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#f5f3ff"/>
          <stop offset="65%" stop-color="#ddd6fe"/>
          <stop offset="100%" stop-color="#a78bfa"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#nl-mid-glow)"/>
      <circle cx="60" cy="60" r="35" fill="url(#nl-mid-moon-surf)"/>
      <ellipse cx="49" cy="50" rx="6" ry="5" fill="#8b5cf6" opacity="0.35"/>
      <circle cx="69" cy="45" r="4.5" fill="#8b5cf6" opacity="0.3"/>
      <ellipse cx="65" cy="70" rx="8" ry="6" fill="#8b5cf6" opacity="0.28"/>
      <circle cx="46" cy="69" r="3.2" fill="#8b5cf6" opacity="0.25"/>
      <circle cx="76" cy="60" r="2.2" fill="#8b5cf6" opacity="0.22"/>
    </svg>`,
    message: 'Midnight blue — the hour of the deepest dreams.',
    stars: '★ ✦ ✧ ★ ✦ ✧ ★',
    starColor: '#d8b4fe',
    className: 'mode-midnight',
  },
  moonrise: {
    moon: '🌕',
    svg: `<svg class="nl-focal-svg nl-focal-moon-moonrise" viewBox="0 0 140 140" width="98" height="98" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Golden full moonrise">
      <defs>
        <radialGradient id="nl-mr-outer-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fde047" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="#fb923c" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="#ec4899" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="nl-mr-body" cx="40%" cy="36%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#fffbeb"/>
          <stop offset="65%" stop-color="#fde047"/>
          <stop offset="95%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill="url(#nl-mr-outer-halo)"/>
      <circle cx="70" cy="70" r="50" fill="#fde047" opacity="0.3"/>
      <circle cx="70" cy="70" r="38" fill="url(#nl-mr-body)"/>
      <ellipse cx="61" cy="59" rx="7" ry="5.5" fill="#d97706" opacity="0.3"/>
      <circle cx="78" cy="55" r="5" fill="#d97706" opacity="0.25"/>
      <ellipse cx="73" cy="80" rx="9" ry="7" fill="#d97706" opacity="0.25"/>
      <circle cx="56" cy="79" r="3.5" fill="#d97706" opacity="0.22"/>
    </svg>`,
    message: 'Full moonrise — a night bright enough to read dreams by.',
    stars: '★ ✦ ✧ ★ ✦',
    starColor: '#fde047',
    className: 'mode-moonrise',
  },
  aurora: {
    moon: '🌌',
    svg: `<svg class="nl-focal-svg nl-focal-svg-aurora-panoramic" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alpine mountain peak under swirling aurora borealis with lake reflection">
      <defs>
        <!-- Deep starry sky gradient -->
        <linearGradient id="aurora-sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#020912"/>
          <stop offset="30%" stop-color="#041520"/>
          <stop offset="65%" stop-color="#07222c"/>
          <stop offset="100%" stop-color="#061822"/>
        </linearGradient>

        <!-- Aurora swirling ribbon gradients -->
        <linearGradient id="aurora-swirl-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.15"/>
          <stop offset="25%" stop-color="#34d399" stop-opacity="0.85"/>
          <stop offset="50%" stop-color="#bbf7d0" stop-opacity="0.95"/>
          <stop offset="75%" stop-color="#20c0b8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1"/>
        </linearGradient>

        <linearGradient id="aurora-swirl-center" x1="0%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.15"/>
          <stop offset="30%" stop-color="#10b981" stop-opacity="0.9"/>
          <stop offset="55%" stop-color="#a7f3d0" stop-opacity="0.98"/>
          <stop offset="80%" stop-color="#34d399" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#059669" stop-opacity="0.2"/>
        </linearGradient>

        <linearGradient id="aurora-swirl-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#20c0b8" stop-opacity="0.1"/>
          <stop offset="35%" stop-color="#34d399" stop-opacity="0.85"/>
          <stop offset="60%" stop-color="#bbf7d0" stop-opacity="0.95"/>
          <stop offset="85%" stop-color="#10b981" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="#0f766e" stop-opacity="0"/>
        </linearGradient>

        <!-- Warm right horizon twilight glow -->
        <radialGradient id="aurora-dusk-glow" cx="88%" cy="65%" r="45%">
          <stop offset="0%" stop-color="#fed7aa" stop-opacity="0.85"/>
          <stop offset="40%" stop-color="#fb923c" stop-opacity="0.45"/>
          <stop offset="75%" stop-color="#f43f5e" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <!-- Mountain right side warm lighting -->
        <linearGradient id="mnt-right-sun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="25%" stop-color="#fbbf24"/>
          <stop offset="55%" stop-color="#d97706"/>
          <stop offset="80%" stop-color="#92400e"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>

        <!-- Mountain left shadowed face -->
        <linearGradient id="mnt-left-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="30%" stop-color="#1e293b"/>
          <stop offset="70%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#090e17"/>
        </linearGradient>

        <!-- Mountain snow highlights -->
        <linearGradient id="mnt-snow-teal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#e0f2fe"/>
          <stop offset="80%" stop-color="#a7f3d0"/>
          <stop offset="100%" stop-color="#6ee7b7"/>
        </linearGradient>

        <!-- Alpine grassy base -->
        <linearGradient id="mnt-base-grass" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#15803d"/>
          <stop offset="50%" stop-color="#166534"/>
          <stop offset="100%" stop-color="#0f3d1f"/>
        </linearGradient>

        <!-- Lake water gradient -->
        <linearGradient id="aurora-lake-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#061c24"/>
          <stop offset="25%" stop-color="#082b36"/>
          <stop offset="60%" stop-color="#06222c"/>
          <stop offset="100%" stop-color="#020e14"/>
        </linearGradient>

        <!-- Lake reflection emerald glow -->
        <radialGradient id="lake-aurora-refl" cx="50%" cy="30%" r="55%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.85"/>
          <stop offset="35%" stop-color="#10b981" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>

        <!-- Star flare glow filter -->
        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- 1. Sky & Twinkling Stars -->
      <rect width="700" height="275" fill="url(#aurora-sky-grad)"/>
      <g fill="#ffffff" opacity="0.85">
        <circle cx="45" cy="45" r="1.2"/>
        <circle cx="85" cy="25" r="1"/>
        <circle cx="120" cy="70" r="1.5"/>
        <circle cx="190" cy="35" r="1.2"/>
        <circle cx="230" cy="80" r="0.9"/>
        <circle cx="275" cy="40" r="1.4"/>
        <circle cx="370" cy="30" r="1"/>
        <circle cx="420" cy="65" r="1.3"/>
        <circle cx="460" cy="20" r="1.5"/>
        <circle cx="510" cy="75" r="1"/>
        <circle cx="580" cy="35" r="1.2"/>
        <circle cx="630" cy="60" r="1.4"/>
        <circle cx="665" cy="25" r="1"/>
        <circle cx="160" cy="115" r="1"/>
        <circle cx="540" cy="110" r="1.2"/>
      </g>

      <!-- 2. Warm Twilight Glow on Far Right Horizon -->
      <rect x="460" y="160" width="240" height="115" fill="url(#aurora-dusk-glow)" opacity="0.85"/>

      <!-- 3. Sweeping Curving Aurora Ribbons (Live CSS animated) -->
      <g class="aurora-swirls-group">
        <!-- Left ribbon cascading down -->
        <path class="aurora-ribbon r-left" d="M -30,-20 C 50,40 100,100 180,140 C 230,165 270,175 300,180 C 260,170 190,130 130,80 C 70,30 20,-10 -30,-20 Z" fill="url(#aurora-swirl-left)"/>
        
        <!-- Center overhead swirl loop -->
        <path class="aurora-ribbon r-center" d="M 120,-30 C 240,60 360,80 480,40 C 580,0 650,-20 720,-30 C 620,30 490,110 370,105 C 260,100 180,40 120,-30 Z" fill="url(#aurora-swirl-center)"/>
        
        <!-- Right grand spiral ribbon -->
        <path class="aurora-ribbon r-right" d="M 730,10 C 620,80 540,140 430,175 C 375,190 350,185 340,180 C 410,165 500,120 590,60 C 670,5 710,-10 730,10 Z" fill="url(#aurora-swirl-right)"/>
        
        <!-- Soft vertical striation rays -->
        <g class="aurora-curtain-rays" opacity="0.6">
          <path d="M 160,30 L 165,110 M 210,45 L 215,130 M 270,60 L 272,145 M 390,75 L 388,150 M 440,65 L 436,140 M 500,45 L 495,125 M 560,35 L 552,115" stroke="rgba(167, 243, 208, 0.75)" stroke-width="2.5" stroke-dasharray="4 3"/>
        </g>
      </g>

      <!-- 4. Bright North Star directly above summit -->
      <g class="aurora-north-star">
        <circle cx="318" cy="92" r="18" fill="#34d399" opacity="0.3" filter="url(#star-glow)"/>
        <circle cx="318" cy="92" r="7" fill="#bbf7d0" opacity="0.75"/>
        <path d="M 318,72 L 319.5,90.5 L 338,92 L 319.5,93.5 L 318,112 L 316.5,93.5 L 298,92 L 316.5,90.5 Z" fill="#ffffff" filter="url(#star-glow)"/>
        <circle cx="318" cy="92" r="2.5" fill="#ffffff"/>
      </g>

      <!-- 5. Flanking Mountain Ridges Left & Right -->
      <!-- Left secondary peaks -->
      <polygon points="-10,275 -10,245 45,228 90,245 135,220 185,245 235,260 250,275" fill="#1e293b"/>
      <path d="M 45,228 L 65,240 M 135,220 L 155,235" stroke="#bae6fd" stroke-width="2.5" fill="none" opacity="0.9"/>

      <!-- Right secondary peaks -->
      <polygon points="460,275 490,250 535,232 580,248 630,225 680,245 710,255 710,275" fill="#2d1b28"/>
      <path d="M 535,232 L 555,245 M 630,225 L 650,240" stroke="#fed7aa" stroke-width="2.5" fill="none" opacity="0.9"/>

      <!-- 6. Iconic Central Pyramidal Alpine Peak (Matterhorn / Assiniboine) -->
      <!-- Left shadowed facet -->
      <polygon points="350,138 341,162 345,172 334,196 318,212 285,236 245,255 210,268 175,275 370,275 368,265 357,215 349,185 352,165" fill="url(#mnt-left-shadow)"/>
      <!-- Right illuminated golden facet -->
      <polygon points="350,138 352,165 349,185 357,215 362,240 368,265 370,275 520,275 485,264 442,246 406,224 380,202 358,178 362,166" fill="url(#mnt-right-sun)"/>

      <!-- Snow gullies & sharp couloir ridges -->
      <path d="M 350,138 L 347,155 L 338,175 L 342,185 L 330,210 L 336,222 L 312,242 L 318,252 L 295,268" stroke="url(#mnt-snow-teal)" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.95"/>
      <path d="M 349,185 L 354,205 L 348,225 L 353,245 L 340,265" stroke="url(#mnt-snow-teal)" stroke-width="3" fill="none" opacity="0.9"/>
      <path d="M 350,138 L 358,162 L 355,178 L 372,205 L 375,225 L 398,245" stroke="#fef9c3" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>

      <!-- Alpine grassy meadow slopes at base -->
      <path d="M 220,265 Q 290,250 365,252 Q 440,250 510,266 L 520,275 L 205,275 Z" fill="url(#mnt-base-grass)"/>

      <!-- 7. Glassy Glacial Lake & Water Reflection -->
      <!-- Lake surface base -->
      <rect x="0" y="275" width="700" height="145" fill="url(#aurora-lake-grad)"/>

      <!-- Reflected Aurora light aura across water -->
      <ellipse cx="330" cy="330" rx="260" ry="60" fill="url(#lake-aurora-refl)" opacity="0.85"/>
      <ellipse cx="560" cy="315" rx="110" ry="35" fill="rgba(254, 215, 170, 0.45)"/>

      <!-- Inverted mountain mirror reflection in calm lake -->
      <polygon points="350,405 341,382 345,372 334,348 318,332 285,308 245,290 210,277 175,275 370,275 368,285 357,330 349,360 352,380" fill="#071b22" opacity="0.8"/>
      <polygon points="350,405 352,380 349,360 357,330 362,305 368,285 370,275 520,275 485,282 442,298 406,320 380,342 358,366 362,378" fill="#2d1c15" opacity="0.75"/>
      <path d="M 350,405 L 347,388 L 338,368 L 342,358 L 330,335" stroke="rgba(167, 243, 208, 0.6)" stroke-width="3" fill="none" opacity="0.7"/>
      <path d="M 350,405 L 358,382 L 355,366 L 372,340" stroke="rgba(254, 215, 170, 0.55)" stroke-width="3" fill="none" opacity="0.7"/>

      <!-- Lake shimmer ripple lines (Live CSS animated) -->
      <g class="lake-ripples" opacity="0.75">
        <line x1="80" y1="288" x2="220" y2="288" stroke="rgba(52, 211, 153, 0.5)" stroke-width="1.2" stroke-dasharray="14 10"/>
        <line x1="260" y1="295" x2="420" y2="295" stroke="rgba(167, 243, 208, 0.65)" stroke-width="1.5" stroke-dasharray="20 14"/>
        <line x1="470" y1="292" x2="620" y2="292" stroke="rgba(254, 215, 170, 0.45)" stroke-width="1.2" stroke-dasharray="16 12"/>
        <line x1="140" y1="312" x2="340" y2="312" stroke="rgba(52, 211, 153, 0.6)" stroke-width="1.5" stroke-dasharray="22 16"/>
        <line x1="370" y1="318" x2="540" y2="318" stroke="rgba(32, 192, 184, 0.55)" stroke-width="1.4" stroke-dasharray="18 12"/>
        <line x1="200" y1="338" x2="440" y2="338" stroke="rgba(167, 243, 208, 0.7)" stroke-width="1.5" stroke-dasharray="24 16"/>
        <line x1="110" y1="365" x2="380" y2="365" stroke="rgba(52, 211, 153, 0.55)" stroke-width="1.5" stroke-dasharray="28 18"/>
        <line x1="390" y1="375" x2="590" y2="375" stroke="rgba(32, 192, 184, 0.5)" stroke-width="1.4" stroke-dasharray="22 14"/>
      </g>

      <!-- 8. Shorelines Left and Right with Trees and Cabin -->
      <!-- Left rocky bank -->
      <path d="M 0,330 Q 60,320 110,345 Q 160,370 200,420 L 0,420 Z" fill="#041217"/>
      <circle cx="120" cy="355" r="9" fill="#0a2630"/>
      <circle cx="140" cy="370" r="14" fill="#061c22"/>
      <circle cx="95" cy="348" r="6" fill="#0f3440"/>

      <!-- Right shore with pines and tiny warm glowing cabin light -->
      <path d="M 540,420 Q 560,350 630,310 Q 670,290 700,285 L 700,420 Z" fill="#041014"/>
      <g class="shore-pines">
        <polygon points="630,308 625,282 635,282" fill="#02080a"/>
        <polygon points="640,305 636,275 644,275" fill="#02080a"/>
        <polygon points="650,300 646,272 654,272" fill="#02080a"/>
        <polygon points="662,295 658,268 666,268" fill="#02080a"/>
      </g>
      <!-- Cabin warm light -->
      <circle cx="628" cy="298" r="6" fill="#fef08a" opacity="0.4" filter="url(#star-glow)"/>
      <circle cx="628" cy="298" r="2.2" fill="#fffbeb"/>
    </svg>`,
    message: 'Aurora dreams — colours that exist nowhere else in the universe.',
    stars: '✦ ✧ ★ ✦ ✧',
    starColor: '#20c0b8',
    className: 'mode-aurora',
  },
  sunrise: {
    moon: '🌅',
    svg: '',
    message: 'Sunrise hour — just in time for one last dream before waking.',
    stars: '✦ ★ ✦ ★ ✦',
    starColor: '#fed7aa',
    className: 'mode-sunrise',
  },
  cozy: {
    moon: '🕯️',
    svg: `<svg class="nl-focal-svg nl-focal-candle" viewBox="0 0 100 130" width="80" height="104" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Warm candle flame">
      <defs>
        <radialGradient id="nl-flame-aura" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
          <stop offset="35%" stop-color="#f59e0b" stop-opacity="0.55"/>
          <stop offset="70%" stop-color="#b45309" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#78350f" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="nl-flame-grad" cx="50%" cy="75%" r="65%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fef08a"/>
          <stop offset="60%" stop-color="#f59e0b"/>
          <stop offset="90%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#c2410c"/>
        </radialGradient>
        <linearGradient id="nl-candle-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f5efe6"/>
          <stop offset="25%" stop-color="#ffffff"/>
          <stop offset="70%" stop-color="#fed7aa"/>
          <stop offset="100%" stop-color="#e0cfba"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="38" r="45" fill="url(#nl-flame-aura)"/>
      <rect x="36" y="55" width="28" height="55" rx="4" fill="url(#nl-candle-body)"/>
      <ellipse cx="50" cy="55" rx="14" ry="4" fill="#ffedd5"/>
      <line x1="50" y1="55" x2="50" y2="44" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
      <g class="nl-candle-flame">
        <path d="M50,18 C55,30 58,38 56,43 C54,48 46,48 44,43 C42,38 45,30 50,18 Z" fill="url(#nl-flame-grad)"/>
        <ellipse cx="50" cy="38" rx="2.5" ry="5.5" fill="#ffffff" opacity="0.95"/>
      </g>
    </svg>`,
    message: 'Cozy candlelight — warm dreams wrapped in golden amber.',
    stars: '✧ ✦ ✧',
    starColor: '#fef08a',
    className: 'mode-cozy',
  },
};

let currentMode = 'midnight';

function applyNightlightMode(mode) {
  const config = nightlightModes[mode];
  if (!config) return;
  currentMode = mode;

  const scene = $('nightlight-scene');
  const moon = $('nl-moon');
  const stars = $('nl-stars');
  const message = $('nl-message');
  const display = $('nightlight-display');

  // Render vector SVG artwork or fallback emoji
  if (moon) {
    if (config.svg) {
      moon.innerHTML = config.svg;
    } else if (config.svg === '') {
      moon.innerHTML = '';
    } else {
      moon.textContent = config.moon;
    }
  }

  if (message) message.textContent = config.message;
  if (stars) {
    stars.innerHTML = config.stars.split(' ').map(s => `<span>${s}</span>`).join('');
    stars.style.color = config.starColor;
  }
  if (scene) {
    const hasMidnight = $('nl-midnight-custom-img') && $('nl-midnight-custom-img').style.display === 'block';
    const hasMoonrise = $('nl-moonrise-custom-img') && $('nl-moonrise-custom-img').style.display === 'block';
    const hasAurora = $('nl-aurora-custom-img') && $('nl-aurora-custom-img').style.display === 'block';
    const hasCozy = $('nl-cozy-custom-img') && $('nl-cozy-custom-img').style.display === 'block';
    let extraClass = '';
    if (mode === 'midnight' && hasMidnight) extraClass = ' has-midnight-art';
    if (mode === 'moonrise' && hasMoonrise) extraClass = ' has-moonrise-art';
    if (mode === 'aurora' && hasAurora) extraClass = ' has-aurora-art';
    if (mode === 'cozy' && hasCozy) extraClass = ' has-cozy-art';
    scene.className = 'nightlight-scene ' + config.className + extraClass;
  }

  // Update brightness based on slider smoothly
  const brightness = $('brightness-slider');
  if (brightness && scene) {
    const rawVal = parseFloat(brightness.value) || 70;
    const factor = Math.max(0.35, rawVal / 100);
    scene.style.filter = `brightness(${factor})`;
  }

  // Update lantern asset mode attribute on both potential container IDs
  const card = $('dream-nightlight') || $('project-nightlight');
  if (card) {
    card.setAttribute('data-mode', mode);
  }

  // Update ARIA label
  if (display) {
    display.setAttribute('aria-label', `Dream nightlight: ${mode} mode — ${config.message}`);
  }
}

function initNightlight() {
  const modeBtns = qsa('.mode-btn');
  const brightnessSlider = $('brightness-slider');
  const brightnessVal = $('brightness-val');
  const scene = $('nightlight-scene');

  // Midnight elements
  const midnightCustomImg = $('nl-midnight-custom-img');
  const midnightFileInput = $('midnight-file-input');
  const midnightChooseBtn = $('midnight-choose-btn');

  // Sunrise elements
  const sunriseCustomImg = $('nl-sunrise-custom-img');
  const sunriseFileInput = $('sunrise-file-input');
  const sunriseChooseBtn = $('sunrise-choose-btn');

  // Moonrise elements
  const moonriseCustomImg = $('nl-moonrise-custom-img');
  const moonriseFileInput = $('moonrise-file-input');
  const moonriseChooseBtn = $('moonrise-choose-btn');

  // Aurora elements
  const auroraCustomImg = $('nl-aurora-custom-img');
  const auroraFileInput = $('aurora-file-input');
  const auroraChooseBtn = $('aurora-choose-btn');

  // Cozy elements
  const cozyCustomImg = $('nl-cozy-custom-img');
  const cozyFileInput = $('cozy-file-input');
  const cozyChooseBtn = $('cozy-choose-btn');

  // Check for custom artworks saved in localStorage
  try {
    const savedMidnight = localStorage.getItem('pip_midnight_artwork');
    if (savedMidnight && midnightCustomImg) {
      midnightCustomImg.src = savedMidnight;
      midnightCustomImg.style.display = 'block';
      if (scene) scene.classList.add('has-midnight-art');
    }
    const savedSunrise = localStorage.getItem('pip_sunrise_artwork');
    if (savedSunrise && sunriseCustomImg) {
      sunriseCustomImg.src = savedSunrise;
      sunriseCustomImg.style.display = 'block';
    }
    const savedMoonrise = localStorage.getItem('pip_moonrise_artwork');
    if (savedMoonrise && moonriseCustomImg) {
      moonriseCustomImg.src = savedMoonrise;
      moonriseCustomImg.style.display = 'block';
      if (scene) scene.classList.add('has-moonrise-art');
    }
    const savedAurora = localStorage.getItem('pip_aurora_artwork');
    if (savedAurora && auroraCustomImg) {
      auroraCustomImg.src = savedAurora;
      auroraCustomImg.style.display = 'block';
      if (scene) scene.classList.add('has-aurora-art');
    }
    const savedCozy = localStorage.getItem('pip_cozy_artwork');
    if (savedCozy && cozyCustomImg) {
      cozyCustomImg.src = savedCozy;
      cozyCustomImg.style.display = 'block';
      if (scene) scene.classList.add('has-cozy-art');
    }
  } catch (err) {
    console.warn('Could not read cached artwork:', err);
  }

  function loadFileAsMidnight(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (midnightCustomImg) {
        midnightCustomImg.src = dataUrl;
        midnightCustomImg.style.display = 'block';
      }
      if (scene) scene.classList.add('has-midnight-art');
      try {
        localStorage.setItem('pip_midnight_artwork', dataUrl);
      } catch (err) {
        console.warn('Could not cache artwork in localStorage:', err);
      }
      const midnightBtn = qs('.mode-btn[data-mode="midnight"]');
      if (midnightBtn && !midnightBtn.classList.contains('active')) {
        midnightBtn.click();
      }
    };
    reader.readAsDataURL(file);
  }

  function loadFileAsSunrise(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (sunriseCustomImg) {
        sunriseCustomImg.src = dataUrl;
        sunriseCustomImg.style.display = 'block';
      }
      try {
        localStorage.setItem('pip_sunrise_artwork', dataUrl);
      } catch (err) {
        console.warn('Could not cache artwork in localStorage:', err);
      }
      const sunriseBtn = qs('.mode-btn[data-mode="sunrise"]');
      if (sunriseBtn && !sunriseBtn.classList.contains('active')) {
        sunriseBtn.click();
      }
    };
    reader.readAsDataURL(file);
  }

  function loadFileAsMoonrise(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (moonriseCustomImg) {
        moonriseCustomImg.src = dataUrl;
        moonriseCustomImg.style.display = 'block';
      }
      if (scene) scene.classList.add('has-moonrise-art');
      try {
        localStorage.setItem('pip_moonrise_artwork', dataUrl);
      } catch (err) {
        console.warn('Could not cache artwork in localStorage:', err);
      }
      const moonriseBtn = qs('.mode-btn[data-mode="moonrise"]');
      if (moonriseBtn && !moonriseBtn.classList.contains('active')) {
        moonriseBtn.click();
      }
    };
    reader.readAsDataURL(file);
  }

  function loadFileAsAurora(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (auroraCustomImg) {
        auroraCustomImg.src = dataUrl;
        auroraCustomImg.style.display = 'block';
      }
      if (scene) scene.classList.add('has-aurora-art');
      try {
        localStorage.setItem('pip_aurora_artwork', dataUrl);
      } catch (err) {
        console.warn('Could not cache artwork in localStorage:', err);
      }
      const auroraBtn = qs('.mode-btn[data-mode="aurora"]');
      if (auroraBtn && !auroraBtn.classList.contains('active')) {
        auroraBtn.click();
      }
    };
    reader.readAsDataURL(file);
  }

  function loadFileAsCozy(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      const dataUrl = evt.target.result;
      if (cozyCustomImg) {
        cozyCustomImg.src = dataUrl;
        cozyCustomImg.style.display = 'block';
      }
      if (scene) scene.classList.add('has-cozy-art');
      try {
        localStorage.setItem('pip_cozy_artwork', dataUrl);
      } catch (err) {
        console.warn('Could not cache artwork in localStorage:', err);
      }
      const cozyBtn = qs('.mode-btn[data-mode="cozy"]');
      if (cozyBtn && !cozyBtn.classList.contains('active')) {
        cozyBtn.click();
      }
    };
    reader.readAsDataURL(file);
  }

  // Midnight file triggers
  if (midnightChooseBtn && midnightFileInput) {
    midnightChooseBtn.addEventListener('click', () => midnightFileInput.click());
  }
  if (midnightFileInput) {
    midnightFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFileAsMidnight(e.target.files[0]);
    });
  }

  // Sunrise file triggers
  if (sunriseChooseBtn && sunriseFileInput) {
    sunriseChooseBtn.addEventListener('click', () => sunriseFileInput.click());
  }
  if (sunriseFileInput) {
    sunriseFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFileAsSunrise(e.target.files[0]);
    });
  }

  // Moonrise file triggers
  if (moonriseChooseBtn && moonriseFileInput) {
    moonriseChooseBtn.addEventListener('click', () => moonriseFileInput.click());
  }
  if (moonriseFileInput) {
    moonriseFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFileAsMoonrise(e.target.files[0]);
    });
  }

  // Aurora file triggers
  if (auroraChooseBtn && auroraFileInput) {
    auroraChooseBtn.addEventListener('click', () => auroraFileInput.click());
  }
  if (auroraFileInput) {
    auroraFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFileAsAurora(e.target.files[0]);
    });
  }

  // Cozy file triggers
  if (cozyChooseBtn && cozyFileInput) {
    cozyChooseBtn.addEventListener('click', () => cozyFileInput.click());
  }
  if (cozyFileInput) {
    cozyFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) loadFileAsCozy(e.target.files[0]);
    });
  }

  // Drag and drop onto scene
  if (scene) {
    scene.addEventListener('dragover', (e) => {
      e.preventDefault();
      scene.classList.add('nl-dragover');
    });
    scene.addEventListener('dragleave', () => {
      scene.classList.remove('nl-dragover');
    });
    scene.addEventListener('drop', (e) => {
      e.preventDefault();
      scene.classList.remove('nl-dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (currentMode === 'midnight') {
          loadFileAsMidnight(e.dataTransfer.files[0]);
        } else if (currentMode === 'moonrise') {
          loadFileAsMoonrise(e.dataTransfer.files[0]);
        } else if (currentMode === 'aurora') {
          loadFileAsAurora(e.dataTransfer.files[0]);
        } else if (currentMode === 'cozy') {
          loadFileAsCozy(e.dataTransfer.files[0]);
        } else {
          loadFileAsSunrise(e.dataTransfer.files[0]);
        }
      }
    });
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      applyNightlightMode(btn.dataset.mode);
      try {
        localStorage.setItem('pmo_nightlight_mode', btn.dataset.mode);
      } catch (e) {}
      playClickSound();
    });
  });

  if (brightnessSlider) {
    const updateBrightness = () => {
      const val = brightnessSlider.value;
      if (brightnessVal) brightnessVal.textContent = val + '%';
      if (scene) {
        const factor = Math.max(0.35, parseFloat(val) / 100);
        scene.style.filter = `brightness(${factor})`;
      }
      try {
        localStorage.setItem('pmo_nightlight_brightness', val);
      } catch (e) {}
    };
    brightnessSlider.addEventListener('input', updateBrightness);
    brightnessSlider.addEventListener('change', updateBrightness);
  }

  // Restore saved nightlight settings if available
  let initialMode = 'midnight';
  try {
    const saved = localStorage.getItem('pmo_nightlight_mode');
    if (saved && nightlightModes[saved]) initialMode = saved;
  } catch (e) {}

  let initialBrightness = '70';
  try {
    const savedB = localStorage.getItem('pmo_nightlight_brightness');
    if (savedB && !isNaN(parseFloat(savedB))) initialBrightness = savedB;
  } catch (e) {}

  if (brightnessSlider && initialBrightness) {
    brightnessSlider.value = initialBrightness;
    if (brightnessVal) brightnessVal.textContent = initialBrightness + '%';
  }

  const activeBtn = qs(`.mode-btn[data-mode="${initialMode}"]`);
  if (activeBtn) {
    modeBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed', 'true');
  }

  applyNightlightMode(initialMode);
}

/* ============================================================
   9. DREAM DELIVERY MAP
   ============================================================ */

const destPositions = {
  cloud:  { x: 200, y: 130 },
  moon:   { x: 745, y: 125 },
  star:   { x: 750, y: 345 },
  pillow: { x: 235, y: 340 },
};

let pipPos = { x: 200, y: 130 };
let pipAnimFrame = null;
let currentDest = 'cloud';
let isTraveling = false;
const visitedDestinations = new Set();

function initDreamMap() {
  const destinations = qsa('.map-destination');
  if (!destinations.length) return;

  const pipTraveler = $('pip-traveler');
  const dreamInfo = $('dream-info');
  const mapWrap = qs('.dream-map-wrap');
  const statusIcon = $('delivery-status-icon');
  const statusText = $('delivery-status-text');
  const currentLocName = $('current-loc-name');
  const goalBadge = $('delivery-goal-badge');
  const goalText = $('delivery-goal-text');
  const trackerDots = qsa('.tracker-dot');
  const trackerCountLabel = $('tracker-count-label');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const destNames = {
    cloud:  'Cloud Kingdom',
    moon:   'Moon Garden',
    star:   'Star Harbor',
    pillow: 'Pillow Mountain'
  };

  const destArrivedMessages = {
    cloud:  'Lullabies are drifting across the sky.',
    moon:   'Wishes have bloomed into sweet dreams.',
    star:   'Fresh stardust has been safely delivered.',
    pillow: 'Restful comfort is tucked into the snowy slopes.'
  };

  // Helper to synchronize Pip's current physical station across UI badges and dots
  function updateCurrentLocationUI(dest) {
    const friendlyName = destNames[dest] || dest;
    if (currentLocName) {
      currentLocName.textContent = friendlyName;
    }
    destinations.forEach(d => {
      const isCurrent = d.dataset.dest === dest;
      d.classList.toggle('is-current', isCurrent);
    });
    trackerDots.forEach(dot => {
      const isCurrent = dot.dataset.dest === dest;
      dot.classList.toggle('is-current', isCurrent);
    });
  }

  // Trail particle references in SVG
  const trailCircles = [
    $('trail-1'), $('trail-2'), $('trail-3'),
    $('trail-4'), $('trail-5'), $('trail-6')
  ].filter(Boolean);

  const trailStars = [
    $('trail-star-1'), $('trail-star-2'),
    $('trail-star-3'), $('trail-star-4')
  ].filter(Boolean);

  let trailHistory = [];

  function showDreamCard(dest) {
    const cards = dreamInfo ? qsa('.dream-card', dreamInfo) : [];
    cards.forEach(c => {
      const isMatch = c.dataset.dest === dest;
      c.hidden = !isMatch;
      c.classList.toggle('active', isMatch);
    });
  }

  // Harmonic chord progression per destination (played only when sound is unmuted)
  function playArrivalChime(dest) {
    if (typeof isMuted !== 'undefined' && isMuted) return;
    const chords = {
      cloud:  [523.25, 659.25, 783.99],       // C5, E5, G5 (Lullaby chord)
      moon:   [587.33, 739.99, 880.00],       // D5, F#5, A5 (Golden bloom chord)
      star:   [659.25, 830.61, 987.77],       // E5, G#5, B5 (Guiding star chord)
      pillow: [440.00, 554.37, 659.25],       // A4, C#5, E5 (Cozy dream chord)
    };
    const notes = chords[dest] || [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (typeof playTone === 'function') playTone(freq, 0.45, 0.22);
      }, idx * 115);
    });
  }

  // Celebratory fanfare when all four destinations are visited
  function playCompletionFanfare() {
    if (typeof isMuted !== 'undefined' && isMuted) return;
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfareNotes.forEach((freq, idx) => {
      setTimeout(() => {
        if (typeof playTone === 'function') playTone(freq, 0.55, 0.28);
      }, idx * 110);
    });
  }

  // Trigger celebration effects upon completing all 4 deliveries
  function celebrateFullCompletion() {
    if (trackerCountLabel) {
      trackerCountLabel.textContent = '4/4 destinations completed ✨';
    }
    if (goalBadge) goalBadge.classList.add('all-complete');
    if (goalText) {
      goalText.innerHTML = '🎉 <strong>All 4 destinations completed!</strong> You finished tonight\'s dream route! ✨';
    }
    playCompletionFanfare();

    // Spawn burst of floating golden star elements across the map
    if (mapWrap && !prefersReducedMotion) {
      for (let i = 0; i < 18; i++) {
        setTimeout(() => {
          const spark = document.createElement('div');
          spark.className = 'stardust-celebration-particle';
          spark.textContent = ['✦', '★', '✧', '✨', '💖'][Math.floor(Math.random() * 5)];
          const x = 10 + Math.random() * 80;
          const y = 20 + Math.random() * 60;
          spark.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            font-size: ${16 + Math.random() * 18}px;
            color: ${['#fde047', '#f472b6', '#a78bfa', '#67e8f9', '#ffffff'][Math.floor(Math.random() * 5)]};
            pointer-events: none;
            z-index: 10;
            filter: drop-shadow(0 0 6px currentColor);
            animation: celebrateSpark 1.6s ease-out forwards;
          `;
          mapWrap.appendChild(spark);
          setTimeout(() => spark.remove(), 1700);
        }, i * 65);
      }
    }
  }

  // Mark destination as visited and update progress indicator
  function recordDeliveryProgress(dest) {
    const isNew = !visitedDestinations.has(dest);
    visitedDestinations.add(dest);

    // Update destination SVG group visited class
    const destGroup = $(`dest-${dest}`);
    if (destGroup) {
      destGroup.classList.add('visited');
    }

    // Update bottom tracker dots
    const dotBtn = qs(`.tracker-dot[data-dest="${dest}"]`);
    if (dotBtn) {
      dotBtn.classList.add('visited');
      dotBtn.setAttribute('aria-label', `${destNames[dest]}: delivery complete`);
    }

    // Update tracker count label: X/4 destinations completed
    if (trackerCountLabel) {
      trackerCountLabel.textContent = `${visitedDestinations.size}/4 destinations completed`;
    }

    // Update tracker aria label
    const trackerGroup = $('tracker-dots');
    if (trackerGroup) {
      trackerGroup.setAttribute('aria-label', `Progress: ${visitedDestinations.size} of 4 destinations completed`);
    }

    // If all 4 are completed for the first time
    if (visitedDestinations.size === 4 && isNew) {
      celebrateFullCompletion();
    }
  }

  function animatePipToDestination(targetX, targetY, dest, onDone) {
    if (prefersReducedMotion) {
      pipPos = { x: targetX, y: targetY };
      if (pipTraveler) pipTraveler.setAttribute('transform', `translate(${targetX}, ${targetY})`);
      trailCircles.forEach(tc => tc.setAttribute('opacity', '0'));
      trailStars.forEach(ts => ts.setAttribute('opacity', '0'));
      if (onDone) onDone();
      return;
    }

    if (pipAnimFrame) cancelAnimationFrame(pipAnimFrame);

    const startX = pipPos.x;
    const startY = pipPos.y;
    trailHistory = [];

    // Calculate arc trajectory
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // If clicking same location, perform a joyful little hop
    const arcHeight = dist < 10 ? 25 : Math.min(dist * 0.22, 60);
    const duration = dist < 10 ? 650 : 1350; // ms for a dreamy, graceful flight
    const startTime = performance.now();

    if (pipTraveler) pipTraveler.classList.add('is-flying');
    if (mapWrap) mapWrap.classList.add('route-traveling');

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Smooth ease-in-out cubic
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Arched flight path with gentle curve
      const arcOffset = -Math.sin(t * Math.PI) * arcHeight;
      const curX = startX + (targetX - startX) * ease;
      const curY = startY + (targetY - startY) * ease + arcOffset;

      pipPos.x = curX;
      pipPos.y = curY;

      if (pipTraveler) {
        pipTraveler.setAttribute('transform', `translate(${curX}, ${curY})`);
      }

      // Record trail history
      trailHistory.push({ x: curX, y: curY });
      if (trailHistory.length > 24) trailHistory.shift();

      // Update stardust trail circles
      const circleOpacities = [0.9, 0.75, 0.6, 0.45, 0.3, 0.15];
      trailCircles.forEach((tc, idx) => {
        const histIdx = trailHistory.length - 1 - (idx + 1) * 2;
        if (histIdx >= 0 && trailHistory[histIdx]) {
          const pt = trailHistory[histIdx];
          tc.setAttribute('cx', String(pt.x));
          tc.setAttribute('cy', String(pt.y));
          tc.setAttribute('opacity', String(circleOpacities[idx] * (1 - t * 0.25)));
        } else {
          tc.setAttribute('opacity', '0');
        }
      });

      // Update sparkling starbursts in trail
      const starOpacities = [0.95, 0.8, 0.65, 0.4];
      trailStars.forEach((ts, idx) => {
        const histIdx = trailHistory.length - 1 - (idx + 1) * 3;
        if (histIdx >= 0 && trailHistory[histIdx]) {
          const pt = trailHistory[histIdx];
          ts.setAttribute('x', String(pt.x));
          ts.setAttribute('y', String(pt.y + 4));
          ts.setAttribute('opacity', String(starOpacities[idx] * (1 - t * 0.2)));
        } else {
          ts.setAttribute('opacity', '0');
        }
      });

      if (t < 1) {
        pipAnimFrame = requestAnimationFrame(step);
      } else {
        pipAnimFrame = null;
        pipPos = { x: targetX, y: targetY };
        if (pipTraveler) {
          pipTraveler.setAttribute('transform', `translate(${targetX}, ${targetY})`);
          pipTraveler.classList.remove('is-flying');
        }
        if (mapWrap) mapWrap.classList.remove('route-traveling');

        // Fade out trail smoothly
        let fadeOut = 1;
        function fadeStep() {
          fadeOut -= 0.14;
          if (fadeOut > 0) {
            trailCircles.forEach((tc, idx) => tc.setAttribute('opacity', String(circleOpacities[idx] * fadeOut)));
            trailStars.forEach((ts, idx) => ts.setAttribute('opacity', String(starOpacities[idx] * fadeOut)));
            requestAnimationFrame(fadeStep);
          } else {
            trailCircles.forEach(tc => tc.setAttribute('opacity', '0'));
            trailStars.forEach(ts => ts.setAttribute('opacity', '0'));
          }
        }
        fadeStep();

        if (onDone) onDone();
      }
    }
    pipAnimFrame = requestAnimationFrame(step);
  }

  let activeJourneyId = 0;

  function activateDest(dest) {
    const target = destPositions[dest];
    if (!target) return;

    // If already traveling towards this exact destination, ignore redundant click
    if (isTraveling && currentDest === dest) return;

    // If mid-flight and another destination is clicked, cleanly redirect mid-flight!
    if (isTraveling) {
      if (pipAnimFrame) {
        cancelAnimationFrame(pipAnimFrame);
        pipAnimFrame = null;
      }
    }

    const friendlyName = destNames[dest] || dest;
    const journeyId = ++activeJourneyId;

    // Detect if this is a hop in place at the destination Pip already occupies
    const dx = target.x - pipPos.x;
    const dy = target.y - pipPos.y;
    const isHop = !isTraveling && Math.sqrt(dx * dx + dy * dy) < 10;

    // Update active highlight on destinations
    destinations.forEach(d => {
      const isMatch = d.dataset.dest === dest;
      d.classList.toggle('active', isMatch);
      d.setAttribute('aria-pressed', String(isMatch));
    });

    isTraveling = true;
    currentDest = dest;

    // Update status to traveling or hopping
    if (statusIcon) statusIcon.textContent = isHop ? '✨' : '🚀';
    if (statusText) {
      statusText.innerHTML = isHop
        ? `Pip is doing a happy little hop at <strong>${friendlyName}</strong>!`
        : `Pip is flying through the starlight to <strong>${friendlyName}</strong>...`;
    }

    const initialCard = qs('.dream-card[data-dest="none"]', dreamInfo);
    if (initialCard) {
      initialCard.innerHTML = `<p>🚀 Pip is traveling to <strong>${friendlyName}</strong> with a fresh cargo of dreams...</p>`;
    }
    showDreamCard('none');

    if (typeof playClickSound === 'function') playClickSound();

    animatePipToDestination(target.x, target.y, dest, () => {
      // Guard against stale callbacks from interrupted earlier journeys
      if (journeyId !== activeJourneyId) return;

      isTraveling = false;

      // Update current physical station badge & dots
      updateCurrentLocationUI(dest);

      // Play arrival chime
      playArrivalChime(dest);

      // Record progress
      recordDeliveryProgress(dest);

      // Show destination card
      showDreamCard(dest);

      // Update footer status message
      if (statusIcon) statusIcon.textContent = '✨';
      if (statusText) {
        statusText.innerHTML = `Pip arrived at <strong>${friendlyName}</strong>! ${destArrivedMessages[dest] || ''}`;
      }
    });
  }

  // Click & keyboard listeners on SVG destinations
  destinations.forEach(d => {
    d.addEventListener('click', () => activateDest(d.dataset.dest));
    d.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateDest(d.dataset.dest);
      }
    });
  });

  // Click & keyboard listeners on bottom progress tracker dots
  trackerDots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.stopPropagation();
      const dest = dot.dataset.dest;
      if (dest) activateDest(dest);
    });
    dot.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const dest = dot.dataset.dest;
        if (dest) activateDest(dest);
      }
    });
  });

  // Inject animation keyframes for celebration particles if not already present
  if (!document.getElementById('pmo-celebrate-styles')) {
    const styleTag = document.createElement('style');
    styleTag.id = 'pmo-celebrate-styles';
    styleTag.textContent = `
      @keyframes celebrateSpark {
        0% { transform: translateY(0) scale(0.6); opacity: 0; }
        25% { transform: translateY(-12px) scale(1.3); opacity: 1; }
        80% { transform: translateY(-28px) scale(1); opacity: 0.85; }
        100% { transform: translateY(-40px) scale(0.4); opacity: 0; }
      }
    `;
    document.head.appendChild(styleTag);
  }

  // Set initial position, current location state & card
  updateCurrentLocationUI('cloud');
  if (pipTraveler) {
    pipTraveler.setAttribute('transform', `translate(${destPositions.cloud.x}, ${destPositions.cloud.y})`);
  }
}

/* ============================================================
   10. ORIGIN STORY — SCENE NAVIGATION
   ============================================================ */

function initStory() {
  const scenes = qsa('.story-scene');
  const tabs = qsa('.scene-tab');
  const dots = qsa('.scene-dot');
  const prevBtn = $('story-prev');
  const nextBtn = $('story-next');
  const storySection = $('story');
  let currentScene = 0;
  let isUserManualClick = false;
  let manualClickTimer = null;

  function goToScene(idx, fromScroll = false) {
    if (idx < 0 || idx >= scenes.length) return;
    if (idx === currentScene && scenes[idx] && !scenes[idx].hidden) return;

    scenes.forEach((s, i) => {
      const active = i === idx;
      s.hidden = !active;
      s.classList.toggle('active', active);
    });
    tabs.forEach((t, i) => {
      t.classList.toggle('active', i === idx);
      t.setAttribute('aria-selected', String(i === idx));
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));

    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === scenes.length - 1;

    currentScene = idx;
    if (!fromScroll) {
      playClickSound();
    }
  }

  function handleManualInteraction(idx) {
    isUserManualClick = true;
    clearTimeout(manualClickTimer);
    manualClickTimer = setTimeout(() => {
      isUserManualClick = false;
    }, 1400);
    goToScene(idx);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => handleManualInteraction(i));
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && i < tabs.length - 1) {
        e.preventDefault();
        handleManualInteraction(i + 1);
        tabs[i + 1]?.focus();
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        handleManualInteraction(i - 1);
        tabs[i - 1]?.focus();
      }
    });
  });

  dots.forEach((dot, i) => dot.addEventListener('click', () => handleManualInteraction(i)));
  if (prevBtn) prevBtn.addEventListener('click', () => handleManualInteraction(currentScene - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => handleManualInteraction(currentScene + 1));

  // Tasteful scroll-driven scene progression (respects reduced motion and avoids trapping)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && storySection) {
    let lastScrollTime = 0;
    function handleStoryScroll() {
      if (isUserManualClick) return;
      const now = performance.now();
      if (now - lastScrollTime < 45) return;
      lastScrollTime = now;

      const rect = storySection.getBoundingClientRect();
      const vh = window.innerHeight;

      // When the story section is actively engaged in the viewport
      if (rect.top <= vh * 0.65 && rect.bottom >= vh * 0.35) {
        const totalScrollableDistance = rect.height + vh * 0.3;
        const progress = clamp((vh * 0.65 - rect.top) / totalScrollableDistance, 0, 0.999);

        let targetScene = 0;
        if (progress < 0.34) {
          targetScene = 0;
        } else if (progress < 0.68) {
          targetScene = 1;
        } else {
          targetScene = 2;
        }

        if (targetScene !== currentScene) {
          goToScene(targetScene, true);
        }
      }
    }

    window.addEventListener('scroll', handleStoryScroll, { passive: true });
  }

  // Set initial state
  goToScene(0, true);
}

/* ============================================================
   11. GUESTBOOK (LocalStorage)
   ============================================================ */

function initGuestbook() {
  const form = $('guestbook-form');
  const nameInput = $('gb-name');
  const messageInput = $('gb-message');
  const charCount = $('char-count');
  const errorEl = $('form-error');
  const entriesContainer = $('guestbook-entries');
  const emptyMsg = $('entries-empty');

  if (!form) return;

  const sampleWishes = [
    {
      name: "Luna (Cloud Kingdom)",
      message: "May tonight's sleep be as soft as cloud cotton candy! Sweet dreams Pip! ☁️✨",
      time: Date.now() - 3600000 * 4
    },
    {
      name: "Starry Sam",
      message: "Found a little falling star under my pillow. Pip is the best dream engineer! ⭐",
      time: Date.now() - 3600000 * 2
    },
    {
      name: "Barnaby the Owl",
      message: "Hoo! 10/10 midnight service, zero nightmares detected. Open after bedtime rocks! 🌙",
      time: Date.now() - 1800000
    }
  ];

  function loadEntries() {
    try {
      const raw = localStorage.getItem('pmo_guestbook');
      if (raw === null) {
        saveEntries(sampleWishes);
        return sampleWishes;
      }
      return JSON.parse(raw);
    } catch { return sampleWishes; }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem('pmo_guestbook', JSON.stringify(entries.slice(-50)));
    } catch (e) {
      if (errorEl) errorEl.textContent = '✦ Storage quota reached or disabled in private browsing!';
    }
  }

  function renderEntry(entry) {
    const el = document.createElement('div');
    el.className = 'gb-entry';

    const header = document.createElement('div');
    header.className = 'gb-entry-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'gb-entry-name';
    nameSpan.textContent = (entry.name || 'A Dreamer') + ' ✨';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'gb-entry-time';
    const d = new Date(entry.time);
    timeSpan.textContent = isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    header.appendChild(nameSpan);
    header.appendChild(timeSpan);

    const msgP = document.createElement('p');
    msgP.className = 'gb-entry-msg';
    msgP.textContent = entry.message || '';

    el.appendChild(header);
    el.appendChild(msgP);
    return el;
  }

  function renderAll() {
    const entries = loadEntries();
    if (emptyMsg) emptyMsg.style.display = entries.length === 0 ? '' : 'none';
    // Remove old entries (keep empty message)
    qsa('.gb-entry', entriesContainer).forEach(e => e.remove());
    entries.slice().reverse().forEach(e => {
      entriesContainer.appendChild(renderEntry(e));
    });
  }

  // Char count
  if (messageInput && charCount) {
    messageInput.addEventListener('input', () => {
      charCount.textContent = `${messageInput.value.length} / 200`;
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = '';

    const name = (nameInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    if (!message) {
      if (errorEl) errorEl.textContent = '✦ Please write a little dream before signing!';
      messageInput?.focus();
      return;
    }
    if (message.length > 200) {
      if (errorEl) errorEl.textContent = '✦ Dreams must be under 200 characters!';
      return;
    }

    const entry = {
      name: name || 'A Dreamer',
      message,
      time: Date.now(),
    };

    const entries = loadEntries();
    entries.push(entry);
    saveEntries(entries);
    renderAll();

    form.reset();
    if (charCount) charCount.textContent = '0 / 200';
    playClickSound();
  });

  renderAll();
}

/* ============================================================
   12. EASTER EGG — CONSTELLATION
   ============================================================ */

function initEasterEgg() {
  const hintStars = qsa('.hint-star');
  const overlay = $('easter-egg-overlay');
  const closeBtn = $('egg-close');
  const constellationCanvas = $('constellation-canvas');
  let clickedStars = new Set();

  if (!overlay) return;

  let animId = null;
  let lastActiveElement = null;

  // Star positions normalized as fractions of canvas (rx, ry from 0 to 1)
  const starRelCoords = [
    { rx: 0.22, ry: 0.28 },
    { rx: 0.40, ry: 0.18 },
    { rx: 0.62, ry: 0.22 },
    { rx: 0.80, ry: 0.36 },
    { rx: 0.74, ry: 0.62 },
    { rx: 0.50, ry: 0.76, isPip: true },
    { rx: 0.28, ry: 0.68 },
    { rx: 0.15, ry: 0.48 },
  ];

  function setupCanvas() {
    if (!constellationCanvas) return null;
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const rect = constellationCanvas.getBoundingClientRect();
    const width = Math.round(rect.width > 0 ? rect.width : 380);
    const height = Math.round(rect.height > 0 ? rect.height : 240);

    constellationCanvas.width = Math.round(width * dpr);
    constellationCanvas.height = Math.round(height * dpr);

    const ctx = constellationCanvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { ctx, width, height };
  }

  function drawConstellation() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    const canvasInfo = setupCanvas();
    if (!canvasInfo) return;
    const { ctx, width, height } = canvasInfo;

    const stars = starRelCoords.map(s => ({
      x: s.rx * width,
      y: s.ry * height,
      isPip: Boolean(s.isPip),
    }));

    function render(progress) {
      ctx.clearRect(0, 0, width, height);

      // Deep sky gradient background
      const bg = ctx.createRadialGradient(
        width / 2, height / 2, 10,
        width / 2, height / 2, Math.max(width, height) / 1.4
      );
      bg.addColorStop(0, '#262046');
      bg.addColorStop(0.65, '#16132d');
      bg.addColorStop(1, '#0e0b1f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Deterministic background stardust
      ctx.fillStyle = 'rgba(200, 184, 240, 0.45)';
      for (let s = 0; s < 28; s++) {
        const sx = (((s * 137 + 29) % 1000) / 1000) * width;
        const sy = (((s * 83 + 47) % 1000) / 1000) * height;
        const size = s % 4 === 0 ? 1.8 : 1.2;
        ctx.fillRect(sx, sy, size, size);
      }

      // Constellation connecting lines
      ctx.save();
      ctx.strokeStyle = 'rgba(200, 184, 240, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.shadowColor = '#FFC875';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(stars[0].x, stars[0].y);

      const totalSegments = stars.length;
      const currentSegment = progress * totalSegments;
      const completedSegments = Math.floor(currentSegment);
      const segmentFrac = currentSegment - completedSegments;

      for (let s = 0; s < completedSegments && s < totalSegments; s++) {
        const nextIdx = (s + 1) % totalSegments;
        ctx.lineTo(stars[nextIdx].x, stars[nextIdx].y);
      }

      if (completedSegments < totalSegments && segmentFrac > 0) {
        const fromStar = stars[completedSegments];
        const toStar = stars[(completedSegments + 1) % totalSegments];
        const curX = fromStar.x + (toStar.x - fromStar.x) * segmentFrac;
        const curY = fromStar.y + (toStar.y - fromStar.y) * segmentFrac;
        ctx.lineTo(curX, curY);
      }

      if (progress >= 1) {
        ctx.closePath();
      }
      ctx.stroke();
      ctx.restore();

      // Draw all stars: reached stars glow brightly, upcoming stars glow gently
      stars.forEach((pt, idx) => {
        const reached = progress >= idx / (stars.length - 1) || progress >= 0.99;
        ctx.save();

        if (pt.isPip) {
          // Central Pip star marker
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, reached ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = reached ? 'rgba(255, 200, 117, 0.35)' : 'rgba(255, 200, 117, 0.15)';
          ctx.shadowColor = '#FFC875';
          ctx.shadowBlur = reached ? 18 : 8;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = reached ? '#FFC875' : 'rgba(200, 184, 240, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = '18px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💀', pt.x, pt.y + 1);
        } else {
          // Constellation star point
          const outerR = reached ? 9 : 6;
          const coreR = reached ? 3.5 : 2.5;

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, outerR, 0, Math.PI * 2);
          ctx.fillStyle = reached ? 'rgba(255, 200, 117, 0.3)' : 'rgba(200, 184, 240, 0.18)';
          ctx.shadowColor = '#FFC875';
          ctx.shadowBlur = reached ? 12 : 4;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, coreR, 0, Math.PI * 2);
          ctx.fillStyle = reached ? '#FFC875' : '#C8B8F0';
          ctx.fill();

          if (reached) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
          }
        }

        ctx.restore();
      });
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      render(1);
      return;
    }

    // Render initial state so the canvas is immediately visible
    render(0.05);

    const duration = 1300; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic curve
      const ease = 1 - Math.pow(1 - t, 3);
      render(ease);

      if (t < 1) {
        animId = requestAnimationFrame(step);
      }
    }

    animId = requestAnimationFrame(step);
  }

  function activateEgg() {
    lastActiveElement = document.activeElement;
    overlay.hidden = false;
    overlay.removeAttribute('hidden');
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Request frame ensures layout has updated before measuring canvas size
    requestAnimationFrame(() => {
      drawConstellation();
      closeBtn?.focus();
    });
  }

  function closeEgg(e) {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    overlay.hidden = true;
    overlay.setAttribute('hidden', '');
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    clickedStars.clear();
    hintStars.forEach(s => s.classList.remove('clicked'));
    playClickSound();

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  // Expose on window for fail-safe invocation
  window.pmoCloseEasterEgg = closeEgg;

  hintStars.forEach(star => {
    const activate = () => {
      star.classList.add('clicked');
      clickedStars.add(star.dataset.star);
      playClickSound();
      if (clickedStars.size === hintStars.length) {
        setTimeout(activateEgg, 250);
      }
    };
    star.addEventListener('click', activate);
    star.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  if (closeBtn) {
    closeBtn.onclick = closeEgg;
    closeBtn.addEventListener('click', closeEgg);
    closeBtn.addEventListener('touchstart', closeEgg, { passive: false });
    closeBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeEgg(e);
      }
    });
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      closeEgg(e);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.style.display !== 'none' && !overlay.hidden) {
      closeEgg(e);
    }
  });

  // Re-render constellation on resize if open
  window.addEventListener('resize', () => {
    if (overlay.style.display === 'flex' || overlay.classList.contains('active')) {
      drawConstellation();
    }
  });
}

/* ============================================================
   13. THEME TOGGLE
   ============================================================ */

function initThemeToggle() {
  const btn = $('theme-toggle');
  if (!btn) return;

  const stored = localStorage.getItem('pmo_theme') || 'midnight';
  applyTheme(stored, btn);

  btn.addEventListener('click', () => {
    const current = document.body.dataset.theme;
    const next = current === 'midnight' ? 'day' : 'midnight';
    applyTheme(next, btn);
    localStorage.setItem('pmo_theme', next);
    playClickSound();
  });
}

function applyTheme(theme, btn) {
  document.body.dataset.theme = theme;
  if (btn) {
    const icon = btn.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'midnight' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', `Switch to ${theme === 'midnight' ? 'day' : 'night'} theme`);
    btn.setAttribute('aria-pressed', String(theme === 'day'));
  }
}

/* ============================================================
   14. MUTE TOGGLE
   ============================================================ */

function initMuteToggle() {
  const btn = $('mute-btn');
  if (!btn) return;

  // Default muted until first interaction — respects autoplay policy
  isMuted = true;

  btn.addEventListener('click', () => {
    isMuted = !isMuted;
    const icon = btn.querySelector('.mute-icon');
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    btn.setAttribute('aria-label', isMuted ? 'Unmute sounds' : 'Mute sounds');
    btn.setAttribute('aria-pressed', String(isMuted));
    if (!isMuted) {
      // Unlock audio
      const ctx = getAudioCtx();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      playTone(523.25, 0.15, 0.1);
    }
  });
}

/* ============================================================
   15. KEYBOARD / ACCESSIBILITY HELPERS
   ============================================================ */

function initA11y() {
  // Smooth scroll for nav links
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.focus({ preventScroll: true });
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) {
        // Ignore invalid CSS selector
      }
    });
  });
}

/* ============================================================
   16. CHARACTER REACTION
   ============================================================ */

function initCharacterReaction() {
  const avatar = $('pip-avatar');
  const hero = $('hero');
  if (!avatar || !hero) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Gentle pointer tilt on non-touch screens
  if (!window.matchMedia('(pointer: coarse)').matches) {
    hero.addEventListener('mousemove', e => {
      const rect = avatar.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      const tiltX = clamp(dy * -6, -6, 6);
      const tiltY = clamp(dx * 6, -6, 6);
      avatar.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });

    hero.addEventListener('mouseleave', () => {
      avatar.style.transform = '';
    });
  }

  // Click or touch on Pip avatar: joyful bounce + floating reaction emoji
  avatar.addEventListener('click', () => {
    avatar.classList.add('pip-reacting');
    playClickSound();

    const parent = avatar.parentElement;
    if (parent) {
      const reaction = document.createElement('span');
      reaction.className = 'pip-heart-bubble';
      reaction.textContent = ['💖', '⭐', '✨', '💤', '🌙'][Math.floor(Math.random() * 5)];
      reaction.style.left = `${50 + (Math.random() * 20 - 10)}%`;
      parent.appendChild(reaction);
      setTimeout(() => reaction.remove(), 1200);
    }

    setTimeout(() => {
      avatar.classList.remove('pip-reacting');
    }, 500);
  });
}

/* ============================================================
   17. RETRO CHAOS MODE (Side Quest 5 — +5 points)
   ============================================================ */

function initChaosMode() {
  const chaosBtn = $('chaos-toggle');
  const banner = $('chaos-banner');
  const bannerClose = $('chaos-banner-close');
  const brand = qs('.nav-brand');

  function setChaos(active) {
    document.body.dataset.chaos = String(active);
    if (chaosBtn) {
      chaosBtn.classList.toggle('active', active);
      chaosBtn.setAttribute('aria-pressed', String(active));
      chaosBtn.setAttribute('aria-label', active ? 'Turn off retro Chaos Mode' : 'Toggle retro Chaos Mode');
    }
    if (banner) {
      banner.hidden = !active;
    }
    if (!isMuted) {
      playTone(active ? 660 : 440, 0.2, 0.15);
    }
  }

  function toggleChaos() {
    const isCurrentlyChaos = document.body.dataset.chaos === 'true';
    setChaos(!isCurrentlyChaos);
  }

  if (chaosBtn) {
    chaosBtn.addEventListener('click', toggleChaos);
  }

  if (bannerClose) {
    bannerClose.addEventListener('click', () => setChaos(false));
  }

  // Triple-click on brand logo Easter egg trigger
  if (brand) {
    let clicks = 0;
    let timer;
    brand.addEventListener('click', (e) => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 450);
      if (clicks >= 3) {
        e.preventDefault();
        toggleChaos();
        clicks = 0;
      }
    });
  }
}

/* ============================================================
   18. PROJECT 4: RATTLE & BLOCK TOYS
   ============================================================ */

function playRattleSound() {
  if (isMuted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const frequencies = [880, 1174, 1318, 1760];
  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.1, 0.16);
    }, i * 26);
  });
}

function initRattleAndBlocks() {
  // --- Stackable Dream Blocks ---
  const tower = $('blocks-tower');
  const towerBadge = $('tower-count-badge');
  const removeBtn = $('remove-block-btn');
  const toppleBtn = $('topple-blocks-btn');
  const statusEl = $('blocks-status');
  const pickBtns = qsa('.block-pick-btn');

  if (!tower) return;

  const BLOCK_MAP = {
    star: { label: 'Star Block', icon: '⭐', class: 'block-star' },
    moon: { label: 'Moon Block', icon: '🌙', class: 'block-moon' },
    cloud: { label: 'Cloud Block', icon: '☁️', class: 'block-cloud' },
    slumber: { label: 'Slumber Block', icon: '💤', class: 'block-slumber' },
    lullaby: { label: 'Lullaby Block', icon: '🎵', class: 'block-lullaby' },
    wish: { label: 'Wish Block', icon: '💖', class: 'block-wish' }
  };

  const MAX_BLOCKS = 6;
  let stackedBlocks = [];

  function renderTower() {
    tower.innerHTML = '';
    tower.dataset.count = String(stackedBlocks.length);

    if (stackedBlocks.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'tower-empty-hint';
      hint.textContent = '✦ Pick a block above to begin stacking ✦';
      tower.appendChild(hint);
    } else {
      stackedBlocks.forEach((type, idx) => {
        const item = BLOCK_MAP[type];
        if (!item) return;
        const blockEl = document.createElement('div');
        blockEl.className = `tower-block-item ${item.class}`;
        blockEl.setAttribute('role', 'listitem');
        blockEl.innerHTML = `<span>${item.icon}</span> <span>${item.label}</span>`;
        tower.appendChild(blockEl);
      });
    }

    if (towerBadge) {
      towerBadge.textContent = `${stackedBlocks.length} / ${MAX_BLOCKS} blocks stacked`;
    }

    if (removeBtn) {
      removeBtn.disabled = stackedBlocks.length === 0;
    }
    if (toppleBtn) {
      toppleBtn.disabled = stackedBlocks.length === 0;
    }

    pickBtns.forEach(btn => {
      btn.disabled = stackedBlocks.length >= MAX_BLOCKS;
    });
  }

  function addBlock(type) {
    if (stackedBlocks.length >= MAX_BLOCKS) {
      if (statusEl) statusEl.textContent = `Max height reached! The tower touches the stars! ⭐`;
      return;
    }
    stackedBlocks.push(type);
    renderTower();
    const item = BLOCK_MAP[type];
    if (statusEl && item) {
      statusEl.textContent = `Pip's tower is growing! Added ${item.label}. (${stackedBlocks.length}/${MAX_BLOCKS} blocks)`;
    }
    playTone(360 + stackedBlocks.length * 75, 0.16, 0.18);
  }

  function removeTopBlock() {
    if (stackedBlocks.length === 0) return;
    const removedType = stackedBlocks.pop();
    renderTower();
    const item = BLOCK_MAP[removedType];
    if (statusEl && item) {
      statusEl.textContent = `Carefully took down ${item.label}. (${stackedBlocks.length} blocks remaining)`;
    }
    playTone(320, 0.12, 0.14);
  }

  function toppleBlocks() {
    if (stackedBlocks.length === 0) return;
    const blockEls = qsa('.tower-block-item', tower);
    blockEls.forEach(el => el.classList.add('is-toppling'));

    // Playful tumbling cascade sound
    [420, 350, 290, 220].forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.12, 0.15), idx * 60);
    });

    if (removeBtn) removeBtn.disabled = true;
    if (toppleBtn) toppleBtn.disabled = true;

    setTimeout(() => {
      stackedBlocks = [];
      renderTower();
      if (statusEl) {
        statusEl.textContent = 'Crash-tumble! A little star fell asleep. 💤 Ready to build again!';
      }
    }, 550);
  }

  pickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-block-type');
      if (type) addBlock(type);
    });
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', removeTopBlock);
  }
  if (toppleBtn) {
    toppleBtn.addEventListener('click', toppleBlocks);
  }

  renderTower();

  // --- Magical Stardust Rattle ---
  const rattleBtn = $('shake-rattle-btn');
  const rattleCountBadge = $('rattle-count-badge');
  const rattleFeedback = $('rattle-feedback');
  const rattleParticles = $('rattle-particles');

  let rattleCount = 0;
  const rattleMessages = [
    'Jingle-jangle! The nursery sparkles with stardust.',
    'A little star fell asleep listening to the soft chimes.',
    'Pip giggles as the celestial silver bells ring!',
    'A soft lullaby chime drifts over Pillow Mountain.',
    'Warm dreams ripple across the observatory sky.'
  ];

  function shakeRattle() {
    rattleCount++;
    if (rattleCountBadge) {
      rattleCountBadge.textContent = `✨ Shaken ${rattleCount} time${rattleCount === 1 ? '' : 's'}`;
    }

    if (rattleFeedback) {
      rattleFeedback.textContent = rattleMessages[(rattleCount - 1) % rattleMessages.length];
    }

    if (rattleBtn) {
      rattleBtn.classList.remove('is-shaking');
      void rattleBtn.offsetWidth; // Trigger reflow
      rattleBtn.classList.add('is-shaking');
      setTimeout(() => rattleBtn.classList.remove('is-shaking'), 500);
    }

    playRattleSound();

    // Spawn stardust sparkle particles
    if (rattleParticles) {
      const symbols = ['⭐', '✨', '✦', '✧', '💖'];
      for (let i = 0; i < 5; i++) {
        const span = document.createElement('span');
        span.className = 'rattle-sparkle-dot';
        span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        span.style.left = `${30 + Math.random() * 40}%`;
        span.style.top = `${25 + Math.random() * 35}%`;
        span.style.setProperty('--tx', `${(Math.random() - 0.5) * 80}px`);
        span.style.setProperty('--ty', `${-40 - Math.random() * 60}px`);
        span.style.color = ['#fef08a', '#c8b8f0', '#9fd8f2', '#f4a7c8'][Math.floor(Math.random() * 4)];
        rattleParticles.appendChild(span);
        setTimeout(() => span.remove(), 850);
      }
    }
  }

  if (rattleBtn) {
    rattleBtn.addEventListener('click', shakeRattle);
  }
}

/* ============================================================
   19. PROJECT 5: BEDTIME STORYBOOK
   ============================================================ */

function initStorybook() {
  const stage = $('storybook-stage');
  if (!stage) return;

  const pages = qsa('.story-page', stage);
  const dots = qsa('.story-dot', $('story-dots'));
  const pageBadge = $('story-page-badge');
  const prevBtn = $('story-prev-btn');
  const nextBtn = $('story-next-btn');
  const restartBtn = $('story-restart-btn');
  const statusEl = $('story-status');

  let currentPage = 0;
  const totalPages = pages.length;
  let isPageTurning = false;

  const pageTitles = [
    'Chapter 1: A Glimmer in the Grass',
    'Chapter 2: The Moon Garden\'s Whisper',
    'Chapter 3: The Golden Route to Star Harbor',
    'Chapter 4: Safe in the Constellation'
  ];

  function showPage(index) {
    if (isPageTurning) return;
    if (index < 0) index = 0;
    if (index >= totalPages) index = totalPages - 1;
    if (index === currentPage && stage.dataset.initialized === 'true') return;

    isPageTurning = true;
    const oldPage = pages[currentPage];
    const newPage = pages[index];

    if (stage.dataset.initialized === 'true' && oldPage && oldPage !== newPage) {
      oldPage.classList.add('turning-out');
      setTimeout(() => {
        pages.forEach((p, idx) => {
          p.classList.toggle('is-active', idx === index);
          p.classList.remove('turning-out');
        });
        isPageTurning = false;
      }, 240);
    } else {
      pages.forEach((p, idx) => {
        p.classList.toggle('is-active', idx === index);
        p.classList.remove('turning-out');
      });
      isPageTurning = false;
    }

    stage.dataset.initialized = 'true';
    currentPage = index;

    try {
      localStorage.setItem('pmo_story_page', String(currentPage));
    } catch (e) {}

    dots.forEach((dot, idx) => {
      const active = idx === currentPage;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', String(active));
    });

    if (pageBadge) {
      pageBadge.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage === 0;
    }

    if (currentPage === totalPages - 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (restartBtn) restartBtn.style.display = 'inline-flex';
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (restartBtn) restartBtn.style.display = 'none';
    }

    if (statusEl) {
      statusEl.textContent = `Reading ${pageTitles[currentPage]}`;
    }

    playTone(480 + currentPage * 60, 0.12, 0.12);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => showPage(currentPage - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => showPage(currentPage + 1));
  }
  if (restartBtn) {
    restartBtn.addEventListener('click', () => showPage(0));
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => showPage(idx));
  });

  // Keyboard navigation when focusing storybook
  stage.parentElement?.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') {
      if (currentPage < totalPages - 1) showPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft') {
      if (currentPage > 0) showPage(currentPage - 1);
    }
  });

  // Restore saved story page or start at page 0
  let initialStoryPage = 0;
  try {
    const savedP = parseInt(localStorage.getItem('pmo_story_page') || '0', 10);
    if (!isNaN(savedP) && savedP >= 0 && savedP < totalPages) {
      initialStoryPage = savedP;
    }
  } catch (e) {}

  showPage(initialStoryPage);
}

/* ============================================================
   20. PROJECT 6: PIP'S GROWTH CHART
   ============================================================ */

function initGrowthChart() {
  const ruler = qs('.growth-ruler-wood');
  if (!ruler) return;

  const notches = qsa('.milestone-notch', ruler);
  const marker = $('ruler-pip-marker');
  const badge = $('growth-badge');
  const age = $('growth-age');
  const title = $('growth-milestone-title');
  const iconBanner = $('growth-icon-banner');
  const desc = $('growth-desc');
  const quote = $('growth-quote');
  const statusEl = $('growth-status');
  const detailCard = $('growth-detail-card');

  const MILESTONES = {
    4: {
      badge: '4 Dreams Tall',
      age: 'Present Night · Fully Certified',
      title: 'Keeper of the Night Sky',
      icons: '👑 🌌 ⭐',
      desc: 'Now guarding the entire Midnight Observatory! Pip has mastered every dream delivery route, coordinates the lullaby music boxes, and ensures every sleeper tucked in across the world has a gentle star to watch over them.',
      quote: '"No matter how many dreams tall we grow, the best feeling is tucking someone in with sweet thoughts."',
      top: '14px'
    },
    3: {
      badge: '3 Dreams Tall',
      age: 'Night 240 · Apprentice Builder',
      title: 'Junior Dream Engineer',
      icons: '🔭 ⚙️ 🗺️',
      desc: 'Pip calibrated the Great Stardust Reflector, drafted the 4 golden delivery flight routes, and tuned the lullaby music boxes so no note could ever cause a nightmare.',
      quote: '"A dream engineer never goes to sleep without checking that all coordinates are cozy."',
      top: '95px'
    },
    2: {
      badge: '2 Dreams Tall',
      age: 'Night 108 · Cloud Scout',
      title: 'Little Cloud Explorer',
      icons: '☁️ 🪁 🧺',
      desc: 'Tall enough to reach the lower shelf of dream jars! Pip learned to mold fluffy cumulus clouds into sleeping pillows and collected falling stardust in a pocket apron.',
      quote: '"If a cloud looks soft enough to nap on, it probably has a dream hidden inside!"',
      top: '178px'
    },
    1: {
      badge: '1 Dream Tall',
      age: 'Night 42 · First Moonbeams',
      title: 'First Moonlight Steps',
      icons: '🍼 🌙 🐾',
      desc: 'Baby Pip took the very first steps across the observatory roof, learning to hold the tiny brass dream lantern and chasing playful moon-moths into the stargazing meadow.',
      quote: '"Every big journey through the night sky begins with one tiny baby step."',
      top: '258px'
    }
  };

  let activeMilestone = 4;

  function selectMilestone(num) {
    const data = MILESTONES[num];
    if (!data) return;
    activeMilestone = num;

    notches.forEach(n => {
      const match = parseInt(n.getAttribute('data-milestone'), 10) === num;
      n.classList.toggle('is-active', match);
      n.setAttribute('aria-pressed', String(match));
    });

    if (marker) {
      marker.style.top = data.top;
    }

    if (detailCard) {
      detailCard.style.opacity = '0.4';
      detailCard.style.transform = 'translateY(4px)';
      setTimeout(() => {
        if (badge) badge.textContent = data.badge;
        if (age) age.textContent = data.age;
        if (title) title.textContent = data.title;
        if (iconBanner) iconBanner.textContent = data.icons;
        if (desc) desc.textContent = data.desc;
        if (quote) quote.textContent = data.quote;
        if (statusEl) statusEl.textContent = `Showing Milestone ${num}: ${data.title}.`;
        detailCard.style.opacity = '1';
        detailCard.style.transform = 'translateY(0)';
      }, 150);
    }

    playTone(380 + num * 80, 0.16, 0.14);
  }

  notches.forEach(notch => {
    notch.addEventListener('click', () => {
      const m = parseInt(notch.getAttribute('data-milestone'), 10);
      if (m) selectMilestone(m);
    });
  });

  selectMilestone(4);
}

/* ============================================================
   21. DREAM FLASHLIGHT / LANTERN CURSOR
   ============================================================ */

function initFlashlight() {
  const toggleBtn = $('flashlight-toggle');
  const flashlight = $('dream-flashlight');
  if (!flashlight) return;

  let isEnabled = true;
  try {
    const saved = localStorage.getItem('pmo_flashlight');
    if (saved === 'false') isEnabled = false;
  } catch (e) {}

  function setFlashlight(active) {
    isEnabled = active;
    flashlight.classList.toggle('is-off', !active);
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', active);
      toggleBtn.setAttribute('aria-pressed', String(active));
      toggleBtn.setAttribute('aria-label', active ? 'Turn off Dream Lantern cursor light' : 'Turn on Dream Lantern cursor light');
    }
    try {
      localStorage.setItem('pmo_flashlight', String(active));
    } catch (e) {}
  }

  setFlashlight(isEnabled);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      setFlashlight(!isEnabled);
      playClickSound();
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let mouseX = -500;
  let mouseY = -500;
  let rafId = null;

  function updateFlashlightPos() {
    flashlight.style.setProperty('--fl-x', `${mouseX}px`);
    flashlight.style.setProperty('--fl-y', `${mouseY}px`);
    rafId = null;
  }

  // Pointer movement tracking on desktop
  window.addEventListener('mousemove', e => {
    if (!isEnabled) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateFlashlightPos);
    }
  }, { passive: true });

  // Tap-to-illuminate support on touch devices
  window.addEventListener('pointerdown', e => {
    if (!isEnabled) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(updateFlashlightPos);
    }
  }, { passive: true });
}

/* ============================================================
   22. INIT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initSparkleTrail();
  initFlashlight();
  initNav();
  initVisitorCounter();
  initStatusMessages();
  initCharacterReaction();
  initLullabyLab();
  initNightlight();
  initDreamMap();
  initRattleAndBlocks();
  initStorybook();
  initGrowthChart();
  initStory();
  initGuestbook();
  initEasterEgg();
  initThemeToggle();
  initMuteToggle();
  initChaosMode();
  initUiClickSounds();
  initA11y();
});


