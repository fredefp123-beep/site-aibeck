// Rolagem macia na roda do mouse (Lenis). No toque a rolagem é a nativa do aparelho, e com movimento reduzido não
// há Lenis nenhum. Os links de âncora (#sobre, #contato...) rolam até a seção em vez de pular.

const desacelera = (t) => 1 - Math.pow(1 - t, 4);
const toque = matchMedia('(hover: none)');

export function criarScroll({ reduzido }) {
  // prevent: dentro da folha de leitura (data-lenis-prevent) a roda rola a folha, não a página
  const lenis = null; // versão estática: rolagem nativa do navegador

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const alvo = document.getElementById(link.getAttribute('href').slice(1));
    if (!alvo) return;
    e.preventDefault();
    // no toque quem rola é o próprio aparelho (a rolagem dele cede ao dedo); o Lenis só conduz a roda do mouse
    if (reduzido) alvo.scrollIntoView();
    else alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // o foco do teclado acompanha, sem rolar de novo
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
  });

  return lenis;
}
