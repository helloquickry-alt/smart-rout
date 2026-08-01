import ETABadge from "./ETABadge";
import OccupancyBadge from "./OccupancyBadge";

function BusCard({ route, busId, nextStop, etaMinutes, occupancy, live = true }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <div className="font-mono text-[15px] font-bold text-ink">
          {route} · {busId}
        </div>
        <div className="mt-1 text-sm text-ink-soft">Next: {nextStop}</div>
        <div className="mt-2.5">
          <OccupancyBadge level={occupancy} />
        </div>
      </div>
      <ETABadge minutes={etaMinutes} live={live} />
    </div>
  );
}

export default BusCard;