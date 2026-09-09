'use strict';
// ============================================================
// BIOLOGY 7 — AAA ENGINE v4  (3D + Complex Mechanics)
// ============================================================
const B = { tool:null, ctx:null, loop:null, px:[] };

// AUDIO
function iSnd(){ if(!B.ctx){ B.ctx=new(window.AudioContext||window.webkitAudioContext)(); } if(B.ctx.state==='suspended') B.ctx.resume(); }
function tone(f1,f2,d,t='sine',v=0.28){ if(!B.ctx)return; const o=B.ctx.createOscillator(),g=B.ctx.createGain(); o.connect(g);g.connect(B.ctx.destination); o.type=t;o.frequency.setValueAtTime(f1,B.ctx.currentTime);o.frequency.exponentialRampToValueAtTime(f2,B.ctx.currentTime+d); g.gain.setValueAtTime(v,B.ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,B.ctx.currentTime+d); o.start();o.stop(B.ctx.currentTime+d+0.05); }
function noise(d=0.15,cut=700){ if(!B.ctx)return; const buf=B.ctx.createBuffer(1,B.ctx.sampleRate*d,B.ctx.sampleRate),dat=buf.getChannelData(0); for(let i=0;i<dat.length;i++)dat[i]=(Math.random()*2-1)*0.35; const s=B.ctx.createBufferSource(),f=B.ctx.createBiquadFilter(),g=B.ctx.createGain(); s.buffer=buf;f.type='lowpass';f.frequency.value=cut;s.connect(f);f.connect(g);g.connect(B.ctx.destination); g.gain.setValueAtTime(0.5,B.ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,B.ctx.currentTime+d);s.start(); }
const S={ click:()=>tone(1400,600,0.09), ok:()=>{tone(440,880,0.25,'triangle',0.2);setTimeout(()=>tone(880,1320,0.2,'triangle',0.18),180);}, err:()=>tone(180,60,0.35,'sawtooth',0.4), bounce:()=>tone(500,120,0.28,'square',0.3), water:()=>noise(0.18,550), heavy:()=>{tone(100,35,0.4,'square',0.55);noise(0.3,180);}, zap:()=>tone(1000,80,0.22,'sawtooth',0.32), grow:()=>tone(260,520,0.55,'sine',0.2) };

// PARTICLES
window.fx=function(x,y,type){
  const m={water:'#38bdf8',dirt:'#92400e',spark:'#fbbf24',green:'#10b981',blue:'#818cf8'};
  const c=m[type]||'#fff',n=type==='spark'?40:22;
  for(let i=0;i<n;i++) B.px.push({x,y,c,s:Math.random()*5+2,vx:(Math.random()-.5)*14,vy:(Math.random()-1.3)*11,g:.55,l:1,d:.018+Math.random()*.024});
};

function fxLoop(){
  const cv=document.getElementById('fx-layer'); if(!cv)return;
  const ct=cv.getContext('2d'); cv.width=window.innerWidth;cv.height=window.innerHeight;
  ct.clearRect(0,0,cv.width,cv.height);
  for(let i=B.px.length-1;i>=0;i--){
    const p=B.px[i]; p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.l-=p.d;
    if(p.l<=0){B.px.splice(i,1);continue;}
    ct.globalAlpha=p.l;ct.fillStyle=p.c;ct.beginPath();ct.arc(p.x,p.y,p.s/2,0,Math.PI*2);ct.fill();
  }
  ct.globalAlpha=1; requestAnimationFrame(fxLoop);
}

// TOAST
window.toast=function(msg,type='error'){
  let t=document.getElementById('_toast');
  if(!t){t=document.createElement('div');t.id='_toast';t.className='ai-toast';document.body.appendChild(t);}
  const ic=type==='error'?'fa-triangle-exclamation':type==='ok'?'fa-circle-check':'fa-circle-info';
  t.className='ai-toast '+type; t.innerHTML=`<i class="fa-solid ${ic}"></i><span>${msg}</span>`;
  void t.offsetWidth; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),5500);
};

// CINEMATIC END
window.cinematic=function(title,html){
  setTimeout(()=>{
    const m=document.getElementById('end-modal'); if(!m)return;
    m.querySelector('.end-title').textContent=title;
    m.querySelector('.end-body').innerHTML=html;
    m.classList.add('show'); S.ok();
  },1100);
};

// CHECK STEP
window.chk=function(id){ const e=document.getElementById('s-'+id); if(e&&!e.classList.contains('done')){e.classList.add('done');e.querySelector('i').className='fa-solid fa-circle-check';} };

// TOOL
window.grab=function(id){
  iSnd();S.click();
  document.querySelectorAll('.tool-btn').forEach(d=>d.classList.remove('on'));
  const ws=document.getElementById('workspace');
  ws.className='workspace-desk';
  if(B.tool===id){B.tool=null;return;}
  B.tool=id;
  document.getElementById('tb-'+id)?.classList.add('on');
  const cx={water:'cx-wat',seed:'cx-seed',dirt:'cx-wat',pipette:'cx-pip',weight:'cx-wgt',marker:'cx-mark'};
  if(cx[id]) ws.classList.add(cx[id]);
};

// BOOT
window.initBioLab=function(id){
  if(B.loop) clearInterval(B.loop);
  B.tool=null; B.px=[];
  const ws=document.getElementById('workspace');
  ws.innerHTML=''; ws.className='workspace-desk';
  fxLoop();
  document.body.addEventListener('click',iSnd,{once:true});
  setTimeout(()=>{ [,l1,l2,l3,l4,l5,l6][id](ws); },120);
};

// ============================================================
// LAB 1 — ECOSYSTEM 3D TERRARIUM
// ============================================================
function l1(ws){
  ws.classList.add('bg-forest');
  ws.innerHTML=`
<div style="position:absolute;left:28px;top:50%;transform:translateY(-50%);width:260px;" class="sci-panel panel-3d">
  <div class="t-orb c-blue" style="font-size:.78rem;margin-bottom:14px;">⚗️ ПАРАМЕТРЛЕР</div>
  <div class="t-jura" style="color:var(--text-dim);font-size:.8rem;margin-bottom:5px;">☀️ Жарық: <span id="v-sun" class="c-gold">0%</span></div>
  <input class="sci-slider gold" type="range" id="sl-sun" min="0" max="100" value="0" style="width:100%;margin-bottom:14px;">
  <div class="t-jura" style="color:var(--text-dim);font-size:.8rem;margin-bottom:5px;">🌡️ Температура: <span id="v-tmp" class="c-blue">20°C</span></div>
  <input class="sci-slider" type="range" id="sl-tmp" min="0" max="40" value="20" style="width:100%;margin-bottom:16px;">
  <div id="eco-status" style="font-family:'Jura';font-size:.8rem;color:var(--text-dim);padding:10px;background:rgba(255,255,255,.03);border-radius:8px;border:1px solid rgba(255,255,255,.06);min-height:50px;"></div>
  <div class="checklist" style="margin-top:14px;">
    <div class="check-item" id="s-dirt"><i class="fa-regular fa-circle"></i> Топырақ салу</div>
    <div class="check-item" id="s-seed"><i class="fa-regular fa-circle"></i> Тұқым егу</div>
    <div class="check-item" id="s-water"><i class="fa-regular fa-circle"></i> Суару (3 рет)</div>
    <div class="check-item" id="s-cond"><i class="fa-regular fa-circle"></i> Жарық+Температура қою</div>
  </div>
</div>

<div class="sphere-3d" id="bsph" style="margin-left:60px;">
  <div class="sphere-highlight"></div>
  <div class="sphere-soil" id="bsoil"></div>
  <div class="sphere-water-layer" id="bwater"></div>
  <svg id="bsvg" viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%;z-index:4;overflow:visible;pointer-events:none;">
    <path id="bstem" d="M50 100 C 30 75 70 55 45 30 C 35 18 55 10 50 0"
      fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round"
      stroke-dasharray="250" stroke-dashoffset="250"
      style="transition:stroke-dashoffset 3s ease;filter:drop-shadow(0 0 8px #10b981)"/>
    <ellipse id="bleaf" cx="45" cy="30" rx="0" ry="0" fill="#22c55e" opacity=".85"
      style="transition:rx .8s 1.5s,ry .8s 1.5s;filter:drop-shadow(0 0 6px #16a34a)"/>
    <circle id="bflw" cx="50" cy="0" r="0" fill="#fbbf24"
      style="transition:r .6s 2.8s;filter:drop-shadow(0 0 14px #fbbf24)"/>
  </svg>
  <div class="sphere-fog" id="bfog"></div>
</div>

<div style="position:absolute;right:28px;top:50%;transform:translateY(-50%);width:200px;display:flex;flex-direction:column;gap:16px;">
  <div class="sci-panel" style="text-align:center;">
    <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;margin-bottom:8px;">💧 ЫЛҒАЛ ДЕҢГЕЙІ</div>
    <div class="bar-wrap"><div class="bar-fill bar-blue" id="bar-w" style="width:0%"></div></div>
    <div class="t-orb" id="v-wlvl" style="font-size:1.4rem;margin-top:8px;color:var(--neon-b);">0%</div>
  </div>
  <div class="sci-panel" style="text-align:center;">
    <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;margin-bottom:8px;">🌱 ӨСУ</div>
    <div class="bar-wrap"><div class="bar-fill bar-green" id="bar-g" style="width:0%"></div></div>
    <div class="t-orb" id="v-grow" style="font-size:1.4rem;margin-top:8px;color:var(--neon-g);">0%</div>
  </div>
</div>`;

  const E={dirt:0,seed:0,water:0,sun:0,tmp:20,moisture:0,growth:0,done:false};
  const setStatus=t=>document.getElementById('eco-status').textContent=t;

  document.getElementById('sl-sun').oninput=function(){ E.sun=+this.value; document.getElementById('v-sun').textContent=E.sun+'%'; document.getElementById('bsph').style.boxShadow=`0 0 ${E.sun*.8}px rgba(251,191,36,${E.sun/200}),inset -30px -30px 60px rgba(0,0,0,.6),inset 30px 30px 60px rgba(56,189,248,.08),0 60px 100px rgba(0,0,0,.9)`; tick(); };
  document.getElementById('sl-tmp').oninput=function(){ E.tmp=+this.value; document.getElementById('v-tmp').textContent=E.tmp+'°C'; tick(); };

  ws.addEventListener('click',function(e){
    if(!B.tool||E.done)return; iSnd();
    const sp=document.getElementById('bsph').getBoundingClientRect();
    const cx=sp.left+sp.width/2,cy=sp.top+sp.height/2;
    if(Math.hypot(e.clientX-cx,e.clientY-cy)>sp.width/2)return;
    if(B.tool==='dirt'&&!E.dirt){S.heavy();fx(e.clientX,e.clientY,'dirt');E.dirt=1;document.getElementById('bsoil').style.height='34%';chk('dirt');setStatus('Топырақ қосылды. Тұқым егіңіз.');}
    else if(B.tool==='seed'&&E.dirt&&!E.seed){S.click();fx(e.clientX,e.clientY,'green');E.seed=1;chk('seed');setStatus('Тұқым егілді! Суарыңыз (3 рет).');}
    else if(B.tool==='water'&&E.seed){E.water=Math.min(E.water+1,5);E.moisture=Math.min(E.moisture+28,100);S.water();fx(e.clientX,e.clientY,'water');document.getElementById('bwater').style.height=E.moisture*0.3+'%';document.getElementById('bwater').style.opacity='1';if(E.water>=3)chk('water');if(E.water>4){document.getElementById('bfog').style.opacity='1';S.err();toast('Артық су! Тамырлар шіри бастады. Суаруды тоқтатыңыз.','error');setTimeout(()=>document.getElementById('bfog').style.opacity='0',3500);}else tick();}
    else if(B.tool==='seed'&&!E.dirt){toast('Алдымен 🪣 топырақ салыңыз!','error');S.bounce();}
    else if(B.tool==='water'&&!E.seed){toast('Тұқым жоқ! Алдымен 🫘 тұқым егіңіз.','error');S.bounce();}
  });

  function tick(){
    const ok=E.sun>=30&&E.tmp>=15&&E.tmp<=30;
    if(ok&&!document.getElementById('s-cond').classList.contains('done'))chk('cond');
    if(!ok&&E.sun<30) setStatus('☀️ Жарықты арттырыңыз (30%+)');
    if(!ok&&(E.tmp<15||E.tmp>30)) setStatus('🌡️ Температура 15-30°C болуы керек');
  }

  B.loop=setInterval(()=>{
    if(E.done)return;
    E.moisture=Math.max(0,E.moisture-0.4-(E.tmp>25?(E.tmp-25)*0.15:0));
    document.getElementById('bar-w').style.width=E.moisture+'%';
    document.getElementById('v-wlvl').textContent=Math.round(E.moisture)+'%';
    if(E.seed&&E.moisture>15&&E.sun>=30&&E.tmp>=15&&E.tmp<=30&&E.water>=3&&E.water<=4){
      E.growth=Math.min(E.growth+1.2,100);
      document.getElementById('bar-g').style.width=E.growth+'%';
      document.getElementById('v-grow').textContent=Math.round(E.growth)+'%';
      document.getElementById('bstem').style.strokeDashoffset=250-(250*E.growth/100);
      if(E.growth>50){document.getElementById('bleaf').setAttribute('rx','14');document.getElementById('bleaf').setAttribute('ry','8');}
      if(E.growth>=100){
        E.done=true;clearInterval(B.loop);S.grow();
        document.getElementById('bflw').setAttribute('r','11');
        cinematic('БИОСФЕРА ТИІМДІ ЖҰМЫС ІСТЕЙДІ','Биотикалық (өсімдік) және абиотикалық факторлар (су <b>'+Math.round(E.moisture)+'%</b>, жарық <b>'+E.sun+'%</b>, <b>'+E.tmp+'°C</b>) тепе-теңдікте болғанда ғана тұйық экожүйе қалыптасады.');
      }
    }
  },250);

  toast('🪣 Топырақ → 🫘 Тұқым → 🚿 Суару (3x) → ☀️ Жарық + 🌡️ Température баптаңыз','info');
}

// ============================================================
// LAB 2 — TAXONOMY 3D (5 levels, multiple organisms)
// ============================================================
function l2(ws){
  ws.classList.add('bg-digital');
  const taxa=[
    {id:'t1',icon:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M50 90 Q30 70 30 40 Q50 30 50 60 Q70 40 70 60 Q50 80 50 90Z" fill="#10b981"/><path d="M50 90 L50 60" stroke="#047857" stroke-width="4" stroke-linecap="round"/></svg>',name:'ӨСІМДІКТЕР',slot:'sl-kingdom',level:'Патшалық',hint:'Ең үлкен топ'},
    {id:'t2',icon:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="15" fill="#f59e0b"/><path d="M50 15 C60 15 65 30 50 35 C35 30 40 15 50 15 Z" fill="#ec4899"/><path d="M50 85 C60 85 65 70 50 65 C35 70 40 85 50 85 Z" fill="#ec4899"/><path d="M85 50 C85 60 70 65 65 50 C70 35 85 40 85 50 Z" fill="#ec4899"/><path d="M15 50 C15 60 30 65 35 50 C30 35 15 40 15 50 Z" fill="#ec4899"/></svg>',name:'ЖАБЫҚ ТҰҚЫМДЫЛАР',slot:'sl-division',level:'Бөлім',hint:'Тұқымы жабық'},
    {id:'t3',icon:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M50 90 Q10 50 45 20 Q50 30 50 60 Z" fill="#10b981"/><path d="M50 90 Q90 50 55 20 Q50 30 50 60 Z" fill="#34d399"/><path d="M50 90 L50 50" stroke="#047857" stroke-width="3"/></svg>',name:'ҚОСЖАРНАҚТЫЛАР',slot:'sl-class',level:'Класс',hint:'2 жарнақ'},
    {id:'t4',icon:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="30" fill="#e11d48"/><path d="M50 20 Q70 20 70 40 Q50 60 30 40 Q30 20 50 20" fill="#be123c"/><path d="M40 80 L40 100 M60 80 L60 100 M50 75 L50 100" stroke="#15803d" stroke-width="4" stroke-linecap="round"/></svg>',name:'РАУШАН ТӘРІЗДІЛЕР',slot:'sl-order',level:'Отряд',hint:'Гүлді өсімдіктер'},
    {id:'t5',icon:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="20" fill="#451a03"/><circle cx="50" cy="50" r="28" fill="none" stroke="#f59e0b" stroke-width="8" stroke-dasharray="10 6"/><circle cx="50" cy="50" r="38" fill="none" stroke="#fcd34d" stroke-width="8" stroke-dasharray="12 8"/></svg>',name:'КҮНБАҒЫС',slot:'sl-species',level:'Түр',hint:'Самостоятельный вид'},
  ];
  ws.innerHTML=`
<div style="display:flex;gap:60px;align-items:center;justify-content:center;width:100%;">
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:4px;text-align:center;">ИЕРАРХИЯ КЕСТЕСІ</div>
    ${taxa.map(t=>`<div class="tax-slot-3d" id="${t.slot}" data-hint="${t.level}: ${t.hint}" data-target="${t.id}">
      <i class="fa-solid fa-circle-dashed" style="color:rgba(56,189,248,.3);"></i>
      <span>${t.level}</span>
    </div>`).join('')}
  </div>
  <div id="card-pool" style="display:flex;flex-direction:column;gap:12px;">
    ${taxa.map(t=>`<div class="tax-card-3d" id="${t.id}" draggable="true" data-target="${t.slot}">
      <div class="card-face"><span style="font-size:1.8rem;">${t.icon}</span><span>${t.name}</span></div>
    </div>`).join('')}
  </div>
</div>
<div class="sci-panel" style="position:absolute;bottom:90px;left:50%;transform:translateX(-50%);display:flex;gap:20px;padding:14px 28px;">
  ${taxa.map((t,i)=>`<div class="check-item" id="s-tx${i+1}"><i class="fa-regular fa-circle"></i> ${t.level}</div>`).join('')}
</div>`;

  let ok=0;
  document.querySelectorAll('.tax-card-3d').forEach(c=>{
    c.addEventListener('dragstart',e=>{e.dataTransfer.effectAllowed='move';c.style.opacity='.5';iSnd();S.click();});
    c.addEventListener('dragend',()=>c.style.opacity='1');
  });
  document.querySelectorAll('.tax-slot-3d').forEach(slot=>{
    slot.addEventListener('dragover',e=>{e.preventDefault();slot.style.borderColor='var(--neon-b)';slot.style.background='rgba(56,189,248,.08)';});
    slot.addEventListener('dragleave',()=>{slot.style.borderColor='';slot.style.background='';});
    slot.addEventListener('drop',e=>{
      e.preventDefault(); slot.style.borderColor='';slot.style.background='';
      const cardId=e.dataTransfer.getData('text')||document.querySelector('.tax-card-3d[style*="opacity: 0.5"]')?.id;
      const card=document.getElementById(cardId||'');
      if(!card||slot.classList.contains('filled'))return;
      if(card.dataset.target===slot.id){
        const idx=taxa.findIndex(t=>t.slot===slot.id);
        slot.innerHTML=`<i class="fa-solid fa-circle-check" style="color:var(--neon-g)"></i><b style="color:#fff;font-family:'Jura'">${taxa[idx].icon} ${taxa[idx].name}</b>`;
        slot.classList.add('filled'); card.style.display='none';
        S.ok(); ok++; chk('tx'+(idx+1));
        const r=slot.getBoundingClientRect(); fx(r.left+r.width/2,r.top+r.height/2,'spark');
        if(ok===5) cinematic('ӨСІМДІКТЕР ЖҮЙЕСІ ТОЛЫҚ АНЫҚТАЛДЫ','<b>Патшалық → Бөлім → Класс → Отряд → Түр</b><br><br>Бұл жүйелеу Карл Линней ұсынған <b>бинарлы номенклатура</b> принципіне негізделген. Биологияда жүйелеу ірі топтан ұсаққа қарай жүреді.');
      } else { S.bounce(); toast(`Қате! ${slot.querySelector('span').textContent} ұяшығына дұрыс карточка апарыңыз.`,'error'); }
    });
    // allow text data
    slot.addEventListener('drop',e=>{ if(!e.dataTransfer.getData('text')){ const active=document.querySelector('.tax-card-3d[style*="0.5"]'); if(active) active.dispatchEvent(new DragEvent('drop',e)); }},true);
  });
  // fix dataTransfer
  document.querySelectorAll('.tax-card-3d').forEach(c=>{ c.addEventListener('dragstart',e=>e.dataTransfer.setData('text',c.id)); });

  toast('Карточкаларды сүйреп дұрыс деңгейге апарыңыз (5 деңгей!)','info');
}

// ============================================================
// LAB 3 — CHEMISTRY (4 reactions)
// ============================================================
function l3(ws){
  ws.classList.add('bg-lab');
  ws.innerHTML=`
<div style="display:flex;flex-direction:column;align-items:center;gap:30px;width:100%;">
  <div style="display:flex;gap:40px;align-items:flex-end;justify-content:center;">

    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
      <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;">КАРТОП үлгісі</div>
      <div id="obj-potato" class="chem-object" style="width:180px;height:110px;
        background:radial-gradient(ellipse at 35% 30%,#fde68a,#b45309);
        border-radius:42% 58% 55% 45%/38% 50% 60% 40%;
        box-shadow:0 20px 50px rgba(0,0,0,.8),inset -10px -10px 25px rgba(0,0,0,.4);
        display:flex;justify-content:center;align-items:center;
        font-family:'Orbitron';font-size:1rem;color:#451a03;overflow:hidden;">
        КАРТОП
        <div id="iodine-stain" class="stain-overlay" style="background:radial-gradient(circle,#1d4ed8,#0f172a 60%,transparent);"></div>
      </div>
      <div id="lbl-potato" class="t-jura" style="color:var(--text-dim);font-size:.78rem;">Крахмал бар ма?</div>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
      <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;">ТҰҚЫМ үлгісі</div>
      <div style="position:relative;width:190px;height:190px;
        background:radial-gradient(circle at 35% 35%,rgba(255,255,255,.9),rgba(200,200,200,.6));
        border-radius:50%;box-shadow:0 20px 45px rgba(0,0,0,.5),inset 0 0 30px rgba(0,0,0,.1);
        display:flex;justify-content:center;align-items:center;">
        <div id="obj-seed" class="chem-object" style="width:36px;height:56px;background:#1e293b;border-radius:50%;box-shadow:0 8px 20px rgba(0,0,0,.6);z-index:2;"></div>
        <div id="oil-stain" style="position:absolute;width:110px;height:110px;border-radius:50%;
          background:radial-gradient(circle,rgba(254,240,138,.85),transparent 70%);
          filter:blur(10px);opacity:0;transition:opacity 1.2s;mix-blend-mode:multiply;"></div>
      </div>
      <div id="lbl-seed" class="t-jura" style="color:var(--text-dim);font-size:.78rem;">Май (Липид) бар ма?</div>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
      <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;">ET үлгісі (ақуыз)</div>
      <div id="obj-egg" class="chem-object" style="width:120px;height:150px;
        background:radial-gradient(ellipse at 40% 30%,rgba(255,255,255,.95),rgba(220,220,210,.8));
        border-radius:50% 50% 55% 45%/60% 60% 40% 40%;
        box-shadow:0 20px 45px rgba(0,0,0,.7),inset -8px -8px 20px rgba(0,0,0,.15);
        display:flex;justify-content:center;align-items:center;overflow:hidden;">
        <div id="biuret-stain" class="stain-overlay" style="background:radial-gradient(circle,#7c3aed,transparent 65%);"></div>
      </div>
      <div id="lbl-egg" class="t-jura" style="color:var(--text-dim);font-size:.78rem;">Ақуыз бар ма?</div>
    </div>

  </div>

  <div class="sci-panel" style="display:flex;gap:24px;padding:14px 28px;">
    <div class="check-item" id="s-c1"><i class="fa-regular fa-circle"></i> Крахмал (Йод)</div>
    <div class="check-item" id="s-c2"><i class="fa-regular fa-circle"></i> Липид (Пресс)</div>
    <div class="check-item" id="s-c3"><i class="fa-regular fa-circle"></i> Ақуыз (Биурет)</div>
  </div>
</div>`;

  const done={c1:false,c2:false,c3:false};
  ws.addEventListener('click',function(e){
    iSnd(); const t=e.target;
    if(B.tool==='pipette'){
      if(document.getElementById('obj-potato').contains(t)||t.id==='obj-potato'){
        if(done.c1)return; S.water();fx(e.clientX,e.clientY,'water');
        const s=document.getElementById('iodine-stain'); s.style.width='130px';s.style.height='130px';
        document.getElementById('lbl-potato').textContent='✅ КРАХМАЛ анықталды (Көк-күлгін)';
        document.getElementById('lbl-potato').style.color='var(--neon-g)';
        done.c1=true;chk('c1');tryEnd();
      } else if(document.getElementById('obj-egg').contains(t)||t.id==='obj-egg'){
        // Biuret test — iodine is wrong tool but let's allow pipette as "reagent"
        toast('Ақуызға Биурет реагенті керек! 🧪 Басқа пипетканы таңдаңыз. (Бұл — йод)','error');S.bounce();
      } else { toast('Йод индикаторын тек КАРТОПҚА қолданыңыз.','error');S.bounce(); }
    } else if(B.tool==='weight'){
      if(document.getElementById('obj-seed').contains(t)||t.id==='obj-seed'){
        if(done.c2)return; S.heavy();fx(e.clientX,e.clientY,'dirt');
        document.getElementById('obj-seed').style.transform='scaleX(3.8) scaleY(0.1)';
        document.getElementById('oil-stain').style.opacity='1';
        document.getElementById('lbl-seed').textContent='✅ ЛИПИД (май) анықталды';
        document.getElementById('lbl-seed').style.color='var(--neon-g)';
        done.c2=true;chk('c2');tryEnd();
      } else { toast('Гравитация прессін тек ТҰҚЫМҒА қолданыңыз.','error');S.bounce(); }
    } else if(B.tool==='marker'){
      // marker = Biuret reagent
      if(document.getElementById('obj-egg').contains(t)||t.id==='obj-egg'){
        if(done.c3)return; S.water();fx(e.clientX,e.clientY,'blue');
        const s=document.getElementById('biuret-stain'); s.style.width='100px';s.style.height='120px';
        document.getElementById('lbl-egg').textContent='✅ АҚУЫЗ анықталды (Күлгін)';
        document.getElementById('lbl-egg').style.color='var(--neon-g)';
        done.c3=true;chk('c3');tryEnd();
      } else { toast('Биурет реагентін тек ЖҰМЫРТҚАҒА қолданыңыз.','error');S.bounce(); }
    } else if(B.tool){ toast('Бұл объект үшін қолайлы реагент таңдаңыз.','error'); }
  });
  function tryEnd(){ if(done.c1&&done.c2&&done.c3) cinematic('ОРГАНИКАЛЫҚ ЗАТТАР ДӘЛЕЛДЕНДІ','🔵 Картоп + Йод → <b>Крахмал</b> (Полисахарид)<br>🟡 Тұқым + Пресс → <b>Липид</b> (Май)<br>🟣 Жұмыртқа + Биурет → <b>Ақуыз</b> (Протеин)<br><br>Осы үш органикалық зат тірі жасушаның негізін құрайды.'); }
  toast('💉 Йод→Картоп | 🏋️ Пресс→Тұқым | 🖍️ Биурет→Жұмыртқа (3 реакция!)','info');
}

// ============================================================
// LAB 4 — MICROSCOPE (drag pan + scroll zoom + cambium)
// ============================================================
function l4(ws){
  ws.classList.add('bg-micro');
  ws.innerHTML=`
<div style="display:flex;gap:50px;align-items:center;justify-content:center;">

  <div class="micro-body">
    <div class="micro-lens" id="mlens">
      <div id="mslide" class="micro-slide"
        style="background:radial-gradient(circle,
          #fde68a 0 17%,#ca8a04 17% 38%,
          #16a34a 38% 43%,#10b981 43% 48%,
          #15803d 48% 53%,
          #7c2d12 53% 78%,#1c0a03 78% 100%);"></div>
      <div class="lens-vignette"></div>
      <div class="crosshair-h"></div>
      <div class="crosshair-v"></div>
      <div class="cambium-hint" id="camhint"></div>
    </div>
    <div style="width:380px;height:18px;background:linear-gradient(90deg,#1e3a5f,#0f172a,#1e3a5f);margin-top:2px;border-radius:0 0 4px 4px;"></div>
  </div>

  <div style="display:flex;flex-direction:column;gap:16px;width:240px;">
    <div class="sci-panel panel-3d">
      <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:12px;">🔬 ФОКУС ВИНТІ</div>
      <input class="sci-slider" type="range" id="sl-focus" min="0" max="100" value="0" style="width:100%;">
      <div class="val-display c-gold" id="v-focus" style="font-size:1.6rem;margin-top:8px;">0%</div>
      <div class="bar-wrap" style="margin-top:6px;"><div class="bar-fill bar-blue" id="bar-focus" style="width:0%"></div></div>
    </div>
    <div class="sci-panel panel-3d">
      <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:12px;">🔍 ZOOM</div>
      <input class="sci-slider green" type="range" id="sl-zoom" min="1" max="4" step="1" value="1" style="width:100%;">
      <div class="val-display c-green" id="v-zoom" style="font-size:1.6rem;margin-top:8px;">10x</div>
    </div>
    <div class="sci-panel">
      <div class="checklist">
        <div class="check-item" id="s-m1"><i class="fa-regular fa-circle"></i> Линзаны фокустау</div>
        <div class="check-item" id="s-m2"><i class="fa-regular fa-circle"></i> 40x зум орнату</div>
        <div class="check-item" id="s-m3"><i class="fa-regular fa-circle"></i> Камбий табу</div>
      </div>
    </div>
  </div>
</div>`;

  const slide=document.getElementById('mslide'),lens=document.getElementById('mlens');
  const hint=document.getElementById('camhint');
  let blur=14,zoom=1,px=0,py=0,mx=0,my=0,drag=false;
  let focused=false,zoomed=false,found=false;

  document.getElementById('sl-focus').oninput=function(){
    const v=+this.value; document.getElementById('v-focus').textContent=v+'%'; document.getElementById('bar-focus').style.width=v+'%';
    blur=(v<52?((52-v)*0.55):(v>68?((v-68)*0.5):0));
    slide.style.filter=`blur(${blur}px)`;
    if(!focused&&blur<0.5){focused=true;chk('m1');hint.classList.add('show');toast('Анық! Камбий сақинасы пайда болды. 40x зум орнатыңыз.','ok');S.ok();}
  };

  document.getElementById('sl-zoom').oninput=function(){
    zoom=+this.value; const labels=['','10x','20x','40x','100x'];
    document.getElementById('v-zoom').textContent=labels[zoom];
    slide.style.transform=`translate(-50%,-50%) scale(${zoom})`;
    if(zoom>=3&&!zoomed){zoomed=true;chk('m2');toast('40x зум! Енді Камбий (жасыл сақина) шертіңіз.','ok');}
  };

  slide.addEventListener('mousedown',e=>{drag=true;slide.style.cursor='grabbing';mx=e.clientX;my=e.clientY;e.preventDefault();});
  window.addEventListener('mousemove',e=>{if(!drag)return;px+=e.clientX-mx;py+=e.clientY-my;mx=e.clientX;my=e.clientY;slide.style.left=`calc(50% + ${px}px)`;slide.style.top=`calc(50% + ${py}px)`;});
  window.addEventListener('mouseup',()=>{drag=false;slide.style.cursor='grab';});

  slide.addEventListener('click',e=>{
    if(found)return; iSnd();
    if(blur>1){toast('Бейне анық емес. Фокус винтін 52–68 аралығына бұраңыз.','error');S.bounce();return;}
    if(zoom<3){toast('Зум жеткіліксіз! 40x орнатыңыз.','error');S.bounce();return;}
    const r=slide.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    const d=Math.hypot(e.clientX-cx,e.clientY-cy),pct=d/(r.width/2);
    if(pct>=0.40&&pct<=0.52){
      found=true; S.ok(); chk('m3');
      hint.style.borderColor='rgba(251,191,36,.9)'; hint.style.boxShadow='0 0 30px rgba(251,191,36,.7),inset 0 0 20px rgba(251,191,36,.1)';
      fx(e.clientX,e.clientY,'spark');
      cinematic('КАМБИЙ АНЫҚТАЛДЫ','🟢 Камбий — ағаш сабағын <b>радиалды бағытта өсіретін</b> тірі жасушалар қабаты.<br><br>Камбий жасушалары митоздың нәтижесінде бөлініп, <b>Флоэма</b> (ішке) және <b>Ксилема</b> (сыртқа) жасушаларын түзеді.');
    } else if(pct<0.40){toast('Бұл — Сүрек (Ксилема). Су тасымалдайды. Жасыл сақинаға жабыңыз.','error');S.bounce();}
    else if(pct>0.52&&pct<0.7){toast('Бұл — Флоэма (Луб). Қоректік зат тасымалдайды.','error');S.bounce();}
    else{toast('Бұл — Қабық (Перидерма). Одан ішке қарай жылжыңыз.','error');S.bounce();}
  });

  toast('1) Фокус (52-68%) → 2) Зум 40x → 3) Жасыл сақинаны (Камбий) шертіңіз','info');
}

// ============================================================
// LAB 5 — FOOD WEB (5 organisms, energy %)
// ============================================================
function l5(ws){
  ws.classList.add('bg-chain');
  const nodes=[
    {id:'n-sun' ,e:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="25" fill="#f59e0b"/><path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M18 82 L25 75 M75 18 L82 25" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/></svg>',lbl:'Күн',     x:'13%',y:'48%',c:'#fbbf24',t:'source'},
    {id:'n-plant',e:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M50 90 Q30 70 30 40 Q50 30 50 60 Q70 40 70 60 Q50 80 50 90Z" fill="#10b981"/><path d="M50 90 L50 60" stroke="#047857" stroke-width="4" stroke-linecap="round"/></svg>',lbl:'Өсімдік',x:'30%',y:'48%',c:'#10b981',t:'plant'},
    {id:'n-rab',  e:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><ellipse cx="50" cy="65" rx="30" ry="20" fill="#e2e8f0"/><circle cx="35" cy="45" r="15" fill="#e2e8f0"/><path d="M25 35 Q30 10 40 15 Q40 25 35 35" fill="#cbd5e1"/><path d="M35 35 Q40 10 50 15 Q50 25 45 35" fill="#cbd5e1"/><circle cx="75" cy="60" r="8" fill="#f8fafc"/></svg>',lbl:'Қоян',   x:'50%',y:'28%',c:'#38bdf8',t:'rabbit'},
    {id:'n-fox',  e:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M20 40 L50 80 L80 40 Z" fill="#f97316"/><path d="M20 40 L30 15 L45 35 Z" fill="#ea580c"/><path d="M80 40 L70 15 L55 35 Z" fill="#ea580c"/><path d="M40 80 L50 90 L60 80 Z" fill="#1c1917"/><circle cx="35" cy="50" r="4" fill="#fff"/><circle cx="65" cy="50" r="4" fill="#fff"/></svg>',lbl:'Түлкі',  x:'70%',y:'48%',c:'#f97316',t:'fox'},
    {id:'n-eagle',e:'<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill="#3f3f46"/><path d="M70 50 Q90 40 95 60 Q80 70 70 50 Z" fill="#fef08a"/><circle cx="35" cy="45" r="3" fill="#fff"/></svg>',lbl:'Бүркіт', x:'50%',y:'68%',c:'#c084fc',t:'eagle'},
  ];
  const valid=['source-plant','plant-rabbit','plant-eagle','rabbit-fox','fox-eagle'];
  const stepMap={'source-plant':'e1','plant-rabbit':'e2','plant-eagle':'e3','rabbit-fox':'e4','fox-eagle':'e5'};

  ws.innerHTML=`
<svg id="csvg" width="100%" height="100%" style="position:absolute;inset:0;pointer-events:none;overflow:visible;"></svg>
${nodes.map(n=>`<div class="bio-node-3d" id="${n.id}" data-t="${n.t}"
  style="left:${n.x};top:${n.y};transform:translate(-50%,-50%);border:2px solid ${n.c};box-shadow:0 0 25px ${n.c}44;">
  <div class="node-ring" style="color:${n.c};"></div>
  ${n.e}<span>${n.lbl}</span></div>`).join('')}
<div class="sci-panel" style="position:absolute;right:28px;top:50%;transform:translateY(-50%);width:220px;">
  <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:10px;">БАЙЛАНЫСТАР</div>
  <div class="checklist">
    <div class="check-item" id="s-e1"><i class="fa-regular fa-circle"></i> Күн → Өсімдік</div>
    <div class="check-item" id="s-e2"><i class="fa-regular fa-circle"></i> Өсімдік → Қоян</div>
    <div class="check-item" id="s-e3"><i class="fa-regular fa-circle"></i> Өсімдік → Бүркіт</div>
    <div class="check-item" id="s-e4"><i class="fa-regular fa-circle"></i> Қоян → Түлкі</div>
    <div class="check-item" id="s-e5"><i class="fa-regular fa-circle"></i> Түлкі → Бүркіт</div>
  </div>
</div>
<div class="t-jura" style="position:absolute;bottom:90px;left:28px;color:var(--text-dim);font-size:.8rem;max-width:300px;line-height:1.6;">
  💡 Энергия әрдайым бір бағытта ағады.<br>Әр деңгейде <b style="color:var(--neon-gold);">90% энергия жоғалады</b>.
</div>`;

  const svg=document.getElementById('csvg');
  const connected=new Set();
  let from=null,draft=null;

  function getC(id){ const r=document.getElementById(id).getBoundingClientRect(),sr=svg.getBoundingClientRect(); return{x:r.left+r.width/2-sr.left,y:r.top+r.height/2-sr.top}; }

  document.querySelectorAll('.bio-node-3d').forEach(nd=>{
    nd.addEventListener('mousedown',e=>{
      e.stopPropagation(); iSnd();S.zap(); from=nd;
      const c=getC(nd.id);
      draft=document.createElementNS('http://www.w3.org/2000/svg','path');
      draft.setAttribute('class','energy-path eflow'); draft.setAttribute('stroke','var(--neon-b)');
      draft.setAttribute('d',`M${c.x},${c.y}`); svg.appendChild(draft);
    });
  });
  window.addEventListener('mousemove',e=>{
    if(!draft||!from)return;
    const sr=svg.getBoundingClientRect(),c=getC(from.id),ex=e.clientX-sr.left,ey=e.clientY-sr.top;
    draft.setAttribute('d',`M${c.x},${c.y} Q${(c.x+ex)/2},${Math.min(c.y,ey)-60} ${ex},${ey}`);
  });
  window.addEventListener('mouseup',e=>{
    if(!draft||!from){draft=null;from=null;return;}
    let landed=null;
    document.querySelectorAll('.bio-node-3d').forEach(nd=>{ if(nd===from)return; const r=nd.getBoundingClientRect(); if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom) landed=nd; });
    if(landed){
      const key=from.dataset.t+'-'+landed.dataset.t;
      const rkey=landed.dataset.t+'-'+from.dataset.t;
      if(connected.has(key)){toast('Байланыс бар!','info');draft.remove();}
      else if(valid.includes(key)){
        connected.add(key); S.ok(); draft.setAttribute('class','energy-path eflow');
        const fc=getC(from.id),tc=getC(landed.id); draft.setAttribute('stroke',from.style.borderColor||'var(--neon-g)');
        draft.setAttribute('d',`M${fc.x},${fc.y} Q${(fc.x+tc.x)/2},${Math.min(fc.y,tc.y)-70} ${tc.x},${tc.y}`);
        draft.setAttribute('stroke-width','5');
        chk(stepMap[key]); fx(e.clientX,e.clientY,'spark');
        if(connected.size===valid.length) cinematic('ҚОРЕКТІК ТЕЖ АЯҚТАЛДЫ','☀️→🌿(100%)→🐇(10%)→🦊(1%)→🦅(0.1%)<br>🌿→🦅 тура байланысы да бар!<br><br>Бұл — <b>Тірі ағзалардың қоректену желісі (Food Web)</b>. Энергияның 90% әр деңгейде жылу түрінде жоғалады <b>(10% ережесі)</b>.');
      } else if(valid.includes(rkey)){
        S.err(); toast(`Қате бағыт! Энергия кері ақпайды: ${landed.querySelector('span').textContent} → ${from.querySelector('span').textContent}  мүмкін емес.`,'error');
        draft.setAttribute('stroke','var(--neon-r)'); setTimeout(()=>draft.remove(),800);
      } else {
        S.bounce(); toast('Бұл биологиялық байланыс жоқ!','error'); draft.remove();
      }
    } else { draft.remove(); }
    from=null;draft=null;
  });

  toast('Бір түрден екіншісіне тышқанмен сыз (5 байланыс керек!)','info');
}

// ============================================================
// LAB 6 — INCUBATOR v3 (pH + CO2 + temperature + water)
// ============================================================
function l6(ws){
  ws.classList.add('bg-inc');
  ws.innerHTML=`
<div style="display:flex;gap:50px;align-items:center;justify-content:center;">

  <div class="capsule-wrap">
    <div class="capsule-3d" id="cap">
      <div class="cap-shine"></div>
      <div class="cap-frost" id="cfrost"></div>
      <div class="cap-heat"  id="cheat"></div>
      <div style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;">
        <div id="i-flower" style="width:100px;height:100px;transform:scale(0);opacity:0;transition:.9s;filter:drop-shadow(0 0 20px var(--neon-gold));"><svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="20" fill="#451a03"/><circle cx="50" cy="50" r="28" fill="none" stroke="#f59e0b" stroke-width="8" stroke-dasharray="10 6"/><circle cx="50" cy="50" r="38" fill="none" stroke="#fcd34d" stroke-width="8" stroke-dasharray="12 8"/></svg></div>
        <div id="i-stem"   style="width:10px;height:0;background:var(--neon-g);border-radius:5px;transition:height .4s linear;box-shadow:0 0 12px var(--neon-g);"></div>
      </div>
      <div id="i-dirt" style="position:absolute;bottom:0;width:100%;height:65px;
        background:linear-gradient(180deg,#5c2a12,#1c0802);
        box-shadow:inset 0 8px 18px rgba(0,0,0,.8);cursor:pointer;z-index:10;transition:filter .5s;"></div>
    </div>
  </div>

  <div style="display:flex;flex-direction:column;gap:14px;width:270px;">

    <div class="sci-panel panel-3d">
      <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:10px;">🌡️ ТЕМПЕРАТУРА</div>
      <input class="sci-slider gold" type="range" id="sl-tmp" min="-10" max="50" value="22" style="width:100%;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span class="val-display c-gold" id="v-tmp" style="font-size:1.8rem;">22°C</span>
        <span id="tmp-zone" class="t-jura" style="font-size:.78rem;"></span>
      </div>
    </div>

    <div class="sci-panel panel-3d">
      <div class="t-orb c-blue" style="font-size:.72rem;margin-bottom:10px;">🌱 Топырақ pH</div>
      <input class="sci-slider green" type="range" id="sl-ph" min="40" max="90" value="70" style="width:100%;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span class="val-display c-green" id="v-ph" style="font-size:1.8rem;">7.0</span>
        <span id="ph-zone" class="t-jura" style="font-size:.78rem;"></span>
      </div>
    </div>

    <div class="sci-panel panel-3d">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;">💧 Ылғал</div>
        <span class="c-blue t-jura" id="v-moist">0%</span>
      </div>
      <div class="bar-wrap"><div class="bar-fill bar-blue" id="bar-m"></div></div>
      <div style="margin-top:10px;display:flex;justify-content:space-between;">
        <div class="t-jura" style="color:var(--text-dim);font-size:.78rem;">🌱 Өсу</div>
        <span class="c-green t-jura" id="v-grow">0%</span>
      </div>
      <div class="bar-wrap" style="margin-top:4px;"><div class="bar-fill bar-green" id="bar-grow"></div></div>
    </div>

    <div class="sci-panel">
      <div class="checklist">
        <div class="check-item" id="s-p1"><i class="fa-regular fa-circle"></i> Тұқым егу</div>
        <div class="check-item" id="s-p2"><i class="fa-regular fa-circle"></i> Ылғал ≥ 40%</div>
        <div class="check-item" id="s-p3"><i class="fa-regular fa-circle"></i> Температура 15-30°C</div>
        <div class="check-item" id="s-p4"><i class="fa-regular fa-circle"></i> pH 6.0-7.5</div>
        <div class="check-item" id="s-p5"><i class="fa-regular fa-circle"></i> Өсу аяқталды</div>
      </div>
    </div>
  </div>
</div>`;

  const E={seed:false,moist:0,tmp:22,ph:7.0,grow:0,done:false};

  document.getElementById('sl-tmp').oninput=function(){
    E.tmp=+this.value; document.getElementById('v-tmp').textContent=E.tmp+'°C';
    const z=document.getElementById('tmp-zone'),f=document.getElementById('cfrost'),h=document.getElementById('cheat');
    f.style.opacity=E.tmp<5?Math.min((5-E.tmp)/15,1):0;
    h.style.opacity=E.tmp>38?Math.min((E.tmp-38)/12,1):0;
    if(E.tmp<5){z.textContent='❄️ Тым суық';z.style.color='#93c5fd';S.err();toast('Гипотермия! Ферменттер тоқтады.','error');}
    else if(E.tmp>38){z.textContent='🔥 Денатурация';z.style.color='#fca5a5';S.err();toast('Жасуша ақуыздары бұзылуда!','error');}
    else if(E.tmp>=15&&E.tmp<=30){z.textContent='✅ Қолайлы';z.style.color='var(--neon-g)';if(!document.getElementById('s-p3').classList.contains('done'))chk('p3');}
    else{z.textContent='⚠️ Шекаралық';z.style.color='var(--neon-gold)';}
  };

  document.getElementById('sl-ph').oninput=function(){
    E.ph=+this.value/10; document.getElementById('v-ph').textContent=E.ph.toFixed(1);
    const z=document.getElementById('ph-zone');
    if(E.ph<5.5){z.textContent='⚠️ Тым қышқыл';z.style.color='var(--neon-r)';toast('Топырақ тым қышқыл! Тамырлар зақымдалады.','error');}
    else if(E.ph>8.0){z.textContent='⚠️ Тым сілтілі';z.style.color='var(--neon-r)';toast('Топырақ тым сілтілі! Минерал сіңімі азаяды.','error');}
    else{z.textContent='✅ Қолайлы';z.style.color='var(--neon-g)';if(!document.getElementById('s-p4').classList.contains('done'))chk('p4');}
  };

  ws.addEventListener('click',function(e){
    if(E.done)return; iSnd();
    const d=document.getElementById('i-dirt').getBoundingClientRect();
    if(e.clientX<d.left||e.clientX>d.right||e.clientY<d.top||e.clientY>d.bottom+30)return;
    if(B.tool==='seed'&&!E.seed){E.seed=true;S.click();fx(e.clientX,e.clientY,'green');chk('p1');toast('Тұқым егілді! 🚿 Суарыңыз.','ok');}
    else if(B.tool==='water'&&E.seed){
      E.moist=Math.min(E.moist+22,100);S.water();fx(e.clientX,e.clientY,'water');
      document.getElementById('i-dirt').style.filter=`brightness(${Math.max(.4,1-E.moist/120)})`;
      if(E.moist>=40&&!document.getElementById('s-p2').classList.contains('done'))chk('p2');
    } else if(B.tool==='seed'&&E.seed){toast('Тұқым егілген!','info');}
    else if(!B.tool){toast('Аспапты таңдаңыз.','info');}
  });

  B.loop=setInterval(()=>{
    if(E.done)return;
    E.moist=Math.max(0,E.moist-0.35-Math.max(0,E.tmp-25)*0.08);
    document.getElementById('bar-m').style.width=E.moist+'%';
    document.getElementById('v-moist').textContent=Math.round(E.moist)+'%';
    const cond=E.seed&&E.moist>15&&E.tmp>=15&&E.tmp<=30&&E.ph>=5.5&&E.ph<=8.0;
    if(cond){
      E.grow=Math.min(E.grow+1.5,100);
      document.getElementById('i-stem').style.height=(E.grow*2.6)+'px';
      document.getElementById('bar-grow').style.width=E.grow+'%';
      document.getElementById('v-grow').textContent=Math.round(E.grow)+'%';
      if(E.grow>=100&&!E.done){
        E.done=true;clearInterval(B.loop);
        const fl=document.getElementById('i-flower'); fl.style.transform='scale(1)';fl.style.opacity='1'; S.grow();chk('p5');
        cinematic('ӨСІМДІК ТОЛЫҚ ӨСТІ','Тамыр нарастания аймағында <b>митоз</b> үздіксіз жүрді.<br><br>✅ Температура: <b>'+E.tmp+'°C</b><br>✅ pH: <b>'+E.ph.toFixed(1)+'</b><br>✅ Ылғал: <b>'+Math.round(E.moist)+'%</b><br><br>Барлық факторлар тепе-теңдікте болғанда ғана тірі организм дамиды.');
      }
    }
  },280);

  toast('🫘 Тұқым → 🚿 Су → 🌡️ Температура (15-30°C) → pH (6.0-7.5) баптаңыз','info');
}
