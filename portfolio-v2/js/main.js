/* Альбом работ: прокрутка страницы внутри листа и прочерчивание размерных линий.
   При prefers-reduced-motion линии стоят сразу, страница не прокручивается. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Длина пути для каждой прочерчиваемой линии
  document.querySelectorAll('.draw').forEach(function (p) {
    try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
  });

  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-drawn'); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.title-view, .stages').forEach(function (el) { io.observe(el); });
  }

  // 2. Сколько прокручивать скриншот страницы внутри рамки
  function measure() {
    document.querySelectorAll('.case-view').forEach(function (view) {
      var page = view.querySelector('.case-page');
      if (!page || !page.complete || !page.naturalHeight) return;
      var frameH = view.clientHeight;
      var pageH = view.clientWidth * page.naturalHeight / page.naturalWidth;
      var shift = Math.max(0, pageH - frameH);
      view.style.setProperty('--shift', (-shift) + 'px');
      view.style.setProperty('--dur', Math.min(14, Math.max(4, shift / 260)).toFixed(1) + 's');
    });
  }
  document.querySelectorAll('.case-page').forEach(function (img) {
    if (img.complete) measure(); else img.addEventListener('load', measure, { once: true });
  });
  // скриншоты грузятся лениво: подгружаем их, когда лист рядом
  if ('IntersectionObserver' in window) {
    var lazy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var img = en.target.querySelector('.case-page'); if (img) img.loading = 'eager'; lazy.unobserve(en.target); }
      });
    }, { rootMargin: '400px' });
    document.querySelectorAll('.case-view').forEach(function (v) { lazy.observe(v); });
  }
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(measure, 150); });
})();
