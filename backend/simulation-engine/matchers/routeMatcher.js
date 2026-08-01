const { ROUTES, STOPS, BUSES } = require("../config/simulationConfig");

function getRouteForBus(busId) {
  const busEntry = BUSES.find((b) => b.busId === busId);
  if (!busEntry) return null;

  const route = ROUTES.find((r) => r.id === busEntry.routeId);
  if (!route) return null;

  const stops = route.stopIds.map((id) => STOPS[id]);
  return { routeId: route.id, routeName: route.name, stops };
}

module.exports = { getRouteForBus };