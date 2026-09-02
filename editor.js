(function(){
  // Keys
  const MEDIA_KEY = 'dawkins-media-v1';
  const CONTENT_KEY = 'dawkins-site-content-v11'; // matches public site key

  // Elements
  const fileInput = document.getElementById('fileUpload');
  const gallery = document.getElementById('gallery');
  const canvasEl = document.getElementById('editor');
  const exportPngBtn = document.getElementById('exportPng');
  const exportPdfBtn = document.getElementById('exportPdf');
  const saveJsonBtn = document.getElementById('saveJson');
  const loadJsonInput = document.getElementById('loadJson');
  const applyHeroBtn = document.getElementById('applyHero');

  const gridSizeInput = document.getElementById('gridSize');
  const showGridCheckbox = document.getElementById('showGrid');
  const snapToggle = document.getElementById('snapToggle');
  const pxPerUnitInput = document.getElementById('pxPerUnit');
  const unitSelect = document.getElementById('unitSelect');
  const presetCabinBtn = document.getElementById('presetCabin');
  const presetBarnBtn = document.getElementById('presetBarn');
  const presetSiteBtn = document.getElementById('presetSite');

  // Initialize Fabric canvas
  const canvas = new fabric.Canvas('editor', { selection: true, preserveObjectStacking: true });
  function resizeCanvas(){
    const w = Math.max(800, window.innerWidth * 0.6);
    const h = Math.max(500, window.innerHeight * 0.5);
    canvas.setWidth(w); canvas.setHeight(h); canvas.renderAll();
  }
  window.addEventListener('resize', resizeCanvas); resizeCanvas();

  // Tool state
  let currentTool = 'select';
  const setTool = (t)=>{ currentTool = t; canvas.selection = (t==='select'); };
  document.getElementById('selectBtn').addEventListener('click', ()=>setTool('select'));
  document.getElementById('rectBtn').addEventListener('click', ()=>setTool('rect'));
  document.getElementById('lineBtn').addEventListener('click', ()=>setTool('line'));
  document.getElementById('measureBtn').addEventListener('click', ()=>setTool('measure'));
  document.getElementById('textBtn').addEventListener('click', ()=>setTool('text'));
  document.getElementById('deleteBtn').addEventListener('click', ()=>{ const a = canvas.getActiveObject(); if(a) canvas.remove(a); });

  // Grid & snapping
  function drawGrid(){
    if(showGridCheckbox && !showGridCheckbox.checked){ canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas)); return; }
    const gridSize = Number(gridSizeInput.value) || 25;
    const w = canvas.getWidth(); const h = canvas.getHeight();
    const gridObjs = [];
    // remove old grid background objects (we'll use overlay rendering)
    canvas.backgroundColor = '#09120b';
    // Fabric overlay canvas free drawing for grid - instead, draw on lower canvas via context
    try{
      // clear a background canvas by setting backgroundImage
      const gridCanvas = document.createElement('canvas'); gridCanvas.width = w; gridCanvas.height = h;
      const gctx = gridCanvas.getContext('2d');
      gctx.clearRect(0,0,w,h);
      gctx.strokeStyle = 'rgba(255,255,255,0.03)'; gctx.lineWidth = 1;
      for(let x=0;x<w;x+=gridSize){ gctx.beginPath(); gctx.moveTo(x+0.5,0); gctx.lineTo(x+0.5,h); gctx.stroke(); }
      for(let y=0;y<h;y+=gridSize){ gctx.beginPath(); gctx.moveTo(0,y+0.5); gctx.lineTo(w,y+0.5); gctx.stroke(); }
      const dataUrl = gridCanvas.toDataURL();
      canvas.setBackgroundImage(dataUrl, canvas.renderAll.bind(canvas));
    }catch(e){ /* fallback: skip grid */ }
  }
  gridSizeInput.addEventListener('change', drawGrid); 
  showGridCheckbox.addEventListener('change', ()=>{ if(showGridCheckbox.checked) drawGrid(); else canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas)); });
  drawGrid();

  // Snapping helper
  function snap(value, grid){ return Math.round(value / grid) * grid; }
  canvas.on('object:moving', function(e){ if(!snapToggle.checked) return; const obj = e.target; const grid = Number(gridSizeInput.value) || 25; obj.left = snap(obj.left, grid); obj.top = snap(obj.top, grid); });
  canvas.on('object:scaling', function(e){ if(!snapToggle.checked) return; const obj = e.target; const grid = Number(gridSizeInput.value) || 25; // snap scale by pixels by adjusting width/height
    const w = obj.width * obj.scaleX; const h = obj.height * obj.scaleY; const snappedW = snap(w, grid); const snappedH = snap(h, grid); obj.scaleX = snappedW / obj.width; obj.scaleY = snappedH / obj.height; });

  // Presets: quick calibration
  presetCabinBtn.addEventListener('click', ()=>{ pxPerUnitInput.value = 100; unitSelect.value = 'ft'; gridSizeInput.value = 25; showGridCheckbox.checked = true; drawGrid(); alert('Preset applied: Cabin (1 ft = 100 px)'); });
  presetBarnBtn.addEventListener('click', ()=>{ pxPerUnitInput.value = 60; unitSelect.value = 'ft'; gridSizeInput.value = 40; showGridCheckbox.checked = true; drawGrid(); alert('Preset applied: Barn (1 ft = 60 px)'); });
  presetSiteBtn.addEventListener('click', ()=>{ pxPerUnitInput.value = 30; unitSelect.value = 'm'; gridSizeInput.value = 50; showGridCheckbox.checked = true; drawGrid(); alert('Preset applied: Site Plan (1 m = 30 px)'); });

  // Interaction for drawing shapes and measure
  let isDown=false, startX, startY, tempObj;
  canvas.on('mouse:down', function(o){ if(currentTool==='rect' || currentTool==='line' || currentTool==='measure'){ isDown=true; const p = canvas.getPointer(o.e); startX = p.x; startY = p.y; if(currentTool==='rect'){ tempObj = new fabric.Rect({ left:startX, top:startY, width:1, height:1, fill:'rgba(184,115,51,0.06)', stroke:'#b87333', strokeWidth:2, selectable:true }); canvas.add(tempObj); } else { tempObj = new fabric.Line([startX,startY,startX,startY], { stroke: currentTool==='measure' ? '#ccb08a' : '#efe9e2', strokeWidth:3, selectable:true }); canvas.add(tempObj); } } else if(currentTool==='text'){ const p = canvas.getPointer(o.e); const t = new fabric.Textbox('Label',{ left:p.x, top:p.y, fontSize:18, fill:'#efe9e2' }); canvas.add(t); canvas.setActiveObject(t); } });
  canvas.on('mouse:move', function(o){ if(!isDown || !tempObj) return; const p = canvas.getPointer(o.e); if(tempObj.type==='rect'){ tempObj.set({ width: Math.abs(p.x-startX), height: Math.abs(p.y-startY), left: Math.min(p.x,startX), top: Math.min(p.y,startY) }); } else { tempObj.set({ x2: p.x, y2: p.y }); } canvas.requestRenderAll(); });
  canvas.on('mouse:up', function(){ if(isDown){ if(currentTool==='measure' && tempObj){ const dx = tempObj.x2 - tempObj.x1; const dy = tempObj.y2 - tempObj.y1; const pxLen = Math.sqrt(dx*dx+dy*dy); const pxPerUnit = Number(pxPerUnitInput.value) || 100; const unit = unitSelect.value || 'px'; const value = unit==='px' ? Math.round(pxLen) : (pxLen / pxPerUnit).toFixed(2); const txt = new fabric.Text(`${value} ${unit}`, { left: (tempObj.x1+tempObj.x2)/2 + 6, top: (tempObj.y1+tempObj.y2)/2 - 12, fontSize:12, fill:'#ccb08a' }); canvas.add(txt); } tempObj = null; isDown=false; } });

  // Files: persist media to localStorage as data URLs
  function loadMedia(){ try{ const stored = JSON.parse(localStorage.getItem(MEDIA_KEY) || '[]'); gallery.innerHTML = ''; stored.forEach((item, idx)=>{ const img = document.createElement('img'); img.src = item.data; img.className = 'thumb'; img.alt = item.name || `Image ${idx+1}`; img.tabIndex=0; img.addEventListener('click', ()=> addImageToCanvas(item.data)); img.addEventListener('contextmenu', (e)=>{ e.preventDefault(); // show simple menu: set as hero
      if(confirm('Set this image as the live hero image in this browser?')){ setHeroImage(item.data); alert('Hero image updated locally. Refresh main site to see changes.'); } }); gallery.appendChild(img); }); }catch(e){ console.error(e); } }

  function saveMediaArray(arr){ localStorage.setItem(MEDIA_KEY, JSON.stringify(arr)); }
  function addImageToCanvas(dataUrl){ fabric.Image.fromURL(dataUrl, function(img){ img.set({ left: 80, top: 80, scaleX: Math.min(1, 400/img.width), scaleY: Math.min(1, 400/img.height), cornerColor:'#b87333', borderColor:'#c9a36f' }); canvas.add(img); canvas.setActiveObject(img); canvas.requestRenderAll(); }, { crossOrigin: 'anonymous' }); }

  fileInput.addEventListener('change', function(e){ const files = Array.from(e.target.files); const stored = JSON.parse(localStorage.getItem(MEDIA_KEY) || '[]'); files.forEach(file=>{ const reader = new FileReader(); reader.onload = function(evt){ const data = evt.target.result; stored.unshift({ name: file.name, data }); saveMediaArray(stored); loadMedia(); }; reader.readAsDataURL(file); }); });
  // initial load
  loadMedia();

  // Export PNG
  exportPngBtn.addEventListener('click', ()=>{ const data = canvas.toDataURL({ format:'png', multiplier:2 }); const link = document.createElement('a'); link.href = data; link.download = 'dawkins-plan.png'; document.body.appendChild(link); link.click(); link.remove(); });

  // Export PDF
  exportPdfBtn.addEventListener('click', async ()=>{ const { jsPDF } = window.jspdf; const data = canvas.toDataURL({ format:'png', multiplier:2 }); const pdf = new jsPDF({ orientation: 'landscape' }); const imgProps = pdf.getImageProperties(data); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width; pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight); pdf.save('dawkins-plan.pdf'); });

  // Save/Load JSON
  saveJsonBtn.addEventListener('click', ()=>{ const json = JSON.stringify(canvas.toJSON(['selectable','id'])); const blob = new Blob([json], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'dawkins-plan.json'; document.body.appendChild(link); link.click(); link.remove(); });
  loadJsonInput.addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = function(evt){ const obj = JSON.parse(evt.target.result); canvas.loadFromJSON(obj, canvas.requestRenderAll.bind(canvas)); }; r.readAsText(f); });

  // Apply selected image as hero image for the public site (local only)
  function setHeroImage(dataUrl){ const content = JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}'); content.image = dataUrl; localStorage.setItem(CONTENT_KEY, JSON.stringify(content)); }
  applyHeroBtn.addEventListener('click', ()=>{ const active = canvas.getActiveObject(); if(!active || active.type !== 'image'){ alert('Select an image object on the canvas to apply as hero.'); return; } const data = active.toDataURL({ format: 'png' }); setHeroImage(data); alert('Hero image set locally. Reload the main site page to preview.'); });

  // Optional: upload stored media to local server (if running server.js)
  const serverUploadBtn = document.getElementById('serverUploadBtn');
  async function uploadAllToServer(){
    try{
      const stored = JSON.parse(localStorage.getItem(MEDIA_KEY) || '[]');
      if(!stored.length){ alert('No media found to upload.'); return; }
      const form = new FormData();
      stored.forEach((item, idx)=>{
        // convert dataURL to blob
        const res = item.data.match(/^data:(.*);base64,(.*)$/);
        if(!res) return;
        const mime = res[1]; const bstr = atob(res[2]); let n = bstr.length; const u8 = new Uint8Array(n);
        while(n--) u8[n] = bstr.charCodeAt(n);
        const blob = new Blob([u8], { type: mime });
        form.append('files', blob, item.name || `image-${idx}.png`);
      });
      const resp = await fetch('/api/upload', { method:'POST', body: form });
      if(!resp.ok) throw new Error('Upload failed');
      const json = await resp.json(); alert('Uploaded ' + (json.files?.length||0) + ' files. They are available under /uploads/');
    }catch(e){ alert('Upload error: ' + (e.message||e)); }
  }
  if(serverUploadBtn){ serverUploadBtn.addEventListener('click', uploadAllToServer); }

  // Keyboard shortcuts
  window.addEventListener('keydown', (e)=>{ if(e.key==='Delete'){ const a = canvas.getActiveObject(); if(a) canvas.remove(a); } if(e.ctrlKey && e.key==='s'){ e.preventDefault(); saveJsonBtn.click(); } });

  // Accessibility: focus outlines for added objects
  canvas.on('selection:created', ()=>{});

  // Quick perf hint: when many objects, disable selection on background images
  canvas.on('object:added', ()=>{ const imgs = canvas.getObjects('image'); if(imgs.length>20){ imgs.forEach(i=>i.selectable=false); } });

  // Save canvas to localStorage on change (throttle)
  let saveTimer = null;
  function persistCanvas(){ const data = canvas.toJSON(['selectable','id']); localStorage.setItem('dawkins-canvas-auto', JSON.stringify(data)); }
  canvas.on('object:modified', ()=>{ if(saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(persistCanvas, 800); });
  canvas.on('object:added', ()=>{ if(saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(persistCanvas, 800); });
  // load autosave if exists
  try{ const auto = JSON.parse(localStorage.getItem('dawkins-canvas-auto')||'null'); if(auto) canvas.loadFromJSON(auto, canvas.requestRenderAll.bind(canvas)); }catch(e){/*ignore*/}

})();
