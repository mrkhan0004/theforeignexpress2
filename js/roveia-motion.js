/* Lightweight interactions: no animation library or third-party JS required. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var processTrack = document.querySelector('.rv-process-track');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (node) { node.classList.add('is-visible'); });
    if (processTrack) processTrack.classList.add('is-visible');
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { root: null, threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach(function (node) { revealObserver.observe(node); });

    if (processTrack) {
      var processObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            processTrack.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      processObserver.observe(processTrack);
    }
  }

  /* The shared header is injected by app.js during DOMContentLoaded, so bind after it exists. */
  function bindMobileMenu() {
    var navigation = document.getElementById('primary-navigation');
    var toggle = document.querySelector('.nav-toggle');
    if (!navigation || !toggle) return;
    navigation.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (navigation.classList.contains('open')) {
          navigation.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.setAttribute('aria-label', 'Open navigation menu');
          toggle.textContent = '☰';
        }
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navigation.classList.contains('open')) {
        navigation.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        toggle.textContent = '☰';
        toggle.focus();
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(bindMobileMenu, 0); }, { once: true });
  } else {
    bindMobileMenu();
  }

  /* Native FAQ details retain keyboard/assistive-tech semantics. */
  var accordions = Array.prototype.slice.call(document.querySelectorAll('.rv-faq-list details'));
  accordions.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      accordions.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });
})();
