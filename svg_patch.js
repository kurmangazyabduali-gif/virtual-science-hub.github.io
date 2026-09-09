const fs = require('fs');
let html = fs.readFileSync('anatomy.html', 'utf8');

const MRI = {
brain: `<svg viewBox="0 0 120 105" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="b1" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.4"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient></defs>
<ellipse cx="60" cy="58" rx="56" ry="42" fill="url(#b1)" stroke="currentColor" stroke-width="2.5"/>
<line x1="60" y1="16" x2="60" y2="100" stroke="currentColor" stroke-width="2" opacity="0.6"/>
<path d="M10,50 Q14,34 28,30 Q22,40 16,52 Q10,62 10,50Z" fill="currentColor" opacity="0.38" stroke="currentColor" stroke-width="1.2"/>
<path d="M10,66 Q16,54 30,52 Q24,64 16,72Z" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.2"/>
<path d="M14,80 Q22,70 36,68 Q30,80 18,86Z" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="1.2"/>
<path d="M22,34 Q34,22 46,24 Q40,34 28,36Z" fill="currentColor" opacity="0.32" stroke="currentColor" stroke-width="1.2"/>
<path d="M44,20 Q54,14 60,16 Q56,26 46,28Z" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="1.2"/>
<path d="M110,50 Q106,34 92,30 Q98,40 104,52 Q110,62 110,50Z" fill="currentColor" opacity="0.38" stroke="currentColor" stroke-width="1.2"/>
<path d="M110,66 Q104,54 90,52 Q96,64 104,72Z" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.2"/>
<path d="M106,80 Q98,70 84,68 Q90,80 102,86Z" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="1.2"/>
<path d="M98,34 Q86,22 74,24 Q80,34 92,36Z" fill="currentColor" opacity="0.32" stroke="currentColor" stroke-width="1.2"/>
<path d="M76,20 Q66,14 60,16 Q64,26 74,28Z" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="1.2"/>
<ellipse cx="50" cy="68" rx="9" ry="7" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.3"/>
<ellipse cx="70" cy="68" rx="9" ry="7" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.3"/>
<path d="M52,98 Q60,105 68,98 L66,102 Q60,106 54,102Z" fill="currentColor" opacity="0.5" stroke="currentColor" stroke-width="1.5"/>
<path d="M36,28 Q48,20 60,22 Q72,20 84,28" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
</svg>`,

lungs: `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="ll" cx="30%" cy="40%" r="65%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/></radialGradient>
<radialGradient id="rl" cx="70%" cy="40%" r="65%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.04"/></radialGradient>
</defs>
<rect x="55" y="2" width="10" height="20" rx="5" fill="currentColor" opacity="0.5" stroke="currentColor" stroke-width="1.8"/>
<path d="M60,20 Q42,26 30,34" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
<path d="M60,20 Q78,26 90,34" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
<path d="M57,22 C52,22 12,30 8,56 C4,76 12,96 28,100 C44,104 54,88 54,68 L54,22Z" fill="url(#ll)" stroke="currentColor" stroke-width="2.5"/>
<path d="M63,22 C68,22 108,30 112,56 C116,76 108,96 92,100 C76,104 66,88 66,68 L66,22Z" fill="url(#rl)" stroke="currentColor" stroke-width="2.5"/>
<path d="M30,34 Q20,46 16,58 Q14,68 18,78" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M30,34 Q28,50 30,64" stroke="currentColor" stroke-width="1.6" fill="none"/>
<path d="M30,34 Q36,50 36,64" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M16,58 Q16,68 20,76" stroke="currentColor" stroke-width="1.3" fill="none"/>
<path d="M30,64 Q28,76 32,86" stroke="currentColor" stroke-width="1.3" fill="none"/>
<path d="M90,34 Q100,46 104,58 Q106,68 102,78" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M90,34 Q92,50 90,64" stroke="currentColor" stroke-width="1.6" fill="none"/>
<path d="M90,34 Q84,50 84,64" stroke="currentColor" stroke-width="1.4" fill="none"/>
<path d="M104,58 Q104,68 100,76" stroke="currentColor" stroke-width="1.3" fill="none"/>
<path d="M90,64 Q92,76 88,86" stroke="currentColor" stroke-width="1.3" fill="none"/>
<path d="M14,58 Q30,65 54,63" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6" stroke-dasharray="3,2"/>
<path d="M106,58 Q90,65 66,63" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.6" stroke-dasharray="3,2"/>
</svg>`,

heart: `<svg viewBox="0 0 115 108" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="h1" cx="50%" cy="65%" r="58%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.45"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient></defs>
<path d="M50,10 C48,4 54,1 58,3 L58,16" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/>
<path d="M54,2 L54,16" stroke="currentColor" stroke-width="4.5" opacity="0.8"/>
<path d="M58,10 Q72,8 78,16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
<path d="M50,12 Q36,10 28,20" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
<path d="M57,92 C57,92 8,64 8,38 C8,22 22,14 34,18 C43,21 57,33 57,33 C57,33 71,21 80,18 C92,14 106,22 106,38 C106,64 57,92 57,92Z" fill="url(#h1)" stroke="currentColor" stroke-width="2.8"/>
<path d="M57,33 L57,82" stroke="currentColor" stroke-width="2" opacity="0.55"/>
<path d="M22,34 Q57,28 92,34" fill="none" stroke="currentColor" stroke-width="1.8" opacity="0.65"/>
<path d="M28,44 Q43,40 55,46" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.55"/>
<path d="M24,56 Q40,52 55,58" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.5"/>
<path d="M26,68 Q42,64 55,70" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.45"/>
<path d="M86,44 Q71,40 59,46" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.55"/>
<path d="M90,56 Q74,52 59,58" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.5"/>
<path d="M88,68 Q72,64 59,70" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.45"/>
<ellipse cx="34" cy="24" rx="8" ry="6" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.2"/>
<ellipse cx="80" cy="24" rx="8" ry="6" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="1.2"/>
</svg>`,

liver: `<svg viewBox="0 0 130 90" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="lv" cx="38%" cy="38%" r="62%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.42"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient></defs>
<path d="M12,60 C9,42 16,22 30,14 C48,5 88,8 106,22 C120,34 116,57 100,67 C76,78 13,76 12,60Z" fill="url(#lv)" stroke="currentColor" stroke-width="2.8"/>
<path d="M64,11 Q68,38 66,70" stroke="currentColor" stroke-width="1.8" fill="none" opacity="0.55"/>
<path d="M52,62 Q62,50 76,47" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M76,47 Q88,40 96,36" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M76,47 Q80,54 84,62" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M96,36 Q102,30 106,25" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M96,36 Q98,44 100,52" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M52,62 Q38,54 26,46" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" opacity="0.8"/>
<path d="M26,46 Q18,36 16,26" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" opacity="0.65"/>
<path d="M26,46 Q20,52 18,60" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
<ellipse cx="84" cy="72" rx="13" ry="9" fill="currentColor" opacity="0.28" stroke="currentColor" stroke-width="2"/>
<path d="M66,68 Q70,78 72,86" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" fill="none"/>
<path d="M28,30 Q60,22 100,30" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.5"/>
<path d="M22,46 Q60,38 102,46" stroke="currentColor" stroke-width="1.2" fill="none" opacity="0.45"/>
</svg>`,

stomach: `<svg viewBox="0 0 105 105" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="st" cx="38%" cy="45%" r="58%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.42"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient></defs>
<rect x="30" y="0" width="10" height="18" rx="5" fill="currentColor" opacity="0.5" stroke="currentColor" stroke-width="1.8"/>
<path d="M34,16 C20,18 10,30 10,46 C10,68 20,86 44,88 C64,90 86,76 88,59 C93,36 80,18 58,15 C50,13 42,14 34,16Z" fill="url(#st)" stroke="currentColor" stroke-width="2.8"/>
<path d="M76,60 Q86,58 90,62" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
<path d="M34,24 Q54,28 62,46" stroke="currentColor" stroke-width="1.4" fill="none" opacity="0.6"/>
<path d="M20,46 Q38,38 63,46" stroke="currentColor" stroke-width="1.7" fill="none" opacity="0.75"/>
<path d="M17,58 Q38,50 65,58" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.7"/>
<path d="M18,70 Q38,62 66,70" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.6"/>
<path d="M20,80 Q40,74 64,80" stroke="currentColor" stroke-width="1.3" fill="none" opacity="0.5"/>
</svg>`,

kidneys: `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg">
<defs>
<radialGradient id="kl" cx="38%" cy="50%" r="62%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.4"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient>
<radialGradient id="kr" cx="62%" cy="50%" r="62%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.4"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient>
</defs>
<path d="M6,42 C6,20 16,6 28,6 C35,6 40,13 40,22 C40,30 34,37 34,42 C34,47 40,54 40,62 C40,73 34,80 27,80 C14,80 6,62 6,42Z" fill="url(#kl)" stroke="currentColor" stroke-width="2.5"/>
<path d="M28,14 Q36,24 36,34 Q34,44 28,48" fill="none" stroke="currentColor" stroke-width="2" opacity="0.75"/>
<path d="M20,18 Q26,26 28,30" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M14,38 Q22,36 28,38" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M20,58 Q26,52 28,48" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M40,44 L58,44" stroke="currentColor" stroke-width="2.2" fill="none" opacity="0.75"/>
<path d="M114,42 C114,20 104,6 92,6 C85,6 80,13 80,22 C80,30 86,37 86,42 C86,47 80,54 80,62 C80,73 86,80 93,80 C106,80 114,62 114,42Z" fill="url(#kr)" stroke="currentColor" stroke-width="2.5"/>
<path d="M92,14 Q84,24 84,34 Q86,44 92,48" fill="none" stroke="currentColor" stroke-width="2" opacity="0.75"/>
<path d="M100,18 Q94,26 92,30" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M106,38 Q98,36 92,38" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M100,58 Q94,52 92,48" stroke="currentColor" stroke-width="1.5" fill="none"/>
<path d="M80,44 L62,44" stroke="currentColor" stroke-width="2.2" fill="none" opacity="0.75"/>
<rect x="54" y="8" width="12" height="68" rx="6" fill="currentColor" opacity="0.22" stroke="currentColor" stroke-width="1.8"/>
</svg>`,

intestine: `<svg viewBox="0 0 115 120" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="in" cx="50%" cy="50%" r="55%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.18"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.01"/></radialGradient></defs>
<ellipse cx="58" cy="60" rx="53" ry="56" fill="url(#in)"/>
<path d="M20,16 Q96,16 96,36 Q96,56 20,56 Q20,76 96,76 Q96,96 58,102" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round" opacity="0.18"/>
<path d="M20,16 Q96,16 96,36 Q96,56 20,56 Q20,76 96,76 Q96,96 58,102" fill="none" stroke="currentColor" stroke-width="6.5" stroke-linecap="round"/>
<path d="M32,10 Q38,16 44,10 M52,10 Q58,16 64,10 M72,10 Q78,16 84,10" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.65"/>
<path d="M32,62 Q38,56 44,62 M52,62 Q58,56 64,62 M72,62 Q78,56 84,62" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.65"/>
<path d="M26,26 Q40,20 55,28 Q40,36 26,26Z" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.55"/>
<path d="M36,40 Q52,34 66,42 Q52,50 36,40Z" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.55"/>
<path d="M28,68 Q44,62 60,70 Q44,78 28,68Z" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.55"/>
</svg>`,

bladder: `<svg viewBox="0 0 105 110" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="bl" cx="50%" cy="38%" r="56%"><stop offset="0%" stop-color="currentColor" stop-opacity="0.46"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.05"/></radialGradient></defs>
<path d="M26,38 Q30,26 40,20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M79,38 Q75,26 65,20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="52" cy="58" rx="42" ry="38" fill="url(#bl)" stroke="currentColor" stroke-width="2.8"/>
<path d="M16,46 Q52,34 88,46" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.7"/>
<path d="M12,58 Q52,46 92,58" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.65"/>
<path d="M14,70 Q52,60 90,70" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.55"/>
<path d="M18,80 Q52,72 86,80" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
<path d="M36,88 Q52,82 68,88 Q62,96 52,98 Q42,96 36,88Z" fill="currentColor" opacity="0.3" stroke="currentColor" stroke-width="1.8"/>
<path d="M44,98 Q48,106 52,110 Q56,106 60,98" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
</svg>`
};

for (const [id, svg] of Object.entries(MRI)) {
    const regex = new RegExp(
        `(<div[^>]*data-id="${id}"[^>]*>)<div[^>]*>[\\s\\S]*?</svg></div>(</div>)`,
        'g'
    );
    html = html.replace(regex, `$1<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--theme-color);">${svg}</div>$2`);
}

fs.writeFileSync('anatomy.html', html);
console.log('Done!');
