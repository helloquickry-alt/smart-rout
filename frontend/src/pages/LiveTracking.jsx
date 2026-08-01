import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navigation, Gauge, Users } from "lucide-react";
import { useAllBuses } from "../hooks/useLiveTracking";
import { getAllStops } from "../services/stopService";
import { getAllRoutes } from "../services/routeService";
import { getRoadRoute } from "../services/routingService";
import MapView from "../components/MapView";
import ETABadge from "../components/ETABadge";
import OccupancyBadge from "../components/OccupancyBadge";
import "leaflet/dist/leaflet.css";

function LiveTracking() {
  const location = useLocation();
  const { buses, loading } = useAllBuses();
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [stopsMap, setStopsMap] = useState({});
  const [routesMap, setRoutesMap] = useState({});
  const [roadPath, setRoadPath] = useState([]);

  // Route Search se koi specific bus select karke aaya ho to usko auto-select karo
  useEffect(() => {
    if (location.state?.selectedBusId) {
      setSelectedBusId(location.state.selectedBusId);
    }
  }, [location.state]);

  // Stops/routes ek baar fetch karo (static reference data)
  useEffect(() => {
    async function load() {
      try {
        const [stops, routes] = await Promise.all([getAllStops(), getAllRoutes()]);
        setStopsMap(stops);
        setRoutesMap(routes);
      } catch (err) {
        console.error("Failed to load stops/routes:", err);
      }
    }
    load();
  }, []);

  const selectedBus = buses.find((b) => b.id === selectedBusId);

  const routeStops = useMemo(() => {
    if (!selectedBus || !selectedBus.routeId) return [];
    const route = routesMap[selectedBus.routeId];
    if (!route) return [];
    return route.stopIds.map((id) => stopsMap[id]).filter(Boolean);
  }, [selectedBus, routesMap, stopsMap]);

  // Jab route stops badle, actual road path fetch karo (OSRM)
  useEffect(() => {
    if (routeStops.length < 2) {
      setRoadPath([]);
      return;
    }
    let cancelled = false;
    getRoadRoute(routeStops).then((path) => {
      if (!cancelled) setRoadPath(path);
    });
    return () => {
      cancelled = true;
    };
  }, [routeStops]);

  if (loading) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-24">
        <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Navigation size={26} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Connecting to live feed...</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft md:text-base">
          Fetching real-time bus positions from the tracker.
        </p>
      </div>
    );
  }

  if (!buses.length) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-24">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-live-soft text-live">
          <Navigation size={26} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">No buses running yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft md:text-base">
          Run the seed script, start the simulation engine, and turn on{" "}
          <span className="font-mono text-accent">simulationState/isRunning</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:h-[calc(100svh-73px)] md:flex-row">
      <div className="h-[45vh] w-full md:h-full md:flex-1">
        <MapView
          buses={buses}
          selectedBusId={selectedBusId}
          onSelectBus={setSelectedBusId}
          routeStops={routeStops}
          roadPath={roadPath}
        />
      </div>

      <div className="flex flex-col border-t border-line bg-surface md:w-96 md:border-l md:border-t-0">
        {selectedBus ? (
          <div className="border-b border-line p-5">
            <button onClick={() => setSelectedBusId(null)} className="mb-3 text-xs font-semibold text-accent">
              ← All buses
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{selectedBus.routeName}</h2>
                <p className="mt-0.5 text-sm text-ink-soft">Next: {selectedBus.nextStop}</p>
              </div>
              <ETABadge minutes={selectedBus.etaMinutes} live />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-center gap-2 text-ink-faint">
                  <Gauge size={15} />
                  <span className="text-xs font-medium">Speed</span>
                </div>
                <div className="mt-1.5 font-mono text-lg font-bold text-ink">{selectedBus.speed} km/h</div>
              </div>
              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-center gap-2 text-ink-faint">
                  <Users size={15} />
                  <span className="text-xs font-medium">Occupancy</span>
                </div>
                <div className="mt-1.5">
                  <OccupancyBadge level={selectedBus.occupancy} />
                </div>
              </div>
            </div>

            {routeStops.length > 0 && (
              <div className="mt-4 rounded-xl border border-line p-3.5">
                <div className="mb-2 text-xs font-semibold text-ink-faint">Route</div>
                <div className="flex items-center gap-1.5 text-sm text-ink-soft">
                  <span className="font-medium text-accent">{routeStops[0].name}</span>
                  <span>→</span>
                  <span className="font-medium text-live">{routeStops[routeStops.length - 1].name}</span>
                </div>
                <div className="mt-1 text-xs text-ink-faint">{routeStops.length} stops on this route</div>
              </div>
            )}

            {selectedBus.isDelayed && (
              <div className="mt-4 rounded-xl bg-live-soft px-4 py-3 text-sm font-medium text-live">
                Delayed by {selectedBus.delayMinutes} min
              </div>
            )}
          </div>
        ) : (
          <div className="border-b border-line p-5">
            <h2 className="font-display text-lg font-semibold text-ink">{buses.length} buses live</h2>
            <p className="mt-0.5 text-sm text-ink-soft">Tap a bus to see its route</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setSelectedBusId(bus.id)}
              className={`flex w-full items-center justify-between gap-3 border-b border-line px-5 py-4 text-left transition-colors ${
                bus.id === selectedBusId ? "bg-accent-soft" : "hover:bg-bg"
              }`}
            >
              <div>
                <div className="font-mono text-sm font-bold text-ink">{bus.routeName}</div>
                <div className="mt-0.5 text-xs text-ink-soft">Next: {bus.nextStop}</div>
              </div>
              <ETABadge minutes={bus.etaMinutes} live={!bus.isDelayed} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveTracking;