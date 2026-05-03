/* ─── WRENCH SPLASH ─── */
(function(){
  var wsP = document.getElementById('wsP');
  for(var i = 0; i < 50; i++){
    var d = document.createElement('div');
    d.className = 'wsp';
    var h = Math.random()*22+6;
    d.style.cssText = 'left:'+(Math.random()*100)+'%;width:1.5px;height:'+h+'px;'+
      'background:rgba('+(Math.random()<.5?'33,210,237':'192,131,252')+',.18);'+
      'animation-duration:'+(Math.random()*2.5+1.5)+'s;'+
      'animation-delay:'+(Math.random()*3)+'s';
    wsP.appendChild(d);
  }

  // Half-wrench SVGs and center seam removed — no reveal needed.

  var done = false;
  function exitSplash(){
    if(done) return; done = true;
    var wsWrench = document.getElementById('wsWrench');
    var wsText   = document.getElementById('wsText');
    var wsSeam   = document.getElementById('wsSeam');
    var wsL      = document.getElementById('wsL');
    var wsR      = document.getElementById('wsR');
    // Start the swipe-up immediately so the page reveals while text/image remain visible.
    var root = document.getElementById('ws-root');
    if(root){
      // trigger swipe animation right away
      root.classList.add('ws-swipe');
      var onEnd = function(){ root.classList.add('ws-gone'); root.removeEventListener('transitionend', onEnd); };
      root.addEventListener('transitionend', onEnd);
      // fallback hide after 1.2s
      setTimeout(function(){ if(!root.classList.contains('ws-gone')) root.classList.add('ws-gone'); }, 1200);
    }
    // continue to split panels slightly after swipe starts for effect
    setTimeout(function(){ if(wsL) wsL.classList.add('ws-split'); if(wsR) wsR.classList.add('ws-split'); }, 200);
  }

  document.getElementById('wsSkip').addEventListener('click', exitSplash);
  setTimeout(exitSplash, 4000);
})();
/* ─── CURSOR ─── */
const blob = document.getElementById('cursor-blob');
let mx=0,my=0,bx=0,by=0;
document.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY;},{passive:true});
(function animCursor(){
  bx+=(mx-bx)*.18; by+=(my-by)*.18;
  blob.style.transform=`translate(${bx-16}px,${by-16}px)`;
  requestAnimationFrame(animCursor);
})();

/* ─── SCROLL PROGRESS ─── */
const bar = document.getElementById('scroll-bar');
const nav = document.getElementById('topnav');
window.addEventListener('scroll',()=>{
  const pct = window.scrollY/(document.documentElement.scrollHeight-window.innerHeight);
  bar.style.transform=`scaleX(${pct})`;
  nav.classList.toggle('inked', window.scrollY>40);
},{passive:true});

/* ─── INTERSECTION OBSERVER — REVEAL ─── */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('visible'); }
  });
},{threshold:.12});
document.querySelectorAll('.fade-up,.fade-left,.fade-right').forEach(el=>revealObserver.observe(el));

/* ─── STEP CONTENT REVEAL WITH STAGGER ─── */
const stepObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const content = e.target.querySelector('.step-content');
      if(content && !content.classList.contains('visible')){
        setTimeout(()=>{ content.classList.add('visible'); }, 200);
      }
    }
  });
},{threshold:.3});
document.querySelectorAll('.step-row').forEach(el=>stepObserver.observe(el));

/* ─── ENHANCE CHAPTER TRANSITIONS WITH SCROLL SHAKE ─── */
const chapters = document.querySelectorAll('.chapter');
const ch1Text = document.querySelector('.ch1-text');
window.addEventListener('scroll', ()=>{
  const scrollY = window.scrollY;
  const ch1Rect = chapters[1]?.offsetTop || 0;
  const progress = Math.max(0, scrollY - ch1Rect + window.innerHeight);
  const intensity = Math.min(progress / window.innerHeight, 1);
  
  if(ch1Text && intensity < 1){
    const xShake = Math.sin(scrollY*.01) * intensity * 3;
    ch1Text.style.transform = `translateX(${xShake}px)`;
  }
},{passive:true});

/* ─── COUNTER ANIMATION ─── */
function animateCounter(el){
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  const update = (now)=>{
    const t = Math.min((now-start)/duration,1);
    const ease = 1-Math.pow(1-t,4);
    el.textContent = Math.floor(ease*target).toLocaleString();
    if(t<1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(update);
}
const counterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.animation = 'tensorBuild .6s cubic-bezier(.16,1,.3,1) forwards';
      setTimeout(()=>animateCounter(e.target), 200);
      counterObserver.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('[data-target]').forEach(el=>counterObserver.observe(el));

/* ─── AMPLIFIED MISSED CALLS ANIMATION ─── */
const callObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const calls = document.querySelectorAll('.missed-call');
      calls.forEach((mc, idx)=>{ 
        setTimeout(()=>{ mc.classList.add('show'); }, idx*120); 
      });
      const total = document.getElementById('total-loss');
      if(total) setTimeout(()=>{ total.style.opacity='1'; }, calls.length*120 + 300);
      callObserver.disconnect();
    }
  });
},{threshold:.2});
const callStream = document.getElementById('callStream');
if(callStream) callObserver.observe(callStream);

/* ─── ETA TICKER ─── */
let eta=12;
const etaEl=document.getElementById('eta-display');
setInterval(()=>{
  eta = eta>7 ? eta-1 : 12;
  if(etaEl) etaEl.textContent=`${eta} min response`;
},2500);

/* ─── DROPLET CANVAS ─── */
const canvas = document.getElementById('dropCanvas');
const ctx = canvas.getContext('2d');
let drops=[];
let time = 0;

function resizeCanvas(){
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize',resizeCanvas);

class Drop {
  constructor(){
    this.reset();
    this.pulse = Math.random();
  }
  reset(){
    this.x = Math.random()*canvas.width;
    this.y = Math.random()*canvas.height*-.5 - 20;
    this.r = Math.random()*2.5+.5;
    this.speed = Math.random()*.8+.3;
    this.opacity = Math.random()*.5+.1;
    this.wobble = Math.random()*Math.PI*2;
    this.wobbleSpeed = (Math.random()-.5)*.02;
  }
  update(){
    this.y += this.speed;
    this.wobble += this.wobbleSpeed;
    this.x += Math.sin(this.wobble)*.4;
    this.pulse += .02;
    if(this.y>canvas.height+20) this.reset();
  }
  draw(){
    ctx.save();
    const pulseEffect = Math.sin(this.pulse) * .3 + .7;
    ctx.globalAlpha = this.opacity * pulseEffect;
    ctx.fillStyle = '#21d2ed';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#21d2ed';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.r*.7, this.r*1.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

for(let i=0;i<90;i++) drops.push(new Drop());

function animDrops(){
  time++;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drops.forEach(d=>{d.update();d.draw();});
  requestAnimationFrame(animDrops);
}
animDrops();

/* ─── ENHANCED WAVE ANIMATION ─── */
const wave1 = document.getElementById('wave1');
const wave2 = document.getElementById('wave2');
let wt=0;

function makeWave(t, amp, freq, phase, yOffset){
  let d = `M0,${yOffset}`;
  for(let x=0;x<=1440;x+=10){
    const y = yOffset + Math.sin((x*freq)+t+phase)*amp
             + Math.sin((x*freq*.5)+t*1.3+phase)*amp*.5
             + Math.sin((x*freq*.3)+t*0.8+phase)*amp*.3;
    d += ` L${x},${y}`;
  }
  d += ` L1440,600 L0,600 Z`;
  return d;
}

let waveIntensity = 0;
window.addEventListener('scroll',()=>{
  const ch2 = document.querySelector('#ch2');
  if(ch2){
    const rect = ch2.getBoundingClientRect();
    waveIntensity = Math.max(0, 1 - Math.abs(rect.top) / window.innerHeight);
  }
},{passive:true});

function animWaves(){
  wt += .012 + waveIntensity * .008;
  if(wave1) wave1.setAttribute('d', makeWave(wt, 38 + waveIntensity*15, .006, 0, 300));
  if(wave2) wave2.setAttribute('d', makeWave(wt, 28 + waveIntensity*12, .008, Math.PI, 360));
  requestAnimationFrame(animWaves);
}
animWaves();

/* ─── ADVANCED SCROLL PARALLAX ─── */
window.addEventListener('scroll',()=>{
  const y = window.scrollY;
  const hero = document.querySelector('.cold-open-wrap');
  if(hero) hero.style.transform = `translateY(${y*.25}px)`;
  
  const ch1Inner = document.querySelector('.ch1-inner');
  if(ch1Inner){
    const ch1Top = document.querySelector('#ch1')?.offsetTop || 0;
    const depth = Math.max(0, y - ch1Top + window.innerHeight);
    const parallaxShift = depth * .08;
    ch1Inner.style.transform = `translateY(${parallaxShift}px)`;
  }
  
  const chapters = document.querySelectorAll('.chapter');
  chapters.forEach((ch, idx) => {
    const rect = ch.getBoundingClientRect();
    ch.style.opacity = Math.max(0.7, 1 - Math.abs(rect.top / window.innerHeight) * 0.3);
  });
  
  const ctaRings = document.querySelectorAll('.cta-ring');
  if(ctaRings.length > 0){
    const ch6Top = document.querySelector('#ch6')?.offsetTop || 0;
    const distToSection = Math.max(0, ch6Top - y - window.innerHeight);
    const scale = Math.max(1, 1 + (distToSection / 450) * .35);
    const opacity = Math.min(1, 0.95 + (distToSection / 700) * .3);
    ctaRings.forEach(ring => {
      ring.style.transform = `scale(${scale})`;
      ring.style.opacity = Math.min(opacity, 0.95);
    });
  }
},{passive:true});

/* ─── ANIMATED HEADING UNDERLINES ─── */
document.querySelectorAll('.ch-h2').forEach(h2 => {
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.animation = 'headingGlow .8s ease-out forwards';
      }
    });
  }, {threshold:.5});
  observer.observe(h2);
});

const style = document.createElement('style');
style.textContent = `
  @keyframes headingGlow {
    0% { text-shadow: 0 0 0 rgba(57,224,255,.4); }
    50% { text-shadow: 0 0 30px rgba(57,224,255,.8); }
    100% { text-shadow: 0 0 20px rgba(57,224,255,.5); }
  }
  @keyframes chapterIntense {
    0% { opacity:.8; transform: scale(.98); }
    100% { opacity:1; transform: scale(1); }
  }
  @keyframes slideLetterIn {
    0% { opacity:0; transform:translateY(40px); }
    100% { opacity:1; transform:translateY(0); }
  }
`;
document.head.appendChild(style);

/* ─── CONTEXT-AWARE CHAPTER ANIMATIONS ─── */
let currentChapter = 0;
const chapterObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e => {
    if(e.isIntersecting){
      const chNum = parseInt(e.target.id.replace('ch',''));
      currentChapter = chNum;
      
      if(chNum === 1){
        const ch1 = document.querySelector('#ch1');
        if(ch1){
          ch1.style.animation = 'chapterIntense .8s ease-out forwards';
        }
        document.querySelectorAll('.missed-call').forEach((mc, idx) => {
          setTimeout(() => {
            mc.classList.add('show');
            mc.style.animation = 'slideInReveal .5s cubic-bezier(.16,1,.3,1) forwards';
          }, idx * 120);
        });
      }
      if(chNum === 2){
        const claim = document.querySelector('.big-claim');
        if(claim && !claim.classList.contains('blur-in')){
          claim.classList.add('blur-in');
        }
        document.querySelectorAll('.big-claim span').forEach((span, i) => {
          if(span.classList.contains('blur-line')) return;
          span.style.animation = `slideLetterIn .6s cubic-bezier(.16,1,.3,1) forwards`;
          span.style.animationDelay = `${i * 0.15}s`;
        });
      }
      if(chNum === 3){
        document.querySelectorAll('.step-row').forEach((row, i) => {
          setTimeout(() => {
            const content = row.querySelector('.step-content');
            if(content) content.classList.add('visible');
          }, i * 200);
        });
      }
      if(chNum === 4){
        document.querySelectorAll('.metric-block').forEach((metric, i) => {
          setTimeout(() => {
            metric.style.opacity = '1';
            metric.style.transform = 'translateY(0)';
          }, i * 100);
        });
      }
      if(chNum === 5){
        document.querySelectorAll('.team-card').forEach((card, i) => {
          const delay = i === 0 ? 0.2 : 0.4;
          card.style.animationDelay = `${delay}s`;
        });
      }
    }
  });
}, {threshold:.3});

document.querySelectorAll('.chapter').forEach(ch => chapterObserver.observe(ch));

/* ─── FORM INPUT ENHANCEMENT ─── */
document.querySelectorAll('.cf-label input, .cf-label textarea').forEach(input => {
  input.addEventListener('focus', function() {
    this.parentElement.style.setProperty('--input-glow', '1');
    this.style.boxShadow = `0 0 0 3px rgba(57,224,255,.25), inset 0 0 0 1px rgba(57,224,255,.6)`;
  });
  input.addEventListener('blur', function() {
    this.parentElement.style.setProperty('--input-glow', '0');
    this.style.boxShadow = `0 0 0 3px rgba(57,224,255,.12), inset 0 0 0 1px rgba(57,224,255,.3)`;
  });
  input.addEventListener('input', function() {
    const filled = this.value.length > 0;
    this.style.borderColor = filled ? 'rgba(57,224,255,.7)' : 'rgba(57,224,255,.25)';
  });
});

/* ─── ANIMATED FOOTER ─── */
const footer = document.querySelector('footer');
if(footer) {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.animation = 'slideInReveal .8s cubic-bezier(.16,1,.3,1) forwards';
      }
    });
  }, {threshold: 0.5});
  footerObserver.observe(footer);
}

/* ─── DYNAMIC TEXT REVEAL ON SCROLL ─── */
const textRevealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e => {
    if(e.isIntersecting && !e.target.dataset.revealed){
      e.target.dataset.revealed = 'true';
      e.target.style.animation = 'fadeUp .8s cubic-bezier(.16,1,.3,1) forwards';
    }
  });
}, {threshold:.2});

document.querySelectorAll('.ch-body, .claim-sub, .cta-sub').forEach(el => {
  textRevealObserver.observe(el);
});

/* ─── SCROLL-LINKED VS-TEXT INTENSITY ─── */
const vsText = document.querySelector('.vs-text');
if(vsText){
  window.addEventListener('scroll',()=>{
    const rect = vsText.getBoundingClientRect();
    const visibility = Math.max(0, 1 - Math.abs(rect.top) / window.innerHeight);
    const blur = 10 - visibility * 8;
    const scale = 0.9 + visibility * 0.1;
    const rotate = visibility * 5;
    vsText.style.filter = `blur(${blur}px)`;
    vsText.style.transform = `scale(${scale}) rotateZ(${rotate}deg)`;
  }, {passive:true});
}

/* ─── ADVANCED WORD-BY-WORD REVEAL ─── */
function revealTextByWord(selector) {
  const elements = document.querySelectorAll(selector);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.revealed) {
        entry.target.dataset.revealed = 'true';
        const text = entry.target.textContent;
        const words = text.split(' ');
        entry.target.innerHTML = words.map((word, i) => 
          `<span style="opacity:0; display:inline-block; vertical-align:baseline; animation:scaleInWord .4s cubic-bezier(.16,1,.3,1) forwards; animation-delay:${i * 0.08}s;">${word}</span>`
        ).join(' ');
      }
    });
  }, { threshold: 0.3 });
  
  elements.forEach(el => observer.observe(el));
}

revealTextByWord('.ch-body, .claim-sub');

/* ─── ENHANCED STEP CONNECTOR ANIMATION ─── */
const connectors = document.querySelectorAll('.step-connector::before');
if(connectors.length > 0) {
  window.addEventListener('scroll', () => {
    connectors.forEach((connector, idx) => {
      const stepRow = connector.closest('.step-row');
      if(stepRow) {
        const rect = stepRow.getBoundingClientRect();
        const progress = Math.max(0, 1 - (rect.top / window.innerHeight));
        const opacity = Math.min(progress * 1.5, 1);
        connector.style.opacity = opacity;
      }
    });
  }, { passive: true });
}

/* ─── MAGNETIC BUTTON EFFECT ─── */
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

/* ─── SCROLL-BASED METRIC GLOW ─── */
const metrics = document.querySelectorAll('.metric-block');
window.addEventListener('scroll', () => {
  metrics.forEach(metric => {
    const rect = metric.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if(inView) {
      const intensity = Math.max(0, 1 - Math.abs((window.innerHeight / 2 - rect.top) / window.innerHeight));
      const num = metric.querySelector('.metric-num');
      if(num) {
        num.style.textShadow = `0 0 ${20 + intensity * 40}px rgba(57,224,255,${0.4 + intensity * 0.6}), 0 0 ${10 + intensity * 20}px rgba(72,243,176,${0.2 + intensity * 0.3})`;
      }
    }
  });
}, { passive: true });

/* ─── SERVICE WORKER CACHE ─── */
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // Cache is optional; fail silently if registration is blocked.
    });
  });
}

/* ─── SPLASH SCREEN WITH GSAP ─── */
(function() {
  var drops = document.getElementById('splashDrops');
  for (var i = 0; i < 55; i++) {
    var d = document.createElement('div');
    d.className = 'sdrop';
    var h = Math.random() * 28 + 8;
    d.style.cssText = [
      'left:' + (Math.random()*100) + '%',
      'height:' + h + 'px',
      'opacity:' + (Math.random()*0.4+0.1),
      'animation-duration:' + (Math.random()*2.5+1.5) + 's',
      'animation-delay:' + (Math.random()*3) + 's'
    ].join(';');
    drops.appendChild(d);
  }
  
  var splashRoot = document.getElementById('splash-root');
  var skipBtn = document.getElementById('splashSkip');
  var splashRemoved = false;
  
  function removeSplash() {
    if (splashRemoved) return;
    splashRemoved = true;
    // no external animation handles to destroy when using PNG
    if (splashRoot.parentNode) splashRoot.parentNode.removeChild(splashRoot);
  }
  
  // Register GSAP plugin
  gsap.registerPlugin(ScrollTrigger);
  
  // Create splash exit animation using GSAP ScrollTrigger
  gsap.timeline({
    scrollTrigger: {
      trigger: splashRoot,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      markers: false,
      onComplete: removeSplash
    }
  })
  .from(splashRoot, {
    opacity: 1,
    y: 0,
    duration: 1
  }, 0)
  .to(splashRoot, {
    opacity: 0,
    y: -window.innerHeight,
    duration: 1
  }, 0);
  
  // Skip button handler
  skipBtn.addEventListener('click', () => {
    gsap.globalTimeline.getChildren().forEach(tween => {
      if (tween.scrollTrigger?.trigger === splashRoot) {
        tween.scrollTrigger.disable();
      }
    });
    gsap.to(splashRoot, {
      opacity: 0,
      y: -window.innerHeight * 1.5,
      duration: 0.6,
      ease: 'power3.out',
      onComplete: removeSplash
    });
  });
  
  // Fallback timeout
  setTimeout(() => {
    if (!splashRemoved) {
      skipBtn.click();
    }
  }, 4000);
})();


