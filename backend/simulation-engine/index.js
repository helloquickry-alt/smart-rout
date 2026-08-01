const { listenToSimulationState } = require("./core/simulationLoop");
const logger = require("./events/logger");

logger.info("Simulation engine initialized. Waiting for simulationState/isRunning...");
listenToSimulationState();