import { useState } from "react";
import axios from "axios";

const EditGameModal = ({ game, onClose, onGameUpdated }) => {
  // Fill the form with the game's current data
  const [formData, setFormData] = useState({
    date_time: new Date(game.date_time).toISOString().slice(0, 16), 
    max_players: game.max_players,
    skill_level: game.skill_level
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL}/games/edit/${game.game_id}`, formData, {
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
      <div className="modal-content" style={{ maxWidth: "400px" }}>
        <h2 style={{ marginTop: 0, color: "var(--primary)" }}>✏️ Edit Game</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Date & Time</label>
            <input 
                type="datetime-local" 
                name="date_time" 
                value={formData.date_time} 
                onChange={handleChange} 
                className="form-input" 
                required 
            />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Max Players</label>
            <input 
                type="number" 
                name="max_players" 
                value={formData.max_players} 
                onChange={handleChange} 
                className="form-input" 
                min={game.player_count || 2} 
                max="30" 
                required 
            />
          </div>

          <div className="form-group">
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Skill Level</label>
            <select name="skill_level" value={formData.skill_level} onChange={handleChange} className="form-input">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Saving..." : "Save Changes"}
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