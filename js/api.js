export async function fetchArtworkById(id) {
  const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Artwork not found");
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
    
    return data.objectIDs ? data.objectIDs.slice(0, 10) : [];
  } catch (error) {
    console.error("Error searching:", error);
    return [];
  }
}
