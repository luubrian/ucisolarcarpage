/* ============================================================
   UCI Solar Car — site-wide UI (loaded on every page)
   floating logo · recruiting button · page transitions ·
   cookie consent + Google Analytics · footer contact form
   ============================================================ */
(function(){
  const ROOT = window.SITE_ROOT || '';           /* './' on home, '../' on a sub-page */
  const isHome = !!window.IS_HOME;
  const onJoin = /\/join-us\/?$/.test(location.pathname);

  /* ---- floating home logo (top-left, all pages) ---- */
  if(!document.querySelector('.site-logo')){
    const a=document.createElement('a');
    a.className='site-logo'; a.href=ROOT||'./'; a.setAttribute('aria-label','UCI Solar Car — home');
    a.innerHTML='<img src="'+ROOT+'photos/logo.png" alt="UCI Solar Car">';
    document.body.appendChild(a);
  }

  /* ---- recruiting pulse button (top-center; hidden on the Join page) ---- */
  if(!onJoin && !document.querySelector('.recruit-btn')){
    const r=document.createElement('a');
    r.className='recruit-btn'; r.href=ROOT+'join-us/';
    r.innerHTML='<span>Recruiting for Fall 2026</span><span class="arr" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    document.body.appendChild(r);
  }

  /* ---- page transition: royal panels split apart with a jade center bar ---- */
  const NAV_KEY='usc-nav';
  const navFlag=()=>{try{return sessionStorage.getItem(NAV_KEY);}catch(e){return null;}};
  const setNav=v=>{try{v?sessionStorage.setItem(NAV_KEY,'1'):sessionStorage.removeItem(NAV_KEY);}catch(e){}};

  let trans=document.getElementById('pageTrans');
  if(!trans){
    trans=document.createElement('div'); trans.id='pageTrans';
    trans.innerHTML='<div class="ph l"></div><div class="ph r"></div><div class="pbar"></div>';
    document.body.appendChild(trans);
  }
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* arriving via an internal link → the covered screen (with the full center line) parts open */
  if(navFlag() && !reduce){
    setNav(false);
    trans.classList.add('show','instant','cover','bar'); // fully covered, line at full height
    void trans.offsetWidth;                              // commit that state with no transition
    document.documentElement.classList.remove('usc-navin'); // hand off from the first-paint cover (no flash)
    trans.classList.remove('instant');
    requestAnimationFrame(()=>{
      trans.classList.add('parting');                    // 4) the center parts again — slower, smoother
      trans.classList.remove('cover','bar');             //    (line fades out as the panels open)
      setTimeout(()=>trans.classList.remove('show','parting'),2000);
    });
  } else { setNav(false); document.documentElement.classList.remove('usc-navin'); }
  addEventListener('pageshow',e=>{ if(e.persisted) trans.className=''; }); // bfcache back button

  /* leaving via an internal link → cover the screen, then navigate */
  let leaving=false;
  document.addEventListener('click',e=>{
    if(leaving) return;
    const a=e.target.closest('a'); if(!a) return;
    const href=a.getAttribute('href'); if(!href) return;
    if(a.target==='_blank' || href.charAt(0)==='#' || /^(https?:|mailto:|tel:)/.test(href)) return;
    let url; try{url=new URL(href, location.href);}catch(_){return;}
    if(url.origin!==location.origin) return;                        // external link → leave it
    if(/\.(?:png|jpe?g|webp|gif|svg|pdf|mp4|webm|mov|zip|docx?|xlsx?|csv)$/i.test(url.pathname)) return; // downloads
    if(url.pathname===location.pathname) return;                    // same page
    e.preventDefault(); leaving=true; setNav(true);
    if(reduce){ location.href=url.href; return; }
    trans.classList.add('show');
    void trans.offsetWidth;
    trans.classList.add('cover');                    // 1) blue panels close into the center (1.4s)
    setTimeout(()=>trans.classList.add('bar'),1700); // 2) slight pause, then 3) the line appears and grows
    setTimeout(()=>{location.href=url.href;},2650);  // navigate once the line is full → new page parts open
  });

  /* ---- logo click on home → scroll to top ---- */
  const logo=document.querySelector('.site-logo');
  if(logo && isHome){ logo.addEventListener('click',e=>{ e.preventDefault(); if(window.__lenis)window.__lenis.scrollTo(0); else scrollTo({top:0,behavior:'smooth'}); }); }

  /* ---- cookie consent + Google Analytics ---- */
  const GA_ID='G-EWBCP02LKG';                 /* GA4 Measurement ID */
  function loadGA(){
    if(GA_ID.indexOf('XXXX')>-1) return;      /* skip until a real ID is set */
    const s=document.createElement('script'); s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; function gtag(){dataLayer.push(arguments);} window.gtag=gtag;
    gtag('js',new Date()); gtag('config',GA_ID,{anonymize_ip:true});
  }
  function showCookieBanner(delay){
    const old=document.querySelector('.cookie'); if(old) old.remove();
    const c=document.createElement('div'); c.className='cookie';
    c.innerHTML='<p>We use cookies for basic site analytics to understand traffic and improve your experience. You can change this anytime.</p><div class="cbtns"><button class="dec">Decline</button><button class="ok">Accept</button></div>';
    document.body.appendChild(c);
    setTimeout(()=>c.classList.add('show'), delay||60);
    const close=()=>{c.classList.remove('show'); setTimeout(()=>c.remove(),650);};
    c.querySelector('.ok').onclick=()=>{try{localStorage.setItem('usc-consent','accepted');}catch(e){} close(); loadGA();};
    c.querySelector('.dec').onclick=()=>{try{localStorage.setItem('usc-consent','declined');}catch(e){} close();};
  }
  let consent=null; try{consent=localStorage.getItem('usc-consent');}catch(e){}
  if(consent==='accepted'){ loadGA(); }
  else if(consent!=='declined'){ showCookieBanner(600); }

  /* ---- footer contact form → emails ucirvinesolarcar@gmail.com via FormSubmit ---- */
  const cols=document.querySelectorAll('.footer-grid > div');
  if(cols.length){
    const last=cols[cols.length-1];
    if(last && /contact/i.test(last.textContent)){
      last.className='footer-contact';
      last.innerHTML='<h4>Contact</h4>'+
        '<a class="fl fl-email" href="mailto:ucirvinesolarcar@gmail.com">ucirvinesolarcar@gmail.com</a>'+
        '<form class="contact-form" action="https://formsubmit.co/ucirvinesolarcar@gmail.com" method="POST">'+
        '<input type="hidden" name="_subject" value="New message from the UCI Solar Car website">'+
        '<input type="hidden" name="_captcha" value="false">'+
        '<div class="row2"><input type="text" name="name" placeholder="Name" required><input type="email" name="email" placeholder="Email" required></div>'+
        '<input type="text" name="subject" placeholder="Subject">'+
        '<textarea name="message" placeholder="Message" required></textarea>'+
        '<button type="submit">Send</button></form>';
    }
  }

  /* ---- "Cookie settings" control in the footer (re-open the consent choice) ---- */
  const fb=document.querySelector('.footer-bottom');
  if(fb && !fb.querySelector('.cookie-settings')){
    const btn=document.createElement('button');
    btn.type='button'; btn.className='cookie-settings'; btn.textContent='Cookie settings';
    btn.addEventListener('click',()=>showCookieBanner(60));
    const meta=fb.querySelector('.meta');
    if(meta) meta.insertAdjacentElement('afterend',btn); else fb.appendChild(btn);
  }
})();
