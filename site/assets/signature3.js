// Signature 3 — hooks into original live demonstrations, never replaces their state.
(()=>{
  'use strict';
  const q=s=>document.querySelector(s);
  const valid=['Agentes de IA','CRM & BI','Sites premium','Plataformas e sistemas','White-label'];
  document.querySelectorAll('[data-ab-product]').forEach(a=>a.addEventListener('click',()=>{
    const chosen=a.getAttribute('data-ab-product');
    const select=q('#briefProduct');
    if(select && valid.includes(chosen))select.value=chosen;
    const source=q('#masterLeadSource'); if(source) source.value='signature3_'+chosen.toLowerCase().replace(/[^a-z0-9]+/g,'_');
    window.aiTrack?.('solution_lead',{solution:chosen});
  }));
  // Click the actual, existing showroom tab, retaining its animations and logic.
  document.querySelectorAll('[data-ab-scene]').forEach(a=>a.addEventListener('click',()=>{
    const scene=a.getAttribute('data-ab-scene');
    requestAnimationFrame(()=>{
      q(`.showroom-list [data-scene="${scene}"]`)?.click();
      q('#experiencias')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
    window.aiTrack?.('solution_demo',{scene});
  }));
  // Use the existing interactive operating-system view.
  document.querySelectorAll('[data-ab-module]').forEach(a=>a.addEventListener('click',()=>{
    const key=a.getAttribute('data-ab-module');
    requestAnimationFrame(()=>q(`[data-os-tab="${key}"]`)?.click());
    window.aiTrack?.('solution_demo',{module:key});
  }));
  // On phones, do not cover the four animated scene controls in the hero.
  if('IntersectionObserver' in window){
    document.body.classList.add('ab-at-hero');
    const hero=q('#inicio');
    if(hero){new IntersectionObserver(entries=>{
      document.body.classList.toggle('ab-at-hero',entries[0].isIntersecting);
    },{threshold:0}).observe(hero)}
  }
  // Keep floating contact clear of small-screen demo controls and interactive cards.
  if('IntersectionObserver' in window && matchMedia('(max-width: 700px)').matches){
    const interacting=new Set();
    document.body.classList.add('ab-in-demo');
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting)interacting.add(e.target.id);else interacting.delete(e.target.id)});
      document.body.classList.toggle('ab-in-demo',interacting.size>0);
    },{threshold:.02});
    document.querySelectorAll('#inicio,#orientador,#solucoes,#simulador,#experiencias,#white-label,#tour,#diagnostico,#case-lab,#entrega').forEach(el=>obs.observe(el));
  }
  // Accessibility: floating WhatsApp CTA is not overlaid onto contact modal.
  const whatsapp=q('.ab-whatsapp');
  const observer=new MutationObserver(()=>{if(whatsapp)whatsapp.hidden=!!q('#contactDrawer.open') || !!q('.ab-case-overlay:not([hidden])')});
  if(q('#contactDrawer'))observer.observe(q('#contactDrawer'),{attributes:true,attributeFilter:['class']});
  if(q('#ab-case-overlay'))observer.observe(q('#ab-case-overlay'),{attributes:true,attributeFilter:['hidden']});
})();

// White Label Studio — self-contained demo, no saved data or network calls.
(()=>{
  'use strict';
  const studio=document.querySelector('.ab-wl-studio');
  if(!studio)return;
  const name=document.getElementById('ab-wl-name');
  const labels=studio.querySelectorAll('[data-ab-wl-name]');
  const tabs=[...studio.querySelectorAll('[data-ab-wl-tab]')];
  const panels=[...studio.querySelectorAll('[data-ab-wl-panel]')];
  const colors=[...studio.querySelectorAll('[data-ab-wl-color]')];
  const selectTab=key=>{
    tabs.forEach(b=>{const selected=b.dataset.abWlTab===key;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected))});
    panels.forEach(p=>{p.hidden=p.dataset.abWlPanel!==key});
  };
  const selectColor=button=>{
    const color=button.dataset.abWlColor;
    if(!/^#[0-9a-fA-F]{6}$/.test(color))return;
    studio.style.setProperty('--ab-wl-accent',color);
    colors.forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active))});
  };
  name?.addEventListener('input',()=>{const value=name.value.trim().slice(0,28)||'Sua Marca';labels.forEach(x=>{x.textContent=value})});
  tabs.forEach(b=>b.addEventListener('click',()=>selectTab(b.dataset.abWlTab)));
  colors.forEach(b=>b.addEventListener('click',()=>selectColor(b)));
  document.getElementById('ab-wl-reset')?.addEventListener('click',()=>{
    name.value='Minha Empresa';labels.forEach(x=>{x.textContent='Minha Empresa'});selectColor(colors[0]);selectTab('pipeline');
  });
})();
