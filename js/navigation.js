/**
 * Bryza Shell Navigation
 * Circular ocean region navigation
 */
(function () {
  'use strict';

  const trigger = document.getElementById('shellTrigger');
  const nav = document.getElementById('oceanNav');
  const closeBtn = document.getElementById('navClose');
  const navItems = nav?.querySelectorAll('.ocean-nav__item');

  if (!trigger || !nav) return;

  function openNav() {
    nav.hidden = false;
    nav.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeNav() {
    nav.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (nav.getAttribute('aria-hidden') === 'true') {
        nav.hidden = true;
      }
    }, 500);
    trigger.focus();
  }

  trigger.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);

  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      closeNav();
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-hidden') === 'false') {
      closeNav();
    }
  });

  nav.addEventListener('click', (e) => {
    if (e.target === nav) closeNav();
  });
})();
