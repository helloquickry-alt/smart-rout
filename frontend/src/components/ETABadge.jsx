function ETABadge({ minutes, live = false }) {
  return (
    <span className="animate-flap-in inline-flex items-baseline gap-1.5 rounded-lg border-t-2 border-gold bg-ink px-3.5 py-2">
      {live && (
        <span className="mr-1 h-1.5 w-1.5 self-center rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.25)]" />
      )}
      <span className="font-mono text-xl font-bold tabular-nums text-white">{minutes}</span>
      <span className="font-mono text-xs uppercase tracking-wider text-gold-soft">min</span>
    </span>
  );
}

export default ETABadge;