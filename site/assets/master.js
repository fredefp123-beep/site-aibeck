
(()=>{
'use strict';
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const goModule=(key)=>{const x=$(`[data-os-tab="${key}"]`);if(x)x.click();$('#tour')?.scrollIntoView({behavior:'smooth',block:'start'});};
const opts=[
 {label:'Experimentar o CRM ↗',module:'pipeline',product:'CRM & BI'},
 {label:'Testar atendimento IA ↗',module:'inbox',product:'Agentes de IA'},
 {label:'Explorar integrações ↗',module:'flows',product:'Integrações e automações'},
 {label:'Explorar sites premium ↗',case:'web',product:'Sites premium'}
];
const cta=$('#kinExplore'),secondary=$('[data-master-secondary-cta]');let current=0;
const switchScene=(n)=>{current=n;const o=opts[n];if(!o||!cta)return;cta.textContent=o.label;cta.href=o.case?'#case-'+o.case:'#tour';cta.dataset.masterProduct=o.product;secondary?.setAttribute('data-product',o.product);};
$$('[data-kin-switch]').forEach((b,i)=>b.addEventListener('click',()=>switchScene(i)));
const hero=$('#inicio');if(hero){const mo=new MutationObserver(()=>{const idx=$$('.kin-visual-scene',hero).findIndex(x=>x.classList.contains('is-current'));if(idx>=0&&idx!==current)switchScene(idx)});mo.observe(hero,{attributes:true,subtree:true,attributeFilter:['class']});}
cta?.addEventListener('click',e=>{const o=opts[current];if(!o)return;e.preventDefault();if(o.case){document.querySelector('.ablab-web-card[href="#case-web"]')?.click()}else{goModule(o.module)}window.aiTrack?.('hero_cta',{product:current+1});});
secondary?.addEventListener('click',()=>{const product=opts[current]?.product||'CRM & BI';const select=$('#briefProduct');if(select)select.value=product;const lead=$('#masterLeadSource');if(lead)lead.value='hero_'+(current+1);window.aiTrack?.('contact_open',{product:current+1});});
$$('[data-master-module]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();goModule(a.dataset.masterModule);window.aiTrack?.('demo_open',{module:a.dataset.masterModule})}));
// Case Lab is fetched from its own static file only when opened. The remaining site never waits on it.
const overlay=$('#ab-case-overlay'),frame=$('#ab-case-iframe'),closer=$('#ab-case-close');
const valid=new Set(['crm','ai','flow','white','food','arch','fashion','culture','web']);
let opened=false,lastTrigger=null,currentCase='crm';
const close=()=>{if(!opened)return;opened=false;overlay.hidden=true;document.body.classList.remove('ab-case-open');frame.src='about:blank';lastTrigger?.focus?.({preventScroll:true});};
const open=(key,trigger)=>{
 if(!valid.has(key))return;
 currentCase=key;lastTrigger=trigger||document.activeElement;
 overlay.hidden=false;opened=true;document.body.classList.add('ab-case-open');
 let target;try{target=new URL('case-lab.html',location.href);target.hash=key}catch(e){target={href:'case-lab.html#'+key}};
 frame.onload=()=>{try{frame.contentWindow.postMessage({type:'aibeck:select-case',key:currentCase},location.origin==='null'?'*':location.origin)}catch(e){}};
 frame.src=target.href;
 closer?.focus({preventScroll:true});
 window.aiTrack?.('case_open',{case_type:key});
 try{history.replaceState(null,'','#case-'+key)}catch(e){}
};
$$('a[href^="#case-"]').forEach(a=>{const key=a.getAttribute('href').slice(6);if(valid.has(key))a.addEventListener('click',e=>{e.preventDefault();open(key,a)})});
closer?.addEventListener('click',()=>{close();history.replaceState(null,'','#case-lab')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.preventDefault();close();history.replaceState(null,'','#case-lab')}});
const names={crm:'CRM & Business Intelligence',ai:'Atendimento com IA',flow:'Integrações e Automações',white:'White-label',food:'Gastronomia premium',arch:'Arquitetura premium',fashion:'Moda premium',culture:'Cultura e eventos',web:'Sites institucionais e Signature'};
window.addEventListener('message',event=>{
 if(!opened || event.source!==frame.contentWindow || !event.data || typeof event.data!=='object')return;
 if(event.data.type==='aibeck:close-case'){close();return}
 if(event.data.type!=='aibeck:request-project')return;
 const key=valid.has(event.data.key)?event.data.key:currentCase;close();
 const product=['food','arch','fashion','culture','web'].includes(key)?'Sites premium':key==='ai'?'Agentes de IA':key==='flow'?'Integrações e automações':key==='white'?'White-label':'CRM & BI';
 const sel=$('#briefProduct');if(sel)sel.value=product;
 const desc=$('textarea[name="desafio"]');if(desc)desc.value='Gostaria de um projeto baseado na experiência '+names[key]+' que explorei no Case Lab. Podemos conversar sobre personalização, escopo e implementação?';
 const exp=$('#ai-field-experiencia');if(exp)exp.value='Case Lab: '+names[key];
 const orig=$('#masterLeadSource');if(orig)orig.value='case_'+key;
 $('#contactDrawer')?.classList.add('open');document.body.classList.add('no-scroll');
 window.aiTrack?.('case_lead',{case_type:key});
});
// Fallback for a missing module: show an explicit actionable message instead of a silent blank iframe.
frame?.addEventListener('error',()=>{const note=$('#masterCaseError');if(note)note.hidden=false});
const hash=location.hash.match(/^#case-(crm|ai|flow|white|food|arch|fashion|culture|web)$/);
if(hash)setTimeout(()=>open(hash[1]),350);
})();
