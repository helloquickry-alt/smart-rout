const { DELAY_CHANCE, MAX_DELAY_MINUTES } = require("../config/simulationConfig");

function generateDelay() {
  const isDelayed = Math.random() < DELAY_CHANCE;
  if (!isDelayed) return { isDelayed: false, delayMinutes: 0 };

  const delayMinutes = Math.round(Math.random() * MAX_DELAY_MINUTES);
  return { isDelayed: true, delayMinutes };
}

module.exports = { generateDelay };