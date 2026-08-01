import { useEffect, useState } from "react";
import { listenToAllBuses } from "../firebase/realtimeDb";

export function useAllBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAllBuses((busList) => {
      setBuses(busList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { buses, loading };
}