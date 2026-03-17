import { useState } from "react";
import axios from "axios";

const HostGameModal = ({ coords, onClose, onGameHosted }) => {
  const [formData, setFormData] = useState({
    courtName: "",
    date: "",
    skillLevel: "All Levels",
    maxPlayers: 10, 
    price: 0        
  });

  // 🛑 SPRINT 6: Get current exact time formatted for the HTML input
  const today = new Date().toISOString().slice(0, 16);

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        court_name: formData.courtName,
        date_time: formData.date,
        skill_level: formData.skillLevel,
        max_players: formData.maxPlayers,
        price: formData.price,
        latitude: coords.lat,
        longitude: coords.lng,
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/games/host`, payload, {
        headers: { token: token },
      });

      alert("Game Hosted Successfully! 🏀");
      onGameHosted(); 
      onClose(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "Error hosting game. Check console.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex-between" style={{ marginBottom: "20px" }}>
           <h2 style={{ margin: 0 }}>Host a Game 📍</h2>
           <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"1.5em", cursor:"pointer" }}>&times;</button>
        </div>
        
        <p style={{ color: "#666", marginBottom: "20px" }}>
           Location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Where are we playing?</label>
            <input
              type="text"
              className="form-input"
              placeholder="Court Name (e.g. Rucker Park)"
              required
              onChange={(e) => setFormData({...formData, courtName: e.target.value})}
            />
          </div>

          <div className="form-group">
             <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>When?</label>
             <input
              type="datetime-local"
              className="form-input"
              required
              min={today}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Skill Level</label>
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
               <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Max Players</label>
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
               <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Price (£)</label>
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
               <small style={{ color: "#888", display: "block", marginTop: "4px" }}>Set to 0 for Free</small>
             </div>
          </div>

          <div className="flex-between" style={{ marginTop: "30px" }}>
            <button type="button" onClick={onClose} className="btn" style={{ background: "#eee", color: "#333" }}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Game</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostGameModal;