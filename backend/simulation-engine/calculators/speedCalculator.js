const { DEFAULT_SPEED_KMH, SPEED_VARIATION } = require("../config/simulationConfig");

function generateSpeed() {
  const min = DEFAULT_SPEED_KMH - SPEED_VARIATION;
  const max = DEFAULT_SPEED_KMH + SPEED_VARIATION;
  const speed = Math.random() * (max - min) + min;
  return Math.max(5, Math.round(speed * 10) / 10); // never below 5 km/h
}

module.exports = { generateSpeed };