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
        var list = Array.isArray(data) ? data : (data.events || []);
        if (!Array.isArray(list) || !list.length) return;
        var t = new Date();
        var today = t.getFullYear() + '-' +
          ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
        list = list.filter(function (e) { return e.date >= today && LQAFilter.matchesFilter(e, mode); });
        if (!list.length) return;

        // one card per venue that survives the filter, soonest event first
        var byVenue = {};
        list.forEach(function (e) { (byVenue[e.venue] = byVenue[e.venue] || []).push(e); });
        grid.innerHTML = '';
        Object.keys(byVenue).sort(function (a, b) { return byVenue[a][0].date < byVenue[b][0].date ? -1 : 1; }).forEach(function (v) {
          var evs = byVenue[v];
          var info = VENUES[v] || {};
          var art = document.createElement('article');
          art.className = 'event';
          var h = document.createElement('h3'); h.textContent = v;
          var p = document.createElement('p'); p.textContent = info.blurb || (evs.length + ' upcoming event' + (evs.length === 1 ? '' : 's') + '.');
          var next = document.createElement('p'); next.className = 'event__next';
          next.textContent = 'Next: ' + fmt(evs[0].date) + ' · ' + evs[0].title;
          var a = document.createElement('a');
          a.href = info.url || (LQA + '?f=' + LQA_FILTER); a.target = '_blank'; a.rel = 'noopener';
          a.textContent = info.url ? 'See the schedule →' : 'See what’s on →';
          art.appendChild(h); art.appendChild(p); art.appendChild(next); art.appendChild(a);
          grid.appendChild(art);
        });

        // The list: grouped by day with the calendar's date rail, each event
        // a card tinted with its venue's color and carrying the team crest or
        // venue mark. A week to start (never fewer than six events), and a
        // button widens it to four weeks.
        var horizon = function (days) {
          var d = new Date(t); d.setDate(t.getDate() + days);
          return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        };
        function fmtTime(s) {
          if (!s) return 'All day';
          var hm = String(s).split(':'); var h = Number(hm[0]);
          return (h % 12 || 12) + ':' + hm[1] + ' ' + (h >= 12 ? 'PM' : 'AM');
        }
        function markFor(e) {
          var team = LQAFilter.TEAMS.filter(function (x) { return x.re.test(e.title || ''); })[0];
          return (team && team.logo) || LQAFilter.VENUE_ICON[e.venue] || '';
        }
        function render(days) {
          var shown = list.filter(function (e) { return e.date <= horizon(days); });
          if (shown.length < 6) shown = list.slice(0, 6);
          listEl.innerHTML = '';
          var byDay = {}, order = [];
          shown.forEach(function (e) { if (!byDay[e.date]) { byDay[e.date] = []; order.push(e.date); } byDay[e.date].push(e); });
          order.forEach(function (date) {
            var p = date.split('-');
            var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
            var li = document.createElement('li');
            li.className = 'events-day';
            var rail = document.createElement('div');
            rail.className = 'events-day__rail';
            rail.innerHTML = '<span class="dnum">' + d.getDate() + '</span><span class="dmeta">' +
              d.toLocaleDateString('en-US', { weekday: 'short' }) + ' · ' + d.toLocaleDateString('en-US', { month: 'short' }) + '</span>';
            var cards = document.createElement('div');
            cards.className = 'events-day__cards';
            byDay[date].forEach(function (e) {
              var a = document.createElement('a');
              a.className = 'events-card';
              a.href = e.url || (LQA + '?f=' + LQA_FILTER); a.target = '_blank'; a.rel = 'noopener';
              var color = LQAFilter.VENUE_COLOR[e.venue];
              if (color) a.style.background = 'color-mix(in srgb, ' + color + ' 9%, var(--surface))';
              var tm = document.createElement('span'); tm.className = 'ev-time'; tm.textContent = fmtTime(e.time);
              var body = document.createElement('span'); body.className = 'ev-body';
              var v = document.createElement('span'); v.className = 'ev-venue'; v.textContent = e.venue || '';
              var tt = document.createElement('span'); tt.className = 'ev-title'; tt.textContent = e.title || '';
              body.appendChild(v); body.appendChild(tt);
              a.appendChild(tm); a.appendChild(body);
              var mark = markFor(e);
              if (mark) { var img = document.createElement('img'); img.className = 'ev-mark'; img.src = mark; img.alt = ''; a.appendChild(img); }
              cards.appendChild(a);
            });
            li.appendChild(rail); li.appendChild(cards);
            listEl.appendChild(li);
          });
          return shown.length;
        }
        var shownNow = render(7);
        var more = document.getElementById('events-more');
        if (more) {
          var rest = list.filter(function (e) { return e.date <= horizon(28); }).length - shownNow;
          more.hidden = rest <= 0;
          more.textContent = 'Show the next four weeks (' + rest + ' more)';
          more.addEventListener('click', function () { render(28); more.hidden = true; });
        }
        wrap.hidden = false;
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
