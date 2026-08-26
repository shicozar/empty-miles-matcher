// Small fixed lookup of CA cities for demo purposes.
// Real version would call a geocoding API; this keeps the demo
// self-contained with no external dependency or API key needed.
export const CITY_COORDS = {
  "sacramento, ca": { lat: 38.5816, lng: -121.4944 },
  "fresno, ca": { lat: 36.7378, lng: -119.7871 },
  "stockton, ca": { lat: 37.9577, lng: -121.2908 },
  "modesto, ca": { lat: 37.6391, lng: -120.9969 },
  "manteca, ca": { lat: 37.7974, lng: -121.2161 },
  "hayward, ca": { lat: 37.6688, lng: -122.0808 },
  "oakland, ca": { lat: 37.8044, lng: -122.2712 },
  "san jose, ca": { lat: 37.3382, lng: -121.8863 },
  "los angeles, ca": { lat: 34.0522, lng: -118.2437 },
  "san diego, ca": { lat: 32.7157, lng: -117.1611 },
  "bakersfield, ca": { lat: 35.3733, lng: -119.0187 },
  "san francisco, ca": { lat: 37.7749, lng: -122.4194 },
  "merced, ca": { lat: 37.3022, lng: -120.4830 },
  "turlock, ca": { lat: 37.4947, lng: -120.8466 },
};

export function normalizeCity(name) {
  return (name || "").trim().toLowerCase();
}

export function getCoords(name) {
  return CITY_COORDS[normalizeCity(name)] || null;
}

// Haversine distance in miles
export function distanceMiles(a, b) {
  if (!a || !b) return null;
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
