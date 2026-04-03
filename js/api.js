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