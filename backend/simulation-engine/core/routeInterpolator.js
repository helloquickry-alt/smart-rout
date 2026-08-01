// Do points ke beech chhote-chhote intermediate points banata hai (smooth movement ke liye)
function interpolate(start, end, fraction) {
  const lat = start.lat + (end.lat - start.lat) * fraction;
  const lng = start.lng + (end.lng - start.lng) * fraction;
  return { lat, lng };
}

// Ek segment (start->end) ko N steps me todta hai
function buildSegmentSteps(start, end, steps = 10) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    points.push(interpolate(start, end, i / steps));
  }
  return points;
}

module.exports = { interpolate, buildSegmentSteps };