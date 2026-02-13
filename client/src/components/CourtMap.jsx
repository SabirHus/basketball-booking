import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Fix for missing marker icons ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// ------------------------------------

const CourtMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Map only if it doesn't exist
    if (!mapInstanceRef.current && mapContainerRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13);

      // 2. Add OpenStreetMap Tiles (Free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // 3. Add a Marker
      L.marker([53.4875, -2.2748])
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>University of Salford</b><br>Basketball Court')
        .openPopup();
    }

    // Cleanup when leaving page
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: "400px", width: "100%", borderRadius: "10px", zIndex: 0 }} 
    />
  );
};

export default CourtMap;