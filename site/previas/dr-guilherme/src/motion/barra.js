// A barra fixa: aparece quando o hero já saiu da tela e a pessoa rola para cima; some quando rola para baixo e
// sempre que o hero volta. Marca também a seção em que a página está.
export function barra() {
  const el = document.querySelector('[data-barra]');
  const hero = document.querySelector('.hero__card');
  if (!el || !hero) return;

  let antes = scrollY;
  let acumulado = 0; // quanto rolou no mesmo sentido desde a última virada
  let pintando = false;
  const medir = () => {
    pintando = false;
    const y = scrollY;
    const d = y - antes;
    antes = y;
    if (Math.sign(d) !== Math.sign(acumulado)) acumulado = 0;
    acumulado += d;
    const depoisDoHero = hero.getBoundingClientRect().bottom < 40;
    if (!depoisDoHero) el.classList.remove('is-vista');
    else if (acumulado < -24) el.classList.add('is-vista');
    else if (acumulado > 24) el.classList.remove('is-vista');
  };
  addEventListener('scroll', () => { if (!pintando) { pintando = true; requestAnimationFrame(medir); } }, { passive: true });

  // a seção da vez
  const links = [...el.querySelectorAll('.barra__menu a')];
  const secoes = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  if (!secoes.length || !('IntersectionObserver' in window)) return;
  const olho = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.toggleAttribute('aria-current', false));
        links.find((a) => a.getAttribute('href') === `#${e.target.id}`)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  secoes.forEach((s) => olho.observe(s));
}
