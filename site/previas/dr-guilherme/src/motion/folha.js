// A folha de leitura: cada cartão de texto abre o texto dele por cima da página, num <dialog>. O texto fica guardado
// no HTML, escondido ([data-texto]); aqui ele é copiado para a folha. Fecha no X, no Esc, clicando fora ou num link
// de dentro. Com a folha aberta a página de trás não rola.
const SAIDA = 380; // ms da animação de fechar

export function folha({ lenis, reduzido }) {
  const caixa = document.getElementById('folha');
  if (!caixa || !caixa.showModal) return;
  const papel = caixa.querySelector('.folha__papel');
  const destino = caixa.querySelector('[data-folha-texto]');
  let fechando = 0;

  function abrir(nome) {
    const guardado = document.querySelector(`[data-texto="${nome}"]`);
    if (!guardado) return;
    clearTimeout(fechando);
    destino.replaceChildren(...[...guardado.children].map((el) => el.cloneNode(true)));
    caixa.setAttribute('aria-labelledby', destino.querySelector('h2')?.id ?? '');
    lenis?.stop();
    document.documentElement.classList.add('is-travada');
    if (!caixa.open) caixa.showModal();
    papel.scrollTop = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => caixa.classList.add('is-aberta')));
  }

  function fechar({ jaJa = false } = {}) {
    if (!caixa.open) return;
    caixa.classList.remove('is-aberta');
    const fim = () => {
      caixa.close();
      document.documentElement.classList.remove('is-travada');
      lenis?.start();
    };
    clearTimeout(fechando);
    if (jaJa || reduzido) fim();
    else fechando = setTimeout(fim, SAIDA);
  }

  document.addEventListener('click', (e) => {
    const quem = e.target.closest('[data-folha]');
    if (quem) abrir(quem.dataset.folha);
  });
  caixa.querySelector('.folha__fechar').addEventListener('click', () => fechar());
  // clique fora do papel
  caixa.addEventListener('click', (e) => { if (e.target === caixa) fechar(); });
  // Esc: fecha com a animação, não de estalo
  caixa.addEventListener('cancel', (e) => { e.preventDefault(); fechar(); });
  // link de dentro da folha (o botão do fim): fecha na hora e a página rola até a seção
  papel.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) fechar({ jaJa: true }); });
}
