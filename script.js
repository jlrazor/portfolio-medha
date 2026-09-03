const gallery = document.getElementById('gallery');
const emptyState = document.getElementById('emptyState');
const filtersNav = document.getElementById('filters');
const liveMeta = document.getElementById('liveMeta');

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

let allImages = [];
let activeTag = 'all';

function relativeTime(iso){
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function extractTag(caption){
  const match = (caption || '').match(/#(\w+)/);
  return match ? match[1].toLowerCase() : null;
}

function buildFilters(images){
  const tags = new Set();
  images.forEach(img => {
    const tag = extractTag(img.caption);
    if (tag) tags.add(tag);
  });
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = tag;
    btn.textContent = tag;
    filtersNav.appendChild(btn);
  });
}

function renderGallery(){
  gallery.innerHTML = '';
  const filtered = activeTag === 'all'
    ? allImages
    : allImages.filter(img => extractTag(img.caption) === activeTag);

  filtered.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${Math.min(i * 0.04, 0.4)}s`;

    const image = document.createElement('img');
    image.src = `images/${img.filename}`;
    image.alt = img.caption || 'Illustration du portfolio';
    image.loading = 'lazy';

    const caption = document.createElement('div');
    caption.className = 'card-caption';
    caption.innerHTML = `${img.caption ? img.caption.replace(/#\w+/g, '').trim() : ''}<span class="card-date">${relativeTime(img.timestamp)}</span>`;

    card.appendChild(image);
    card.appendChild(caption);
    card.addEventListener('click', () => openLightbox(img));
    gallery.appendChild(card);
  });

  emptyState.classList.toggle('is-visible', filtered.length === 0);
}

function openLightbox(img){
  lightboxImg.src = `images/${img.filename}`;
  lightboxCaption.textContent = img.caption || '';
  lightbox.classList.add('is-open');
}

lightboxClose.addEventListener('click', () => lightbox.classList.remove('is-open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('is-open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('is-open'); });

filtersNav.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  filtersNav.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  activeTag = btn.dataset.filter;
  renderGallery();
});

async function init(){
  try{
    const res = await fetch('data/images.json', { cache: 'no-store' });
    allImages = await res.json();
  }catch(err){
    console.error('Impossible de charger le manifeste des images', err);
    allImages = [];
  }

  if (allImages.length > 0){
    liveMeta.textContent = `dernière image ${relativeTime(allImages[0].timestamp)}`;
    buildFilters(allImages);
  } else {
    liveMeta.textContent = 'en attente de la première image…';
  }

  renderGallery();
}

init();
