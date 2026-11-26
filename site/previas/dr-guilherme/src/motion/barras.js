// As barras da agenda: data-barras="60" numa ficha desenha 24 barras e enche 60% delas, de baixo para cima, uma
// depois da outra, quando a ficha entra na tela. O número ao lado conta junto.
const QUANTAS = 24;

export function barras({ reduzido }) {
  document.querySelectorAll('[data-barras]').forEach((ficha) => {
    const pct = Number(ficha.dataset.barras) || 0;
    const trilho = ficha.querySelector('.agenda__barras');
    const numero = ficha.querySelector('.agenda__pct');
    if (!trilho) return;
    const cheias = Math.round((QUANTAS * pct) / 100);
    for (let k = 0; k < QUANTAS; k++) {
      const b = document.createElement('i');
      if (k < cheias) b.className = 'cheia';
      b.style.setProperty('--k', k);
      trilho.append(b);
    }
    if (reduzido) {
      trilho.classList.add('is-cheia');
      return;
    }
    if (numero) numero.textContent = '0';
    new IntersectionObserver(
      ([e], olho) => {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
        olho.disconnect();
        trilho.classList.add('is-cheia');
        if (!numero) return;
        const dura = cheias * 34 + 500;
        const inicio = performance.now();
        const conta = (agora) => {
          const t = Math.min(1, (agora - inicio) / dura);
          numero.textContent = Math.round(pct * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(conta);
        };
        requestAnimationFrame(conta);
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.6 },
    ).observe(trilho);
  });
}
