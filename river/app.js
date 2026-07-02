// ===== Streamline Tavern =====
(function () {
  var TOTAL = 50;

  var srcs = [], thumbs = [];
  for (var i = 1; i <= TOTAL; i++) {
    var n = (i < 10 ? '0' : '') + i;
    srcs.push('images/full/' + n + '.jpg');
    thumbs.push('images/thumb/' + n + '.jpg');
  }

  // ---- Element refs ----
  var carImg = document.getElementById('carImg');
  var carNow = document.getElementById('carNow');
  var carTotal = document.getElementById('carTotal');
  var carStage = document.getElementById('carStage');
  var thumbWrap = document.getElementById('carThumbs');
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var current = 0;
  carTotal.textContent = TOTAL;

  // ---- Build thumbnail strip ----
  var thumbBtns = [];
  for (var j = 0; j < TOTAL; j++) {
    (function (idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Photo ' + (idx + 1) + ' of ' + TOTAL);
      var t = document.createElement('img');
      t.src = thumbs[idx];
      t.loading = 'lazy';
      t.alt = '';
      b.appendChild(t);
      b.addEventListener('click', function () { show(idx); });
      thumbWrap.appendChild(b);
      thumbBtns.push(b);
    })(j);
  }

  // ---- Carousel ----
  function show(idx) {
    current = (idx + TOTAL) % TOTAL;
    carImg.src = srcs[current];
    carImg.alt = 'Inside the Streamline Tavern (' + (current + 1) + ' of ' + TOTAL + ')';
    // restart the fade animation
    carImg.style.animation = 'none';
    void carImg.offsetWidth;
    carImg.style.animation = '';
    carNow.textContent = current + 1;
    for (var k = 0; k < thumbBtns.length; k++) {
      thumbBtns[k].classList.toggle('is-active', k === current);
      thumbBtns[k].setAttribute('aria-selected', k === current ? 'true' : 'false');
    }
    if (thumbBtns[current]) {
      thumbBtns[current].scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    if (lb.classList.contains('open')) {
      lbImg.src = srcs[current];
      lbImg.alt = carImg.alt;
    }
  }
  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  document.getElementById('carPrev').addEventListener('click', prev);
  document.getElementById('carNext').addEventListener('click', next);

  // touch swipe on the stage
  var startX = null;
  carStage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  carStage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    startX = null;
  });

  // arrow keys navigate the carousel when it's in view (and lightbox closed)
  function galleryInView() {
    var r = document.getElementById('gallery').getBoundingClientRect();
    return r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
  }

  // ---- Lightbox (full-screen zoom) ----
  function openLb() {
    lbImg.src = srcs[current];
    lbImg.alt = carImg.alt;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    show(current); // keep the carousel synced to where we left off
  }

  carImg.addEventListener('click', openLb);
  document.getElementById('lbClose').addEventListener('click', closeLb);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); next(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    } else if (galleryInView()) {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
  });

  // ---- init ----
  show(0);

  // ---- Nav background on scroll ----
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
