const fs = require('fs');
let js = fs.readFileSync('biology7.js', 'utf8');

const svgs = {
  plant: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M50 90 Q30 70 30 40 Q50 30 50 60 Q70 40 70 60 Q50 80 50 90Z" fill="#10b981"/><path d="M50 90 L50 60" stroke="#047857" stroke-width="4" stroke-linecap="round"/></svg>`,
  flower: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="15" fill="#f59e0b"/><path d="M50 15 C60 15 65 30 50 35 C35 30 40 15 50 15 Z" fill="#ec4899"/><path d="M50 85 C60 85 65 70 50 65 C35 70 40 85 50 85 Z" fill="#ec4899"/><path d="M85 50 C85 60 70 65 65 50 C70 35 85 40 85 50 Z" fill="#ec4899"/><path d="M15 50 C15 60 30 65 35 50 C30 35 15 40 15 50 Z" fill="#ec4899"/></svg>`,
  dicot: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M50 90 Q10 50 45 20 Q50 30 50 60 Z" fill="#10b981"/><path d="M50 90 Q90 50 55 20 Q50 30 50 60 Z" fill="#34d399"/><path d="M50 90 L50 50" stroke="#047857" stroke-width="3"/></svg>`,
  rose: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="30" fill="#e11d48"/><path d="M50 20 Q70 20 70 40 Q50 60 30 40 Q30 20 50 20" fill="#be123c"/><path d="M40 80 L40 100 M60 80 L60 100 M50 75 L50 100" stroke="#15803d" stroke-width="4" stroke-linecap="round"/></svg>`,
  sunflower: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="20" fill="#451a03"/><circle cx="50" cy="50" r="28" fill="none" stroke="#f59e0b" stroke-width="8" stroke-dasharray="10 6"/><circle cx="50" cy="50" r="38" fill="none" stroke="#fcd34d" stroke-width="8" stroke-dasharray="12 8"/></svg>`,
  
  sun: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><circle cx="50" cy="50" r="25" fill="#f59e0b"/><path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50 M18 18 L25 25 M75 75 L82 82 M18 82 L25 75 M75 18 L82 25" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/></svg>`,
  rabbit: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><ellipse cx="50" cy="65" rx="30" ry="20" fill="#e2e8f0"/><circle cx="35" cy="45" r="15" fill="#e2e8f0"/><path d="M25 35 Q30 10 40 15 Q40 25 35 35" fill="#cbd5e1"/><path d="M35 35 Q40 10 50 15 Q50 25 45 35" fill="#cbd5e1"/><circle cx="75" cy="60" r="8" fill="#f8fafc"/></svg>`,
  fox: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M20 40 L50 80 L80 40 Z" fill="#f97316"/><path d="M20 40 L30 15 L45 35 Z" fill="#ea580c"/><path d="M80 40 L70 15 L55 35 Z" fill="#ea580c"/><path d="M40 80 L50 90 L60 80 Z" fill="#1c1917"/><circle cx="35" cy="50" r="4" fill="#fff"/><circle cx="65" cy="50" r="4" fill="#fff"/></svg>`,
  eagle: `<svg viewBox="0 0 100 100" width="1.2em" height="1.2em"><path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z" fill="#3f3f46"/><path d="M70 50 Q90 40 95 60 Q80 70 70 50 Z" fill="#fef08a"/><circle cx="35" cy="45" r="3" fill="#fff"/></svg>`
};

// Replace taxonomy L2
js = js.replace("{id:'t1',icon:'🌿',name:'ӨСІМДІКТЕР'", `{id:'t1',icon:'${svgs.plant}',name:'ӨСІМДІКТЕР'`);
js = js.replace("{id:'t2',icon:'🌸',name:'ЖАБЫҚ ТҰҚЫМДЫЛАР'", `{id:'t2',icon:'${svgs.flower}',name:'ЖАБЫҚ ТҰҚЫМДЫЛАР'`);
js = js.replace("{id:'t3',icon:'🍀',name:'ҚОСЖАРНАҚТЫЛАР'", `{id:'t3',icon:'${svgs.dicot}',name:'ҚОСЖАРНАҚТЫЛАР'`);
js = js.replace("{id:'t4',icon:'🌹',name:'РАУШАН ТӘРІЗДІЛЕР'", `{id:'t4',icon:'${svgs.rose}',name:'РАУШАН ТӘРІЗДІЛЕР'`);
js = js.replace("{id:'t5',icon:'🌻',name:'КҮНБАҒЫС'", `{id:'t5',icon:'${svgs.sunflower}',name:'КҮНБАҒЫС'`);

// Replace food web L5
js = js.replace("{id:'n-sun' ,e:'☀️',lbl:'Күн'", `{id:'n-sun' ,e:'${svgs.sun}',lbl:'Күн'`);
js = js.replace("{id:'n-plant',e:'🌿',lbl:'Өсімдік'", `{id:'n-plant',e:'${svgs.plant}',lbl:'Өсімдік'`);
js = js.replace("{id:'n-rab',  e:'🐇',lbl:'Қоян'", `{id:'n-rab',  e:'${svgs.rabbit}',lbl:'Қоян'`);
js = js.replace("{id:'n-fox',  e:'🦊',lbl:'Түлкі'", `{id:'n-fox',  e:'${svgs.fox}',lbl:'Түлкі'`);
js = js.replace("{id:'n-eagle',e:'🦅',lbl:'Бүркіт'", `{id:'n-eagle',e:'${svgs.eagle}',lbl:'Бүркіт'`);

// Replace L6 flower
js = js.replace(`<div id="i-flower" style="font-size:5rem;transform:scale(0);opacity:0;transition:.9s;filter:drop-shadow(0 0 20px var(--neon-gold));">🌻</div>`,
`<div id="i-flower" style="width:100px;height:100px;transform:scale(0);opacity:0;transition:.9s;filter:drop-shadow(0 0 20px var(--neon-gold));">${svgs.sunflower.replace('1.2em','100%').replace('1.2em','100%')}</div>`);


fs.writeFileSync('biology7.js', js);
console.log('biology7.js basic emoji patch applied.');
