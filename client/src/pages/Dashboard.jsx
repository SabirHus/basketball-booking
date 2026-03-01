import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";

const Dashboard = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchLocation, setSearchLocation] = useState(null);

  // 🚀 SPRINT 5: FILTER STATE
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const navigate = useNavigate();

  // --- API FUNCTIONS ---
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/auth/verify", {
        headers: { token: token }
      });
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

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
      fetchUser();  
      fetchGames(); 
    }
  }, [navigate]);

  // --- HANDLERS ---
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
            setSearchLocation({ lat: res.data.lat, lon: res.data.lon });
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

  // 🚀 SPRINT 5: FILTER LOGIC
  // This filters the games array BEFORE giving it to the map
  const filteredGames = games.filter((game) => {
    // 1. Check Skill
    const matchSkill = filterSkill === "All" || game.skill_level === filterSkill;
    
    // 2. Check Date (Compare YYYY-MM-DD strings)
    let matchDate = true;
    if (filterDate) {
        const gameDateOnly = new Date(game.date_time).toISOString().split('T');
        matchDate = gameDateOnly === filterDate;
    }

    return matchSkill && matchDate;
  });

  return (
    <div className="container">
      {/* HEADER */}
      <header className="flex-between" style={{ marginBottom: "20px", padding: "10px 0" }}>
        <h1 style={{ color: "#ff5722", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
          🏀 CourtLink <span style={{fontSize:"0.5em", color:"#888", fontWeight: "normal"}}>v1.0</span>
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span 
            style={{ fontWeight: "600", color: "#2d3436", cursor: "pointer", textDecoration: "underline" }} 
            onClick={() => navigate("/profile")}
          >
            Hello, {user ? user.username : "Loading..."}
          </span>
          <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
        </div>
      </header>

      {/* 🚀 SPRINT 5: FILTER CONTROL BAR */}
      <div style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "20px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
        <strong style={{color: "#444"}}>Filters:</strong>
        
        {/* Skill Filter */}
        <div>
            <label style={{marginRight: "10px", fontSize: "0.9em"}}>Skill Level:</label>
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} style={{padding: "5px", borderRadius: "4px", border: "1px solid #ccc"}}>
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
            </select>
        </div>

        {/* Date Filter */}
        <div>
            <label style={{marginRight: "10px", fontSize: "0.9em"}}>Date:</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{padding: "5px", borderRadius: "4px", border: "1px solid #ccc"}} />
        </div>

        {/* Clear Filters Button */}
        {(filterSkill !== "All" || filterDate !== "") && (
            <button onClick={() => { setFilterSkill("All"); setFilterDate(""); }} style={{background: "none", border: "none", color: "#ff5722", cursor: "pointer", textDecoration: "underline"}}>
                Clear Filters
            </button>
        )}
      </div>
      
      {/* GRID LAYOUT */}
      <div className="dashboard-grid">
        
        {/* LEFT: MAP + SEARCH */}
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

          {/* 🚀 SPRINT 5: Pass the FILTERED array, not all games */}
          <CourtMap onMapClick={handleMapClick} games={filteredGames} searchLocation={searchLocation} />
        </div>

        {/* RIGHT: SIDEBAR */}
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
                    <h3 style={{ borderBottom: "2px solid #ff5722", paddingBottom: "10px" }}>📅 How to Book</h3>
                    <div style={{ color: "#666", lineHeight: "1.6" }}>
                        <p>1. <b>Explore the Map</b> to find games.</p>
                        <p>2. <b>Filter above</b> by skill or date.</p>
                        <p>3. <b>Click a Blue Pin</b> 📍 to see details.</p>
                        <p>4. <b>Hit "Join Game"</b> to reserve your spot.</p>
                        <hr style={{margin: "20px 0", borderTop: "1px solid #eee"}}/>
                        <p><b>Want to host?</b> Click anywhere on the empty map to drop a new pin!</p>
                    </div>
                </>
            )}
          </div>
        </aside>

      </div>

      {/* HOST MODAL */}
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