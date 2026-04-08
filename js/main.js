import { fetchArtworkById, searchArtworks } from './api.js';
import { getArtistBio } from './wikipedia.js'; 

const gallery = document.querySelector('#gallery');
const searchBtn = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');

// MODAL ELEMENTS
const modal = document.querySelector('#bio-modal');
const modalName = document.querySelector('#modal-artist-name');
const modalArtTitle = document.querySelector('#modal-art-title');
const modalBio = document.querySelector('#modal-bio-text');
const modalLink = document.querySelector('#modal-link');
const modalDate = document.querySelector('#modal-art-date');
const modalMedium = document.querySelector('#modal-art-medium');
const modalCulture = document.querySelector('#modal-art-culture');
const closeBtn = document.querySelector('.close-btn');

// OPEN MODAL WITH DETAILS AND BIO 
async function openDetailedView(art) {
    const artistName = art.artistDisplayName;
    
    // Fill in technical details immediately
    modalArtTitle.textContent = art.title || "Untitled";
    modalName.textContent = artistName || "Unknown Artist";
    modalDate.textContent = art.objectDate || "Unknown";
    modalMedium.textContent = art.medium || "Not specified";
    modalCulture.textContent = art.culture || "Not specified";
    
    // Loading status for Wikipedia
    modalBio.textContent = "Searching Wikipedia...";
    modal.classList.remove('hidden');

    if (artistName && artistName !== 'Unknown Artist') {
        const bio = await getArtistBio(artistName);
        modalBio.textContent = bio;
        modalLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(artistName)}`;
        modalLink.style.display = "inline-block";
    } else {
        modalBio.textContent = "No biography available for unknown artists.";
        modalLink.style.display = "none";
    }
}

// Close Modal
closeBtn.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

function renderCard(art) {
    const card = document.createElement('div');
    card.className = 'art-card';
    
    const image = art.primaryImageSmall 
        ? art.primaryImageSmall 
        : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop';

    card.innerHTML = `
        <img src="${image}" alt="${art.title}" loading="lazy">
        <div class="card-content">
            <h3>${art.title || 'Untitled'}</h3>
            <p class="artist-link"><strong>Artist:</strong> <span>${art.artistDisplayName || 'Unknown Artist'}</span></p>
            <p class="repository"><em>${art.repository || ''}</em></p>
        </div>
    `;

    // Click on the name or image to open details
    const trigger = card.querySelector('.artist-link span');
    trigger.style.cursor = 'pointer';
    trigger.style.color = 'var(--accent-color)';
    trigger.onclick = () => openDetailedView(art);

    gallery.appendChild(card);
}

async function executeSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    gallery.innerHTML = '<div class="feedback-msg">Searching the gallery...</div>'; 
    const results = await searchArtworks(query);
    
    if (results.length === 0) {
        gallery.innerHTML = '<div class="feedback-msg">No masterpieces found.</div>';
        return;
    }

    gallery.innerHTML = ''; 
    for (const id of results) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}

searchBtn.onclick = executeSearch;
searchInput.onkeypress = (e) => { if (e.key === 'Enter') executeSearch(); };

// Initial Load
const initialIds = [436535, 436532, 436528, 437984, 436530, 436529];
async function init() {
    gallery.innerHTML = ''; 
    for (const id of initialIds) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}
init();