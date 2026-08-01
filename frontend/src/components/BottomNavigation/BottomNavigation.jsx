import { NavLink } from "react-router-dom";
import { Home, Navigation, Search, MapPin } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/live", label: "Live", icon: Navigation, end: false },
  { to: "/search", label: "Search", icon: Search, end: false },
  { to: "/nearby", label: "Nearby", icon: MapPin, end: false },
];

function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-accent" : "text-ink-faint"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavigation;