import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import SplashScreen from "./components/SplashScreen";
import "./firebase/firebaseConfig";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} duration={2000} />;
  }

  return <AppRoutes />;
}

export default App;