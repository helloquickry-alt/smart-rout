import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import ETABadge from "./ETABadge";
import OccupancyBadge from "./OccupancyBadge";

function createBusIcon(bearing = 0, active = false) {
  const size = active ? 40 : 32;
  const iconSize = active ? 18 : 14;

  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          position: absolute;
          top: -6px;
          left: 50%;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 8px solid ${active ? "#B68A35" : "#9497A6"};
          transform: translateX(-50%) rotate(${bearing}deg);
          transform-origin: 50% ${size / 2 + 6}px;
        "></div>
        <div style="
          width: ${size}px; height: ${size}px;
          background: ${active ? "#1C5D4C" : "#5C6072"};
          border: 3px solid white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          transition: all 0.2s ease;
          ${active ? "box-shadow: 0 0 0 4px rgba(28,93,76,0.18), 0 4px 12px rgba(0,0,0,0.25);" : ""}
        ">
          <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/>
            <path d="M15 6v6"/>
            <path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
            <circle cx="7" cy="18" r="2"/>
            <path d="M9 18h5"/>
            <circle cx="16" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createStopIcon(color, label) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 22px; height: 22px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 700;
        color: white;
      ">${label}</div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function createDotIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width: 9px; height: 9px; background: white; border: 2px solid #1a73e8; border-radius: 50%;"></div>`,
    iconSize: [9, 9],
    iconAnchor: [4.5, 4.5],
  });
}

function MapController({ buses, selectedBusId, routeStops }) {
  const map = useMap();

  useEffect(() => {
    if (!buses.length) return;

    const selected = buses.find((b) => b.id === selectedBusId);

    if (selected && routeStops.length) {
      const bounds = L.latLngBounds(routeStops.map((s) => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (selected) {
      map.flyTo([selected.lat, selected.lng], 16, { animate: true, duration: 0.6 });
    } else {
      const bounds = L.latLngBounds(buses.map((b) => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [selectedBusId, buses.length, routeStops, map]);

  return null;
}

function MapView({ buses, selectedBusId, onSelectBus, routeStops = [], roadPath = [] }) {
  if (!buses.length) return null;

  const center = [buses[0].lat, buses[0].lng];
  const linePositions = roadPath.length > 1 ? roadPath : routeStops.map((s) => [s.lat, s.lng]);
  const startStop = routeStops[0];
  const endStop = routeStops[routeStops.length - 1];
  const middleStops = routeStops.slice(1, -1);

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapController buses={buses} selectedBusId={selectedBusId} routeStops={routeStops} />

      {/* Navigation route line */}
      {linePositions.length > 1 && (
        <>
          <Polyline
            positions={linePositions}
            pathOptions={{ color: "#1a73e8", weight: 5, opacity: 0.85, lineCap: "round" }}
          />
          {middleStops.map((stop) => (
            <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={createDotIcon()}>
              <Popup>{stop.name}</Popup>
            </Marker>
          ))}
          {startStop && (
            <Marker position={[startStop.lat, startStop.lng]} icon={createStopIcon("#1C5D4C", "S")}>
              <Popup>Start: {startStop.name}</Popup>
            </Marker>
          )}
          {endStop && (
            <Marker position={[endStop.lat, endStop.lng]} icon={createStopIcon("#D6483A", "E")}>
              <Popup>End: {endStop.name}</Popup>
            </Marker>
          )}
        </>
      )}

      {/* Live buses */}
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={[bus.lat, bus.lng]}
          icon={createBusIcon(bus.bearing, bus.id === selectedBusId)}
          eventHandlers={{ click: () => onSelectBus?.(bus.id) }}
        >
          <Popup>
            <div style={{ fontFamily: "Inter, sans-serif", minWidth: "180px" }}>
              <div style={{ fontWeight: 700, marginBottom: "2px" }}>{bus.routeName}</div>
              <div style={{ fontSize: "12px", color: "#9497a6", marginBottom: "6px" }}>{bus.id}</div>
              <div style={{ fontSize: "13px", color: "#5c6072", marginBottom: "8px" }}>
                Next: {bus.nextStop} · {bus.speed} km/h
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <ETABadge minutes={bus.etaMinutes} live />
                <OccupancyBadge level={bus.occupancy} />
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;