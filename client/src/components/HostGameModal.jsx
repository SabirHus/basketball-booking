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
      onGameHosted(); // Refresh the map
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      alert("Error hosting game. Check console.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Host a Game 📍</h2>
        <p>Location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Court Name (e.g. Peel Park)"
            required
            style={styles.input}
            onChange={(e) => setFormData({...formData, courtName: e.target.value})}
          />
          <input
            type="datetime-local"
            required
            style={styles.input}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
          <select 
            style={styles.input}
            onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
          >
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          <div style={styles.buttons}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn}>Confirm Game</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple CSS-in-JS for the modal
const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000,
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  modal: {
    background: "white", padding: "20px", borderRadius: "10px",
    width: "300px", textAlign: "center"
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  buttons: { display: "flex", justifyContent: "space-between", marginTop: "10px" },
  cancelBtn: { background: "#ccc", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" },
  submitBtn: { background: "#007bff", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" }
};

export default HostGameModal;