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

(() => {
  const form = document.getElementById('recommender-form');
  const result = document.getElementById('recommender-result');
  if (!form || !result) return;

  const services = {
    web: {
      name: 'Diseño web',
      desc: 'Un sitio o landing clara que lleve a una acción concreta.',
      cta: '<a href="https://calendly.com/fslcoach/30min" target="_blank" rel="noopener">Agendar para hablar de tu sitio →</a>'
    },
    software: {
      name: 'Software a medida',
      desc: 'Una plataforma o herramienta pensada para cómo trabaja tu equipo.',
      cta: '<a href="https://calendly.com/fslcoach/30min" target="_blank" rel="noopener">Agendar para hablar de tu plataforma →</a>'
    },
    data: {
      name: 'Data Analytics',
      desc: 'Tableros y reportes para decidir con datos.',
      cta: '<a href="https://calendly.com/fslcoach/30min" target="_blank" rel="noopener">Agendar para hablar de tus datos →</a>'
    },
    meeting: {
      name: 'Agendemos una reunión',
      desc: 'Tu caso no encaja directo en un servicio, pero hablando lo resolvemos.',
      cta: '<a href="https://calendly.com/fslcoach/30min" target="_blank" rel="noopener">Agendar 30 minutos →</a>'
    }
  };

  const webKeywords = /\b(sitio|web|landing|pagina|página|portfolio|portafolio|tienda|e-?commerce|catalogo|catálogo|vitrina|blog|mostrar|presentar|vender online|venta online|wordpress|diseño web)\b/i;
  const softwareKeywords = /\b(plataforma|app|aplicación|aplicacion|sistema|dashboard|panel|herramienta|automatizar|automatización|crm|erp|integración|integracion|api|login|usuarios|gestión|gestion|intranet|saas|producto digital|mvp)\b/i;
  const dataKeywords = /\b(datos|data|analitica|analítica|analytics|tablero|reporte|bi|power bi|looker|metabase|kpi|métricas|metricas|sql|python|visualización|visualizacion|predicción|prediccion)\b/i;

  function fallbackRecommend(text) {
    const t = text.toLowerCase();
    const webScore = (t.match(webKeywords) || []).length;
    const softwareScore = (t.match(softwareKeywords) || []).length;
    const dataScore = (t.match(dataKeywords) || []).length;
    const max = Math.max(webScore, softwareScore, dataScore);
    if (max === 0) return 'meeting';
    if (webScore === max) return 'web';
    if (softwareScore === max) return 'software';
    return 'data';
  }

  async function aiRecommend(text) {
    const endpoint = window.FSL_AI_ENDPOINT || '/api/recommend';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text })
      });
      if (!res.ok) throw new Error('AI unavailable');
      const data = await res.json();
      if (data.service && services[data.service]) return data.service;
      throw new Error('Invalid response');
    } catch {
      return null;
    }
  }

  function showResult(key) {
    const s = services[key];
    result.querySelector('.result-service').textContent = s.name;
    result.querySelector('.result-reason').textContent = s.desc;
    result.querySelector('.result-cta').innerHTML = s.cta;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = form.querySelector('textarea').value.trim();
    if (!desc) return;

    const recommender = document.getElementById('recommender');
    recommender.classList.add('is-loading');
    result.hidden = true;

    let service = await aiRecommend(desc);
    if (!service) service = fallbackRecommend(desc);

    recommender.classList.remove('is-loading');
    showResult(service);
  });
})();
