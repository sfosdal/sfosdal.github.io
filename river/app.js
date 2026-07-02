// ===== Streamline Tavern =====
(function () {
  var TOTAL = 50;

  // ---- Build gallery ----
  var grid = document.getElementById('galleryGrid');
  var srcs = [];
  for (var i = 1; i <= TOTAL; i++) {
    var n = (i < 10 ? '0' : '') + i;
    srcs.push('images/full/' + n + '.jpg');
    var fig = document.createElement('figure');
    var img = document.createElement('img');
    img.src = 'images/thumb/' + n + '.jpg';
    img.loading = 'lazy';
    img.alt = 'Inside the Streamline Tavern (' + i + ' of ' + TOTAL + ')';
    img.dataset.index = i - 1;
    fig.appendChild(img);
    grid.appendChild(fig);
  }

  // ---- Lightbox ----
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var current = 0;

  function show(idx) {
    current = (idx + TOTAL) % TOTAL;
    lbImg.src = srcs[current];
    lbImg.alt = 'Inside the Streamline Tavern (' + (current + 1) + ' of ' + TOTAL + ')';
  }
  function open(idx) {
    show(idx);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', function (e) {
    var t = e.target;
    if (t.tagName === 'IMG') open(parseInt(t.dataset.index, 10));
  });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
  document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // ---- Nav background on scroll ----
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
