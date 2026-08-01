export function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Bus se ek specific stop tak real ETA nikalta hai
// bus         -> RTDB se aaya live bus object (lat, lng, speed, nextStop)
// route       -> Firestore route object (stops: [stopId, stopId, ...] order-wise)
// stopsMap    -> saare stops ka { id: {stopName/name, lat, lng} } map
// targetStopId-> jaha tak ETA chahiye (jaise Congress Nagar ka id)
const DEFAULT_SPEED_KMH = 20; // agar bus ki live speed available na ho, fallback

function getStopName(stop) {
  return stop?.stopName ?? stop?.name ?? "";
}

export function calculateStopETA(bus, route, stopsMap, targetStopId) {
  if (!bus || !route || !targetStopId) return null;

  const path = route.stops || route.stopIds || [];
  if (path.length === 0) return null;

  // Route ke stops me se bus ka "next stop" dhundo (naam match karke)
  const nextStopIndex = path.findIndex(
    (id) => getStopName(stopsMap[id]).toLowerCase() === (bus.nextStop || "").toLowerCase()
  );
  const targetIndex = path.indexOf(targetStopId);

  // Agar next stop ya target stop route me nahi mila, ya target peeche reh gaya hai
  if (nextStopIndex === -1 || targetIndex === -1 || targetIndex < nextStopIndex) {
    return { reachable: false };
  }

  const nextStop = stopsMap[path[nextStopIndex]];
  if (!nextStop) return { reachable: false };

  // Step 1: bus ki current location se next stop tak distance
  let totalMeters = calculateDistanceMeters(bus.lat, bus.lng, nextStop.lat, nextStop.lng);

  // Step 2: next stop se target stop tak, beech ke saare segments jodo
  for (let i = nextStopIndex; i < targetIndex; i++) {
    const a = stopsMap[path[i]];
    const b = stopsMap[path[i + 1]];
    if (!a || !b) continue;
    totalMeters += calculateDistanceMeters(a.lat, a.lng, b.lat, b.lng);
  }

  // Step 3: time nikalo bus ki live speed se (agar available hai)
  const speedKmh = bus.speed && bus.speed > 0 ? bus.speed : DEFAULT_SPEED_KMH;
  const distanceKm = totalMeters / 1000;
  const etaMinutes = Math.round((distanceKm / speedKmh) * 60);

  return {
    reachable: true,
    distanceKm: Number(distanceKm.toFixed(1)),
    etaMinutes,
    usedFallbackSpeed: !(bus.speed && bus.speed > 0),
  };
}