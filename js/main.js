/**
 * Bryza Main — Heart button, contact form, global interactions
 */
(function () {
  'use strict';

  /* Descend button — expanding waves */
  const descendBtn = document.getElementById('descendBtn');
  if (descendBtn) {
    descendBtn.addEventListener('click', (e) => {
      const rect = descendBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      descendBtn.classList.add('wave-active');
      setTimeout(() => descendBtn.classList.remove('wave-active'), 800);

      if (window.BryzaOcean) {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            window.BryzaOcean.triggerWave(
              x + (Math.random() - 0.5) * 100,
              y + (Math.random() - 0.5) * 100
            );
          }, i * 200);
        }
      }

      setTimeout(() => {
        document.getElementById('surface')?.scrollIntoView({ behavior: 'smooth' });
      }, 1200);
    });

    descendBtn.addEventListener('mouseenter', (e) => {
      if (window.BryzaOcean) {
        const rect = descendBtn.getBoundingClientRect();
        window.BryzaOcean.triggerWave(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
      }
    });
  }

  /* Contact form */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName');
      const email = document.getElementById('contactEmail');
      const message = document.getElementById('contactMessage');
      let valid = true;

      [name, email, message].forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = '#E8A87C';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#E8A87C';
        valid = false;
      }

      if (valid) {
        const btn = contactForm.querySelector('.contact-submit');
        const originalText = btn.textContent;
        btn.textContent = 'Signal Sent';
        btn.style.borderColor = '#19E3D5';
        btn.style.color = '#19E3D5';
        contactForm.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 3000);
      }
    });
  }

  /* Bioluminescent creature interaction */
  document.querySelectorAll('.biolum-creature').forEach((creature) => {
    creature.addEventListener('click', () => {
      const glow = creature.querySelector('.creature-glow');
      if (glow) {
        glow.style.animation = 'none';
        glow.offsetHeight;
        glow.style.animation = '';
        glow.style.transform = 'scale(1.5)';
        glow.style.transition = 'transform 0.4s';
        setTimeout(() => { glow.style.transform = ''; }, 400);
      }
    });
  });

  /* Archive artifact tilt on hover */
  document.querySelectorAll('.archive-artifact').forEach((artifact) => {
    artifact.addEventListener('mouseenter', () => {
      artifact.style.transform = 'translateY(-12px) rotateX(4deg) scale(1.02)';
    });
    artifact.addEventListener('mouseleave', () => {
      artifact.style.transform = '';
    });
  });

  /* Surface scroll hint — subtle camera sink effect */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const surface = document.querySelector('.section-surface');
        if (surface) {
          const rect = surface.getBoundingClientRect();
          const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
          surface.style.transform = `translateY(${progress * 30}px)`;
          surface.style.opacity = 1 - progress * 0.5;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();
