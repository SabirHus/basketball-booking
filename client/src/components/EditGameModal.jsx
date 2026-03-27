import { useState, useEffect } from "react";
import axios from "axios";
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const EditGameModal = ({ game, onClose, onGameUpdated }) => {
  // Initialise form data with existing game details, converting date to the correct format for the datetime-local input
  const [formData, setFormData] = useState({
    courtName: game.court_name,
    address: game.address,
    latitude: game.latitude,
    longitude: game.longitude,
    date: new Date(game.date_time).toISOString().slice(0, 16), 
    skillLevel: game.skill_level,
    maxPlayers: game.max_players,
    minPlayers: game.min_players || 4,
    price: game.price
  });

  // State for the address autocomplete feature
  const [addressQuery, setAddressQuery] = useState(game.address);
  const [addressResults, setAddressResults] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialise the map provider
  const provider = new OpenStreetMapProvider();

  // Effect to search for addresses as the user types, with a debounce of 1 second
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
        // Only search if the query has actually changed from the saved address
        if (addressQuery && addressQuery !== formData.address) {
            setIsSearchingAddress(true);
            try {
                // Fetch real addresses matching their input
                const results = await provider.search({ query: addressQuery });
                setAddressResults(results);
            } catch (err) {
                console.error("Address search failed", err);
            } finally {
                setIsSearchingAddress(false);
            }
        } else {
            setAddressResults([]); // Clear dropdown if input is empty or matches existing
        }
    }, 1000);

    // Cleanup the timeout if they keep typing
    return () => clearTimeout(timeoutId);
  }, [addressQuery, formData.address]);

  // Handle when the user clicks a real address from the dropdown
  const handleSelectAddress = (result) => {
      setFormData({
          ...formData,
          address: result.label,
          latitude: result.y,
          longitude: result.x
      });
      setAddressQuery(result.label);
      setAddressResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check: Ensure they actually selected a verified address from the dropdown
    if (addressQuery !== formData.address) {
        return alert("Please select a verified address from the dropdown list before saving.");
    }

    setLoading(true);

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
        latitude: formData.latitude,
        longitude: formData.longitude
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

          {/* Address Autocomplete Input */}
          <div className="form-group" style={{ position: "relative" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Street Address <span style={{ color: "var(--primary)", fontSize: "0.8em", fontWeight: "normal" }}>(Changes Map Pin)</span>
            </label>
            <input 
                type="text" 
                className="form-input"
                value={addressQuery}
                onChange={(e) => setAddressQuery(e.target.value)} 
                placeholder="Start typing an address..."
                required 
            />
            {isSearchingAddress && <small style={{ color: "var(--text-light)", display: "block", marginTop: "5px" }}>Searching global map data...</small>}
            
            {/* The Dropdown Menu for Search Results */}
            {addressResults.length > 0 && (
                <ul style={{ 
                    position: "absolute", 
                    top: "100%", left: 0, right: 0, 
                    background: "var(--bg-color)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "4px", 
                    maxHeight: "200px", overflowY: "auto", 
                    listStyle: "none", padding: 0, margin: "5px 0 0 0", 
                    zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    {addressResults.map((result, index) => (
                        <li 
                            key={index} 
                            onClick={() => handleSelectAddress(result)}
                            style={{ 
                                padding: "10px", 
                                borderBottom: "1px solid var(--border-color)", 
                                cursor: "pointer",
                                fontSize: "14px",
                                color: "var(--text-main)"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "var(--border-color)"}
                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                            📍 {result.label}
                        </li>
                    ))}
                </ul>
            )}
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
            <button type="submit" className="btn btn-primary" disabled={loading || addressQuery !== formData.address} style={{ flex: 1 }}>
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