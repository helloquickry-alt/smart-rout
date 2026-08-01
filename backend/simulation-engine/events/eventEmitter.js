const EventEmitter = require("events");

class SimulationEventEmitter extends EventEmitter {}

const simulationEvents = new SimulationEventEmitter();

// Available events: "busMoved", "stopReached", "simulationStarted", "simulationStopped"
module.exports = simulationEvents;