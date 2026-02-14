import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const res = await axios.get("http://localhost:5000/games/all");
      setGames(res.data);
    } catch (err) {
      console.error("Error loading games:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setUser({ username: "Baller" }); 
      fetchGames(); 
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

  const refreshMap = () => {
    fetchGames(); 
  };

  return (
    <div className="container">
      {/* HEADER */}
      <header className="flex-between" style={{ marginBottom: "20px", padding: "10px 0" }}>
        <h1 style={{ color: "#ff5722", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          🏀 CourtLink <span style={{fontSize:"0.5em", color:"#888", fontWeight: "normal"}}>v1.0</span>
        </h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontWeight: "600", color: "#2d3436" }}>Hello, {user?.username}</span>
          <button onClick={handleLogout} className="btn btn-danger">
            Log Out
          </button>
        </div>
      </header>
      
      {/* MAIN GRID LAYOUT */}
      <div className="dashboard-grid">
        
        {/* LEFT: MAP */}
        <div className="map-wrapper">
          <CourtMap onMapClick={handleMapClick} games={games} />
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside>
          <div className="card">
            <h3 style={{ borderBottom: "2px solid #ff5722" }}>📅 Active Games</h3>
            {games.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                <p style={{fontSize: "2em", margin: "0 0 10px 0"}}>🏀</p>
                <p>No games active.</p>
                <small>Click the map to host the first one!</small>
              </div>
            ) : (
                <ul className="game-list">
                    {games.map(g => (
                        <li key={g.game_id} className="game-item">
                            <b style={{color: "#ff5722"}}>{g.court_name}</b>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                <small style={{background: "#eee", padding: "2px 6px", borderRadius: "4px"}}>
                                  {g.skill_level}
                                </small>
                                <small>{new Date(g.date_time).toLocaleDateString()}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </aside>

      </div>

      {/* SAFE MODAL RENDER */}
      {isModalOpen && clickedCoords && (
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