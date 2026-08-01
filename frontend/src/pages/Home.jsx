import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import {
  Menu, ChevronDown, Bell, User, Search, Mic, Bus, Route, MapPin,
  Sparkles, Heart, MoreHorizontal, Navigation, Gauge, Clock, ArrowRight,
  Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudFog,
  Siren, ShieldAlert, HeartPulse, ShieldCheck,
} from "lucide-react";
import { useAllBuses } from "../hooks/useLiveTracking";
import { getAllStops } from "../services/stopService";
import ETABadge from "../components/ETABadge";
import OccupancyBadge from "../components/OccupancyBadge";
import "leaflet/dist/leaflet.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function weatherIconFor(code) {
  if (code === 0) return Sun;
  if ([1, 2, 3].includes(code)) return Cloud;
  if ([45, 48].includes(code)) return CloudFog;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Sun;
}

function weatherLabelFor(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Stormy";
  return "—";
}

// Real bus icon marker (inline SVG) instead of plain round dot — with subtle pulse to feel "live"
function busMarkerIcon(heading = 0) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #6C5DD3;
          opacity: 0.25;
          animation: busPulse 1.6s ease-out infinite;
        "></div>
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #6C5DD3;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${heading}deg);
          transition: transform 0.5s linear;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
            <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes busPulse {
          0% { transform: scale(0.8); opacity: 0.35; }
          70% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function Home() {
  const navigate = useNavigate();
  const { buses } = useAllBuses();
  const [totalStops, setTotalStops] = useState(null);
  const [weather, setWeather] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getAllStops()
      .then((stops) => setTotalStops(Object.keys(stops).length))
      .catch(() => setTotalStops(null));
  }, []);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=21.1458&longitude=79.0882&current=temperature_2m,weather_code&timezone=auto")
      .then((res) => res.json())
      .then((data) => setWeather(data.current))
      .catch(() => setWeather(null));
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  const upcomingBuses = useMemo(
    () => [...buses].sort((a, b) => (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999)).slice(0, 3),
    [buses]
  );

  const activeRoutesCount = useMemo(
    () => new Set(buses.map((b) => b.routeId).filter(Boolean)).size,
    [buses]
  );

  const avgEta = useMemo(() => {
    if (!buses.length) return "—";
    const total = buses.reduce((sum, b) => sum + (b.etaMinutes || 0), 0);
    return Math.round(total / buses.length);
  }, [buses]);

  // Real recommendations based on live data (not fabricated)
  const fastestBus = useMemo(
    () => [...buses].sort((a, b) => (a.etaMinutes ?? 999) - (b.etaMinutes ?? 999))[0],
    [buses]
  );
  const leastCrowdedBus = useMemo(() => {
    const order = { Low: 0, Medium: 1, High: 2, Full: 3 };
    return [...buses].sort((a, b) => (order[a.occupancy] ?? 9) - (order[b.occupancy] ?? 9))[0];
  }, [buses]);

  const mapCenter = buses.length ? [buses[0].lat, buses[0].lng] : [21.1458, 79.0882];
  const WeatherIcon = weather ? weatherIconFor(weather.weather_code) : Sun;

  const quickActions = [
    { icon: Bus, label: "Live Tracking", action: () => navigate("/live") },
    { icon: MapPin, label: "Nearby Stops", action: () => navigate("/nearby") },
    { icon: Sparkles, label: "AI Route", action: () => showToast("AI Route — coming soon") },
    { icon: Heart, label: "Favourites", action: () => showToast("Favourites — coming soon") },
    { icon: MoreHorizontal, label: "More", action: () => showToast("More options — coming soon") },
  ];

  const emergencyActions = [
    { icon: Siren, label: "SOS", color: "text-live" },
    { icon: ShieldAlert, label: "Police", color: "text-accent" },
    { icon: HeartPulse, label: "Ambulance", color: "text-live" },
    { icon: ShieldCheck, label: "Women Safety", color: "text-gold" },
  ];

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 md:px-6">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink">
          <Menu size={18} />
        </button>
        <div className="text-center">
          <h1 className="font-display text-base font-semibold text-ink">{getGreeting()}!</h1>
          <button className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin size={12} />
            Nagpur, Maharashtra
            <ChevronDown size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("No new notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft"
          >
            <Bell size={17} />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
            <User size={18} />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-[1180px] px-5 md:px-6">
        {/* Weather / hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6C5DD3] via-[#8B6DE8] to-[#B968C7] p-6">
          <div className="relative z-10 flex items-center gap-3">
            <WeatherIcon size={30} className="text-white" strokeWidth={1.6} />
            <div>
              <div className="font-display text-2xl font-semibold text-white">
                {weather ? `${Math.round(weather.temperature_2m)}°C` : "—"}
              </div>
              <div className="text-sm text-white/80">{weather ? weatherLabelFor(weather.weather_code) : "Loading..."}</div>
            </div>
          </div>
          <Bus size={120} className="absolute -bottom-4 -right-4 text-white/15" strokeWidth={1} />
        </div>

        {/* Search bar */}
        <button
          onClick={() => navigate("/search")}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-left shadow-sm"
        >
          <Search size={18} className="text-ink-faint" />
          <span className="flex-1 text-sm text-ink-faint">Search for Bus, Route, Stop or Destination...</span>
          <Mic size={17} className="text-[#6C5DD3]" />
        </button>

        {/* Category pills */}
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          <button
            onClick={() => navigate("/search")}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            <Bus size={15} className="text-[#6C5DD3]" />
            Bus Number
          </button>
          <button
            onClick={() => navigate("/search")}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            <Route size={15} className="text-[#6C5DD3]" />
            Route Number
          </button>
          <button
            onClick={() => navigate("/nearby")}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-soft"
          >
            <MapPin size={15} className="text-[#6C5DD3]" />
            Nearby Stops
          </button>
          <button
            onClick={() => showToast("Voice search — coming soon")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft"
          >
            <Mic size={16} />
          </button>
        </div>

        {/* Quick actions grid */}
        <div className="mt-5 grid grid-cols-5 gap-2.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface py-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6C5DD3]/10 text-[#6C5DD3]">
                <action.icon size={18} />
              </div>
              <span className="text-[10px] font-medium leading-tight text-ink-soft">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Live map preview */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <h3 className="font-display text-base font-semibold text-ink">Live Map</h3>
            </div>
            <button onClick={() => navigate("/live")} className="flex items-center gap-1 text-sm font-semibold text-[#6C5DD3]">
              View Full Map
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-48 overflow-hidden rounded-2xl border border-line md:h-56">
            <MapContainer
              center={mapCenter}
              zoom={12}
              dragging={false}
              zoomControl={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              attributionControl={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {buses.map((bus) => (
                <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busMarkerIcon(bus.heading || 0)} />
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Nearby live buses */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#6C5DD3]" />
              <h3 className="font-display text-base font-semibold text-ink">Nearby Live Buses</h3>
            </div>
            <button onClick={() => navigate("/search")} className="flex items-center gap-1 text-sm font-semibold text-[#6C5DD3]">
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          {upcomingBuses.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center text-sm text-ink-soft">
              No buses running yet. Start the simulation to see live data.
            </div>
          ) : (
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0">
              {upcomingBuses.map((bus) => (
                <div key={bus.id} className="w-60 shrink-0 rounded-2xl border border-line bg-surface p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6C5DD3]/10 text-[#6C5DD3]">
                      <Bus size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-sm font-bold text-ink">{bus.routeName}</div>
                      <div className="truncate text-xs text-ink-soft">Next: {bus.nextStop}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-bold text-accent-deep">{bus.etaMinutes} min</div>
                      <div className="text-[10px] text-ink-faint">ETA</div>
                    </div>
                    <OccupancyBadge level={bus.occupancy} />
                  </div>
                  <button
                    onClick={() => navigate("/live", { state: { selectedBusId: bus.id } })}
                    className="mt-3 w-full rounded-lg bg-[#6C5DD3] py-2.5 text-sm font-semibold text-white"
                  >
                    Track Bus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendation (rule-based on live data) */}
        {(fastestBus || leastCrowdedBus) && (
          <div className="mt-7 rounded-2xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <h3 className="font-display text-base font-semibold text-ink">Smart Recommendation</h3>
              </div>
              <span className="rounded-full bg-gold-soft px-2.5 py-1 font-mono text-[10px] font-semibold text-gold">
                Based on live data
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fastestBus && (
                <div className="rounded-xl border border-line p-3.5">
                  <Bus size={16} className="text-[#6C5DD3]" />
                  <div className="mt-2 text-xs font-medium text-ink-soft">Fastest Bus</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-ink">{fastestBus.routeName}</div>
                  <div className="mt-1 text-xs text-accent-deep">ETA: {fastestBus.etaMinutes} min</div>
                </div>
              )}
              {leastCrowdedBus && (
                <div className="rounded-xl border border-line p-3.5">
                  <Gauge size={16} className="text-accent" />
                  <div className="mt-2 text-xs font-medium text-ink-soft">Least Crowded</div>
                  <div className="mt-0.5 font-mono text-sm font-bold text-ink">{leastCrowdedBus.routeName}</div>
                  <div className="mt-1 text-xs text-accent-deep">ETA: {leastCrowdedBus.etaMinutes} min</div>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate("/live", { state: { selectedBusId: fastestBus?.id } })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6C5DD3] py-3 text-sm font-semibold text-white"
            >
              Start Journey
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Live statistics */}
        <div className="mt-7">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">Live Statistics</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Bus, label: "Running Buses", value: buses.length },
              { icon: Route, label: "Active Routes", value: activeRoutesCount },
              { icon: MapPin, label: "Nearby Stops", value: totalStops ?? "—" },
              { icon: Clock, label: "Avg ETA", value: `${avgEta} min` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-line bg-surface p-4">
                <stat.icon size={16} className="text-[#6C5DD3]" />
                <div className="mt-2 font-mono text-xl font-bold text-ink">{stat.value}</div>
                <div className="mt-0.5 text-xs text-ink-soft">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency help */}
        <div className="mt-7 rounded-2xl bg-live-soft p-5">
          <h3 className="font-display text-base font-semibold text-live">Emergency Help</h3>
          <p className="mt-0.5 text-xs text-live/80">We are here to help you!</p>
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {emergencyActions.map((item) => (
              <button
                key={item.label}
                onClick={() => showToast("Demo prototype — not a live emergency service")}
                className="flex flex-col items-center gap-2 rounded-xl bg-white py-3.5 text-center shadow-sm"
              >
                <item.icon size={18} className={item.color} />
                <span className="text-[10px] font-medium text-ink-soft">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

export default Home;