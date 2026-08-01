import { useEffect, useRef } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import busIcon from "../assets/images/bus-marker.png";

function BusMarker({ position, heading = 0 }) {
  const markerRef = useRef(null);

  const icon = L.divIcon({
    className: "bus-marker-icon",
    html: `<img src="${busIcon}" style="
      width: 38px;
      height: 38px;
      transform: rotate(${heading}deg);
      transition: transform 0.5s linear;
    " />`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return <Marker ref={markerRef} position={position} icon={icon} />;
}

export default BusMarker;