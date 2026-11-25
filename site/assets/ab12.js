/* AIBeck V12 — soluções em abas: uma frente por vez, conteúdo intacto */
(()=>{const root=document.getElementById('produtos');if(!root)return;
const tabs=[...root.querySelectorAll('[data-ab12-tab]')];const ids=tabs.map(t=>t.dataset.ab12Tab);
const show=id=>{if(!ids.includes(id))return false;tabs.forEach(t=>{const on=t.dataset.ab12Tab===id;t.classList.toggle('is-active',on);t.setAttribute('aria-selected',String(on))});
ids.forEach(x=>document.getElementById(x)?.classList.toggle('ab12-on',x===id));window.dispatchEvent(new Event('resize'));return true};
show(ids[0]);
tabs.forEach(t=>t.addEventListener('click',()=>{show(t.dataset.ab12Tab);window.aiTrack?.('solution_tab',{tab:t.dataset.ab12Tab})}));
/* links para #produto-x (menu, guia) abrem a aba certa antes de rolar */
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#produto-"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(show(id)){e.preventDefault();requestAnimationFrame(()=>document.getElementById(id).scrollIntoView({behavior:'smooth',block:'start'}));history.replaceState(null,'','#'+id)}},true);
if(ids.includes(location.hash.slice(1)))show(location.hash.slice(1));
})();
