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

themeToggleBtn.addEventListener('click', function() {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

const cursor = document.getElementById('custom-cursor');
const cursorBlur = document.getElementById('custom-cursor-blur');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let blurX = 0, blurY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    blurX += (mouseX - blurX) * 0.08;
    blurY += (mouseY - blurY) * 0.08;
    cursorBlur.style.left = `${blurX}px`;
    cursorBlur.style.top = `${blurY}px`;

    requestAnimationFrame(animateCursor);
}
requestAnimationFrame(animateCursor);

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

const canvas = document.getElementById('galaxy-engine');
const ctx = canvas.getContext('2d');

let stars = [];
const numStars = 250;
let galaxyRotation = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initGalaxy();
}

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        const theta = Math.random() * Math.PI * 2;
        const arm = Math.floor(Math.random() * 3);
        const armOffset = (arm * Math.PI * 2) / 3;
        
        this.distance = Math.random() * Math.max(canvas.width, canvas.height) * 0.5;
        this.angle = theta + armOffset + (this.distance * 0.002);
        
        this.size = Math.random() * 1.5 + 0.5;
        
        const colorRand = Math.random();
        if (colorRand < 0.4) {
            this.color = { r: 139, g: 92, b: 246 };
        } else if (colorRand < 0.8) {
            this.color = { r: 236, g: 72, b: 153 };
        } else {
            this.color = { r: 59, g: 130, b: 246 };
        }
        
        this.opacity = Math.random() * 0.4 + 0.2;
    }

    draw(isDark) {
        const x = canvas.width / 2 + Math.cos(this.angle + galaxyRotation) * this.distance;
        const y = canvas.height / 2 + Math.sin(this.angle + galaxyRotation) * this.distance * 0.5;

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        
        const finalOpacity = isDark ? this.opacity : this.opacity * 0.4;
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${finalOpacity})`;
        ctx.fill();
    }
}

function initGalaxy() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

function renderGalaxy() {
    const isDark = document.documentElement.classList.contains('dark');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    galaxyRotation += 0.001;

    for (let i = 0; i < stars.length; i++) {
        stars[i].draw(isDark);
    }

    requestAnimationFrame(renderGalaxy);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(renderGalaxy);

const words = ["iOS Developer", "Full Stack Developer", "Machine Learning Engineer"];
let i = 0;
let timer;

function typingEffect() {
    let word = words[i].split("");
    var loopTyping = function() {
        if (word.length > 0) {
            document.getElementById('typewriter').innerHTML += word.shift();
        } else {
            setTimeout(deletingEffect, 2500);
            return false;
        }
        timer = setTimeout(loopTyping, 90);
    };
    loopTyping();
}

function deletingEffect() {
    let word = words[i].split("");
    var loopDeleting = function() {
        if (word.length > 0) {
            word.pop();
            document.getElementById('typewriter').innerHTML = word.join("");
        } else {
            if (words.length > (i + 1)) {
                i++;
            } else {
                i = 0;
            }
            setTimeout(typingEffect, 600);
            return false;
        }
        timer = setTimeout(loopDeleting, 45);
    };
    loopDeleting();
}

typingEffect();