import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🚀 SPRINT 8: Task 8.1 - Import the Search Bar & CSS
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

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

      // 🚀 SPRINT 8: Add the sleek Search Bar control to the map
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider: provider,
        style: 'bar', 
        showMarker: false, // We keep this false so it doesn't leave a ghost pin if they cancel
        retainZoomLevel: false,
        animateZoom: true,
        autoClose: true,
        searchLabel: 'Enter city or street name...',
        keepResult: true,
      });
      map.addControl(searchControl);

      // 🚀 THE MAGIC LINK: When a search finishes, open the Host Game Modal!
      map.on('geosearch/showlocation', (result) => {
        if (result && result.location) {
          const lat = parseFloat(result.location.y);
          const lng = parseFloat(result.location.x);
          
          // Trigger the exact same function a mouse click does!
          if (onMapClick) onMapClick({ lat, lng });
        }
      });

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

  // 🚀 SPRINT 8: Task 8.2 - GPS Geolocation Logic
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14); // Smooth fly to user!
        }
      },
      () => alert("Unable to retrieve your location. Check browser permissions.")
    );
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div 
        ref={mapContainerRef} 
        className="map-container"
        style={{ height: "100%", width: "100%", zIndex: 0, cursor: "crosshair" }} 
      />
      
      {/* 🚀 SPRINT 8: Floating GPS Button */}
      <button 
        onClick={handleLocateMe}
        title="Find Near Me"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          background: "white",
          border: "2px solid #ccc",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "transform 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        📍
      </button>
    </div>
  );
};

export default CourtMap;