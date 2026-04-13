import { fetchArtworkById, searchArtworks } from './api.js';
import { getArtistBio } from './wikipedia.js'; 

// --- DOM ELEMENTS ---
const gallery = document.querySelector('#gallery');
const searchBtn = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');
const viewCollectionBtn = document.querySelector('#view-collection');
const clearCollectionBtn = document.querySelector('#clear-collection');
const galleryTitle = document.querySelector('#gallery-title');

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

// --- LOCAL STORAGE LOGIC ---

/**
 * Retrieves the favorites list from LocalStorage.
 * Returns an empty array if nothing is found.
 */
function getFavorites() {
    return JSON.parse(localStorage.getItem('artFavorites')) || [];
}

/**
 * Adds or removes an artwork from the favorites list.
 */
function toggleFavorite(art) {
    let favorites = getFavorites();
    const index = favorites.findIndex(fav => fav.objectID === art.objectID);
    
    if (index === -1) {
        favorites.push(art);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('artFavorites', JSON.stringify(favorites));
}

// --- MODAL LOGIC ---

async function openDetailedView(art) {
    const artistName = art.artistDisplayName;
    modalArtTitle.textContent = art.title || "Untitled";
    modalName.textContent = artistName || "Unknown Artist";
    modalDate.textContent = art.objectDate || "Unknown";
    modalMedium.textContent = art.medium || "Not specified";
    modalCulture.textContent = art.culture || "Not specified";
    
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

closeBtn.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };

// --- RENDERING LOGIC ---

/**
 * Creates and appends an art card to the gallery.
 */
function renderCard(art) {
    // If art is null (due to a 404 error from the API), do nothing.
    if (!art || !art.objectID) return;

    const card = document.createElement('div');
    card.className = 'art-card';
    
    const favorites = getFavorites();
    const isFav = favorites.some(fav => fav.objectID === art.objectID);

    const image = art.primaryImageSmall 
        ? art.primaryImageSmall 
        : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400';

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${image}" alt="${art.title}" loading="lazy">
            <button class="fav-btn ${isFav ? 'active' : ''}" title="Save to Collection">❤</button>
        </div>
        <div class="card-content">
            <h3>${art.title || 'Untitled'}</h3>
            <p class="artist-link"><strong>Artist:</strong> <span>${art.artistDisplayName || 'Unknown Artist'}</span></p>
            <p class="repository"><em>${art.repository || ''}</em></p>
        </div>
    `;

    const favBtn = card.querySelector('.fav-btn');
    favBtn.onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(art);
        favBtn.classList.toggle('active');
        
        // If in "My Collection" view, remove card immediately if un-favorited
        if (galleryTitle.textContent === "My Collection" && !favBtn.classList.contains('active')) {
            card.remove();
            if (getFavorites().length === 0) {
                gallery.innerHTML = '<div class="feedback-msg">Your collection is empty.</div>';
                clearCollectionBtn.style.display = 'none';
            }
        }
    };

    const trigger = card.querySelector('.artist-link span');
    trigger.style.cursor = 'pointer';
    trigger.style.color = 'var(--accent-color)';
    trigger.onclick = () => openDetailedView(art);

    gallery.appendChild(card);
}

/**
 * Handles the display of the user's saved collection.
 */
function showCollection() {
    const favorites = getFavorites();
    galleryTitle.textContent = "My Collection";
    gallery.innerHTML = ''; // CRITICAL: Clear to avoid duplicates
    
    if (favorites.length === 0) {
        gallery.innerHTML = '<div class="feedback-msg">Your collection is empty.</div>';
        clearCollectionBtn.style.display = 'none';
    } else {
        clearCollectionBtn.style.display = 'block';
        favorites.forEach(art => renderCard(art));
    }
}

// --- EVENT HANDLERS ---

viewCollectionBtn.onclick = (e) => {
    e.preventDefault();
    showCollection();
};

clearCollectionBtn.onclick = () => {
    if (confirm("Are you sure you want to clear your entire collection?")) {
        localStorage.removeItem('artFavorites');
        showCollection();
    }
};

async function executeSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    galleryTitle.textContent = `Results for: ${query}`;
    clearCollectionBtn.style.display = 'none';
    gallery.innerHTML = '<div class="feedback-msg">Searching the gallery...</div>'; 
    
    const results = await searchArtworks(query);
    
    // Clear gallery again to remove the "Searching" message before rendering results
    gallery.innerHTML = ''; 

    if (results.length === 0) {
        gallery.innerHTML = '<div class="feedback-msg">No masterpieces found.</div>';
        return;
    }
    
    for (const id of results) {
        const artData = await fetchArtworkById(id);
        // Defensive check: only render if fetch succeeded
        if (artData) renderCard(artData);
    }
}

searchBtn.onclick = executeSearch;
searchInput.onkeypress = (e) => { if (e.key === 'Enter') executeSearch(); };

// --- INITIAL LOAD ---

const initialIds = [436535, 436532, 436528, 437984, 436530, 436529];

async function init() {
    // Only load initial images if the title hasn't changed to "My Collection" or a search
    if (galleryTitle.textContent === "Art Gallery") {
        gallery.innerHTML = ''; 
        for (const id of initialIds) {
            const artData = await fetchArtworkById(id);
            if (artData) renderCard(artData);
        }
    }
}

init();