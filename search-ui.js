// search-ui.js — client-side Lunr search UI
// Expects publish/search-index.json to exist and lunr.js to be loaded
(async function(){
  try {
    const res = await fetch('/search-index.json');
    const docs = await res.json();
    const lunrIndex = lunr(function(){
      this.ref('id');
      this.field('title');
      this.field('body');
      docs.forEach(d => this.add(d));
    });
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    const resultsEl = document.getElementById('search-results');
    function render(results){
      if (!results || results.length === 0) { resultsEl.innerHTML = '<p>No results</p>'; return }
      const html = results.map(r => {
        const doc = docs.find(d => d.id === r.ref);
        const snippet = (doc.body || '').slice(0,200) + '...';
        return `<article class="search-hit"><a href="${doc.url}"><h3>${escapeHtml(doc.title)}</h3></a><p>${escapeHtml(snippet)}</p></article>`
      }).join('');
      resultsEl.innerHTML = html;
    }
    function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]) }
    if (form && input){
      form.addEventListener('submit', function(e){ e.preventDefault(); const q = input.value.trim(); if (!q) return; const r = lunrIndex.search(q); render(r); });
    }
    // expose for console
    window.__siteSearch = {index: lunrIndex, docs: docs, search: (q) => lunrIndex.search(q)};
  } catch (err){ console.error('Search UI error', err); }
})();
