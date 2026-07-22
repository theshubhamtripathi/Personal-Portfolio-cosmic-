/* ============================================================
   PORTFOLIO INTERACTION ENGINE
   Sections: Setup | Preloader | Cursor | Canvas | Scroll FX |
   Tilt Cards | Nav | Mobile Menu | Typewriter | Counters |
   Resume | Modal | Contact Form | Toast | Utilities
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    themeToggleLightIcon.classList.remove('hidden');
} else {
    document.documentElement.classList.remove('dark');
    themeToggleDarkIcon.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', function () {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
});

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
const TRAIL_LENGTH = window.matchMedia('(min-width: 1025px)').matches && !prefersReducedMotion ? 10 : 0;
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
        trailPool.forEach((t, i) => {
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

function attachCursorTriggers() {
    document.querySelectorAll('.cursor-hover-trigger').forEach(item => {
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

/* ============ SCROLL PROGRESS BAR ============ */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    scrollProgress.style.width = `${scrolled}%`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============ GALAXY / NEBULA CANVAS ENGINE ============ */
const canvas = document.getElementById('galaxy-engine');
const ctx = canvas.getContext('2d');

let stars = [];
let nebulaClouds = [];
let shootingStars = [];
const numStars = 260;
let galaxyRotation = 0;
let scrollWarp = 0;       // increases briefly on scroll, decays back to 0
let lastScrollY = window.scrollY;
let parallaxX = 0, parallaxY = 0; // mouse-driven background parallax

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGalaxy();
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
        const finalOpacity = (isDark ? this.baseOpacity : this.baseOpacity * 0.45) * twinkle;
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
        if (!isDark) return;
        const px = (this.x / 100) * canvas.width;
        const py = (this.y / 100) * canvas.height;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, this.r);
        grad.addColorStop(0, `rgba(${this.hue[0]}, ${this.hue[1]}, ${this.hue[2]}, 0.05)`);
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
    draw() {
        if (!this.alive) return;
        const fade = 1 - this.life / this.maxLife;
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

    galaxyRotation += 0.0009;
    scrollWarp *= 0.9;
    if (scrollWarp < 0.1) scrollWarp = 0;

    for (let i = 0; i < stars.length; i++) stars[i].draw(isDark, t);

    maybeSpawnShootingStar();
    shootingStars.forEach(s => { s.update(); s.draw(); });

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

/* Background parallax driven by mouse (subtle, whole-canvas) */
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
if (!prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rotateY = (px - 0.5) * 10;
            const rotateX = (0.5 - py) * 10;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
            const parent = card.closest('.glass-card') || card;
            parent.style.setProperty('--mx', `${px * 100}%`);
            parent.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

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
}, { threshold: 0.15 });

document.querySelectorAll('.reveal-on-scroll').forEach(section => {
    // Mark direct interactive children as staggered reveal items
    section.querySelectorAll(':scope .glass-card, :scope .skill-pill-static, :scope > div > div.grid > div').forEach(el => {
        el.classList.add('reveal-item');
    });
    revealObserver.observe(section);
});

/* ============ COUNTER STATS ============ */
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
    const target = parseInt(el.dataset.target, 10);
    if (prefersReducedMotion) { el.textContent = target + '+'; return; }
    const duration = 1400;
    const start = performance.now();
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + (progress > 0.98 ? '+' : '');
        if (progress < 1) requestAnimationFrame(step);
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
const words = ["iOS Developer", "Full Stack Developer", "Machine Learning Engineer"];
let wordIndex = 0;

function startTypewriter() {
    if (prefersReducedMotion) {
        document.getElementById('typewriter').textContent = words[0];
        return;
    }
    typingEffect();
}

function typingEffect() {
    let word = words[wordIndex].split("");
    const el = document.getElementById('typewriter');
    function loopTyping() {
        if (word.length > 0) {
            el.innerHTML += word.shift();
            setTimeout(loopTyping, 85);
        } else {
            setTimeout(deletingEffect, 2200);
        }
    }
    loopTyping();
}

function deletingEffect() {
    let word = words[wordIndex].split("");
    const el = document.getElementById('typewriter');
    function loopDeleting() {
        if (word.length > 0) {
            word.pop();
            el.innerHTML = word.join("");
            setTimeout(loopDeleting, 40);
        } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typingEffect, 500);
        }
    }
    loopDeleting();
}

/* ============ STATUS TICKER ============ */
const statusMessages = [
    "Currently building iOS ecosystems",
    "Open to freelance engagements",
    "Shipping something new this week",
    "Debugging with excessive optimism"
];
let statusIndex = 0;
if (!prefersReducedMotion) {
    setInterval(() => {
        const el = document.getElementById('status-ticker');
        el.classList.add('swap');
        setTimeout(() => {
            statusIndex = (statusIndex + 1) % statusMessages.length;
            el.textContent = statusMessages[statusIndex];
            el.classList.remove('swap');
        }, 350);
    }, 3800);
}

/* ============ RESUME DOWNLOAD ============ */
function downloadResume() {
    const link = document.createElement('a');
    link.href = 'resume.pdf';
    link.download = 'Shubham_Tripathi_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Resume downloaded — thanks for stopping by!', 'fa-solid fa-circle-check');
}

/* ============ PROJECT MODAL ============ */
const projectData = {
    'focus-flow': {
        title: 'Focus Flow',
        badge: 'iOS Ecosystem',
        color: 'stellar',
        description: 'A full-stack iOS productivity app built with SwiftUI and MVVM, combining a Pomodoro timer driven by Combine publishers with CoreData-backed task management.',
        details: [
            'NSManagedObject subclasses with computed properties and CoreData relationships between Task and FocusSession entities.',
            'Daily streak tracking with a GitHub-style contribution heatmap rendered in SwiftUI Canvas.',
            'Progress analytics dashboard built with Swift Charts, visualizing focus time trends over weeks and months.',
            'UNUserNotificationCenter integration for timer completion alerts and configurable daily reminders.'
        ],
        tags: ['Swift', 'SwiftUI', 'CoreData', 'MVVM', 'Combine', 'Swift Charts']
    },
    'hire-guard': {
        title: 'HireGuard AI',
        badge: 'Machine Learning',
        color: 'nebula',
        description: 'An NLP-powered fake job detection system that classifies fraudulent job postings, helping job seekers identify scam listings before applying.',
        details: [
            'TF-IDF vectorization pipeline paired with classical ML classifiers (Logistic Regression, SVM) benchmarked for precision/recall tradeoffs.',
            'Flask API layer serving real-time predictions with a lightweight inference pipeline.',
            'Text preprocessing pipeline handling tokenization, stopword removal, and lemmatization for noisy job-listing text.',
            'Evaluated on a labeled dataset of real and fraudulent postings, tuned to minimize false negatives.'
        ],
        tags: ['Python', 'NLP', 'scikit-learn', 'Flask', 'TF-IDF']
    }
};

function openProjectModal(id) {
    const data = projectData[id];
    if (!data) return;
    const modal = document.getElementById('project-modal');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="flex items-center space-x-3 mb-4">
            <span class="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-lg bg-${data.color}/10 text-${data.color} border border-${data.color}/20">${data.badge}</span>
        </div>
        <h3 class="text-2xl sm:text-3xl font-black text-white mb-4">${data.title}</h3>
        <p class="text-sm text-slate-300 leading-relaxed mb-6">${data.description}</p>
        <div class="space-y-3 mb-6">
            ${data.details.map(d => `<div class="flex items-start space-x-3 text-xs sm:text-sm text-slate-300"><span class="text-${data.color} mt-1">▷</span><span>${d}</span></div>`).join('')}
        </div>
        <div class="flex flex-wrap gap-1.5">
            ${data.tags.map(t => `<span class="tag-span">${t}</span>`).join('')}
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('open');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
    document.body.style.overflow = '';
}

document.getElementById('project-modal').addEventListener('click', (e) => {
    if (e.target.id === 'project-modal') closeProjectModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProjectModal();
});

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
    navigator.clipboard.writeText(text).then(() => {
        showToast(message, 'fa-solid fa-clipboard-check');
    }).catch(() => {
        showToast('Could not copy — try manually.', 'fa-solid fa-triangle-exclamation');
    });
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
