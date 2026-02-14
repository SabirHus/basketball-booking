import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for missing marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const CourtMap = ({ onMapClick, games = [], searchLocation }) => { 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13); // Default: Manchester

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create a layer group for markers so we can clear them easily
      markersLayerRef.current = L.layerGroup().addTo(map);

      // CLICK LISTENER: DETECT EMPTY MAP CLICKS (For Hosting)
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick({ lat, lng });
      });

      mapInstanceRef.current = map;
    }
  }, []);

  // 2. SEARCH LOGIC: Fly to new location
  useEffect(() => {
    if (mapInstanceRef.current && searchLocation) {
        mapInstanceRef.current.flyTo([searchLocation.lat, searchLocation.lon], 15);
    }
  }, [searchLocation]);

  // 3. RENDER PINS: Runs whenever 'games' changes
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      // Clear old pins to prevent duplicates
      markersLayerRef.current.clearLayers();

      games.forEach((game) => {
        const marker = L.marker([game.latitude, game.longitude])
          .addTo(markersLayerRef.current);

        // CLICK LISTENER: DETECT PIN CLICKS (For Joining)
        marker.on('click', (e) => {
            // STOP the click from bubbling down to the map (prevents "Host Game" modal)
            L.DomEvent.stopPropagation(e); 
            
            // Send the GAME OBJECT to parent (Dashboard)
            if (onMapClick) onMapClick({ game: game });
        });
        
        // Hover Tooltip
        marker.bindTooltip(`<b>${game.court_name}</b><br>Players: ${game.player_count || 0}`); 
      });
    }
  }, [games]);

  return (
    <div 
      ref={mapContainerRef} 
      className="map-container"
      style={{ height: "100%", width: "100%", zIndex: 0, cursor: "crosshair" }} 
    />
  );
};

export default CourtMap;