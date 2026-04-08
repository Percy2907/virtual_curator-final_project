import { fetchArtworkById, searchArtworks } from './api.js';
import { getArtistBio } from './wikipedia.js'; 

const gallery = document.querySelector('#gallery');
const searchBtn = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');

// --- Modal Elements ---
const modal = document.querySelector('#bio-modal');
const modalName = document.querySelector('#modal-artist-name');
const modalBio = document.querySelector('#modal-bio-text');
const modalLink = document.querySelector('#modal-link');
const closeBtn = document.querySelector('.close-btn');

// --- Modal Logic ---
async function openBio(artistName) {
    if (!artistName || artistName === 'Unknown Artist') return;

    // 1. Show modal with loading state
    modalName.textContent = artistName;
    modalBio.textContent = "Searching Wikipedia for details...";
    modal.classList.remove('hidden');

    // 2. Call to Wikipedia API
    const bio = await getArtistBio(artistName);
    
    // 3. Update content
    modalBio.textContent = bio;
    modalLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(artistName)}`;
}

// Close modal
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// --- Card Rendering ---
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

    // Wikipedia event (Only if the artist is not unknown)
    const artistSpan = card.querySelector('.artist-link span');
    if (art.artistDisplayName && art.artistDisplayName !== 'Unknown Artist') {
        artistSpan.style.cursor = 'pointer';
        artistSpan.style.color = 'var(--accent-color)';
        artistSpan.addEventListener('click', () => openBio(art.artistDisplayName));
    }

    gallery.appendChild(card);
}

// --- SEARCH FUNCTION ---
async function executeSearch() {
    const query = searchInput.value.trim();
    if (query) {
        gallery.innerHTML = '<div class="feedback-msg">Searching the gallery...</div>'; 
        
        const results = await searchArtworks(query);
        
        if (results.length === 0) {
            gallery.innerHTML = '<div class="feedback-msg">No masterpieces found. Try another search!</div>';
            return;
        }

        gallery.innerHTML = ''; 
        for (const id of results) {
            const artData = await fetchArtworkById(id);
            if (artData) {
                renderCard(artData);
            }
        }
    }
}

// --- Events ---
searchBtn.addEventListener('click', executeSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executeSearch();
    }
});


const initialIds = [436535, 436532, 436528, 437984, 436530, 436529];
async function init() {
    gallery.innerHTML = ''; 
    for (const id of initialIds) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}

init();