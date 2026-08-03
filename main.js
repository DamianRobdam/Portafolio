// ── THEME TOGGLE ──
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;
themeBtn.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
  themeBtn.style.transform = 'scale(1.2) rotate(20deg)';
  setTimeout(() => themeBtn.style.transform = '', 300);
});

// ── CURSOR GLOW ──
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

// ── AVATAR FALLBACK ──
function initials() {
  return '<span class="avatar-fallback-initials">RC</span>';
}

// ── SCROLL REVEAL ──
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.bar-anim').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── CONTADORES ANIMADOS ──
function animateCounter(el, end, suffix, duration = 1800) {
  let current = 0;
  const step = end / 60;
  const timer = setInterval(() => {
    current = Math.min(current + step, end);
    el.textContent = Math.floor(current) + suffix;
    if (current >= end) clearInterval(timer);
  }, duration / 60);
}
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounter(document.getElementById('s1'), 150, '+');
    animateCounter(document.getElementById('s2'), 90,  '%');
    animateCounter(document.getElementById('s3'), 12,  '+');
    animateCounter(document.getElementById('s4'), 3,   '+');
    statsObs.disconnect();
  }
}, { threshold: 0.5 });
statsObs.observe(document.querySelector('.stats'));

// ── EFECTO DE ESCRITURA ──
const titlesES = ['QA Engineer', 'Quality Assurance', 'Test Analyst', 'QA Specialist'];
const titlesEN = ['QA Engineer', 'Quality Assurance', 'Test Analyst', 'QA Specialist'];
let titleIdx  = 0, charIdx = 0, isDeleting = false;
const typedEl = document.getElementById('typed-title');
function typeEffect() {
  const lang   = document.documentElement.getAttribute('data-lang') || 'es';
  const titles = lang === 'en' ? titlesEN : titlesES;
  const word   = titles[titleIdx % titles.length];
  if (!isDeleting) {
    charIdx++;
    typedEl.innerHTML = word.slice(0, charIdx) + '<span class="cursor-blink"></span>';
    if (charIdx === word.length) { isDeleting = true; setTimeout(typeEffect, 1800); return; }
  } else {
    charIdx--;
    typedEl.innerHTML = word.slice(0, charIdx) + '<span class="cursor-blink"></span>';
    if (charIdx === 0) { isDeleting = false; titleIdx = (titleIdx + 1) % titles.length; }
  }
  setTimeout(typeEffect, isDeleting ? 60 : 100);
}
setTimeout(typeEffect, 1200);

// ── SISTEMA DE IDIOMAS ──
// Prioridad: 1) elección manual guardada, 2) idioma del navegador, 3) español por defecto
function detectLang() {
  const saved = localStorage.getItem('lang');
  if (saved) return saved; // El usuario ya eligió manualmente → respetarlo siempre

  // Leer el idioma del navegador (ej: "en-US", "es-CO", "fr-FR", "pt-BR"...)
  const browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();

  // Si el navegador está en cualquier variante de español → ES
  // Todo lo demás (inglés, portugués, francés, alemán...) → EN como lengua franca
  return browserLang.startsWith('es') ? 'es' : 'en';
}

let currentLang = detectLang();

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'es');

  // Traducir todos los elementos con data-es / data-en
  // ⚠️ Saltamos #qrcode y sus descendientes — contiene la imagen del QR
  document.querySelectorAll('[data-es], [data-en]').forEach(el => {
    if (el.closest('#qrcode')) return; // Proteger el QR
    const text = el.getAttribute('data-' + lang);
    if (text !== null) {
      const hasImportantChildren = el.querySelector('svg, .pulse, .cursor-blink');
      if (hasImportantChildren) {
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = ' ' + text + ' ';
          }
        });
      } else {
        el.textContent = text;
      }
    }
  });

  // Traducir placeholders de formulario
  document.querySelectorAll('[data-es-placeholder], [data-en-placeholder]').forEach(el => {
    const ph = el.getAttribute('data-' + lang + '-placeholder');
    if (ph) el.setAttribute('placeholder', ph);
  });

  // Actualizar el botón de idioma
  const langBtn   = document.getElementById('langBtn');
  const langFlag  = document.getElementById('langFlag');
  const langLabel = document.getElementById('langLabel');
  if (lang === 'en') {
    langFlag.textContent  = '🇨🇴';
    langLabel.textContent = 'ES';
    langBtn.title = 'Cambiar a Español';
  } else {
    langFlag.textContent  = '🇺🇸';
    langLabel.textContent = 'EN';
    langBtn.title = 'Switch to English';
  }

  // Actualizar meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', lang === 'en'
      ? 'Damián Calderón – QA Engineer specializing in software quality assurance. Functional testing, API testing, Postman, Jira. Bogotá, Colombia.'
      : 'Damián Calderón – QA Engineer especialista en aseguramiento de calidad de software. Pruebas funcionales, API testing, Postman, Jira. Bogotá, Colombia.'
    );
  }
}

// Inicializar idioma al cargar — siempre aplica (detectado o guardado)
document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
});

// Botón de idioma
document.getElementById('langBtn').addEventListener('click', () => {
  const next = currentLang === 'es' ? 'en' : 'es';
  applyLang(next);

  // Animación del botón
  const btn = document.getElementById('langBtn');
  btn.style.transform = 'scale(1.15) rotate(5deg)';
  setTimeout(() => btn.style.transform = '', 300);
});

// ── QR CODE & ACCORDION ──
const VCARD_DATA = 'MECARD:N:Calderon Avila,Robinson Damian;TEL:+573123575092;EMAIL:rcalderonavila@gmail.com;URL:https://www.linkedin.com/in/robinson-damian-calderon-avila-6a754516a/;NOTE:QA Engineer;;';
let qrGenerated = false;

function renderQR() {
  const qrEl = document.getElementById('qrcode');
  if (!qrEl) return;
  qrEl.innerHTML = '';

  const encoded = encodeURIComponent(VCARD_DATA);
  const img = document.createElement('img');
  // QR Server: servicio activo y estable, no requiere canvas ni scripts externos
  img.src    = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}&color=0a1628&bgcolor=ffffff&margin=6`;
  img.alt    = 'Código QR para guardar el contacto de Damián Calderón';
  img.width  = 150;
  img.height = 150;
  img.style.display = 'block';
  img.style.borderRadius = '8px';

  // Si la imagen falla en cargar (sin conexión, bloqueo de red, etc.) mostramos aviso claro
  img.onerror = () => {
    qrEl.innerHTML = '<div class="qr-unavailable">QR no disponible.<br>Usa el botón "Guardar contacto".</div>';
  };

  qrEl.appendChild(img);
  qrGenerated = true;
}

function toggleAccordion() {
  const body    = document.getElementById('accordionBody');
  const chevron = document.getElementById('accChevron');
  const btn     = document.getElementById('accordionBtn');
  const isOpen  = body.classList.contains('open');

  if (!isOpen) {
    // Abrir: primero renderizamos el QR, luego medimos la altura real del contenido
    renderQR();
    body.classList.add('open');
    // Usamos la altura real del contenido en vez de un valor fijo adivinado,
    // así nunca se corta sin importar el tamaño de pantalla o cuánto contenido haya.
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    body.style.maxHeight = body.scrollHeight + 'px'; // fija el valor actual antes de animar a 0
    requestAnimationFrame(() => {
      body.style.maxHeight = '0px';
    });
    body.classList.remove('open');
  }

  chevron.classList.toggle('rotated', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
}

// Si la ventana cambia de tamaño (rotar el teléfono) con el acordeón abierto,
// recalculamos la altura para que no quede cortado.
window.addEventListener('resize', () => {
  const body = document.getElementById('accordionBody');
  if (body && body.classList.contains('open')) {
    body.style.maxHeight = body.scrollHeight + 'px';
  }
});

// ── DESCARGAR VCARD ──
function downloadVCard() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'FN:Robinson Damian Calderon Avila',
    'N:Calderon Avila;Robinson Damian;;;',
    'ORG:Soft One Group S.A.S',
    'TITLE:QA Engineer',
    'EMAIL;TYPE=INTERNET:rcalderonavila@gmail.com',
    'TEL;TYPE=CELL:+573123575092',
    'URL:https://www.linkedin.com/in/robinson-damian-calderon-avila-6a754516a/',
    'NOTE:QA Engineer - Bogota, Colombia',
    'END:VCARD'
  ].join('\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'Damian_Calderon_QA.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── BACK TO TOP ──
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('visible', window.scrollY > 400);
});
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── HAMBURGER MENU ──
const hamburger  = document.getElementById('hamburger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  navOverlay.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  navOverlay.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}
// Cerrar el menú al tocar cualquier enlace o el fondo oscuro (antes eran onclick inline,
// bloqueados por la Content-Security-Policy: script-src 'self')
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
navOverlay.addEventListener('click', closeMenu);

// ── ACCORDION Y BOTÓN GUARDAR CONTACTO (antes onclick inline) ──
document.getElementById('accordionBtn').addEventListener('click', toggleAccordion);
document.getElementById('downloadVCardBtn').addEventListener('click', downloadVCard);

// ── FALLBACK DE FOTOS DE PERFIL (antes onerror inline) ──
const heroAvatarImg = document.getElementById('heroAvatarImg');
if (heroAvatarImg) {
  heroAvatarImg.addEventListener('error', function () {
    this.style.display = 'none';
    this.parentElement.innerHTML += initials();
  });
}
const accAvatarImg = document.getElementById('accAvatarImg');
if (accAvatarImg) {
  accAvatarImg.addEventListener('error', function () {
    this.style.display = 'none';
    this.parentElement.innerHTML += '<span>DC</span>';
  });
}

// ── FORMULARIO CONTACTO ──
function handleSubmit(e) {
  e.preventDefault();
  const btn     = document.getElementById('submitBtn');
  const msg     = document.getElementById('formMsg');
  const lang    = currentLang;
  const nombre  = document.getElementById('nombre').value;
  const email   = document.getElementById('email').value;
  const asunto  = document.getElementById('asunto').value;
  const mensaje = document.getElementById('mensaje').value;

  const originalBtnHTML = btn.innerHTML;
  btn.textContent = lang === 'en' ? 'Sending...' : 'Enviando...';
  btn.disabled = true;

  fetch('https://formsubmit.co/ajax/rcalderonavila@gmail.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: nombre,
      email: email,
      _subject: `Portafolio: ${asunto}`,
      message: mensaje
    })
  })
  .then(response => response.json())
  .then(() => {
    msg.style.display    = 'block';
    msg.style.background = 'rgba(48,209,88,0.12)';
    msg.style.color      = '#30d158';
    msg.style.border     = '0.5px solid rgba(48,209,88,0.3)';
    msg.textContent = lang === 'en'
      ? '✅ Message sent! I\'ll reply to you soon.'
      : '✅ ¡Mensaje enviado! Te responderé pronto.';
    btn.textContent       = lang === 'en' ? '✓ Sent' : '✓ Enviado';
    btn.style.background  = '#30d158';
    document.getElementById('contactForm').reset();
  })
  .catch(() => {
    msg.style.display    = 'block';
    msg.style.background = 'rgba(255,69,58,0.12)';
    msg.style.color      = '#ff453a';
    msg.style.border     = '0.5px solid rgba(255,69,58,0.3)';
    msg.textContent = lang === 'en'
      ? '❌ Something went wrong. Please write directly to rcalderonavila@gmail.com'
      : '❌ Algo salió mal. Por favor escríbeme directamente a rcalderonavila@gmail.com';
    btn.innerHTML  = originalBtnHTML;
    btn.disabled   = false;
  });
}

document.getElementById('contactForm').addEventListener('submit', handleSubmit);
