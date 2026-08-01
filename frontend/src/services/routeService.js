import { fetchCollection } from "../firebase/firestore";

export async function getAllRoutes() {
  const routes = await fetchCollection("routes");
  const map = {};
  routes.forEach((r) => {
    map[r.id] = r;
  });
  return map;
}