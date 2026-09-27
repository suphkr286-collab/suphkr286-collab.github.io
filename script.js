/* ==========================================================================
   Main Controller — Intro + Portfolio + Lanyard Physics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ──────────────────────────────────────────────────────────────
  const introOverlay   = document.getElementById('introOverlay');
  const introScene1    = document.getElementById('introScene1');
  const introScene2    = document.getElementById('introScene2');
  const introEnterBtn  = document.getElementById('introEnterBtn');
  const portfolioPage  = document.getElementById('portfolioPage');
  const badgeStage     = document.getElementById('badgeStage');
  const lanyardCard    = document.getElementById('lanyardCard');
  const strapPath      = document.getElementById('strapPath');
  const strapShadow    = document.getElementById('strapShadow');
  const btnReplayAnim  = document.getElementById('btnReplayAnim');

  // ── Spotlight ──────────────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  // A lightweight, decorative fluid field inspired by caustics, ink flow and vapor.
  function initFluidField() {
    const canvas = document.getElementById('fluidField');
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, strength: 0 };
    const particles = [];
    const shootingStars = [];
    let stars = [];
    let viewWidth = 0;
    let viewHeight = 0;
    let scale = 1;
    let time = 0;
    let lastParticleAt = 0;
    let nextShootingStarAt = performance.now() + 1800;
    let previousFrameAt = 0;

    function resize() {
      viewWidth = window.innerWidth;
      viewHeight = window.innerHeight;
      scale = Math.min(0.7, 1000 / Math.max(viewWidth, viewHeight));
      canvas.width = Math.max(1, Math.round(viewWidth * scale));
      canvas.height = Math.max(1, Math.round(viewHeight * scale));
      context.setTransform(scale, 0, 0, scale, 0, 0);
      const starCount = Math.min(220, Math.max(100, Math.round((viewWidth * viewHeight) / 6500)));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * viewWidth,
        y: Math.random() * viewHeight,
        radius: 0.45 + Math.random() * 1.15,
        alpha: 0.2 + Math.random() * 0.62,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 1.25,
        tint: Math.random() > 0.68 ? '190, 190, 255' : '225, 235, 255',
      }));
    }

    function drawNebula() {
      context.clearRect(0, 0, viewWidth, viewHeight);
      context.save();
      context.globalCompositeOperation = 'screen';
      context.filter = `blur(${Math.max(36, Math.min(76, viewWidth * 0.045))}px)`;

      const pools = [
        { x: 0.18, y: 0.28, hue: '100, 72, 230', phase: 0 },
        { x: 0.78, y: 0.34, hue: '54, 104, 220', phase: 2.1 },
        { x: 0.51, y: 0.78, hue: '154, 70, 210', phase: 4.2 },
      ];
      pools.forEach((pool, index) => {
        const x = viewWidth * pool.x + Math.sin(time * 0.16 + pool.phase) * viewWidth * 0.075;
        const y = viewHeight * pool.y + Math.cos(time * 0.14 + pool.phase) * viewHeight * 0.065;
        const radius = Math.max(220, viewWidth * (0.21 + index * 0.018));
        const glow = context.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(${pool.hue}, 0.2)`);
        glow.addColorStop(0.45, `rgba(${pool.hue}, 0.07)`);
        glow.addColorStop(1, `rgba(${pool.hue}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.ellipse(x, y, radius, radius * 0.57, Math.sin(time * 0.12 + pool.phase) * 0.24, 0, Math.PI * 2);
        context.fill();
      });

      context.filter = 'none';
      context.globalAlpha = 0.28;
      context.lineWidth = 1;
      context.shadowColor = 'rgba(151, 139, 255, 0.3)';
      context.shadowBlur = 12;
      for (let orbit = 0; orbit < 4; orbit += 1) {
        const cx = viewWidth * (0.18 + orbit * 0.21) + Math.sin(time * 0.12 + orbit) * 35;
        const cy = viewHeight * (0.2 + (orbit % 2) * 0.47) + Math.cos(time * 0.1 + orbit) * 24;
        const rx = viewWidth * (0.17 + (orbit % 2) * 0.035);
        const ry = viewHeight * (0.1 + (orbit % 3) * 0.025);
        const arc = context.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
        arc.addColorStop(0, 'rgba(104, 119, 255, 0)');
        arc.addColorStop(0.48, 'rgba(179, 168, 255, 0.44)');
        arc.addColorStop(1, 'rgba(116, 185, 255, 0)');
        context.strokeStyle = arc;
        context.beginPath();
        context.ellipse(cx, cy, rx, ry, -0.25 + orbit * 0.14 + Math.sin(time * 0.08 + orbit) * 0.035,
          0.18 + orbit * 0.18, Math.PI * (1.22 + orbit * 0.035));
        context.stroke();
      }
      context.restore();

      stars.forEach((star) => {
        const twinkle = 0.62 + Math.sin(time * star.speed + star.phase) * 0.38;
        context.globalAlpha = star.alpha * twinkle;
        context.fillStyle = `rgb(${star.tint})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
        if (star.radius > 1.32 && twinkle > 0.86) {
          context.globalAlpha = star.alpha * 0.42;
          context.fillRect(star.x - 3, star.y - 0.35, 6, 0.7);
          context.fillRect(star.x - 0.35, star.y - 3, 0.7, 6);
        }
      });
      context.globalAlpha = 1;
    }

    function drawPointerWake() {
      if (pointer.strength > 0.015) {
        context.save();
        context.globalCompositeOperation = 'screen';
        context.lineWidth = 1.2;
        for (let ring = 0; ring < 3; ring += 1) {
          const radius = 22 + ring * 19 + (1 - pointer.strength) * 18;
          context.strokeStyle = `rgba(164, 157, 255, ${pointer.strength * (0.18 - ring * 0.04)})`;
          context.beginPath();
          context.ellipse(pointer.x, pointer.y, radius * 1.3, radius * 0.72, time * 0.13 + ring, 0, Math.PI * 2);
          context.stroke();
        }
        context.restore();
        pointer.strength *= 0.94;
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.018;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }
        context.beginPath();
        context.fillStyle = `rgba(200, 207, 255, ${particle.life * 0.55})`;
        context.arc(particle.x, particle.y, particle.radius * particle.life, 0, Math.PI * 2);
        context.fill();
      }
    }

    function drawShootingStars(now, deltaMs) {
      if (!reduceMotion && now >= nextShootingStarAt) {
        const angleX = -(0.7 + Math.random() * 0.24);
        const angleY = 0.45 + Math.random() * 0.36;
        const magnitude = Math.hypot(angleX, angleY);
        shootingStars.push({
          x: viewWidth * (0.48 + Math.random() * 0.62),
          y: viewHeight * (Math.random() * 0.46 - 0.04),
          vx: (angleX / magnitude) * (0.55 + Math.random() * 0.45),
          vy: (angleY / magnitude) * (0.55 + Math.random() * 0.45),
          tail: 100 + Math.random() * 100,
          life: 650 + Math.random() * 450,
          maxLife: 1100,
          width: 1 + Math.random() * 1.2,
        });
        nextShootingStarAt = now + 2800 + Math.random() * 4700;
      }

      context.save();
      context.globalCompositeOperation = 'screen';
      for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
        const meteor = shootingStars[index];
        meteor.x += meteor.vx * deltaMs;
        meteor.y += meteor.vy * deltaMs;
        meteor.life -= deltaMs;
        if (meteor.life <= 0 || meteor.x < -meteor.tail || meteor.y > viewHeight + meteor.tail) {
          shootingStars.splice(index, 1);
          continue;
        }

        const fade = Math.min(1, (meteor.maxLife - meteor.life) / 120, meteor.life / 240);
        const tailX = meteor.x - meteor.vx / Math.hypot(meteor.vx, meteor.vy) * meteor.tail;
        const tailY = meteor.y - meteor.vy / Math.hypot(meteor.vx, meteor.vy) * meteor.tail;
        const trail = context.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
        trail.addColorStop(0, `rgba(255, 255, 255, ${fade * 0.95})`);
        trail.addColorStop(0.16, `rgba(199, 211, 255, ${fade * 0.7})`);
        trail.addColorStop(1, 'rgba(131, 151, 255, 0)');

        context.globalAlpha = fade;
        context.strokeStyle = trail;
        context.lineWidth = meteor.width;
        context.lineCap = 'round';
        context.shadowColor = 'rgba(170, 185, 255, 0.85)';
        context.shadowBlur = 9;
        context.beginPath();
        context.moveTo(meteor.x, meteor.y);
        context.lineTo(tailX, tailY);
        context.stroke();

        context.shadowBlur = 12;
        context.fillStyle = `rgba(255, 255, 255, ${fade})`;
        context.beginPath();
        context.arc(meteor.x, meteor.y, meteor.width * 1.25, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    function pointerMove(event) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (reduceMotion) return;
      pointer.strength = Math.min(1, pointer.strength + 0.3);
      const now = performance.now();
      if (now - lastParticleAt > 45) {
        lastParticleAt = now;
        particles.push({
          x: pointer.x + (Math.random() - 0.5) * 8,
          y: pointer.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.35 - Math.random() * 0.65,
          radius: 1.2 + Math.random() * 2,
          life: 0.8 + Math.random() * 0.2,
        });
      }
    }

    function animate() {
      if (document.hidden || !portfolioPage.classList.contains('visible')) {
        window.setTimeout(animate, 240);
        return;
      }
      const now = performance.now();
      const deltaMs = previousFrameAt ? Math.min(40, now - previousFrameAt) : 16.67;
      previousFrameAt = now;
      drawNebula();
      drawShootingStars(now, deltaMs);
      drawPointerWake();
      if (!reduceMotion) {
        time += 0.012;
        window.requestAnimationFrame(animate);
      }
    }

    resize();
    animate();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('pointermove', pointerMove, { passive: true });
  }

  initFluidField();

  document.addEventListener('pointermove', (event) => {
    const project = event.target.closest?.('.work-project');
    const thumb = project?.querySelector('.work-card-thumb');
    if (!thumb) return;
    const bounds = thumb.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    thumb.style.setProperty('--ink-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    thumb.style.setProperty('--ink-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════════════════
     INTRO SEQUENCE  (Scene1 → 3 s → Scene2 → user clicks "enter")
     ══════════════════════════════════════════════════════════════════════════ */
  let introT1 = null, introT2 = null;

  function runIntro() {
    clearTimeout(introT1); clearTimeout(introT2);

    // Reset both scenes
    introScene1.className = 'intro-scene';
    introScene2.className = 'intro-scene';

    // Tiny delay so CSS transition fires properly
    requestAnimationFrame(() => setTimeout(() => {
      // ① Enter Scene 1
      introScene1.classList.add('enter');

      // ② After 3 s → exit Scene 1, enter Scene 2
      introT1 = setTimeout(() => {
        introScene1.classList.replace('enter', 'exit');

        introT2 = setTimeout(() => {
          introScene2.classList.add('enter');
        }, 500); // small gap between scenes

      }, 3000);
    }, 40));
  }

  // Start intro on load
  runIntro();

  // "Enter Portfolio" button
  introEnterBtn.addEventListener('click', () => {
    // Fade out intro overlay
    introOverlay.classList.add('hidden');
    introOverlay.inert = true;

    // Show portfolio page
    portfolioPage.classList.add('visible');

    // Kick-off badge physics
    initBadgePhysics();
  });

  /* ══════════════════════════════════════════════════════════════════════════
     LANYARD BADGE — 2D Physics (spring-pendulum)
     ══════════════════════════════════════════════════════════════════════════

     Strategy: all coordinates are in the badge-stage's LOCAL space.
     The SVG is `position:absolute; inset:0` inside badge-stage, so
     SVG (0,0) == badge-stage top-left.
     The card is `position:absolute` inside badge-stage, positioned via
     style.left / style.top (not transform), so it also uses the same space.
     Only rotation is applied via transform on the card.
     This guarantees the strap end-point always matches the card's clip position.
  ══════════════════════════════════════════════════════════════════════════ */
  const CARD_W       = 230;   // px — must match CSS
  const CLIP_OFFSET  = 30;    // px from card top-left to the clip centre (vertically)
  const HOOK_TOP     = 14;    // px from stage top to the ceiling hook centre
  const REST_LEN     = 130;   // px — relaxed strap length
  const SPRING_K     = 0.07;
  const DAMPING      = 0.87;
  const GRAVITY      = 0.52;
  const PEND_K       = 0.045;
  const ROT_DAMP     = 0.89;

  let stageW, stageH;
  let anchor    = { x: 0, y: HOOK_TOP };
  let restPos   = { x: 0, y: HOOK_TOP + REST_LEN };
  let pos       = { x: 0, y: 0 };
  let vel       = { x: 0, y: 0 };
  let angle     = 0;
  let angleVel  = 0;

  let dragging     = false;
  let dragOffsetX  = 0;
  let dragOffsetY  = 0;
  let lastMX       = 0, lastMY = 0;
  let mouseVX      = 0, mouseVY = 0;

  let rafId        = null;
  let physicsReady = false;

  function measureStage() {
    const r   = badgeStage.getBoundingClientRect();
    stageW    = r.width;
    stageH    = r.height;
    anchor.x  = stageW / 2;
    restPos.x = stageW / 2;
  }

  function dropIn() {
    measureStage();
    pos.x    = restPos.x;
    pos.y    = -350;            // well above the stage
    vel.x    = (Math.random() - 0.5) * 3;
    vel.y    = 10;
    angle    = (Math.random() - 0.5) * 15;
    angleVel = 0;
  }

  // Position the card so its clip (top-centre) is at `pos`
  function applyCardTransform() {
    // card left: pos.x - half card width
    // card top : pos.y - clip offset (so clip centre aligns to pos)
    const cardLeft = pos.x - CARD_W / 2;
    const cardTop  = pos.y - CLIP_OFFSET;
    lanyardCard.style.left      = `${cardLeft}px`;
    lanyardCard.style.top       = `${cardTop}px`;
    lanyardCard.style.transform = `rotate(${angle}deg)`;
    lanyardCard.style.transformOrigin = `${CARD_W / 2}px ${CLIP_OFFSET}px`;
  }

  // Draw the strap from anchor → card clip, both in stage-local px
  function drawStrap(deg) {
    const ax = anchor.x;
    const ay = anchor.y;
    const bx = pos.x;                  // card clip x
    const by = pos.y;                  // card clip y
    // gentle natural curve offset by swing angle
    const cx = (ax + bx) / 2 + deg * 0.22;
    const cy = (ay + by) / 2;
    const d  = `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`;
    strapPath.setAttribute('d', d);
    strapShadow.setAttribute('d', d);
  }

  function physicsStep() {
    if (!dragging) {
      const dx = pos.x - restPos.x;
      const dy = pos.y - restPos.y;
      vel.x += -SPRING_K * dx;
      vel.y += -SPRING_K * dy + GRAVITY;
      vel.x *= DAMPING;
      vel.y *= DAMPING;
      pos.x += vel.x;
      pos.y += vel.y;

      const natAngle = ((pos.x - anchor.x) / Math.max(REST_LEN, 1)) * 38;
      angleVel += -PEND_K * (angle - natAngle);
      angleVel *= ROT_DAMP;
      angle    += angleVel;
    }

    applyCardTransform();
    drawStrap(angle);
    rafId = requestAnimationFrame(physicsStep);
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function ptrDown(e) {
    dragging    = true;
    const cx    = e.touches ? e.touches[0].clientX : e.clientX;
    const cy    = e.touches ? e.touches[0].clientY : e.clientY;
    const sr    = badgeStage.getBoundingClientRect();
    // offset from card clip point to mouse
    dragOffsetX = cx - sr.left - pos.x;
    dragOffsetY = cy - sr.top  - pos.y;
    lastMX      = cx; lastMY = cy;
    mouseVX     = 0;  mouseVY = 0;
    lanyardCard.style.cursor = 'grabbing';
  }

  function ptrMove(e) {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    mouseVX  = cx - lastMX;
    mouseVY  = cy - lastMY;
    lastMX   = cx; lastMY = cy;

    if (!dragging) return;

    const sr = badgeStage.getBoundingClientRect();
    const tx = cx - sr.left - dragOffsetX;
    const ty = cy - sr.top  - dragOffsetY;
    pos.x   += (tx - pos.x) * 0.72;
    pos.y   += (ty - pos.y) * 0.72;

    const dispX  = pos.x - anchor.x;
    const tAngle = dispX * 0.13 + mouseVX * 0.8;
    angle       += (tAngle - angle) * 0.32;
  }

  function ptrUp() {
    if (!dragging) return;
    dragging   = false;
    vel.x      = mouseVX * 0.88;
    vel.y      = mouseVY * 0.88;
    angleVel   = mouseVX * 0.48;
    lanyardCard.style.cursor = 'grab';
  }

  lanyardCard.addEventListener('mousedown',  ptrDown);
  window.addEventListener      ('mousemove', ptrMove);
  window.addEventListener      ('mouseup',   ptrUp);
  lanyardCard.addEventListener ('touchstart',ptrDown, { passive: true });
  window.addEventListener      ('touchmove', ptrMove, { passive: true });
  window.addEventListener      ('touchend',  ptrUp);
  window.addEventListener      ('resize',    () => { measureStage(); restPos.x = anchor.x; });

  // ── Public init ────────────────────────────────────────────────────────────
  function initBadgePhysics() {
    if (physicsReady) return;
    physicsReady = true;
    dropIn();
    rafId = requestAnimationFrame(physicsStep);
  }

  // ── Replay left-side animations ──────────────────────────────────────────
  if (btnReplayAnim) {
    btnReplayAnim.addEventListener('click', () => {
      document.querySelectorAll('.anim-item').forEach(el => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
      dropIn();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     SUEA SAMING SHOWCASE & CLAW SLASH TRANSITION CONTROLLER
     ══════════════════════════════════════════════════════════════════════════ */
  const heroSection       = document.getElementById('heroSection');
  const samingSection     = document.getElementById('samingSection');
  const circleTransition  = document.getElementById('circleTransition');
  const clawSlashOverlay  = document.getElementById('clawSlashOverlay');
  const clawScratchImg    = document.getElementById('clawScratchImg');
  const scrollDownBtn     = document.getElementById('scrollDownBtn');
  const btnBackToHero     = document.getElementById('btnBackToHero');
  const btnReplaySlash    = document.getElementById('btnReplaySlash');
  const navHome           = document.getElementById('navHome');
  const navPortfolio      = document.getElementById('navPortfolio');
  const navLogo           = document.getElementById('navLogo');
  const samingRevealItems = Array.from(samingSection.querySelectorAll('.reveal-item'));
  const scrollParallaxItems = Array.from(samingSection.querySelectorAll(
    '.showcase-img, .work-card-thumb img, .desc-text, .saming-main-title, .work-title, .contact-title'
  ));

  let currentSection  = 'hero'; // 'hero' | 'saming'
  let isTransitioning = false;
  let samingRevealObserver = null;
  let scrollParallaxFrame = 0;

  function updateScrollParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || scrollParallaxFrame) return;
    scrollParallaxFrame = requestAnimationFrame(() => {
      scrollParallaxFrame = 0;
      const viewport = samingSection.getBoundingClientRect();
      const viewportCenter = viewport.top + viewport.height / 2;
      const offsets = scrollParallaxItems.map((item) => {
        const bounds = item.getBoundingClientRect();
        const relativeCenter = (bounds.top + bounds.height / 2) - viewportCenter;
        const depth = Math.max(-0.65, Math.min(0.65, relativeCenter / Math.max(1, viewport.height)));
        return [item, `${(-depth * 28).toFixed(2)}px`];
      });
      offsets.forEach(([item, value]) => item.style.setProperty('--scroll-parallax-y', value));
    });
  }

  samingSection.addEventListener('scroll', updateScrollParallax, { passive: true });
  window.addEventListener('resize', updateScrollParallax, { passive: true });

  function resetSamingReveal() {
    samingRevealItems.forEach((item) => {
      item.classList.remove('is-revealed');
      item.style.removeProperty('--reveal-delay');
    });
    samingRevealObserver?.disconnect();
    samingRevealObserver = null;
  }

  function startSamingReveal() {
    resetSamingReveal();
    updateScrollParallax();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    samingRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const index = samingRevealItems.indexOf(item);
        item.style.setProperty('--reveal-delay', `${reduceMotion ? 0 : Math.min(index, 2) * 200}ms`);
        item.classList.add('is-revealed');
        samingRevealObserver.unobserve(item);
      });
    }, { root: samingSection, threshold: 0.16 });

    samingRevealItems.forEach((item) => samingRevealObserver.observe(item));
  }

  // ── Web Audio API: Fierce Tiger Slash Sound Synthesizer ──────────────────
  function playSlashSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      // 1. High-speed whoosh / air-cutting noise
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(600, now);
      bandpass.frequency.exponentialRampToValueAtTime(3600, now + 0.08);
      bandpass.frequency.exponentialRampToValueAtTime(300, now + 0.32);
      bandpass.Q.value = 2.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.65, now + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);

      // 2. Heavy impact bass thud (beast strike resonance)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(150, now + 0.04);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.38);

      subGain.gain.setValueAtTime(0.01, now);
      subGain.gain.setValueAtTime(0.55, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 0.04);
      subOsc.stop(now + 0.45);

      // 3. Metallic slash ring / sharp edge scrape
      const metalOsc = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metalOsc.type = 'triangle';
      metalOsc.frequency.setValueAtTime(880, now + 0.06);
      metalOsc.frequency.exponentialRampToValueAtTime(220, now + 0.28);

      metalGain.gain.setValueAtTime(0.01, now);
      metalGain.gain.setValueAtTime(0.25, now + 0.07);
      metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      metalOsc.connect(metalGain);
      metalGain.connect(ctx.destination);
      metalOsc.start(now + 0.06);
      metalOsc.stop(now + 0.35);

    } catch (e) {
      console.warn('Audio synthesis not supported or blocked:', e);
    }
  }

  // ── Transition: Hero → Suea Saming (defers to commitCircle) ───────────────
  function startTigerTransition() {
    if (isTransitioning || currentSection === 'saming') return;
    // For button / keyboard / nav clicks: jump to 75% then commit
    scrollCircleTarget = 0.75;
    startScrollCircleRAF();
    setTimeout(() => commitCircle(), 80);
  }

  // ── Transition: Suea Saming → Hero (Smooth Return) ──────────────────────
  function startHeroTransition() {
    if (isTransitioning || currentSection === 'hero') return;
    isTransitioning = true;

    samingSection.classList.add('leaving-down');

    setTimeout(() => {
      resetSamingReveal();
      samingSection.classList.remove('active', 'leaving-down', 'showcase-revealed');
      heroSection.classList.add('active');

      if (navHome) navHome.classList.add('active');
      if (navPortfolio) navPortfolio.classList.remove('active');

      // Re-measure stage and drop lanyard badge
      dropIn();

      currentSection  = 'hero';
      isTransitioning = false;
    }, 550);
  }

  // ── Replay Claw Slash Effect directly on Showcase Page ───────────────────
  function replayClawSlash() {
    if (isTransitioning) return;

    // Hard reset overlay animation state
    clawSlashOverlay.classList.remove('slashing', 'active');

    // Force reflow so CSS animations restart clean
    void clawSlashOverlay.offsetWidth;

    clawSlashOverlay.classList.add('active');
    void clawSlashOverlay.offsetWidth;
    clawSlashOverlay.classList.add('slashing');

    playSlashSound();

    document.body.classList.remove('screen-shake');
    void document.body.offsetWidth;
    document.body.classList.add('screen-shake');
    setTimeout(() => { document.body.classList.remove('screen-shake'); }, 450);

    setTimeout(() => {
      clawSlashOverlay.classList.remove('active', 'slashing');
    }, 1400);
  }

  // ── Event Listeners ──────────────────────────────────────────────────────
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', startTigerTransition);
  }

  if (btnBackToHero) {
    btnBackToHero.addEventListener('click', startHeroTransition);
  }

  if (btnReplaySlash) {
    btnReplaySlash.addEventListener('click', replayClawSlash);
  }

  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      startHeroTransition();
    });
  }

  if (navPortfolio) {
    navPortfolio.addEventListener('click', (e) => {
      e.preventDefault();
      startTigerTransition();
    });
  }

  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      startHeroTransition();
    });
  }

  // ── Scroll-Driven Circle Expansion (wheel drives circle size) ─────────────
  const circleDisk = document.getElementById('circleDisk');

  // State for scroll-driven circle
  let scrollCircleProgress = 0;   // 0 → 1 (0% → 160% radius)
  let scrollCircleTarget   = 0;   // target progress from wheel
  let scrollCircleRafId    = null;
  let scrollCircleCommited = false;

  const SCROLL_TOTAL = 280;       // total wheel delta to fill circle (lower = grows faster per tick)
  const COMMIT_THRESHOLD = 0.88;  // at 88% → auto-commit and fire transition

  function updateCircleClipPath(progress) {
    // Map 0–1 to 0%–160%
    const radius = progress * 160;
    circleDisk.style.clipPath = `circle(${radius.toFixed(2)}% at 50% 100%)`;
  }

  function scrollCircleRAF() {
    scrollCircleRafId = null;
    const diff = scrollCircleTarget - scrollCircleProgress;
    if (Math.abs(diff) > 0.0008) {
      scrollCircleProgress += diff * 0.12; // ease factor
      updateCircleClipPath(scrollCircleProgress);
      scrollCircleRafId = requestAnimationFrame(scrollCircleRAF);
    } else {
      scrollCircleProgress = scrollCircleTarget;
      updateCircleClipPath(scrollCircleProgress);
    }
  }

  function startScrollCircleRAF() {
    if (!scrollCircleRafId) {
      scrollCircleRafId = requestAnimationFrame(scrollCircleRAF);
    }
  }

  function commitCircle() {
    // Cancel RAF and let CSS transition finish to 100%
    if (scrollCircleRafId) {
      cancelAnimationFrame(scrollCircleRafId);
      scrollCircleRafId = null;
    }

    // ⓪ Step 0: Immediately put showcase BEHIND the circle
    //    (hero hides, showcase activates underneath — covered by circle overlay)
    heroSection.classList.remove('active');
    samingSection.scrollTop = 0;
    samingSection.classList.remove('showcase-revealed'); // reset reveal state
    samingSection.classList.add('active');
    if (navHome) navHome.classList.remove('active');
    if (navPortfolio) navPortfolio.classList.add('active');

    // Smoothly expand circle to 160% full coverage
    circleDisk.style.transition = 'clip-path 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    circleDisk.style.clipPath = 'circle(160% at 50% 100%)';
    circleDisk.style.opacity  = '1';
    circleTransition.classList.add('committing');

    // Fire the rest of the tiger transition (claw + reveal + cleanup)
    scrollCircleCommited = true;
    isTransitioning = true;

    // ① Claw slash fires when circle is full (~300ms)
    setTimeout(() => {
      clawSlashOverlay.classList.remove('slashing', 'active');
      void clawSlashOverlay.offsetWidth;
      clawSlashOverlay.classList.add('active');
      void clawSlashOverlay.offsetWidth;
      clawSlashOverlay.classList.add('slashing');
      playSlashSound();
      document.body.classList.remove('screen-shake');
      void document.body.offsetWidth;
      document.body.classList.add('screen-shake');
      setTimeout(() => { document.body.classList.remove('screen-shake'); }, 450);
    }, 300);

    // ② Circle starts fading out after claw lands (~500ms)
    //    Showcase content gradually rises and fades into view
    setTimeout(() => {
      circleTransition.classList.add('fading-out');
      samingSection.classList.add('showcase-revealed');
      startSamingReveal();
    }, 500);

    // ③ Claw slash overlay starts fading out smoothly (~950ms)
    setTimeout(() => {
      clawSlashOverlay.classList.add('fade-out');
    }, 950);

    // ④ Full cleanup after fade completes (~1600ms)
    setTimeout(() => {
      circleTransition.classList.remove('committing', 'fading-out');
      circleDisk.style.clipPath = '';
      circleDisk.style.transition = '';
      circleDisk.style.opacity  = '';
      clawSlashOverlay.classList.remove('active', 'slashing', 'fade-out');
      heroSection.classList.remove('leaving-up');
      scrollCircleProgress = 0;
      scrollCircleTarget   = 0;
      scrollCircleCommited = false;
      currentSection  = 'saming';
      isTransitioning = false;
    }, 1600);
  }

  // Wheel scroll detection
  window.addEventListener('wheel', (e) => {
    // Only handle if portfolio page is active (intro done)
    if (!portfolioPage.classList.contains('visible') || isTransitioning) return;

    if (currentSection === 'hero') {
      if (scrollCircleCommited) return;

      e.preventDefault && e.preventDefault();

      // Accumulate progress — circle ONLY grows, never shrinks from scroll
      scrollCircleTarget = Math.min(1,
        scrollCircleTarget + Math.max(0, e.deltaY) / SCROLL_TOTAL
      );

      circleTransition.style.pointerEvents = 'none';
      startScrollCircleRAF();

      // Auto-commit when threshold reached
      if (scrollCircleTarget >= COMMIT_THRESHOLD) {
        commitCircle();
      }

    } else if (currentSection === 'saming') {
      // If at top of saming and scrolling up → go back to hero
      if (samingSection.scrollTop <= 5 && e.deltaY < -20) {
        startHeroTransition();
      }
    }
  }, { passive: false });

  // Touch Swipe detection for mobile devices
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!portfolioPage.classList.contains('visible') || isTransitioning) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY; // > 0 means swiping UP (scrolling down)

    if (currentSection === 'hero') {
      if (diffY > 50) { // Swiped up -> go to showcase
        startTigerTransition();
      }
    } else if (currentSection === 'saming') {
      if (samingSection.scrollTop <= 5 && diffY < -60) { // Swiped down at top -> go back to hero
        startHeroTransition();
      }
    }
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════════════════
     THE WORK — ไพ่บังผลงาน → แตะไพ่เปิดผลงาน → แตะผลงานเปิด modal
     ══════════════════════════════════════════════════════════════════════════ */
  const workSection       = document.getElementById('workSection');
  const workTheater       = document.getElementById('workTheater');
  const workSlots         = document.getElementById('workSlots');
  const workSweepLayer    = document.getElementById('workSweepLayer');
  const btnSwitchWorkCard = document.getElementById('btnSwitchWorkCard');
  const workModal         = document.getElementById('workModal');
  const workModalBackdrop = document.getElementById('workModalBackdrop');
  const workModalClose    = document.getElementById('workModalClose');
  const workModalTitle    = document.getElementById('workModalTitle');
  const workModalVisual   = document.getElementById('workModalVisual');
  const workModalStats    = document.getElementById('workModalStats');
  const workModalText     = document.getElementById('workModalText');
  const workModalTags     = document.getElementById('workModalTags');
  const workFooterCount   = document.getElementById('workFooterCount');
  const workNextAction    = document.getElementById('workNextAction');
  const btnScrollToWork   = document.getElementById('btnScrollToWork');
  const btnViewNewWorks   = document.getElementById('btnViewNewWorks');
  const btnReturnToWorks  = document.getElementById('btnReturnToWorks');
  const newWorksPage      = document.getElementById('newWorksPage');
  const newWorksArrival   = document.getElementById('newWorksArrival');
  const newWorksIntro     = document.getElementById('newWorksIntro');
  const newWorksTerminal  = document.getElementById('newWorksTerminal');
  const newWorksTerminalGrid = document.getElementById('newWorksTerminalGrid');
  const btnRotateNewWorks = document.getElementById('btnRotateNewWorks');
  const newWorksRotatePrompt = document.getElementById('newWorksRotatePrompt');
  const newWorksLeverCaption = document.getElementById('newWorksLeverCaption');

  // Scatter a decorative deck over THE WORK. Pointer movement sweeps cards away.
  const sweepCards = [];
  const sweepSuits = ['♠', '♥', '♦', '♣'];
  const sweepRanks = ['A', 'K', 'Q', 'J', '10'];
  let previousSweepPoint = null;
  let sweepCleared = false;

  function makeSweepCards() {
    if (!workSweepLayer || sweepCards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bounds = workSweepLayer.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const baseCount = Math.min(30, Math.max(18, Math.round((bounds.width * bounds.height) / 30000)));
    const count = baseCount + 30;
    const baseWidth = Math.min(150, Math.max(96, bounds.width * 0.13));

    for (let index = 0; index < count; index += 1) {
      const suit = sweepSuits[Math.floor(Math.random() * sweepSuits.length)];
      const rank = sweepRanks[Math.floor(Math.random() * sweepRanks.length)];
      const card = document.createElement('span');
      const corner = document.createElement('span');
      const center = document.createElement('span');
      const color = suit === '♥' || suit === '♦' ? 'is-red' : 'is-black';
      const width = baseWidth * (0.76 + Math.random() * 0.48);
      const height = width * 1.43;

      card.className = `work-sweep-card ${color}`;
      card.style.width = `${width}px`;
      card.style.left = `${Math.random() * Math.max(0, bounds.width - width)}px`;
      card.style.top = `${Math.random() * Math.max(0, bounds.height - height)}px`;
      card.style.zIndex = String(index + 1);
      card.style.setProperty('--sweep-rotation', `${(Math.random() - 0.5) * 54}deg`);
      corner.className = 'work-sweep-corner';
      corner.textContent = `${rank}${suit}`;
      center.className = 'work-sweep-center';
      center.textContent = suit;
      card.append(corner, center);
      workSweepLayer.appendChild(card);
      sweepCards.push(card);
    }
  }

  function distanceToSweepPath(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const progress = lengthSquared
      ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
      : 1;
    return Math.hypot(point.x - (start.x + progress * dx), point.y - (start.y + progress * dy));
  }

  document.addEventListener('pointermove', (event) => {
    if (!workSweepLayer?.classList.contains('is-active') || sweepCleared) return;

    const point = { x: event.clientX, y: event.clientY };
    const pathStart = previousSweepPoint || point;
    previousSweepPoint = point;
    let sweptThisMove = 0;

    sweepCards.forEach((card) => {
      if (card.classList.contains('is-swept')) return;
      const rect = card.getBoundingClientRect();
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      if (distanceToSweepPath(center, pathStart, point) > Math.max(42, rect.width * 0.58)) return;

      let directionX = point.x - pathStart.x;
      let directionY = point.y - pathStart.y;
      const directionLength = Math.hypot(directionX, directionY) || 1;
      directionX /= directionLength;
      directionY /= directionLength;
      card.style.setProperty('--sweep-x', `${directionX * 460 + (Math.random() - 0.5) * 80}px`);
      card.style.setProperty('--sweep-y', `${directionY * 460 + (Math.random() - 0.5) * 80}px`);
      card.style.setProperty('--sweep-exit-rotation', `${(Math.random() - 0.5) * 300}deg`);
      card.style.transitionDelay = `${Math.random() * 100}ms`;
      card.classList.add('is-swept');
      sweptThisMove += 1;
    });

    if (sweptThisMove && sweepCards.every((card) => card.classList.contains('is-swept'))) {
      sweepCleared = true;
      workSweepLayer.classList.add('is-cleared');
    }
  });

  // Keep the modal outside the transformed section so it always sits above the full page.
  if (workModal && workModal.parentElement !== document.body) {
    document.body.appendChild(workModal);
  }

  const WORK_ITEMS = [
    {
      id: 'saming',
      brand: 'HAMSTER HUB',
      indexLabel: '/01',
      title: 'Game Jam X 3 ชั่วโมง',
      tag: 'Hamster Hub Game Jam X',
      previewTitle: 'Ice War — เกมต่อสู้ส่งน้ำแข็งแข่งทำคะแนน',
      previewLead: 'เกมแบ่งทีมจากโจทย์ “ร้อน” พร้อมสกิลและอุปสรรคระหว่างทาง',
      image: 'assets/work-card-gamejam-x.png',
      detailHeading: 'Hamster Hub Game Jam X — Ice War',
      stats: ['ผู้เข้าแข่งขัน 500 คน', 'พัฒนา 3 วัน', 'ธีม “ร้อน”'],
      detailText: 'Hamster Hub Game Jam X เป็นการแข่งขันพัฒนาเกมภายใต้โจทย์และเวลาจำกัด 3 วัน มีผู้เข้าแข่งขันประมาณ 500 คน รอบนี้ได้ธีม “ร้อน” ผลงาน “Ice War” เป็นเกมต่อสู้แบบแบ่งทีม ผู้เล่นต้องนำน้ำแข็งไปส่งให้ลูกค้าเพื่อเก็บคะแนน ระหว่างทางต้องเจอสกิลที่ผู้เล่นใช้ขัดขวางกันและอุปสรรคต่าง ๆ ก่อนส่งสินค้า ทีมที่เก็บคะแนนได้มากที่สุดเป็นผู้ชนะ',
      tags: ['Hamster Hub', 'Game Jam X', 'Ice War', 'Roblox'],
      showStoryLink: false,
    },
    {
      id: '3pm',
      brand: 'HAMSTER HUB',
      indexLabel: '/02',
      title: 'Game Jam 3 ชั่วโมง',
      tag: 'Hamster Hub Game Jam',
      previewTitle: 'Eternal Bloom — เกมเอาตัวรอดจากซอมบี้เป็น Wave',
      previewLead: 'ร่วมทีมกำจัดซอมบี้และเก็บคะแนนภายในเวลาจำกัด',
      image: 'assets/work-card-gamejam.png',
      detailHeading: 'Hamster Hub Game Jam — Eternal Bloom',
      stats: ['พัฒนา 3 วัน', 'Eternal Bloom', 'Zombie Waves'],
      detailText: 'Hamster Hub Game Jam เป็นการแข่งขันพัฒนาเกมภายใต้โจทย์และเวลาจำกัด 3 วัน ผลงาน “Eternal Bloom” เป็นเกมต่อสู้กับซอมบี้แบบ Wave ที่ผู้เล่นร่วมทีมกำจัดซอมบี้และเก็บคะแนน จุดเด่นคือทีมมีสมาชิกที่ไม่เคยมีพื้นฐานการสร้างเกมมาก่อน จึงฝึกทำเกม Obby ด้วยกันก่อนลงแข่ง เพื่อเรียนรู้ขั้นตอนการสร้างเกมและเตรียมทำงานให้เสร็จในเวลาจำกัด',
      tags: ['Hamster Hub', 'Game Jam', 'Eternal Bloom', 'Zombie Waves'],
      showStoryLink: false,
    },
    {
      id: 'studio',
      brand: 'SAMING',
      indexLabel: '/03',
      title: 'สร้างเกมใน 3 วัน',
      tag: 'Survival Horror — Roblox',
      previewTitle: 'เสือสมิง — สร้างเกมใน 3 วัน',
      previewLead: 'ออกแบบฉากไล่ล่าและระบบเกมด้วย Lua บน Roblox',
      image: 'assets/work-card-saming-3day.png',
      detailHeading: 'เสือสมิง — สร้างเกมใน 3 วัน',
      stats: ['พัฒนา 3 วัน', 'Roblox Studio', 'Lua'],
      detailText: 'ช่วง 3 วันแรกแทบไม่ได้นอน แค่ทำให้ตัวละครเดินได้ก็ใช้เวลานาน พอผ่านพื้นฐานมาได้จึงเริ่มสร้างแผนที่ วางฉาก จัดแสง และออกแบบพื้นที่ให้เหมาะกับการไล่ล่า ทั้งฉากกลางแจ้งยามค่ำคืน ฉากในร่มที่แคบและมืด และฉาก Corridor ที่ให้ความรู้สึกเหมือนติดกับดัก\n\nระบบที่พัฒนามี Timer นับถอยหลัง, Kill Counter แสดงจำนวนผู้รอดชีวิต, Skill ที่ผู้เล่นใช้ระหว่างเกม และ UI แสดงข้อมูลแบบ Real-time ผมเขียนระบบด้วย Lua โดยค้นคว้าจาก Roblox Developer Hub และทดลองแก้ปัญหาเอง บางครั้งใช้เวลาหลายชั่วโมงแก้บั๊กจากการพิมพ์ผิดเพียงตัวเดียว',
      tags: ['Roblox', 'Lua', 'Survival Horror', 'Game Systems'],
      showStoryLink: false,
    },
  ];

  // Keep Terminal projects independent from the poker cards so each preview
  // opens the description that belongs to that exact Terminal item.
  const TERMINAL_ITEMS = [
    {
      ...WORK_ITEMS[0],
      brand: 'GOD FOR GIVES',
      title: 'สร้างเกมใน 7 วัน',
      tag: '7-day Survival Horror',
      previewTitle: 'God for Gives — เกมผีที่สร้างใน 7 วัน',
      previewLead: 'ฝึกสร้างเกมเอาชีวิตรอดจากปีศาจก่อนเริ่มโปรเจกต์ใหญ่',
      image: 'assets/saming-gameplay.png',
      detailHeading: 'God for Gives — สร้างเกมใน 7 วัน',
      stats: ['สร้างใน 7 วัน', 'Survival Horror', 'Holy Week'],
      detailText: '“God for Gives” เป็นเกมผีแนว Survival Horror ที่ผมใช้เวลาสร้างเพียง 7 วัน เพื่อฝึกฝนตัวเองก่อนเริ่มทำโปรเจกต์ใหญ่ร่วมกับคนอื่น ผลงานนี้เป็นการตามความฝันตั้งแต่วัยเด็กที่อยากสร้างเกมผีและมีคนเล่นจริง\n\nเกมนำแนวคิด “Holy Week” หรือสัปดาห์ศักดิ์สิทธิ์ของศาสนาคริสต์มาประยุกต์ใช้ เพื่อสร้างบรรยากาศน่ากลัวและอึดอัด ผู้เล่นต้องคอยระวังและเอาชีวิตรอดจากปีศาจให้ได้จนถึงเช้าวันที่ 7',
      tags: ['God for Gives', '7-Day Challenge', 'Survival Horror', 'Holy Week'],
    },
    {
      ...WORK_ITEMS[1],
      brand: 'HAMSTER HUB',
      title: 'Game Jam 3 ชั่วโมง',
      tag: 'Game Jam Roblox Studio',
      previewTitle: 'One Man Army — เกมยิงซอมบี้มุมกล้องวงจรปิด',
      previewLead: 'ผลงานจากโจทย์ Game Jam Roblox Studio ภายในเวลา 3 ชั่วโมง',
      image: 'assets/3pm-gameplay.png',
      detailHeading: 'Game Jam Roblox Studio — One Man Army',
      stats: ['3 ชั่วโมง', 'One Man Army', 'Hamster Hub'],
      detailText: 'Game Jam Roblox Studio เป็นการแข่งขันพัฒนาเกมภายใต้โจทย์และเวลาจำกัดเพียง 3 ชั่วโมง ผู้ชนะจะได้ไปสอนสร้างเกมที่ Hamster Hub ธีมที่ผมได้รับคือ “One Man Army” ผลงานเป็นเกมยิงซอมบี้ผ่านด่าน\n\nจุดเด่นคือมุมกล้องแบบ Fixed Camera Angle หรือ Fixed Camera Perspective ซึ่งต่างจากมุมกล้องทั่วไปของ Roblox และให้ความรู้สึกเหมือนกำลังมองผ่านกล้องวงจรปิด ช่วยเพิ่มความกดดันระหว่างเล่น การแข่งขันครั้งนี้ยังเป็นการคัดเลือกผู้ไปสอนเด็ก ๆ สร้างเกม Roblox',
      tags: ['Game Jam', 'Roblox Studio', 'One Man Army', 'Fixed Camera'],
    },
    {
      id: 'future-skill-5y',
      brand: 'FUTURE-SKILL',
      indexLabel: '/03',
      title: 'Future-Skill 5Y',
      tag: 'Skill assessment web app',
      previewTitle: 'ค้นหาทักษะที่เหมาะกับอนาคตในอีก 5 ปี',
      previewLead: 'แบบทดสอบ 24 ข้อ ใช้เวลาประมาณ 5–7 นาที พร้อมผลประเมินทักษะ',
      image: 'assets/future-skill-5y.png',
      detailHeading: 'Future-Skill 5Y — เว็บไซต์แนะแนวทักษะ',
      stats: ['นักเรียนมัธยมปลาย', 'คำถาม 24 ข้อ', 'Full-stack Dev'],
      detailText: 'Future-Skill 5Y เป็นเว็บไซต์ที่สร้างขึ้นสำหรับนักเรียนมัธยมศึกษาตอนปลาย เพื่อช่วยค้นหาว่าตนเองยังขาดทักษะด้านใดและควรเสริมทักษะอะไรสำหรับอีก 5 ปีข้างหน้า รูปแบบเป็นแบบสอบถามคล้าย MBTI เมื่อผู้ใช้ตอบครบ 24 ข้อ เว็บไซต์จะแสดงทักษะที่ควรพัฒนา สายที่เหมาะกับผู้ใช้ และบ้านสีที่จัดให้อยู่\n\nผมรับหน้าที่ Full-stack Developer ดูแลการพัฒนาเว็บไซต์ทั้งส่วนหน้าและส่วนหลัง',
      tags: ['Future-Skill 5Y', 'Career Guidance', 'Self Assessment', 'Full-stack'],
      showStoryLink: false,
    },
  ];

  let workSelectedIndex = null;
  let isShufflingWorkCards = false;
  let workModalCloseTimer = null;
  let workModalTrigger = null;

  function updateWorkCardSwitchButton() {
    if (!btnSwitchWorkCard || !workSlots) return;
    const remaining = workSlots.querySelectorAll('.work-slot:not(.is-revealed)').length;
    const canShuffle = remaining > 1;
    btnSwitchWorkCard.disabled = isShufflingWorkCards || !canShuffle;
    btnSwitchWorkCard.setAttribute(
      'aria-label',
      canShuffle ? 'สับเปลี่ยนตำแหน่งไพ่ที่ยังไม่เปิด' : 'มีไพ่ที่ยังไม่เปิดไม่พอให้สลับ'
    );
    btnSwitchWorkCard.title = canShuffle ? 'สลับตำแหน่งไพ่' : 'เหลือไพ่ที่ยังไม่เปิดไม่พอให้สลับ';
  }

  function getWorkItem(project) {
    if (typeof project === 'number') return WORK_ITEMS[project];
    if (typeof project === 'string') {
      return [...WORK_ITEMS, ...TERMINAL_ITEMS].find((item) => item.id === project);
    }
    return project && typeof project === 'object' && project.detailHeading ? project : null;
  }

  function populateWorkModal(project) {
    const item = getWorkItem(project);
    if (!item) return;

    workModalTitle.textContent = item.detailHeading;
    workModalText.textContent = item.detailText;
    workModalVisual.replaceChildren();
    if (item.image) {
      const image = document.createElement('img');
      image.className = 'work-detail-image';
      image.src = item.image;
      image.alt = item.title;
      workModalVisual.appendChild(image);
    } else {
      const voiceVisual = document.createElement('div');
      voiceVisual.className = 'work-detail-voice-visual';
      voiceVisual.setAttribute('role', 'img');
      voiceVisual.setAttribute('aria-label', 'ภาพประกอบเกมสยองขวัญที่ใช้เสียงควบคุม');
      voiceVisual.innerHTML = '<span class="work-detail-voice-orb"></span><span class="work-detail-voice-label">VOICE DETECTED</span>';
      workModalVisual.appendChild(voiceVisual);
    }
    workModalStats.innerHTML = item.stats
      .map((stat) => `<span class="work-detail-stat">${stat}</span>`)
      .join('');
    workModalTags.innerHTML = item.tags.map((tag) => `<li>${tag}</li>`).join('');
  }

  function openWorkDetail(project) {
    const item = getWorkItem(project);
    if (!item || !workModal) return;

    if (workModalCloseTimer !== null) {
      window.clearTimeout(workModalCloseTimer);
      workModalCloseTimer = null;
    }
    workModalTrigger = document.activeElement;
    populateWorkModal(item);
    workModal.hidden = false;
    requestAnimationFrame(() => {
      if (!workModal.hidden) workModal.classList.add('is-open');
    });
    workModalClose?.focus();
  }

  function renderNewWorksTerminal() {
    if (!newWorksTerminalGrid) return;
    newWorksTerminalGrid.replaceChildren();

    TERMINAL_ITEMS.forEach((item, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'terminal-project';
      card.dataset.workIndex = String(index);
      card.dataset.projectId = item.id;
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-controls', 'workModal');
      card.setAttribute('aria-label', `ดูรายละเอียดผลงาน ${item.title}`);

      const artwork = document.createElement('span');
      artwork.className = 'terminal-project-art';
      if (item.image) {
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = `ภาพตัวอย่าง ${item.title}`;
        image.loading = 'lazy';
        artwork.appendChild(image);
      } else {
        const voiceArtwork = document.createElement('span');
        voiceArtwork.className = 'terminal-voice-art';
        voiceArtwork.setAttribute('role', 'img');
        voiceArtwork.setAttribute('aria-label', 'ภาพคลื่นเสียงและไมโครโฟน');
        voiceArtwork.innerHTML = '<span class="terminal-voice-orb"></span><span class="terminal-voice-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
        artwork.appendChild(voiceArtwork);
      }

      const details = document.createElement('span');
      details.className = 'terminal-project-details';
      const meta = document.createElement('span');
      meta.className = 'terminal-project-meta';
      const brand = document.createElement('span');
      brand.textContent = item.brand;
      const projectNumber = document.createElement('span');
      projectNumber.textContent = item.indexLabel;
      meta.append(brand, projectNumber);
      const title = document.createElement('span');
      title.className = 'terminal-project-title';
      title.textContent = item.title;
      const tag = document.createElement('span');
      tag.className = 'terminal-project-tag';
      tag.textContent = item.tag;
      details.append(meta, title, tag);
      card.append(artwork, details);
      card.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openWorkDetail(item);
      });
      newWorksTerminalGrid.appendChild(card);
    });
  }

  renderNewWorksTerminal();

  function showWorkDetails(index) {
    openWorkDetail(index);
  }

  function closeWorkDetail() {
    if (!workModal || workModal.hidden) return;
    workModal.classList.remove('is-open');
    if (workModalCloseTimer !== null) window.clearTimeout(workModalCloseTimer);
    workModalCloseTimer = window.setTimeout(() => {
      workModalCloseTimer = null;
      if (!workModal.classList.contains('is-open')) workModal.hidden = true;
      workModalTrigger?.focus?.({ preventScroll: true });
      workModalTrigger = null;
    }, 220);
  }

  function revealWork(index) {
    if (isShufflingWorkCards) return;
    const slot = workSlots?.querySelector(`.work-slot[data-work-index="${index}"]`);
    if (!slot) return;

    workSelectedIndex = index;
    workTheater.classList.add('has-reveals');
    slot.classList.add('is-revealed');

    const project = slot.querySelector('.work-project');
    if (project) {
      project.tabIndex = 0;
      project.setAttribute('aria-hidden', 'false');
    }
    if (workFooterCount) workFooterCount.textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    updateWorkCardSwitchButton();
    if (!workSlots.querySelector('.work-slot:not(.is-revealed)')) {
      if (workNextAction?.hidden) {
        workNextAction.hidden = false;
        requestAnimationFrame(() => workNextAction.classList.add('is-unlocked'));
      }
    }
  }

  if (workSlots) {
    workSlots.querySelectorAll('.work-slot, .work-slot *').forEach((element) => {
      element.style.setProperty('cursor', 'pointer', 'important');
      element.style.setProperty('user-select', 'none');
    });

    workSlots.querySelectorAll('.poker-card').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (isShufflingWorkCards) return;
        event.stopPropagation();
        revealWork(Number(card.dataset.workIndex));
      });
    });

    workSlots.querySelectorAll('.work-slot').forEach((slot) => {
      slot.addEventListener('click', (event) => {
        if (isShufflingWorkCards) return;
        const index = Number(slot.dataset.workIndex);
        if (slot.classList.contains('is-revealed')) {
          if (event.target.closest('.work-project')) showWorkDetails(index);
          return;
        }
        revealWork(index);
      });
    });

    // Direct binding keeps every pixel of a revealed work block interactive.
    workSlots.querySelectorAll('.work-project').forEach((project) => {
      project.addEventListener('click', (event) => {
        event.stopPropagation();
        showWorkDetails(Number(project.dataset.workIndex));
      });
    });
  }

  function switchWorkCards() {
    if (isShufflingWorkCards || !workSlots) return;

    const originalOrder = Array.from(workSlots.children);
    const unrevealedSlots = originalOrder.filter((slot) => !slot.classList.contains('is-revealed'));
    if (unrevealedSlots.length < 2) {
      updateWorkCardSwitchButton();
      return;
    }

    const shuffledSlots = unrevealedSlots.slice();
    for (let index = shuffledSlots.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1));
      [shuffledSlots[index], shuffledSlots[otherIndex]] = [shuffledSlots[otherIndex], shuffledSlots[index]];
    }
    if (shuffledSlots.every((slot, index) => slot === unrevealedSlots[index])) {
      shuffledSlots.push(shuffledSlots.shift());
    }

    let shuffledIndex = 0;
    const nextOrder = originalOrder.map((slot) => (
      slot.classList.contains('is-revealed') ? slot : shuffledSlots[shuffledIndex++]
    ));

    isShufflingWorkCards = true;
    updateWorkCardSwitchButton();
    btnSwitchWorkCard?.classList.add('is-shuffling');
    workSlots.classList.add('is-shuffling');
    unrevealedSlots.forEach((slot, index) => {
      slot.style.setProperty('--shuffle-delay', `${index * 25}ms`);
    });

    // Move the slots while the cards are turned edge-on, then let them settle.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      nextOrder.forEach((slot) => workSlots.appendChild(slot));
    }, reduceMotion ? 0 : 430);

    window.setTimeout(() => {
      workSlots.classList.remove('is-shuffling');
      btnSwitchWorkCard?.classList.remove('is-shuffling');
      unrevealedSlots.forEach((slot) => slot.style.removeProperty('--shuffle-delay'));
      isShufflingWorkCards = false;
      updateWorkCardSwitchButton();
    }, reduceMotion ? 0 : 930);
  }

  updateWorkCardSwitchButton();
  btnSwitchWorkCard?.addEventListener('click', switchWorkCards);

  workModalClose?.addEventListener('click', closeWorkDetail);
  workModalBackdrop?.addEventListener('click', closeWorkDetail);

  if (btnScrollToWork && workSection) {
    btnScrollToWork.addEventListener('click', () => {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  newWorksArrival?.addEventListener('animationend', (event) => {
    if (event.target === newWorksArrival && event.animationName === 'new-works-rise-in') {
      newWorksPage?.classList.remove('is-entering');
    }
  });

  let isOpeningNewWorks = false;
  function openNewWorksPage() {
    if (isOpeningNewWorks || !newWorksPage) return;
    isOpeningNewWorks = true;
    newWorksPage.classList.remove('is-upright', 'is-entering', 'terminal-open');
    if (newWorksIntro) newWorksIntro.hidden = false;
    if (newWorksTerminal) newWorksTerminal.hidden = true;
    newWorksPage.hidden = false;
    newWorksPage.setAttribute('aria-hidden', 'false');
    if (btnViewNewWorks) btnViewNewWorks.disabled = true;
    if (btnRotateNewWorks) {
      btnRotateNewWorks.disabled = false;
      btnRotateNewWorks.setAttribute('aria-expanded', 'false');
      btnRotateNewWorks.setAttribute('aria-label', 'หมุนคันโยกเพื่อเปิดคลังผลงาน');
    }
    if (newWorksRotatePrompt) newWorksRotatePrompt.textContent = 'หมุนคันโยกเพื่อพลิกหน้าให้ตรง';
    if (newWorksLeverCaption) newWorksLeverCaption.textContent = 'หมุนคันโยก';

    requestAnimationFrame(() => {
      if (samingSection) {
        const sectionTop = samingSection.getBoundingClientRect().top;
        const pageTop = newWorksPage.getBoundingClientRect().top;
        const previousScrollBehavior = samingSection.style.scrollBehavior;
        samingSection.style.scrollBehavior = 'auto';
        samingSection.scrollTop += pageTop - sectionTop;
        samingSection.style.scrollBehavior = previousScrollBehavior;
      }
      newWorksPage.classList.add('is-entering');
      isOpeningNewWorks = false;
      if (btnViewNewWorks) btnViewNewWorks.disabled = false;
    });
  }

  btnViewNewWorks?.addEventListener('click', openNewWorksPage);
  btnRotateNewWorks?.addEventListener('click', () => {
    if (!newWorksPage || newWorksPage.hidden || newWorksPage.classList.contains('terminal-open')) return;
    newWorksPage.classList.add('is-upright', 'terminal-open');
    if (newWorksIntro) newWorksIntro.hidden = true;
    if (newWorksTerminal) newWorksTerminal.hidden = false;
    btnRotateNewWorks.disabled = true;
    btnRotateNewWorks.setAttribute('aria-expanded', 'true');
    btnRotateNewWorks.setAttribute('aria-label', 'เปิดคลังผลงานแล้ว');
    if (newWorksRotatePrompt) newWorksRotatePrompt.textContent = 'คลังผลงานพร้อมใช้งาน';
    if (newWorksLeverCaption) newWorksLeverCaption.textContent = 'เปิดแล้ว';
    requestAnimationFrame(() => newWorksTerminalGrid?.querySelector('.terminal-project')?.focus({ preventScroll: true }));
  });

  btnReturnToWorks?.addEventListener('click', () => {
    workSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      newWorksPage.hidden = true;
      newWorksPage.setAttribute('aria-hidden', 'true');
    }, 850);
  });

  if (workSection && samingSection) {
    const workInViewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          workSection.classList.toggle('work-in-view', entry.isIntersecting);
          if (entry.isIntersecting) makeSweepCards();
          workSweepLayer?.classList.toggle('is-active', entry.isIntersecting && !sweepCleared);
          if (!entry.isIntersecting) previousSweepPoint = null;
        });
      },
      { root: samingSection, threshold: 0.12 }
    );
    workInViewObserver.observe(workSection);
  }

  const contactSection = document.getElementById('contactSection');
  if (contactSection && samingSection) {
    const contactRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        contactSection.classList.add('is-visible');
        contactRevealObserver.unobserve(contactSection);
      });
    }, { root: samingSection, threshold: 0.18 });
    contactRevealObserver.observe(contactSection);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !workModal.hidden) closeWorkDetail();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!portfolioPage.classList.contains('visible') || isTransitioning) return;

    if (currentSection === 'hero') {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        startTigerTransition();
      }
    } else if (currentSection === 'saming') {
      if (samingSection.scrollTop <= 5 && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        e.preventDefault();
        startHeroTransition();
      }
    }
  });

});
