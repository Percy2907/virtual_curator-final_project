export async function getArtistBio(artistName) {

    const searchName = encodeURIComponent(artistName);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${searchName}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return "Biography not available at the moment.";
        const data = await response.json();
        return data.extract; 
    } catch (error) {
        console.error("Error fetching Wikipedia data:", error);
        return "Source not found.";
    }
}