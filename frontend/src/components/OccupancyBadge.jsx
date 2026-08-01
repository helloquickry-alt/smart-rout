const STYLES = {
  Low: { bg: "bg-accent-soft", text: "text-accent-deep", dot: "bg-accent" },
  Medium: { bg: "bg-gold-soft", text: "text-gold", dot: "bg-gold" },
  High: { bg: "bg-live-soft", text: "text-live", dot: "bg-live" },
  Full: { bg: "bg-live-soft", text: "text-live", dot: "bg-live" },
};

function OccupancyBadge({ level = "Low" }) {
  const s = STYLES[level] ?? STYLES.Low;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  );
}

export default OccupancyBadge;