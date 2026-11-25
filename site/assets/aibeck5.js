/* AIBeck Signature 5.0: navigation, guided product showcases and selective
 * canvas backgrounds inspired by the user-provided React Bits references.
 * Lightweight, dependency-free adaptation; original demos are untouched. */
(()=>{'use strict';
 const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
 const nav=q('#navLinks'),toggle=q('#menuToggle'),groups=qa('.ab5-nav-group');
 const closeMenus=except=>groups.forEach(g=>{if(g===except)return;g.classList.remove('is-open');g.querySelector('.ab5-nav-trigger')?.setAttribute('aria-expanded','false')});
 groups.forEach(g=>{const b=g.querySelector('.ab5-nav-trigger');if(!b)return;
   b.addEventListener('click',e=>{e.stopPropagation();const open=!g.classList.contains('is-open');closeMenus();g.classList.toggle('is-open',open);b.setAttribute('aria-expanded',String(open))});
   g.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{closeMenus();nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='☰'}));
 });
 qa('#navLinks>a').forEach(a=>a.addEventListener('click',()=>{closeMenus();nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='☰'}));
 document.addEventListener('click',e=>{if(!e.target.closest('.ab5-nav-group'))closeMenus()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenus();if(nav.classList.contains('open')){nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='☰';toggle?.focus()}}});
 const scenarios={
   lead:['Olá! Gostaria de saber mais sobre os serviços.','Claro! Me conta qual é a sua necessidade para eu te orientar.'],
   retorno:['Recebi um orçamento ontem. Ainda está disponível?','Vou conferir sua solicitação e encaminhar o histórico à equipe para continuar o atendimento.'],
   humano:['Quero conversar com alguém sobre uma condição especial.','Sem problema! Vou registrar o contexto e direcionar sua conversa para um atendente.']
 };
 qa('[data-ab5-chat]').forEach(btn=>btn.addEventListener('click',()=>{const list=q('#ab5ChatBubbles'),items=scenarios[btn.dataset.ab5Chat];if(!list||!items)return;
   qa('[data-ab5-chat]').forEach(x=>{x.classList.toggle('active',x===btn);x.setAttribute('aria-pressed',String(x===btn))});
   list.replaceChildren(...items.map((text,i)=>{const p=document.createElement('p');p.className='ab5-bubble '+(i?'agent':'customer');p.textContent=text;return p}));
   window.aiTrack?.('product_ai_scenario',{scenario:btn.dataset.ab5Chat});
 }));
 // Handle all new product CTAs with original drawer logic and product pre-selection.
 qa('.ab5-product [data-ab-product]').forEach(a=>a.addEventListener('click',()=>{
   const select=q('#briefProduct');const choice=a.dataset.abProduct;if(select)select.value=choice;
   const src=q('#masterLeadSource');if(src)src.value='aibeck5_'+choice.toLowerCase().replace(/[^a-z0-9]+/g,'_');
   window.aiTrack?.('product_cta',{product:choice});
 }));
 // Source-inspired motion, implemented directly for the existing static-site architecture.
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const lightCanvas=qa('canvas[data-ab5-effect]');
 if(!lightCanvas.length)return;
 let mouse={x:-10000,y:-10000};
 document.addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});
 const views=lightCanvas.map(canvas=>({canvas,ctx:canvas.getContext('2d',{alpha:true}),type:canvas.dataset.ab5Effect,visible:false,w:0,h:0,last:0,frame:0})).filter(v=>!!v.ctx);
 function resize(v){const box=v.canvas.getBoundingClientRect();if(!box.width||!box.height)return;
   const ratio=Math.min(devicePixelRatio||1,1.35);const w=Math.max(1,Math.round(box.width)),h=Math.max(1,Math.round(box.height));
   if(v.w===w&&v.h===h)return;v.w=w;v.h=h;v.canvas.width=Math.round(w*ratio);v.canvas.height=Math.round(h*ratio);v.ctx.setTransform(ratio,0,0,ratio,0,0);
 }
 const io=('IntersectionObserver'in window)?new IntersectionObserver(entries=>entries.forEach(e=>{const v=views.find(v=>v.canvas===e.target);if(v)v.visible=e.isIntersecting}),{rootMargin:'150px',threshold:0}):null;
 views.forEach(v=>{resize(v);if(io)io.observe(v.canvas);else v.visible=true});
 window.addEventListener('resize',()=>views.forEach(resize),{passive:true});
 function veil(v,t){const{ctx:c,w,h}=v;c.clearRect(0,0,w,h);
   const cy=h*.46, amp=Math.min(95,h*.12);c.save();c.globalCompositeOperation='screen';
   for(let i=0;i<32;i++){const y=cy+(i-16)*12;const a=.045+(.045*Math.sin(i*.45+t*.16));
     c.beginPath();for(let x=-25;x<=w+25;x+=13){let yy=y+Math.sin(x*.008+i*.24+t*.24)*amp*.35+Math.sin(x*.016-i*.19-t*.18)*amp*.33;
       if(x===-25)c.moveTo(x,yy);else c.lineTo(x,yy)}
     c.lineWidth=1.3+(i%5===0?1:0);c.strokeStyle=`rgba(${i%3===0?'90,245,214':i%3===1?'100,155,244':'59,197,189'},${Math.max(0.018,a)})`;c.stroke();
   }
   const grad=c.createRadialGradient(w*.72,h*.54,5,w*.72,h*.54,w*.6);grad.addColorStop(0,'rgba(57,230,181,.12)');grad.addColorStop(1,'rgba(57,230,181,0)');c.fillStyle=grad;c.fillRect(0,0,w,h);c.restore();
 }
 function squares(v,t){const{ctx:c,w,h}=v;c.clearRect(0,0,w,h);c.save();const sz=Math.max(31,Math.min(58,w/28));const nX=Math.ceil(w/sz)+1,nY=Math.ceil(h/sz)+1;const b=v.canvas.getBoundingClientRect(),mx=mouse.x-b.left,my=mouse.y-b.top;
   for(let yi=0;yi<nY;yi++)for(let xi=0;xi<nX;xi++){const x=xi*sz,y=yi*sz;const dx=x-mx,dy=y-my,dist=Math.hypot(dx,dy),wave=Math.max(0,1-dist/240);
     const swell=(Math.sin(xi*.35+yi*.4+t*.9)+1)/2;const z=wave*Math.sin(dist*.028-t*2.4)*6;
     const grd=c.createLinearGradient(x,y,x+sz,y+sz);const a=.025+.065*swell+.13*wave;grd.addColorStop(0,`rgba(83,230,194,${a})`);grd.addColorStop(1,`rgba(70,147,232,${a*.22})`);
     c.strokeStyle=`rgba(133,229,221,${.055+.07*swell+.13*wave})`;c.lineWidth=.8;c.fillStyle=grd;
     c.beginPath();c.roundRect(x+3,y+3-z,Math.max(1,sz-7),Math.max(1,sz-7),4);c.fill();c.stroke();
   }c.restore()}
 function beams(v,t){const{ctx:c,w,h}=v;c.clearRect(0,0,w,h);c.save();c.globalCompositeOperation='screen';
   for(let i=0;i<12;i++){let xx=(i/12*w+(t*13*(i%3?1:-.25)))%(w+230)-100;let len=h*1.8;let grad=c.createLinearGradient(xx,-10,xx+len*.19,h);grad.addColorStop(0,'rgba(119,179,255,0)');grad.addColorStop(.4,`rgba(${i%2?'78,207,239':'86,142,247'},${.06+(i%4)*.015})`);grad.addColorStop(1,'rgba(70,154,237,0)');c.strokeStyle=grad;c.lineWidth=(i%3===0?22:8);c.beginPath();c.moveTo(xx,-40);c.lineTo(xx+len*.32,h+40);c.stroke();
   }c.restore()}
 function ascii(v,t){const{ctx:c,w,h}=v;c.clearRect(0,0,w,h);let gap=19;let cols=Math.min(78,Math.ceil(w/gap)),rows=Math.min(40,Math.ceil(h/gap));const chars=' .:-=+*xX#';c.save();c.font='11px ui-monospace,monospace';c.textAlign='center';
   for(let yy=0;yy<rows;yy++)for(let xx=0;xx<cols;xx++){const x=xx*gap+8,y=yy*gap+12;const val=(Math.sin(xx*.17+t*.7)*Math.cos(yy*.2-t*.4)+Math.sin((xx+yy)*.08-t*.5))/4+.5;const ci=Math.max(0,Math.min(chars.length-1,Math.floor(val*chars.length)));c.fillStyle=`rgba(15,101,123,${.08+val*.25})`;c.fillText(chars[ci],x,y)}c.restore()}
 const render={veil,squares,beams,ascii};let request=0;
 function tick(ms){let any=false;for(const v of views){if(!v.visible)continue;any=true;if(ms-v.last<45)continue;resize(v);v.last=ms;const clock=reduced?1:ms/1000;try{render[v.type]?.(v,clock)}catch(e){v.visible=false}}
   if(any&&!reduced)request=requestAnimationFrame(tick);else request=0;
 }
 if(io){const r=new IntersectionObserver(e=>{if(e.some(x=>x.isIntersecting)&&!request)request=requestAnimationFrame(tick)},{rootMargin:'120px'});views.forEach(v=>r.observe(v.canvas))}
 request=requestAnimationFrame(tick);
})();
