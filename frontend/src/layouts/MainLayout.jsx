import { NavLink, Outlet } from "react-router-dom";
import BottomNavigation from "../components/BottomNavigation/BottomNavigation";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/live", label: "Live Map" },
  { to: "/search", label: "Route Search" },
  { to: "/nearby", label: "Nearby Stops" },
];

function MainLayout() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3.5 md:px-6 md:py-4">
          <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink md:text-xl">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" />
            Transito
          </NavLink>
          <nav className="hidden gap-7 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-accent" : "text-ink-soft hover:text-accent"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <footer className="mt-auto hidden border-t border-line py-8 md:block">
        <div className="mx-auto max-w-[1180px] px-6">
          <p className="text-xs text-ink-faint">
            Transito — Real-time city bus tracking. Built for Nagpur.
          </p>
        </div>
      </footer>

      <BottomNavigation />
    </>
  );
}

export default MainLayout;