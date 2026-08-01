function generateStatus({ isDelayed, occupancy }) {
  if (isDelayed) return "Delayed";
  if (occupancy === "Full") return "Full - On Time";
  return "On Time";
}

module.exports = { generateStatus };