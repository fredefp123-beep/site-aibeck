/** LUME CONSULTORIA — PRADO MOTION V5
 * Scenic layers from the supplied Prado project, progressive cinematographic transitions.
 * Never pins scrolling, replaces content, alters the calculator, or blocks links.
 */
(()=>{
  'use strict';
  const html=document.documentElement;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width:760px)');
  const hero=document.getElementById('inicio');
  const header=document.getElementById('header');
  const films=[...document.querySelectorAll('.film-transition[data-film]')];
  const bridge=document.querySelector('.cinema-portal');
  const windows=[...document.querySelectorAll('.prado-chapter')].filter(el=>!el.classList.contains('prado-platform'));
  const titles=[...document.querySelectorAll('.prado-chapter h2,.hero h1,.film-content h2,.cinema-message h2,.final h2')];
  const cards=[...document.querySelectorAll('.phase,.bento,.founder-card,.portal-card')].filter(el=>!el.closest('.if-original-simulator-hidden'));
  const basic=[...document.querySelectorAll('.reveal')];
  const revealQueue=new Set();
  const smoothstep=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const set=(el,key,value)=>el?.style.setProperty(key,value);
  let lenis=null,framePending=false,lastY=window.scrollY,lastPointer=null,menuOpened=false;
  let rafTriggered=0,prevScroll=window.scrollY;

  // Lenis is loaded via the versioned script tag supplied in the delivery.
  // Its absence (offline preview) leaves safe native scroll, without a broken page.
  function setupSmooth(){
    if(reduce.matches || typeof window.Lenis!=='function')return;
    try{lenis=new window.Lenis({autoRaf:true,anchors:true,lerp:.1,smoothWheel:true});}
    catch(err){console.warn('Lenis unavailable; using native scrolling.',err.message);lenis=null;}
  }

  function addEntrances(){
    ['metodo','contato','resultados','fundador'].forEach(id=>document.getElementById(id)?.setAttribute('data-prado-scene',''));
    // Apply non-destructive masks to titles; original HTML/text remains intact.
    titles.forEach((el)=>{if(el.closest('.film-transition,.cinema-portal'))return;el.classList.add('prado-title');revealQueue.add(el);});
    cards.forEach((el,i)=>{if(el.classList.contains('reveal'))return;el.classList.add('prado-enter');el.style.setProperty('--enter-delay',`${Math.min(300,i%3*115)}ms`);revealQueue.add(el)});
    basic.forEach(el=>revealQueue.add(el));
    // Once initialized only: never make the entire document flash/rebuild.
    if(!reduce.matches)html.classList.add('prado-motion-ready');
    else basic.forEach(el=>el.classList.add('in'));
    checkEntrances();
  }

  function checkEntrances(){
    const line=innerHeight*.88;
    for(const el of revealQueue){
      if(!el.isConnected){revealQueue.delete(el);continue;}
      if(el.getBoundingClientRect().top < line){
        el.classList.add(el.classList.contains('reveal')?'in':'prado-in');
        revealQueue.delete(el);
      }
    }
  }

  function heroScene(y){
    if(!hero)return;
    const r=hero.getBoundingClientRect();
    if(r.bottom<0 || r.top>innerHeight*1.6)return;
    const mobileUnit=mobile.matches?1.16:1;
    const reveal=clamp(y/(mobile.matches?700:710));
    const settle=1-Math.pow(1-reveal,1.65);
    const hills=(mobile.matches?570:640)*settle;
    const sky=Math.min(290,y*.31);
    const book=-Math.min(135,y*.19);
    set(hero,'--prado-hill-drift',`${hills.toFixed(1)}px`);
    set(hero,'--prado-sky-drift',`${sky.toFixed(1)}px`);
    set(hero,'--prado-book-drift',`${book.toFixed(1)}px`);
    set(hero,'--prado-open',reveal.toFixed(3));
  }

  function filmScene(section){
    const rect=section.getBoundingClientRect(),H=innerHeight;
    if(rect.bottom<-100 || rect.top>H+100)return;
    const progress=clamp((H*.98-rect.top)/(H+rect.height));
    set(section,'--film-progress',progress.toFixed(4));
    set(section,'--film-past',smoothstep(.40,.65,progress).toFixed(4));
    const bg=Math.round(48*progress);
    section.style.backgroundPosition=`center calc(50% + ${bg-23}px)`;
  }

  function bridgeScene(){
    if(!bridge)return;
    const rect=bridge.getBoundingClientRect(),H=innerHeight;
    if(rect.bottom<-100 || rect.top>H+100)return;
    const progress=clamp((H*.98-rect.top)/(H+rect.height));
    set(bridge,'--cinema-progress',progress.toFixed(4));
    set(bridge,'--cinema-past',smoothstep(.37,.62,progress).toFixed(4));
  }

  function windowScenes(){
    const H=innerHeight;
    for(const section of windows){
      const rect=section.getBoundingClientRect();
      if(rect.bottom<0 || rect.top>H*1.25)continue;
      const progress=clamp((H*.97-rect.top)/(H*.75));
      set(section,'--window',(.3 + .7*smoothstep(0,1,progress)).toFixed(3));
      set(section,'--prado-drift',`${Math.round((progress-.5)*35)}px`);
    }
  }

  function photoScenes(){
    if(mobile.matches)return;
    document.querySelectorAll('.founder-photo-wrap,.portrait-stage').forEach(wrap=>{
      const r=wrap.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      set(wrap,'--prado-photo-shift',`${Math.round((p-.5)*28)}px`);
    });
  }

  function headerScene(y){
    if(!header)return;
    header.classList.toggle('solid',y>80);
    if(y<120 || menuOpened){header.classList.remove('header-hidden');return;}
    const diff=y-lastY;
    if(diff>4)header.classList.add('header-hidden');
    if(diff< -4)header.classList.remove('header-hidden');
  }

  function progressScene(y){
    const total=Math.max(1,html.scrollHeight-innerHeight),t=clamp(y/total);
    set(document.querySelector('.footer'),'--wordmark-progress',String(t));
    const original=document.getElementById('progress');
    if(original)original.style.width=(t*100).toFixed(2)+'%';
    updateRail(t,total);
  }

  const rail=document.querySelector('.prado-scrollrail');
  const thumb=rail?.querySelector('.prado-scrollrail-thumb');
  let railDrag=false,railSize=0,thumbSize=0;
  function updateRail(t,total){
    if(!rail||!thumb)return;
    railSize=rail.clientHeight;
    thumbSize=Math.max(38,Math.min(railSize*.22,railSize*innerHeight/(total+innerHeight)));
    thumb.style.height=thumbSize.toFixed(1)+'px';
    set(rail,'--rail-top',`${Math.max(0,(railSize-thumbSize)*t).toFixed(1)}px`);
  }
  if(rail && thumb){
    rail.addEventListener('pointerdown',(ev)=>{
      if(reduce.matches || ev.pointerType!=='mouse')return;
      railDrag=true;rail.classList.add('dragging');rail.setPointerCapture(ev.pointerId);
      seek(ev.clientY);
    });
    const seek=y=>{
      const rect=rail.getBoundingClientRect();
      const p=clamp((y-rect.top-thumbSize/2)/Math.max(1,railSize-thumbSize));
      const dst=Math.round(p*(html.scrollHeight-innerHeight));
      if(lenis)lenis.scrollTo(dst,{immediate:true});else scrollTo({top:dst,behavior:'instant'});
    };
    rail.addEventListener('pointermove',ev=>{if(railDrag)seek(ev.clientY)});
    const end=()=>{railDrag=false;rail.classList.remove('dragging')};
    rail.addEventListener('pointerup',end);rail.addEventListener('pointercancel',end);
    document.addEventListener('pointermove',ev=>{
      if(ev.pointerType==='mouse'&&ev.clientX>innerWidth-25)rail.classList.add('is-visible');
      else if(!railDrag&&!scrolling)rail.classList.remove('is-visible');
    },{passive:true});
  }

  // Hover is paused while wheel/trackpad moves with an unchanged mouse position.
  let scrolling=false,scrolledTimer=0;
  function scrollOccurred(){
    scrolling=true;
    html.classList.add('is-scrolling');
    if(rail)rail.classList.add('is-visible');
    clearTimeout(scrolledTimer);
    scrolledTimer=setTimeout(()=>{
      scrolling=false;
      if(rail&&!railDrag)rail.classList.remove('is-visible');
    },1050);
    schedule();
  }
  addEventListener('pointermove',ev=>{
    if(ev.pointerType!=='mouse')return;
    if(lastPointer && Math.abs(ev.clientX-lastPointer.x)+Math.abs(ev.clientY-lastPointer.y)>2)html.classList.remove('is-scrolling');
    lastPointer={x:ev.clientX,y:ev.clientY};
  },{passive:true});

  function runFrame(){
    framePending=false;
    const y=Math.max(0,scrollY);
    checkEntrances();
    headerScene(y);
    progressScene(y);
    if(!reduce.matches){heroScene(y);films.forEach(filmScene);bridgeScene();windowScenes();photoScenes();}
    lastY=y;
  }
  function schedule(){if(framePending)return;framePending=true;requestAnimationFrame(runFrame)}

  function menuScene(){
    const menu=document.getElementById('mobileMenu');
    const trigger=document.getElementById('menuToggle');
    if(!menu || !trigger)return;
    trigger.addEventListener('click',()=>{
      // Original handler runs first and owns aria-expanded; inspect resulting state next frame.
      requestAnimationFrame(()=>{
        menuOpened=menu.classList.contains('open');
        header.classList.remove('header-hidden');
        if(lenis){menuOpened?lenis.stop():lenis.start();}
      });
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      menuOpened=false;if(lenis)lenis.start();header.classList.remove('header-hidden');
    }));
    document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&menuOpened){trigger.click();}});
  }

  function anchorScene(){
    // Original site's CTA links and in-page navigation remain intact.
    document.querySelectorAll('a[href^="#"]').forEach(link=>{
      link.addEventListener('click',ev=>{
        if(ev.defaultPrevented)return;
        const hash=link.getAttribute('href');
        if(!hash||hash==='#')return;
        const dest=document.getElementById(hash.slice(1));
        if(!dest)return;
        ev.preventDefault();
        const pos=dest.getBoundingClientRect().top+scrollY-84;
        if(lenis)lenis.scrollTo(pos,{duration:1.4});
        else window.scrollTo({top:pos,behavior:reduce.matches?'instant':'smooth'});
        history.replaceState(null,'',hash);
      });
    });
  }

  // Scene availability/fallback: if JS dies after initialization, content still becomes visible.
  function init(){
    setupSmooth();
    menuScene();anchorScene();
    addEntrances();
    if(!reduce.matches){
      html.classList.add('prado-intro-complete');
    }
    addEventListener('scroll',scrollOccurred,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
    window.addEventListener('load',schedule,{once:true});
    runFrame();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
