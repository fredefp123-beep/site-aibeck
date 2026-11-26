// Peças a mais: as abas da recuperação (clique e setas do teclado) e o botão flutuante de WhatsApp, que aparece
// depois que o hero sai da tela.
export function extras() {
  const abas = [...document.querySelectorAll('.recup__aba')];
  const ativa = (aba) => {
    abas.forEach((a) => {
      const sim = a === aba;
      a.classList.toggle('is-ativa', sim);
      a.setAttribute('aria-selected', String(sim));
      a.tabIndex = sim ? 0 : -1;
      const painel = document.getElementById(a.getAttribute('aria-controls'));
      painel.hidden = !sim;
      painel.classList.toggle('is-ativo', sim);
    });
  };
  abas.forEach((a, i) => {
    a.addEventListener('click', () => ativa(a));
    a.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
      ativa(prox);
      prox.focus();
    });
  });

  const zap = document.querySelector('[data-zap]');
  const hero = document.querySelector('.hero');
  if (zap && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => zap.classList.toggle('is-visivel', !e.isIntersecting), { threshold: 0.15 }).observe(hero);
  } else if (zap) zap.classList.add('is-visivel');
}

// Casos: abas por procedimento e a comparação antes/depois (arrastar a linha ou usar as setas no controle).
export function casos() {
  const abas = [...document.querySelectorAll('.casos__aba')];
  const ativa = (aba) => abas.forEach((a) => {
    const sim = a === aba;
    a.classList.toggle('is-ativa', sim);
    a.setAttribute('aria-selected', String(sim));
    a.tabIndex = sim ? 0 : -1;
    const p = document.getElementById(a.getAttribute('aria-controls'));
    p.hidden = !sim;
    p.classList.toggle('is-ativo', sim);
  });
  abas.forEach((a, i) => {
    a.addEventListener('click', () => ativa(a));
    a.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
      ativa(prox);
      prox.focus();
    });
  });
  document.querySelectorAll('[data-comparar]').forEach((c) => {
    const r = c.querySelector('.comparar__controle');
    r.addEventListener('input', () => c.style.setProperty('--pos', r.value + '%'));
  });
}
