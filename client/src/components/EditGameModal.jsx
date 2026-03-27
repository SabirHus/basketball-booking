import { useState } from "react";
import axios from "axios";

const EditGameModal = ({ game, onClose, onGameUpdated }) => {
  // Pre-fill the form with every detail from the existing game
  const [formData, setFormData] = useState({
    courtName: game.court_name,
    address: game.address,
    date: new Date(game.date_time).toISOString().slice(0, 16), 
    skillLevel: game.skill_level,
    maxPlayers: game.max_players,
    minPlayers: game.min_players || 4,
    price: game.price
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalLat = game.latitude;
      let finalLng = game.longitude;

      // Only call geocoding API if the address was changed, to avoid unnecessary API calls and rate limits
      if (formData.address !== game.address) {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}`);
          const geoData = await geoRes.json();
          
          if (geoData && geoData.length > 0) {
              finalLat = parseFloat(geoData[0].lat);
              finalLng = parseFloat(geoData[0].lon);
          } else {
              alert("Warning: Could not find exact map coordinates for this address. Using previous map pin location.");
          }
      }

      const token = localStorage.getItem("token");
      
      const payload = {
        court_name: formData.courtName,
        address: formData.address,
        date_time: formData.date,
        skill_level: formData.skillLevel,
        max_players: formData.maxPlayers,
        min_players: formData.minPlayers,
        price: formData.price,
        latitude: finalLat,
        longitude: finalLng
      };

      await axios.put(`${import.meta.env.VITE_API_URL}/games/edit/${game.game_id}`, payload, {
        headers: { token }
      });
      
      alert("✅ Game updated successfully!");
      onGameUpdated(); 
    } catch (err) {
      alert(err.response?.data || "Failed to update game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0, color: "var(--primary)" }}>✏️ Edit Game</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Court Name</label>
            <input type="text" className="form-input" value={formData.courtName} onChange={(e) => setFormData({...formData, courtName: e.target.value})} required />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Street Address (Changes Map Pin)</label>
            <input type="text" className="form-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
          </div>

          <div className="form-group">
             <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Date & Time</label>
             <input type="datetime-local" className="form-input" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Skill Level</label>
            <select className="form-input" value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}>
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="flex-between" style={{ gap: "15px", marginBottom: "15px" }}>
             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Min Players</label>
               <input type="number" min="2" max="30" className="form-input" value={formData.minPlayers} onChange={(e) => setFormData({...formData, minPlayers: e.target.value})} required />
             </div>

             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Players</label>
               <input type="number" min={game.player_count || 2} max="30" className="form-input" value={formData.maxPlayers} onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})} required />
             </div>

             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Price (£)</label>
               <input type="number" min="0" step="0.50" className="form-input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
             </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Saving & Locating..." : "Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: "var(--border-color)", color: "var(--text-main)" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGameModal;