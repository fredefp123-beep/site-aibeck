/* AIBeck V9 motion system - small, dependency-free Canvas 2D interpretations.
 * Visual concepts based on Grid Motion / Dark Veil / Beams / Acid Squares.
 * Existing canvas shaders, 3D demos and React-free V8 scripts remain unchanged. */
(()=>{'use strict';
 const $$=s=>[...document.querySelectorAll(s)];
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const small=window.matchMedia?.('(max-width: 720px)').matches;
 const canvases=$$('canvas[data-ab9-effect]');
 const states=canvases.map(el=>({el,root:el.parentElement,mode:el.dataset.ab9Effect,ctx:el.getContext('2d',{alpha:true}),width:0,height:0,shown:false,mx:.6,my:.35,px:.6,py:.35,stamp:-1,ripples:[]})).filter(v=>v.ctx);
 if(!states.length)return;
 const min=Math.min,max=Math.max,clamp=(v,a,b)=>max(a,min(b,v));
 const observer=('IntersectionObserver' in window)?new IntersectionObserver(entries=>{entries.forEach(e=>{const state=states.find(v=>v.el===e.target);if(state)state.shown=e.isIntersecting})},{rootMargin:'60px'}):null;
 for(const v of states){
   if(observer)observer.observe(v.el);else v.shown=true;
   v.root.addEventListener('pointermove',e=>{if(reduce||e.pointerType==='touch')return;const r=v.root.getBoundingClientRect();v.mx=clamp((e.clientX-r.left)/r.width,0,1);v.my=clamp((e.clientY-r.top)/r.height,0,1)},{passive:true});
   v.root.addEventListener('pointerdown',e=>{if(reduce)return;const r=v.root.getBoundingClientRect();v.ripples.push({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,age:0});if(v.ripples.length>3)v.ripples.shift()},{passive:true});
 }
 function size(v){const rect=v.el.getBoundingClientRect();const w=Math.round(rect.width),h=Math.round(rect.height);if(w<10||h<10)return false;if(w===v.width&&h===v.height)return true;v.width=w;v.height=h;const dpi=min(window.devicePixelRatio||1,small?1:1.3);v.el.width=Math.round(w*dpi);v.el.height=Math.round(h*dpi);v.ctx.setTransform(dpi,0,0,dpi,0,0);return true}
 function linear(ctx,x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);for(const [pos,col] of stops)g.addColorStop(pos,col);return g}
 function clear(v){v.ctx.clearRect(0,0,v.width,v.height);v.ctx.globalCompositeOperation='screen'}
 function veil(v,t){const {ctx:c,width:w,height:h}=v;const mx=v.px,my=v.py;
   for(let band=0;band<7;band++){const u=band/7,base=h*(.11+u*.125);c.beginPath();for(let x=-30;x<=w+40;x+=13){const p=x/w;const y=base+Math.sin(p*8.2+t*.17+u*7)*h*(.038+.018*u)+Math.sin(p*3.2-t*.25+u*12)*h*.034+(mx-.5)*35; if(x===-30)c.moveTo(x,y);else c.lineTo(x,y)}
     c.lineWidth=(band%3===0?52:30)+(u*12);c.strokeStyle=linear(c,0,0,w,h,[[0,'rgba(67,215,225,0)'],[.26,`rgba(70,207,221,${.018+.007*u})`],[.68,`rgba(114,124,244,${.06+.02*(1-u)})`],[1,'rgba(96,245,204,0)']]);c.shadowColor=band%2?'#6cf4df':'#7a85fc';c.shadowBlur=28;c.stroke();c.shadowBlur=0}
   const g=c.createRadialGradient(w*mx,h*my,20,w*mx,h*my,w*.52);g.addColorStop(0,'rgba(118,238,221,.10)');g.addColorStop(.45,'rgba(84,168,228,.045)');g.addColorStop(1,'rgba(80,123,250,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}
 function grid(v,t){const {ctx:c,width:w,height:h}=v;const mx=v.px,my=v.py;const cols=small?17:30,rows=small?11:17;const step=w/(cols+1);const top=h*.1;const depth=h*.86;const sy=depth/rows;
   for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){
     const y=top+r*sy;const x=step*.6+col*step;
     const dist=Math.hypot((col+.5)/cols-mx,(r+.5)/rows-my);
     const bump=.5*(1+Math.cos((col*.44+r*.35)+t*.65));const light=Math.exp(-dist*dist*20);
     const alpha=clamp(.03+.09*bump+.22*light,.02,.4);
     const raise=4*Math.sin(col*.18+r*.26+t*.45)+(light*9);
     const rw=step*.69,rh=sy*.62;
     c.beginPath();c.roundRect(x,y-raise,rw,rh,2.5);
     c.fillStyle=`rgba(${col%4===0?'132,237,230':'108,159,247'},${alpha.toFixed(3)})`;
     c.fill();c.strokeStyle=`rgba(205,247,252,${(.035+light*.11).toFixed(3)})`;c.lineWidth=.8;c.stroke()
   }
 }
 function beams(v,t){const {ctx:c,width:w,height:h}=v;for(let n=0;n<11;n++){
   const k=n/11;const x=w*(-.25+k*1.4)+Math.sin(t*.12+k*9)*w*.035;const move=(v.px-.5)*w*.10;
   const g=linear(c,x-70,0,x+move+w*.1,h,[[0,'rgba(142,202,245,0)'],[.3,`rgba(155,190,255,${.025+(1-k)*.026})`],[.7,`rgba(90,238,218,${.065+k*.03})`],[1,'rgba(120,238,232,0)']]);c.save();c.translate(x,0);c.transform(1,.02,-.36,1,0,0);c.fillStyle=g;c.fillRect(-20,0,30+(n%3)*15,h*1.3);c.restore();
   c.beginPath();c.moveTo(x-2,0);c.quadraticCurveTo(x+move,h*.5,x+w*.15,h);c.lineWidth=1.1;c.strokeStyle=`rgba(181,248,240,${.06+k*.04})`;c.stroke()
   }
 }
 function particles(v,t){const {ctx:c,width:w,height:h}=v;const count=small?46:95;for(let i=0;i<count;i++){
   const a=Math.abs(Math.sin(i*77.312));const b=Math.abs(Math.cos(i*53.817));const x=w*((a+Math.sin(t*.08+i)*.015)%1),y=h*((b+Math.cos(t*.12+i*.1)*.008)%1);
   const rr=i%9===0?2.1:1.0,fall=.4+.6*(1+Math.sin(t*.5+i*3))/2;
   c.beginPath();c.arc(x,y,rr,0,6.283);c.fillStyle=i%4?'rgba(145,231,244,'+(fall*.19)+')':'rgba(167,156,253,'+(fall*.16)+')';c.fill()
 }}
 function ripple(v){const c=v.ctx,w=v.width,h=v.height;v.ripples=v.ripples.filter(r=>r.age<1);for(const r of v.ripples){const rad=r.age*min(w,h)*.7;c.beginPath();c.arc(r.x*w,r.y*h,rad,0,6.283);c.strokeStyle='rgba(166,245,231,'+((1-r.age)*.22)+')';c.lineWidth=1.1;c.stroke();r.age+=.022}}
 let last=0;const frame=ts=>{if(ts-last<40){if(!reduce)requestAnimationFrame(frame);return}last=ts;
   for(const v of states){if(!v.shown&&!reduce)continue;if(!size(v))continue;v.px+=(v.mx-v.px)*.08;v.py+=(v.my-v.py)*.08;clear(v);const t=reduce?0:ts/1000;
     if(v.mode==='veil')veil(v,t);else if(v.mode==='grid')grid(v,t);else if(v.mode==='beams')beams(v,t);else particles(v,t);
     ripple(v);
   }
   if(!reduce)requestAnimationFrame(frame)
 };
 if(reduce){states.forEach(v=>v.shown=true);frame(0)}else requestAnimationFrame(frame);
 // Grid Motion-inspired mosaic, bounded to its section to avoid any CSS overflow.
 const social=document.querySelector('#instagram'),track=social?.querySelector('.ab9-mosaic-track');
 if(social&&track&&!reduce){let raf=0;social.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=social.getBoundingClientRect();const ratio=(e.clientX-r.left)/r.width-.5;track.style.setProperty('--ab9-pan',(ratio*-35).toFixed(1)+'px')})},{passive:true});}
})();
