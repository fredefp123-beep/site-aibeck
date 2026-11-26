// A fila de cartões: rola de lado como qualquer rolagem (trackpad, dedo, setas do teclado com o foco nela). Aqui
// entram só os confortos: as duas setas levam ao cartão seguinte ou ao anterior, o mouse arrasta a fila com um
// pouco de embalo ao soltar, e a seta de um lado apaga quando a fila chegou àquela ponta.
export function trilho({ reduzido }) {
  document.querySelectorAll('[data-trilho-fila]').forEach((fila) => {
    const secao = fila.closest('section');
    const [voltar, avancar] = secao.querySelectorAll('[data-trilho]');
    const cartoes = [...fila.children];
    const recuo = () => parseFloat(getComputedStyle(fila).paddingLeft) || 0; // no celular a fila tem recuo por dentro
    const fim = () => fila.scrollWidth - fila.clientWidth;

    // as paradas: cada cartão encostado no começo do conteúdo
    function parada(sentido) {
      const x = fila.scrollLeft;
      const pontos = cartoes.map((c) => Math.min(c.offsetLeft - recuo(), fim()));
      if (sentido > 0) return pontos.find((p) => p > x + 8) ?? fim();
      return [...pontos].reverse().find((p) => p < x - 8) ?? 0;
    }
    const ir = (sentido) => fila.scrollTo({ left: parada(sentido), behavior: reduzido ? 'auto' : 'smooth' });
    voltar?.addEventListener('click', () => ir(-1));
    avancar?.addEventListener('click', () => ir(1));

    let pintando = false;
    const pontas = () => {
      pintando = false;
      if (voltar) voltar.disabled = fila.scrollLeft < 4;
      if (avancar) avancar.disabled = fila.scrollLeft > fim() - 4;
    };
    const pedir = () => { if (!pintando) { pintando = true; requestAnimationFrame(pontas); } };
    fila.addEventListener('scroll', pedir, { passive: true });
    addEventListener('resize', pedir);
    pontas();

    // arrastar com o mouse (no toque a rolagem já é do aparelho)
    let inicioX = 0, inicioRolagem = 0, arrastou = false, preso = false, ultimoX = 0, ultimoT = 0, vel = 0, embalo = 0;
    fila.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(embalo);
      preso = true; arrastou = false; vel = 0;
      inicioX = ultimoX = e.clientX; ultimoT = e.timeStamp; inicioRolagem = fila.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!preso) return;
      const dx = e.clientX - inicioX;
      if (!arrastou && Math.abs(dx) > 5) { arrastou = true; fila.classList.add('is-arrastando'); }
      if (!arrastou) return;
      fila.scrollLeft = inicioRolagem - dx;
      const dt = e.timeStamp - ultimoT;
      if (dt > 0) vel = 0.7 * vel + 0.3 * ((ultimoX - e.clientX) / dt);
      ultimoX = e.clientX; ultimoT = e.timeStamp;
    });
    const soltar = () => {
      if (!preso) return;
      preso = false;
      fila.classList.remove('is-arrastando');
      if (!arrastou || reduzido) return;
      let v = vel * 16; // px por quadro
      const desliza = () => {
        if (Math.abs(v) < 0.4) return;
        fila.scrollLeft += v;
        v *= 0.94;
        embalo = requestAnimationFrame(desliza);
      };
      desliza();
    };
    addEventListener('pointerup', soltar);
    addEventListener('pointercancel', soltar);
    // o clique que fecha um arrasto não conta como clique nos cartões
    fila.addEventListener('click', (e) => { if (arrastou) { e.preventDefault(); e.stopPropagation(); arrastou = false; } }, true);
  });

  // as colunas do cartão de número crescem quando ele entra na tela
  document.querySelectorAll('[data-colunas]').forEach((colunas) => {
    new IntersectionObserver(([e], olho) => {
      if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
      olho.disconnect();
      colunas.classList.add('is-cheia');
    }, { threshold: 0.5 }).observe(colunas);
  });
}
