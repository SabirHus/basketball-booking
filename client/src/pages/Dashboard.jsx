import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";

const Dashboard = () => {
  // State
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchLocation, setSearchLocation] = useState(null);

  const navigate = useNavigate();

  // 1. FETCH USER NAME (The new part)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/auth/verify", {
        headers: { token: token }
      });
      setUser(res.data); // Sets { username: "YourName" }
    } catch (err) {
      console.error("Error verifying user:", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  // 2. FETCH GAMES
  const fetchGames = async () => {
    try {
      const res = await axios.get("http://localhost:5000/games/all");
      setGames(res.data);
      if (selectedGame) {
        const updated = res.data.find(g => g.game_id === selectedGame.game_id);
        if (updated) setSelectedGame(updated);
      }
    } catch (err) {
      console.error("Error loading games:", err);
    }
  };

  useEffect(() => {
    document.title = "Dashboard - CourtLink";
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchUser();  // <--- Call the name fetcher
      fetchGames(); // <--- Call the game fetcher
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
        if (res.data && res.data.length > 0) {
            const firstResult = res.data[0];
            setSearchLocation({ lat: firstResult.lat, lon: firstResult.lon });
        } else {
            alert("Location not found!");
        }
    } catch (err) {
        console.error("Search error:", err);
    }
  };

  const handleMapClick = (data) => {
    if (data.game) {
        setSelectedGame(data.game);
        setClickedCoords(null); 
    } else {
        setClickedCoords(data); 
        setSelectedGame(null);
        setIsModalOpen(true);
    }
  };

  const handleJoinGame = async () => {
    if (!selectedGame) return;
    try {
        const token = localStorage.getItem("token");
        await axios.post(`http://localhost:5000/games/join/${selectedGame.game_id}`, {}, {
            headers: { token: token }
        });
        alert("✅ You have joined the game!");
        fetchGames(); 
    } catch (err) {
        alert(err.response?.data || "Error joining game");
    }
  };

  const refreshMap = () => {
    fetchGames(); 
  };

  return (
    <div className="container">
      <header className="flex-between" style={{ marginBottom: "20px", padding: "10px 0" }}>
        <h1 style={{ color: "#ff5722", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          🏀 CourtLink <span style={{fontSize:"0.5em", color:"#888", fontWeight: "normal"}}>v1.0</span>
        </h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Display User Name */}
          <span style={{ fontWeight: "600", color: "#2d3436" }}>
            Hello, {user ? user.username : "Baller"}
          </span>
          <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
        </div>
      </header>
      
      <div className="dashboard-grid">
        <div className="map-wrapper" style={{position: "relative"}}>
            <form onSubmit={handleSearch} style={{
                position: "absolute", top: "10px", left: "50px", zIndex: 999, 
                background: "white", padding: "5px", borderRadius: "8px", 
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)", display: "flex", gap: "5px"
            }}>
                <input 
                    type="text" 
                    placeholder="Search city..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{border: "none", outline: "none", padding: "8px"}}
                />
                <button type="submit" className="btn btn-primary" style={{padding: "8px 12px"}}>🔍</button>
            </form>
          <CourtMap onMapClick={handleMapClick} games={games} searchLocation={searchLocation} />
        </div>

        <aside>
          <div className="card">
            {selectedGame ? (
                <div style={{animation: "fadeIn 0.3s"}}>
                    <button onClick={() => setSelectedGame(null)} style={{background:"none", border:"none", cursor:"pointer", color:"#999", marginBottom:"10px"}}>← Back</button>
                    <h2 style={{color: "#ff5722", margin: "0 0 10px 0"}}>{selectedGame.court_name}</h2>
                    <p><b>Host:</b> {selectedGame.username}</p>
                    <p><b>Level:</b> {selectedGame.skill_level}</p>
                    <p><b>Time:</b> {new Date(selectedGame.date_time).toLocaleString()}</p>
                    <div style={{background: "#eee", padding: "10px", borderRadius: "8px", margin: "20px 0", textAlign:"center"}}>
                        <h3 style={{margin:0, fontSize:"2em"}}>{selectedGame.player_count || 0}</h3>
                        <small>Players Joined</small>
                    </div>
                    <button onClick={handleJoinGame} className="btn btn-primary" style={{width: "100%"}}>
                        Join This Game 🏀
                    </button>
                </div>
            ) : (
                <>
                    <h3 style={{ borderBottom: "2px solid #ff5722" }}>📅 How to Book</h3>
                    <div style={{ color: "#666", lineHeight: "1.6" }}>
                        <p>1. <b>Explore the Map</b> to find active games near you.</p>
                        <p>2. <b>Click a Blue Pin</b> 📍 to see game details here.</p>
                        <p>3. <b>Hit "Join Game"</b> to reserve your spot.</p>
                        <hr style={{margin: "20px 0", borderTop: "1px solid #eee"}}/>
                        <p><b>Want to host?</b> Click anywhere on the map to drop a new pin!</p>
                    </div>
                </>
            )}
          </div>
        </aside>
      </div>

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