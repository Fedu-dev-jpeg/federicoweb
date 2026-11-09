(() => {
  // Menú mobile
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Cerrar' : 'Menú';
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menú';
      })
    );
  }

  // Galerías: precarga la imagen actual y las de al lado para que el paso sea inmediato
  const galleries = {};
  document.querySelectorAll('script.gallery-data').forEach((s) => {
    try { galleries[s.dataset.gallery] = JSON.parse(s.textContent); } catch (e) { /* noop */ }
  });

  const preloaded = new Map();
  const preload = (src) => {
    if (!src) return Promise.resolve();
    if (preloaded.has(src)) return preloaded.get(src);
    const p = new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.decoding = 'async';
      i.src = src;
    });
    preloaded.set(src, p);
    return p;
  };
  const neighbors = (list, index) => {
    if (!list || !list.length) return;
    preload(list[index] && list[index].src);
    if (list.length < 2) return;
    preload(list[(index + 1) % list.length].src);
    preload(list[(index - 1 + list.length) % list.length].src);
  };

  // Precargar al acercarse al proyecto, no recién al abrir
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const id = en.target.getAttribute('id');
        if (id && galleries[id]) neighbors(galleries[id], 0);
        io.unobserve(en.target);
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('article.project[id]').forEach((el) => io.observe(el));
  }

  const lb = document.querySelector('.lightbox');
  if (!lb || typeof lb.showModal !== 'function') return;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let current = [];
  let idx = 0;
  let lastFocus = null;
  let renderGen = 0;

  const render = () => {
    const item = current[idx];
    if (!item) return;
    const gen = ++renderGen;
    neighbors(current, idx);
    cap.textContent = current.length > 1 ? `${item.alt} — ${idx + 1}/${current.length}` : item.alt;
    const show = () => {
      if (gen !== renderGen) return;
      img.src = item.src;
      img.alt = item.alt;
    };
    const pending = preloaded.get(item.src);
    if (pending) pending.then(show, show);
    else show();
  };
  const open = (gallery, index) => {
    current = galleries[gallery] || [];
    if (!current.length) return;
    idx = index;
    lb.classList.toggle('single', current.length < 2);
    render();
    lastFocus = document.activeElement;
    lb.showModal();
  };
  const step = (d) => { idx = (idx + d + current.length) % current.length; render(); };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery][data-index]');
    if (btn && btn.tagName === 'BUTTON') open(btn.dataset.gallery, Number(btn.dataset.index));
  });
  lb.querySelector('.lb-close').addEventListener('click', () => lb.close());
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  lb.addEventListener('close', () => { img.src = ''; if (lastFocus) lastFocus.focus(); });
})();
