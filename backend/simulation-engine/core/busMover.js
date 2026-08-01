const { db } = require("../config/firebaseConfig");
const { buildSegmentSteps } = require("./routeInterpolator");
const { calculateDistance, calculateBearing } = require("../calculators/distanceCalculator");
const { generateSpeed } = require("../calculators/speedCalculator");
const { calculateETA } = require("../calculators/etaCalculator");
const { generateOccupancy } = require("../generators/occupancyGenerator");
const { generateDelay } = require("../generators/delayGenerator");
const { generateStatus } = require("../generators/statusGenerator");
const logger = require("../events/logger");
const simulationEvents = require("../events/eventEmitter");
const { getRouteForBus } = require("../matchers/routeMatcher");

// Har bus ka apna movement state alag rakhte hai
const busStates = new Map();

function getOrInitState(busId) {
  if (!busStates.has(busId)) {
    busStates.set(busId, { segmentIndex: 0, stepIndex: 0, steps: [] });
  }
  return busStates.get(busId);
}

function buildSegment(stops, segmentIndex) {
  const start = stops[segmentIndex];
  const end = stops[(segmentIndex + 1) % stops.length];
  return buildSegmentSteps(start, end, 20);
}

async function moveBusOneStep(busId) {
  const route = getRouteForBus(busId);
  if (!route || route.stops.length < 2) {
    logger.warn(`No valid route found for ${busId}`);
    return;
  }

  const state = getOrInitState(busId);

  if (state.steps.length === 0) {
    state.steps = buildSegment(route.stops, state.segmentIndex);
    state.stepIndex = 0;
  }

  const start = route.stops[state.segmentIndex];

  if (state.stepIndex >= state.steps.length) {
    state.segmentIndex = (state.segmentIndex + 1) % route.stops.length;
    state.steps = buildSegment(route.stops, state.segmentIndex);
    state.stepIndex = 0;
    simulationEvents.emit("stopReached", { busId, stop: start });
  }

  const position = state.steps[state.stepIndex];
  state.stepIndex++;

  const nextStop = route.stops[(state.segmentIndex + 1) % route.stops.length];
  const speed = generateSpeed();
  const bearing = calculateBearing(start.lat, start.lng, nextStop.lat, nextStop.lng);
  const distanceToNext = calculateDistance(position.lat, position.lng, nextStop.lat, nextStop.lng);
  const eta = calculateETA(distanceToNext, speed);
  const occupancy = generateOccupancy();
  const delayInfo = generateDelay();
  const status = generateStatus({ isDelayed: delayInfo.isDelayed, occupancy });

  const busData = {
    routeId: route.routeId,
    routeName: route.routeName,
    lat: position.lat,
    lng: position.lng,
    speed,
    bearing,
    occupancy,
    status,
    isDelayed: delayInfo.isDelayed,
    delayMinutes: delayInfo.delayMinutes,
    nextStop: nextStop.name,
    etaMinutes: eta,
    lastUpdated: Date.now(),
  };

  try {
    await db.ref(`buses/${busId}`).update(busData);
    logger.success(
      `${busId} (${route.routeName}) -> lat: ${position.lat.toFixed(5)}, lng: ${position.lng.toFixed(5)}, next: ${nextStop.name}`
    );
    simulationEvents.emit("busMoved", { busId, ...busData });
  } catch (err) {
    logger.error(`Failed to update ${busId}: ${err.message}`);
  }
}

module.exports = { moveBusOneStep };