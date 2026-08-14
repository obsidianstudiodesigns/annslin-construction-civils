/* Annslin Construction & Civils — site behaviour.
   No dependencies. Everything degrades to a working page without it. */
(function () {
  'use strict';

  var doc  = document;
  var root = doc.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  root.classList.add('js-ready');
  var yr = doc.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ─────────────────────────── hero video ───────────────────────────
     Sources are injected here rather than sitting in the markup, so a
     phone never downloads the landscape cut (and vice versa).        */
  (function heroVideo () {
    var v = doc.getElementById('heroVideo');
    if (!v) return;

    // Save the data on a phone entirely — the poster carries the section.
    var saveData = navigator.connection && navigator.connection.saveData;
    if (saveData) return;

    var portrait = window.matchMedia('(max-width: 820px)').matches;
    var base = portrait ? v.dataset.mobile : v.dataset.desktop;
    if (portrait) v.poster = base + '-poster.jpg';

    [['video/webm', '.webm'], ['video/mp4', '.mp4']].forEach(function (pair) {
      var s = doc.createElement('source');
      s.type = pair[0];
      s.src  = base + pair[1];
      v.appendChild(s);
    });

    v.preload = 'metadata';
    v.load();

    if (reduced.matches) { v.removeAttribute('autoplay'); v.pause(); return; }

    var play = v.play();
    if (play && play.catch) play.catch(function () { /* autoplay blocked: poster stays */ });

    // Don't burn cycles animating a video nobody can see.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.05 }).observe(v);
    }
  }());

  /* ─────────────────────────── header ─────────────────────────── */
  (function header () {
    var hdr = doc.getElementById('hdr');
    if (!hdr) return;
    var ticking = false;
    function onScroll () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('is-stuck', window.scrollY > 24);
        ticking = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }());

  /* ─────────────────────────── mobile drawer ─────────────────────────── */
  (function drawer () {
    var burger = doc.getElementById('burger');
    var nav    = doc.getElementById('nav');
    var scrim  = doc.getElementById('scrim');
    if (!burger || !nav || !scrim) return;

    var lastFocus = null;

    function open () {
      lastFocus = doc.activeElement;
      nav.classList.add('is-open');
      scrim.hidden = false;
      requestAnimationFrame(function () { scrim.classList.add('is-on'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
      doc.body.classList.add('is-locked');
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
    function close () {
      nav.classList.remove('is-open');
      scrim.classList.remove('is-on');
      setTimeout(function () { if (!nav.classList.contains('is-open')) scrim.hidden = true; }, 350);
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      doc.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
    }
    function isOpen () { return nav.classList.contains('is-open'); }

    burger.addEventListener('click', function () { isOpen() ? close() : open(); });
    scrim.addEventListener('click', close);
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && isOpen()) close(); });

    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = nav.querySelectorAll('a,button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Returning to desktop width must not leave the page locked.
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches && isOpen()) close();
    });
  }());

  /* ─────────────────────────── scroll reveal ─────────────────────────── */
  (function reveal () {
    var items = doc.querySelectorAll('[data-rise]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduced.matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var d = parseInt(e.target.dataset.riseD || '0', 10);
        setTimeout(function () { e.target.classList.add('is-in'); }, d);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }());

  /* ─────────────────────────── stat counters ─────────────────────────── */
  (function counters () {
    var nums = doc.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window) || reduced.matches) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseInt(el.dataset.count, 10), t0 = null;
        function step (ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / 1100, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (n) { io.observe(n); });
  }());

  /* ─────────────────────────── active nav link ───────────────────────────
     The server-rendered markup already carries .is-active for the current
     page. This only covers the case where the URL reaches a page by a path
     the markup could not predict (a trailing "/" or "/index.html").        */
  (function activeLink () {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    if (doc.querySelector('.nav a.is-active')) return;
    var link = doc.querySelector('.nav a[href="' + here + '"]');
    if (link) { link.classList.add('is-active'); link.setAttribute('aria-current', 'page'); }
  }());

  /* ─────────────────────────── gallery filters ─────────────────────────── */
  (function filters () {
    var btns  = doc.querySelectorAll('.filt');
    var tiles = doc.querySelectorAll('.tile');
    if (!btns.length || !tiles.length) return;

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filter;
        btns.forEach(function (o) {
          var on = o === b;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        tiles.forEach(function (t) {
          t.classList.toggle('is-hidden', f !== 'all' && t.dataset.cat !== f);
        });
      });
    });
  }());

  /* ─────────────────────────── lightbox ─────────────────────────── */
  (function lightbox () {
    var lb    = doc.getElementById('lb');
    var img   = doc.getElementById('lbImg');
    var ttl   = doc.getElementById('lbTitle');
    var desc  = doc.getElementById('lbDesc');
    var xBtn  = doc.getElementById('lbClose');
    var prevB = doc.getElementById('lbPrev');
    var nextB = doc.getElementById('lbNext');
    if (!lb || !img) return;

    var btns = Array.prototype.slice.call(doc.querySelectorAll('.tile__btn'));
    var i = 0, lastFocus = null;

    // Only step through what the active filter is actually showing.
    function visible () {
      return btns.filter(function (b) { return !b.closest('.tile').classList.contains('is-hidden'); });
    }
    function show (btn) {
      img.src = btn.dataset.full;
      img.alt = btn.querySelector('img').alt;
      ttl.textContent  = btn.dataset.title || '';
      desc.textContent = btn.dataset.desc || '';
    }
    function open (btn) {
      var list = visible();
      i = list.indexOf(btn);
      lastFocus = doc.activeElement;
      show(btn);
      lb.hidden = false;
      doc.body.classList.add('is-locked');
      xBtn.focus();
    }
    function close () {
      lb.hidden = true;
      img.removeAttribute('src');   // not src='' — that re-requests the page URL
      doc.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
    }
    function step (d) {
      var list = visible();
      if (!list.length) return;
      i = (i + d + list.length) % list.length;
      show(list[i]);
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { open(b); });
    });
    xBtn.addEventListener('click', close);
    prevB.addEventListener('click', function () { step(-1); });
    nextB.addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb__fig')) close();
    });

    doc.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape')     { close(); }
      else if (e.key === 'ArrowLeft')  { step(-1); }
      else if (e.key === 'ArrowRight') { step(1); }
      else if (e.key === 'Tab') {
        var f = [xBtn, prevB, nextB];
        var idx = f.indexOf(doc.activeElement);
        e.preventDefault();
        f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // swipe on touch
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }());

  /* ─────────────────────────── quote form ───────────────────────────
     No backend: validate here, then hand off to WhatsApp pre-filled.  */
  (function quoteForm () {
    var form = doc.getElementById('quoteForm');
    if (!form) return;
    var okMsg = doc.getElementById('quoteOk');
    var WA = '27696447576';

    var rules = {
      qName:  function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
      qPhone: function (v) {
        var d = v.replace(/[^\d]/g, '');
        return (d.length >= 9 && d.length <= 15) || 'Please enter a valid phone number.';
      },
      qEmail: function (v) {
        if (!v.trim()) return true;                       // optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please check the email address.';
      },
      qType:  function (v) { return !!v || 'Please choose a project type.'; },
      qMsg:   function (v) { return v.trim().length >= 10 || 'A sentence or two is enough.'; }
    };

    function check (id) {
      var el = doc.getElementById(id);
      var res = rules[id](el.value);
      var wrap = el.closest('.f');
      var err = form.querySelector('.err[data-for="' + id + '"]');
      var bad = res !== true;
      wrap.classList.toggle('is-bad', bad);
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (err) err.textContent = bad ? res : '';
      return !bad;
    }

    Object.keys(rules).forEach(function (id) {
      var el = doc.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () { check(id); });
      el.addEventListener('input', function () {
        if (el.closest('.f').classList.contains('is-bad')) check(id);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ids = Object.keys(rules);
      var bad = ids.filter(function (id) { return !check(id); });
      if (bad.length) {
        var first = doc.getElementById(bad[0]);
        first.focus();
        first.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'auto' : 'smooth' });
        return;
      }

      var g = function (id) { return doc.getElementById(id).value.trim(); };
      var lines = [
        'New enquiry from the Annslin website',
        '',
        'Name: ' + g('qName'),
        'Phone: ' + g('qPhone')
      ];
      if (g('qEmail')) lines.push('Email: ' + g('qEmail'));
      lines.push('Project type: ' + g('qType'), '', g('qMsg'));

      if (okMsg) okMsg.hidden = false;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')),
                  '_blank', 'noopener');
    });
  }());

  /* ─────────────── anchor scrolling that clears the fixed header ─────────────── */
  (function anchors () {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = doc.querySelector(id);
      if (!target) return;

      e.preventDefault();
      var hdr = doc.getElementById('hdr');
      var off = (hdr ? hdr.offsetHeight : 0) + 12;
      var y = target.getBoundingClientRect().top + window.pageYOffset - off;
      window.scrollTo({ top: y, behavior: reduced.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  }());

}());
