import { useEffect, useState } from "react";
import logo from "../assets/images/logo.png";

function SplashScreen({ onFinish, duration = 2000 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Thoda pehle fade-out start karo taaki transition smooth lage
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 400);
    const finishTimer = setTimeout(() => onFinish(), duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logo}
        alt="Transito"
        className="w-48 md:w-56 animate-pulse"
        style={{ animationDuration: "1.8s" }}
      />
      <div className="mt-6 flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
      </div>
    </div>
  );
}

export default SplashScreen;