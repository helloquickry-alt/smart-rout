const { calculateDistance } = require("../calculators/distanceCalculator");
const { NEARBY_THRESHOLD_METERS } = require("../config/simulationConfig");

// Current position ke sabse nazdeek stop dhundta hai
function findNearestStop(currentLat, currentLng, stops) {
  let nearest = null;
  let minDist = Infinity;

  for (const stop of stops) {
    const dist = calculateDistance(currentLat, currentLng, stop.lat, stop.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = stop;
    }
  }

  return {
    stop: nearest,
    distance: minDist,
    isAtStop: minDist <= NEARBY_THRESHOLD_METERS,
  };
}

module.exports = { findNearestStop };