/* AIBeck V13 — Sites premium com troca automática entre os modelos */
(()=>{
  const box=document.getElementById('produto-sites');if(!box)return;
  const controls=box.querySelector('.ab8-product-controls');const chips=[...box.querySelectorAll('[data-ab8-select]')];
  if(!controls||chips.length<2)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR=5000;let timer=0,visible=false,holdUntil=0,hover=false;
  const bar=document.createElement('div');bar.className='ab13-autobar';bar.style.setProperty('--dur',DUR+'ms');bar.innerHTML='<i></i>';
  controls.insertAdjacentElement('afterend',bar);
  const current=()=>{const a=box.querySelector('[data-ab8-select].is-active');return a?Number(a.dataset.ab8Select):0};
  const restartBar=()=>{bar.classList.remove('run');void bar.offsetWidth;if(visible&&!hover&&Date.now()>=holdUntil)bar.classList.add('run')};
  const tick=()=>{clearTimeout(timer);if(reduced)return;
    timer=setTimeout(()=>{
      if(visible&&!hover&&Date.now()>=holdUntil&&!document.getElementById('ab8-modal')?.open){
        const n=(current()+1)%chips.length;box.querySelector(`[data-ab8-select="${n}"]`)?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
      }
      restartBar();tick();
    },Date.now()<holdUntil?holdUntil-Date.now():DUR);
  };
  chips.forEach(c=>c.addEventListener('click',e=>{if(e.isTrusted){holdUntil=Date.now()+15000;bar.classList.remove('run');tick()}}));
  box.addEventListener('pointerenter',()=>{hover=true;bar.classList.remove('run')});
  box.addEventListener('pointerleave',()=>{hover=false;restartBar();tick()});
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;restartBar();tick()},{threshold:.35}).observe(box);
})();
/* Cases: o palco acompanha o mouse */
(()=>{const st=document.querySelector('.ab13-stage');if(!st||matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(hover:none)').matches)return;
const sec=st.closest('section');let raf=0;
sec.addEventListener('pointermove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const r=sec.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;st.style.transform=`rotateY(${x*6}deg) rotateX(${-y*4}deg)`})});
sec.addEventListener('pointerleave',()=>{st.style.transform=''});})();
