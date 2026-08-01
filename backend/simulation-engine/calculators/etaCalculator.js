// distance meters me, speed km/h me -> ETA minutes me
function calculateETA(distanceMeters, speedKmh) {
  if (speedKmh <= 0) return null;
  const speedMps = (speedKmh * 1000) / 3600;
  const etaSeconds = distanceMeters / speedMps;
  return Math.round(etaSeconds / 60); // minutes
}

module.exports = { calculateETA };