const { db } = require("../config/firebaseConfig");
const { moveBusOneStep } = require("./busMover");
const logger = require("../events/logger");
const simulationEvents = require("../events/eventEmitter");
const { UPDATE_INTERVAL_MS, BUSES } = require("../config/simulationConfig");

let intervalHandle = null;

function startLoop() {
  if (intervalHandle) return;
  logger.info(`Simulation loop starting for ${BUSES.length} buses...`);
  simulationEvents.emit("simulationStarted");

  intervalHandle = setInterval(() => {
    BUSES.forEach((bus) => moveBusOneStep(bus.busId));
  }, UPDATE_INTERVAL_MS);
}

function stopLoop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.warn("Simulation loop stopped");
    simulationEvents.emit("simulationStopped");
  }
}

function listenToSimulationState() {
  const ref = db.ref("simulationState/isRunning");
  ref.on("value", (snapshot) => {
    const isRunning = snapshot.val();
    if (isRunning) startLoop();
    else stopLoop();
  });
}

module.exports = { startLoop, stopLoop, listenToSimulationState };