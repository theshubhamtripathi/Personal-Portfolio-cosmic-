/* ============================================================
   PORTFOLIO INTERACTION ENGINE — v2 "Mission Control"
   Shubham Tripathi · Full Stack Developer
   Sections: Setup | Preloader | Theme | Nav | Cursor | Canvas |
   Scroll FX | Tilt | Reveal | Counters | Typewriter | Projects |
   Command Palette | Timeline | Contact | Toast | Utilities
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 1025px)').matches;

/* ============ SETUP: inject ambient elements without touching HTML ============ */
(function injectAmbience() {
    const noise = document.createElement('div');
    noise.id = 'noise-overlay';
    document.body.appendChild(noise);

    if (prefersReducedMotion) return;

    const blobConfigs = [
        { top: '5%', left: '-5%', size: '380px', color: 'rgba(139,92,246,0.5)' },
        { top: '40%', right: '-8%', size: '420px', color: 'rgba(236,72,153,0.45)' },
        { bottom: '5%', left: '10%', size: '340px', color: 'rgba(59,130,246,0.4)' }
    ];
    document.querySelectorAll('section').forEach((section, i) => {
        const cfg = blobConfigs[i % blobConfigs.length];
        const blob = document.createElement('div');
        blob.className = 'mesh-blob';
        Object.assign(blob.style, {
            width: cfg.size, height: cfg.size, background: cfg.color,
            top: cfg.top || 'auto', left: cfg.left || 'auto',
            right: cfg.right || 'auto', bottom: cfg.bottom || 'auto',
            animationDelay: `${i * 1.3}s`
        });
        const computed = getComputedStyle(section);
        if (computed.position === 'static') section.style.position = 'relative';
        section.insertBefore(blob, section.firstChild);
    });
})();

/* ============ PRELOADER ============ */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => preloader.remove(), 800);
        document.body.classList.add('loaded-in');
        startTypewriter();
    }, prefersReducedMotion ? 0 : 900);
});

/* ============ THEME TOGGLE ============ */
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

function syncThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    themeToggleDarkIcon.classList.toggle('hidden', isDark);
    themeToggleLightIcon.classList.toggle('hidden', !isDark);
}

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
syncThemeIcons();

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    syncThemeIcons();
}
themeToggleBtn.addEventListener('click', toggleTheme);

/* ============ MOBILE MENU ============ */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => mobileMenu.classList.toggle('open'));
    if (!mobileMenu.classList.contains('open')) {
        setTimeout(() => mobileMenu.classList.add('hidden'), 500);
    }
});
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        setTimeout(() => mobileMenu.classList.add('hidden'), 500);
    });
});

/* ============ CUSTOM CURSOR + MAGNETIC PULL + COMET TRAIL ============ */
const cursor = document.getElementById('custom-cursor');
const cursorBlur = document.getElementById('custom-cursor-blur');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = mouseX, cursorY = mouseY, blurX = mouseX, blurY = mouseY;

const trailPool = [];
const TRAIL_LENGTH = isDesktop && !prefersReducedMotion ? 10 : 0;
for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    dot.style.opacity = String(1 - i / TRAIL_LENGTH);
    dot.style.transform = 'scale(' + (1 - i / TRAIL_LENGTH) + ')';
    document.body.appendChild(dot);
    trailPool.push({ el: dot, x: mouseX, y: mouseY });
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

let magneticTarget = null;
function updateMagnetic() {
    const magnets = document.querySelectorAll('.cursor-magnetic');
    let closest = null, closestDist = 90;
    magnets.forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dist = Math.hypot(mouseX - cx, mouseY - cy);
        if (dist < closestDist) { closest = { el, cx, cy }; closestDist = dist; }
        else el.style.transform = '';
    });
    if (closest) {
        const pull = 0.35;
        const dx = (mouseX - closest.cx) * pull;
        const dy = (mouseY - closest.cy) * pull;
        closest.el.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    magneticTarget = closest;
}

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    blurX += (mouseX - blurX) * 0.1;
    blurY += (mouseY - blurY) * 0.1;
    cursorBlur.style.left = `${blurX}px`;
    cursorBlur.style.top = `${blurY}px`;

    if (trailPool.length) {
        let prevX = mouseX, prevY = mouseY;
        trailPool.forEach((t) => {
            t.x += (prevX - t.x) * 0.35;
            t.y += (prevY - t.y) * 0.35;
            t.el.style.left = `${t.x}px`;
            t.el.style.top = `${t.y}px`;
            prevX = t.x; prevY = t.y;
        });
    }

    updateMagnetic();
    requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

function attachCursorTriggers(scope = document) {
    scope.querySelectorAll('.cursor-hover-trigger').forEach(item => {
        if (item.dataset.cursorBound) return;
        item.dataset.cursorBound = '1';
        item.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
            cursorBlur.classList.add('active');
        });
        item.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
            cursorBlur.classList.remove('active');
        });
    });
}
attachCursorTriggers();

/* ============ SCROLL PROGRESS BEAM ============ */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============ DEEP-SPACE CANVAS ENGINE ============ */
const canvas = document.getElementById('galaxy-engine');
const ctx = canvas.getContext('2d');

let stars = [];
let nebulaClouds = [];
let shootingStars = [];
let constellationPts = [];
const numStars = 260;
let galaxyRotation = 0;
let scrollWarp = 0;
let lastScrollY = window.scrollY;
let parallaxX = 0, parallaxY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGalaxy();
    initConstellation();
}

class Star {
    constructor() { this.reset(); }
    reset() {
        const theta = Math.random() * Math.PI * 2;
        const arm = Math.floor(Math.random() * 3);
        const armOffset = (arm * Math.PI * 2) / 3;

        this.distance = Math.random() * Math.max(canvas.width, canvas.height) * 0.55;
        this.angle = theta + armOffset + (this.distance * 0.002);
        this.size = Math.random() * 1.6 + 0.4;
        this.baseOpacity = Math.random() * 0.5 + 0.25;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;

        const colorRand = Math.random();
        if (colorRand < 0.4) this.color = { r: 139, g: 92, b: 246 };
        else if (colorRand < 0.8) this.color = { r: 236, g: 72, b: 153 };
        else this.color = { r: 96, g: 165, b: 250 };
    }
    draw(isDark, t) {
        const streak = Math.min(scrollWarp, 40);
        const x = canvas.width / 2 + Math.cos(this.angle + galaxyRotation) * this.distance + parallaxX * (this.distance / canvas.width) * 0.4;
        const y = canvas.height / 2 + Math.sin(this.angle + galaxyRotation) * this.distance * 0.5 + parallaxY * (this.distance / canvas.height) * 0.4;
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) return;

        const twinkle = 0.7 + 0.3 * Math.sin(t * this.twinkleSpeed + this.twinklePhase);
        const finalOpacity = (isDark ? this.baseOpacity : this.baseOpacity * 0.5) * twinkle;
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${finalOpacity})`;

        if (streak > 2) {
            const dx = Math.cos(this.angle + galaxyRotation + Math.PI / 2) * streak;
            const dy = Math.sin(this.angle + galaxyRotation + Math.PI / 2) * streak * 0.5;
            ctx.beginPath();
            ctx.moveTo(x - dx, y - dy);
            ctx.lineTo(x + dx, y + dy);
            ctx.lineWidth = this.size;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class NebulaCloud {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * 100;
        this.y = Math.random() * 100;
        this.r = Math.random() * 260 + 180;
        this.hue = Math.random() > 0.5 ? [139, 92, 246] : [236, 72, 153];
        this.driftX = (Math.random() - 0.5) * 0.015;
        this.driftY = (Math.random() - 0.5) * 0.015;
    }
    update() {
        this.x += this.driftX; this.y += this.driftY;
        if (this.x < -10 || this.x > 110) this.driftX *= -1;
        if (this.y < -10 || this.y > 110) this.driftY *= -1;
    }
    draw(isDark) {
        const px = (this.x / 100) * canvas.width;
        const py = (this.y / 100) * canvas.height;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, this.r);
        const alpha = isDark ? 0.05 : 0.03;
        grad.addColorStop(0, `rgba(${this.hue[0]}, ${this.hue[1]}, ${this.hue[2]}, ${alpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(px - this.r, py - this.r, this.r * 2, this.r * 2);
    }
}

class ShootingStar {
    constructor() { this.spawn(); this.alive = false; }
    spawn() {
        this.x = Math.random() * canvas.width * 0.6 + canvas.width * 0.2;
        this.y = -20;
        this.vx = -2.4 - Math.random() * 1.5;
        this.vy = 3.2 + Math.random() * 1.8;
        this.life = 0;
        this.maxLife = 60 + Math.random() * 30;
        this.alive = true;
    }
    update() {
        if (!this.alive) return;
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxLife || this.y > canvas.height + 50) this.alive = false;
    }
    draw(isDark) {
        if (!this.alive) return;
        const fade = (1 - this.life / this.maxLife) * (isDark ? 1 : 0.6);
        const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.vx * 8, this.y - this.vy * 8);
        grad.addColorStop(0, `rgba(255,255,255,${fade})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 8, this.y - this.vy * 8);
        ctx.stroke();
    }
}

function initGalaxy() {
    stars = [];
    for (let i = 0; i < numStars; i++) stars.push(new Star());
    nebulaClouds = [];
    for (let i = 0; i < 4; i++) nebulaClouds.push(new NebulaCloud());
    shootingStars = [new ShootingStar(), new ShootingStar()];
}

/* Interactive constellation layer — gentle gravitational pull + links near cursor */
function initConstellation() {
    constellationPts = [];
    if (prefersReducedMotion) return;
    const count = Math.min(70, Math.max(24, Math.floor(window.innerWidth / 24)));
    for (let i = 0; i < count; i++) {
        constellationPts.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25
        });
    }
}

function renderConstellation(isDark) {
    if (!constellationPts.length) return;
    const linkDist = 120;
    const pullRadius = 190;
    const baseAlpha = isDark ? 0.55 : 0.4;

    for (const p of constellationPts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        const dxc = mouseX - p.x, dyc = mouseY - p.y;
        const dc = Math.hypot(dxc, dyc);
        if (dc < pullRadius && dc > 1) {
            const f = (1 - dc / pullRadius) * 0.4;
            p.x += (dxc / dc) * f;
            p.y += (dyc / dc) * f;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(236,72,153,${(1 - dc / pullRadius) * 0.4})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${baseAlpha})`;
        ctx.fill();
    }

    for (let i = 0; i < constellationPts.length; i++) {
        const a = constellationPts[i];
        for (let j = i + 1; j < constellationPts.length; j++) {
            const b = constellationPts[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkDist) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(99,102,241,${(1 - d / linkDist) * baseAlpha * 0.45})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function maybeSpawnShootingStar() {
    if (prefersReducedMotion) return;
    if (Math.random() < 0.004) {
        const dead = shootingStars.find(s => !s.alive);
        if (dead) dead.spawn();
    }
}

function renderGalaxy(t) {
    const isDark = document.documentElement.classList.contains('dark');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nebulaClouds.forEach(c => { c.update(); c.draw(isDark); });

    galaxyRotation += prefersReducedMotion ? 0 : 0.0009;
    scrollWarp *= 0.9;
    if (scrollWarp < 0.1) scrollWarp = 0;

    for (let i = 0; i < stars.length; i++) stars[i].draw(isDark, t);

    if (!prefersReducedMotion) renderConstellation(isDark);

    maybeSpawnShootingStar();
    shootingStars.forEach(s => { s.update(); s.draw(isDark); });

    requestAnimationFrame(renderGalaxy);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(renderGalaxy);

/* Warp effect on fast scroll */
window.addEventListener('scroll', () => {
    const delta = Math.abs(window.scrollY - lastScrollY);
    scrollWarp = Math.min(scrollWarp + delta * 0.6, 45);
    lastScrollY = window.scrollY;
}, { passive: true });

/* Background parallax driven by mouse */
if (!prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5);
        const ny = (e.clientY / window.innerHeight - 0.5);
        parallaxX += (nx * 30 - parallaxX) * 0.05;
        parallaxY += (ny * 30 - parallaxY) * 0.05;
    });
}

/* ============ HERO PARALLAX LAYERS ============ */
if (!prefersReducedMotion) {
    const heroSection = document.getElementById('hero');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    heroSection.addEventListener('mousemove', (e) => {
        const r = heroSection.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        parallaxLayers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth || 0.05) * 100;
            layer.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
        });
    });
    heroSection.addEventListener('mouseleave', () => {
        parallaxLayers.forEach(layer => layer.style.transform = '');
    });
}

/* ============ TILT CARDS (3D + specular highlight) ============ */
function initTilt(scope = document) {
    if (prefersReducedMotion) return;
    scope.querySelectorAll('.tilt-card').forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = '1';
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rotateY = (px - 0.5) * 9;
            const rotateX = (0.5 - py) * 9;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
            const parent = card.closest('.glass-card, .project-card, .bento-cell') || card;
            parent.style.setProperty('--mx', `${px * 100}%`);
            parent.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
    });
}
initTilt();

/* ============ SCROLL REVEAL (staggered) ============ */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const children = entry.target.querySelectorAll('.reveal-item');
            children.forEach((child, i) => {
                setTimeout(() => child.classList.add('visible'), i * 90);
            });
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-on-scroll').forEach(section => {
    section.querySelectorAll(':scope .glass-card, :scope .bento-cell, :scope .orbital-node, :scope .skill-pill-static').forEach(el => {
        el.classList.add('reveal-item');
    });
    revealObserver.observe(section);
});

/* ============ COUNTER STATS (decimals + suffix aware) ============ */
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });
document.querySelectorAll('.counter-stat').forEach(el => counterObserver.observe(el));

function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (Number.isNaN(target)) return;
    if (prefersReducedMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const duration = 1500;
    const start = performance.now();
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (eased * target).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
}

/* ============ ACTIVE NAV HIGHLIGHT ============ */
const navItems = document.querySelectorAll('.nav-item');
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        const link = document.querySelector(`.nav-item[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
            navItems.forEach(n => n.classList.remove('active'));
            link.classList.add('active');
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

/* ============ TYPEWRITER ============ */
const words = ["Full Stack Developer", "Java & Spring Boot Engineer", "Microservices Architect", "AWS Certified Builder"];
let wordIndex = 0;

function startTypewriter() {
    const el = document.getElementById('typewriter');
    if (prefersReducedMotion) { el.textContent = words[0]; return; }
    typingEffect();
}
function typingEffect() {
    let word = words[wordIndex].split("");
    const el = document.getElementById('typewriter');
    (function loopTyping() {
        if (word.length > 0) {
            el.innerHTML += word.shift();
            setTimeout(loopTyping, 85);
        } else {
            setTimeout(deletingEffect, 2200);
        }
    })();
}
function deletingEffect() {
    let word = words[wordIndex].split("");
    const el = document.getElementById('typewriter');
    (function loopDeleting() {
        if (word.length > 0) {
            word.pop();
            el.innerHTML = word.join("");
            setTimeout(loopDeleting, 40);
        } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typingEffect, 500);
        }
    })();
}

/* ============ STATUS TICKER ============ */
const statusMessages = [
    "Architecting distributed systems",
    "Shipping production-ready features",
    "Solving algorithms at 2am",
    "Open to full-stack & backend roles"
];
let statusIndex = 0;
if (!prefersReducedMotion) {
    setInterval(() => {
        const el = document.getElementById('status-ticker');
        if (!el) return;
        el.classList.add('swap');
        setTimeout(() => {
            statusIndex = (statusIndex + 1) % statusMessages.length;
            el.textContent = statusMessages[statusIndex];
            el.classList.remove('swap');
        }, 350);
    }, 3800);
}

/* ============ RESUME DOWNLOAD ============ */
const RESUME_FILE = 'Shubham_FSE_resume.pdf';
function downloadResume() {
    const link = document.createElement('a');
    link.href = RESUME_FILE;
    link.download = 'Shubham_Tripathi_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Résumé downloaded — thanks for stopping by!', 'fa-solid fa-circle-check');
}

/* ============================================================
   PROJECTS: DATA → CARDS → FILTER → RICH MODAL
   ============================================================ */
const ACCENT_VAR = { stellar: 'var(--stellar)', cosmic: 'var(--cosmic)', nebula: 'var(--nebula)', flare: 'var(--flare)' };

const projectData = {
    'hiresphere': {
        title: 'HireSphere',
        subtitle: 'AI-Powered Job Portal',
        badge: 'Flagship • 10 Microservices',
        icon: 'fa-layer-group',
        accent: 'stellar',
        flagship: true,
        categories: ['backend', 'fullstack', 'ai'],
        value: 'A distributed hiring platform — 10 Spring Boot microservices behind an API Gateway, event-driven with Kafka, and augmented by 8 Gemini-powered AI features.',
        metrics: [{ v: '10', l: 'Microservices' }, { v: '6', l: 'Kafka Topics' }, { v: '8', l: 'AI Features' }],
        tech: ['Java 21', 'Spring Boot', 'Spring Cloud', 'Apache Kafka', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Gemini API', 'Razorpay'],
        github: 'https://github.com/theshubhamtripathi',
        live: null,
        overview: 'HireSphere is a full, production-grade hiring platform split into job seeker, employer, and admin portals. It is built as 10 independently deployable Spring Boot microservices coordinated behind an API Gateway with Eureka service discovery and a centralized Config Server — each service owning its own PostgreSQL database for true data isolation.',
        decisions: [
            'Designed 10 Spring Boot microservices behind an API Gateway with Eureka discovery, a Config Server, and a dedicated PostgreSQL database per service for independent deployability.',
            'Secured the platform with JWT authentication and role-based access control, plus Redis rate limiting and Resilience4j circuit breakers at the gateway to stop a failing service from cascading.',
            'Implemented event-driven workflows with Apache Kafka across 6 topics so email, job-alert, and analytics consumers process events asynchronously — keeping user-facing REST APIs fast and loosely coupled.',
            'Integrated Google Gemini for 8 AI features (resume analysis, candidate screening, natural-language job search) with an offline fallback, and added Razorpay payments.',
            'Shipped with Docker Compose, GitHub Actions CI, and Testcontainers integration tests; deployed on a VPS and Vercel.'
        ],
        impact: [{ m: '10', l: 'Microservices' }, { m: '6', l: 'Kafka Topics' }, { m: '8', l: 'AI Features' }, { m: '1:1', l: 'DB per Service' }],
        architecture: true
    },
    'url-shortener': {
        title: 'URL Shortener Service',
        subtitle: 'Spring Boot REST API',
        badge: 'Backend • Clean Architecture',
        icon: 'fa-link',
        accent: 'cosmic',
        flagship: false,
        categories: ['backend'],
        value: 'A Spring Boot REST API that generates unique short codes and redirects visitors to the original URL through a single, reliable endpoint.',
        metrics: [{ v: '3', l: 'Layer Design' }, { v: 'JUnit', l: '+ Mockito' }, { v: 'JPA', l: 'Hibernate' }],
        tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'Hibernate', 'REST APIs', 'SQL', 'JUnit', 'Mockito'],
        github: 'https://github.com/theshubhamtripathi',
        live: null,
        overview: 'A URL shortening service that turns long links into compact, shareable short codes. It exposes a clean Spring Boot REST API that generates unique codes and redirects visitors to the original URL through a single endpoint — built to be easy to extend and container-ready.',
        decisions: [
            'Built a Spring Boot REST API that generates unique short codes with single-endpoint redirection to the original URL.',
            'Structured the backend in a clean layered Controller–Service–Repository architecture using Spring Data JPA / Hibernate, with unique-code constraints to keep link mappings consistent and lookups reliable.',
            'Added request validation and centralized exception handling that return predictable HTTP status codes for invalid URLs and unknown codes, giving clients consistent API responses.',
            'Verified business logic with JUnit and Mockito unit tests and managed the codebase with Git — producing an easy-to-extend service ready for containerized deployment.'
        ],
        impact: [{ m: '3-Tier', l: 'Architecture' }, { m: '100%', l: 'Validated Inputs' }, { m: 'Unit', l: 'Tested Logic' }],
        architecture: false
    },
    'focus-flow': {
        title: 'Focus Flow',
        subtitle: 'Productivity System',
        badge: 'Full Stack • Analytics',
        icon: 'fa-bullseye',
        accent: 'nebula',
        flagship: false,
        categories: ['fullstack'],
        value: 'A full-stack productivity app pairing a Pomodoro timer with task management, streak tracking, and a visual analytics dashboard.',
        metrics: [{ v: 'MVVM', l: 'Architecture' }, { v: 'CRUD', l: 'Persistence' }, { v: 'Charts', l: 'Analytics' }],
        tech: ['SwiftUI', 'MVVM', 'CoreData', 'Combine', 'Swift Charts'],
        github: 'https://github.com/theshubhamtripathi',
        live: null,
        overview: 'Focus Flow is a full-stack productivity app built on an MVVM architecture. It combines a Combine-driven Pomodoro timer with persistent task management, daily streak tracking via a contribution-style heatmap, and a progress analytics dashboard.',
        decisions: [
            'Built the data layer with persistent entities and relationships between tasks and focus sessions, exposing clean CRUD operations.',
            'Daily streak tracking rendered as a GitHub-style contribution heatmap for at-a-glance motivation.',
            'Progress analytics dashboard visualizing focus-time trends across weeks and months.',
            'Local notifications for timer completion alerts and configurable daily reminders.'
        ],
        impact: [{ m: 'MVVM', l: 'Clean Layers' }, { m: 'Daily', l: 'Streak Engine' }, { m: 'Visual', l: 'Dashboards' }],
        architecture: false
    },
    'hire-guard': {
        title: 'HireGuard AI',
        subtitle: 'Fraud Detection NLP',
        badge: 'AI / Systems • NLP',
        icon: 'fa-shield-halved',
        accent: 'flare',
        flagship: false,
        categories: ['ai'],
        value: 'An NLP-powered system that classifies fraudulent job postings, helping job seekers spot scam listings before they apply.',
        metrics: [{ v: 'TF-IDF', l: 'Vectorizer' }, { v: 'ML', l: 'Classifiers' }, { v: 'Flask', l: 'Inference API' }],
        tech: ['Python', 'NLP', 'scikit-learn', 'Flask', 'TF-IDF'],
        github: 'https://github.com/theshubhamtripathi',
        live: null,
        overview: 'HireGuard AI is an NLP-powered fake-job detection system. It classifies fraudulent job postings using TF-IDF vectorization and classical ML classifiers, served through a lightweight Flask inference API so job seekers can flag scam listings in real time.',
        decisions: [
            'TF-IDF vectorization pipeline paired with classical classifiers (Logistic Regression, SVM), benchmarked for precision/recall trade-offs.',
            'Text-preprocessing pipeline handling tokenization, stopword removal, and lemmatization for noisy listing text.',
            'Flask API layer serving real-time predictions through a lightweight inference pipeline.',
            'Tuned on a labeled dataset of real and fraudulent postings to minimize false negatives.'
        ],
        impact: [{ m: 'TF-IDF', l: 'Feature Space' }, { m: 'Real-time', l: 'Inference' }, { m: 'Low FN', l: 'Tuned Recall' }],
        architecture: false
    }
};

const projectOrder = ['hiresphere', 'url-shortener', 'focus-flow', 'hire-guard'];

function buildProjectCard(id) {
    const d = projectData[id];
    const accent = ACCENT_VAR[d.accent];
    const card = document.createElement('article');
    card.className = 'project-card tilt-card cursor-hover-trigger' + (d.flagship ? ' flagship' : '');
    card.dataset.id = id;
    card.dataset.cats = d.categories.join(' ');
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${d.title} case study`);

    const metricPills = d.metrics.map(m => `<span class="metric-pill"><b>${m.v}</b> ${m.l}</span>`).join('');
    const techChips = d.tech.map(t => `<span class="tag-span">${t}</span>`).join('');

    card.innerHTML = `
        <div class="proj-glow" style="background:${accent}"></div>
        <div class="flex items-center justify-between mb-4">
            <span class="proj-badge" style="color:${accent};background:${accent.replace('var(', 'color-mix(in srgb, var(').replace(')', ') 12%, transparent)')}">
                <i class="fa-solid ${d.icon}"></i>${d.badge}
            </span>
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-base" style="color:${accent};background:${accent.replace('var(', 'color-mix(in srgb, var(').replace(')', ') 12%, transparent)')}">
                <i class="fa-solid ${d.icon}"></i>
            </div>
        </div>
        <h4 class="proj-title">${d.title}</h4>
        <div class="proj-subtitle mt-1" style="color:${accent}">${d.subtitle}</div>
        <p class="proj-value mt-3 mb-4">${d.value}</p>
        <div class="flex flex-wrap gap-2 mb-4">${metricPills}</div>
        <div class="flex flex-wrap gap-1.5 mb-5">${techChips}</div>
        <div class="mt-auto flex items-center justify-between pt-1">
            <span class="proj-cta">Explore Architecture <i class="fa-solid fa-arrow-right-long"></i></span>
            <a href="${d.github}" target="_blank" rel="noopener" class="proj-ghlink cursor-hover-trigger" aria-label="${d.title} on GitHub" data-ghlink><i class="fa-brands fa-github"></i></a>
        </div>
    `;

    // Open modal on card click (except github link)
    card.addEventListener('click', (e) => {
        if (e.target.closest('[data-ghlink]')) return;
        openProjectModal(id);
    });
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProjectModal(id); }
    });
    return card;
}

function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    let delay = 0;
    projectOrder.forEach(id => {
        const d = projectData[id];
        const match = filter === 'all' || d.categories.includes(filter);
        if (!match) return;
        const card = buildProjectCard(id);
        grid.appendChild(card);
        if (!prefersReducedMotion) {
            card.style.animationDelay = `${delay}ms`;
            card.classList.add('pop-in');
            delay += 80;
        }
    });
    attachCursorTriggers(grid);
    initTilt(grid);
}
renderProjects();

/* Filter tabs */
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderProjects(tab.dataset.filter);
    });
});

/* ---------- HireSphere architecture diagram ---------- */
const ARCH_ROLES = {
    client: '<strong>React Client</strong> — the job seeker, employer, and admin single-page apps. Every request flows through the gateway, never directly to a service.',
    gateway: '<strong>API Gateway</strong> — the single entry point. Enforces <strong>JWT auth &amp; RBAC</strong>, applies <strong>Redis rate limiting</strong>, and wraps calls in <strong>Resilience4j circuit breakers</strong> so one failing service never cascades.',
    services: '<strong>10 Spring Boot Microservices</strong> — independently deployable domains (jobs, employers, admin…) registered with <strong>Eureka</strong> discovery and a central Config Server.',
    postgres: '<strong>PostgreSQL</strong> — a dedicated database per service for true data isolation and independent scaling.',
    kafka: '<strong>Apache Kafka · 6 topics</strong> — email, job-alert, and analytics consumers process events asynchronously, keeping APIs fast and loosely coupled.',
    gemini: '<strong>Google Gemini</strong> — powers 8 AI features (resume analysis, screening, NL search) with an offline fallback.'
};

function architectureHTML() {
    return `
    <div class="modal-section">
        <div class="modal-section-title">Mini System Architecture</div>
        <div class="arch-diagram">
            <div class="arch-flow">
                <div class="arch-stage">
                    <div class="arch-node" data-accent="cosmic" data-role="client"><i class="fa-brands fa-react"></i>React Client</div>
                </div>
                <div class="arch-arrow"><i class="fa-solid fa-arrow-right-long"></i></div>
                <div class="arch-stage">
                    <div class="arch-node" data-accent="stellar" data-role="gateway"><i class="fa-solid fa-shield-halved"></i>API Gateway<br><span style="font-weight:600;opacity:.8">JWT · Redis · R4j</span></div>
                </div>
                <div class="arch-arrow"><i class="fa-solid fa-arrow-right-long"></i></div>
                <div class="arch-stage">
                    <div class="arch-node" data-accent="stellar" data-role="services"><i class="fa-solid fa-cubes"></i>10 Services<br><span style="font-weight:600;opacity:.8">+ Eureka</span></div>
                </div>
                <div class="arch-arrow"><i class="fa-solid fa-arrow-right-long"></i></div>
                <div class="arch-stage">
                    <div class="arch-node" data-accent="nebula" data-role="postgres"><i class="fa-solid fa-database"></i>PostgreSQL</div>
                    <div class="arch-node" data-accent="flare" data-role="kafka"><i class="fa-solid fa-tower-broadcast"></i>Kafka · 6</div>
                    <div class="arch-node" data-accent="cosmic" data-role="gemini"><i class="fa-solid fa-robot"></i>Gemini AI</div>
                </div>
            </div>
            <div class="arch-caption" id="arch-caption">Hover or tap a node to inspect its role in the request lifecycle.</div>
        </div>
    </div>`;
}

function wireArchitecture() {
    const caption = document.getElementById('arch-caption');
    if (!caption) return;
    const nodes = document.querySelectorAll('.arch-node');
    nodes.forEach(node => {
        const role = node.dataset.role;
        const activate = () => {
            nodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');
            caption.innerHTML = ARCH_ROLES[role] || '';
        };
        node.addEventListener('mouseenter', activate);
        node.addEventListener('focus', activate);
        node.addEventListener('click', activate);
        node.setAttribute('tabindex', '0');
    });
}

/* ---------- Modal open / close with focus trap + scroll lock ---------- */
let lastFocusedEl = null;

function openProjectModal(id) {
    const d = projectData[id];
    if (!d) return;
    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    const accent = ACCENT_VAR[d.accent];

    const decisions = d.decisions.map(x => `<div class="modal-decision"><span class="mk">▷</span><span>${x}</span></div>`).join('');
    const impact = d.impact.map(x => `<div class="impact-cell"><div class="impact-metric">${x.m}</div><div class="impact-label">${x.l}</div></div>`).join('');
    const tech = d.tech.map(t => `<span class="tag-span">${t}</span>`).join('');
    const liveBtn = d.live ? `<a href="${d.live}" target="_blank" rel="noopener" class="modal-btn primary"><i class="fa-solid fa-arrow-up-right-from-square"></i>Live Demo</a>` : '';

    content.innerHTML = `
        <div class="modal-hero">
            <div class="modal-hero-glow" style="background:${accent}"></div>
            <span class="proj-badge" style="color:${accent};background:${accent.replace('var(', 'color-mix(in srgb, var(').replace(')', ') 14%, transparent)')}"><i class="fa-solid ${d.icon}"></i>${d.badge}</span>
            <h3 id="modal-title" class="text-2xl sm:text-3xl font-black mt-4 text-space-900 dark:text-white">${d.title}</h3>
            <div class="proj-subtitle mt-1" style="color:${accent}">${d.subtitle}</div>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <div class="modal-section-title">Overview</div>
                <p class="text-sm leading-relaxed text-space-900/75 dark:text-slate-300">${d.overview}</p>
            </div>
            ${d.architecture ? architectureHTML() : ''}
            <div class="modal-section">
                <div class="modal-section-title">Key Engineering Decisions</div>
                ${decisions}
            </div>
            <div class="modal-section">
                <div class="modal-section-title">Impact Metrics</div>
                <div class="impact-grid">${impact}</div>
            </div>
            <div class="modal-section">
                <div class="modal-section-title">Full Tech Stack</div>
                <div class="flex flex-wrap gap-1.5">${tech}</div>
            </div>
            <div class="modal-actions">
                <a href="${d.github}" target="_blank" rel="noopener" class="modal-btn ${d.live ? 'ghost' : 'primary'}"><i class="fa-brands fa-github"></i>View on GitHub</a>
                ${liveBtn}
            </div>
        </div>
    `;

    if (d.architecture) wireArchitecture();

    lastFocusedEl = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    content.parentElement.scrollTop = 0;

    const panel = modal.querySelector('.modal-panel');
    setTimeout(() => panel.focus(), 60);
    document.addEventListener('keydown', trapModalFocus);
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal.classList.contains('hidden')) return;
    modal.classList.remove('open');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapModalFocus);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
}

function trapModalFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = document.getElementById('project-modal');
    const focusable = modal.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

document.getElementById('project-modal').addEventListener('click', (e) => {
    if (e.target.id === 'project-modal') closeProjectModal();
});

/* ============================================================
   COMMAND PALETTE (⌘K / Ctrl+K)
   ============================================================ */
const CMDK_ACTIONS = [
    { group: 'Navigate', icon: 'fa-user-astronaut', label: 'About · Mission Control', sub: 'about', run: () => goTo('#about') },
    { group: 'Navigate', icon: 'fa-diagram-project', label: 'Technical Skills', sub: 'skills', run: () => goTo('#skills') },
    { group: 'Navigate', icon: 'fa-rocket', label: 'Projects', sub: 'projects', run: () => goTo('#projects') },
    { group: 'Navigate', icon: 'fa-timeline', label: 'Experience Timeline', sub: 'experience', run: () => goTo('#experience') },
    { group: 'Navigate', icon: 'fa-graduation-cap', label: 'Education & Certifications', sub: 'education', run: () => goTo('#education') },
    { group: 'Navigate', icon: 'fa-satellite-dish', label: 'Contact', sub: 'contact', run: () => goTo('#contact') },
    { group: 'Projects', icon: 'fa-layer-group', label: 'Open HireSphere case study', sub: 'flagship', run: () => { closeCmdk(); setTimeout(() => openProjectModal('hiresphere'), 180); } },
    { group: 'Projects', icon: 'fa-link', label: 'Open URL Shortener case study', sub: 'backend', run: () => { closeCmdk(); setTimeout(() => openProjectModal('url-shortener'), 180); } },
    { group: 'Actions', icon: 'fa-circle-half-stroke', label: 'Toggle dark / light mode', sub: 'theme', run: () => { toggleTheme(); } },
    { group: 'Actions', icon: 'fa-envelope', label: 'Copy email address', sub: 'copy', run: () => { copyToClipboard('theshubhamtripathi06@gmail.com', 'Email copied to clipboard!'); closeCmdk(); } },
    { group: 'Actions', icon: 'fa-download', label: 'Download résumé (PDF)', sub: 'resume', run: () => { downloadResume(); closeCmdk(); } },
    { group: 'Links', icon: 'fa-github', label: 'Open GitHub', sub: '↗', run: () => window.open('https://github.com/theshubhamtripathi', '_blank') },
    { group: 'Links', icon: 'fa-linkedin', label: 'Open LinkedIn', sub: '↗', run: () => window.open('https://www.linkedin.com/in/theshubhamtripathi/', '_blank') },
    { group: 'Links', icon: 'fa-code', label: 'Open LeetCode', sub: '↗', run: () => window.open('https://leetcode.com/u/6st786/', '_blank') }
];

const cmdk = document.getElementById('cmdk');
const cmdkInput = document.getElementById('cmdk-input');
const cmdkList = document.getElementById('cmdk-list');
let cmdkFiltered = [];
let cmdkSelected = 0;

function goTo(hash) {
    closeCmdk();
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

function renderCmdk(query = '') {
    const q = query.trim().toLowerCase();
    cmdkFiltered = CMDK_ACTIONS.filter(a => !q || a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q) || (a.sub && a.sub.toLowerCase().includes(q)));
    cmdkSelected = 0;
    if (!cmdkFiltered.length) {
        cmdkList.innerHTML = `<li class="cmdk-empty">No matches — try “projects”, “resume”, or “theme”.</li>`;
        return;
    }
    let html = '';
    let lastGroup = '';
    cmdkFiltered.forEach((a, i) => {
        if (a.group !== lastGroup) { html += `<li class="cmdk-group-label">${a.group}</li>`; lastGroup = a.group; }
        const brandIcons = ['fa-github', 'fa-linkedin'];
        const iconClass = brandIcons.includes(a.icon) ? 'fa-brands' : 'fa-solid';
        html += `<li class="cmdk-item${i === 0 ? ' selected' : ''}" data-idx="${i}" role="option">
            <span class="cmdk-ico"><i class="${iconClass} ${a.icon}"></i></span>
            <span class="cmdk-label">${a.label}</span>
            <span class="cmdk-sub">${a.sub || ''}</span>
        </li>`;
    });
    cmdkList.innerHTML = html;
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => {
        const idx = parseInt(item.dataset.idx, 10);
        item.addEventListener('mouseenter', () => setCmdkSelection(idx));
        item.addEventListener('click', () => runCmdk(idx));
    });
}

function setCmdkSelection(idx) {
    cmdkSelected = idx;
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => {
        item.classList.toggle('selected', parseInt(item.dataset.idx, 10) === idx);
    });
}

function moveCmdkSelection(dir) {
    if (!cmdkFiltered.length) return;
    cmdkSelected = (cmdkSelected + dir + cmdkFiltered.length) % cmdkFiltered.length;
    setCmdkSelection(cmdkSelected);
    const el = cmdkList.querySelector(`.cmdk-item[data-idx="${cmdkSelected}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
}

function runCmdk(idx) {
    const action = cmdkFiltered[idx];
    if (action) action.run();
}

function openCmdk() {
    cmdk.classList.remove('hidden');
    cmdk.classList.add('open');
    cmdkInput.value = '';
    renderCmdk('');
    document.body.style.overflow = 'hidden';
    setTimeout(() => cmdkInput.focus(), 40);
}
function closeCmdk() {
    cmdk.classList.remove('open');
    setTimeout(() => cmdk.classList.add('hidden'), 220);
    if (document.getElementById('project-modal').classList.contains('hidden')) {
        document.body.style.overflow = '';
    }
}
function toggleCmdk() {
    if (cmdk.classList.contains('open')) closeCmdk(); else openCmdk();
}

document.getElementById('cmdk-trigger').addEventListener('click', openCmdk);
document.getElementById('cmdk-backdrop').addEventListener('click', closeCmdk);
cmdkInput.addEventListener('input', (e) => renderCmdk(e.target.value));
cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdkSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdkSelection(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmdk(cmdkSelected); }
});

/* ============ GLOBAL KEYBOARD SHORTCUTS ============ */
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCmdk();
        return;
    }
    if (e.key === 'Escape') {
        if (cmdk.classList.contains('open')) closeCmdk();
        else closeProjectModal();
    }
});

/* ============ ORBITAL TIMELINE PROGRESS FILL ============ */
const orbitalFill = document.getElementById('orbital-fill');
const orbitalTimeline = document.querySelector('.orbital-timeline');
function updateOrbital() {
    if (!orbitalTimeline || !orbitalFill) return;
    const r = orbitalTimeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height || 1;
    const passed = Math.min(Math.max(vh * 0.6 - r.top, 0), total);
    orbitalFill.style.height = `${(passed / total) * 100}%`;
}
window.addEventListener('scroll', updateOrbital, { passive: true });
window.addEventListener('resize', updateOrbital);
updateOrbital();

/* ============ CONTACT FORM ============ */
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('form-submit');
    const submitText = document.getElementById('submit-text');
    const submitIcon = document.getElementById('submit-icon');

    btn.classList.add('is-loading');
    submitText.textContent = 'Transmitting…';
    submitIcon.className = 'fa-solid fa-circle-notch text-xs';

    setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.classList.add('is-success');
        submitText.textContent = 'Signal Received';
        submitIcon.className = 'fa-solid fa-check text-xs';
        showToast('Message sent — I\'ll reply within a day or two.', 'fa-solid fa-paper-plane');

        setTimeout(() => {
            contactForm.reset();
            btn.classList.remove('is-success');
            submitText.textContent = 'Transmit Signal';
            submitIcon.className = 'fa-solid fa-paper-plane text-xs';
        }, 2400);
    }, 1300);
});

/* ============ COPY TO CLIPBOARD ============ */
function copyToClipboard(text, message) {
    const done = () => showToast(message, 'fa-solid fa-clipboard-check');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}
function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { showToast('Could not copy — try manually.', 'fa-solid fa-triangle-exclamation'); }
    document.body.removeChild(ta);
}

/* ============ TOAST ============ */
let toastTimeout;
function showToast(message, iconClass) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    toastMessage.textContent = message;
    if (iconClass) toastIcon.className = iconClass + ' text-stellar';
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}
