/* AIBeck — vitrine 3D com modelos baseados em projetos entregues (prints + versão navegável em portfolio/). */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const segments=[
 {key:'advocacia',name:'Advocacia',tagline:'Escritório com vídeo cinematográfico e leitura editorial',slug:'advocacia'},
 {key:'coral',name:'Teatro musical',tagline:'Companhia artística com espetáculos, escola e contratação',slug:'coral'},
 {key:'clinicas',name:'Consultoria odontológica',tagline:'Métodos, simulador de resultados e depoimentos',slug:'clinicas'},
 {key:'paroquia',name:'Paróquia & comunidade',tagline:'Horários, sacramentos, pastorais e contato',slug:'paroquia'}
];
let active=0,details=false;
const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const url=s=>`portfolio/${s.slug}/`;
function browser(s,kind){
 if(kind==='modal')return `<div class="ab8-browser ab8-real" data-ab8-preview-kind="modal"><div class="ab8-browser-top"><span class="ab8-dots"><i></i><i></i><i></i></span><span>MODELO AIBECK · VERSÃO NAVEGÁVEL</span><a href="${url(s)}" target="_blank" rel="noopener">Abrir em nova aba ↗</a></div><iframe class="ab8-real-frame" src="${url(s)}" title="${safe(s.name)} — versão demonstrativa navegável" loading="lazy"></iframe></div>`;
 return `<div class="ab8-browser ab8-real" data-ab8-preview-kind="${kind}"><div class="ab8-browser-top"><span class="ab8-dots"><i></i><i></i><i></i></span><span>MODELO AIBECK · VERSÃO DEMONSTRATIVA</span><span>↗</span></div><button type="button" class="ab8-real-shot" data-ab8-open aria-label="Navegar no site de ${safe(s.name)}"><img src="portfolio/prints/${s.slug}-desktop.webp" alt="Site de ${safe(s.name)} na versão para computador" loading="lazy" decoding="async"><span class="ab8-real-hint">Clique para navegar ↗</span></button></div>`;}
function phone(s){return `<div class="ab8-mobile-frame"><div class="ab8-mobile-top"></div><div class="ab8-mobile-content ab8-real-phone"><img src="portfolio/prints/${s.slug}-mobile.webp" alt="Site de ${safe(s.name)} na versão para celular" loading="lazy" decoding="async"></div></div>`;}
function draw(){
 const s=segments[active];
 $$('[data-ab8-render]').forEach(m=>{const kind=m.dataset.ab8Render;m.innerHTML=kind==='phone'?phone(s):browser(s,kind)});
 $$('[data-ab8-select]').forEach(btn=>{const on=Number(btn.dataset.ab8Select)===active;btn.classList.toggle('is-active',on);btn.setAttribute('aria-selected',String(on));btn.setAttribute('aria-pressed',String(on))});
 const current=$('#ab8-current'),t=$('#ab8-active-title'),sub=$('#ab8-active-subtitle');
 if(current)current.textContent=`${pad(active+1)} / ${pad(segments.length)}`;if(t)t.textContent=s.name;if(sub)sub.textContent=s.tagline;
}
function choose(i){active=(i+segments.length)%segments.length;details=false;draw()}
document.addEventListener('click',e=>{
 const selector=e.target.closest('[data-ab8-select]');if(selector){choose(Number(selector.dataset.ab8Select));return}
 if(e.target.closest('[data-ab8-open]')){openModal();return}
});
$('#ab8-prev')?.addEventListener('click',()=>choose(active-1));$('#ab8-next')?.addEventListener('click',()=>choose(active+1));
const modal=$('#ab8-modal');function openModal(){if(!modal)return;if(modal.showModal)modal.showModal();else modal.setAttribute('open','');draw()}$('#ab8-fullscreen')?.addEventListener('click',openModal);
$('#ab8-modal-close')?.addEventListener('click',()=>modal?.close?modal.close():modal?.removeAttribute('open'));
modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});
$('.ab8-selector')?.addEventListener('keydown',e=>{if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;e.preventDefault();choose(active+(e.key==='ArrowDown'?1:-1));$(`[data-ab8-select="${active}"]`)?.focus()});
const stage=$('.ab8-stage-perspective');const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf=0;
stage?.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch'||innerWidth<930||raf)return;const {clientX:x,clientY:y}=e;raf=requestAnimationFrame(()=>{raf=0;const r=stage.getBoundingClientRect();const px=(x-r.left)/r.width-.5,py=(y-r.top)/r.height-.5;stage.style.setProperty('--ab8-mx',`${(px+.5)*100}%`);stage.style.setProperty('--ab8-my',`${(py+.5)*100}%`);stage.style.setProperty('--ab8-ry',`${(-7+px*12).toFixed(2)}deg`);stage.style.setProperty('--ab8-rx',`${(4-py*9).toFixed(2)}deg`)})},{passive:true});
stage?.addEventListener('pointerleave',()=>{stage.style.setProperty('--ab8-ry','-8deg');stage.style.setProperty('--ab8-rx','5deg')});
draw();
})();
