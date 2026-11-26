// Entrada "em foco": cada peça marcada com data-foco chega desfocada e assenta quando entra na tela (o estilo está
// em styles/base.css). O atraso de cada uma vem de --i, no próprio HTML. Terminada a entrada, a marca sai da peça:
// ela volta a ter só o estilo dela (o hover, o vidro) e deixa de custar um filtro.
const PASSO = 60; // ms por unidade de --i (o mesmo número do CSS; no hero, 40)
const DURACAO = 850;

function mostra(peca) {
  peca.classList.add('is-visto');
  const atraso = (parseFloat(peca.style.getPropertyValue('--i')) || 0) * PASSO;
  setTimeout(() => {
    peca.removeAttribute('data-foco');
    peca.classList.remove('is-visto');
    peca.style.removeProperty('--i');
    if (!peca.getAttribute('style')) peca.removeAttribute('style');
  }, DURACAO + atraso);
}

export function foco() {
  const pecas = [...document.querySelectorAll('[data-foco]')];
  if (!('IntersectionObserver' in window)) {
    pecas.forEach(mostra);
    return;
  }
  const olho = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        // entrou na tela, ou já ficou para trás (página aberta no meio): aparece
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          mostra(e.target);
          olho.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -7% 0px', threshold: 0.02 },
  );
  // o hero é a abertura: entra inteiro, em sequência, sem esperar a rolagem
  pecas.forEach((p) => (p.closest('.hero') ? mostra(p) : olho.observe(p)));
}
