const fs = require('fs');

const items = [
  { q: 'Muscle cell', icon: '🥩' },
  { q: 'Saccharomyces cerevisiae', icon: '🥖' },
  { q: 'Penicillium', icon: '🍄' },
  { q: 'Plant cell', icon: '🌿' },
  { q: 'Chloroplast', icon: '🔋' },
  { q: 'Mitochondrion', icon: '⚡' },
  { q: 'Cell nucleus', icon: '👁️' },
  { q: 'Ribosome', icon: '🔸' },
  { q: 'Pollen', icon: '🌼' },
  { q: 'Stoma (botany)', icon: '👄' },
  { q: 'Tardigrade', icon: '🐻' },
  { q: 'Rotifer', icon: '🌪️' },
  { q: 'Caenorhabditis elegans', icon: '🪱' },
  { q: 'Daphnia', icon: '🦐' }
];

async function getImg(q) {
  try {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(q) + '&gsrlimit=1&prop=pageimages&format=json&pithumbsize=400';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    const pages = json.query.pages;
    const page = Object.values(pages)[0];
    return page.thumbnail ? page.thumbnail.source : '';
  } catch(e) { return ''; }
}

(async () => {
  let file = fs.readFileSync('biology.html', 'utf8');
  for (const item of items) {
    if (!file.includes(item.icon)) continue;
    const img = await getImg(item.q);
    if (img) {
      const htmlImg = `<img src="${img}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;border:2px solid rgba(56,189,248,0.5);box-shadow: 0 0 15px rgba(56,189,248,0.3);">`;
      file = file.replace("icon: '" + item.icon + "'", "icon: '" + htmlImg + "'");
      console.log('Replaced', item.q);
    } else {
      console.log('No image for', item.q);
    }
  }
  fs.writeFileSync('biology.html', file);
  console.log('done');
})();
