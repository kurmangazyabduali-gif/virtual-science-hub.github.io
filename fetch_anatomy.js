const fs = require('fs');

const items = [
  { id: 'brain', q: 'Human brain', icon: '🧠' },
  { id: 'lungs', q: 'Human lung', icon: '🫁' },
  { id: 'heart', q: 'Human heart', icon: '❤️' },
  { id: 'liver', q: 'Human liver', icon: '🟤' },
  { id: 'stomach', q: 'Human stomach', icon: '🟡' },
  { id: 'kidneys', q: 'Kidney', icon: '🫘' },
  { id: 'intestine', q: 'Small intestine', icon: '🌭' },
  { id: 'bladder', q: 'Urinary bladder', icon: '🎈' },
  
  { id: 'skull', q: 'Human skull', icon: '💀' },
  { id: 'spine', q: 'Vertebral column', icon: '🦴' }, // will replace the first 🦴
  { id: 'ribs', q: 'Rib cage', icon: '🩻' },
  { id: 'pelvis', q: 'Human pelvis', icon: '🦴' }, // wait, multiple bones have 🦴
  { id: 'humerus', q: 'Humerus', icon: '🦴' },
  { id: 'femur', q: 'Femur', icon: '🦴' },
  
  { id: 'brain_nerve', q: 'Central nervous system', icon: '🧠' },
  { id: 'spinal_cord', q: 'Spinal cord', icon: '⚡' },
  { id: 'sciatic', q: 'Sciatic nerve', icon: '⚡' }
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
  let results = {};
  for (const item of items) {
    const img = await getImg(item.q);
    results[item.id] = img;
    console.log(item.id, img);
  }
  fs.writeFileSync('anatomy_images.json', JSON.stringify(results, null, 2));
})();
