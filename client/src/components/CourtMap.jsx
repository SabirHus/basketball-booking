import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Blue pin for default court locations
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Orange pin to highlight location after search bar
const OrangeIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Green pin for go ahead games
const GreenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Function to sanitise user input
const escapeHTML = (str) => {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
};

const CourtMap = ({ onMapClick, games = [], searchLocation }) => { 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialise the map and map controls
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Default coordinates set to central Manchester
      const map = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13); 

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Address Search Functionality
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider: provider,
        style: 'bar', 
        showMarker: true, 
        marker: {
          icon: OrangeIcon, 
          draggable: false,
        },
        retainZoomLevel: false,
        animateZoom: true,
        autoClose: true,
        searchLabel: 'Enter city or street name...',
      });
      map.addControl(searchControl);

      // Clear and redraw markers later
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Click to Host Games
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick({ lat, lng });
      });

      mapInstanceRef.current = map;
    }

    // Cleanup function to prevent memory leaks and map duplication errors
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapClick]); 

  // Handle external search commands passed down as props from parent components
  useEffect(() => {
    if (mapInstanceRef.current && searchLocation) {
        mapInstanceRef.current.flyTo([searchLocation.lat, searchLocation.lon], 15);
    }
  }, [searchLocation]);

  // Render map markers whenever the game data updates
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      // Clear previous pins to prevent stacking duplicates
      markersLayerRef.current.clearLayers();

      games.forEach((game) => {
        // Check if the game has met its minimum player requirement
        const isGameOn = game.min_players && parseInt(game.player_count, 10) >= parseInt(game.min_players, 10);
        
        // Assign the pin colour based on the game status
        const pinColor = isGameOn ? GreenIcon : DefaultIcon;

        const marker = L.marker([game.latitude, game.longitude], { icon: pinColor }).addTo(markersLayerRef.current);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e); 
            if (onMapClick) onMapClick({ game: game });
        });
        
        // Sanitise the court name before injecting it into the HTML tooltip
        const safeCourtName = escapeHTML(game.court_name);
        const statusText = isGameOn ? `<br><span style="color: green; font-weight: bold;">✅ Game ON</span>` : '';
        
        marker.bindTooltip(`<b>${safeCourtName}</b><br>Players: ${game.player_count || 0} / ${game.max_players}${statusText}`); 
      });
    }
  }, [games, onMapClick]);

  // GPS locater on red pin
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14); 
        }
      },
      () => alert("Unable to retrieve your location. Check your browser permissions.")
    );
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div 
        ref={mapContainerRef} 
        className="map-container"
        style={{ height: "100%", width: "100%", zIndex: 0, cursor: "crosshair" }} 
      />
      
      <button 
        onClick={handleLocateMe}
        title="Find Near Me"
        className="gps-btn"
      >
        📍
      </button>
    </div>
  );
};

export default CourtMap;