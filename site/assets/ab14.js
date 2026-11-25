/* AIBeck V14 — acabamento premium: entradas suaves ao rolar e selos das soluções */
(()=>{
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* selo da solução (como o do AIBeck OS) */
  document.querySelectorAll('[data-ab14-brand]').forEach(sec=>{
    const k=sec.querySelector('.ab5-product-number,.ab5-kicker,.ab-wl-kicker,[class*="kicker"],[class*="eyebrow"]');if(!k||k.nextElementSibling?.classList.contains('ab14-lockup'))return;
    const l=document.createElement('div');l.className='ab14-lockup';l.setAttribute('aria-hidden','true');
    const [a,...rest]=sec.dataset.ab14Brand.split(' ');l.innerHTML=`<span class="ab14-mark"><b></b></span><span>${a} <strong>${rest.join(' ')}</strong></span>`;
    k.insertAdjacentElement('afterend',l);
    const panel=sec.querySelector('.ab5-product-inner,.ab-wl-inner');if(panel)panel.dataset.ab14Num=sec.dataset.ab14Num;
  });
  if(reduced||!('IntersectionObserver' in window))return;
  const sel=['main>section:not(#inicio) h2','.ab14-panel','.ab13-crm-head','#af-onboarding','.ai-mode-panel','#orientador .ref-finder','#simulador .ref-impact-card,#simulador [class*="impact-panel"]','#experiencias .showroom','.ab13-next .os27-solution-close','#fundador .ab6-founder-grid','.ab13-cases-head','#instagram .ab9-social-copy,#instagram [class*="social-copy"]','#contato .container'];
  const els=[...new Set(sel.flatMap(s=>[...document.querySelectorAll(s)]))].filter(e=>!e.closest('#inicio,.ab5-product-demo,.os26-app,#contactDrawer'));
  const vh=innerHeight;
  els.forEach((e,i)=>{const r=e.getBoundingClientRect();if(r.top<vh*.9&&r.bottom>0)return;e.classList.add('ab14-r');});
  document.documentElement.classList.add('ab14-ready');
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-in');io.unobserve(en.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>e.classList.contains('ab14-r')&&io.observe(e));
})();
