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
    nav.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menú';
      })
    );
  }

  // Galerías por proyecto (solo imágenes locales, sin links externos)
  const galleries = {};
  document.querySelectorAll('script.gallery-data').forEach((s) => {
    try { galleries[s.dataset.gallery] = JSON.parse(s.textContent); } catch (e) { /* noop */ }
  });

  const lb = document.querySelector('.lightbox');
  if (!lb || typeof lb.showModal !== 'function') return;
  const img = lb.querySelector('img');
  const cap = lb.querySelector('figcaption');
  let current = [];
  let idx = 0;
  let lastFocus = null;

  const render = () => {
    const item = current[idx];
    if (!item) return;
    img.src = item.src;
    img.alt = item.alt;
    cap.textContent = current.length > 1 ? `${item.alt} — ${idx + 1}/${current.length}` : item.alt;
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
