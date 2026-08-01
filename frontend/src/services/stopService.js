import { fetchCollection } from "../firebase/firestore";

export async function getAllStops() {
  const stops = await fetchCollection("stops");
  const map = {};
  stops.forEach((s) => {
    map[s.id] = s;
  });
  return map;
}