const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const contentKey = 'dawkins-site-content-v11';
const inquiryKey = 'dawkins-inquiries';
const defaults = { headline: 'Honest work.<br><em>Built to last.</em>', intro: 'Owner-led construction and carpentry rooted in Foster, Rhode Island—thoughtfully planned, clearly communicated, and built with lasting respect for your home.', image: 'media/hero/cabin-in-the-woods-crisp.webp' };
const readStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
$('.menu-close').setAttribute('aria-label', 'Close menu');
$$('.modal-close').forEach(button => { button.type = 'button'; if (!button.getAttribute('aria-label')) button.setAttribute('aria-label', 'Close dialog'); });
$$('.desk-card').forEach(card => { const label = card.querySelector('b')?.textContent?.trim(); if (label) { card.setAttribute('aria-label', label); card.setAttribute('title', label); } });
let content = { ...defaults, ...readStored(contentKey, {}) };
function setHeadline(value) { const heading = $('#hero-title'); if (value === defaults.headline) { heading.innerHTML = defaults.headline; return; } const lines = String(value).replace(/<[^>]*>/g, '').split(/\r?\n/); heading.replaceChildren(...lines.flatMap((line, index) => index ? [document.createElement('br'), document.createTextNode(line)] : [document.createTextNode(line)])); }
function applyContent() { setHeadline(content.headline); $('.hero-intro').textContent = content.intro; $('.hero-image img').src = content.image; }
applyContent(); $('#year').textContent = new Date().getFullYear();

// Seasonal hero switching (winter/spring/summer/autumn)
(function setSeasonalHero(){
  const heroImg = document.getElementById('hero-photo');
  const heroEl = document.querySelector('.hero');
  if(!heroImg || !heroEl) return;
  const month = new Date().getMonth() + 1;
  const season = (month===12 || month<=2) ? 'winter' : (month<=5) ? 'spring' : (month<=8) ? 'summer' : 'autumn';
  document.body.classList.remove('season-winter','season-spring','season-summer','season-autumn');
  document.body.classList.add('season-'+season);
  const trySet = (path) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = path;
    });
  };
  (async ()=>{
    const base = 'media/hero/cabin-in-the-woods-'+season;
    const candidates = [
      {path: base+'-crisp.webp', srcset: base+'-crisp.webp'},
      {path: base+'-clear-800.jpg', srcset: base+'-clear-800.jpg 800w, '+base+'-crisp.webp 1254w'},
      {path: 'media/hero/cabin-in-the-woods-crisp.webp', srcset: 'media/hero/cabin-in-the-woods-crisp.webp'},
    ];
    let found = null;
    for(const c of candidates){
      // eslint-disable-next-line no-await-in-loop
      const ok = await trySet(c.path);
      if(ok){ found = c; break; }
    }
    if(found){
      heroImg.src = found.path;
      if(found.srcset) heroImg.srcset = found.srcset;
      const bg = 'linear-gradient(180deg,rgba(251,248,240,.68) 0%,rgba(251,248,240,.22) 43%,rgba(251,248,240,0) 72%), url("'+found.path+'")';
      heroEl.style.setProperty('background-image', bg, 'important');
    }
    // Wildlife timing and visibility are controlled together in CSS so the
    // scene remains restrained and consistent at every viewport size.
  })();
})();
let scrollTicking = false;
window.addEventListener('scroll', () => { if (!scrollTicking) requestAnimationFrame(() => { const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight); $('.progress').style.width = `${Math.min(100, scrollY / distance * 100)}%`; scrollTicking = false; }); scrollTicking = true; }, { passive: true });
const panel = $('.menu-panel'); const closeMenu = () => { panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); $('.menu-trigger').setAttribute('aria-expanded','false'); }; $('.menu-trigger').setAttribute('aria-expanded','false'); $('.menu-trigger').onclick = () => { panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); $('.menu-trigger').setAttribute('aria-expanded','true'); }; $('.menu-close').onclick = closeMenu;
$$('.menu-panel a').forEach(a => a.onclick = closeMenu);
$$('[data-modal]').forEach(b => b.onclick = () => { panel.classList.remove('open'); $(`#${b.dataset.modal}`).showModal(); });
$$('.modal-close').forEach(b => b.onclick = () => b.closest('dialog').close());
$$('dialog').forEach(d => d.addEventListener('click', e => { if(e.target === d) d.close(); }));

// Project Trailhead: a private, on-page planning aid that carries the
// homeowner's choices into the existing inquiry form only when invited.
const trailPlanner = $('#trail-planner');
if (trailPlanner) {
  const steps = $$('.planner-step', trailPlanner);
  const progressStones = $$('.planner-progress i', trailPlanner);
  const nextButton = $('.planner-next', trailPlanner);
  const backButton = $('.planner-back', trailPlanner);
  const result = $('.planner-result', trailPlanner);
  const choices = [null, null, null];
  let currentStep = 0;

  const showStep = index => {
    currentStep = index;
    steps.forEach((step, stepIndex) => step.classList.toggle('active', stepIndex === index));
    progressStones.forEach((stone, stoneIndex) => stone.classList.toggle('active', stoneIndex <= index));
    backButton.hidden = index === 0;
    nextButton.hidden = false;
    nextButton.disabled = !choices[index];
    nextButton.textContent = index === steps.length - 1 ? 'Show my first step' : 'Continue along the trail';
    result.hidden = true;
  };

  steps.forEach((step, stepIndex) => {
    $$('.planner-choices button', step).forEach(button => button.addEventListener('click', () => {
      $$('.planner-choices button', step).forEach(option => option.classList.remove('selected'));
      button.classList.add('selected');
      choices[stepIndex] = button.dataset.value;
      nextButton.disabled = false;
    }));
  });

  nextButton.addEventListener('click', () => {
    if (!choices[currentStep]) return;
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
      return;
    }
    steps.forEach(step => step.classList.remove('active'));
    progressStones.forEach(stone => stone.classList.add('active'));
    nextButton.hidden = true;
    backButton.hidden = false;
    const summary = `You are considering ${choices[0].toLowerCase()}, you are ${choices[1].toLowerCase()}, and ${choices[2].toLowerCase()} matters most right now. That is enough for a useful first conversation—no polished brief required.`;
    $('#planner-summary').textContent = summary;
    result.hidden = false;
  });

  backButton.addEventListener('click', () => {
    if (!result.hidden) { showStep(steps.length - 1); return; }
    if (currentStep > 0) showStep(currentStep - 1);
  });

  $('.planner-send', trailPlanner).addEventListener('click', () => {
    const inquiry = $('#inquiry');
    const typeSelect = $('select[name="type"]', inquiry);
    const details = $('textarea[name="details"]', inquiry);
    if ([...typeSelect.options].some(option => option.value === choices[0])) typeSelect.value = choices[0];
    details.value = `Project stage: ${choices[1]}\nWhat matters most: ${choices[2]}\n\nAdditional details: `;
    inquiry.showModal();
    details.focus();
    details.setSelectionRange(details.value.length, details.value.length);
  });
}
$('#inquiry-form').onsubmit = e => { e.preventDefault(); const entry = Object.fromEntries(new FormData(e.target)); const all = readStored(inquiryKey, []); all.unshift({ ...entry, date: new Date().toLocaleDateString() }); localStorage.setItem(inquiryKey, JSON.stringify(all.slice(0, 100))); $('.form-message', e.target).textContent = 'Thank you. We appreciate the note and will be in touch soon.'; e.target.reset(); };
$('#portal-form').onsubmit = e => { e.preventDefault(); $('.portal-login').classList.add('hidden'); $('.portal-dashboard').classList.remove('hidden'); };
$('.portal-signout').onclick = () => { $('.portal-dashboard').classList.add('hidden'); $('.portal-login').classList.remove('hidden'); };
$('#trade-form').onsubmit = e => { e.preventDefault(); $('.trade-login').classList.add('hidden'); $('.trade-dashboard').classList.remove('hidden'); };
$('.trade-signout').onclick = () => { $('.trade-dashboard').classList.add('hidden'); $('.trade-login').classList.remove('hidden'); };
$$('.dashboard-tabs button').forEach(button => button.onclick = () => { $$('.dashboard-tabs button').forEach(tab => tab.classList.remove('active')); button.classList.add('active'); });
function updateInquiryCount(){ $('#inquiry-count').textContent = readStored(inquiryKey, []).length; } updateInquiryCount();
$('#admin-form').onsubmit = e => { e.preventDefault(); if($('input',e.target).value.toLowerCase() !== 'dawkins'){ alert('For this demo, use the access code “dawkins”.'); return; } $('.admin-login').classList.add('hidden'); $('.admin-dashboard').classList.remove('hidden'); updateInquiryCount(); };
$('.admin-signout').onclick = () => { $('.admin-dashboard').classList.add('hidden'); $('.admin-login').classList.remove('hidden'); };
$$('.open-editor').forEach(b => b.onclick = () => { $('.editor').classList.remove('hidden'); $('#edit-headline').value = content.headline.replace('<br>',' ').replace(/<[^>]*>/g,''); $('#edit-intro').value = content.intro; $('#edit-image').value = content.image; });
$('.close-editor').onclick = () => $('.editor').classList.add('hidden');
$('.save-content').onclick = () => { const h = $('#edit-headline').value.trim(); content = { headline: h, intro: $('#edit-intro').value.trim(), image: $('#edit-image').value.trim() || defaults.image }; localStorage.setItem(contentKey, JSON.stringify(content)); applyContent(); $('.editor').classList.add('hidden'); alert('Published. Your updates are now live in this browser.'); };
$('.show-inquiries').onclick = () => { const list = $('.inquiries-list'); const all = readStored(inquiryKey, []); list.classList.remove('hidden'); list.innerHTML = all.length ? all.map(x => `<article><b>${escapeHTML(x.name)}</b> · ${escapeHTML(x.email)}<br><span>${escapeHTML(x.type || '')} — ${escapeHTML(x.details || 'No additional details')} <small>(${escapeHTML(x.date)})</small></span></article>`).join('') : '<article>No inquiries have been received on this device yet.</article>'; };
const storyToggle = $('.story-gallery-toggle');
const storyGallery = $('#story-gallery');
storyToggle.onclick = () => { const opening = storyGallery.hidden; storyGallery.hidden = !opening; storyToggle.setAttribute('aria-expanded', String(opening)); storyToggle.lastChild.textContent = opening ? 'Hide additional photographs' : 'View more of our story'; };
const photoLightbox = $('#photo-lightbox');
const openPhoto = image => { const caption = image.closest('figure')?.querySelector('figcaption'); const captionText = caption ? [...caption.children].map(part => part.textContent.trim()).filter(Boolean).join(' · ') || caption.textContent.trim() : image.alt; $('img', photoLightbox).src = image.currentSrc || image.src; $('img', photoLightbox).alt = image.alt; $('p', photoLightbox).textContent = captionText; photoLightbox.showModal(); };
$$('.story-gallery img').forEach(image => { image.tabIndex = 0; image.setAttribute('role','button'); image.setAttribute('aria-label',`${image.alt}. Open larger photograph.`); image.onclick = () => openPhoto(image); image.onkeydown = event => { if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); openPhoto(image); } }; });
$$('.project-gallery figure>button').forEach(button => {
  const image = $('img', button);
  button.setAttribute('aria-label', `${image.alt}. Open larger photograph.`);
  button.onclick = () => openPhoto(image);
});
$$('.project-filters button').forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.onclick = () => {
  const filter = button.dataset.filter;
  $$('.project-filters button').forEach(option => { const active = option === button; option.classList.toggle('active', active); option.setAttribute('aria-pressed', String(active)); });
  $$('.project-gallery figure').forEach(figure => figure.classList.toggle('filtered-out', filter !== 'all' && figure.dataset.category !== filter));
  };
});
$('.lightbox-close').onclick = () => photoLightbox.close();

// Quiet entrance motion makes the long page read as one continuous journey.
// Visitors who prefer reduced motion receive the same content without animation.
const motionItems = $$('.desk-card, .section-signet, .process-brook article, .trail-planner, .collection-link, .project-gallery figure, .faq-list details, .footer-tools > *');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  motionItems.forEach((item, index) => {
    item.classList.add('motion-item');
    item.style.transitionDelay = `${(index % 5) * 70}ms`;
  });
  const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      motionObserver.unobserve(entry.target);
    }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  motionItems.forEach(item => motionObserver.observe(item));
}
