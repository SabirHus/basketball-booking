import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";
import GameLobby from "../components/GameLobby"; 
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "../components/SkeletonCard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);
  const [hostRating, setHostRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Filter States
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify`, { headers: { token } });
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/games/all`);
      setGames(res.data);
      if (selectedGame) {
        const updated = res.data.find(g => g.game_id === selectedGame.game_id);
        if (updated) setSelectedGame(updated);
      }
    } catch (err) { 
      console.error(err); 
    } finally {
      setTimeout(() => setIsLoading(false), 500); 
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/");
    fetchUser(); 
    fetchGames(); 
  }, [navigate]);

  useEffect(() => {
    const fetchRating = async () => {
      if (selectedGame) {
        try {
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
        if (parseFloat(selectedGame.price) > 0) {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/games/checkout/${selectedGame.game_id}`, {}, { headers: { token } });
            window.location.href = res.data.url;
        } else {
            await axios.post(`${import.meta.env.VITE_API_URL}/games/join/${selectedGame.game_id}`, {}, { headers: { token } });
            alert("✅ Joined successfully for free!");
            fetchGames();
        }
    } catch (err) {
        alert(err.response?.data || "Error joining game");
    }
  };

  const handleDeleteGame = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this game? This cannot be undone.");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${import.meta.env.VITE_API_URL}/games/delete/${selectedGame.game_id}`, {
            headers: { token }
        });
        
        alert("🗑️ Game deleted successfully.");
        setSelectedGame(null); 
        fetchGames(); 
    } catch (err) {
        alert(err.response?.data || "Error deleting game");
    }
  };

  // 🚀 UPGRADED: "That day and forward" Filtering Logic
  const filteredGames = games.filter((game) => {
    const matchSkill = filterSkill === "All" || game.skill_level === filterSkill;
    const isFree = parseFloat(game.price) === 0;
    const matchPrice = filterPrice === "All" || (filterPrice === "Free" && isFree) || (filterPrice === "Paid" && !isFree);
    
    // Extract local year, month, day, hour, min safely to avoid Timezone bugs
    const gameDateObj = new Date(game.date_time);
    const year = gameDateObj.getFullYear();
    const month = String(gameDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(gameDateObj.getDate()).padStart(2, '0');
    const gameDateStr = `${year}-${month}-${day}`;
    
    const hours = String(gameDateObj.getHours()).padStart(2, '0');
    const mins = String(gameDateObj.getMinutes()).padStart(2, '0');
    const gameTimeStr = `${hours}:${mins}`;

    let matchDate = true;
    let matchTime = true;

    // Filter 1: If Date is selected, game must be ON OR AFTER that date
    if (filterDate) {
      matchDate = gameDateStr >= filterDate;
    }

    // Filter 2: If Time is selected
    if (filterTime) {
      if (filterDate) {
         // If they picked a specific starting date, only enforce the time on that first day.
         // Any game on the following days automatically passes the time check!
         if (gameDateStr === filterDate) {
           matchTime = gameTimeStr >= filterTime;
         } else if (gameDateStr > filterDate) {
           matchTime = true;
         }
      } else {
         // If no date is picked, just show games from this time onward on whatever day they land.
         matchTime = gameTimeStr >= filterTime;
      }
    }

    return matchSkill && matchPrice && matchDate && matchTime;
  });

  return (
    <div className="container">
      {/* HEADER */}
      <header className="flex-between" style={{ marginBottom: "20px", padding: "10px 0", borderBottom: "1px solid var(--border-color, #eaeaea)" }}>
        <h1 style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>🏀 CourtLink</h1>
        
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button 
            className="dark-mode-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <span style={{ fontWeight: "600", cursor: "pointer", textDecoration: "underline", color: "var(--text-light)" }} onClick={() => navigate("/profile")}>
            Hello, {user ? user.username : "Loading..."}
          </span>
          <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="btn btn-danger">Log Out</button>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="filter-bar" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}>
        <strong style={{color: "var(--text-main)"}}>Filters:</strong>
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
        <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)} 
            className="form-input" 
            style={{width: "auto"}}
        />
        <input 
            type="time" 
            value={filterTime} 
            onChange={(e) => setFilterTime(e.target.value)} 
            className="form-input" 
            style={{width: "auto"}}
        />
        {(filterSkill !== "All" || filterPrice !== "All" || filterDate || filterTime) && (
            <button 
              onClick={() => { setFilterSkill("All"); setFilterPrice("All"); setFilterDate(""); setFilterTime(""); }} 
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear Filters
            </button>
        )}
      </div>
      
      <div className="dashboard-grid">
        <div className="map-wrapper" style={{position: "relative"}}>
          <CourtMap 
            games={filteredGames} 
            onMapClick={(data) => {
               if (data.game) { 
                 setSelectedGame(data.game); 
                 setClickedCoords(null); 
               } else { 
                 setClickedCoords(data); 
                 setSelectedGame(null); 
                 setIsModalOpen(true); 
               }
            }} 
          />
        </div>

        <aside>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <SkeletonCard />
              </motion.div>
            ) : selectedGame ? (
              <motion.div 
                key={selectedGame.game_id} 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="card"
              >
                <button onClick={() => setSelectedGame(null)} style={{background:"none", border:"none", cursor:"pointer", color:"var(--text-light)", marginBottom:"10px", fontWeight: "bold"}}>← Back to Map</button>
                <h2 className="game-title">{selectedGame.court_name}</h2>
                
                {/* 🚀 UPGRADED: Price on left, Min/Max Players Box on the Right */}
                <div className="flex-between" style={{ alignItems: "flex-start", marginBottom: "15px" }}>
                  <p className={parseFloat(selectedGame.price) > 0 ? "price-badge-paid" : "price-badge-free"} style={{ margin: 0 }}>
                      {parseFloat(selectedGame.price) > 0 ? `£${parseFloat(selectedGame.price).toFixed(2)}` : "FREE GAME"}
                  </p>
                  
                  <div style={{ textAlign: "right", background: "var(--bg-color)", padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
                    <span style={{ display: "block", fontSize: "1.1em", fontWeight: "bold", color: "var(--text-main)" }}>
                      👥 {selectedGame.player_count || 0} / {selectedGame.max_players}
                    </span>
                    <span style={{ fontSize: "0.85em", color: "var(--text-light)" }}>
                      Min required: {selectedGame.min_players || 4}
                    </span>
                  </div>
                </div>
                
                <div className="host-info-box">
                    <strong>Host:</strong> {selectedGame.username}
                    {hostRating && hostRating.total_ratings > 0 ? (
                        <span className="rating-badge">⭐ {hostRating.avg_rating} <span style={{opacity: 0.7}}>({hostRating.total_ratings})</span></span>
                    ) : (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", marginLeft: "auto" }}>(No reviews)</span>
                    )}
                </div>
                
                <p style={{ color: "var(--text-light)", fontStyle: "italic", marginBottom: "15px" }}>📍 {selectedGame.address}</p>
                <p><strong>Level:</strong> {selectedGame.skill_level}</p>
                <p><strong>Time:</strong> {new Date(selectedGame.date_time).toLocaleString()}</p>

                {/* ADMIN / HOST CONTROLS */}
                {user && (user.is_admin || String(user.id || user.user_id) === String(selectedGame.host_id)) && (
                    <div style={{ marginTop: "10px", marginBottom: "20px", padding: "15px", background: "var(--bg-color)", borderRadius: "var(--radius)", border: "1px dashed #ff7675" }}>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "#d63031" }}>
                            🛡️ Host / Admin Controls
                        </p>
                        <button 
                            onClick={handleDeleteGame} 
                            className="btn btn-danger" 
                            style={{ width: "100%" }}
                        >
                            Delete Game 🗑️
                        </button>
                    </div>
                )}

                {/* The "Game is ON" Banner */}
                {selectedGame.min_players && parseInt(selectedGame.player_count) >= parseInt(selectedGame.min_players) && (
                    <div style={{ 
                        background: "#d4edda", 
                        border: "1px solid #c3e6cb", 
                        color: "#155724", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        marginBottom: "20px", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                    }}>
                        <span style={{ fontSize: "1.5rem" }}>✅</span>
                        <div>
                            <strong style={{ display: "block", fontSize: "1.1em" }}>Game is ON!</strong>
                            <span style={{ fontSize: "0.9em" }}>The minimum number of players has been reached.</span>
                        </div>
                    </div>
                )}

                <GameLobby 
                  game={selectedGame} 
                  currentUser={user} 
                  onJoin={handleJoinGame} 
                />
              </motion.div>
            ) : (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="instructions-card"
              >
                  <h3 style={{fontSize: "2rem", margin: "0 0 20px 0"}}>📅 How to Book</h3>
                  <ul className="instructions-list">
                    <li><b>1. Filter</b> to find free or paid games.</li>
                    <li><b>2. Click a Pin</b> to see capacity.</li>
                    <li><b>3. Join</b> before it fills up!</li>
                  </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
      
      {/* HOST GAME MODAL */}
      {isModalOpen && clickedCoords && (
        <HostGameModal 
          coords={clickedCoords} 
          onClose={() => setIsModalOpen(false)} 
          onGameHosted={() => {
            fetchGames();
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
};

export default Dashboard;