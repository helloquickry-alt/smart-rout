// data/store.js
// Central in-memory "database" — single source of truth for the app.
// No Firebase, no external DB — just JS objects living in memory.

import { seedBuses } from "./seedBuses.js";
import { seedRoutes } from "./seedRoutes.js";
import { seedStops } from "./seedStops.js";

// Internal mutable state (module-level, private-ish)
let buses = seedBuses.map((b) => ({ ...b }));
let routes = seedRoutes.map((r) => ({ ...r }));
let stops = seedStops.map((s) => ({ ...s }));

// Simple pub-sub so React can subscribe to store changes
const listeners = new Set();

function notify() {
  listeners.forEach((cb) => cb());
}

export const store = {
  // ---------- BUSES ----------
  getBuses: () => buses,

  getBusById: (busId) => buses.find((b) => b.busId === busId),

  updateBus: (busId, updates) => {
    buses = buses.map((b) => (b.busId === busId ? { ...b, ...updates } : b));
    notify();
  },

  // ---------- ROUTES ----------
  getRoutes: () => routes,

  getRouteById: (routeId) => routes.find((r) => r.routeId === routeId),

  // ---------- STOPS ----------
  getStops: () => stops,

  getStopById: (stopId) => stops.find((s) => s.stopId === stopId),

  // ---------- SUBSCRIBE (for React hook) ----------
  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback); // unsubscribe fn
  },
};