(function () {
  // Escopo isolado: tudo referenciado a partir da própria section
  var root = document.getElementById('jogiSobre');
  if (!root) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Reveal on scroll (texto, cartão, vinha) ---------- */
  var revealEls = root.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ---------- 2. Contagem dos números ---------- */
  var statNums = root.querySelectorAll('.stat-num');
  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      statsObserver.unobserve(el);

      if (reduceMotion) {
        el.textContent = target;
        return;
      }

      var start = null;
      var duration = 1100;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  statNums.forEach(function (el) { statsObserver.observe(el); });

  /* ---------- 3. Poeira de luz (partículas) ---------- */
  var particleHost = document.getElementById('jogiParticulas');
  if (particleHost && !reduceMotion) {
    var count = 18;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      p.className = 'particula';
      var size = (Math.random() * 2.2 + 1.5).toFixed(1);
      var left = (Math.random() * 100).toFixed(1);
      var dur = (Math.random() * 10 + 10).toFixed(1);
      var delay = (Math.random() * 14).toFixed(1);
      var drift = (Math.random() * 60 - 30).toFixed(0);
      p.style.setProperty('--s', size + 'px');
      p.style.setProperty('--dur', dur + 's');
      p.style.setProperty('--delay', '-' + delay + 's');
      p.style.setProperty('--drift', drift + 'px');
      p.style.left = left + '%';
      particleHost.appendChild(p);
    }
  }
  
  

  /* ---------- 4. Paralaxe das camadas de solo (mouse + scroll) ---------- */
  if (!reduceMotion) {
    var estratos = root.querySelectorAll('.estrato');
    var targetX = 0, targetY = 0, curX = 0, curY = 0;

    root.addEventListener('mousemove', function (e) {
      var rect = root.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    root.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    function raf() {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;

      var rect = root.getBoundingClientRect();
      var winH = window.innerHeight || document.documentElement.clientHeight;
      var progress = 1 - Math.min(Math.max((rect.top + rect.height / 2) / (winH + rect.height), 0), 1);
      var scrollShift = (progress - 0.5) * 40;

      estratos.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute('data-depth')) || 0.02;
        var mx = curX * 60 * depth * 10;
        var my = curY * 40 * depth * 10 + scrollShift * depth * 8;
        layer.style.transform = 'translate3d(' + mx.toFixed(2) + 'px, ' + my.toFixed(2) + 'px, 0)';
      });

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ---------- 5. Tilt 3D do cartão ---------- */
  var card = document.getElementById('sobreRight');
  if (card && !reduceMotion) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }
})();