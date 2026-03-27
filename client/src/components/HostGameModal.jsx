import { useState, useEffect } from "react";
import axios from "axios";

const HostGameModal = ({ coords, onClose, onGameHosted }) => {
  // Initialise the form state with default values
  const [formData, setFormData] = useState({
    courtName: "",
    address: "", 
    date: "",
    skillLevel: "All Levels",
    maxPlayers: 10, 
    minPlayers: 4, 
    price: 0        
  });
  
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  
  // Get the current date and time formatted correctly for the HTML datetime-local input
  const today = new Date().toISOString().slice(0, 16);

  // Automatically fetch the street address using reverse geocoding when the modal opens
  useEffect(() => {
    const fetchAddress = async () => {
      if (!coords) return;
      
      setIsFetchingAddress(true);
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
        const data = await res.json();
        
        if (data && data.display_name) {
           // The API returns a very long string so its split and keep the first three segments for clean UI
           const addressParts = data.display_name.split(", ");
           const cleanAddress = addressParts.slice(0, 3).join(", ");
           
           setFormData(prev => ({ ...prev, address: cleanAddress }));
        }
      } catch (error) {
        console.error("Could not fetch address data:", error);
      } finally {
        setIsFetchingAddress(false);
      }
    };

    fetchAddress();
    
  // Lat/lng values instead of the coords object to prevent unnecessary API calls
  }, [coords?.lat, coords?.lng]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate player capacity constraints before hitting the backend
    if (parseInt(formData.minPlayers, 10) > parseInt(formData.maxPlayers, 10)) {
      return alert("Minimum players cannot be greater than the maximum capacity.");
    }

    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        court_name: formData.courtName,
        address: formData.address, 
        date_time: formData.date,
        skill_level: formData.skillLevel,
        max_players: formData.maxPlayers,
        min_players: formData.minPlayers, 
        price: formData.price,
        latitude: coords.lat,
        longitude: coords.lng
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/games/host`, payload, {
        headers: { token: token }
      });

      alert("Game hosted successfully! 🏀");
      onGameHosted(); 
      onClose(); 
    } catch (err) {
      console.error("Failed to host game:", err);
      alert(err.response?.data || "An error occurred while hosting the game. Check the console for details.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <div className="flex-between" style={{ marginBottom: "20px" }}>
           <h2 style={{ margin: 0 }}>Host a Game 📍</h2>
           <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5em", cursor: "pointer" }}>&times;</button>
        </div>
        
        <p style={{ color: "#666", marginBottom: "20px" }}>
           Location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Where are we playing?</label>
            <input
              type="text"
              className="form-input"
              placeholder="Court Name (e.g. Rucker Park)"
              required
              onChange={(e) => setFormData({...formData, courtName: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Street Address</label>
            <input
              type="text"
              className="form-input"
              placeholder={isFetchingAddress ? "Locating address..." : "e.g. 155th St & Frederick Douglass Blvd"}
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="form-group">
             <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>When?</label>
             <input
              type="datetime-local"
              className="form-input"
              required
              min={today}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Skill Level</label>
            <select 
              className="form-input"
              value={formData.skillLevel}
              onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
            >
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="flex-between" style={{ gap: "15px", marginBottom: "15px" }}>
             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Min Players</label>
               <input
                 type="number"
                 min="2"
                 max="30"
                 className="form-input"
                 value={formData.minPlayers}
                 required
                 onChange={(e) => setFormData({...formData, minPlayers: e.target.value})}
               />
             </div>

             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Players</label>
               <input
                 type="number"
                 min="2"
                 max="30"
                 className="form-input"
                 value={formData.maxPlayers}
                 required
                 onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
               />
             </div>

             <div className="form-group" style={{ flex: 1, margin: 0 }}>
               <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Price (£)</label>
               <input
                 type="number"
                 min="0"
                 max="100"
                 step="0.50"
                 className="form-input"
                 value={formData.price}
                 required
                 onChange={(e) => setFormData({...formData, price: e.target.value})}
               />
             </div>
          </div>
          
          <small style={{ color: "#888", display: "block", textAlign: "right", marginBottom: "15px" }}>
            Set price to 0 for Free
          </small>

          <div className="flex-between" style={{ marginTop: "20px" }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: "#eee", color: "#333" }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isFetchingAddress}>Confirm Game</button>
          </div>
        </form>
        
      </div>
    </div>
  );
};

export default HostGameModal;