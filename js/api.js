export async function fetchArtworkById(id) {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
  try {
    const response = await fetch(url);
    
    // If the API returns 404 (Not Found), return null gracefully
    if (!response.ok) {
        console.warn(`Artwork with ID ${id} not found.`);
        return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function searchArtworks(query) {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // Limiting to 10 to keep the search manageable
    return data.objectIDs ? data.objectIDs.slice(0, 10) : [];
  } catch (error) {
    console.error("Error searching:", error);
    return [];
  }
}