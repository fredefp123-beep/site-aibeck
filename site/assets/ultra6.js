/* AIBeck Ultra Master V6. Progressive enhancement only, safe when Canvas is unavailable. */
(()=>{'use strict';
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const founderCTA=$('.ab6-founder-cta');
 founderCTA?.addEventListener('click',()=>{const select=$('#briefProduct');if(select)select.value='Ainda não sei';const src=$('#masterLeadSource');if(src)src.value='aibeck6_fundador';});
 const progress=$('#ab6ProgressBar');let scrollScheduled=false;
 const updateProgress=()=>{scrollScheduled=false;if(!progress)return;const total=document.documentElement.scrollHeight-innerHeight;progress.style.width=(total>0?Math.max(0,Math.min(100,scrollY/total*100)):0).toFixed(2)+'%'};
 addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateProgress)}},{passive:true});updateProgress();
 const surfaces=$$('.ab6-interactive,.ab6-hero');
 surfaces.forEach(s=>{let raf=0;
   s.addEventListener('pointermove',e=>{if(reduced||e.pointerType==='touch')return;if(raf)return;const x=e.clientX,y=e.clientY;
     raf=requestAnimationFrame(()=>{raf=0;const r=s.getBoundingClientRect();if(r.width&&r.height){s.style.setProperty('--ab6-px',((x-r.left)/r.width*100).toFixed(1)+'%');s.style.setProperty('--ab6-py',((y-r.top)/r.height*100).toFixed(1)+'%')}})
   },{passive:true});
 });
 const canvases=$$('canvas[data-ab6-sky]');
 if(!canvases.length||!window.IntersectionObserver)return;
 const views=canvases.map(el=>({el,ctx:el.getContext('2d',{alpha:true}),style:el.dataset.ab6Sky,w:0,h:0,visible:false,last:-1})).filter(v=>v.ctx);
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{const v=views.find(v=>v.el===e.target);if(v)v.visible=e.isIntersecting}),{rootMargin:'100px'});
 views.forEach(v=>io.observe(v.el));
 function resize(v){const rect=v.el.getBoundingClientRect();const w=Math.ceil(rect.width),h=Math.ceil(rect.height);if(!w||!h||w===v.w&&h===v.h)return;v.w=w;v.h=h;const d=Math.min(devicePixelRatio||1,1.25);v.el.width=Math.round(w*d);v.el.height=Math.round(h*d);v.ctx.setTransform(d,0,0,d,0,0)};
 function draw(v,t){const c=v.ctx,w=v.w,h=v.h;if(!w||!h)return;c.clearRect(0,0,w,h);c.save();c.globalCompositeOperation='screen';
   const founder=v.style==='founder',N=founder?18:25;
   const shift=founder?.47:.64;
   for(let k=0;k<N;k++){
     const p=k/(N-1);const startY=h*(founder?.72:.28)+p*h*(founder?.23:.58);
     const s=k%3;
     let grad=c.createLinearGradient(0,startY,w,startY-h*.16);
     if(founder){grad.addColorStop(0,'rgba(80,230,228,0)');grad.addColorStop(.5,`rgba(${s?'100,210,232':'95,250,196'},${.04+p*.065})`);grad.addColorStop(1,'rgba(155,145,253,0)')}
     else{grad.addColorStop(0,'rgba(70,215,215,0)');grad.addColorStop(.57,`rgba(${s===0?'82,235,214':s===1?'82,149,249':'168,143,249'},${.026+(1-p)*.065})`);grad.addColorStop(1,'rgba(137,200,255,0)')}
     c.strokeStyle=grad;c.lineWidth=k%7===0?1.8:.75;c.beginPath();
     for(let x=-24;x<=w+24;x+=16){
       const y=startY+Math.sin((x/w)*9+p*6+t*shift)*h*(founder?.022:.034)+Math.cos((x/w)*4-p*8-t*.29)*h*.021;
       if(x===-24)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke();
   }
   const count=Math.max(23,Math.min(95,Math.floor(w*h/13000)));
   for(let i=0;i<count;i++){
     const u=(Math.sin(i*53.123)*5478.281)%1;const vv=(Math.cos(i*71.24)*9137.14)%1;
     const x=(Math.abs(u)*w+Math.sin(t*.09+i)*13), y=(Math.abs(vv)*h+Math.cos(t*.08+i)*9);
     const blink=.25+.5*(1+Math.sin(i*3.31+t*.67))/2;
     c.beginPath();c.fillStyle=`rgba(${founder?'129,234,233':'145,210,255'},${.10*blink})`;c.arc(x,y,i%7===0?1.6:0.75,0,Math.PI*2);c.fill();
   }
   c.restore();
 }
 let stopped=false;document.addEventListener('visibilitychange',()=>{stopped=document.hidden});
 let frame=0;function tick(ms){if(!stopped){for(const v of views){if(!v.visible||ms-v.last<40)continue;resize(v);draw(v,reduced?2:ms/1000);v.last=ms}}if(!reduced)frame=requestAnimationFrame(tick)}
 frame=requestAnimationFrame(tick);
})();
