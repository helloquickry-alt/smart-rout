import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, MapPin, ArrowUpDown, X } from "lucide-react";
import { getAllRoutes } from "../services/routeService";
import { getAllStops } from "../services/stopService";
import { useAllBuses } from "../hooks/useLiveTracking";
import RouteSearchBar from "../components/RouteSearchBar";
import ETABadge from "../components/ETABadge";
import OccupancyBadge from "../components/OccupancyBadge";

// Safe helpers — chahe field "stopName" ho ya "name", dono case handle karta hai
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

function StopPicker({ label, value, onSelect, stops, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return stops;
    return stops.filter((s) => getStopName(s).toLowerCase().includes(q.toLowerCase()));
  }, [q, stops]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-left"
      >
        <MapPin size={16} className="shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-ink-faint">{label}</div>
          <div className={`truncate text-sm font-semibold ${value ? "text-ink" : "text-ink-faint"}`}>
            {value ? getStopName(value) : placeholder}
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
          <div className="sticky top-0 flex items-center gap-2 border-b border-line bg-surface p-2.5">
            <Search size={14} className="text-ink-faint" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stop..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
            />
            <button onClick={() => setOpen(false)}>
              <X size={14} className="text-ink-faint" />
            </button>
          </div>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-ink-soft">No stops found</div>
          ) : (
            filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelect(s);
                  setQ("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-accent-soft"
              >
                <MapPin size={13} className="shrink-0 text-ink-faint" />
                <span className="truncate text-sm text-ink">{getStopName(s)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SearchResults() {
  const navigate = useNavigate();
  const { buses } = useAllBuses();
  const [mode, setMode] = useState("keyword"); // "keyword" | "fromTo"
  const [query, setQuery] = useState("");
  const [fromStop, setFromStop] = useState(null);
  const [toStop, setToStop] = useState(null);
  const [routesMap, setRoutesMap] = useState({});
  const [stopsMap, setStopsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRouteId, setExpandedRouteId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [routes, stops] = await Promise.all([getAllRoutes(), getAllStops()]);
        setRoutesMap(routes || {});
        setStopsMap(stops || {});
      } catch (err) {
        console.error("Failed to load routes/stops:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stopsList = useMemo(
    () =>
      Object.values(stopsMap)
        .filter((s) => s && (s.stopName || s.name))
        .sort((a, b) => getStopName(a).localeCompare(getStopName(b))),
    [stopsMap]
  );

  const busesByRoute = useMemo(() => {
    const map = {};
    (buses || []).forEach((bus) => {
      if (!bus.routeId) return;
      if (!map[bus.routeId]) map[bus.routeId] = [];
      map[bus.routeId].push(bus);
    });
    return map;
  }, [buses]);

  // Keyword mode — route name ya stop name se search
  const keywordResults = useMemo(() => {
    const routes = Object.values(routesMap).filter((r) => getRouteStopIds(r).length > 0);
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((route) => {
      if (getRouteName(route).toLowerCase().includes(q)) return true;
      return getRouteStopIds(route).some((id) =>
        getStopName(stopsMap[id]).toLowerCase().includes(q)
      );
    });
  }, [routesMap, stopsMap, query]);

  // From→To mode — sirf woh routes jinme dono stops hai, sahi order me
  const fromToResults = useMemo(() => {
    if (!fromStop || !toStop || fromStop.id === toStop.id) return [];
    return Object.values(routesMap)
      .filter((r) => getRouteStopIds(r).length > 0)
      .map((route) => {
        const path = getRouteStopIds(route);
        const fromIdx = path.indexOf(fromStop.id);
        const toIdx = path.indexOf(toStop.id);
        if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) return null;
        return { ...route, journeyStopIds: path.slice(fromIdx, toIdx + 1) };
      })
      .filter(Boolean);
  }, [fromStop, toStop, routesMap]);

  const displayedRoutes = mode === "fromTo" ? fromToResults : keywordResults;
  const showEmptyState =
    !loading &&
    ((mode === "keyword" && keywordResults.length === 0) ||
      (mode === "fromTo" && fromStop && toStop && fromToResults.length === 0));

  function goToLiveMap(busId) {
    navigate("/live", { state: { selectedBusId: busId } });
  }

  function goToRouteDetails(routeId) {
    navigate(`/route/${routeId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:px-6 md:py-10">
      <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Route Search</h1>
      <p className="mt-1.5 text-sm text-ink-soft md:text-base">
        Find a route by number, stop name, or between two stops.
      </p>

      {/* Mode toggle */}
      <div className="mt-4 flex gap-2 rounded-xl bg-ink/5 p-1">
        <button
          onClick={() => setMode("keyword")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "keyword" ? "bg-surface text-accent shadow-sm" : "text-ink-soft"
          }`}
        >
          Search by name
        </button>
        <button
          onClick={() => setMode("fromTo")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === "fromTo" ? "bg-surface text-accent shadow-sm" : "text-ink-soft"
          }`}
        >
          From → To
        </button>
      </div>

      <div className="mt-5">
        {mode === "keyword" ? (
          <RouteSearchBar value={query} onChange={setQuery} />
        ) : (
          <div className="relative space-y-2.5">
            <StopPicker label="FROM" value={fromStop} onSelect={setFromStop} stops={stopsList} placeholder="Select starting stop" />
            <StopPicker label="TO" value={toStop} onSelect={setToStop} stops={stopsList} placeholder="Select destination stop" />
            <button
              onClick={() => {
                setFromStop(toStop);
                setToStop(fromStop);
              }}
              disabled={!fromStop && !toStop}
              className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-accent shadow-sm disabled:opacity-40"
            >
              <ArrowUpDown size={15} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-10 text-center text-sm text-ink-soft">Loading routes...</div>
      ) : mode === "fromTo" && (!fromStop || !toStop) ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <ArrowUpDown size={24} />
          </div>
          <p className="text-sm text-ink-soft">Select both stops to find a route.</p>
        </div>
      ) : showEmptyState ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Search size={24} />
          </div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {mode === "fromTo" ? "No direct route found" : "No routes found"}
          </h2>
          <p className="mt-1.5 max-w-xs text-sm text-ink-soft">
            {mode === "fromTo"
              ? `No bus route currently connects ${getStopName(fromStop)} to ${getStopName(toStop)} directly.`
              : "Try a different route number or stop name."}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {mode === "keyword" && !query && (
            <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-wider text-ink-faint">
              All routes
            </p>
          )}

          {displayedRoutes.map((route) => {
            const stopIds = mode === "fromTo" ? route.journeyStopIds : getRouteStopIds(route);
            const stops = stopIds.map((id) => stopsMap[id]).filter(Boolean);
            if (stops.length === 0) return null;

            const liveBuses = busesByRoute[route.id] || [];
            const isExpanded = expandedRouteId === route.id;

            return (
              <div key={route.id} className="rounded-2xl border border-line bg-surface shadow-sm">
                <button
                  onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left"
                >
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold text-ink">{getRouteName(route)}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                      <span className="truncate font-medium text-accent">{getStopName(stops[0])}</span>
                      <ArrowRight size={13} className="shrink-0 text-ink-faint" />
                      <span className="truncate font-medium text-live">{getStopName(stops[stops.length - 1])}</span>
                    </div>
                    <div className="mt-1.5 font-mono text-xs text-ink-faint">{stops.length} stops</div>
                  </div>

                  {liveBuses.length > 0 ? (
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 font-mono text-xs font-semibold text-accent-deep">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {liveBuses.length} live
                    </span>
                  ) : (
                    <span className="shrink-0 font-mono text-xs text-ink-faint">Offline</span>
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-line px-5 pb-5 pt-4">
                    <button
                      onClick={() => goToRouteDetails(route.id)}
                      className="mb-3 text-sm font-semibold text-accent"
                    >
                      View full route details →
                    </button>
                    {liveBuses.length === 0 ? (
                      <p className="text-sm text-ink-soft">No buses currently running on this route.</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {liveBuses.map((bus) => (
                          <button
                            key={bus.id}
                            onClick={() => goToLiveMap(bus.id)}
                            className="flex items-center justify-between gap-3 rounded-xl border border-line p-3.5 text-left transition-colors hover:border-accent"
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
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchResults;