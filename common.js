/* ============================================================
   UCI Solar Car — site-wide UI (loaded on every page)
   floating logo · recruiting button · page transitions ·
   cookie consent + Google Analytics · footer contact form
   ============================================================ */
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const isHome = (path === '' || path === 'index.html');

  /* ---- floating home logo (top-left, all pages) ---- */
  if(!document.querySelector('.site-logo')){
    const a=document.createElement('a');
    a.className='site-logo'; a.href='index.html'; a.setAttribute('aria-label','UCI Solar Car — home');
    a.innerHTML='<img src="photos/logo.png" alt="UCI Solar Car">';
    document.body.appendChild(a);
  }

  /* ---- recruiting pulse button (top-center; hidden on the Join page) ---- */
  if(path!=='join.html' && !document.querySelector('.recruit-btn')){
    const r=document.createElement('a');
    r.className='recruit-btn'; r.href='join.html';
    r.textContent='Recruiting for Fall 2026';
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
    if(/\.html($|[?#])/.test(href)){
      e.preventDefault(); leaving=true; setNav(true);
      if(reduce){ location.href=href; return; }
      trans.classList.add('show');
      void trans.offsetWidth;
      trans.classList.add('cover');                    // 1) blue panels close into the center (1.4s)
      setTimeout(()=>trans.classList.add('bar'),1700); // 2) slight pause, then 3) the line appears and grows
      setTimeout(()=>{location.href=href;},2650);      // navigate once the line is full → new page parts open
    }
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
  let consent=null; try{consent=localStorage.getItem('usc-consent');}catch(e){}
  if(consent==='accepted'){ loadGA(); }
  else if(consent!=='declined'){
    const c=document.createElement('div'); c.className='cookie';
    c.innerHTML='<p>We use cookies for basic site analytics (Google Analytics) to improve your experience.</p><div class="cbtns"><button class="dec">Decline</button><button class="ok">Accept</button></div>';
    document.body.appendChild(c);
    setTimeout(()=>c.classList.add('show'),600);
    c.querySelector('.ok').onclick=()=>{try{localStorage.setItem('usc-consent','accepted');}catch(e){} c.classList.remove('show'); loadGA();};
    c.querySelector('.dec').onclick=()=>{try{localStorage.setItem('usc-consent','declined');}catch(e){} c.classList.remove('show');};
  }

  /* ---- footer contact form → emails ucirvinesolarcar@gmail.com via FormSubmit ---- */
  const cols=document.querySelectorAll('.footer-grid > div');
  if(cols.length){
    const last=cols[cols.length-1];
    if(last && /contact/i.test(last.textContent)){
      last.className='footer-contact';
      last.innerHTML='<h4>Contact</h4>'+
        '<form class="contact-form" action="https://formsubmit.co/ucirvinesolarcar@gmail.com" method="POST">'+
        '<input type="hidden" name="_subject" value="New message from the UCI Solar Car website">'+
        '<input type="hidden" name="_captcha" value="false">'+
        '<div class="row2"><input type="text" name="name" placeholder="Name" required><input type="email" name="email" placeholder="Email" required></div>'+
        '<input type="text" name="subject" placeholder="Subject">'+
        '<textarea name="message" placeholder="Message" required></textarea>'+
        '<button type="submit">Send</button></form>';
    }
  }
})();
