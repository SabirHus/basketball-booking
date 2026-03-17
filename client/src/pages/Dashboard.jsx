import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";
import GameLobby from "../components/GameLobby"; 

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchLocation, setSearchLocation] = useState(null);

  // 🚀 SPRINT 6: State to hold the host's star rating
  const [hostRating, setHostRating] = useState(null);

  // Filters
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      // 🚀 CHANGED TO .ENV VARIABLE
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify`, { headers: { token } });
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const fetchGames = async () => {
    try {
      // 🚀 CHANGED TO .ENV VARIABLE
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/games/all`);
      setGames(res.data);
      if (selectedGame) {
        const updated = res.data.find(g => g.game_id === selectedGame.game_id);
        if (updated) setSelectedGame(updated);
      }
    } catch (err) { console.error(err); }
  };

  // --- LIFECYCLE ---
  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/");
    fetchUser(); fetchGames(); 
  }, [navigate]);

  // --- HANDLERS ---

  // 🚀 SPRINT 6: Fetch the Host's rating whenever a game is clicked!
  useEffect(() => {
    const fetchRating = async () => {
      if (selectedGame) {
        try {
          // 🚀 CHANGED TO .ENV VARIABLE
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/games/rating/${selectedGame.host_id}`);
          setHostRating(res.data);
        } catch (err) {
          console.error("Failed to fetch host rating", err);
          setHostRating(null);
        }
      }
    };
    fetchRating();
  }, [selectedGame]);

  const handleJoinGame = async () => {
    if (!selectedGame) return;
    const isFull = parseInt(selectedGame.player_count) >= selectedGame.max_players;
    if (isFull) return alert("Sorry, this game is full!");

    try {
        const token = localStorage.getItem("token");
        
        // If it costs money, go to Stripe. If it's 0, join immediately.
        if (parseFloat(selectedGame.price) > 0) {
            // 🚀 CHANGED TO .ENV VARIABLE
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/games/checkout/${selectedGame.game_id}`, {}, { headers: { token } });
            window.location.href = res.data.url;
        } else {
            // 🚀 CHANGED TO .ENV VARIABLE
            await axios.post(`${import.meta.env.VITE_API_URL}/games/join/${selectedGame.game_id}`, {}, { headers: { token } });
            alert("✅ Joined successfully for free!");
            fetchGames();
        }
    } catch (err) {
        alert(err.response?.data || "Error joining game");
    }
  };

  // Filter Logic
  const filteredGames = games.filter((game) => {
    const matchSkill = filterSkill === "All" || game.skill_level === filterSkill;
    const isFree = parseFloat(game.price) === 0;
    const matchPrice = filterPrice === "All" || (filterPrice === "Free" && isFree) || (filterPrice === "Paid" && !isFree);
    return matchSkill && matchPrice;
  });

  return (
    <div className="container">
      {/* HEADER */}
      <header className="flex-between" style={{ marginBottom: "20px", padding: "10px 0" }}>
        <h1 style={{ color: "#ff5722", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>🏀 CourtLink</h1>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ fontWeight: "600", cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate("/profile")}>
            Hello, {user ? user.username : "Loading..."}
          </span>
          <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="btn btn-danger">Log Out</button>
        </div>
      </header>

      {/* FILTER BAR */}
      <div style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <strong style={{color: "#444"}}>Filters:</strong>
        <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} className="form-input" style={{width: "auto"}}>
            <option value="All">All Skills</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
        </select>
        <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="form-input" style={{width: "auto"}}>
            <option value="All">All Prices</option>
            <option value="Free">Free Games</option>
            <option value="Paid">Paid Games</option>
        </select>
      </div>
      
      <div className="dashboard-grid">
        <div className="map-wrapper" style={{position: "relative"}}>
          <CourtMap onMapClick={(data) => {
             if (data.game) { setSelectedGame(data.game); setClickedCoords(null); } 
             else { setClickedCoords(data); setSelectedGame(null); setIsModalOpen(true); }
          }} games={filteredGames} searchLocation={searchLocation} />
        </div>

        <aside>
          <div className="card">
            {selectedGame ? (
                <div style={{animation: "fadeIn 0.3s"}}>
                    <button onClick={() => setSelectedGame(null)} style={{background:"none", border:"none", cursor:"pointer", color:"#999", marginBottom:"10px"}}>← Back</button>
                    <h2 style={{color: "#ff5722", margin: "0 0 5px 0"}}>{selectedGame.court_name}</h2>
                    <p style={{margin: "0 0 15px 0", fontWeight: "bold", color: parseFloat(selectedGame.price) > 0 ? "#27ae60" : "#0984e3"}}>
                        {parseFloat(selectedGame.price) > 0 ? `£${parseFloat(selectedGame.price).toFixed(2)}` : "FREE GAME"}
                    </p>
                    
                    {/* 🚀 SPRINT 6: Host and Average Star Rating Rendered Here */}
                    <p style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 10px 0" }}>
                        <b>Host:</b> {selectedGame.username}
                        
                        {hostRating && hostRating.total_ratings > 0 ? (
                            <span style={{ background: "#fffbe6", border: "1px solid #ffe58f", padding: "2px 8px", borderRadius: "12px", fontSize: "0.9em", color: "#d48806", fontWeight: "bold" }}>
                                ⭐ {hostRating.avg_rating} <span style={{ color: "#888", fontSize: "0.8em", fontWeight: "normal" }}>({hostRating.total_ratings})</span>
                            </span>
                        ) : (
                            <span style={{ fontSize: "0.8em", color: "#aaa", fontStyle: "italic" }}>
                                (No reviews yet)
                            </span>
                        )}
                    </p>

                    <p><b>Level:</b> {selectedGame.skill_level}</p>
                    <p><b>Time:</b> {new Date(selectedGame.date_time).toLocaleString()}</p>
                    
                    {/* CAPACITY VISUAL */}
                    <div style={{background: "#eee", padding: "15px", borderRadius: "8px", margin: "20px 0", textAlign:"center"}}>
                        <h3 style={{margin:0, fontSize:"1.8em", color: parseInt(selectedGame.player_count) >= selectedGame.max_players ? "red" : "#333"}}>
                            {selectedGame.player_count || 0} / {selectedGame.max_players}
                        </h3>
                        <small style={{fontWeight: "bold", color: "#666"}}>Spots Filled</small>
                    </div>

                    <button 
                        onClick={handleJoinGame} 
                        disabled={parseInt(selectedGame.player_count) >= selectedGame.max_players}
                        className="btn btn-primary" 
                        style={{width: "100%", marginBottom: "20px", background: parseInt(selectedGame.player_count) >= selectedGame.max_players ? "#ccc" : ""}}
                    >
                        {parseInt(selectedGame.player_count) >= selectedGame.max_players 
                            ? "Game Full 🚫" 
                            : parseFloat(selectedGame.price) > 0 ? `Pay £${parseFloat(selectedGame.price).toFixed(2)} to Join 💳` : "Join for Free 🏀"}
                    </button>

                    {/* THE GAME LOBBY (Player List & Chat) */}
                    <GameLobby gameId={selectedGame.game_id} maxPlayers={selectedGame.max_players} />

                </div>
            ) : (
                <>
                    <h3 style={{ borderBottom: "2px solid #ff5722", paddingBottom: "10px" }}>📅 How to Book</h3>
                    <p>1. <b>Filter</b> to find free or paid games.</p>
                    <p>2. <b>Click a Pin</b> to see capacity.</p>
                    <p>3. <b>Join</b> before it fills up!</p>
                </>
            )}

          </div>
        </aside>
      </div>
        {isModalOpen && clickedCoords && <HostGameModal coords={clickedCoords} onClose={() => setIsModalOpen(false)} onGameHosted={fetchGames} />}
    </div>
  );
};

export default Dashboard;