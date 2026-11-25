/* Reference Edition — reversible, independent UI on top of original site mechanics. */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const form=$('#refFinder');
 if(form){
   const answers={segmento:'',problema:'',momento:''};
   const steps=[...form.querySelectorAll('[data-ref-step]')];
   let index=0;
   const go=(next)=>{
     index=Math.max(0,Math.min(3,next));
     steps.forEach((step,i)=>{step.hidden=i!==index});
     $('#refFinderResult').hidden=index!==3;
     $('#refFinderProgress').textContent=index===3?'SUA SOLUÇÃO':'PASSO '+String(index+1).padStart(2,'0')+' / 03';
     $('#refFinderMeter').style.width=((index===3?3:index+1)/3*100)+'%';
     $('#refFinderBack').hidden=index===0||index===3;
     $('#refFinderReset').hidden=index!==3;
   };
   const recommendation={
     atendimento:{title:'IA e atendimento inteligente',body:'Comece reduzindo o tempo de resposta, organizando a entrada de contatos e criando um processo confiável de acompanhamento. Uma IA pode ajudar, com supervisão e integrações adequadas.',product:'Agentes de IA',demo:'#experiencias',demoScene:'ia'},
     gestao:{title:'CRM, processos e gestão comercial',body:'Comece organizando oportunidades, responsáveis, etapas e indicadores. Assim, seu time ganha rotina e você ganha visibilidade antes de automatizar mais.',product:'CRM & BI',demo:'#tour',module:'pipeline'},
     site:{title:'Site premium com foco em conversão',body:'Comece por uma presença digital que explica sua oferta, valoriza a sua marca e facilita o próximo contato. O design precisa impressionar e ajudar a vender.',product:'Sites premium',demo:'#case-lab'},
     integracoes:{title:'Integrações e automações sob medida',body:'Comece mapeando onde informações se perdem entre WhatsApp, CRM e ferramentas operacionais. Depois conectamos processos com segurança e rastreabilidade.',product:'Integrações e automações',demo:'#experiencias',demoScene:'integracoes'}
   };
   let current=null;
   function showResult(){
     current=recommendation[answers.problema]||recommendation.gestao;
     $('#refResultTitle').textContent=current.title;
     $('#refResultBody').textContent=current.body;
     $('#refResultContext').textContent=answers.segmento+' · '+(answers.momento==='Agora'?'prioridade imediata':answers.momento==='Pesquisando'?'fase de exploração':'planejamento para os próximos 30 dias');
     const demo=$('#refResultDemo');
     const productAnchor={atendimento:'produto-ia',gestao:'produto-crm',site:'produto-sites',integracoes:'produto-ia'}[answers.problema]||'produto-crm';
     if(document.getElementById(productAnchor)){demo.href='#'+productAnchor;demo.textContent='Ver a solução indicada para você ↗';demo.dataset.ab10Product=productAnchor;}
     else{demo.href=current.demo;delete demo.dataset.ab10Product;demo.textContent=answers.problema==='site'?'Explorar sites 3D ↗':'Testar demonstração ↗';}
     const msg='Olá! Usei o guia do site AIBeck. Tenho uma empresa do segmento '+answers.segmento+'. Meu desafio é '+({atendimento:'melhorar atendimento e acompanhamento',gestao:'organizar vendas e gestão',site:'melhorar minha presença digital',integracoes:'integrar sistemas e processos'}[answers.problema])+'. Momento: '+answers.momento+'. Quero saber como vocês podem ajudar.';
     $('#refResultWhatsApp').href='https://wa.me/5524992130600?text='+encodeURIComponent(msg);
     go(3);
     window.aiTrack?.('recommendation_completed',{category:answers.problema,segment:answers.segmento,stage:answers.momento});
   }
   form.querySelectorAll('[data-ref-answer]').forEach(button=>button.addEventListener('click',()=>{
     const field=button.dataset.refAnswer;
     answers[field]=button.dataset.refValue;
     if(field==='momento')showResult();else go(index+1);
   }));
   $('#refFinderBack').addEventListener('click',()=>go(index-1));
   $('#refFinderReset').addEventListener('click',()=>{current=null;Object.keys(answers).forEach(k=>answers[k]='');go(0)});
   $('#refResultContact').addEventListener('click',()=>{
     const select=$('#briefProduct');if(select&&current){select.value=current.product;}
     const seg=$('#ai-field-segmento');if(seg)seg.value=answers.segmento;
     const moment=$('#briefForm select[name="momento"]');if(moment)moment.value=answers.momento==='Agora'?'Quero começar agora':answers.momento==='Pesquisando'?'Estou pesquisando opções':'Nos próximos 30 dias';
     const source=$('#masterLeadSource');if(source)source.value='guia_referencia4';
     const note=$('#briefForm textarea[name="desafio"]');if(note){note.value='Segmento: '+answers.segmento+'\nDesafio: '+({atendimento:'Atendimento e acompanhamento de contatos',gestao:'Gestão comercial e CRM',site:'Presença digital e site premium',integracoes:'Integração entre processos e ferramentas'}[answers.problema])+'\nMomento: '+answers.momento;}
     const drawer=$('#contactDrawer');
     // Delegate to site's existing focus/scroll-lock/contact infrastructure.
     const opener=document.querySelector('#solucoes .contact-open');
     if(opener){opener.click();if(select&&current)select.value=current.product;}
     else if(drawer){drawer.classList.add('open')}
     window.aiTrack?.('guide_qualified_lead',{category:answers.problema});
   });
   $('#refResultDemo').addEventListener('click',e=>{
     if(!current)return;
     const pa=e.currentTarget.dataset.ab10Product;if(pa){const el=document.getElementById(pa);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.add('ab10-highlight');setTimeout(()=>el.classList.remove('ab10-highlight'),2600);}window.aiTrack?.('guide_product',{category:answers.problema});return;}
     if(current.demoScene){const button=document.querySelector(`.showroom-list [data-scene="${current.demoScene}"]`);if(button)button.click();}
     if(current.module){const tab=document.querySelector(`[data-os-tab="${current.module}"]`);if(tab)tab.click();}
     window.aiTrack?.('guide_demo',{category:answers.problema});
   });
   go(0);
 }
 const formatInteger=n=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0}).format(n);
 const formatMoney=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n).replace(/\u00a0/g,' ');
 const sliders=['refLeads','refRate','refTicket'].map(id=>$('#'+id));
 if(sliders.every(Boolean)){
   const calculate=()=>{
     const [leads,rate,ticket]=sliders.map(el=>Number(el.value));
     const count=Math.round(leads*rate/100);
     $('#refLeadsOutput').textContent=formatInteger(leads);
     $('#refRateOutput').textContent=rate+'%';
     $('#refTicketOutput').textContent=formatMoney(ticket);
     $('#refLeadsRisk').textContent=formatInteger(count);
     $('#refValueRisk').textContent=formatMoney(count*ticket);
   };
   sliders.forEach(el=>el.addEventListener('input',calculate));
   calculate();
 }
})();
