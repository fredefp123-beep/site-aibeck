
(()=>{
 'use strict';
 const eventLog=[];let consent=false,gaEnabled=false;
 const id=(window.AIBECK_ANALYTICS_ID||'').trim();const valid=/^G-[A-Z0-9]{6,}$/.test(id);
 window.aiTrack=(name,fields={})=>{const safe=Object.fromEntries(Object.entries(fields).filter(([k,v])=>typeof v==='string'||typeof v==='number'));eventLog.push({name,time:Date.now(),fields:safe});if(eventLog.length>80)eventLog.shift();document.dispatchEvent(new CustomEvent('aibeck:analytics',{detail:{name,fields:safe}}));if(consent&&window.gtag)window.gtag('event',name,safe)};
 window.aiAnalyticsDebug=()=>eventLog.map(x=>({...x}));
 const banner=document.getElementById('masterConsent');if(!valid||!banner)return;
 const activate=()=>{if(gaEnabled)return;gaEnabled=true;consent=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',id,{send_page_view:true,anonymize_ip:true});const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(s);eventLog.forEach(x=>window.gtag('event',x.name,x.fields))};
 const state=localStorage.getItem('aibeck-analytics-choice');if(state==='yes')activate();else if(state!=='no')banner.hidden=false;
 document.getElementById('masterConsentAccept')?.addEventListener('click',()=>{localStorage.setItem('aibeck-analytics-choice','yes');banner.hidden=true;activate()});
 document.getElementById('masterConsentReject')?.addEventListener('click',()=>{localStorage.setItem('aibeck-analytics-choice','no');banner.hidden=true});
 document.getElementById('masterConsentReopen')?.addEventListener('click',()=>{banner.hidden=false});
})();
