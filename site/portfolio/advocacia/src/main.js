(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const header=$('#header'),bar=$('.scrollline i');let prevY=0,scrollQueued=false;
const dossiers=$$('.dossier'),tabs=$$('.dossier-tabs button'),progress=$('.progress i'),dossierNumber=$('.dossier-prog');
const steps=$$('.step'),contract=$('#contract'),stepCaption=$('#stepCaption'),paperVersion=$('#paperVersion');
const captions=['Compreender o contexto é indispensável antes de avaliar a redação de um documento.','Uma revisão pode esclarecer termos, definir responsabilidades e reduzir ambiguidades.','A versão consolidada representa o texto final desta demonstração visual.'];
function changeDossier(i){i=Math.max(0,Math.min(2,i));dossiers.forEach((el,n)=>{el.classList.toggle('is-active',n===i);el.setAttribute('aria-hidden',String(n!==i))});tabs.forEach((el,n)=>el.classList.toggle('active',n===i));dossierNumber.textContent=`0${i+1} / 03`;progress.style.width=((i+1)/3*100)+'%'}
function changeStep(i){i=Math.max(0,Math.min(2,i));steps.forEach((el,n)=>el.classList.toggle('active',n===i));contract.classList.remove('step-1','step-2');if(i)contract.classList.add('step-'+i);paperVersion.textContent=['LEITURA PRELIMINAR','REVISÃO ILUSTRATIVA','VERSÃO CONSOLIDADA'][i];stepCaption.textContent=captions[i]}
function update(){const y=window.scrollY,doc=document.documentElement,range=doc.scrollHeight-innerHeight;bar.style.height=`${range>0?y/range*100:0}%`;header.classList.toggle('scrolled',y>30);header.classList.toggle('hide',y>220&&y>prevY+4&&!$('#mobileMenu').hidden);if($('#mobileMenu').hidden)header.classList.toggle('hide',y>220&&y>prevY+5);else header.classList.remove('hide');prevY=y;
if(innerWidth>850&&!reduced){const ds=$('.dossier-track'),r=ds.getBoundingClientRect();if(r.top<=0&&r.bottom>=innerHeight){const p=Math.min(1,Math.max(0,-r.top/(r.height-innerHeight)));changeDossier(Math.min(2,Math.floor(p*3)))}else if(r.top>0)changeDossier(0);else if(r.bottom<innerHeight)changeDossier(2);
const ps=$('.process-section'),pr=ps.getBoundingClientRect();if(pr.top<innerHeight*.55&&pr.bottom>innerHeight*.55){const p=Math.max(0,Math.min(1,(innerHeight*.55-pr.top)/(pr.height-innerHeight)));changeStep(Math.min(2,Math.floor(p*3)))}else if(pr.top>0)changeStep(0);else if(pr.bottom<innerHeight*.55)changeStep(2)}scrollQueued=false}
window.addEventListener('scroll',()=>{if(!scrollQueued){requestAnimationFrame(update);scrollQueued=true}},{passive:true});window.addEventListener('resize',update,{passive:true});update();
tabs.forEach((b,i)=>b.addEventListener('click',()=>{const track=$('.dossier-track'),start=track.getBoundingClientRect().top+scrollY;scrollTo({top:start+(track.offsetHeight-innerHeight)*((i+.12)/3),behavior:reduced?'instant':'smooth'})}));
steps.forEach((b,i)=>b.addEventListener('click',()=>{changeStep(i);if(innerWidth>850&&!reduced){const track=$('.process-section'),start=track.getBoundingClientRect().top+scrollY;scrollTo({top:start+(track.offsetHeight-innerHeight)*((i+.18)/3),behavior:'smooth'})}}));
const menu=$('#mobileMenu'),menuButton=$('#menuButton');menuButton.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));menuButton.innerHTML=opening?'FECHAR <span>✕</span>':'MENU <span>☰</span>';document.body.style.overflow=opening?'hidden':''});$$('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.innerHTML='MENU <span>☰</span>';document.body.style.overflow=''}));
if(matchMedia('(pointer:fine)').matches&&!reduced){const hover=$('.hover-photo');const images={business:'./public/img/setor-industria.webp',family:'./public/img/setor-servicos.webp',property:'./public/img/setor-varejo.webp',work:'./public/img/setor-tecnologia.webp'};$$('.topic').forEach(row=>{row.addEventListener('pointerenter',()=>{hover.style.backgroundImage=`url('${images[row.dataset.photo]}')`;hover.classList.add('visible')});row.addEventListener('pointermove',e=>{hover.style.left=e.clientX+'px';hover.style.top=e.clientY+'px'});row.addEventListener('pointerleave',()=>hover.classList.remove('visible'))})}
const form=$('#contactForm');form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const msg=`Olá, gostaria de informações institucionais sobre o atendimento do Arantes & Lima Advogados.\nNome: ${d.get('nome')}\nE-mail: ${d.get('email')}\nAssunto: ${d.get('assunto')}`;const feedback=$('#formFeedback');try{await navigator.clipboard.writeText(msg);feedback.textContent='Mensagem copiada. Para enviá-la, utilize um canal oficial do escritório.'}catch{feedback.textContent='Não foi possível copiar automaticamente. Mensagem preparada abaixo:';let textarea=$('#fallbackText');if(!textarea){textarea=document.createElement('textarea');textarea.id='fallbackText';textarea.readOnly=true;textarea.style.cssText='width:100%;min-height:110px;padding:12px;background:#151515;color:white';feedback.after(textarea)}textarea.value=msg;textarea.select()}});
$('#year').textContent=new Date().getFullYear();
const film=$('.hero-video'),hero=$('.hero');
if(film){
 const control=$('#filmControl'),saveData=!!navigator.connection?.saveData;
 const setControl=show=>{control.hidden=!show};let playingDesired=true;
 async function manage(){const visible=hero.getBoundingClientRect().bottom>0&&hero.getBoundingClientRect().top<innerHeight*.8;const allowed=!reduced&&!saveData&&!document.hidden&&visible&&playingDesired;
 if(!allowed){film.pause();setControl(!reduced&&!saveData&&visible);return}
 try{film.muted=true;film.defaultMuted=true;film.setAttribute('muted','');film.playsInline=true;await film.play();setControl(false)}catch{setControl(true)}
 }
 control.addEventListener('click',async()=>{playingDesired=true;try{await film.play();setControl(false)}catch{setControl(true)}});
 film.addEventListener('error',()=>{setControl(false);film.pause()});
 const watcher=new IntersectionObserver(manage,{threshold:[0,.05,.5]});watcher.observe(hero);
 document.addEventListener('visibilitychange',manage);window.addEventListener('pageshow',manage);window.addEventListener('resize',manage,{passive:true});manage();
}
if(innerWidth<=850||matchMedia('(pointer:coarse)').matches){
 document.body.classList.add('mobile-cinematic');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  entry.target.classList.toggle('mobile-visible',entry.isIntersecting);
  if(entry.target.classList.contains('dossier'))entry.target.setAttribute('aria-hidden','false');
 }),{rootMargin:'-10% 0px -14% 0px',threshold:.12});
 [...dossiers,...$$('.topic'),$('.office-photo')].filter(Boolean).forEach(el=>observer.observe(el));
 // Mobile: individual sections remain readable and accessible, not hidden by desktop state machine.
 dossiers.forEach(el=>el.setAttribute('aria-hidden','false'));
 const stepObservers=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const step=Number(entry.target.dataset.stepMarker);changeStep(step);
 }),{rootMargin:'-22% 0px -52% 0px',threshold:0});
 steps.forEach(s=>stepObservers.observe(s));
 const paperObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const paperRect=contract.getBoundingClientRect();
  const p=(innerHeight*.65-paperRect.top)/Math.max(1,paperRect.height);
  changeStep(p>.58?2:p>.19?1:0)
 }),{threshold:[0,.2,.4,.65,1]});paperObserver.observe(contract);
}
if(!reduced){let ticking=false;const applyScroll=()=>{const rect=hero.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const amount=Math.max(0,Math.min(innerHeight,-rect.top));hero.querySelector('.hero-art').style.setProperty('--hero-shift',`${amount*.14}px`);hero.querySelector('.hero-copy').style.setProperty('--hero-text-shift',`${amount*.06}px`)}ticking=false};addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(applyScroll);ticking=true}},{passive:true});applyScroll()}


if(!reduced){const texts=$$('[data-scramble]');const symbols='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#§';function scramble(el){const final=el.textContent;let frame=0;const timer=setInterval(()=>{el.textContent=[...final].map((c,i)=>!/[A-Z0-9]/i.test(c)||i<frame/2?c:symbols[Math.floor(Math.random()*symbols.length)]).join('');frame++;if(frame>final.length*2+5){clearInterval(timer);el.textContent=final}},32)}setTimeout(()=>texts.forEach(scramble),400)}
})();
