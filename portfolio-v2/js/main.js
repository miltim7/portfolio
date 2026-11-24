/* Эффекты страницы. Работают только если:
   - пользователь не включил prefers-reduced-motion;
   - GSAP и ScrollTrigger загрузились с CDN.
   Иначе страница остаётся статичной и полностью читаемой. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('motion-ok');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('fx');

  var mm = gsap.matchMedia();

  /* 1. Параллакс первого экрана: у каждого слоя своя скорость (data-speed = yPercent) */
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    gsap.utils.toArray('.hero .layer').forEach(function (layer) {
      if (getComputedStyle(layer).display === 'none') return; // на телефоне скрытые слои не анимируем
      gsap.to(layer, {
        yPercent: parseFloat(layer.dataset.speed) || 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    /* 2. Плавное появление секции с услугами (один раз) */
    gsap.utils.toArray('#services .reveal').forEach(function (el, i) {
      gsap.from(el, {
        y: 40, autoAlpha: 0, duration: 0.9, delay: i * 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });
  });

  /* 3. «Камера влетает в картинку» */
  mm.add({
    desktop: '(min-width: 601px) and (prefers-reduced-motion: no-preference)',
    phone: '(max-width: 600px) and (prefers-reduced-motion: no-preference)'
  }, function (ctx) {
    var phone = ctx.conditions.phone;
    var startScale = phone ? 0.55 : 0.3;
    var radius = 22 / startScale; // скругление в масштабе карточки ~22px

    gsap.set('.fly-card', { scale: startScale, borderRadius: radius });
    gsap.set('.fly-caption', { autoAlpha: 0, yPercent: 100 });

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.fly', start: 'top top', end: '+=180%',
        pin: true, scrub: 0.6, anticipatePin: 1
      }
    });
    tl.to('.fly-card', { scale: 1, borderRadius: 0, duration: 1 }, 0)
      .to('.fly-left', phone ? { yPercent: -160, autoAlpha: 0, duration: 0.7 } : { xPercent: -140, autoAlpha: 0, duration: 0.7 }, 0)
      .to('.fly-right', phone ? { yPercent: 160, autoAlpha: 0, duration: 0.7 } : { xPercent: 140, autoAlpha: 0, duration: 0.7 }, 0)
      .to('.fly-caption', { autoAlpha: 1, yPercent: 0, duration: 0.3, ease: 'power2.out' }, 1.05)
      .to({}, { duration: 0.25 });
  });

  /* Если пользователь включит reduced motion во время просмотра — перезагружаем в статичный режим */
  reduce.addEventListener && reduce.addEventListener('change', function () { location.reload(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
