import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- VITE FIX: Use Online Icons ---
// This prevents "Module not found" errors for local images
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
// ----------------------------------

const CourtMap = () => {
  const position = [53.4875, -2.2748]; // Salford Coordinates

  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: "400px", width: "100%", zIndex: "0" }} 
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>University of Salford</Popup>
      </Marker>
    </MapContainer>
  );
};

export default CourtMap;