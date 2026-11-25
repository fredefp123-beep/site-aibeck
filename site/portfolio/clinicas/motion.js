/* Vértice Gestão — Prada-style editorial motion. No pinning; respects reduced motion. */
(() => {
 'use strict';
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const hero=document.querySelector('#inicio');
 const header=document.querySelector('#header');
 const sky=document.querySelector('.prado-sky');
 const hills=document.querySelector('.prado-hills');
 const book=document.querySelector('.if-book-stage');
 const menu=document.querySelector('#mobileMenu');
 const btn=document.querySelector('#menuToggle');
 const reveal=[...document.querySelectorAll('.reveal')];
 let previousY=scrollY,requested=false,menuActive=false;
 if(!reduced){root.classList.add('prado-animate');}
 function onFrame(){
   requested=false;
   const y=Math.max(0,scrollY),delta=y-previousY,top=hero?hero.getBoundingClientRect().top:0;
   if(header){header.classList.toggle('solid',y>65);
     if(Math.abs(delta)>2 && !menuActive){header.classList.toggle('header-hidden',y>160 && delta>0)}
     if(y<85)header.classList.remove('header-hidden');}
   if(hero && !reduced && !menuActive){const span=Math.max(400,hero.offsetHeight*.44), t=Math.min(1,Math.max(0,-top/span));
     if(sky)sky.style.setProperty('--sky-y',Math.round(t*85)+'px');
     if(hills)hills.style.setProperty('--hills-y',Math.round(t*260)+'px');
     if(book)book.style.setProperty('--book-y',Math.round(-t*75)+'px');
     hero.style.setProperty('--hero-progress',t);
   }
   if(reveal.length){const threshold=innerHeight*.90;
     reveal.forEach(el=>{if(!el.classList.contains('in') && el.getBoundingClientRect().top<threshold)el.classList.add('in')});}
   previousY=y;
 }
 const schedule=()=>{if(!requested){requested=true;requestAnimationFrame(onFrame)}};
 onFrame();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 if(btn){btn.addEventListener('click',()=>{menuActive=btn.getAttribute('aria-expanded')==='true';header.classList.remove('header-hidden');});}
 if(menu){menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menuActive=false;header?.classList.remove('header-hidden');}));}
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{
   const id=a.getAttribute('href'); if(!id||id==='#')return;
   const section=document.querySelector(id);if(!section)return;
   event.preventDefault();const y=section.getBoundingClientRect().top+window.scrollY-90;
   window.scrollTo({top:y,behavior:reduced?'instant':'smooth'});
   history.replaceState(null,'',id);
 }));
 // Material glints are decorative; real content and controls stay interactive.
 if(!reduced){document.querySelectorAll('.prado-chapter').forEach((el,i)=>{
   el.style.setProperty('--chapter-index',i);
 });}
})();
