/* ============================================================
   UCI Solar Car — shared behavior for sub-pages
   ============================================================ */
/* streamlines */
function buildStream(el){
  const cfg={
    hero:{lines:26,amp:22,wl:300,sw:1,speed:22},
    menu:{lines:22,amp:18,wl:300,sw:1,speed:30},
    head:{lines:18,amp:18,wl:320,sw:1,speed:34},
    footer:{lines:14,amp:16,wl:320,sw:1,speed:38}
  }[el.dataset.stream]||{lines:16,amp:18,wl:320,sw:1,speed:40};
  const W=2880;
  let paths='';
  for(let i=0;i<cfg.lines;i++){
    const base=(i+0.5)*(600/cfg.lines), ph=i*0.6;
    let d='M0 '+(base+cfg.amp*Math.sin(ph)).toFixed(1);
    for(let x=20;x<=W;x+=20){ const y=base+cfg.amp*Math.sin((x/cfg.wl)*Math.PI*2+ph); d+=' L'+x+' '+y.toFixed(1); }
    paths+='<path d="'+d+'"/>';
  }
  el.innerHTML='<svg viewBox="0 0 '+W+' 600" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="'+cfg.sw+'"><g class="flowg" style="animation-duration:'+cfg.speed+'s">'+paths+'</g></svg>';
}
document.querySelectorAll('.stream[data-stream]').forEach(buildStream);

/* Lenis smooth scroll */
let lenis=null;
if(window.Lenis){
  lenis=new Lenis({lerp:0.075,wheelMultiplier:0.9,smoothWheel:true,syncTouch:true});
  window.__lenis=lenis;
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf);}; requestAnimationFrame(raf);
}
function scrollToT(t){ if(lenis)lenis.scrollTo(t,{offset:0}); else (typeof t==='string'?document.querySelector(t):t)?.scrollIntoView({behavior:'smooth'}); }

/* menu (cross-page aware: only intercept in-page # links) */
const toggle=document.getElementById('menuToggle'), menu=document.getElementById('menu');
let menuOpen=false;
function setMenu(o){menuOpen=o;menu.classList.toggle('open',o);toggle.classList.toggle('open',o);toggle.setAttribute('aria-expanded',o);menu.setAttribute('aria-hidden',!o);if(lenis){o?lenis.stop():lenis.start();}}
if(toggle&&menu){
  toggle.addEventListener('click',()=>setMenu(!menuOpen));
  menu.querySelectorAll('[data-link]').forEach(a=>a.addEventListener('click',e=>{
    const href=a.getAttribute('href');
    if(href&&href.charAt(0)==='#'){ e.preventDefault(); setMenu(false); setTimeout(()=>scrollToT(href),450); }
    else { setMenu(false); } /* real page link — let it navigate */
  }));
  addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen)setMenu(false);});
}

/* hero zoom-out on scroll (if a fixed hero is present) */
const heroEl=document.querySelector('.hero'), heroInner=document.querySelector('.hero-inner');
const headEl=document.querySelector('.page-head');
const darkAfter = heroEl ? innerHeight*0.72 : (headEl?headEl.offsetHeight-80:0);
function onScroll(y){
  if(heroEl){
    const p=Math.min(Math.max(y/innerHeight,0),1);
    if(heroInner){
      heroInner.style.filter='blur('+(p*14).toFixed(1)+'px)';
      heroInner.style.opacity=(1-p*0.9).toFixed(3);
      heroInner.style.transform='translateY('+(-p*30).toFixed(0)+'px)';
    }
    const p2=Math.max(0,(p-0.5))/0.5, inset=p2*(innerWidth*0.09);
    heroEl.style.left=inset.toFixed(1)+'px';
    heroEl.style.right=inset.toFixed(1)+'px';
    heroEl.style.borderRadius=(p2*30).toFixed(1)+'px';
  }
  if(toggle)toggle.classList.toggle('dark', y>darkAfter && !menuOpen);
}
if(lenis)lenis.on('scroll',({scroll})=>onScroll(scroll)); else addEventListener('scroll',()=>onScroll(scrollY),{passive:true});
onScroll(0);

/* reveal: fade-ups, sliding images, baseline-rise headings */
const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.18});
document.querySelectorAll('.reveal,.slide-img,.riseh,.value .v-img').forEach(el=>io.observe(el));
