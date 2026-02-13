import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourtMap from "../components/CourtMap";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If not logged in, kick them out
    if (!token) {
      navigate("/");
    } else {
      // Mock API call to get user info (We will replace this with real axios later)
      setTimeout(() => {
         setUser({ username: "Baller" }); 
      }, 100);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container" style={{ padding: "20px", fontFamily: "Arial" }}>
      {/* HEADER */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Welcome, {user?.username}! 🏀</h1>
        <button onClick={handleLogout} style={{ background: "#ff4d4d", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Log Out
        </button>
      </header>
      
      {/* MAIN GRID */}
      <div className="main-content" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        
        {/* LEFT COLUMN: Map & Actions */}
        <div className="map-section">
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
             <button style={{ flex: 1, padding: "15px", background: "#333", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}>
                🔍 Find a Game
             </button>
             <button style={{ flex: 1, padding: "15px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }}>
                ➕ Host a Game
             </button>
          </div>
          <CourtMap />
        </div>

        {/* RIGHT COLUMN: Stats */}
        <div className="stats-section">
          <div className="card" style={{ background: "#f4f4f4", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
            <h3>📅 Your Schedule</h3>
            <p>No upcoming games.</p>
          </div>
          <div className="card" style={{ background: "#fff3cd", padding: "20px", borderRadius: "10px" }}>
             <h3>🏆 Reputation</h3>
             <p>⭐⭐⭐⭐⭐ (New)</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;