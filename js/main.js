/* ============================================================
   EQAD – Main JavaScript
   AL EQD AL FARID PROJECT MANAGEMENT SERVICES CO.
   ============================================================ */

'use strict';

// ---- State ----
let currentLang = 'en';
let menuOpen    = false;

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
// Contact Form — basic UX feedback
// ============================================================
function handleSubmit(event) {
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

  // ── Replace the two lines below with a real API call (fetch / EmailJS / etc.) ──
  setTimeout(() => {
    btn.textContent  = currentLang === 'en' ? '✓ Message Sent!' : '✓ تم إرسال الرسالة!';
    btn.style.background = '#2d6a4f';

    setTimeout(() => {
      btn.innerHTML        = originalHTML;
      btn.disabled         = false;
      btn.style.background = '';
      form.reset();
      // Re-apply translations in case active language changed while form was submitted
      applyTranslations();
    }, 3000);
  }, 1500);
}
