import { Search, X } from "lucide-react";

function RouteSearchBar({ value, onChange, placeholder = "Search by route number or stop..." }) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-surface py-3.5 pl-11 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default RouteSearchBar;