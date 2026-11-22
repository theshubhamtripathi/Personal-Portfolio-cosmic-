/* ============================================================
   PORTFOLIO INTERACTION ENGINE — v3 "OUT OF THIS WORLD"
   Shubham Tripathi · Full Stack Developer
   WebGL galaxy (Three.js) + 2D fallback · Boot sequence · HUD ·
   Section rail · Kinetic type · Scramble · Cursor labels ·
   Cosmic terminal · Projects · Command palette · Timeline
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

/* ============ SETUP: inject ambient elements ============ */
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
        if (getComputedStyle(section).position === 'static') section.style.position = 'relative';
        section.insertBefore(blob, section.firstChild);
    });
})();

/* ============ THEME ============ */
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
    if (window.__galaxyRender) window.__galaxyRender();
}
themeToggleBtn.addEventListener('click', toggleTheme);

/* ============ MOBILE MENU ============ */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(() => mobileMenu.classList.toggle('open'));
    if (!mobileMenu.classList.contains('open')) setTimeout(() => mobileMenu.classList.add('hidden'), 500);
});
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        setTimeout(() => mobileMenu.classList.add('hidden'), 500);
    });
});

/* ============ CUSTOM CURSOR + MAGNETIC + TRAIL + LABEL ============ */
const cursor = document.getElementById('custom-cursor');
const cursorBlur = document.getElementById('custom-cursor-blur');
const cursorLabel = document.getElementById('cursor-label');
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
document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

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
        closest.el.style.transform = `translate(${(mouseX - closest.cx) * pull}px, ${(mouseY - closest.cy) * pull}px)`;
    }
}
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    cursor.style.left = `${cursorX}px`; cursor.style.top = `${cursorY}px`;
    blurX += (mouseX - blurX) * 0.1; blurY += (mouseY - blurY) * 0.1;
    cursorBlur.style.left = `${blurX}px`; cursorBlur.style.top = `${blurY}px`;
    if (cursorLabel) { cursorLabel.style.left = `${mouseX + 24}px`; cursorLabel.style.top = `${mouseY + 20}px`; }
    if (trailPool.length) {
        let prevX = mouseX, prevY = mouseY;
        trailPool.forEach((t) => {
            t.x += (prevX - t.x) * 0.35; t.y += (prevY - t.y) * 0.35;
            t.el.style.left = `${t.x}px`; t.el.style.top = `${t.y}px`;
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
        item.addEventListener('mouseenter', () => { cursor.classList.add('active'); cursorBlur.classList.add('active'); });
        item.addEventListener('mouseleave', () => { cursor.classList.remove('active'); cursorBlur.classList.remove('active'); });
    });
}
function attachCursorLabels(scope = document) {
    if (!canHover) return;
    scope.querySelectorAll('[data-cursor-label]').forEach(el => {
        if (el.dataset.clBound) return;
        el.dataset.clBound = '1';
        el.addEventListener('mouseenter', () => { cursorLabel.textContent = el.dataset.cursorLabel; cursorLabel.classList.add('show'); });
        el.addEventListener('mouseleave', () => cursorLabel.classList.remove('show'));
    });
}
attachCursorTriggers();
attachCursorLabels();

/* ============ SCROLL PROGRESS BEAM ============ */
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
    const h = document.documentElement;
    scrollProgress.style.width = `${(h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100}%`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============================================================
   BACKGROUND ENGINE — WebGL galaxy primary, 2D canvas fallback
   ============================================================ */
const USE_WEBGL = !!(window.__hasWebGL && window.THREE && !window.__threeFailed);
let webglActive = false;

function makeStarTexture(THREE) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    grd.addColorStop(0.55, 'rgba(255,255,255,0.16)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

function initWebGLGalaxy() {
    const THREE = window.THREE;
    const canvasEl = document.getElementById('webgl-galaxy');
    const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 140);
    camera.position.set(0, 2.6, 9);

    const sprite = makeStarTexture(THREE);

    // --- spiral galaxy ---
    const COUNT = window.innerWidth < 640 ? 7000 : 15000;
    const RADIUS = 16, ARMS = 4, SPIN = 0.85, RAND = 0.5, RANDPOW = 2.6;
    const pos = new Float32Array(COUNT * 3), col = new Float32Array(COUNT * 3);
    const cIn = new THREE.Color('#fde68a'), cMid = new THREE.Color('#8b5cf6'),
        cBlue = new THREE.Color('#3b82f6'), cOut = new THREE.Color('#ec4899');
    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.7) * RADIUS;
        const branch = ((i % ARMS) / ARMS) * Math.PI * 2;
        const spinA = r * SPIN;
        const rx = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r * 0.6;
        const ry = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r * 0.16;
        const rz = Math.pow(Math.random(), RANDPOW) * (Math.random() < 0.5 ? 1 : -1) * RAND * r * 0.6;
        pos[i3] = Math.cos(branch + spinA) * r + rx;
        pos[i3 + 1] = ry;
        pos[i3 + 2] = Math.sin(branch + spinA) * r + rz;
        const t = r / RADIUS;
        const c = new THREE.Color();
        if (t < 0.22) c.copy(cIn).lerp(cMid, t / 0.22);
        else if (t < 0.6) c.copy(cMid).lerp(cBlue, (t - 0.22) / 0.38);
        else c.copy(cBlue).lerp(cOut, (t - 0.6) / 0.4);
        col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.085, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true });
    const galaxy = new THREE.Points(geo, mat);
    galaxy.rotation.x = 0.5;
    const group = new THREE.Group(); group.add(galaxy); scene.add(group);

    // --- distant starfield sphere ---
    const SF = 1400; const sp = new Float32Array(SF * 3);
    for (let i = 0; i < SF; i++) {
        const i3 = i * 3; const rr = 45 + Math.random() * 55;
        const th = Math.random() * Math.PI * 2; const ph = Math.acos(2 * Math.random() - 1);
        sp[i3] = rr * Math.sin(ph) * Math.cos(th);
        sp[i3 + 1] = rr * Math.sin(ph) * Math.sin(th);
        sp[i3 + 2] = rr * Math.cos(ph);
    }
    const sfGeo = new THREE.BufferGeometry(); sfGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const sfMat = new THREE.PointsMaterial({ size: 0.14, map: sprite, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x9fb4ff, opacity: 0.6 });
    const starfield = new THREE.Points(sfGeo, sfMat); scene.add(starfield);

    let curX = 0, curY = 2.6, curZ = 9;
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderOnce();
    }
    function renderOnce() {
        const isDark = document.documentElement.classList.contains('dark');
        const nx = (mouseX / window.innerWidth - 0.5), ny = (mouseY / window.innerHeight - 0.5);
        const targetX = prefersReducedMotion ? 0 : nx * 2.2;
        const targetY = 2.6 - (prefersReducedMotion ? 0 : ny * 1.4);
        const prog = Math.min(window.scrollY / ((document.documentElement.scrollHeight - window.innerHeight) || 1), 1);
        const targetZ = prefersReducedMotion ? 9 : 9 - prog * 5.4;
        curX += (targetX - curX) * 0.05;
        curY += (targetY - curY) * 0.05;
        curZ += (targetZ - curZ) * 0.05;
        camera.position.set(curX, curY, curZ);
        camera.lookAt(0, 0, 0);
        if (!prefersReducedMotion) { group.rotation.y += 0.00055; starfield.rotation.y += 0.0001; }
        mat.opacity = isDark ? 1 : 0.42;
        sfMat.opacity = isDark ? 0.6 : 0.2;
        renderer.render(scene, camera);
    }
    window.__galaxyRender = renderOnce;
    window.addEventListener('resize', onResize);

    if (prefersReducedMotion) {
        renderOnce();
        window.addEventListener('scroll', renderOnce, { passive: true });
    } else {
        (function loop() { renderOnce(); requestAnimationFrame(loop); })();
    }
}

/* ---------- 2D CANVAS FALLBACK ENGINE ---------- */
const canvas = document.getElementById('galaxy-engine');
let ctx = canvas ? canvas.getContext('2d') : null;
let stars = [], nebulaClouds = [], shootingStars2D = [], constellationPts = [];
const numStars = 260;
let galaxyRotation = 0, scrollWarp = 0, lastScrollY = window.scrollY, parallaxX = 0, parallaxY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    initGalaxy2D(); initConstellation();
}
class Star2D {
    constructor() { this.reset(); }
    reset() {
        const theta = Math.random() * Math.PI * 2, arm = Math.floor(Math.random() * 3), armOffset = (arm * Math.PI * 2) / 3;
        this.distance = Math.random() * Math.max(canvas.width, canvas.height) * 0.55;
        this.angle = theta + armOffset + (this.distance * 0.002);
        this.size = Math.random() * 1.6 + 0.4;
        this.baseOpacity = Math.random() * 0.5 + 0.25;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
        const cr = Math.random();
        this.color = cr < 0.4 ? { r: 139, g: 92, b: 246 } : cr < 0.8 ? { r: 236, g: 72, b: 153 } : { r: 96, g: 165, b: 250 };
    }
    draw(isDark, t) {
        const streak = Math.min(scrollWarp, 40);
        const x = canvas.width / 2 + Math.cos(this.angle + galaxyRotation) * this.distance + parallaxX * (this.distance / canvas.width) * 0.4;
        const y = canvas.height / 2 + Math.sin(this.angle + galaxyRotation) * this.distance * 0.5 + parallaxY * (this.distance / canvas.height) * 0.4;
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) return;
        const twinkle = 0.7 + 0.3 * Math.sin(t * this.twinkleSpeed + this.twinklePhase);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${(isDark ? this.baseOpacity : this.baseOpacity * 0.5) * twinkle})`;
        if (streak > 2) {
            const dx = Math.cos(this.angle + galaxyRotation + Math.PI / 2) * streak, dy = Math.sin(this.angle + galaxyRotation + Math.PI / 2) * streak * 0.5;
            ctx.beginPath(); ctx.moveTo(x - dx, y - dy); ctx.lineTo(x + dx, y + dy); ctx.lineWidth = this.size; ctx.strokeStyle = ctx.fillStyle; ctx.stroke();
        } else { ctx.beginPath(); ctx.arc(x, y, this.size, 0, Math.PI * 2); ctx.fill(); }
    }
}
class NebulaCloud2D {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * 100; this.y = Math.random() * 100; this.r = Math.random() * 260 + 180;
        this.hue = Math.random() > 0.5 ? [139, 92, 246] : [236, 72, 153];
        this.driftX = (Math.random() - 0.5) * 0.015; this.driftY = (Math.random() - 0.5) * 0.015;
    }
    update() { this.x += this.driftX; this.y += this.driftY; if (this.x < -10 || this.x > 110) this.driftX *= -1; if (this.y < -10 || this.y > 110) this.driftY *= -1; }
    draw(isDark) {
        const px = (this.x / 100) * canvas.width, py = (this.y / 100) * canvas.height;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, this.r);
        grad.addColorStop(0, `rgba(${this.hue[0]}, ${this.hue[1]}, ${this.hue[2]}, ${isDark ? 0.05 : 0.03})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fillRect(px - this.r, py - this.r, this.r * 2, this.r * 2);
    }
}
function initGalaxy2D() {
    stars = []; for (let i = 0; i < numStars; i++) stars.push(new Star2D());
    nebulaClouds = []; for (let i = 0; i < 4; i++) nebulaClouds.push(new NebulaCloud2D());
}
function initConstellation() {
    constellationPts = []; if (prefersReducedMotion) return;
    const count = Math.min(70, Math.max(24, Math.floor(window.innerWidth / 24)));
    for (let i = 0; i < count; i++) constellationPts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 });
}
function renderConstellation(isDark) {
    if (!constellationPts.length) return;
    const linkDist = 120, pullRadius = 190, baseAlpha = isDark ? 0.55 : 0.4;
    for (const p of constellationPts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = canvas.width + 20; if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20; if (p.y > canvas.height + 20) p.y = -20;
        const dxc = mouseX - p.x, dyc = mouseY - p.y, dc = Math.hypot(dxc, dyc);
        if (dc < pullRadius && dc > 1) {
            const f = (1 - dc / pullRadius) * 0.4; p.x += (dxc / dc) * f; p.y += (dyc / dc) * f;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(236,72,153,${(1 - dc / pullRadius) * 0.4})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fillStyle = `rgba(139,92,246,${baseAlpha})`; ctx.fill();
    }
    for (let i = 0; i < constellationPts.length; i++) {
        const a = constellationPts[i];
        for (let j = i + 1; j < constellationPts.length; j++) {
            const b = constellationPts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkDist) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(99,102,241,${(1 - d / linkDist) * baseAlpha * 0.45})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
    }
}
function renderGalaxy2D(t) {
    const isDark = document.documentElement.classList.contains('dark');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nebulaClouds.forEach(c => { c.update(); c.draw(isDark); });
    galaxyRotation += prefersReducedMotion ? 0 : 0.0009;
    scrollWarp *= 0.9; if (scrollWarp < 0.1) scrollWarp = 0;
    for (let i = 0; i < stars.length; i++) stars[i].draw(isDark, t);
    if (!prefersReducedMotion) renderConstellation(isDark);
    requestAnimationFrame(renderGalaxy2D);
}
function init2DGalaxy() {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(renderGalaxy2D);
    window.addEventListener('scroll', () => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        scrollWarp = Math.min(scrollWarp + delta * 0.6, 45);
        lastScrollY = window.scrollY;
    }, { passive: true });
    if (!prefersReducedMotion) {
        document.addEventListener('mousemove', (e) => {
            const nx = (e.clientX / window.innerWidth - 0.5), ny = (e.clientY / window.innerHeight - 0.5);
            parallaxX += (nx * 30 - parallaxX) * 0.05; parallaxY += (ny * 30 - parallaxY) * 0.05;
        });
    }
}

/* ---------- pick engine ---------- */
(function initBackground() {
    const engineEl = document.getElementById('hud-engine');
    if (USE_WEBGL) {
        try {
            initWebGLGalaxy(); webglActive = true;
            const g2d = document.getElementById('galaxy-engine'); if (g2d) g2d.style.display = 'none';
            if (engineEl) engineEl.textContent = 'ONLINE';
        } catch (e) { console.warn('WebGL galaxy failed — using 2D fallback', e); webglActive = false; }
    }
    if (!webglActive) {
        const w = document.getElementById('webgl-galaxy'); if (w) w.style.display = 'none';
        if (engineEl) engineEl.textContent = '2D';
        init2DGalaxy();
    }
})();

/* ---------- CSS shooting stars (engine-agnostic) ---------- */
function spawnShootingStar() {
    const layer = document.getElementById('shooting-layer'); if (!layer || document.hidden) return;
    const s = document.createElement('div'); s.className = 'shooting-star';
    s.style.left = (Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.3) + 'px';
    s.style.top = (Math.random() * window.innerHeight * 0.3) + 'px';
    const dx = -(200 + Math.random() * 220), dy = (200 + Math.random() * 220);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    s.animate(
        [{ transform: `translate(0,0) rotate(${ang}deg)`, opacity: 0 }, { opacity: 1, offset: 0.12 }, { transform: `translate(${dx}px,${dy}px) rotate(${ang}deg)`, opacity: 0 }],
        { duration: 900 + Math.random() * 500, easing: 'ease-in' }
    );
    layer.appendChild(s);
    setTimeout(() => s.remove(), 1600);
}
if (!prefersReducedMotion) setInterval(() => { if (Math.random() < 0.5) spawnShootingStar(); }, 3600);

/* ============ HERO PARALLAX LAYERS ============ */
if (!prefersReducedMotion) {
    const heroSection = document.getElementById('hero');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    heroSection.addEventListener('mousemove', (e) => {
        const r = heroSection.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        parallaxLayers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth || 0.05) * 100;
            layer.style.transform = `translate(${px * depth}px, ${py * depth}px)`;
        });
    });
    heroSection.addEventListener('mouseleave', () => parallaxLayers.forEach(layer => layer.style.transform = ''));
}

/* ============ TILT CARDS ============ */
function initTilt(scope = document) {
    if (prefersReducedMotion) return;
    scope.querySelectorAll('.tilt-card').forEach(card => {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = '1';
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(0)`;
            const parent = card.closest('.glass-card, .project-card, .bento-cell') || card;
            parent.style.setProperty('--mx', `${px * 100}%`);
            parent.style.setProperty('--my', `${py * 100}%`);
        });
        card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'; });
    });
}
initTilt();

/* ============ SCROLL REVEAL + HEADING WORD REVEAL ============ */
function setupWordReveal() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('section.reveal-on-scroll h3').forEach(h => {
        if (h.dataset.rw) return; h.dataset.rw = '1';
        const words = h.textContent.trim().split(/\s+/);
        h.classList.add('reveal-words');
        h.innerHTML = words.map(w => `<span class="rw"><span>${w}</span></span>`).join(' ');
    });
}
setupWordReveal();

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const h = entry.target.querySelector('h3.reveal-words'); if (h) h.classList.add('in');
            entry.target.querySelectorAll('.reveal-item').forEach((child, i) => setTimeout(() => child.classList.add('visible'), i * 90));
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal-on-scroll').forEach(section => {
    section.querySelectorAll(':scope .glass-card, :scope .bento-cell, :scope .orbital-node, :scope .skill-pill-static').forEach(el => el.classList.add('reveal-item'));
    revealObserver.observe(section);
});

/* ============ COUNTERS ============ */
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.counter-stat').forEach(el => counterObserver.observe(el));
function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (Number.isNaN(target)) return;
    if (prefersReducedMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const duration = 1500, start = performance.now();
    function step(now) {
        const p = Math.min((now - start) / duration, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (eased * target).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
}

/* ============ NAV + SECTION RAIL ============ */
function buildSectionRail() {
    const rail = document.getElementById('section-rail'); if (!rail) return;
    const secs = [['hero', 'Home'], ['about', 'Mission Control'], ['skills', 'Skills'], ['projects', 'Projects'], ['experience', 'Timeline'], ['education', 'Credentials'], ['contact', 'Contact']];
    rail.innerHTML = secs.map(([id, label]) => `<button class="rail-dot cursor-hover-trigger" data-target="#${id}" aria-label="${label}"><span class="rd-label">${label}</span><span class="rd-core"></span></button>`).join('');
    rail.querySelectorAll('.rail-dot').forEach(d => d.addEventListener('click', () => {
        const t = document.querySelector(d.dataset.target);
        if (t) t.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }));
    attachCursorTriggers(rail);
}
buildSectionRail();

const navItems = document.querySelectorAll('.nav-item');
function setActiveSection(id) {
    navItems.forEach(n => n.classList.remove('active'));
    const link = document.querySelector(`.nav-item[href="#${id}"]`); if (link) link.classList.add('active');
    document.querySelectorAll('.rail-dot').forEach(d => d.classList.toggle('active', d.dataset.target === ('#' + id)));
}
const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.getAttribute('id')); });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('section[id]').forEach(s => navObserver.observe(s));

/* ============ GHOST SECTION NUMBERS ============ */
(function addGhostNumbers() {
    const map = { about: '01', skills: '02', projects: '03', experience: '04', education: '05', contact: '06' };
    Object.entries(map).forEach(([id, num]) => {
        const s = document.getElementById(id); if (!s) return;
        const g = document.createElement('div'); g.className = 'ghost-index'; g.textContent = num; s.appendChild(g);
    });
})();

/* ============ KINETIC NAME + SCRAMBLE ROLE ============ */
function revealHero() {
    const nameEl = document.getElementById('hero-name');
    if (nameEl && !prefersReducedMotion && !nameEl.dataset.split) {
        nameEl.dataset.split = '1';
        const text = nameEl.dataset.text || nameEl.textContent.trim();
        nameEl.innerHTML = '';
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            if (ch === ' ') { span.className = 'kl space'; span.innerHTML = '&nbsp;'; }
            else { span.className = 'kl'; span.textContent = ch; }
            span.style.animationDelay = (0.25 + i * 0.045) + 's';
            nameEl.appendChild(span);
        });
        requestAnimationFrame(() => nameEl.classList.add('revealed'));
    }
    startRoleScramble();
}
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#░▒▓01';
class TextScramble {
    constructor(el) { this.el = el; this.queue = []; this.frame = 0; this.frameRequest = null; this.resolve = null; this.update = this.update.bind(this); }
    setText(newText) {
        const old = this.el.textContent, len = Math.max(old.length, newText.length);
        const promise = new Promise(res => this.resolve = res);
        this.queue = [];
        for (let i = 0; i < len; i++) {
            const from = old[i] || '', to = newText[i] || '';
            const start = Math.floor(Math.random() * 40), end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end, char: '' });
        }
        cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = '', complete = 0;
        for (let i = 0; i < this.queue.length; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; }
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) { char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]; this.queue[i].char = char; }
                output += `<span class="term-dim">${char}</span>`;
            } else output += from;
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { if (this.resolve) this.resolve(); }
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
}
const ROLES = ["Full Stack Developer", "Java & Spring Boot Engineer", "Microservices Architect", "AWS Certified Builder"];
function startRoleScramble() {
    const el = document.getElementById('typewriter'); if (!el) return;
    if (prefersReducedMotion) { el.textContent = ROLES[0]; return; }
    const fx = new TextScramble(el); let i = 0;
    const next = () => { fx.setText(ROLES[i]).then(() => setTimeout(next, 1900)); i = (i + 1) % ROLES.length; };
    next();
}

/* ============ STATUS TICKER ============ */
const statusMessages = ["Architecting distributed systems", "Shipping production-ready features", "Solving algorithms at 2am", "Open to full-stack & backend roles"];
let statusIndex = 0;
if (!prefersReducedMotion) {
    setInterval(() => {
        const el = document.getElementById('status-ticker'); if (!el) return;
        el.classList.add('swap');
        setTimeout(() => { statusIndex = (statusIndex + 1) % statusMessages.length; el.textContent = statusMessages[statusIndex]; el.classList.remove('swap'); }, 350);
    }, 3800);
}

/* ============ COCKPIT HUD ============ */
(function startHUD() {
    const t = document.getElementById('hud-time');
    const pad = n => String(n).padStart(2, '0');
    function tick() { const d = new Date(); if (t) t.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }
    tick(); setInterval(tick, 1000);
    const hx = document.getElementById('hud-x'), hy = document.getElementById('hud-y');
    if (hx && hy) document.addEventListener('mousemove', () => {
        const nx = (mouseX / window.innerWidth - 0.5) * 2, ny = (mouseY / window.innerHeight - 0.5) * 2;
        hx.textContent = (nx >= 0 ? '+' : '') + nx.toFixed(2);
        hy.textContent = (ny >= 0 ? '+' : '') + ny.toFixed(2);
    }, { passive: true });
})();

/* ============ BOOT SEQUENCE ============ */
function runBoot() {
    const pctEl = document.getElementById('boot-pct'), ring = document.getElementById('boot-ring');
    const bar = document.getElementById('boot-bar-fill'), log = document.getElementById('boot-log');
    const CIRC = 364.4;
    const logs = [
        ['NAV', 'navigation core'], ['GPU', 'webgl galaxy engine'], ['DAT', 'project telemetry'],
        ['SEC', 'mission-control uplink'], ['SYS', 'all systems nominal']
    ];
    let shown = 0;
    const dur = prefersReducedMotion ? 150 : 1700, start = performance.now();
    function appendLog(n) {
        while (shown < n && shown < logs.length) {
            const l = logs[shown], li = document.createElement('li');
            li.innerHTML = `<span class="bl-arrow">▸</span><span><span class="bl-ok">[ OK ]</span> ${l[0]} — ${l[1]}</span>`;
            if (log) log.appendChild(li);
            shown++;
        }
    }
    function tick(now) {
        const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 2), pct = Math.round(eased * 100);
        if (pctEl) pctEl.textContent = pct;
        if (ring) ring.style.strokeDashoffset = CIRC * (1 - eased);
        if (bar) bar.style.width = pct + '%';
        appendLog(Math.floor(eased * logs.length));
        if (p < 1) requestAnimationFrame(tick);
        else {
            appendLog(logs.length);
            setTimeout(() => {
                const pre = document.getElementById('preloader');
                if (pre) pre.classList.add('warp');
                document.body.classList.add('loaded-in');
                revealHero();
                setTimeout(() => { if (pre) pre.remove(); }, 760);
            }, prefersReducedMotion ? 40 : 380);
        }
    }
    requestAnimationFrame(tick);
}
runBoot();

/* ============ RESUME DOWNLOAD ============ */
const RESUME_FILE = 'Shubham_FSE_resume.pdf';
function downloadResume() {
    const link = document.createElement('a');
    link.href = RESUME_FILE; link.download = 'Shubham_Tripathi_Resume.pdf';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast('Résumé downloaded — thanks for stopping by!', 'fa-solid fa-circle-check');
}

/* ============================================================
   PROJECTS
   ============================================================ */
const ACCENT_VAR = { stellar: 'var(--stellar)', cosmic: 'var(--cosmic)', nebula: 'var(--nebula)', flare: 'var(--flare)' };
const tint = (v, pct) => v.replace('var(', 'color-mix(in srgb, var(').replace(')', `) ${pct}%, transparent)`);

const projectData = {
    'hiresphere': {
        title: 'HireSphere', subtitle: 'AI-Powered Job Portal', badge: 'Flagship • 10 Microservices', icon: 'fa-layer-group',
        accent: 'stellar', flagship: true, categories: ['backend', 'fullstack', 'ai'],
        value: 'A distributed hiring platform — 10 Spring Boot microservices behind an API Gateway, event-driven with Kafka, and augmented by 8 Gemini-powered AI features.',
        metrics: [{ v: '10', l: 'Microservices' }, { v: '6', l: 'Kafka Topics' }, { v: '8', l: 'AI Features' }],
        tech: ['Java 21', 'Spring Boot', 'Spring Cloud', 'Apache Kafka', 'React', 'PostgreSQL', 'Redis', 'Docker', 'Gemini API', 'Razorpay'],
        github: 'https://github.com/theshubhamtripathi', live: null,
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
        title: 'URL Shortener Service', subtitle: 'Spring Boot REST API', badge: 'Backend • Clean Architecture', icon: 'fa-link',
        accent: 'cosmic', flagship: false, categories: ['backend'],
        value: 'A Spring Boot REST API that generates unique short codes and redirects visitors to the original URL through a single, reliable endpoint.',
        metrics: [{ v: '3', l: 'Layer Design' }, { v: 'JUnit', l: '+ Mockito' }, { v: 'JPA', l: 'Hibernate' }],
        tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'Hibernate', 'REST APIs', 'SQL', 'JUnit', 'Mockito'],
        github: 'https://github.com/theshubhamtripathi', live: null,
        overview: 'A URL shortening service that turns long links into compact, shareable short codes. It exposes a clean Spring Boot REST API that generates unique codes and redirects visitors to the original URL through a single endpoint — built to be easy to extend and container-ready.',
        decisions: [
            'Built a Spring Boot REST API that generates unique short codes with single-endpoint redirection to the original URL.',
            'Structured the backend in a clean layered Controller–Service–Repository architecture using Spring Data JPA / Hibernate, with unique-code constraints to keep link mappings consistent and lookups reliable.',
            'Added request validation and centralized exception handling that return predictable HTTP status codes for invalid URLs and unknown codes.',
            'Verified business logic with JUnit and Mockito unit tests and managed the codebase with Git — producing an easy-to-extend service ready for containerized deployment.'
        ],
        impact: [{ m: '3-Tier', l: 'Architecture' }, { m: '100%', l: 'Validated Inputs' }, { m: 'Unit', l: 'Tested Logic' }],
        architecture: false
    },
    'focus-flow': {
        title: 'Focus Flow', subtitle: 'Productivity System', badge: 'Full Stack • Analytics', icon: 'fa-bullseye',
        accent: 'nebula', flagship: false, categories: ['fullstack'],
        value: 'A full-stack productivity app pairing a Pomodoro timer with task management, streak tracking, and a visual analytics dashboard.',
        metrics: [{ v: 'MVVM', l: 'Architecture' }, { v: 'CRUD', l: 'Persistence' }, { v: 'Charts', l: 'Analytics' }],
        tech: ['SwiftUI', 'MVVM', 'CoreData', 'Combine', 'Swift Charts'],
        github: 'https://github.com/theshubhamtripathi', live: null,
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
        title: 'HireGuard AI', subtitle: 'Fraud Detection NLP', badge: 'AI / Systems • NLP', icon: 'fa-shield-halved',
        accent: 'flare', flagship: false, categories: ['ai'],
        value: 'An NLP-powered system that classifies fraudulent job postings, helping job seekers spot scam listings before they apply.',
        metrics: [{ v: 'TF-IDF', l: 'Vectorizer' }, { v: 'ML', l: 'Classifiers' }, { v: 'Flask', l: 'Inference API' }],
        tech: ['Python', 'NLP', 'scikit-learn', 'Flask', 'TF-IDF'],
        github: 'https://github.com/theshubhamtripathi', live: null,
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
    const d = projectData[id], accent = ACCENT_VAR[d.accent];
    const card = document.createElement('article');
    card.className = 'project-card tilt-card cursor-hover-trigger' + (d.flagship ? ' flagship' : '');
    card.dataset.id = id; card.dataset.cats = d.categories.join(' ');
    card.dataset.cursorLabel = 'OPEN ↗';
    card.setAttribute('tabindex', '0'); card.setAttribute('role', 'button'); card.setAttribute('aria-label', `Open ${d.title} case study`);
    const metricPills = d.metrics.map(m => `<span class="metric-pill"><b>${m.v}</b> ${m.l}</span>`).join('');
    const techChips = d.tech.map(t => `<span class="tag-span">${t}</span>`).join('');
    card.innerHTML = `
        <div class="proj-glow" style="background:${accent}"></div>
        <div class="proj-glare"></div>
        <div class="flex items-center justify-between mb-4">
            <span class="proj-badge" style="color:${accent};background:${tint(accent, 12)}"><i class="fa-solid ${d.icon}"></i>${d.badge}</span>
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-base" style="color:${accent};background:${tint(accent, 12)}"><i class="fa-solid ${d.icon}"></i></div>
        </div>
        <h4 class="proj-title">${d.title}</h4>
        <div class="proj-subtitle mt-1" style="color:${accent}">${d.subtitle}</div>
        <p class="proj-value mt-3 mb-4">${d.value}</p>
        <div class="flex flex-wrap gap-2 mb-4">${metricPills}</div>
        <div class="flex flex-wrap gap-1.5 mb-5">${techChips}</div>
        <div class="mt-auto flex items-center justify-between pt-1">
            <span class="proj-cta">Explore Architecture <i class="fa-solid fa-arrow-right-long"></i></span>
            <a href="${d.github}" target="_blank" rel="noopener" class="proj-ghlink cursor-hover-trigger" aria-label="${d.title} on GitHub" data-ghlink><i class="fa-brands fa-github"></i></a>
        </div>`;
    card.addEventListener('click', (e) => { if (e.target.closest('[data-ghlink]')) return; openProjectModal(id); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProjectModal(id); } });
    return card;
}
function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid'); grid.innerHTML = ''; let delay = 0;
    projectOrder.forEach(id => {
        const d = projectData[id];
        if (!(filter === 'all' || d.categories.includes(filter))) return;
        const card = buildProjectCard(id); grid.appendChild(card);
        if (!prefersReducedMotion) { card.style.animationDelay = `${delay}ms`; card.classList.add('pop-in'); delay += 80; }
    });
    attachCursorTriggers(grid); attachCursorLabels(grid); initTilt(grid);
}
renderProjects();
document.querySelectorAll('.filter-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active'); renderProjects(tab.dataset.filter);
}));

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
                <div class="arch-stage"><div class="arch-node" data-accent="cosmic" data-role="client"><i class="fa-brands fa-react"></i>React Client</div></div>
                <div class="arch-arrow"><i class="fa-solid fa-arrow-right-long"></i></div>
                <div class="arch-stage"><div class="arch-node" data-accent="stellar" data-role="gateway"><i class="fa-solid fa-shield-halved"></i>API Gateway<br><span style="font-weight:600;opacity:.8">JWT · Redis · R4j</span></div></div>
                <div class="arch-arrow"><i class="fa-solid fa-arrow-right-long"></i></div>
                <div class="arch-stage"><div class="arch-node" data-accent="stellar" data-role="services"><i class="fa-solid fa-cubes"></i>10 Services<br><span style="font-weight:600;opacity:.8">+ Eureka</span></div></div>
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
    const caption = document.getElementById('arch-caption'); if (!caption) return;
    const nodes = document.querySelectorAll('.arch-node');
    nodes.forEach(node => {
        const activate = () => { nodes.forEach(n => n.classList.remove('active')); node.classList.add('active'); caption.innerHTML = ARCH_ROLES[node.dataset.role] || ''; };
        node.addEventListener('mouseenter', activate); node.addEventListener('focus', activate); node.addEventListener('click', activate);
        node.setAttribute('tabindex', '0');
    });
}

/* ---------- Modal open/close ---------- */
let lastFocusedEl = null;
function openProjectModal(id) {
    const d = projectData[id]; if (!d) return;
    const modal = document.getElementById('project-modal'), content = document.getElementById('modal-content'), accent = ACCENT_VAR[d.accent];
    const decisions = d.decisions.map(x => `<div class="modal-decision"><span class="mk">▷</span><span>${x}</span></div>`).join('');
    const impact = d.impact.map(x => `<div class="impact-cell"><div class="impact-metric">${x.m}</div><div class="impact-label">${x.l}</div></div>`).join('');
    const tech = d.tech.map(t => `<span class="tag-span">${t}</span>`).join('');
    const liveBtn = d.live ? `<a href="${d.live}" target="_blank" rel="noopener" class="modal-btn primary"><i class="fa-solid fa-arrow-up-right-from-square"></i>Live Demo</a>` : '';
    content.innerHTML = `
        <div class="modal-hero">
            <div class="modal-hero-glow" style="background:${accent}"></div>
            <span class="proj-badge" style="color:${accent};background:${tint(accent, 14)}"><i class="fa-solid ${d.icon}"></i>${d.badge}</span>
            <h3 id="modal-title" class="text-2xl sm:text-3xl font-black mt-4 text-space-900 dark:text-white">${d.title}</h3>
            <div class="proj-subtitle mt-1" style="color:${accent}">${d.subtitle}</div>
        </div>
        <div class="modal-body">
            <div class="modal-section"><div class="modal-section-title">Overview</div><p class="text-sm leading-relaxed text-space-900/75 dark:text-slate-300">${d.overview}</p></div>
            ${d.architecture ? architectureHTML() : ''}
            <div class="modal-section"><div class="modal-section-title">Key Engineering Decisions</div>${decisions}</div>
            <div class="modal-section"><div class="modal-section-title">Impact Metrics</div><div class="impact-grid">${impact}</div></div>
            <div class="modal-section"><div class="modal-section-title">Full Tech Stack</div><div class="flex flex-wrap gap-1.5">${tech}</div></div>
            <div class="modal-actions">
                <a href="${d.github}" target="_blank" rel="noopener" class="modal-btn ${d.live ? 'ghost' : 'primary'}"><i class="fa-brands fa-github"></i>View on GitHub</a>
                ${liveBtn}
            </div>
        </div>`;
    if (d.architecture) wireArchitecture();
    lastFocusedEl = document.activeElement;
    modal.classList.remove('hidden'); modal.classList.add('flex');
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden'; content.parentElement.scrollTop = 0;
    const panel = modal.querySelector('.modal-panel'); setTimeout(() => panel.focus(), 60);
    document.addEventListener('keydown', trapModalFocus);
}
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal.classList.contains('hidden')) return;
    modal.classList.remove('open');
    setTimeout(() => { modal.classList.add('hidden'); modal.classList.remove('flex'); }, 300);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapModalFocus);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
}
function trapModalFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = document.getElementById('project-modal');
    const f = modal.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])'); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
document.getElementById('project-modal').addEventListener('click', (e) => { if (e.target.id === 'project-modal') closeProjectModal(); });

/* ============================================================
   COMMAND PALETTE
   ============================================================ */
const CMDK_ACTIONS = [
    { group: 'Navigate', icon: 'fa-user-astronaut', label: 'About · Mission Control', sub: 'about', run: () => goTo('#about') },
    { group: 'Navigate', icon: 'fa-diagram-project', label: 'Technical Skills', sub: 'skills', run: () => goTo('#skills') },
    { group: 'Navigate', icon: 'fa-rocket', label: 'Projects', sub: 'projects', run: () => goTo('#projects') },
    { group: 'Navigate', icon: 'fa-timeline', label: 'Experience Timeline', sub: 'experience', run: () => goTo('#experience') },
    { group: 'Navigate', icon: 'fa-graduation-cap', label: 'Education & Certifications', sub: 'education', run: () => goTo('#education') },
    { group: 'Navigate', icon: 'fa-satellite-dish', label: 'Contact', sub: 'contact', run: () => goTo('#contact') },
    { group: 'Actions', icon: 'fa-terminal', label: 'Open interactive terminal', sub: '~', run: () => { closeCmdk(); setTimeout(openTerminal, 180); } },
    { group: 'Projects', icon: 'fa-layer-group', label: 'Open HireSphere case study', sub: 'flagship', run: () => { closeCmdk(); setTimeout(() => openProjectModal('hiresphere'), 180); } },
    { group: 'Projects', icon: 'fa-link', label: 'Open URL Shortener case study', sub: 'backend', run: () => { closeCmdk(); setTimeout(() => openProjectModal('url-shortener'), 180); } },
    { group: 'Actions', icon: 'fa-circle-half-stroke', label: 'Toggle dark / light mode', sub: 'theme', run: () => toggleTheme() },
    { group: 'Actions', icon: 'fa-envelope', label: 'Copy email address', sub: 'copy', run: () => { copyToClipboard('theshubhamtripathi06@gmail.com', 'Email copied to clipboard!'); closeCmdk(); } },
    { group: 'Actions', icon: 'fa-download', label: 'Download résumé (PDF)', sub: 'resume', run: () => { downloadResume(); closeCmdk(); } },
    { group: 'Links', icon: 'fa-github', label: 'Open GitHub', sub: '↗', run: () => window.open('https://github.com/theshubhamtripathi', '_blank') },
    { group: 'Links', icon: 'fa-linkedin', label: 'Open LinkedIn', sub: '↗', run: () => window.open('https://www.linkedin.com/in/theshubhamtripathi/', '_blank') },
    { group: 'Links', icon: 'fa-code', label: 'Open LeetCode', sub: '↗', run: () => window.open('https://leetcode.com/u/6st786/', '_blank') }
];
const cmdk = document.getElementById('cmdk'), cmdkInput = document.getElementById('cmdk-input'), cmdkList = document.getElementById('cmdk-list');
let cmdkFiltered = [], cmdkSelected = 0;
function goTo(hash) { closeCmdk(); const el = document.querySelector(hash); if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }); }
function renderCmdk(query = '') {
    const q = query.trim().toLowerCase();
    cmdkFiltered = CMDK_ACTIONS.filter(a => !q || a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q) || (a.sub && a.sub.toLowerCase().includes(q)));
    cmdkSelected = 0;
    if (!cmdkFiltered.length) { cmdkList.innerHTML = `<li class="cmdk-empty">No matches — try “projects”, “resume”, or “terminal”.</li>`; return; }
    let html = '', lastGroup = '';
    cmdkFiltered.forEach((a, i) => {
        if (a.group !== lastGroup) { html += `<li class="cmdk-group-label">${a.group}</li>`; lastGroup = a.group; }
        const iconClass = ['fa-github', 'fa-linkedin'].includes(a.icon) ? 'fa-brands' : 'fa-solid';
        html += `<li class="cmdk-item${i === 0 ? ' selected' : ''}" data-idx="${i}" role="option"><span class="cmdk-ico"><i class="${iconClass} ${a.icon}"></i></span><span class="cmdk-label">${a.label}</span><span class="cmdk-sub">${a.sub || ''}</span></li>`;
    });
    cmdkList.innerHTML = html;
    cmdkList.querySelectorAll('.cmdk-item').forEach(item => {
        const idx = parseInt(item.dataset.idx, 10);
        item.addEventListener('mouseenter', () => setCmdkSelection(idx));
        item.addEventListener('click', () => runCmdk(idx));
    });
}
function setCmdkSelection(idx) { cmdkSelected = idx; cmdkList.querySelectorAll('.cmdk-item').forEach(item => item.classList.toggle('selected', parseInt(item.dataset.idx, 10) === idx)); }
function moveCmdkSelection(dir) {
    if (!cmdkFiltered.length) return;
    cmdkSelected = (cmdkSelected + dir + cmdkFiltered.length) % cmdkFiltered.length;
    setCmdkSelection(cmdkSelected);
    const el = cmdkList.querySelector(`.cmdk-item[data-idx="${cmdkSelected}"]`); if (el) el.scrollIntoView({ block: 'nearest' });
}
function runCmdk(idx) { const a = cmdkFiltered[idx]; if (a) a.run(); }
function openCmdk() { cmdk.classList.remove('hidden'); cmdk.classList.add('open'); cmdkInput.value = ''; renderCmdk(''); document.body.style.overflow = 'hidden'; setTimeout(() => cmdkInput.focus(), 40); }
function closeCmdk() {
    cmdk.classList.remove('open'); setTimeout(() => cmdk.classList.add('hidden'), 220);
    if (document.getElementById('project-modal').classList.contains('hidden') && !isTerminalOpen()) document.body.style.overflow = '';
}
function toggleCmdk() { if (cmdk.classList.contains('open')) closeCmdk(); else openCmdk(); }
document.getElementById('cmdk-trigger').addEventListener('click', openCmdk);
document.getElementById('cmdk-backdrop').addEventListener('click', closeCmdk);
cmdkInput.addEventListener('input', (e) => renderCmdk(e.target.value));
cmdkInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdkSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdkSelection(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmdk(cmdkSelected); }
});

/* ============================================================
   COSMIC TERMINAL
   ============================================================ */
const TERM = { open: false, booted: false, history: [], histIdx: 0 };
function termNode(id) { return document.getElementById(id); }
function isTerminalOpen() { return TERM.open; }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function termPrint(html, cls = '') { const body = termNode('terminal-body'); const div = document.createElement('div'); div.className = 'term-line ' + cls; div.innerHTML = html; body.appendChild(div); body.scrollTop = body.scrollHeight; return div; }
function termEcho(cmd) { termPrint(`<span class="term-cmd-echo"><span style="color:var(--stellar);font-weight:700">shubham</span><span class="term-dim">@</span><span style="color:var(--cosmic);font-weight:700">mission-control</span><span class="term-dim">:</span><span style="color:var(--flare)">~</span><span style="color:var(--stellar)"> $ </span>${escapeHtml(cmd)}</span>`); }
function termLink(label, url) { return `<span class="term-link" data-term-open="${url}">${label}</span>`; }

function termBanner() {
    termPrint(`<span class="term-banner">╔══════════════════════════════════════════╗
║   ███████╗████████╗   SHUBHAM TRIPATHI     ║
║   ██╔════╝╚══██╔══╝   Full Stack Developer ║
║   ███████╗   ██║      Java · Spring · React║
║   ╚════██║   ██║      AWS Certified ×2      ║
║   ███████║   ██║      Mission Control v3.0  ║
║   ╚══════╝   ╚═╝                            ║
╚══════════════════════════════════════════╝</span>`);
    termPrint(`<span class="term-dim">Type </span><span class="term-accent">help</span><span class="term-dim"> for commands · </span><span class="term-accent">neofetch</span><span class="term-dim"> for stats · </span><span class="term-accent">open hiresphere</span><span class="term-dim"> to launch a case study.</span>`);
}
const TERM_CMDS = {
    help() {
        const rows = [
            ['help', 'list all commands'], ['about / whoami', 'who I am'], ['skills', 'tech stack'],
            ['projects', 'list projects'], ['open <name>', 'open a project case study'], ['experience', 'work history'],
            ['education', 'academics & certs'], ['stats', 'competitive-programming stats'], ['contact', 'how to reach me'],
            ['socials', 'profile links'], ['resume', 'download my résumé'], ['goto <section>', 'scroll to a section'],
            ['theme [dark|light]', 'switch theme'], ['neofetch', 'system info card'], ['clear', 'clear the screen'], ['exit', 'close terminal']
        ];
        termPrint(`<span class="term-accent">Available commands</span>`);
        termPrint(`<div class="term-table">${rows.map(r => `<span class="tk">${r[0]}</span><span class="term-dim">${r[1]}</span>`).join('')}</div>`);
        termPrint(`<span class="term-dim">↑/↓ history · Tab autocomplete · try </span><span class="term-flare">sudo hire-shubham</span>`);
    },
    about() {
        termPrint(`<span class="term-accent">Shubham Tripathi</span> — Full Stack Developer`);
        termPrint(`Skilled in <span class="term-key">Java (Spring Boot)</span> and <span class="term-key">React</span>, with hands-on experience in REST API design, database modeling, and auth. Strong in DSA, algorithms, and OOP — shipping complete, production-ready features end-to-end.`);
    },
    whoami() { return `<span class="term-accent">shubham</span> · full-stack developer · builder of distributed systems · AWS Certified ×2`; },
    skills() {
        const groups = { Languages: ['Java', 'C++', 'SQL'], Backend: ['Spring Boot', 'Spring Security', 'REST APIs', 'Apache Kafka'], Frontend: ['React.js', 'Tailwind CSS', 'HTML/CSS'], Databases: ['MySQL', 'PostgreSQL', 'Redis'], 'DevOps & Tools': ['Docker', 'Git', 'GitHub', 'AWS'], Concepts: ['Microservices', 'JWT Auth', 'WebSockets', 'Agile/Scrum'] };
        Object.entries(groups).forEach(([k, v]) => termPrint(`<span class="term-accent">${k.padEnd(14)}</span> <span class="term-dim">›</span> ${v.join(', ')}`));
    },
    projects() {
        termPrint(`<span class="term-accent">Projects</span> <span class="term-dim">— run </span><span class="term-flare">open &lt;name&gt;</span><span class="term-dim"> for a full case study</span>`);
        projectOrder.forEach(id => { const d = projectData[id]; termPrint(`<span class="term-cosmic">${id.padEnd(16)}</span> <span class="term-key">${d.title}</span> <span class="term-dim">— ${d.subtitle}${d.flagship ? '  ★ flagship' : ''}</span>`); });
    },
    open(args) {
        const key = (args[0] || '').toLowerCase().replace(/[^a-z]/g, '');
        const map = { hiresphere: 'hiresphere', urlshortener: 'url-shortener', url: 'url-shortener', focusflow: 'focus-flow', focus: 'focus-flow', hireguard: 'hire-guard', hireguardai: 'hire-guard' };
        const id = map[key];
        if (!id) { termPrint(`<span class="term-err">usage:</span> open &lt;hiresphere | url-shortener | focus-flow | hire-guard&gt;`); return; }
        termPrint(`<span class="term-ok">▸ launching</span> ${projectData[id].title} case study…`);
        closeTerminal(); setTimeout(() => openProjectModal(id), 300);
    },
    experience() {
        termPrint(`<span class="term-accent">amasQIS.ai</span> <span class="term-dim">· Software Development Intern · Jun–Dec 2025 · Remote</span>`);
        ['Fine-tuned a BioBERT model with LoRA → 92% precision across 15,000+ validation records.', 'Migrated Flask → async FastAPI, cutting API latency by 35%.', 'Agile workflow: sprint planning & code reviews.'].forEach(x => termPrint(`  <span class="term-nebula">▷</span> ${x}`));
    },
    education() {
        termPrint(`<span class="term-accent">B.Tech CSE (Core)</span> — VIT Bhopal · 2023–2027 · <span class="term-key">CGPA 9.32</span>`);
        termPrint(`<span class="term-flare">Certifications</span> · AWS Solutions Architect (SAA-C03) · AWS AI Practitioner (AIF-C01)`);
    },
    certs() { return TERM_CMDS.education(); },
    stats() {
        termPrint(`<span class="term-accent">Competitive Programming</span> — 700+ problems solved`);
        termPrint(`  <span class="term-cosmic">Codeforces</span>  Pupil (1360)   ${termLink('view ↗', 'https://codeforces.com/profile/_Enigmatic_')}`);
        termPrint(`  <span class="term-flare">CodeChef</span>    3★ (1692)       ${termLink('view ↗', 'https://www.codechef.com/users/theshubham786')}`);
        termPrint(`  <span class="term-nebula">LeetCode</span>    Rating 1552     ${termLink('view ↗', 'https://leetcode.com/u/6st786/')}`);
    },
    contact() {
        termPrint(`<span class="term-accent">Contact</span>`);
        termPrint(`  email  <span class="term-key">theshubhamtripathi06@gmail.com</span>`);
        termPrint(`  phone  <span class="term-key">+91 8318512443</span>`);
        termPrint(`  <span class="term-dim">tip: run </span><span class="term-flare">goto contact</span><span class="term-dim"> to open the form</span>`);
    },
    socials() {
        termPrint(`  ${termLink('GitHub ↗', 'https://github.com/theshubhamtripathi')}   ${termLink('LinkedIn ↗', 'https://www.linkedin.com/in/theshubhamtripathi/')}`);
        termPrint(`  ${termLink('LeetCode ↗', 'https://leetcode.com/u/6st786/')}   ${termLink('CodeChef ↗', 'https://www.codechef.com/users/theshubham786')}   ${termLink('Codeforces ↗', 'https://codeforces.com/profile/_Enigmatic_')}`);
    },
    links() { return TERM_CMDS.socials(); },
    resume() { downloadResume(); return `<span class="term-ok">▸ downloading</span> Shubham_Tripathi_Resume.pdf …`; },
    cv() { return TERM_CMDS.resume(); },
    goto(args) {
        const id = (args[0] || '').toLowerCase();
        const valid = ['hero', 'about', 'skills', 'projects', 'experience', 'education', 'contact'];
        if (!valid.includes(id)) { termPrint(`<span class="term-err">usage:</span> goto &lt;${valid.join(' | ')}&gt;`); return; }
        const el = document.getElementById(id); if (el) { closeTerminal(); setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 260); }
        return `<span class="term-ok">▸ navigating</span> → #${id}`;
    },
    theme(args) {
        const mode = (args[0] || '').toLowerCase(); const isDark = document.documentElement.classList.contains('dark');
        if (mode === 'dark' && !isDark) toggleTheme(); else if (mode === 'light' && isDark) toggleTheme(); else if (!mode) toggleTheme();
        return `<span class="term-ok">▸ theme</span> → ${document.documentElement.classList.contains('dark') ? 'dark' : 'light'}`;
    },
    ls() { return `<span class="term-cosmic">about/  skills/  projects/  experience/  education/  contact/</span> <span class="term-dim">resume.pdf</span>`; },
    pwd() { return `<span class="term-dim">/home/shubham/mission-control</span>`; },
    date() { return `<span class="term-dim">${new Date().toString()}</span>`; },
    echo(args) { return escapeHtml(args.join(' ')); },
    neofetch() {
        const eng = webglActive ? 'WebGL (Three.js)' : '2D Canvas';
        termPrint(`<span class="term-banner">      .:*~*:.        </span>`);
        const info = [['user', 'shubham@mission-control'], ['role', 'Full Stack Developer'], ['stack', 'Java · Spring Boot · React'], ['uptime', 'VIT Bhopal 2023–2027'], ['gpa', '9.32 / 10'], ['solved', '700+ DSA problems'], ['certs', 'AWS SAA-C03 · AIF-C01'], ['render', eng], ['theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light']];
        termPrint(`<div class="term-table">${info.map(r => `<span class="tk">${r[0]}</span><span class="term-key">${r[1]}</span>`).join('')}</div>`);
        termPrint(`<span class="term-stellar" style="color:var(--stellar)">●</span><span style="color:var(--cosmic)">●</span><span style="color:var(--nebula)">●</span><span style="color:var(--flare)">●</span>`);
    },
    sudo(args) {
        const sub = args.join(' ').toLowerCase();
        if (sub.includes('hire') || sub.includes('shubham')) { termPrint(`<span class="term-ok">[sudo] access granted ✓</span>`); termPrint(`Excellent choice. 🚀 Reach me at <span class="term-key">theshubhamtripathi06@gmail.com</span> or run <span class="term-flare">resume</span>.`); return; }
        return `<span class="term-err">[sudo] permission denied:</span> nice try, but you're not root here 😉`;
    },
    coffee() { return `<span class="term-flare">     ( (\n      ) )\n   ........\n   |      |]   brewing... ☕ fuel for shipping features.\n   \\      /\n    \`----'</span>`; },
    clear() { termNode('terminal-body').innerHTML = ''; },
    exit() { closeTerminal(); },
    close() { closeTerminal(); }
};
function termRun(raw) {
    const input = raw.trim(); termEcho(raw);
    if (input) { TERM.history.push(input); TERM.histIdx = TERM.history.length; }
    if (!input) return;
    const parts = input.split(/\s+/), cmd = parts[0].toLowerCase(), args = parts.slice(1);
    const fn = TERM_CMDS[cmd];
    if (!fn) { termPrint(`<span class="term-err">command not found:</span> ${escapeHtml(cmd)} — type <span class="term-accent">help</span>`); return; }
    const out = fn(args);
    if (typeof out === 'string') termPrint(out);
}
function openTerminal() {
    const t = termNode('terminal'); t.classList.remove('hidden'); requestAnimationFrame(() => t.classList.add('open'));
    document.body.style.overflow = 'hidden'; TERM.open = true;
    if (!TERM.booted) { termBanner(); TERM.booted = true; }
    setTimeout(() => termNode('terminal-input').focus(), 90);
}
function closeTerminal() {
    const t = termNode('terminal'); t.classList.remove('open'); setTimeout(() => t.classList.add('hidden'), 260);
    TERM.open = false;
    if (document.getElementById('project-modal').classList.contains('hidden') && !cmdk.classList.contains('open')) document.body.style.overflow = '';
}
document.getElementById('terminal-trigger').addEventListener('click', openTerminal);
document.getElementById('terminal-close').addEventListener('click', closeTerminal);
document.getElementById('terminal-backdrop').addEventListener('click', closeTerminal);
document.getElementById('terminal-body').addEventListener('click', (e) => {
    const link = e.target.closest('[data-term-open]'); if (link) window.open(link.dataset.termOpen, '_blank');
});
document.querySelector('.terminal-window').addEventListener('click', (e) => { if (!e.target.closest('a,button,.term-link')) termNode('terminal-input').focus(); });
termNode('terminal-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const v = e.target.value; e.target.value = ''; termRun(v); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (TERM.history.length) { TERM.histIdx = Math.max(0, TERM.histIdx - 1); e.target.value = TERM.history[TERM.histIdx] || ''; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (TERM.history.length) { TERM.histIdx = Math.min(TERM.history.length, TERM.histIdx + 1); e.target.value = TERM.history[TERM.histIdx] || ''; } }
    else if (e.key === 'Tab') {
        e.preventDefault(); const v = e.target.value.toLowerCase().trim();
        const m = Object.keys(TERM_CMDS).filter(k => k.startsWith(v));
        if (m.length === 1) e.target.value = m[0];
        else if (m.length > 1 && v) { termEcho(v); termPrint(`<span class="term-dim">${m.join('   ')}</span>`); }
    }
});

/* ============ ORBITAL TIMELINE PROGRESS FILL ============ */
const orbitalFill = document.getElementById('orbital-fill'), orbitalTimeline = document.querySelector('.orbital-timeline');
function updateOrbital() {
    if (!orbitalTimeline || !orbitalFill) return;
    const r = orbitalTimeline.getBoundingClientRect(), vh = window.innerHeight, total = r.height || 1;
    orbitalFill.style.height = `${(Math.min(Math.max(vh * 0.6 - r.top, 0), total) / total) * 100}%`;
}
window.addEventListener('scroll', updateOrbital, { passive: true });
window.addEventListener('resize', updateOrbital);
updateOrbital();

/* ============ CONTACT FORM ============ */
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('form-submit'), submitText = document.getElementById('submit-text'), submitIcon = document.getElementById('submit-icon');
    btn.classList.add('is-loading'); submitText.textContent = 'Transmitting…'; submitIcon.className = 'fa-solid fa-circle-notch text-xs';
    setTimeout(() => {
        btn.classList.remove('is-loading'); btn.classList.add('is-success'); submitText.textContent = 'Signal Received'; submitIcon.className = 'fa-solid fa-check text-xs';
        showToast('Message sent — I\'ll reply within a day or two.', 'fa-solid fa-paper-plane');
        setTimeout(() => { contactForm.reset(); btn.classList.remove('is-success'); submitText.textContent = 'Transmit Signal'; submitIcon.className = 'fa-solid fa-paper-plane text-xs'; }, 2400);
    }, 1300);
});

/* ============ CLIPBOARD ============ */
function copyToClipboard(text, message) {
    const done = () => showToast(message, 'fa-solid fa-clipboard-check');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy — try manually.', 'fa-solid fa-triangle-exclamation'); }
    document.body.removeChild(ta);
}

/* ============ TOAST ============ */
let toastTimeout;
function showToast(message, iconClass) {
    const toast = document.getElementById('toast'), toastMessage = document.getElementById('toast-message'), toastIcon = document.getElementById('toast-icon');
    toastMessage.textContent = message; if (iconClass) toastIcon.className = iconClass + ' text-stellar';
    toast.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ============ GLOBAL KEYBOARD SHORTCUTS ============ */
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); toggleCmdk(); return; }
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === '`' && !typing && !TERM.open) { e.preventDefault(); openTerminal(); return; }
    if (e.key === 'Escape') {
        if (TERM.open) closeTerminal();
        else if (cmdk.classList.contains('open')) closeCmdk();
        else closeProjectModal();
    }
});
