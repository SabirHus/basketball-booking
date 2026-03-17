import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Default Blue Pin (For actual games)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// 🚀 SPRINT 8: Custom Orange Pin just for Search Results!
let OrangeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

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

      // Add the Search Bar
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider: provider,
        style: 'bar', 
        showMarker: true, 
        marker: {
          icon: OrangeIcon, // 🚀 Uses our new Orange Pin!
          draggable: false,
        },
        retainZoomLevel: false,
        animateZoom: true,
        autoClose: true,
        searchLabel: 'Enter city or street name...',
      });
      map.addControl(searchControl);

      // Create a layer group for existing game markers
      markersLayerRef.current = L.layerGroup().addTo(map);

      // NORMAL CLICK LISTENER: Opens the Host Game Modal
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (onMapClick) onMapClick({ lat, lng });
      });

      mapInstanceRef.current = map;
    }
  }, []); // Only runs once

  // 2. SEARCH LOGIC (If triggered from outside the map)
  useEffect(() => {
    if (mapInstanceRef.current && searchLocation) {
        mapInstanceRef.current.flyTo([searchLocation.lat, searchLocation.lon], 15);
    }
  }, [searchLocation]);

  // 3. RENDER PINS (Real Games)
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      games.forEach((game) => {
        // These will use the Default Blue Pin
        const marker = L.marker([game.latitude, game.longitude]).addTo(markersLayerRef.current);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e); 
            if (onMapClick) onMapClick({ game: game });
        });
        
        marker.bindTooltip(`<b>${game.court_name}</b><br>Players: ${game.player_count || 0}`); 
      });
    }
  }, [games]);

  // GPS Geolocation Logic
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14); 
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