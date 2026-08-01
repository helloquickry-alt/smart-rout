# 🚌 Smart City Bus Tracking Platform
## Data Structure + AI Frontend Prompt Document

> Is document ko **2 parts** me use karna hai:
> 1. **PART A** — Firebase Data Structure (ye already final hai, isko badalna nahi)
> 2. **PART B** — Ready AI Prompt (isko copy karke ChatGPT/Claude/Gemini me paste karo, frontend design ho jayega)

---

# PART A — FIREBASE DATA STRUCTURE (Schema)

## 🔥 A.1 Firestore Collections

### `users` (collection)
```
users/{uid}
├── name: string
├── email: string
├── phone: string
├── photoURL: string
├── role: "user"
├── createdAt: timestamp
├── favorites (subcollection)
│   └── {favId}: { type: "route"|"stop"|"bus", refId: string, addedAt: timestamp }
└── trips (subcollection)
    └── {tripId}: { routeId, busId, date, status: "upcoming"|"completed"|"cancelled" }
```

### `admins` (collection)
```
admins/{uid}
├── name: string
├── email: string
├── role: "superadmin" | "routemanager" | "busmanager" | "operator" | "analyticsmanager"
├── permissions: array<string>
└── createdAt: timestamp
```

### `buses` (collection)
```
buses/{busId}
├── busNumber: string          // e.g. "MH-31-AB-1234"
├── routeId: string            // ref -> routes/{routeId}
├── driverId: string           // ref -> drivers/{driverId}
├── capacity: number
├── currentOccupancy: number
├── status: "active" | "inactive" | "maintenance"
└── createdAt: timestamp
```

### `routes` (collection)
```
routes/{routeId}
├── routeName: string          // e.g. "Route 12 - Sitabuldi to MIHAN"
├── source: { name, lat, lng }
├── destination: { name, lat, lng }
├── stops: array<stopId>       // ordered list
├── distance: number           // in km
├── estimatedTime: number      // in minutes
└── status: "active" | "closed"
```

### `stops` (collection)
```
stops/{stopId}
├── stopName: string
├── location: { lat, lng }
├── connectedRoutes: array<routeId>
└── nearbyPlaces: array<string>
```

### `drivers` (collection)
```
drivers/{driverId}
├── name: string
├── phone: string
├── licenseNumber: string
├── assignedBusId: string
└── status: "active" | "inactive"
```

### `trips` (collection)
```
trips/{tripId}
├── busId: string
├── routeId: string
├── startTime: timestamp
├── endTime: timestamp
├── status: "active" | "completed" | "cancelled" | "delayed"
└── passengerCount: number
```

### `notifications` (collection)
```
notifications/{notifId}
├── title: string
├── message: string
├── type: "delay" | "emergency" | "maintenance" | "general" | "routeChanged"
├── targetAudience: "all" | "route" | "specific"
└── createdAt: timestamp
```

### `reports` (collection)
```
reports/{reportId}
├── type: "daily" | "weekly" | "monthly" | "bus" | "driver" | "route" | "delay"
├── dateRange: { from, to }
├── generatedBy: string (admin uid)
├── fileURL: string (Storage link)
└── createdAt: timestamp
```

### `activityLogs` (collection)
```
activityLogs/{logId}
├── adminId: string
├── action: string         // e.g. "Added Bus MH-31-AB-1234"
├── module: string         // e.g. "Bus Management"
└── timestamp: timestamp
```

### `feedback` (collection)
```
feedback/{feedbackId}
├── userId: string
├── message: string
├── rating: number
└── createdAt: timestamp
```

### `problemReports` (collection)
```
problemReports/{reportId}
├── userId: string
├── busId: string
├── description: string
├── status: "open" | "resolved"
└── createdAt: timestamp
```

---

## ⚡ A.2 Realtime Database (Live Data Only)

```
liveBuses/{busId}
├── lat: number
├── lng: number
├── speed: number          // km/h
├── direction: number      // degrees (for marker rotation)
├── occupancy: "low" | "medium" | "high"
├── nextStop: string
├── eta: number             // in minutes
└── lastUpdated: timestamp

simulationState/
├── isRunning: boolean
├── speedMultiplier: number
└── currentTime: timestamp
```

**Rule of thumb:** Firestore = structured/CRUD data (jo kam badalta hai). Realtime DB = sirf live-moving data (bus location, simulation state) jo har second update hota hai.

---

# PART B — AI PROMPT (Frontend team is copy kare)

> 👇 Neeche wala **poora block copy karo** aur ChatGPT / Claude / Gemini me paste karo. Apna specific module/page naam bata dena end me (jaise "ab mujhe Live Map page bana do" ya "ab mujhe Admin Bus Management page bana do").

```
You are helping me build the frontend for a "Smart City Bus Tracking Platform" —
a real-time bus tracking system similar to the Chalo App, built for a hackathon
with a strict "direct prototype, live demo, no slides" evaluation rule.

TECH STACK:
- React (Vite)
- Firebase (Firestore + Realtime Database + Firebase Auth + Storage)
- Tailwind CSS for styling
- Leaflet / Google Maps for live map
- Two separate apps: "User Website" and "Admin Panel", sharing the SAME Firebase project

PROJECT STRUCTURE (already fixed, follow this exactly):
- src/firebase/        → firebaseConfig.js, auth.js, firestore.js, realtimeDb.js, storage.js
- src/components/       → shared reusable UI (cards, modals, loaders, navbar, etc.)
- src/modules/          → one folder per feature module (numbered, e.g. 01-Authentication)
- src/layouts/          → MainLayout / AdminLayout wrapping Navbar + content
- src/routes/           → AppRoutes.jsx + ProtectedRoute.jsx
- src/context/          → AuthContext, LocationContext, ThemeContext
- src/hooks/            → useAuth, useGeolocation, useLiveTracking, etc.
- src/utils/            → constants.js, etaCalculator.js, helper functions

DATA STRUCTURE (use these exact field names — do not invent new ones):

Firestore collections:
- users/{uid} → name, email, phone, photoURL, role, createdAt
  - subcollection: favorites/{favId} → type, refId, addedAt
  - subcollection: trips/{tripId} → routeId, busId, date, status
- admins/{uid} → name, email, role, permissions, createdAt
- buses/{busId} → busNumber, routeId, driverId, capacity, currentOccupancy, status, createdAt
- routes/{routeId} → routeName, source{name,lat,lng}, destination{name,lat,lng}, stops[], distance, estimatedTime, status
- stops/{stopId} → stopName, location{lat,lng}, connectedRoutes[], nearbyPlaces[]
- drivers/{driverId} → name, phone, licenseNumber, assignedBusId, status
- trips/{tripId} → busId, routeId, startTime, endTime, status, passengerCount
- notifications/{notifId} → title, message, type, targetAudience, createdAt
- reports/{reportId} → type, dateRange{from,to}, generatedBy, fileURL, createdAt
- activityLogs/{logId} → adminId, action, module, timestamp
- feedback/{feedbackId} → userId, message, rating, createdAt
- problemReports/{reportId} → userId, busId, description, status, createdAt

Realtime Database:
- liveBuses/{busId} → lat, lng, speed, direction, occupancy, nextStop, eta, lastUpdated
- simulationState → isRunning, speedMultiplier, currentTime

SYSTEM WORKFLOW (important context):
1. Admin Panel writes bus data (Firestore) and controls a Simulation Engine that
   updates liveBuses/{busId} in Realtime Database every few seconds (fake GPS movement
   along a route path, since there are no real buses).
2. User App listens to liveBuses/{busId} in real time using Firebase's onValue()
   listener and moves the bus marker on the map live.
3. All static data (routes, stops, bus details) comes from Firestore; only live
   position/speed/occupancy comes from Realtime Database.
4. Auth uses Firebase Authentication (email/password, Google, phone OTP for users;
   email/password + role-based custom claims for admins).

DESIGN REQUIREMENTS:
- Clean, modern, mobile-first UI (User App) — this app is used on phones mostly.
- Admin Panel should be a dashboard-style desktop layout (Sidebar + Topbar).
- Use Tailwind CSS utility classes, no inline styles.
- Reusable components should go in src/components/, page-specific ones in the
  relevant src/modules/{module-name}/ folder.
- Show loading skeletons and empty states — don't leave blank screens.
- Keep components functional (React hooks), no class components.

WHAT I NEED FROM YOU RIGHT NOW:
[👉 Yaha apna specific request likho, jaise:]
"Build the [MODULE NAME] page/component using the structure and data model above.
Include [specific features from the module list]. Connect it to Firestore/Realtime DB
using the field names given above. Keep it visually clean and mobile-responsive."
```

### Team ko instruction (upar wale block ke sath):
1. Copy karo poora block.
2. End me apna specific module likho — jaise:
   - `"Ab mujhe User App ka 02-Home module banao — Hero Banner, Search Bus, Nearby Buses ke saath"`
   - `"Ab mujhe Admin Panel ka 04-Bus Management module banao — Add/Edit/Delete Bus table ke saath"`
3. Field names badalna mana hai — sabko same schema follow karna hai warna backend connect nahi hoga.
4. Agar naya field chahiye to pehle team lead (tu) se confirm karo, phir is document ko update karo.

---

## Quick Reference — Konsa Module Kis Collection Se Judega

| Module | Firestore Collection(s) | Realtime DB |
|---|---|---|
| Authentication | `users` / `admins` | — |
| Home | `notifications`, `routes` | — |
| Live Bus Tracking | `buses`, `routes` | `liveBuses` |
| Route Search | `routes`, `stops` | — |
| Bus Search | `buses` | — |
| Bus Details | `buses`, `drivers` | `liveBuses` |
| Nearby Bus / Stop | `buses`, `stops` | `liveBuses` |
| AI Recommendation | (via Cloud Function) | `liveBuses` |
| Notifications | `notifications` | — |
| Favorites | `users/{uid}/favorites` | — |
| My Trips | `users/{uid}/trips`, `trips` | — |
| Profile | `users` | — |
| Bus/Route/Stop/Driver Management (Admin) | `buses`, `routes`, `stops`, `drivers` | — |
| Simulation Control (Admin) | `buses`, `routes` | `liveBuses`, `simulationState` |
| Reports/Analytics (Admin) | `trips`, `reports` | — |
| Activity Logs (Admin) | `activityLogs` | — |
| System Health (Admin) | — | `simulationState` (+ Firebase status check) |

---

**Bana ke rakh — jab bhi koi naya module/collection add ho, is file ko update karke poori team ko phir se bhej dena, taaki sab same schema follow karte rahein.**
