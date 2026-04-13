import { fetchArtworkById, searchArtworks } from "./api.js";
import { getArtistBio } from "./wikipedia.js";

const gallery = document.querySelector("#gallery");
const searchBtn = document.querySelector("#search-button");
const randomBtn = document.querySelector("#random-button");
const searchInput = document.querySelector("#search-input");
const viewCollectionBtn = document.querySelector("#view-collection");
const clearCollectionBtn = document.querySelector("#clear-collection");
const galleryTitle = document.querySelector("#gallery-title");

const modal = document.querySelector("#bio-modal");
const closeBtn = document.querySelector(".close-btn");
const modalImage = document.querySelector("#modal-art-image");
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightbox-img");

// LOCAL STORAGE
function getFavorites() {
    return JSON.parse(localStorage.getItem("artFavorites")) || [];
}

function toggleFavorite(art) {
    let favorites = getFavorites();
    const index = favorites.findIndex((fav) => fav.objectID === art.objectID);
    if (index === -1) {
        favorites.push(art);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem("artFavorites", JSON.stringify(favorites));
}

// MODAL VIEW (10 ATTRIBUTES)
async function openDetailedView(art) {
    const artistName = art.artistDisplayName;

    // 1. Image
    modalImage.src = art.primaryImageSmall || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400";
    // 2. Title
    document.querySelector("#modal-art-title").textContent = art.title || "Untitled";
    // 3. Artist
    document.querySelector("#modal-artist-name").textContent = artistName || "Unknown Artist";
    // 4. Date
    document.querySelector("#modal-art-date").textContent = art.objectDate || "Unknown";
    // 5. Medium
    document.querySelector("#modal-art-medium").textContent = art.medium || "Not specified";
    // 6. Culture
    document.querySelector("#modal-art-culture").textContent = art.culture || "Not specified";
    // 7. Dimensions
    document.querySelector("#modal-art-dimensions").textContent = art.dimensions || "Not specified";
    // 8. Department
    document.querySelector("#modal-art-dept").textContent = art.department || "N/A";
    // 9. ID / Accession Number
    document.querySelector("#modal-art-id").textContent = art.accessionNumber || art.objectID;
    // 10. Credit Line
    document.querySelector("#modal-art-credit").textContent = art.creditLine || "The Met Collection";

    document.querySelector("#modal-bio-text").textContent = "Searching Wikipedia...";
    modal.classList.remove("hidden");

    if (artistName && artistName !== "Unknown Artist") {
        const bio = await getArtistBio(artistName);
        document.querySelector("#modal-bio-text").textContent = bio;
        const link = document.querySelector("#modal-link");
        link.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(artistName)}`;
        link.style.display = "inline-block";
    } else {
        document.querySelector("#modal-bio-text").textContent = "No biography available.";
        document.querySelector("#modal-link").style.display = "none";
    }
}

closeBtn.onclick = () => modal.classList.add("hidden");
modalImage.onclick = () => {
    lightboxImg.src = modalImage.src;
    lightbox.classList.remove("hidden");
};

window.onclick = (e) => {
    if (e.target === modal) modal.classList.add("hidden");
    if (e.target === lightbox) lightbox.classList.add("hidden");
};

// RENDERING
function renderCard(art) {
    if (!art || !art.objectID) return;
    const card = document.createElement("div");
    card.className = "art-card";
    const favorites = getFavorites();
    const isFav = favorites.some((fav) => fav.objectID === art.objectID);
    const image = art.primaryImageSmall || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400";

    card.innerHTML = `
        <div class="card-image-container">
            <img src="${image}" alt="${art.title}" loading="lazy">
            <button class="fav-btn ${isFav ? "active" : ""}">❤</button>
        </div>
        <div class="card-content">
            <h3>${art.title || "Untitled"}</h3>
            <p class="artist-link" style="color:var(--accent-color); cursor:pointer;"><strong>${art.artistDisplayName || "Unknown Artist"}</strong></p>
            <p class="repository">${art.repository || ""}</p>
        </div>
    `;

    card.querySelector(".fav-btn").onclick = (e) => {
        e.stopPropagation();
        toggleFavorite(art);
        e.target.classList.toggle("active");
        if (galleryTitle.textContent === "My Collection") showCollection();
    };

    card.querySelector(".artist-link").onclick = () => openDetailedView(art);
    gallery.appendChild(card);
}

// ACTIONS
function showCollection() {
    const favorites = getFavorites();
    galleryTitle.textContent = "My Collection";
    gallery.innerHTML = "";
    if (favorites.length === 0) {
        gallery.innerHTML = '<div class="feedback-msg">Your collection is empty.</div>';
        clearCollectionBtn.style.display = "none";
    } else {
        clearCollectionBtn.style.display = "block";
        favorites.forEach(renderCard);
    }
}

viewCollectionBtn.onclick = (e) => { e.preventDefault(); showCollection(); };

clearCollectionBtn.onclick = () => {
    if (confirm("Clear your collection?")) {
        localStorage.removeItem("artFavorites");
        showCollection();
    }
};

async function executeSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    galleryTitle.textContent = `Results for: ${query}`;
    clearCollectionBtn.style.display = "none";
    gallery.innerHTML = '<div class="feedback-msg">Searching the gallery...</div>';
    const results = await searchArtworks(query);
    gallery.innerHTML = "";
    if (results.length === 0) {
        gallery.innerHTML = '<div class="feedback-msg">No masterpieces found.</div>';
        return;
    }
    for (const id of results) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}

async function discoverRandomArt() {
    gallery.innerHTML = '<div class="feedback-msg">Searching the vaults...</div>';
    let attempts = 0;
    while (attempts < 10) {
        const randomId = Math.floor(Math.random() * 800000) + 1;
        const artData = await fetchArtworkById(randomId);
        if (artData && artData.primaryImageSmall) {
            gallery.innerHTML = "";
            galleryTitle.textContent = "Random Discovery";
            renderCard(artData);
            return;
        }
        attempts++;
    }
}

searchBtn.onclick = executeSearch;
randomBtn.onclick = discoverRandomArt;
searchInput.onkeypress = (e) => { if (e.key === "Enter") executeSearch(); };

const initialIds = [436535, 436532, 436528, 437984, 436530, 436529];
async function init() {
    gallery.innerHTML = "";
    for (const id of initialIds) {
        const artData = await fetchArtworkById(id);
        if (artData) renderCard(artData);
    }
}
init();