import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function fetchCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export { db };