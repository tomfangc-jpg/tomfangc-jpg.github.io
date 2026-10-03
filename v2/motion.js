document.documentElement.classList.add('js-ready');

const heroVideo = document.querySelector('.hero-video');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (heroVideo) {
  const syncVideo = (visible = true) => {
    if (reducedMotion.matches || document.hidden || !visible) heroVideo.pause();
    else heroVideo.play().catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => syncVideo(entry.isIntersecting), { threshold: 0.05 }).observe(heroVideo);
  }
  reducedMotion.addEventListener('change', () => syncVideo());
  document.addEventListener('visibilitychange', () => syncVideo());
  syncVideo();
}

const revealTargets = document.querySelectorAll('.result-snapshot, .section-heading, .case-card, .proof-title, .proof-step, .details, .social-card, .about-grid, .footer-cta');
revealTargets.forEach((element) => element.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 70px 0px' });
  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

const filterButtons = document.querySelectorAll('.filter-button');
const caseCards = document.querySelectorAll('.case-row[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = Array.from(caseCards).find((card) => card.dataset.category === button.dataset.filter);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
});

const navLinks = document.querySelectorAll('.nav a[href^="#"]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-18% 0px -62% 0px' });
  document.querySelectorAll('#home, #work, #creator, #about, #contact').forEach((section) => sectionObserver.observe(section));
}


// Small pointer-led 3D sway, disabled for touch and reduced-motion users.
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const tiltTargets = document.querySelectorAll('.case-card, .social-image-grid a, .lead-proof a, .geo-evidence-image, .service-phase-gallery a, .contact-methods a, .button, .social-link, .filter-button');
tiltTargets.forEach((element) => {
  element.classList.add('gentle-tilt');
  let frame = 0;
  let latestPoint;
  const resetTilt = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    element.classList.remove('is-tilting');
    element.style.removeProperty('--tilt-axis');
    element.style.removeProperty('--tilt-angle');
  };
  element.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || !finePointer.matches || document.body.classList.contains('local-editing')) return;
    latestPoint = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (latestPoint.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (latestPoint.y - bounds.top) / bounds.height * 2 - 1));
      const limit = element.matches('.case-card') ? 1.8 : 2.5;
      const angle = Math.hypot(x, y) * limit;
      element.style.setProperty('--tilt-axis', `${-y || .0001} ${x} 0`);
      element.style.setProperty('--tilt-angle', `${angle.toFixed(3)}deg`);
      element.classList.add('is-tilting');
    });
  });
  element.addEventListener('pointerleave', resetTilt);
  element.addEventListener('pointercancel', resetTilt);
  reducedMotion.addEventListener('change', resetTilt);
  finePointer.addEventListener('change', resetTilt);
});

// Highlight the project currently passing through the reading area.
// This is independent of the click-to-filter selection above.
const projectSection = document.querySelector('#work');
if (projectSection && filterButtons.length && caseCards.length) {
  const filterRail = projectSection.querySelector('.case-filters');
  let projectFrame = 0;

  const syncCurrentProject = () => {
    projectFrame = 0;
    const bounds = projectSection.getBoundingClientRect();
    const inView = bounds.bottom > 96 && bounds.top < window.innerHeight * 0.82;
    const visibleCards = Array.from(caseCards).filter((card) => !card.hidden);
    const readingLine = Math.max(130, Math.min(window.innerHeight * 0.38, 360));
    const currentCard = inView && visibleCards.length
      ? visibleCards.find((card) => card.getBoundingClientRect().bottom > readingLine) || visibleCards[visibleCards.length - 1]
      : null;
    const currentCategory = currentCard?.dataset.category;

    filterRail.classList.toggle('has-current', Boolean(currentCategory));
    filterButtons.forEach((button) => {
      const isCurrent = button.dataset.filter === currentCategory;
      button.classList.toggle('is-current', isCurrent);
      if (isCurrent) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  };

  const scheduleCurrentProject = () => {
    if (!projectFrame) projectFrame = window.requestAnimationFrame(syncCurrentProject);
  };

  window.addEventListener('scroll', scheduleCurrentProject, { passive: true });
  window.addEventListener('resize', scheduleCurrentProject);
  filterButtons.forEach((button) => button.addEventListener('click', scheduleCurrentProject));
  scheduleCurrentProject();
}
