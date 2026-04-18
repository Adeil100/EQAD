/* ============================================================
   EQAD – Main JavaScript
   AL EQD AL FARID PROJECT MANAGEMENT SERVICES CO.
   ============================================================ */

'use strict';

// ---- State ----
let currentLang = 'en';
let menuOpen    = false;
let lastModalTrigger = null;
let testimonialIndex = 0;
let testimonialTimer = null;

// ============================================================
// DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // Attach Intersection Observer to all animated elements
  document.querySelectorAll('.animate-in').forEach(el => scrollObserver.observe(el));

  // Close mobile menu when a nav link is clicked
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => { if (menuOpen) toggleMenu(); });
  });

  // Smooth-scroll override (all anchor links)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 76, behavior: 'smooth' });
    });
  });

  // Enable richer card movement only on larger screens.
  setupCardTilt();

  // Portfolio click-to-preview modal.
  bindPortfolioModal();

  // Animate stat counters when visible.
  setupStatCounters();

  // Interactive testimonials carousel.
  setupTestimonialsCarousel();

  // Modern interaction layer.
  setupModernInteractions();

  // Sync initial scroll state.
  onScroll();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeImageModal();
  });
});

// ============================================================
// Language Toggle
// ============================================================
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  const root      = document.getElementById('html-root');
  const langLabel = document.getElementById('lang-label');
  const ceoEN     = document.getElementById('ceo-text-en');
  const ceoAR     = document.getElementById('ceo-text-ar');

  if (currentLang === 'ar') {
    root.setAttribute('lang', 'ar');
    root.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl');
    langLabel.textContent = 'English';
    ceoEN.classList.add('visually-hidden');
    ceoAR.classList.remove('visually-hidden');
  } else {
    root.setAttribute('lang', 'en');
    root.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl');
    langLabel.textContent = 'عربي';
    ceoEN.classList.remove('visually-hidden');
    ceoAR.classList.add('visually-hidden');
  }

  applyTranslations();
}

/**
 * Update all elements that carry data-en / data-ar attributes.
 */
function applyTranslations() {
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute('data-' + currentLang);
    if (text === null) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else {
      el.innerHTML = text;          // allows <br> tags inside attribute values
    }
  });
}

// ============================================================
// Navbar — scroll effect + active link
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightActiveSection();
  updateScrollProgress();
}

function updateScrollProgress() {
  const progressNode = document.getElementById('scroll-progress');
  if (!progressNode) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight <= 0 ? 0 : (scrollTop / docHeight) * 100;
  progressNode.style.width = Math.max(0, Math.min(100, progress)).toFixed(2) + '%';
}

function highlightActiveSection() {
  const scrollY = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach(section => {
    const link = document.querySelector('.nav-links a[href="#' + section.id + '"]');
    if (!link) return;
    const inView = scrollY >= section.offsetTop &&
                   scrollY <  section.offsetTop + section.offsetHeight;
    link.classList.toggle('active', inView);
  });
}

// ============================================================
// Mobile Menu
// ============================================================
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('nav-links').classList.toggle('open', menuOpen);
  document.getElementById('hamburger').classList.toggle('open', menuOpen);
  // Prevent body scroll while menu is open
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

// ============================================================
// Scroll-in Animations (Intersection Observer)
// ============================================================
const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger each element slightly so groups animate nicely
        setTimeout(() => entry.target.classList.add('visible'), i * 90);
        scrollObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);

// ============================================================
// Portfolio Filter
// ============================================================
function filterPortfolio(btn, category) {
  // Toggle active class on buttons
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show / hide portfolio items
  document.querySelectorAll('.portfolio-item').forEach(item => {
    const match = category === 'all' || item.dataset.category === category;
    item.classList.toggle('hidden', !match);
  });
}

// ============================================================
// Stat counters
// ============================================================
function setupStatCounters() {
  const counters = document.querySelectorAll('.stat-num');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.65 });

  counters.forEach((counter) => countObserver.observe(counter));
}

function animateCounter(node) {
  const raw = node.textContent.trim();
  const target = parseInt(raw.replace(/\D/g, ''), 10);
  const suffix = raw.replace(/[\d]/g, '') || '';

  if (!target) return;

  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.floor(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ============================================================
// Service card tilt
// ============================================================
function setupCardTilt() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 4;
      const rotateY = (x - 0.5) * 5;
      card.style.transform = 'perspective(700px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-5px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ============================================================
// Modern interactions
// ============================================================
function setupModernInteractions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  bindCursorGlow();
  bindHeroParallax();
  bindMagneticButtons();
}

function bindCursorGlow() {
  const cursor = document.getElementById('cursor-glow');
  const canUseCursor = window.matchMedia('(pointer:fine) and (min-width: 901px)').matches;
  if (!cursor || !canUseCursor) return;

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    document.documentElement.style.setProperty('--mx', x + 'px');
    document.documentElement.style.setProperty('--my', y + 'px');

    cursor.style.opacity = '1';
    cursor.style.transform = 'translate(' + (x - 160) + 'px, ' + (y - 160) + 'px)';
  });
}

function bindHeroParallax() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  const hero = document.getElementById('hero');
  if (!hero) return;

  const movingNodes = hero.querySelectorAll('.hero-kpi, .hero-badge');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    movingNodes.forEach((node, idx) => {
      const depth = (idx % 3 + 1) * 3;
      const tx = px * depth * 2;
      const ty = py * depth * 1.6;
      node.style.transform = 'translate3d(' + tx.toFixed(2) + 'px, ' + ty.toFixed(2) + 'px, 0)';
    });
  });

  hero.addEventListener('mouseleave', () => {
    movingNodes.forEach((node) => {
      node.style.transform = '';
    });
  });
}

function bindMagneticButtons() {
  if (window.matchMedia('(max-width: 900px)').matches) return;

  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.08).toFixed(2) + 'px, ' + (y * 0.08).toFixed(2) + 'px)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

// ============================================================
// Testimonials carousel
// ============================================================
function setupTestimonialsCarousel() {
  const slider = document.getElementById('testimonial-slider');
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  const prev = document.getElementById('testimonial-prev');
  const next = document.getElementById('testimonial-next');

  if (!slider || !cards.length || !dots.length || !prev || !next) return;

  function showSlide(index) {
    testimonialIndex = (index + cards.length) % cards.length;
    cards.forEach((card, i) => card.classList.toggle('active', i === testimonialIndex));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === testimonialIndex));
  }

  function restartAutoPlay() {
    if (testimonialTimer) clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => showSlide(testimonialIndex + 1), 5200);
  }

  prev.addEventListener('click', () => {
    showSlide(testimonialIndex - 1);
    restartAutoPlay();
  });

  next.addEventListener('click', () => {
    showSlide(testimonialIndex + 1);
    restartAutoPlay();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(parseInt(dot.dataset.slide, 10));
      restartAutoPlay();
    });
  });

  slider.addEventListener('mouseenter', () => {
    if (testimonialTimer) clearInterval(testimonialTimer);
  });

  slider.addEventListener('mouseleave', restartAutoPlay);

  showSlide(0);
  restartAutoPlay();
}

// ============================================================
// Portfolio image modal
// ============================================================
function bindPortfolioModal() {
  document.querySelectorAll('.portfolio-item').forEach((item) => {
    item.addEventListener('click', () => {
      lastModalTrigger = item;
      const img = item.querySelector('img');
      const title = item.querySelector('h4');
      if (!img) return;
      openImageModal(img.src, img.alt, title ? title.textContent : '');
    });

    item.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      lastModalTrigger = item;
      const img = item.querySelector('img');
      const title = item.querySelector('h4');
      if (!img) return;
      openImageModal(img.src, img.alt, title ? title.textContent : '');
    });
  });
}

function openImageModal(src, alt, caption) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('image-modal-img');
  const modalCaption = document.getElementById('image-modal-caption');
  const closeBtn = modal ? modal.querySelector('.image-modal-close') : null;
  if (!modal || !modalImg || !modalCaption) return;

  modalImg.src = src;
  modalImg.alt = alt || 'Portfolio preview image';
  modalCaption.textContent = caption;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (closeBtn) closeBtn.focus();
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('image-modal-img');
  if (!modal || !modalImg || !modal.classList.contains('open')) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
  if (lastModalTrigger) {
    lastModalTrigger.focus();
    lastModalTrigger = null;
  }
  if (!menuOpen) document.body.style.overflow = '';
}

// ============================================================
// Contact Form — basic UX feedback
// ============================================================
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn  = form.querySelector('[type="submit"]');

  // Validate (browser + manual)
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const originalHTML = btn.innerHTML;
  btn.textContent = currentLang === 'en' ? 'Sending…' : 'جارٍ الإرسال…';
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');

  const formData = new FormData(form);
  const payload = {
    name: String(formData.get('fullName') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    service: String(formData.get('service') || '').trim(),
    message: String(formData.get('message') || '').trim(),
  };

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Request failed');

    btn.textContent = currentLang === 'en' ? '✓ Message Sent!' : '✓ تم إرسال الرسالة!';
    btn.style.background = '#2d6a4f';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.background = '';
      btn.removeAttribute('aria-busy');
      form.reset();
      applyTranslations();
    }, 2500);
  } catch (error) {
    btn.textContent = currentLang === 'en' ? 'Failed to send. Try again.' : 'فشل الإرسال. حاول مرة أخرى.';
    btn.style.background = '#b42318';

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.background = '';
      btn.removeAttribute('aria-busy');
      applyTranslations();
    }, 3200);
  }
}
