// OSRM free routing API — stops ke beech actual road path deta hai
export async function getRoadRoute(stops) {
  if (!stops || stops.length < 2) return [];

  const coords = stops.map((s) => `${s.lng},${s.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.length) {
      throw new Error("No route found");
    }

    // OSRM [lng, lat] deta hai, Leaflet ko [lat, lng] chahiye
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } catch (err) {
    console.warn("Road routing failed, using straight line fallback:", err.message);
    return stops.map((s) => [s.lat, s.lng]);
  }
}