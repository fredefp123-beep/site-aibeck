// Barra de rolagem própria, só no computador (mouse). A nativa fica escondida (styles/base.css) porque ocupa largura:
// com ela, o card do hero e os painéis ficam com a margem da direita maior que a da esquerda, e a página pula de lado
// quando a folha de leitura trava a rolagem. Esta flutua por cima, sem trilho: um fio que aparece ao rolar e some
// com a página parada; engrossa quando o cursor passa e dá para arrastar. No toque a barra é a do aparelho, que já
// flutua sem ocupar largura.
export function scrollbar({ lenis }) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const html = document.documentElement;
  const barra = document.createElement('div');
  barra.className = 'rolagem';
  barra.setAttribute('aria-hidden', 'true');
  barra.innerHTML = '<div class="rolagem__alca"></div>';
  document.body.append(barra);
  const alca = barra.firstChild;

  let espera;
  let h = 0; // altura da alça
  const limite = () => Math.max(0, html.scrollHeight - innerHeight);
  const pos = () => (lenis ? lenis.scroll : scrollY);

  function desenha() {
    const max = limite();
    barra.classList.toggle('is-nada', max < 2);
    if (max < 2) return;
    const trilho = barra.clientHeight;
    h = Math.max(40, trilho * (innerHeight / (max + innerHeight)));
    alca.style.height = `${h}px`;
    alca.style.transform = `translate3d(0, ${(trilho - h) * Math.min(1, Math.max(0, pos() / max))}px, 0)`;
  }
  // aparece enquanto a página rola e some pouco depois de parar
  function acorda() {
    desenha();
    barra.classList.add('is-on');
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (!barra.classList.contains('is-arrasto')) barra.classList.remove('is-on');
    }, 900);
  }

  if (lenis) lenis.on('scroll', acorda);
  else addEventListener('scroll', acorda, { passive: true });
  addEventListener('resize', desenha);
  // a página muda de altura (fontes, fotos): redesenha no quadro seguinte, fora do laço do ResizeObserver (medir
  // dentro dele, com uma foto chegando no mesmo quadro, faz o Safari acusar "ResizeObserver loop" no console)
  let pedido = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(pedido);
    pedido = requestAnimationFrame(desenha);
  }).observe(document.body);
  desenha();

  // arrastar: o caminho do ponteiro vira rolagem na proporção do trilho
  let y0 = 0;
  let s0 = 0;
  alca.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    alca.setPointerCapture(e.pointerId);
    y0 = e.clientY;
    s0 = pos();
    barra.classList.add('is-arrasto', 'is-on');
  });
  alca.addEventListener('pointermove', (e) => {
    if (!barra.classList.contains('is-arrasto')) return;
    const y = s0 + ((e.clientY - y0) / Math.max(1, barra.clientHeight - h)) * limite();
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else scrollTo(0, y);
  });
  const solta = () => {
    barra.classList.remove('is-arrasto');
    acorda();
  };
  alca.addEventListener('pointerup', solta);
  alca.addEventListener('pointercancel', solta);
}
