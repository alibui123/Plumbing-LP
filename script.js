const eta = document.getElementById('eta');
const etaFooter = document.getElementById('eta-footer');
const heroVisual = document.querySelector('.hero-visual');
const parallaxLayer = document.querySelector('.phone-shell');
const topbar = document.querySelector('.topbar');
const progressBar = document.querySelector('.scroll-progress');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

const interactiveSelectors = 'a, button, input, textarea, .glass, .floating-chip';
const hasGSAP = typeof window.gsap !== 'undefined';
const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
const prefersFinePointer = window.matchMedia('(pointer: fine)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const enableHeroMotion = false;

if (hasGSAP && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  // Lenis removed — native scroll is faster; Lenis fights the compositor thread
  // Increased lag tolerance so GSAP drops frames gracefully instead of catching up
  gsap.ticker.lagSmoothing(500, 33);

  gsap.set('.reveal', { autoAlpha: 0, y: 34 });

  gsap.utils.toArray('.reveal').forEach((section) => {
    gsap.to(section, {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
      },
    });
  });

  gsap.utils.toArray('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    const value = { n: 0 };
    let lastWritten = -1;

    gsap.to(value, {
      n: target,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: counter,
        start: 'top 82%',
        once: true,
      },
      onUpdate: () => {
        const floored = Math.floor(value.n);
        // Only touch the DOM when the integer value changes
        if (floored !== lastWritten) {
          lastWritten = floored;
          counter.textContent = floored.toString();
        }
      },
      onComplete: () => {
        if (target === 24) counter.textContent = '24/7';
        if (target === 98) counter.textContent = '98%';
        if (target === 2) counter.textContent = '2';
      },
    });
  });

  // Chips only — glows are handled by CSS animation (no GSAP overhead)
  if (enableHeroMotion && !isMobileViewport && !prefersReducedMotion) {
    gsap.to('.floating-chip', {
      y: -10,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      stagger: 0.25,
    });
  }
}

// Scroll progress: scaleX on a full-width element is cheaper than animating width
const updateScrollUI = () => {
  const top = window.scrollY || document.documentElement.scrollTop;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? top / max : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${percent})`;
  if (topbar) topbar.classList.toggle('scrolled', top > 24);
};

updateScrollUI();

// Batched in rAF — prevents multiple recalcs per scroll event
let scrollQueued = false;
const queueScrollUpdate = () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    updateScrollUI();
    scrollQueued = false;
  });
};
window.addEventListener('scroll', queueScrollUpdate, { passive: true });

if (prefersFinePointer && !prefersReducedMotion && cursorDot && cursorRing) {
  // Use event delegation instead of per-element listeners
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) cursorRing.classList.add('active');
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) cursorRing.classList.remove('active');
  }, { passive: true });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  // Dirty flag — rAF loop only runs when there's something to update
  let cursorDirty = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot: move immediately, no lerp needed — translate only, no layout read
    cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    if (!cursorDirty) {
      cursorDirty = true;
      requestAnimationFrame(animateCursor);
    }
  }, { passive: true });

  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    cursorRing.style.transform = `translate(${ringX - 21}px, ${ringY - 21}px)`;
    // Keep running only while ring hasn't caught up
    if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
      requestAnimationFrame(animateCursor);
    } else {
      cursorDirty = false;
    }
  };
}

if (prefersFinePointer && !prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    let rect = null;
    // Read rect on mouseenter when element is stable, not during mousemove
    el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
    window.addEventListener('resize', () => { rect = null; }, { passive: true });

    let magPending = false;
    let lastE = null;
    el.addEventListener('mousemove', (e) => {
      lastE = e;
      if (magPending) return;
      magPending = true;
      requestAnimationFrame(() => {
        if (!rect) rect = el.getBoundingClientRect();
        const offsetX = lastE.clientX - (rect.left + rect.width / 2);
        const offsetY = lastE.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${offsetX * 0.16}px, ${offsetY * 0.16}px)`;
        magPending = false;
      });
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
} else {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.style.transform = 'translate(0,0)';
  });
}

// Particles — fixed positions, avoids layout read per particle
if (heroVisual && enableHeroMotion) {
  const particleLayer = document.createElement('div');
  particleLayer.setAttribute('aria-hidden', 'true');
  particleLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  heroVisual.appendChild(particleLayer);

  const count = 6;
  const cx = 215, cy = 320, radius = 148;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('span');
    particle.className = 'particle';
    const angle = (i / count) * Math.PI * 2;
    particle.style.left = `${cx + Math.cos(angle) * radius}px`;
    particle.style.top = `${cy + Math.sin(angle) * radius}px`;
    particle.style.animationDelay = `${(i * 0.4).toFixed(1)}s`;
    particleLayer.appendChild(particle);
  }
}

let currentEta = 12;
setInterval(() => {
  currentEta = currentEta > 7 ? currentEta - 1 : 12;
  if (eta) eta.textContent = currentEta;
  if (etaFooter) etaFooter.textContent = currentEta;
}, 2500);



// Parallax — gsap.to called on mousemove is expensive; use quickTo instead
if (heroVisual && parallaxLayer && hasGSAP && !isMobileViewport && enableHeroMotion) {
  let parallaxRect = heroVisual.getBoundingClientRect();
  const setX = gsap.quickTo(parallaxLayer, 'x', { duration: 0.35, ease: 'power3.out' });
  const setY = gsap.quickTo(parallaxLayer, 'y', { duration: 0.35, ease: 'power3.out' });
  const setRotateX = gsap.quickTo(parallaxLayer, 'rotateX', { duration: 0.35, ease: 'power3.out' });
  const setRotateY = gsap.quickTo(parallaxLayer, 'rotateY', { duration: 0.35, ease: 'power3.out' });

  window.addEventListener('resize', () => {
    parallaxRect = heroVisual.getBoundingClientRect();
  }, { passive: true });

  heroVisual.addEventListener('mousemove', (e) => {
    const x = (e.clientX - parallaxRect.left) / parallaxRect.width - 0.5;
    const y = (e.clientY - parallaxRect.top) / parallaxRect.height - 0.5;
    setX(x * 18); setY(y * 18);
    setRotateX(y * -8); setRotateY(x * 8);
  }, { passive: true });

  heroVisual.addEventListener('mouseleave', () => {
    gsap.to(parallaxLayer, {
      x: 0, y: 0, rotateX: 0, rotateY: 0,
      duration: 0.6, ease: 'power3.out', overwrite: true,
    });
  });
}