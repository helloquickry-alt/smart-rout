const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));

let app;
if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://codex-hackfest2026-default-rtdb.firebaseio.com",
  });
} else {
  app = getApps()[0];
}

const db = getDatabase(app);

module.exports = { db };