// main.js
// Vanilla JS only. Smooth scrolling is handled entirely by CSS
// (scroll-behavior + scroll-margin-top in style.css) and needs no script here.

document.documentElement.classList.add('js');

// ---------- Header scroll state ----------
(function initHeaderScrollState() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var THRESHOLD = 8;
  var ticking = false;

  function applyState() {
    header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(applyState);
      ticking = true;
    }
  }

  applyState();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ---------- Mobile navigation ----------
(function initMobileNav() {
  var toggle = document.getElementById('hamburger');
  var nav = document.getElementById('nav-mobile');
  if (!toggle || !nav) return;

  function isOpen() {
    return !nav.hidden;
  }

  function openNav() {
    nav.hidden = false;
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'メニューを閉じる');
  }

  function closeNav() {
    nav.hidden = true;
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'メニューを開く');
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      closeNav();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      closeNav();
      toggle.focus();
    }
  });

  // close automatically if the viewport grows into the desktop nav breakpoint
  var desktopQuery = window.matchMedia('(min-width: 768px)');
  function handleViewportChange(event) {
    if (event.matches && isOpen()) {
      closeNav();
    }
  }
  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleViewportChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleViewportChange); // older Safari
  }

  closeNav();
})();

// ---------- Contact form (Formspree) ----------
(function initContactForm() {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  var status = form.querySelector('.form-status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
  }

  var submitButton = form.querySelector('button[type="submit"]');
  var defaultButtonLabel = submitButton ? submitButton.textContent : '';

  function setStatus(message, state) {
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (state) {
      status.classList.add(state);
    }
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? '送信中...' : defaultButtonLabel;
  }

  form.addEventListener('submit', function (event) {
    // the browser only dispatches 'submit' once native validation
    // (required / type=email / etc.) has already passed
    event.preventDefault();

    setSubmitting(true);
    setStatus('', null);

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (response.ok) {
          setStatus('お問い合わせありがとうございます。送信が完了しました。', 'is-success');
          form.reset();
        } else {
          setStatus('送信に失敗しました。時間をおいてもう一度お試しください。', 'is-error');
        }
      })
      .catch(function () {
        setStatus('送信に失敗しました。時間をおいてもう一度お試しください。', 'is-error');
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();

// ---------- Scroll reveal ----------
(function initScrollReveal() {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  items.forEach(function (el) {
    observer.observe(el);
  });
})();
