// Image pipeline: convert images in ./media to responsive WebP/JPEG variants and write a srcset.json
// Usage: node image-pipeline.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'media');
const OUTPUT_DIR = path.join(process.cwd(), 'media-processed');
const SIZES = [400, 800, 1200, 1600];

if(!fs.existsSync(INPUT_DIR)){
  console.error('No media/ directory found. Place original images in ./media');
  process.exit(1);
}
if(!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

async function processImage(file){
  const name = path.basename(file, path.extname(file));
  const variants = [];
  for(const w of SIZES){
    const outWebp = `${name}-${w}.webp`;
    const outJpg = `${name}-${w}.jpg`;
    await sharp(path.join(INPUT_DIR, file)).resize({ width: w }).toFile(path.join(OUTPUT_DIR, outWebp));
    await sharp(path.join(INPUT_DIR, file)).resize({ width: w }).jpeg({ quality: 80 }).toFile(path.join(OUTPUT_DIR, outJpg));
    variants.push({ w, webp: `/media-processed/${outWebp}`, jpg: `/media-processed/${outJpg}` });
  }
  return { name, variants };
}

(async ()=>{
  const items = fs.readdirSync(INPUT_DIR).filter(f=>!f.startsWith('.'));
  const index = [];
  for(const file of items){
    try{ const res = await processImage(file); index.push(res); console.log('Processed', file); }catch(e){ console.error('Failed', file, e); }
  }
  fs.writeFileSync(path.join(OUTPUT_DIR,'srcset-index.json'), JSON.stringify(index, null, 2));
  console.log('Done. Processed images are in', OUTPUT_DIR);
})();
