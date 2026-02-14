import { useState } from "react";
import axios from "axios";

const HostGameModal = ({ coords, onClose, onGameHosted }) => {
  const [formData, setFormData] = useState({
    courtName: "",
    date: "",
    skillLevel: "All Levels",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        ...formData,
        latitude: coords.lat,
        longitude: coords.lng,
      };

      await axios.post("http://localhost:5000/games/host", payload, {
        headers: { token: token },
      });

      alert("Game Hosted Successfully! 🏀");
      onGameHosted(); 
      onClose(); 
    } catch (err) {
      console.error(err);
      alert("Error hosting game. Check console.");
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
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label style={{display: "block", marginBottom: "5px", fontWeight: "bold"}}>Skill Level</label>
            <select 
              className="form-input"
              onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
            >
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
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