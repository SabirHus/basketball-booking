import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Icon Fix ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// ----------------

const CourtMap = ({ onMapClick }) => { // <--- Receive the function here
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // 1. Init Map
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // 2. Add Click Listener
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        console.log("Map Clicked:", lat, lng);
        if (onMapClick) {
            onMapClick({ lat, lng }); // Tell the parent (Dashboard) where we clicked
        }
      });
    }

    return () => {
      // Cleanup is handled by ref check
    };
  }, []); // Run once

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: "400px", width: "100%", borderRadius: "10px", zIndex: 0, cursor: "crosshair" }} 
    />
  );
};

export default CourtMap;