import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import LiveTracking from "../pages/LiveTracking";
import SearchResults from "../pages/SearchResults";
import NearbyStops from "../pages/NearbyStops";
import RouteDetails from "../pages/RouteDetails";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LiveTracking />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/nearby" element={<NearbyStops />} />
        <Route path="/route/:routeId" element={<RouteDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;