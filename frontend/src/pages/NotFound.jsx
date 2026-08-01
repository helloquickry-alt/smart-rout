// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

function NotFound() {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center md:py-24">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-live-soft text-live">
        <AlertTriangle size={26} />
      </div>
      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Page not found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft md:text-base">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-deep"
      >
        Back home
      </Link>
    </div>
  );
}
export default NotFound;