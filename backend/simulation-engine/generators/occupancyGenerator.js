const { OCCUPANCY_LEVELS } = require("../config/simulationConfig");

function generateOccupancy() {
  const index = Math.floor(Math.random() * OCCUPANCY_LEVELS.length);
  return OCCUPANCY_LEVELS[index];
}

module.exports = { generateOccupancy };