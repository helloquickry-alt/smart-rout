// data/seedBuses.js
// Initial bus fleet data — in-memory "database" seed (Nagpur city)

export const seedBuses = [
  {
    busId: "B001",
    busNumber: "MH-31-A1234",
    routeId: "R01",
    lat: 21.1461,
    lng: 79.0873,
    speed: 30, // km/h
    occupancy: 40, // percentage
    status: "Running", // Running | Delayed | Stopped
    currentStopIndex: 0, // index in route.stops array
    direction: "forward", // forward | backward
  },
  {
    busId: "B002",
    busNumber: "MH-31-A5678",
    routeId: "R01",
    lat: 21.1503,
    lng: 79.0800,
    speed: 25,
    occupancy: 75,
    status: "Running",
    currentStopIndex: 2,
    direction: "forward",
  },
  {
    busId: "B003",
    busNumber: "MH-31-B1122",
    routeId: "R02",
    lat: 21.1466,
    lng: 79.0800,
    speed: 20,
    occupancy: 90,
    status: "Delayed",
    currentStopIndex: 1,
    direction: "forward",
  },
  {
    busId: "B004",
    busNumber: "MH-31-B3344",
    routeId: "R02",
    lat: 21.1150,
    lng: 79.0500,
    speed: 0,
    occupancy: 20,
    status: "Stopped",
    currentStopIndex: 4,
    direction: "backward",
  },
  {
    busId: "B005",
    busNumber: "MH-31-C7788",
    routeId: "R03",
    lat: 21.1600,
    lng: 79.0870,
    speed: 35,
    occupancy: 55,
    status: "Running",
    currentStopIndex: 0,
    direction: "forward",
  },
  {
    busId: "B006",
    busNumber: "MH-31-C9900",
    routeId: "R03",
    lat: 21.1390,
    lng: 79.0680,
    speed: 28,
    occupancy: 30,
    status: "Running",
    currentStopIndex: 3,
    direction: "backward",
  },
];