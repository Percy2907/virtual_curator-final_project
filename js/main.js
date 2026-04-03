import { fetchArtworkById } from './api.js';

const gallery = document.querySelector('#gallery');

const artworkIds = [436535, 436532, 436528, 437984, 436530, 436529];

async function init() {
    for (const id of artworkIds) {
        const artData = await fetchArtworkById(id);
        if (artData) {
            renderCard(artData);
        }
    }
}

function renderCard(art) {
    const card = document.createElement('div');
    card.className = 'art-card';
    
    const image = art.primaryImageSmall ? art.primaryImageSmall : 'https://via.placeholder.com/300x250?text=No+Image';

    card.innerHTML = `
        <img src="${image}" alt="${art.title}">
        <h3>${art.title}</h3>
        <p>${art.artistDisplayName || 'Unknown Artist'}</p>
    `;
    gallery.appendChild(card);
}

init();