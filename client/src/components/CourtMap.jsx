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

const escapeHTML = (str) => {
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
};

const CourtMap = ({ onMapClick, games = [], searchLocation }) => { 
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const onMapClickRef = useRef(onMapClick);
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    // Guard against double-init (React StrictMode runs effects twice in dev)
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView([53.4875, -2.2748], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

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

    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (onMapClickRef.current) onMapClickRef.current({ lat, lng });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && searchLocation) {
        mapInstanceRef.current.flyTo([searchLocation.lat, searchLocation.lon], 15);
    }
  }, [searchLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      games.forEach((game) => {
        const isGameOn = game.min_players && parseInt(game.player_count, 10) >= parseInt(game.min_players, 10);
        const pinColor = isGameOn ? GreenIcon : DefaultIcon;

        const marker = L.marker([game.latitude, game.longitude], { icon: pinColor }).addTo(markersLayerRef.current);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e); 
            if (onMapClickRef.current) onMapClickRef.current({ game: game });
        });
        
        const safeCourtName = escapeHTML(game.court_name);
        const statusText = isGameOn ? `<br><span style="color: green; font-weight: bold;">✅ Game ON</span>` : '';
        
        marker.bindTooltip(`<b>${safeCourtName}</b><br>Players: ${game.player_count || 0} / ${game.max_players}${statusText}`); 
      });
    }
  }, [games]);

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