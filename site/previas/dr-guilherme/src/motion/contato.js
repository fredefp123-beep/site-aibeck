// O pedido de contato: um campo de WhatsApp com máscara ((00) 00000-0000), o aviso quando falta número e a
// confirmação no lugar do campo depois de enviar. Sem servidor: se o <form> tiver um número em data-whatsapp
// (só dígitos, com 55 e DDD), o envio também abre a conversa no WhatsApp com a mensagem pronta.
const soDigitos = (v) => v.replace(/\D/g, '').slice(0, 11);
function formata(d) {
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function contato() {
  const form = document.querySelector('[data-pedido]');
  if (!form) return;
  const campo = form.querySelector('input');
  const aviso = form.querySelector('.pedido__aviso');
  const feito = form.querySelector('.pedido__feito');
  const numero = form.querySelector('[data-pedido-numero]');

  campo.addEventListener('input', () => {
    const d = soDigitos(campo.value);
    campo.value = formata(d);
    form.classList.toggle('is-preenchido', d.length > 0);
    if (form.classList.contains('is-erro')) {
      form.classList.remove('is-erro');
      aviso.textContent = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = soDigitos(campo.value);
    if (d.length < 10) {
      form.classList.remove('is-erro');
      void form.offsetWidth; // a tremida recomeça a cada tentativa
      form.classList.add('is-erro');
      aviso.textContent = d.length ? 'Faltam dígitos: confira o DDD e o número.' : 'Escreva o seu WhatsApp com DDD.';
      campo.focus();
      return;
    }
    const destino = form.dataset.whatsapp;
    if (destino) {
      const texto = `Olá, Dr. Guilherme! Vim pelo site e quero agendar uma avaliação. Meu WhatsApp é ${formata(d)}.`;
      window.open(`https://wa.me/${destino}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
    }
    numero.textContent = formata(d);
    feito.hidden = false;
    form.classList.add('is-enviado');
    feito.querySelector('.pedido__outro').focus({ preventScroll: true });
  });

  form.querySelector('.pedido__outro').addEventListener('click', () => {
    form.classList.remove('is-enviado');
    feito.hidden = true;
    campo.focus();
    campo.select();
  });
}
