// A frase que se lê sozinha: o texto nasce apagado e uma varredura passa por cada linha, da esquerda para a direita,
// deixando a tinta. Vale para todo elemento com data-varredura. As linhas são medidas na tela (a quebra muda com a
// largura), cada uma vira um bloco com um degradê recortado nas letras, e --p (0 a 118) diz onde a varredura está.
// A leitura corre por tempo quando a frase entra na tela; não fica presa à rolagem.
const POR_LINHA = 900; // ms que a varredura leva numa linha
const ENTRE_LINHAS = 150; // ms de atraso de uma linha para a seguinte
const FIM = 118; // valor de --p com a linha inteira lida (passa de 100 por causa da ponta do degradê)
const vaiVolta = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function preparar(el, { reduzido }) {
  const texto = el.textContent.trim().replace(/\s+/g, ' ');
  el.setAttribute('aria-label', texto);
  let linhas = [];
  let inicio = 0; // 0 = ainda não leu; Infinity = já leu
  let quadro = 0;

  function montar() {
    // 1) palavra por palavra, para descobrir onde a linha quebra nesta largura
    el.textContent = '';
    const palavras = texto.split(' ').map((p) => {
      const s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = p;
      return s;
    });
    palavras.forEach((s, i) => el.append(s, i < palavras.length - 1 ? ' ' : ''));
    const grupos = [];
    let topo = null;
    for (const s of palavras) {
      if (topo === null || Math.abs(s.offsetTop - topo) > 4) {
        grupos.push([]);
        topo = s.offsetTop;
      }
      grupos.at(-1).push(s.textContent);
    }
    // 2) uma caixa por linha
    el.textContent = '';
    linhas = grupos.map((g) => {
      const l = document.createElement('span');
      l.className = 'varre';
      l.setAttribute('aria-hidden', 'true');
      l.textContent = g.join(' ');
      el.append(l);
      return l;
    });
    el.classList.add('is-montada');
    pintar(performance.now());
  }

  function pintar(agora) {
    let acabou = true;
    linhas.forEach((l, k) => {
      let t = 0;
      if (inicio === Infinity) t = 1;
      else if (inicio) t = Math.min(1, Math.max(0, (agora - inicio - k * ENTRE_LINHAS) / POR_LINHA));
      if (t < 1) acabou = false;
      l.style.setProperty('--p', (vaiVolta(t) * FIM).toFixed(2));
    });
    return acabou;
  }

  function ler() {
    if (inicio) return;
    if (reduzido) {
      inicio = Infinity;
      pintar(0);
      el.dispatchEvent(new CustomEvent('lida', { bubbles: true }));
      return;
    }
    inicio = performance.now();
    // avisa quando a última linha começa a ser lida (a assinatura do "Sobre" entra junto com ela)
    setTimeout(() => el.dispatchEvent(new CustomEvent('lida', { bubbles: true })), (linhas.length - 1) * ENTRE_LINHAS + POR_LINHA * 0.45);
    const passo = (agora) => {
      if (pintar(agora)) {
        inicio = Infinity;
        return;
      }
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
  }

  montar();
  // quem troca a frase de lugar (os depoimentos) apaga e manda ler de novo
  el.varre = {
    ler,
    zerar() {
      cancelAnimationFrame(quadro);
      inicio = 0;
      pintar(0);
    },
  };

  // a largura mudou: as linhas quebram em outro lugar
  let largura = el.clientWidth;
  let espera;
  addEventListener('resize', () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (el.clientWidth === largura) return;
      largura = el.clientWidth;
      montar();
    }, 160);
  });

  const olho = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
      olho.disconnect();
      if (el.closest('[data-fala]:not(.is-atual)')) return; // fala guardada: lê quando for a vez dela
      // a frase ainda está saindo do desfoque: a leitura começa um instante depois
      setTimeout(ler, e.isIntersecting && !reduzido ? 320 : 0);
    },
    { rootMargin: '0px 0px -16% 0px', threshold: 0.2 },
  );
  olho.observe(el);
  return () => cancelAnimationFrame(quadro);
}

export function varredura(opcoes) {
  document.querySelectorAll('[data-varredura]').forEach((el) => preparar(el, opcoes));
}
