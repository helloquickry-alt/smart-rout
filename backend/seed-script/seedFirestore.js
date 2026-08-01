/**
 * seedFirestore.js
 * ------------------------------------------------------
 * Ye script Firestore me sample/dummy data push karega,
 * bilkul us data structure ke hisaab se jo frontend team
 * ko diya gaya tha (Smart-Bus-Data-Structure-AI-Prompt.md).
 *
 * NOTE: firebase-admin v13+ / v14+ modular API use karta hai
 * (purana admin.firestore() wala style ab deprecated hai)
 *
 * SETUP (ek baar karna hai):
 * 1. npm install firebase-admin
 * 2. Firebase Console -> Project Settings -> Service Accounts
 *    -> "Generate New Private Key" -> JSON file download karo
 * 3. Us file ka naam "serviceAccountKey.json" rakho aur
 *    isi folder me rakho jaha ye script hai
 * 4. Neeche "databaseURL" apne project ke hisaab se check kar lo
 *
 * RUN:
 *    node seedFirestore.js
 * ------------------------------------------------------
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getDatabase, ServerValue } = require("firebase-admin/database");

const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://codex-hackfest2026-default-rtdb.firebaseio.com",
});

const db = getFirestore(app);
const rtdb = getDatabase(app);

async function seed() {
  console.log("🚀 Seeding started...\n");

  // ------------------------------------------------------
  // 1. STOPS (pehle banate hai kyuki routes isse reference karte hai)
  // ------------------------------------------------------
  const stops = [
    {
      id: "stop_001",
      stopName: "Sitabuldi Bus Stand",
      location: { lat: 21.1466, lng: 79.0849 },
      connectedRoutes: ["route_001"],
      nearbyPlaces: ["Sitabuldi Market", "Variety Square"],
    },
    {
      id: "stop_002",
      stopName: "Dharampeth Chowk",
      location: { lat: 21.1394, lng: 79.0722 },
      connectedRoutes: ["route_001"],
      nearbyPlaces: ["Dharampeth College", "Central Mall"],
    },
    {
      id: "stop_003",
      stopName: "MIHAN Gate",
      location: { lat: 21.0921, lng: 79.0472 },
      connectedRoutes: ["route_001"],
      nearbyPlaces: ["MIHAN SEZ", "Airport Road"],
    },
  ];

  for (const stop of stops) {
    const { id, ...data } = stop;
    await db.collection("stops").doc(id).set(data);
  }
  console.log("✅ stops seeded");

  // ------------------------------------------------------
  // 2. ROUTES
  // ------------------------------------------------------
  const routes = [
    {
      id: "route_001",
      routeName: "Route 12 - Sitabuldi to MIHAN",
      source: { name: "Sitabuldi Bus Stand", lat: 21.1466, lng: 79.0849 },
      destination: { name: "MIHAN Gate", lat: 21.0921, lng: 79.0472 },
      stops: ["stop_001", "stop_002", "stop_003"],
      distance: 14.5,
      estimatedTime: 35,
      status: "active",
    },
  ];

  for (const route of routes) {
    const { id, ...data } = route;
    await db.collection("routes").doc(id).set(data);
  }
  console.log("✅ routes seeded");

  // ------------------------------------------------------
  // 3. DRIVERS
  // ------------------------------------------------------
  const drivers = [
    {
      id: "driver_001",
      name: "Ramesh Patil",
      phone: "9876543210",
      licenseNumber: "MH31-2020-0012345",
      assignedBusId: "bus_001",
      status: "active",
    },
  ];

  for (const driver of drivers) {
    const { id, ...data } = driver;
    await db.collection("drivers").doc(id).set(data);
  }
  console.log("✅ drivers seeded");

  // ------------------------------------------------------
  // 4. BUSES
  // ------------------------------------------------------
  const buses = [
    {
      id: "bus_001",
      busNumber: "MH-31-AB-1234",
      routeId: "route_001",
      driverId: "driver_001",
      capacity: 50,
      currentOccupancy: 22,
      status: "active",
    },
  ];

  for (const bus of buses) {
    const { id, ...data } = bus;
    await db.collection("buses").doc(id).set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log("✅ buses seeded");

  // ------------------------------------------------------
  // 5. USERS (favorites & trips subcollections ke saath)
  // ------------------------------------------------------
  const userId = "user_test_001";
  await db.collection("users").doc(userId).set({
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "9123456780",
    photoURL: "",
    role: "user",
    createdAt: FieldValue.serverTimestamp(),
  });

  await db
    .collection("users")
    .doc(userId)
    .collection("favorites")
    .doc("fav_001")
    .set({
      type: "route",
      refId: "route_001",
      addedAt: FieldValue.serverTimestamp(),
    });

  await db
    .collection("users")
    .doc(userId)
    .collection("trips")
    .doc("trip_hist_001")
    .set({
      routeId: "route_001",
      busId: "bus_001",
      date: FieldValue.serverTimestamp(),
      status: "completed",
    });
  console.log("✅ users (+ favorites, trips subcollections) seeded");

  // ------------------------------------------------------
  // 6. ADMINS
  // ------------------------------------------------------
  await db.collection("admins").doc("admin_test_001").set({
    name: "Test Admin",
    email: "admin@example.com",
    role: "superadmin",
    permissions: ["all"],
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("✅ admins seeded");

  // ------------------------------------------------------
  // 7. TRIPS (global collection, admin side ke liye)
  // ------------------------------------------------------
  await db.collection("trips").doc("trip_001").set({
    busId: "bus_001",
    routeId: "route_001",
    startTime: FieldValue.serverTimestamp(),
    endTime: null,
    status: "active",
    passengerCount: 22,
  });
  console.log("✅ trips seeded");

  // ------------------------------------------------------
  // 8. NOTIFICATIONS
  // ------------------------------------------------------
  await db.collection("notifications").doc("notif_001").set({
    title: "Bus Arriving Soon",
    message: "Bus MH-31-AB-1234 arriving at Dharampeth Chowk in 3 mins",
    type: "delay",
    targetAudience: "route",
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("✅ notifications seeded");

  // ------------------------------------------------------
  // 9. FEEDBACK
  // ------------------------------------------------------
  await db.collection("feedback").doc("feedback_001").set({
    userId: userId,
    message: "Great app, live tracking is very accurate!",
    rating: 5,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("✅ feedback seeded");

  // ------------------------------------------------------
  // 10. PROBLEM REPORTS
  // ------------------------------------------------------
  await db.collection("problemReports").doc("report_001").set({
    userId: userId,
    busId: "bus_001",
    description: "AC not working properly",
    status: "open",
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("✅ problemReports seeded");

  // ------------------------------------------------------
  // 11. ACTIVITY LOGS
  // ------------------------------------------------------
  await db.collection("activityLogs").doc("log_001").set({
    adminId: "admin_test_001",
    action: "Added Bus MH-31-AB-1234",
    module: "Bus Management",
    timestamp: FieldValue.serverTimestamp(),
  });
  console.log("✅ activityLogs seeded");

  // ------------------------------------------------------
  // 12. REPORTS
  // ------------------------------------------------------
  await db.collection("reports").doc("report_gen_001").set({
    type: "daily",
    dateRange: { from: "2026-08-01", to: "2026-08-01" },
    generatedBy: "admin_test_001",
    fileURL: "",
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("✅ reports seeded");

  // ------------------------------------------------------
  // 13. REALTIME DATABASE - liveBuses + simulationState
  // ------------------------------------------------------
  await rtdb.ref("liveBuses/bus_001").set({
    lat: 21.1466,
    lng: 79.0849,
    speed: 32,
    direction: 180,
    occupancy: "medium",
    nextStop: "Dharampeth Chowk",
    eta: 5,
    lastUpdated: ServerValue.TIMESTAMP,
  });

  await rtdb.ref("simulationState").set({
    isRunning: false,
    speedMultiplier: 1,
    currentTime: ServerValue.TIMESTAMP,
  });
  console.log("✅ Realtime DB (liveBuses + simulationState) seeded");

  console.log("\n🎉 All done! Firestore aur Realtime DB dono me sample data daal diya gaya hai.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error while seeding:", err);
  process.exit(1);
});