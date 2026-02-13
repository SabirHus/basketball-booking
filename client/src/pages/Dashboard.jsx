import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal"; // Import the Modal

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
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

  // 1. Function called when user clicks the map
  const handleMapClick = (coords) => {
    setClickedCoords(coords);
    setIsModalOpen(true);
  };

  // 2. Function called after successful hosting
  const refreshMap = () => {
    console.log("Game hosted! We will load pins here in the next step.");
  };

  return (
    <div className="dashboard-container" style={{ padding: "20px", fontFamily: "Arial" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Welcome, {user?.username}! 🏀</h1>
        <button onClick={handleLogout} style={{ background: "#ff4d4d", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer" }}>
          Log Out
        </button>
      </header>
      
      <div className="main-content" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        
        {/* Map Section */}
        <div className="map-section">
          <h3>Click on the map to host a game! 👇</h3>
          <CourtMap onMapClick={handleMapClick} />
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="card" style={{ background: "#f4f4f4", padding: "20px", borderRadius: "10px" }}>
            <h3>📅 Upcoming Games</h3>
            <p>No games yet.</p>
          </div>
        </div>

      </div>

      {/* POP-UP MODAL */}
      {isModalOpen && (
        <HostGameModal 
            coords={clickedCoords} 
            onClose={() => setIsModalOpen(false)}
            onGameHosted={refreshMap}
        />
      )}
    </div>
  );
};

export default Dashboard;