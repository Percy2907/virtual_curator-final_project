import { fetchArtworkById, searchArtworks } from './api.js';

const gallery = document.querySelector('#gallery');
const searchBtn = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');

function renderCard(art) {
    const card = document.createElement('div');
    card.className = 'art-card';
    
    // Placeholder
    const image = art.primaryImageSmall 
        ? art.primaryImageSmall 
        : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop';

    card.innerHTML = `
        <img src="${image}" alt="${art.title}" loading="lazy">
        <div class="card-content">
            <h3>${art.title || 'Untitled'}</h3>
            <p><strong>Artist:</strong> ${art.artistDisplayName || 'Unknown Artist'}</p>
            <p class="repository"><em>${art.repository || ''}</em></p>
        </div>
    `;
    gallery.appendChild(card);
}

// Search Function
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

// EVENTS
searchBtn.addEventListener('click', executeSearch);

// Detect enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        executeSearch();
    }
});

// Loading Initial (Van Gogh)
const initialIds = [436535, 436532, 436528, 437984, 436530, 436529];
async function init() {
    gallery.innerHTML = ''; 
    for (const id of initialIds) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}

init();