import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Don't forget this!
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); // Store the list of games here
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
  const navigate = useNavigate();

  // 1. Fetch Games from Database
  const fetchGames = async () => {
    try {
      const res = await axios.get("http://localhost:5000/games/all");
      setGames(res.data); // Save to state
      console.log("Games loaded:", res.data);
    } catch (err) {
      console.error("Error loading games:", err);
    }
  };

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

  const handleMapClick = (coords) => {
    setClickedCoords(coords);
    setIsModalOpen(true);
  };

  // Refresh map after hosting
  const refreshMap = () => {
    fetchGames(); // <--- Re-fetch so the new pin appears instantly
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
        
        <div className="map-section">
          <h3>Click on the map to host a game! 👇</h3>
          {/* Pass the games list to the map */}
          <CourtMap onMapClick={handleMapClick} games={games} />
        </div>

        <div className="stats-section">
          <div className="card" style={{ background: "#f4f4f4", padding: "20px", borderRadius: "10px" }}>
            <h3>📅 Active Games</h3>
            {games.length === 0 ? <p>No games yet.</p> : (
                <ul>
                    {games.map(g => (
                        <li key={g.game_id}>
                            <b>{g.court_name}</b> <br/>
                            <small>{new Date(g.date_time).toLocaleDateString()}</small>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </div>

      </div>

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