import { MapPin, Navigation2 } from "lucide-react";
import { formatDistance } from "../utils/etaCalculator";

function StopCard({ stop, distanceMeters, routeCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <MapPin size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold text-ink">{stop.name}</div>
        <div className="mt-1 flex items-center gap-3 text-xs text-ink-soft">
          <span className="flex items-center gap-1">
            <Navigation2 size={11} />
            {formatDistance(distanceMeters)} away
          </span>
          {routeCount > 0 && (
            <span className="font-mono text-ink-faint">
              {routeCount} route{routeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default StopCard;