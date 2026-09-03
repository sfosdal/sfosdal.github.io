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
    // center the active thumb within the strip WITHOUT scrolling the page
    var active = thumbBtns[current];
    if (active) {
      var wrapRect = thumbWrap.getBoundingClientRect();
      var btnRect = active.getBoundingClientRect();
      var delta = (btnRect.left - wrapRect.left) - (thumbWrap.clientWidth - active.clientWidth) / 2;
      thumbWrap.scrollLeft += delta;
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

  // ---- neighborhood events (from the LQA events feed — fosdal.net/lqa-events/) ----
  // LQA_FILTER is a code built on the calendar page with "Copy Filter Link":
  // this one keeps Climate Pledge Arena, McCaw Hall and Seattle Center. To
  // change what shows here, build a new link there and paste its code.
  // filter.js (loaded in index.html) applies it exactly as the calendar does.
  var LQA = 'https://fosdal.net/lqa-events/';
  var LQA_FILTER = '0000E0';
  var VENUES = {
    'Climate Pledge Arena': { blurb: 'Kraken hockey, Seattle Storm & major concerts.', url: 'https://climatepledgearena.com/events/' },
    'McCaw Hall': { blurb: 'Opera, ballet & the big performances.', url: 'https://www.mccawhall.com/events' },
    'Seattle Center': { blurb: 'Festivals, films & events on the grounds.', url: 'https://www.seattlecenter.com/events/event-calendar' },
    'On the Boards': { blurb: 'Contemporary dance & performance, right on Roy St.', url: 'https://ontheboards.org/events' },
    'The Vera Project': { blurb: 'All-ages shows & workshops on the Center grounds.', url: 'https://theveraproject.org/events/' },
    'SIFF Cinema Uptown': { blurb: 'Films & festival screenings on Queen Anne Ave.', url: 'https://www.siff.net/calendar' },
    'Cornish Playhouse': { blurb: 'Theatre & performance at the Center.', url: 'https://www.seattlecenter.com/events/event-calendar?cats=173' },
    'T-Mobile Park': { blurb: 'Mariners baseball & stadium shows.', url: 'https://www.mlb.com/mariners/ballpark/events' },
    'Lumen Field': { blurb: 'Seahawks, Sounders, Reign & stadium shows.', url: 'https://www.lumenfield.com/events' },
  };
  (function () {
    var wrap = document.getElementById('events-live-wrap');
    var listEl = document.getElementById('events-live');
    var grid = document.getElementById('events-venues');
    if (!wrap || !listEl || !grid || !window.LQAFilter) return;
    var mode = LQAFilter.parseFilterCode(LQA_FILTER) || {};
    function fmt(s) {
      if (!s) return '';
      var p = String(s).split('-');
      if (p.length !== 3) return s;
      var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
      return isNaN(d) ? s : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    fetch(LQA + 'events.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (data) {
        var all = Array.isArray(data) ? data : (data.events || []);
        if (!Array.isArray(all) || !all.length) return;
        var t = new Date();
        var ymd = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
        var months = function (n) { var d = new Date(t); d.setMonth(t.getMonth() + n); return ymd(d); };
        var today = ymd(t), ahead = months(4), behind = months(-2);
        // the list: the next four months, filtered; the cards: every venue
        // with an event from two months back to four months out
        var inFilter = all.filter(function (e) { return LQAFilter.matchesFilter(e, mode); });
        var list = inFilter.filter(function (e) { return e.date >= today && e.date <= ahead; });
        var span = inFilter.filter(function (e) { return e.date >= behind && e.date <= ahead; });
        if (!list.length && !span.length) return;

        var byVenue = {};
        span.forEach(function (e) { (byVenue[e.venue] = byVenue[e.venue] || []).push(e); });
        grid.innerHTML = '';
        var venueNext = function (v) { return byVenue[v].filter(function (e) { return e.date >= today; })[0]; };
        Object.keys(byVenue).sort(function (a, b) {
          var na = venueNext(a), nb = venueNext(b);
          if (na && nb) return na.date < nb.date ? -1 : 1;
          return na ? -1 : nb ? 1 : 0; // venues with something upcoming first
        }).forEach(function (v) {
          var evs = byVenue[v];
          var info = VENUES[v] || {};
          var art = document.createElement('article');
          art.className = 'event';
          var h = document.createElement('h3'); h.textContent = v;
          var p = document.createElement('p'); p.textContent = info.blurb || (evs.length + ' event' + (evs.length === 1 ? '' : 's') + ' this season.');
          var next = document.createElement('p'); next.className = 'event__next';
          var nx = venueNext(v), last = evs[evs.length - 1];
          next.textContent = nx ? 'Next: ' + fmt(nx.date) + ' · ' + nx.title : 'Last: ' + fmt(last.date) + ' · ' + last.title;
          var a = document.createElement('a');
          a.href = info.url || (LQA + '?f=' + LQA_FILTER); a.target = '_blank'; a.rel = 'noopener';
          a.textContent = info.url ? 'See the schedule →' : 'See what’s on →';
          art.appendChild(h); art.appendChild(p); art.appendChild(next); art.appendChild(a);
          grid.appendChild(art);
        });

        // the list, eight to a page, each row carrying the team crest or
        // venue mark from the calendar's shared filter.js
        var PAGE = 8;
        var pages = Math.ceil(list.length / PAGE);
        var pager = document.getElementById('events-pager');
        function markFor(e) {
          var team = LQAFilter.TEAMS.filter(function (x) { return x.re.test(e.title || ''); })[0];
          return (team && team.logo) || (LQAFilter.VENUE_ICON || {})[e.venue] || '';
        }
        function renderPage(page) {
          listEl.innerHTML = '';
          list.slice(page * PAGE, page * PAGE + PAGE).forEach(function (e) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = e.url || '#'; a.target = '_blank'; a.rel = 'noopener';
            var d = document.createElement('span'); d.className = 'ev-date'; d.textContent = fmt(e.date);
            var tt = document.createElement('span'); tt.className = 'ev-title'; tt.textContent = e.title || '';
            var v = document.createElement('span'); v.className = 'ev-venue'; v.textContent = e.venue || '';
            a.appendChild(d); a.appendChild(tt); a.appendChild(v);
            var mark = markFor(e);
            if (mark) { var img = document.createElement('img'); img.className = 'ev-mark'; img.src = mark; img.alt = ''; a.appendChild(img); }
            li.appendChild(a); listEl.appendChild(li);
          });
          if (!pager) return;
          pager.innerHTML = '';
          if (pages < 2) return;
          var btn = function (label, target, cls, aria) {
            var b = document.createElement('button');
            b.type = 'button'; b.textContent = label; if (cls) b.className = cls;
            if (aria) b.setAttribute('aria-label', aria);
            if (target == null) b.disabled = true;
            else b.addEventListener('click', function () { renderPage(target); wrap.scrollIntoView({ block: 'start' }); });
            return b;
          };
          pager.appendChild(btn('‹', page > 0 ? page - 1 : null, 'pg-arrow', 'Earlier events'));
          var last = -1;
          for (var i = 0; i < pages; i++) {
            // first, last, and the current page's neighbors; the rest fold into …
            if (pages > 7 && i !== 0 && i !== pages - 1 && Math.abs(i - page) > 1) continue;
            if (i - last > 1) { var gap = document.createElement('span'); gap.className = 'pg-gap'; gap.textContent = '…'; pager.appendChild(gap); }
            var b = btn(String(i + 1), i === page ? null : i, i === page ? 'pg-cur' : '');
            if (i === page) b.setAttribute('aria-current', 'page');
            pager.appendChild(b);
            last = i;
          }
          pager.appendChild(btn('›', page < pages - 1 ? page + 1 : null, 'pg-arrow', 'Later events'));
        }
        if (list.length) renderPage(0);
        wrap.hidden = !list.length;
      })
      .catch(function () {});
  })();

  // ---- fun menu toggle (narrow screens) ----
  var mt = document.getElementById('menuToggle');
  var mp = document.getElementById('menuPop');
  if (mt && mp) {
    mt.addEventListener('click', function () {
      var open = mp.classList.toggle('open');
      mt.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mp.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mp.classList.remove('open');
        mt.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
