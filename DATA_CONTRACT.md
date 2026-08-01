# Smart City Bus Tracker — Data Contract

Ye document batata hai ki backend/Firebase se data KIS SHAPE me milega.
Frontend AI/developer isi structure ke hisab se components banaye — taaki
backend ready hone par sirf import line badalni pade, poora UI dobara na likhna pade.

---

## 1. BUS Object

```js
{
  id: "abc123",              // Firestore auto-generated doc id (string)
  busId: "B001",              // human-readable bus id
  busNumber: "MH-31-A1234",   // registration number
  routeId: "R01",             // which route this bus belongs to
  lat: 21.1461,                // current latitude (number)
  lng: 79.0873,                // current longitude (number)
  speed: 30,                   // km/h (number)
  occupancy: 40,                // 0-100 percentage (number)
  status: "Running",            // "Running" | "Delayed" | "Stopped"
  currentStopIndex: 0,          // index in route.stops array (number)
  direction: "forward",         // "forward" | "backward"
}
```

## 2. ROUTE Object

```js
{
  id: "xyz456",                 // Firestore doc id
  routeId: "R01",
  routeName: "Zero Mile - Railway Station",
  stops: ["S01", "S02", "S03", "S05", "S07", "S06"],  // ordered array of stopIds
}
```

## 3. STOP Object

```js
{
  id: "pqr789",                 // Firestore doc id
  stopId: "S01",
  name: "Zero Mile",
  lat: 21.1461,
  lng: 79.0873,
}
```

---

## 4. FUNCTIONS YOU'LL CALL (Frontend uses these — don't worry how they work internally)

```js
// From services/busService.js
fetchBuses() → returns Promise<Array of BUS objects>

// From services/routeService.js
fetchRoutes() → returns Promise<Array of ROUTE objects>

// From services/stopService.js
fetchStops() → returns Promise<Array of STOP objects>
```

Usage example in a React component:
```jsx
import { useEffect, useState } from "react";
import { fetchBuses } from "../services/busService.js";

function MyComponent() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    fetchBuses().then(setBuses);
  }, []);

  return (
    <div>
      {buses.map((bus) => (
        <div key={bus.id}>{bus.busNumber} - {bus.status}</div>
      ))}
    </div>
  );
}
```

---

## 5. WHILE BACKEND IS NOT READY — Use this local mock data instead

Import from `data/seedBuses.js`, `data/seedRoutes.js`, `data/seedStops.js` —
SAME SHAPE as above, just synchronous (no need to await):

```jsx
import { seedBuses } from "../../../data/seedBuses.js";
// seedBuses is already an array in the exact BUS object shape above
```

Once backend integration is ready, just swap:
```jsx
// FROM:
const buses = seedBuses;

// TO:
const [buses, setBuses] = useState([]);
useEffect(() => { fetchBuses().then(setBuses); }, []);
```

---

## 6. LIVE MOVEMENT (for user-website only — not needed for admin panel)

Bus lat/lng/speed/occupancy update every 3 seconds automatically via an
in-memory simulation engine (not Firestore-based, to avoid excessive reads/writes).
Frontend just needs to subscribe to `data/store.js`'s `subscribe()` method to
get live re-renders — a hook `useBusData.js` will handle this (provided separately).

---

## IMPORTANT RULES FOR AI-GENERATED CODE

1. DO NOT invent new field names — use EXACTLY the fields listed above (lat/lng, not latitude/longitude).
2. DO NOT assume authentication is needed — there is no login/auth in this app.
3. Use functional React components with hooks (useState, useEffect) — no class components.
4. Keep components in the existing folder structure: components/, pages/, services/, hooks/.
5. Do not add a new database or state management library (no Redux) — keep it simple.
