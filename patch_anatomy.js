const fs = require('fs');

const images = {
  "brain": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Brain_autopsy_lateral_view.jpg/500px-Brain_autopsy_lateral_view.jpg",
  "lungs": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Lungs_diagram_detailed.svg/500px-Lungs_diagram_detailed.svg.png",
  "heart": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Heart_anterior_exterior_view.png/500px-Heart_anterior_exterior_view.png",
  "liver": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Anatomy_Abdomen_Tiesworks.jpg/500px-Anatomy_Abdomen_Tiesworks.jpg",
  "stomach": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Gray1046.svg/500px-Gray1046.svg.png",
  "kidneys": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Blausen_0592_KidneyAnatomy_01.png/500px-Blausen_0592_KidneyAnatomy_01.png",
  "intestine": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Tractus_intestinalis_intestinum_tenue.svg/500px-Tractus_intestinalis_intestinum_tenue.svg.png",
  "bladder": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Urinary_system.svg/500px-Urinary_system.svg.png",
  
  "skull": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/VolRenderShearWarp.gif/500px-VolRenderShearWarp.gif",
  "spine": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Illu_vertebral_column.svg/500px-Illu_vertebral_column.svg.png",
  "ribs": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Illu_ribs.svg/500px-Illu_ribs.svg.png",
  "pelvis": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Pelvis_diagram.png/500px-Pelvis_diagram.png",
  "humerus": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Humerus_-_anterior_view.png/500px-Humerus_-_anterior_view.png",
  "femur": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Femur_-_anterior_view.png/500px-Femur_-_anterior_view.png",

  "brain_nerve": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Nervous_system_diagram.png/500px-Nervous_system_diagram.png",
  "spinal_cord": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Spinal_cord_--_smart-servier.png/500px-Spinal_cord_--_smart-servier.png",
  "sciatic": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sciatic_nerve.jpg/500px-Sciatic_nerve.jpg"
};

let html = fs.readFileSync('anatomy.html', 'utf8');

// Replace the emojis inside <div class="organ" ...> ... </div>
// We can use a regex to match the data-id and replace its inner HTML.

for (const [id, url] of Object.entries(images)) {
  const regex = new RegExp(`(<div class="organ[^"]*" data-id="${id}"[^>]*>)[^<]*(</div>)`, 'g');
  const imgTag = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:2px solid var(--theme-color);box-shadow: 0 0 15px var(--theme-glow);">`;
  html = html.replace(regex, `$1${imgTag}$2`);
}

// Gamification improvements:
// Add counter and completion logic.

if (!html.includes('id="scanCounter"')) {
  // Add gamification counter to UI
  html = html.replace('<div class="scan-header" id="scanHeaderTxt">СТАТУС: ОЖИДАНИЕ СКАНИРОВАНИЯ</div>',
  `<div class="scan-header" id="scanHeaderTxt">СТАТУС: ОЖИДАНИЕ СКАНИРОВАНИЯ</div>
        <div id="scanCounter" style="color:var(--theme-color); font-weight:bold; font-size:14px; margin-bottom: 20px; text-align:right;">Найдено: 0 / 0</div>`);
}

if (!html.includes('updateCounter')) {
    html = html.replace(
`        let scannedItems = new Set();`,
`        let scannedItems = new Set();
        let totalItemsInMode = 0;
        
        function updateCounter() {
            const currentOrgans = document.querySelectorAll('.mode-' + (currentMode==='organs'?'org':currentMode==='skeleton'?'bone':'nervous'));
            totalItemsInMode = currentOrgans.length;
            let found = 0;
            currentOrgans.forEach(el => {
                if (scannedItems.has(el.getAttribute('data-id'))) found++;
            });
            document.getElementById('scanCounter').textContent = 'Найдено: ' + found + ' / ' + totalItemsInMode;
            
            if (found > 0 && found === totalItemsInMode) {
                document.getElementById('scanCounter').textContent = '✅ СКАНИРОВАНИЕ ЗАВЕРШЕНО';
                document.getElementById('scanCounter').style.color = '#10b981'; // green
            } else {
                document.getElementById('scanCounter').style.color = 'var(--theme-color)';
            }
        }`);

    html = html.replace(
`            resetDashboard();
        }`,
`            resetDashboard();
            updateCounter();
        }`);

    html = html.replace(
`                    scannedItems.add(id);
                    playSnd('success');
                    showData(id);
                }`,
`                    scannedItems.add(id);
                    playSnd('success');
                    showData(id);
                    updateCounter();
                }`);

    // Add initial call
    html = html.replace(
`        // Start Audio Context`,
`        updateCounter();
        
        // Start Audio Context`);
}

// Increase the lens ring effect when scanning
html = html.replace(
`            // Highlight lens
            lens.style.borderColor = '#fff';
            lens.style.boxShadow = '0 0 40px #fff';
            setTimeout(() => {
                lens.style.borderColor = '';
                lens.style.boxShadow = '';
            }, 300);`,
`            // Highlight lens and pulse patient
            lens.style.borderColor = '#fff';
            lens.style.boxShadow = '0 0 40px #fff';
            document.getElementById('patientBox').style.filter = 'drop-shadow(0 0 40px var(--theme-color)) brightness(1.5)';
            setTimeout(() => {
                lens.style.borderColor = '';
                lens.style.boxShadow = '';
                document.getElementById('patientBox').style.filter = 'drop-shadow(0 0 20px var(--theme-glow))';
            }, 500);`);

fs.writeFileSync('anatomy.html', html);
console.log('Patch complete.');
