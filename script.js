(function () {
  // Nav background once the page is scrolled
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 30); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Lightbox
  var shots = Array.prototype.slice.call(document.querySelectorAll('.shot'));
  if (!shots.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close">&#10005;</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous photo">&#8592;</button>' +
    '<img alt="">' +
    '<button class="lb-btn lb-next" aria-label="Next photo">&#8594;</button>' +
    '<div class="lb-count"></div>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var count = box.querySelector('.lb-count');
  var current = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function show(i) {
    current = (i + shots.length) % shots.length;
    var src = shots[current].querySelector('img');
    img.classList.add('swap');
    setTimeout(function () {
      img.src = src.currentSrc || src.src;
      img.alt = src.alt;
      img.classList.remove('swap');
    }, 120);
    count.textContent = pad(current + 1) + ' / ' + pad(shots.length);
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add('open');
    document.body.classList.add('locked');
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (s, i) { s.addEventListener('click', function () { open(i); }); });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe
  var startX = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
