const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));
const { STOPS, ROUTES, BUSES } = require(path.join(__dirname, "..", "simulation-engine", "config", "simulationConfig"));

let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://codex-hackfest2026-default-rtdb.firebaseio.com",
  });
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const rtdb = getDatabase(app);

async function seedStops() {
  console.log("Seeding stops...");
  const batch = db.batch();
  Object.values(STOPS).forEach((stop) => {
    batch.set(db.collection("stops").doc(stop.id), stop);
  });
  await batch.commit();
  console.log(`✅ ${Object.keys(STOPS).length} stops seeded to Firestore`);
}

async function seedRoutes() {
  console.log("Seeding routes...");
  const batch = db.batch();
  ROUTES.forEach((route) => {
    batch.set(db.collection("routes").doc(route.id), {
      id: route.id,
      name: route.name,
      stopIds: route.stopIds,
    });
  });
  await batch.commit();
  console.log(`✅ ${ROUTES.length} routes seeded to Firestore`);
}

async function seedBuses() {
  console.log("Seeding initial bus states...");
  const updates = {};
  BUSES.forEach((bus) => {
    const route = ROUTES.find((r) => r.id === bus.routeId);
    const firstStop = STOPS[route.stopIds[0]];
    updates[`buses/${bus.busId}`] = {
      routeId: route.id,
      routeName: route.name,
      lat: firstStop.lat,
      lng: firstStop.lng,
      speed: 0,
      bearing: 0,
      occupancy: "Low",
      status: "Starting",
      isDelayed: false,
      delayMinutes: 0,
      nextStop: firstStop.name,
      etaMinutes: 0,
      lastUpdated: Date.now(),
    };
  });
  await rtdb.ref().update(updates);
  console.log(`✅ ${BUSES.length} buses initialized in Realtime DB`);
}

async function seedSimulationState() {
  await rtdb.ref("simulationState").update({
    isRunning: false,
    speedMultiplier: 1,
    currentTime: Date.now(),
  });
  console.log("✅ simulationState ready (isRunning: false)");
}

async function run() {
  try {
    await seedStops();
    await seedRoutes();
    await seedBuses();
    await seedSimulationState();
    console.log("🎉 All Nagpur data seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

run();