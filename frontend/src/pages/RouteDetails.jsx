import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Gauge, Clock, Bus } from "lucide-react";
import { getAllRoutes } from "../services/routeService";
import { getAllStops } from "../services/stopService";
import { useAllBuses } from "../hooks/useLiveTracking";
import { calculateStopETA } from "../utils/etaCalculator";
import ETABadge from "../components/ETABadge";
import OccupancyBadge from "../components/OccupancyBadge";

function getStopName(stop) {
  return stop?.stopName ?? stop?.name ?? "Unknown stop";
}
function getRouteName(route) {
  return route?.routeName ?? route?.name ?? "Unnamed route";
}
function getRouteStopIds(route) {
  return Array.isArray(route?.stops)
    ? route.stops
    : Array.isArray(route?.stopIds)
    ? route.stopIds
    : [];
}

function RouteDetails() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { buses } = useAllBuses();
  const [route, setRoute] = useState(null);
  const [stopsMap, setStopsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [routes, stops] = await Promise.all([getAllRoutes(), getAllStops()]);
        setStopsMap(stops || {});
        const found = routes?.[routeId];
        if (!found) {
          setNotFound(true);
        } else {
          setRoute(found);
        }
      } catch (err) {
        console.error("Failed to load route details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [routeId]);

  const liveBuses = (buses || []).filter((b) => b.routeId === routeId);

  // Agar user ne koi specific bus select nahi ki, to pehli live bus ko default track karo
  const trackedBus =
    liveBuses.find((b) => b.id === selectedBusId) || liveBuses[0] || null;

  if (loading) {
    return <div className="px-5 py-16 text-center text-sm text-ink-soft">Loading route...</div>;
  }

  if (notFound || !route) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center">
        <p className="text-sm text-ink-soft">Route not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm font-semibold text-accent">
          Go back
        </button>
      </div>
    );
  }

  const routeStopIds = getRouteStopIds(route);
  const routeStops = routeStopIds.map((id) => stopsMap[id]).filter(Boolean);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Bus size={18} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-semibold text-ink">{getRouteName(route)}</h1>
          <p
            className={`text-xs font-medium ${
              route.status === "active" ? "text-live" : "text-ink-faint"
            }`}
          >
            {route.status === "active" ? "Active" : route.status ?? "Unknown"}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-2xl px-5 md:px-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-line bg-surface p-3.5 text-center">
            <Gauge size={16} className="mx-auto text-accent" />
            <div className="mt-1.5 font-mono text-sm font-bold text-ink">
              {route.distance != null ? `${route.distance} km` : "—"}
            </div>
            <div className="text-[11px] text-ink-soft">Distance</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3.5 text-center">
            <Clock size={16} className="mx-auto text-accent" />
            <div className="mt-1.5 font-mono text-sm font-bold text-ink">
              {route.estimatedTime != null ? `${route.estimatedTime} min` : "—"}
            </div>
            <div className="text-[11px] text-ink-soft">Est. Time</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-3.5 text-center">
            <MapPin size={16} className="mx-auto text-accent" />
            <div className="mt-1.5 font-mono text-sm font-bold text-ink">{routeStops.length}</div>
            <div className="text-[11px] text-ink-soft">Stops</div>
          </div>
        </div>

        {/* Live buses on this route */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Live Buses</h2>
            {liveBuses.length > 1 && (
              <span className="text-xs text-ink-faint">Tap a bus to track its ETA below</span>
            )}
          </div>
          {liveBuses.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface p-4 text-center text-sm text-ink-soft">
              No buses currently running on this route.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {liveBuses.map((bus) => {
                const isTracked = trackedBus?.id === bus.id;
                return (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBusId(bus.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                      isTracked ? "border-accent bg-accent-soft" : "border-line bg-surface"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <MapPin size={13} className="text-ink-faint" />
                        Next: {bus.nextStop}
                      </div>
                      <div className="mt-1.5">
                        <OccupancyBadge level={bus.occupancy} />
                      </div>
                    </div>
                    <ETABadge minutes={bus.etaMinutes} live={!bus.isDelayed} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Full stop path with real ETA per stop */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Route Path</h2>
            {trackedBus && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-live">
                <span className="h-1.5 w-1.5 rounded-full bg-live" />
                Tracking live
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            {routeStops.length === 0 ? (
              <p className="text-sm text-ink-soft">No stop data available for this route.</p>
            ) : (
              routeStops.map((stop, i) => {
                const stopETA = trackedBus
                  ? calculateStopETA(trackedBus, route, stopsMap, stop.id)
                  : null;

                return (
                  <div key={stop.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                          i === 0 || i === routeStops.length - 1
                            ? "bg-accent text-white"
                            : "bg-ink/10 text-ink-soft"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {i < routeStops.length - 1 && <div className="my-0.5 h-6 w-px bg-line" />}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3 pb-4">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">{getStopName(stop)}</div>
                        {stop.nearbyPlaces?.length > 0 && (
                          <div className="mt-0.5 truncate text-[11px] text-ink-faint">
                            Near: {stop.nearbyPlaces.join(", ")}
                          </div>
                        )}
                      </div>

                      {stopETA?.reachable && (
                        <div className="shrink-0 text-right">
                          <div className="font-mono text-xs font-bold text-live">
                            {stopETA.etaMinutes} min
                          </div>
                          <div className="text-[10px] text-ink-faint">
                            {stopETA.distanceKm} km
                            {stopETA.usedFallbackSpeed && " · est."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {trackedBus && (
            <p className="mt-2.5 text-[11px] text-ink-faint">
              ETA calculated from the tracked bus's current location and speed. "est." means live
              speed wasn't available, so a typical city-bus speed was used.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RouteDetails;