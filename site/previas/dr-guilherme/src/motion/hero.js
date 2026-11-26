// O hero: uma foto por tratamento. As pílulas de tratamento, o "Anterior / Próximo" e o tempo trocam a foto; a que
// sai perde o foco e a que entra ganha (o estilo está em sections/hero.css). A linha do pé mede o tempo: ela anda
// sem parar e cruza o card inteiro a cada volta completa pelas fotos.
const TEMPO = 3800; // ms de cada foto
const celular = matchMedia('(max-width: 760px)');

// espera a imagem estar pronta para pintar, para a troca não engasgar no meio da animação
function pronta(img) {
  if (img.decode) return img.decode().catch(() => {});
  if (img.complete) return Promise.resolve();
  return new Promise((ok) => {
    img.addEventListener('load', ok, { once: true });
    img.addEventListener('error', ok, { once: true });
  });
}

// troca de texto que muda de alvo: quem pede uma troca no meio de outra só muda o destino, sem recomeçar
function trocar(el, valor, reduzido) {
  if (!el || el.dataset.alvo === valor) return;
  el.dataset.alvo = valor;
  if (reduzido) {
    el.textContent = valor;
    return;
  }
  if (el.classList.contains('is-saindo')) return;
  el.classList.add('is-saindo');
  setTimeout(() => {
    el.textContent = el.dataset.alvo;
    el.classList.remove('is-saindo');
  }, 210);
}

export function hero({ reduzido }) {
  const card = document.querySelector('.hero__card');
  if (!card) return;
  const palco = card.querySelector('.hero__fotos');
  const chips = [...card.querySelectorAll('.chip')];
  const texto = card.querySelector('[data-troca="texto"]');
  const conta = card.querySelector('[data-troca="conta"]');
  const linha = card.querySelector('.hero__progresso');
  const lista = card.querySelector('.tratamentos');
  const total = chips.length;

  const primeira = palco.querySelector('.hero__foto');
  // a pasta das imagens sai do endereço da primeira (o build troca o caminho para relativo)
  const pasta = new URL('.', primeira.currentSrc || primeira.src).href;
  const fotos = [primeira];
  const prontas = [pronta(primeira).then(() => primeira.classList.add('is-pronta'))];

  function carregar(i) {
    if (prontas[i]) return prontas[i];
    const img = new Image();
    img.className = 'hero__foto';
    img.alt = '';
    img.decoding = 'async';
    img.src = `${pasta}${chips[i].dataset.foto}${celular.matches ? '-m' : ''}.webp`;
    // o enquadramento de lado próprio da foto, se a pílula trouxer um (no celular o recorte em pé já centra o assunto)
    if (chips[i].dataset.x) img.style.setProperty('--x', chips[i].dataset.x);
    palco.append(img);
    fotos[i] = img;
    // foto que não chegou não entra: a anterior continua no card
    prontas[i] = pronta(img).then(() => img.classList.toggle('is-pronta', img.naturalWidth > 0));
    return prontas[i];
  }

  let atual = 0;
  let pedido = 0;
  let dedoNaFila = -1e4; // quando o dedo tocou a fila de pílulas pela última vez
  lista.addEventListener('touchstart', () => { dedoNaFila = performance.now(); }, { passive: true });
  lista.addEventListener('touchend', () => { dedoNaFila = performance.now(); }, { passive: true });
  let inicio = performance.now();

  async function ir(i, { foco = false } = {}) {
    i = ((i % total) + total) % total;
    if (i === atual) return;
    const voltou = i < atual && atual === total - 1 && i === 0;
    atual = i;
    inicio = performance.now();
    const meu = ++pedido;

    chips.forEach((c, k) => {
      const ativo = k === i;
      c.classList.toggle('is-ativo', ativo);
      c.setAttribute('aria-pressed', ativo);
    });
    if (foco) chips[i].focus({ preventScroll: true });
    // no celular as pílulas são uma fila que rola de lado: a da vez vem para a vista (só a fila anda, nunca a página),
    // menos quando o dedo acabou de mexer nela
    if (lista.scrollWidth > lista.clientWidth && performance.now() - dedoNaFila > 2500) {
      lista.scrollTo({ left: chips[i].offsetLeft - lista.clientWidth / 2 + chips[i].offsetWidth / 2, behavior: reduzido ? 'auto' : 'smooth' });
    }
    trocar(texto, chips[i].dataset.texto, reduzido);
    trocar(conta, String(i + 1).padStart(2, '0'), reduzido);
    // na volta ao começo a linha recua de uma vez, em vez de saltar
    if (voltou && !reduzido) {
      linha.classList.add('is-voltando');
      setTimeout(() => linha.classList.remove('is-voltando'), 700);
    }

    if (reduzido) linha.style.setProperty('--p', ((i + 1) / total).toFixed(4));

    await carregar(i);
    if (meu !== pedido) return; // pediram outra foto enquanto esta baixava
    if (!fotos[i].classList.contains('is-pronta')) return;
    fotos.forEach((f, k) => f && f.classList.toggle('is-ativa', k === i));
    // a seguinte já fica baixada
    carregar((i + 1) % total);
  }

  chips.forEach((c, k) => c.addEventListener('click', () => ir(k)));
  // os links de tratamento do rodapé sobem até o hero e já mostram a foto daquele tratamento
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-tratamento]');
    if (link) ir(Number(link.dataset.tratamento));
  });
  card.querySelectorAll('[data-passo]').forEach((b) => b.addEventListener('click', () => ir(atual + Number(b.dataset.passo))));
  // setas do teclado andam pelas pílulas
  lista.addEventListener('keydown', (e) => {
    const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (passo) { e.preventDefault(); ir(atual + passo, { foco: true }); }
    if (e.key === 'Home') { e.preventDefault(); ir(0, { foco: true }); }
    if (e.key === 'End') { e.preventDefault(); ir(total - 1, { foco: true }); }
  });

  // o relógio: só corre com o card na tela e a aba à vista. Com movimento reduzido as fotos não trocam sozinhas.
  if (reduzido) {
    linha.style.setProperty('--p', (1 / total).toFixed(4));
  } else {
    let naTela = true;
    let quadro = 0;
    const desenhar = (agora) => {
      quadro = 0;
      if (!naTela || document.hidden) return;
      const t = Math.min(1, (agora - inicio) / TEMPO);
      linha.style.setProperty('--p', ((atual + t) / total).toFixed(4));
      if (t >= 1) ir(atual + 1);
      quadro = requestAnimationFrame(desenhar);
    };
    const acordar = () => {
      if (quadro || !naTela || document.hidden) return;
      inicio = performance.now(); // a foto da vez recomeça o tempo dela
      quadro = requestAnimationFrame(desenhar);
    };
    new IntersectionObserver(([e]) => { naTela = e.isIntersecting; acordar(); }, { threshold: 0.25 }).observe(card);
    document.addEventListener('visibilitychange', acordar);
  }

  // depois da carga, a segunda foto já fica pronta
  const adiantar = () => carregar(1 % total);
  if (document.readyState === 'complete') adiantar();
  else addEventListener('load', adiantar, { once: true });
}
