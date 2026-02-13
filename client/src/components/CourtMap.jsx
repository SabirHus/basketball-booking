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

const CourtMap = ({ onMapClick, games = [] }) => { 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null); // Holds the pins

  // 1. Initialize Map (Runs once)
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create a "Layer Group" to hold our game markers
      markersLayerRef.current = L.layerGroup().addTo(map);

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick({ lat, lng });
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // 2. Render Markers (Runs whenever 'games' changes)
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      // Clear old pins to avoid duplicates
      markersLayerRef.current.clearLayers();

      // Loop through games and add new pins
      games.forEach((game) => {
        const popupContent = `
          <div style="min-width: 150px">
            <h3>🏀 ${game.court_name}</h3>
            <p><b>Level:</b> ${game.skill_level}</p>
            <p><b>Time:</b> ${new Date(game.date_time).toLocaleString()}</p>
            <button style="width:100%; background:#007bff; color:white; border:none; padding:5px; border-radius:3px">
              Join Game
            </button>
          </div>
        `;

        L.marker([game.latitude, game.longitude])
          .bindPopup(popupContent)
          .addTo(markersLayerRef.current);
      });
    }
  }, [games]); // <--- Dependency: Run this when games data updates

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: "400px", width: "100%", borderRadius: "10px", zIndex: 0, cursor: "crosshair" }} 
    />
  );
};

export default CourtMap;