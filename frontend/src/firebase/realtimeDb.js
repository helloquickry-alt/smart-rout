import { ref, onValue } from "firebase/database";
import { rtdb } from "./firebaseConfig";

// Ek bus ki live location listen karo
export function listenToBus(busId, callback) {
  const busRef = ref(rtdb, `buses/${busId}`);
  const unsubscribe = onValue(busRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe; // cleanup ke liye return karo
}

// Saare buses ki list listen karo (multi-bus support ke liye future-ready)
export function listenToAllBuses(callback) {
  const busesRef = ref(rtdb, "buses");
  const unsubscribe = onValue(busesRef, (snapshot) => {
    const data = snapshot.val() || {};
    const busList = Object.entries(data).map(([id, value]) => ({
      id,
      ...value,
    }));
    callback(busList);
  });
  return unsubscribe;
}

export { rtdb };