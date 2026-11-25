/* AIBeck Luxury Tech V8 / Six interactive 3D segment websites. Local mockups, no external services. */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const segments=[
 {key:'fashion',name:'Moda & acessórios',label:'MODA / E-COMMERCE',title:'Vista o que te faz único.',desc:'Uma nova experiência de compra, com curadoria, movimento e detalhes que fazem diferença.',nav:['Coleção','Editorial','Contato'],action:'Explorar coleção ↗',detail:'Coleção em destaque',items:['Seleção especial','Peças atemporais','Atendimento exclusivo'],footer:'DESIGN EDITORIAL / CONCEITO DE SITE',image:'assets/image-a3069b820954fcb.webp',mobile:'Coleção com personalidade.',tagline:'E-commerce editorial e experiência de coleção'},
 {key:'architecture',name:'Arquitetura & imóveis',label:'ARQUITETURA / IMÓVEIS',title:'Espaços que contam histórias.',desc:'Projetos, imóveis e experiências que merecem ser vistos com calma e profundidade.',nav:['Projetos','Imóveis','Contato'],action:'Ver projetos ↗',detail:'Projetos selecionados',items:['Residenciais','Arquitetura autoral','Visitas e contato'],footer:'PORTFÓLIO IMERSIVO / CONCEITO DE SITE',image:'assets/image-b624e7524add86a.webp',mobile:'Viva cada espaço.',tagline:'Portfólio visual e imóveis em destaque'},
 {key:'food',name:'Gastronomia',label:'GASTRONOMIA / DELIVERY',title:'O sabor começa aqui.',desc:'Um cardápio que desperta desejo, facilita a escolha e aproxima cada cliente.',nav:['Cardápio','Experiência','Pedidos'],action:'Abrir cardápio ↗',detail:'Experiências do cardápio',items:['Os mais pedidos','Combos exclusivos','Peça pelo WhatsApp'],footer:'MENU DIGITAL / CONCEITO DE SITE',image:'assets/image-d950457e67a1493.webp',mobile:'Feito para desejar.',tagline:'Cardápio digital sensorial e pedidos'},
 {key:'health',name:'Saúde & estética',label:'SAÚDE / ESTÉTICA',title:'Cuidado em cada detalhe.',desc:'Uma experiência acolhedora para apresentar especialidades e transformar interesse em agendamento.',nav:['Especialidades','Equipe','Agendar'],action:'Conhecer tratamentos ↗',detail:'Seu cuidado começa aqui',items:['Procedimentos','Equipe especializada','Agendamento simples'],footer:'EXPERIÊNCIA DE CONFIANÇA / CONCEITO DE SITE',image:null,mobile:'Uma escolha de cuidado.',tagline:'Autoridade, serviços e agendamento'},
 {key:'tech',name:'Tecnologia & SaaS',label:'TECNOLOGIA / SOFTWARE',title:'Complexo por trás. Simples na frente.',desc:'Uma apresentação clara de produto, com demonstrações, dados e uma experiência preparada para converter.',nav:['Plataforma','Soluções','Demo'],action:'Ver plataforma ↗',detail:'Uma visão do produto',items:['Painel demonstrativo','Módulos integrados','Solicitar demonstração'],footer:'SOFTWARE STORYTELLING / CONCEITO DE SITE',image:null,mobile:'Tecnologia em movimento.',tagline:'Interfaces, produto e demonstração'},
 {key:'industry',name:'Indústria & produtos',label:'INDÚSTRIA / CATÁLOGO',title:'Engenharia que impressiona.',desc:'Soluções técnicas com apresentação moderna, navegação simples e catálogo de produtos.',nav:['Produtos','Aplicações','Contato'],action:'Explorar catálogo ↗',detail:'Linhas e aplicações',items:['Catálogo técnico','Soluções por setor','Orçamento personalizado'],footer:'CATÁLOGO TÉCNICO / CONCEITO DE SITE',image:null,mobile:'Precisão em cada peça.',tagline:'Produtos, especificações e contato B2B'}
];
let active=0,details=false;
const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function art(s){
 if(s.image)return `<img src="${s.image}" alt="Fotografia ilustrativa do segmento ${safe(s.name)}" loading="lazy" decoding="async">`;
 if(s.key==='health')return '<div class="ab8-object ab8-health-object" aria-hidden="true"><div class="orb"></div><div class="glass"></div></div>';
 if(s.key==='tech')return '<div class="ab8-object ab8-tech-object" aria-hidden="true"><div class="ring"></div><div class="core"></div></div>';
 return '<div class="ab8-object ab8-industry-object" aria-hidden="true"><div class="floor"></div><div class="machine"></div></div>';
}
function shell(s){return `<div class="ab8-site theme-${s.key}${details?' is-details':''}"><div class="ab8-site-header"><b>${safe(s.label)}</b><nav>${s.nav.map(n=>`<span>${safe(n)}</span>`).join('')}</nav><button type="button" data-ab8-action="details">${details?'Voltar':'Explorar'} ↗</button></div><div class="ab8-site-main"><div class="ab8-site-copy"><small>${safe(s.label)}</small><h3>${safe(details?s.detail:s.title)}</h3>${details?`<div class="ab8-detail-list">${s.items.map((x,i)=>`<span>${safe(x)} <b>0${i+1} ↗</b></span>`).join('')}</div>`:`<p>${safe(s.desc)}</p>`}<button type="button" data-ab8-action="details">${details?'← Voltar ao início':safe(s.action)}</button></div><div class="ab8-site-art">${art(s)}<span class="ab8-site-art-label">EXPERIÊNCIA VISUAL · 3D</span></div></div><div class="ab8-site-footer"><span>SIMULAÇÃO / SEM MARCA</span><span>${safe(s.footer)}</span></div></div>`}
function browser(s,kind){return `<div class="ab8-browser" data-ab8-preview-kind="${kind}"><div class="ab8-browser-top"><span class="ab8-dots"><i></i><i></i><i></i></span><span>PREVIEW / SITE DEMONSTRATIVO</span><span>↗</span></div>${shell(s)}</div>`;}
function phone(s){return `<div class="ab8-mobile-frame"><div class="ab8-mobile-top"></div><div class="ab8-mobile-content">${s.image?`<img src="${s.image}" alt="" loading="lazy">`:`<div class="ab8-mobile-graphic">${s.key==='health'?'✦':s.key==='tech'?'⌁':'⬡'}</div>`}<div class="ab8-mobile-tint"></div><span>${safe(s.label)}</span><strong>${safe(s.mobile)}</strong></div></div>`;}
function draw(){
 const s=segments[active];
 $$('[data-ab8-render]').forEach(m=>{const kind=m.dataset.ab8Render;m.innerHTML=kind==='phone'?phone(s):browser(s,kind)});
 $$('[data-ab8-select]').forEach(btn=>{const on=Number(btn.dataset.ab8Select)===active;btn.classList.toggle('is-active',on);btn.setAttribute('aria-selected',String(on));btn.setAttribute('aria-pressed',String(on))});
 const current=$('#ab8-current'),t=$('#ab8-active-title'),sub=$('#ab8-active-subtitle');
 if(current)current.textContent=`0${active+1} / 06`;if(t)t.textContent=s.name;if(sub)sub.textContent=s.tagline;
}
function choose(i){active=(i+segments.length)%segments.length;details=false;draw()}
document.addEventListener('click',e=>{
 const selector=e.target.closest('[data-ab8-select]');if(selector){choose(Number(selector.dataset.ab8Select));return}
 if(e.target.closest('[data-ab8-action="details"]')){details=!details;draw();return}
});
$('#ab8-prev')?.addEventListener('click',()=>choose(active-1));$('#ab8-next')?.addEventListener('click',()=>choose(active+1));
const modal=$('#ab8-modal');$('#ab8-fullscreen')?.addEventListener('click',()=>{if(!modal)return;if(modal.showModal)modal.showModal();else modal.setAttribute('open','');draw()});
$('#ab8-modal-close')?.addEventListener('click',()=>modal?.close?modal.close():modal?.removeAttribute('open'));
modal?.addEventListener('click',e=>{if(e.target===modal)modal.close()});
$('.ab8-selector')?.addEventListener('keydown',e=>{if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;e.preventDefault();choose(active+(e.key==='ArrowDown'?1:-1));$(`[data-ab8-select="${active}"]`)?.focus()});
const stage=$('.ab8-stage-perspective');const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf=0;
stage?.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch'||innerWidth<930||raf)return;const {clientX:x,clientY:y}=e;raf=requestAnimationFrame(()=>{raf=0;const r=stage.getBoundingClientRect();const px=(x-r.left)/r.width-.5,py=(y-r.top)/r.height-.5;stage.style.setProperty('--ab8-mx',`${(px+.5)*100}%`);stage.style.setProperty('--ab8-my',`${(py+.5)*100}%`);stage.style.setProperty('--ab8-ry',`${(-7+px*12).toFixed(2)}deg`);stage.style.setProperty('--ab8-rx',`${(4-py*9).toFixed(2)}deg`)})},{passive:true});
stage?.addEventListener('pointerleave',()=>{stage.style.setProperty('--ab8-ry','-8deg');stage.style.setProperty('--ab8-rx','5deg')});
draw();
})();
