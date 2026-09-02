// Example Next.js API route (pages/api/upload.js)
// Uses formidable to parse multipart form uploads and writes files to ./public/uploads

import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const form = new formidable.IncomingForm({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if(err) return res.status(500).json({ error: err.message });
    const saved = [];
    const fileList = Array.isArray(files.files) ? files.files : [files.files];
    fileList.forEach(file => {
      const name = Date.now() + '-' + (file.originalFilename || file.newFilename || 'upload');
      const dest = path.join(uploadsDir, name);
      fs.copyFileSync(file.filepath, dest);
      saved.push({ url: `/uploads/${name}`, name });
    });
    res.json({ success: true, files: saved });
  });
}
