document.documentElement.classList.add('js-ready');

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
const caseCards = document.querySelectorAll('.case-card[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    caseCards.forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
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
