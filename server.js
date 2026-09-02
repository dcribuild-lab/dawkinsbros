// Simple local upload server for Dawkins Construction demo
// Run: node server.js
// Stores uploaded files to ./uploads and returns a JSON list. NOT for production.

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({ destination: function(req,file,cb){ cb(null, UPLOAD_DIR); }, filename: function(req,file,cb){ cb(null, Date.now() + '-' + file.originalname.replace(/[^a-z0-9.-]/gi,'_')); } });
const upload = multer({ storage });

app.use(express.static(path.join(__dirname)));

app.post('/api/upload', upload.array('files', 10), (req,res)=>{
  const files = (req.files || []).map(f => ({ originalName: f.originalname, url: `/uploads/${path.basename(f.path)}`, size: f.size }));
  res.json({ success:true, files });
});

app.get('/api/uploads', (req,res)=>{ const files = fs.readdirSync(UPLOAD_DIR).map(fn=>({ name:fn, url:`/uploads/${fn}` })); res.json(files); });

app.listen(port, ()=>console.log(`Local upload server running on http://localhost:${port}`));
