import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bus, Search, SlidersHorizontal, MapPin, LocateFixed,
  ChevronRight, RefreshCw, Lightbulb, Footprints, Radio, AlertCircle,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import L from "leaflet";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAllBuses } from "../hooks/useLiveTracking";
import { getAllStops } from "../services/stopService";
import { getAllRoutes } from "../services/routeService";
import { calculateDistanceMeters, formatDistance } from "../utils/etaCalculator";
import "leaflet/dist/leaflet.css";

function userLocationIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <div style="position: absolute; inset: -8px; background: rgba(28,93,76,0.2); border-radius: 50%;"></div>
        <div style="width: 20px; height: 20px; background: #1C5D4C; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function stopMarkerIcon(rank) {
  const isClosest = rank === 1;
  const size = isClosest ? 30 : 24;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${isClosest ? "#1C5D4C" : "#B68A35"};
        border: 2.5px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        font-family: 'JetBrains Mono', monospace;
        font-size: ${isClosest ? "12px" : "10px"};
        font-weight: 700;
        color: white;
      ">${rank}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// avg walking speed ~75 m/min (4.5 km/h)
function walkMinutes(meters) {
  return Math.max(1, Math.round(meters / 75));
}

const CARD_ACCENTS = [
  { bar: "bg-accent", chip: "bg-accent-soft text-accent-deep" },
  { bar: "bg-live", chip: "bg-live-soft text-live" },
  { bar: "bg-gold", chip: "bg-gold-soft text-gold" },
  { bar: "bg-accent", chip: "bg-accent-soft text-accent-deep" },
];

function NearbyStops() {
  const navigate = useNavigate();
  const { position, error, loading, requestLocation } = useGeolocation();
  const { buses } = useAllBuses();
  const [stopsMap, setStopsMap] = useState({});
  const [routesMap, setRoutesMap] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [sortBy, setSortBy] = useState("nearest");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [stops, routes] = await Promise.all([getAllStops(), getAllRoutes()]);
        setStopsMap(stops);
        setRoutesMap(routes);
      } catch (err) {
        console.error("Failed to load stops:", err);
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, []);

  // Stop id -> array of route labels (from actual route.stopIds membership)
  const routesByStop = useMemo(() => {
    const map = {};
    Object.values(routesMap).forEach((route) => {
      const label = route.shortName ?? route.number ?? route.name;
      (route.stopIds || []).forEach((id) => {
        if (!map[id]) map[id] = [];
        map[id].push(label);
      });
    });
    return map;
  }, [routesMap]);

  const nearbyStops = useMemo(() => {
    if (!position) return [];
    return Object.values(stopsMap).map((stop) => {
      const distance = calculateDistanceMeters(position.lat, position.lng, stop.lat, stop.lng);
      const routes = routesByStop[stop.id] || [];

      const passingBuses = buses.filter((b) => b.nextStop === stop.name);
      const nextBus = passingBuses.sort(
        (a, b) => (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999)
      )[0];

      return {
        ...stop,
        distance,
        routes,
        nextBusRoute: nextBus?.routeName ?? null,
        nextBusEta: nextBus?.etaMinutes ?? null,
      };
    });
  }, [stopsMap, position, routesByStop, buses]);

  const sortedStops = useMemo(() => {
    const arr = [...nearbyStops];
    if (sortBy === "nearest") arr.sort((a, b) => a.distance - b.distance);
    if (sortBy === "nextBus") arr.sort((a, b) => (a.nextBusEta ?? 999) - (b.nextBusEta ?? 999));
    if (sortBy === "az") arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "popular") arr.sort((a, b) => b.routes.length - a.routes.length);
    return arr.slice(0, 12);
  }, [nearbyStops, sortBy]);

  const sortOptions = [
    { key: "nearest", label: "Nearest" },
    { key: "nextBus", label: "Next Bus" },
    { key: "az", label: "A - Z" },
    { key: "popular", label: "Popular" },
  ];

  function goToStopOnMap(stopId) {
    navigate("/live", { state: { focusStopId: stopId } });
  }

  async function handleRefresh() {
    setRefreshing(true);
    requestLocation();
    setTimeout(() => setRefreshing(false), 800);
  }

  if (loading || dataLoading) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-24">
        <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <LocateFixed size={26} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Finding your location...</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft md:text-base">
          Allow location access to find stops near you.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-24">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-live-soft text-live">
          <AlertCircle size={26} />
        </div>
        <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Location access needed</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft md:text-base">{error}</p>
        <button
          onClick={requestLocation}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-deep"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      </div>
    );
  }

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
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-ink">Nearby Stops</h1>
          <p className="flex items-center gap-1 truncate text-xs text-ink-soft">
            <MapPin size={11} />
            Your current location
          </p>
        </div>
        <button
          onClick={() => navigate("/search")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft"
        >
          <Search size={17} />
        </button>
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="mx-auto mt-4 max-w-[1180px] px-5 md:px-6">
        {/* Map */}
        <div className="relative h-72 overflow-hidden rounded-2xl border border-line md:h-80">
          <span className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-live shadow-sm">
            <Radio size={11} className="animate-pulse" />
            Live Updates
          </span>
          <button
            onClick={requestLocation}
            className="absolute bottom-3 right-3 z-[500] flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-accent-deep shadow-md"
          >
            <LocateFixed size={14} />
            My Location
          </button>
          {position && (
            <MapContainer center={[position.lat, position.lng]} zoom={15} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <Circle
                center={[position.lat, position.lng]}
                radius={800}
                pathOptions={{ color: "#1C5D4C", fillColor: "#1C5D4C", fillOpacity: 0.06, weight: 1.5 }}
              />
              <Marker position={[position.lat, position.lng]} icon={userLocationIcon()}>
                <Popup>You are here</Popup>
              </Marker>
              {sortedStops.map((stop, index) => (
                <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopMarkerIcon(index + 1)}>
                  <Popup>
                    <div style={{ fontFamily: "Inter, sans-serif", minWidth: "160px" }}>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>{stop.name}</div>
                      <div style={{ fontSize: "13px", color: "#5c6072", marginBottom: "6px" }}>
                        {formatDistance(stop.distance)} away
                      </div>
                      {stop.routes.length > 0 && (
                        <div style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#9497a6" }}>
                          {stop.routes.length} route{stop.routes.length > 1 ? "s" : ""} serve this stop
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Sort chips */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-sm font-medium text-ink-soft">Sort By:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === opt.key ? "bg-accent text-white" : "border border-line bg-surface text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Stop cards */}
        <div className="mt-4 space-y-3">
          {sortedStops.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-line bg-surface py-14 text-center">
              <MapPin size={22} className="mb-3 text-ink-faint" />
              <p className="text-sm text-ink-soft">No stops found nearby yet.</p>
            </div>
          ) : (
            sortedStops.map((stop, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <button
                  key={stop.id}
                  onClick={() => goToStopOnMap(stop.id)}
                  className="flex w-full items-stretch overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-sm"
                >
                  <div className={`w-1.5 shrink-0 ${accent.bar}`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent.chip}`}>
                          <Bus size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-display text-sm font-semibold text-ink">{stop.name}</div>
                          <div className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-soft">
                            <MapPin size={11} />
                            {stop.address ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-sm font-bold text-accent-deep">{formatDistance(stop.distance)}</div>
                        <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-ink-faint">
                          <Footprints size={11} />
                          {walkMinutes(stop.distance)} min
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-ink-soft">
                        <span className="font-medium text-ink-faint">Next Bus</span>
                        {stop.nextBusRoute ? (
                          <>
                            <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${accent.chip}`}>
                              {stop.nextBusRoute}
                            </span>
                            <span className="font-semibold text-live">{stop.nextBusEta} min</span>
                          </>
                        ) : (
                          <span className="text-ink-faint">— none nearby</span>
                        )}
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-ink-faint" />
                    </div>

                    {stop.routes.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-ink-faint">Routes</span>
                        {stop.routes.slice(0, 3).map((r) => (
                          <span key={r} className="rounded-md bg-ink/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-soft">
                            {r}
                          </span>
                        ))}
                        {stop.routes.length > 3 && (
                          <span className="rounded-md bg-ink/5 px-2 py-0.5 text-[11px] font-semibold text-ink-faint">
                            +{stop.routes.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Tip / refresh banner */}
        <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-accent-soft p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white">
              <Lightbulb size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent-deep">Tip: Pull down to refresh live bus arrival times</p>
              <p className="text-xs text-accent-deep/70">Real-time data • Updated just now</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-accent-deep shadow-sm"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default NearbyStops;