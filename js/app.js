/* ============================================================
   THE FOREIGN EXPRESS — app.js
   Mini-backend over localStorage: DB, Auth, Admin, Chrome, Data
============================================================ */
const FE = (function(){
  const K={u:'fe_users',l:'fe_leads',r:'fe_results',s:'fe_session',a:'fe_admin',set:'fe_settings',p:'fe_progress',ap:'fe_apps',sd:'fe_seeded'};
  const R=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return (v===null||v===undefined)?d:v}catch(e){return d}};
  const W=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const DEF_SET={phone:'+91 80693 61480',email:'hello@theforeignexpress.com',
    heroTitle:'Where ambitious students<br><span>find their next campus.</span>',
    s1:'12,400+',s1l:'Students coached',s2:'4.9★',s2l:'Average rating',
    s3:'850+',s3l:'Partner universities',s4:'₹8.2 Cr',s4l:'Scholarships won',
    adminEmail:'admin@theforeignexpress.com',adminPass:'express@2026'};
  function settings(){return Object.assign({},DEF_SET,R(K.set,{}))}
  function saveSettings(p){W(K.set,Object.assign(settings(),p));chrome();}

  /* ---------- SEED DEMO DATA (first run) ---------- */
  function seed(){
    if(R(K.sd,false))return;
    const now=Date.now();
    W(K.u,[{id:uid(),name:'Aarav Mehta',email:'aarav@demo.com',phone:'+91 98765 43210',pass:'demo123',country:'United Kingdom',band:'6.5',target:'7.0',plan:'pro',created:now-86400e3*12}]);
    W(K.l,[
      {id:uid(),name:'Rohit Sharma',email:'rohit@gmail.com',phone:'+91 90000 11111',country:'United Kingdom',band:'6.0',source:'Homepage form',status:'New',owner:'Unassigned',created:now-3600e3},
      {id:uid(),name:'Priya Nair',email:'priya@gmail.com',phone:'+91 90000 22222',country:'Canada',band:'Not taken',source:'Contact page',status:'Contacted',owner:'Priya M.',created:now-86400e3},
      {id:uid(),name:'Aman Gupta',email:'aman@gmail.com',phone:'+91 90000 33333',country:'Germany',band:'6.5',source:'Writing Checker',status:'Qualified',owner:'Rahul K.',created:now-86400e3*3},
      {id:uid(),name:'Sneha Iyer',email:'sneha@gmail.com',phone:'+91 90000 44444',country:'Ireland',band:'7.0',source:'Diagnostic',status:'Applied',owner:'Priya M.',created:now-86400e3*6},
      {id:uid(),name:'Vikram Singh',email:'vikram@gmail.com',phone:'+91 90000 55555',country:'United Kingdom',band:'6.5',source:'Pro upgrade',status:'Enrolled',owner:'Rahul K.',created:now-86400e3*9}]);
    W(K.r,[
      {id:uid(),user:'aarav@demo.com',test:'R-11-1',name:'FE-11 Reading Test 1 (AC)',band:7.0,detail:'8/10 correct',created:now-86400e3*10},
      {id:uid(),user:'aarav@demo.com',test:'L-11-1',name:'FE-11 Listening Test 1 (AC)',band:6.5,detail:'7/10 correct',created:now-86400e3*7},
      {id:uid(),user:'aarav@demo.com',test:'W-11-1',name:'FE-11 Writing Test 1 (AC)',band:5.5,detail:'AI evaluated',created:now-86400e3*5},
      {id:uid(),user:'aarav@demo.com',test:'R-11-1',name:'FE-11 Reading Test 1 (AC)',band:7.5,detail:'9/10 correct',created:now-86400e3*2}]);
    W(K.p,{'aarav@demo.com':{'R-11-1':100,'L-11-1':100,'W-11-1':100}});
    W(K.ap,{'aarav@demo.com':[
      {uni:'University of Leeds',course:'MSc Data Analytics',stage:'drafting'},
      {uni:'Coventry University',course:'MSc Data Analytics',stage:'submitted'},
      {uni:'Cardiff University',course:'MSc Data Science',stage:'submitted'},
      {uni:'University of Sheffield',course:'MSc AI',stage:'offer'}]});
    W(K.sd,true);
  }

  /* ---------- DATA ---------- */
  const DESTS=[
    {k:'uk',f:'🇬🇧',n:'United Kingdom',u:'120+ Universities',t:'₹15–30L / yr',p:'2-yr work visa'},
    {k:'canada',f:'🇨🇦',n:'Canada',u:'90+ Universities',t:'₹12–25L / yr',p:'3-yr PGWP'},
    {k:'germany',f:'🇩🇪',n:'Germany',u:'60+ Universities',t:'₹0–4L / yr',p:'18-mo job seeker'},
    {k:'ireland',f:'🇮🇪',n:'Ireland',u:'40+ Universities',t:'₹12–22L / yr',p:'2-yr stay back'},
    {k:'australia',f:'🇦🇺',n:'Australia',u:'50+ Universities',t:'₹18–30L / yr',p:'2–4-yr work visa'},
    {k:'dubai',f:'🇦🇪',n:'Dubai (UAE)',u:'35+ Universities',t:'₹10–20L / yr',p:'2-yr visa'},
    {k:'italy',f:'🇮🇹',n:'Italy',u:'45+ Universities',t:'₹4–12L / yr',p:'1-yr job search'},
    {k:'uk',f:'🇺🇸',n:'United States',u:'80+ Universities',t:'₹25–45L / yr',p:'OPT 3-yr STEM'}];
  const COUNTRIES={
    uk:{short:'the UK',t:'Study in the UK',b:'One-year masters, 2-year Graduate Route work visa, and the world\'s densest cluster of ranked universities.',u:'120+',tu:'₹15–30L',w:'2 years',v:'97%',fields:'Business & Management · Computing & AI · Health & Nursing · Engineering · Law',intakes:'January · September (main) · Some May intakes'},
    canada:{short:'Canada',t:'Study in Canada',b:'Affordable tuition, 3-year post-graduation work permit, and one of the clearest PR pathways in the world.',u:'90+',tu:'₹12–25L',w:'3 years (PGWP)',v:'94%',fields:'Data & Computing · Business · Health · Hospitality · Skilled Trades',intakes:'January · May · September'},
    germany:{short:'Germany',t:'Study in Germany',b:'Public universities charge zero to minimal tuition. Strong engineering and an 18-month job-seeker visa.',u:'60+',tu:'₹0–4L',w:'18 months',v:'91%',fields:'Mechanical & Automotive Engineering · Computer Science · Renewable Energy · Management',intakes:'April · October (main)'},
    ireland:{short:'Ireland',t:'Study in Ireland',b:'European HQ of every major tech and pharma company, 2-year stay back, English-taught masters everywhere.',u:'40+',tu:'₹12–22L',w:'2 years',v:'93%',fields:'Data & AI · Pharma & Biotech · Fintech · Software · Business Analytics',intakes:'January · September'},
    australia:{short:'Australia',t:'Study in Australia',b:'2–4 year post-study work visas, strong part-time wages, and in-demand fields with migration points.',u:'50+',tu:'₹18–30L',w:'2–4 years',v:'92%',fields:'Nursing & Health · IT · Engineering · Accounting · Construction',intakes:'February · July · November'},
    dubai:{short:'Dubai',t:'Study in Dubai',b:'Close to home, tax-free part-time work, global branch campuses, and a booming job market 3 hours from India.',u:'35+',tu:'₹10–20L',w:'2 years',v:'95%',fields:'Business & Aviation · Hospitality · Engineering · Media & Design',intakes:'January · September'},
    italy:{short:'Italy',t:'Study in Italy',b:'Among Europe\'s lowest tuition, iconic design and architecture schools, and post-study job-search permits.',u:'45+',tu:'₹4–12L',w:'12 months',v:'90%',fields:'Design & Fashion · Architecture · Mechanical Engineering · Culinary & Hospitality',intakes:'September (main) · Some February'}};
  const UNIS=[
    {n:'University of Leeds',c:'UK',f:'Business',t:22,iel:6.5,r:'#75',s:'MSc Data Analytics · MSc International Business'},
    {n:'University of Sheffield',c:'UK',f:'Computing',t:24,iel:6.5,r:'#104',s:'MSc AI · MSc Software Engineering'},
    {n:'Coventry University',c:'UK',f:'Engineering',t:16,iel:6.0,r:'#601',s:'MSc Automotive · MSc Civil'},
    {n:'Cardiff University',c:'UK',f:'Business',t:20,iel:6.5,r:'#151',s:'MSc Finance · MBA'},
    {n:'University of Edinburgh',c:'UK',f:'Data & AI',t:31,iel:7.0,r:'#27',s:'MSc AI · MSc Data Science'},
    {n:'Durham University',c:'UK',f:'Business',t:26,iel:6.5,r:'#78',s:'MSc Management · MSc Finance'},
    {n:'University of Toronto',c:'Canada',f:'Data & AI',t:32,iel:7.0,r:'#21',s:'MScAC · MEng Data'},
    {n:'Seneca Polytechnic',c:'Canada',f:'Computing',t:12,iel:6.0,r:'College',s:'Diploma Cloud · BA Data Analytics'},
    {n:'University of Waterloo',c:'Canada',f:'Engineering',t:28,iel:6.5,r:'#115',s:'MEng ECE · MDataSci'},
    {n:'TU Munich',c:'Germany',f:'Engineering',t:2,iel:6.5,r:'#28',s:'MSc Mechanical · MSc Informatics'},
    {n:'RWTH Aachen',c:'Germany',f:'Engineering',t:2,iel:6.5,r:'#90',s:'MSc Automotive · MSc ME'},
    {n:'Trinity College Dublin',c:'Ireland',f:'Data & AI',t:24,iel:6.5,r:'#87',s:'MSc Computer Science · MSc Data'},
    {n:'University College Dublin',c:'Ireland',f:'Business',t:22,iel:6.5,r:'#126',s:'MSc Management · MSc FinTech'},
    {n:'University of Melbourne',c:'Australia',f:'Business',t:30,iel:7.0,r:'#13',s:'MSc Management · MFin'},
    {n:'Monash University',c:'Australia',f:'Computing',t:27,iel:6.5,r:'#37',s:'MSc AI · MSc Cybersecurity'},
    {n:'University of Wollongong Dubai',c:'Dubai',f:'Business',t:15,iel:6.0,r:'Campus',s:'MBA · MSc Logistics'},
    {n:'Politecnico di Milano',c:'Italy',f:'Engineering',t:6,iel:6.0,r:'#111',s:'MSc Architectural · MSc Management Eng'},
    {n:'Istituto Marangoni',c:'Italy',f:'Business',t:20,iel:6.0,r:'Design',s:'MA Fashion · Luxury Brand Mgmt'}];
  const SCHOL=[
    {n:'Chevening Scholarship',c:'UK',a:'Full tuition + living stipend',b:6.5,g:8,d:'Nov (annual)'},
    {n:'Commonwealth Master\'s Scholarship',c:'UK',a:'Full tuition + airfare + stipend',b:6.5,g:8,d:'Oct (annual)'},
    {n:'Government of Ireland — GOI-IES',c:'Ireland',a:'€10,000 + full fee waiver',b:6.5,g:7.5,d:'March'},
    {n:'DAAD Study Scholarships',c:'Germany',a:'€992 / month + insurance',b:6.0,g:7.5,d:'Varies by course'},
    {n:'Australia Awards Scholarship',c:'Australia',a:'Full tuition + travel + stipend',b:6.5,g:8,d:'April'},
    {n:'UOW Dubai Merit Scholarship',c:'Dubai',a:'Up to 50% tuition',b:6.0,g:7,d:'Rolling'},
    {n:'Invest Your Talent in Italy',c:'Italy',a:'€8,000 grant + internship',b:6.0,g:7.5,d:'February'}];
  const STORIES=[
    {i:'PS',n:'Priya Sharma',r:'Band 5.5 → 7.0 · University of Leeds, UK',t:'The AI coach told me exactly why my Writing was stuck at 5.5 — task response. Six weeks of targeted drills and I jumped a full band.'},
    {i:'AK',n:'Arun Kumar',r:'Band 6.0 → 7.5 · TU Munich, Germany',t:'I had no idea public universities in Germany charge almost nothing. The Express team handled my blocked account, APS and visa.'},
    {i:'SM',n:'Sana Mirza',r:'Band 6.5 → 7.5 · Trinity College Dublin, Ireland',t:'The AI Speaking Room felt awkward for two days, then magical. Hearing my own recordings next to the Band 9 model was the wake-up call I needed.'},
    {i:'RJ',n:'Rahul Jain',r:'Offer in 36 hours · Coventry University, UK',t:'I uploaded my documents on Monday evening and had a conditional offer by Wednesday morning. My previous consultant took 6 weeks for less.'},
    {i:'NP',n:'Neha Patel',r:'Band 6.0 → 7.0 · University of Toronto, Canada',t:'The mock interface is scary-real. On actual test day I was calmer than the invigilator. Readiness predictor said 82% — it was right.'},
    {i:'VD',n:'Vikram Desai',r:'Band 5.0 → 6.5 · Wollongong Dubai, UAE',t:'The study plan kept me honest — 45 minutes a day, streaks, tiny wins. Five months later I had my offer and visa.'}];
  const FAQS=[
    ['What services does The Foreign Express offer?','Everything from IELTS preparation to landing abroad: AI diagnostic and mock tests, Writing/Speaking evaluation, study plans, university shortlisting, applications, scholarships, loans, visa filing and pre-departure support — all in one account.'],
    ['How is the AI band score calculated?','Your answers are scored against the official IELTS band descriptors for each criterion. It is an AI estimate — actual exam results may vary by ±0.5 band.'],
    ['Is the test interface the same as the real exam?','It is designed to be ~90% identical to computer-based IELTS — timer, question navigator, highlight and note tools. The real interface is actually simpler.'],
    ['Which countries can I apply to?','UK, USA, Canada, Germany, Ireland, Australia, Dubai, Italy and more — with 850+ partner universities.'],
    ['Can I get a scholarship with Band 6.5?','Yes — many scholarships accept 6.5, some accept 6.0. Use the Scholarship Finder to check your exact eligibility.'],
    ['Do you charge for counselling?','No. Study-abroad counselling is completely free for students — we are compensated by partner universities.'],
    ['What happens after I land abroad?','Airport pickup coordination, accommodation help, SIM, forex, part-time job guidance and a local alumni community.'],
    ['Is my data safe?','Your test scores, recordings and documents are encrypted and never sold. See our Privacy Policy.']];

  /* ---------- AUTH ---------- */
  const users=()=>R(K.u,[]);
  const me=()=>{const e=R(K.s,null);return e?users().find(u=>u.email===e)||null:null};
  function register(d){
    if(!d.name||!d.email||!d.pass)return{ok:false,msg:'Please fill all required fields'};
    if(users().some(u=>u.email===d.email.toLowerCase()))return{ok:false,msg:'This email is already registered. Please log in.'};
    const u={id:uid(),name:d.name,email:d.email.toLowerCase(),phone:d.phone||'',pass:d.pass,country:d.country||'',band:d.band||'',target:d.target||'',plan:'free',created:Date.now()};
    W(K.u,users().concat(u));W(K.s,u.email);return{ok:true,user:u};
  }
  function login(email,pass){
    const u=users().find(x=>x.email===email.toLowerCase()&&x.pass===pass);
    if(!u)return{ok:false,msg:'Invalid email or password'};
    W(K.s,u.email);return{ok:true,user:u};
  }
  function logout(){localStorage.removeItem(K.s);location.href='index.html'}
  function requireAuth(){if(!me())location.href='login.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'dashboard.html')}
  function updateProfile(patch){const u=me();if(!u)return;const U=users();const i=U.findIndex(x=>x.email===u.email);U[i]=Object.assign(U[i],patch);W(K.u,U)}
  const isAdmin=()=>!!R(K.a,false);
  function adminLogin(email,pass){const s=settings();if(email.toLowerCase()===s.adminEmail&&pass===s.adminPass){W(K.a,true);return true}return false}
  function adminLogout(){localStorage.removeItem(K.a);location.href='index.html'}

  /* ---------- LEADS / RESULTS / PROGRESS / APPS ---------- */
  const leads=()=>R(K.l,[]);
  function saveLead(src,data){W(K.l,[Object.assign({id:uid(),source:src,status:'New',owner:'Unassigned',created:Date.now()},data)].concat(leads()));}
  function updateLead(id,patch){const L=leads();const i=L.findIndex(x=>x.id===id);if(i>-1){L[i]=Object.assign(L[i],patch);W(K.l,L)}}
  function delLead(id){W(K.l,leads().filter(x=>x.id!==id))}
  const results=()=>R(K.r,[]);
  function addResult(res){W(K.r,[Object.assign({id:uid(),user:(me()||{}).email||'guest',created:Date.now()},res)].concat(results()));}
  function delResult(id){W(K.r,results().filter(x=>x.id!==id))}
  function progress(){const all=R(K.p,{});const e=(me()||{}).email;return e?(all[e]||{}):(all['__guest']||{})}
  function setProgress(testId,pct){const all=R(K.p,{});const e=(me()||{}).email||'__guest';all[e]=all[e]||{};all[e][testId]=Math.max(all[e][testId]||0,pct);W(K.p,all)}
  function apps(){const a=R(K.ap,{});const e=(me()||{}).email;return e?(a[e]||[]):[]}
  function moveApp(i,stage){const a=R(K.ap,{});const e=(me()||{}).email;if(!e)return;a[e]=a[e]||[];if(a[e][i]){a[e][i].stage=stage;W(K.ap,a)}}
  function addApp(item){const a=R(K.ap,{});const e=(me()||{}).email;if(!e)return;a[e]=a[e]||[];a[e].push(Object.assign({stage:'drafting'},item));W(K.ap,a)}
  function delUser(email){W(K.u,users().filter(x=>x.email!==email));if(R(K.s,null)===email)localStorage.removeItem(K.s)}

  /* ---------- SITE CHROME (header + footer) ---------- */
  function chrome(){
    const s=settings();const file=(location.pathname.split('/').pop()||'index.html');
    const h=document.getElementById('site-header');
    if(h){const u=me();
      h.innerHTML=`<nav class="main rv-nav"><div class="container nav-in">
        <a href="index.html" class="logo" aria-label="The Foreign Express home"><span class="plane" aria-hidden="true">↗</span><span>The Foreign <span class="brand-last">Express</span></span></a>
        <div class="navlinks" id="primary-navigation">
          <a href="index.html#approach">Why us</a>
          <a href="ielts.html" class="${['ielts.html','diagnostic.html','tests.html','test.html','writing-checker.html','speaking-ai.html','study-plan.html','band-predictor.html'].includes(file)?'on':''}">IELTS tools</a>
          <a href="study-abroad.html" class="${['study-abroad.html','country.html','universities.html','scholarships.html','visa-support.html'].includes(file)?'on':''}">Study abroad</a>
          <a href="stories.html" class="${file==='stories.html'?'on':''}">Student stories</a>
          <a href="blog.html" class="${file==='blog.html'?'on':''}">Resources</a>
          ${u?`<a href="dashboard.html">Hi, ${esc(u.name.split(' ')[0])}</a><a href="#" onclick="FE.logout();return false">Log out</a>`:`<a href="login.html" class="${file==='login.html'?'on':''}">Log in</a>`}
          <a href="contact.html"><span class="btn btn-o btn-sm">Let's talk <span aria-hidden="true">↗</span></span></a>
        </div>
        <button class="nav-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="primary-navigation" onclick="FE.toggleMenu(this)">☰</button>
      </div></nav>`;}
    const f=document.getElementById('site-footer');
    if(f){f.innerHTML=`<footer><div class="container"><div class="fgrid">
      <div><a href="index.html" class="logo" style="color:#f7f8f1;margin-bottom:15px"><span class="plane">↗</span><span>The Foreign <span class="brand-last">Express</span></span></a><p style="font-size:12px;line-height:1.85;max-width:280px">A connected place to practise IELTS, explore universities and organise your next study-abroad steps.</p><p style="margin-top:16px;font-size:11px;color:#a2a79b">${esc(s.phone)}<br>${esc(s.email)}</p></div>
      <div><h5>STUDY ABROAD</h5>${Object.keys(COUNTRIES).map(k=>`<a href="country.html?c=${k}">Study in ${COUNTRIES[k].short}</a>`).join('')}<a href="universities.html">Find universities</a><a href="scholarships.html">Scholarships</a></div>
      <div><h5>IELTS TOOLS</h5><a href="diagnostic.html">AI Diagnostic</a><a href="tests.html">Mock Tests</a><a href="writing-checker.html">Writing Checker</a><a href="speaking-ai.html">Speaking Practice</a><a href="study-plan.html">Study Plan</a></div>
      <div><h5>DISCOVER</h5><a href="about.html">About us</a><a href="stories.html">Student stories</a><a href="blog.html">Resources</a><a href="contact.html">Contact</a></div>
      <div><h5>INFORMATION</h5><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms & Conditions</a><a href="pricing.html">Pricing</a><a href="admin.html">Admin demo</a></div>
      </div></div><div class="fbot"><div class="container">© 2026 The Foreign Express. All rights reserved. <span style="margin-left:10px">Learning tools and planning resources for your global journey.</span></div></div></footer>`;}
  }

  /* ---------- SHARED RENDERERS ---------- */
  function toggleMenu(button){
    const links=document.getElementById('primary-navigation');
    if(!links||!button)return;
    const open=links.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
    button.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
    button.textContent=open?'×':'☰';
  }
  function renderDests(id){const el=document.getElementById(id);if(!el)return;
    const photos={
      'United Kingdom':'photo-1523050854058-8df90110c9f1',
      'Canada':'photo-1517935706615-2717063c2225',
      'Germany':'photo-1467269204594-9661b134dd2b',
      'Ireland':'photo-1590089415225-401ed6f9db8e',
      'Australia':'photo-1506973035872-a4ec16b8e8d9',
      'Dubai (UAE)':'photo-1512453979798-5ea266f8880c',
      'Italy':'photo-1516483638261-f4dbaf036963',
      'United States':'photo-1485738422979-f5c462d49f74'
    };
    el.innerHTML=DESTS.map(d=>{const photo=photos[d.n]||photos['United Kingdom'];
      const src=`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=760&q=78`;
      // The supplied site has no US-specific country record yet; avoid sending that card to UK details.
      const href=d.n==='United States'?'study-abroad.html':`country.html?c=${encodeURIComponent(d.k)}`;
      return `<a class="dest" href="${href}" aria-label="Explore ${esc(d.n)}"><div class="dest-image"><img src="${src}" alt="A view representing ${esc(d.n)}" loading="lazy" decoding="async" onerror="this.style.display='none'"><span class="dest-flag" aria-hidden="true">${d.f}</span></div><div class="db"><h4>${esc(d.n)}</h4><div class="meta">${esc(d.u)} · ${esc(d.t)}</div><span class="pill">✈ ${esc(d.p)}</span></div></a>`;
    }).join('');}
  function renderStories(id,limit){const el=document.getElementById(id);if(!el)return;const list=limit?STORIES.slice(0,limit):STORIES;
    el.innerHTML=list.map(s=>`<div class="story"><div class="q">"</div><p>${s.t}</p><div class="who"><div class="avat">${s.i}</div><div><b>${s.n}</b><span>${s.r}</span></div></div></div>`).join('');}
  function renderFAQs(id){const el=document.getElementById(id);if(!el)return;
    el.innerHTML=FAQS.map(f=>`<details class="acc"><summary>${f[0]}</summary><div class="ab">${f[1]}</div></details>`).join('');}
  function renderStats(id){const el=document.getElementById(id);if(!el)return;const s=settings();
    el.innerHTML=`<div><b>${esc(s.s1)}</b><span>${esc(s.s1l)}</span></div><div><b>${esc(s.s2)}</b><span>${esc(s.s2l)}</span></div><div><b>${esc(s.s3)}</b><span>${esc(s.s3l)}</span></div><div><b>${esc(s.s4)}</b><span>${esc(s.s4l)}</span></div>`;}
  function renderHero(id){const el=document.getElementById(id);if(!el)return;let title=settings().heroTitle;if(title==='From IELTS <span>Band 6</span><br>to Your Dream Campus')title='Where ambitious students<br><span>find their next campus.</span>';el.innerHTML=title;}
  function renderUnisPage(){
    const grid=document.getElementById('ufGrid');if(!grid)return;
    const cSel=document.getElementById('ufCountry'),fSel=document.getElementById('ufField'),tSel=document.getElementById('ufTui'),bSel=document.getElementById('ufBand');
    const run=()=>{const c=cSel.value,f=fSel.value,tm=parseFloat(tSel.value),b=parseFloat(bSel.value);
      const res=UNIS.filter(u=>(c==='All'||u.c===c)&&(f==='All'||u.f===f)&&u.t<=tm&&u.iel<=b);
      document.getElementById('ufCount').textContent=res.length;
      grid.innerHTML=res.length?res.map(u=>`<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><h4>${u.n}</h4><span class="pill" style="background:#E8F0FE;color:var(--navy)">${u.c}</span></div><p><b style="color:var(--navy)">${u.r}</b> · IELTS ${u.iel}+ · ~₹${u.t}L/yr</p><p style="margin-top:6px">${u.s}</p><button class="btn btn-o btn-sm" style="margin-top:14px" onclick="FE.toast('Application started (demo) — connect backend for real submissions')">Apply via Express →</button></div>`).join(''):'<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">No matches — widen your filters or take the diagnostic 📈</div>';};
    [cSel,fSel,tSel,bSel].forEach(s=>s.addEventListener('change',run));run();}
  function renderCountryPage(){
    const key=new URLSearchParams(location.search).get('c')||'uk';const c=COUNTRIES[key]||COUNTRIES.uk;
    const tabs=document.getElementById('ctyTabs');if(tabs)tabs.innerHTML=Object.keys(COUNTRIES).map(k=>`<div class="tab ${k===key?'on':''}" onclick="location.href='country.html?c=${k}'">${COUNTRIES[k].short}</div>`).join('');
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
    set('ctyTitle',c.t);set('ctyBlurb',c.b);set('ctyUnis',c.u);set('ctyTuition',c.tu);set('ctyWork',c.w);set('ctyVisa',c.v);set('ctyFields',c.fields);set('ctyIntakes',c.intakes);set('ctyShort',c.short.replace('the ',''));}
  function renderScholarPage(){
    const btn=document.getElementById('scBtn');if(!btn)return;
    btn.addEventListener('click',()=>{const b=parseFloat(document.getElementById('scBand').value);
      const gTxt=document.getElementById('scGpa').value;const g=gTxt.startsWith('90')?9:gTxt.startsWith('80')?8:7;
      const ctry=document.getElementById('scCountry').value;
      const res=SCHOL.filter(s=>s.b<=b&&s.g<=g&&(ctry==='Any'||s.c===ctry));
      document.getElementById('scOut').innerHTML=res.length?`<div style="font-size:13.5px;color:var(--muted);margin-bottom:14px">🎯 <b style="color:var(--green)">${res.length} scholarships</b> match your profile (Band ${b}, ${gTxt}, ${ctry}):</div>`+res.map(s=>`<div class="card" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between"><div><h4>${s.n}</h4><p><b style="color:var(--green)">${s.a}</b></p><p style="font-size:12px;margin-top:4px">Deadline: ${s.d} · Min. Band ${s.b} · Min. ${s.g} CGPA</p></div><span class="pill" style="background:#E8F0FE;color:var(--navy)">${s.c}</span></div><button class="btn btn-o btn-sm" style="margin-top:12px" onclick="FE.toast('📄 Application support request sent (demo)')">Apply with Express Support →</button></div>`).join(''):'<div class="card" style="text-align:center;padding:36px;color:var(--muted)"><div style="font-size:34px">🔍</div><p style="margin-top:8px">No matches yet. Raising your band to 6.5+ typically unlocks 5+ major scholarships.</p><a href="study-plan.html" class="btn btn-o" style="margin-top:14px">Build My Study Plan</a></div>';});}

  /* ---------- ESSAY GRADER (shared by checker + engine) ---------- */
  function gradeEssay(txt){
    const words=txt.trim()?txt.trim().split(/\s+/).length:0;
    const sents=(txt.split(/[.!?]+/).filter(s=>s.trim().length>2).length)||1;
    const paras=txt.split(/\n\s*\n/).filter(p=>p.trim()).length||1;
    const avg=Math.round(words/sents);
    const links=(txt.match(/\b(however|moreover|furthermore|therefore|consequently|nevertheless|in contrast|for instance|on the other hand|as a result)\b/gi)||[]).length;
    const cl=v=>Math.max(4,Math.min(9,Math.round(v*2)/2));
    const TR=cl(5+(words>=250?1:0)+(words>=300?0.5:0)+(paras>=4?0.5:0));
    const CC=cl(5.5+(paras>=4?0.5:0)+(paras>=5?0.5:0)+(links>=4?0.5:0));
    const LR=cl(5+(avg>=15?0.5:0)+(avg>=20?0.5:0)+(links>=2?0.25:0));
    const GR=cl(5.5+(avg>=12?0.5:0)+(avg<=26?0.5:0)+(sents>=12?0.5:0));
    return{TR,CC,LR,GR,overall:Math.round((TR+CC+LR+GR)/4*2)/2,words,sents,paras,avg,links};}
  function bandFromRaw(score,total){const p=score/total;
    if(p>=1)return 9;if(p>=.9)return 8.5;if(p>=.8)return 7.5;if(p>=.7)return 7;if(p>=.6)return 6.5;if(p>=.5)return 6;if(p>=.4)return 5.5;if(p>=.3)return 5;if(p>=.2)return 4.5;return 4;}

  /* ---------- UI HELPERS ---------- */
  function toast(m){const t=document.getElementById('toast');if(!t){alert(m);return}t.textContent=m;t.classList.add('show');clearTimeout(window._tt);window._tt=setTimeout(()=>t.classList.remove('show'),2800)}
  function openModal(id){const m=document.getElementById(id);if(m)m.classList.add('show')}
  function closeModal(){document.querySelectorAll('.modal-bg').forEach(m=>m.classList.remove('show'))}

  window.addEventListener('DOMContentLoaded',()=>{seed();chrome();});

  return{settings,saveSettings,me,users,register,login,logout,requireAuth,updateProfile,isAdmin,adminLogin,adminLogout,
    leads,saveLead,updateLead,delLead,results,addResult,delResult,progress,setProgress,apps,moveApp,addApp,delUser,
    chrome,DESTS,COUNTRIES,UNIS,SCHOL,STORIES,FAQS,esc,toggleMenu,
    renderDests,renderStories,renderFAQs,renderStats,renderHero,renderUnisPage,renderCountryPage,renderScholarPage,
    gradeEssay,bandFromRaw,toast,openModal,closeModal,uid};
})();