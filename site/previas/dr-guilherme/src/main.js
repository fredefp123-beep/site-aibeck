// Dra. Lia Prudente. O CSS não entra por aqui: vem em <link> no index.html (importado pelo JS, a página apareceria
// crua por um instante).
window.__siteVivo = true; // avisa a trava do index.html que o JS subiu
import { criarScroll } from './motion/scroll.js';
import { foco } from './motion/foco.js';
import { varredura } from './motion/varredura.js';
import { hero } from './motion/hero.js';
import { barras } from './motion/barras.js';
import { trilho } from './motion/trilho.js';
import { folha } from './motion/folha.js';
import { contato } from './motion/contato.js';
import { barra } from './motion/barra.js';
import { scrollbar } from './motion/scrollbar.js';
import { extras, casos } from './motion/extras.js';

const html = document.documentElement;
const reduzido = html.classList.contains('reduzido');

const lenis = criarScroll({ reduzido });
hero({ reduzido });
barras({ reduzido });
trilho({ reduzido });
folha({ lenis, reduzido });
contato();
barra();
scrollbar({ lenis });
extras();
casos();

// a assinatura se escreve quando a frase acima dela termina de ser lida
document.addEventListener('lida', (e) => {
  e.target.parentElement.querySelector('[data-assina]')?.classList.add('is-assinada');
});

// A página "assenta" quando a letra e a primeira foto chegaram (ou em 1,2 s, o que vier antes). Só então as peças
// ganham transição e começam a entrar: nada pisca na primeira pintura.
const primeira = document.querySelector('.hero__foto');
const chegou = Promise.all([document.fonts.ready, primeira?.decode ? primeira.decode().catch(() => {}) : null]);
Promise.race([chegou, new Promise((ok) => setTimeout(ok, 600))]).then(() => {
  varredura({ reduzido }); // as linhas se medem com a letra certa
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      html.classList.add('assentou');
      foco();
    }),
  );
});
