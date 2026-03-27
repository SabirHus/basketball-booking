import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CourtMap from "../components/CourtMap";
import HostGameModal from "../components/HostGameModal";
import GameLobby from "../components/GameLobby"; 
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCard from "../components/SkeletonCard";
// 🚀 FEATURE: Imported the new EditGameModal component
import EditGameModal from "../components/EditGameModal";

const Dashboard = () => {
  // Global application state
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]); 
  const [selectedGame, setSelectedGame] = useState(null);
  const [hostRating, setHostRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and map interaction state
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 🚀 FEATURE: Added state to control the Edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState(null);

  // Read theme preference from local storage for persistence
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // Filter UI state
  const [filterSkill, setFilterSkill] = useState("All");
  const [filterPrice, setFilterPrice] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterMyGames, setFilterMyGames] = useState(false);

  const navigate = useNavigate();

  // Apply dark mode class to the body tag
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Authenticate the user token against the backend before rendering dashboard features
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      // 🚀 FIX: Added a quick check to prevent unnecessary requests if no token exists
      if (!token) return navigate("/");
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`, { headers: { token } });
      setUser(res.data);
    } catch (err) {
      // Only log out the user if we receive an explicit unauthorised response, otherwise keep them logged in and show an error message
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem("token");
          navigate("/");
      } else {
          console.error("Network or server error while fetching user. Keeping session alive.", err);
      }
    }
  };

  // Retrieve the master list of all active games from the database
  const fetchGames = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/games/all`);
      setGames(res.data);
      
      // If a user currently has a game selected we need to refresh its specific data too
      if (selectedGame) {
        const updated = res.data.find(g => g.game_id === selectedGame.game_id);
        if (updated) setSelectedGame(updated);
      }
    } catch (err) { 
      console.error("Failed to fetch games roster:", err); 
    } finally {
      // Delay to allow smooth skeleton loading animations
      setTimeout(() => setIsLoading(false), 500); 
    }
  };

  // Load effect
  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/");
    fetchUser(); 
    fetchGames(); 
  }, [navigate]);

  // Fetch host reputation data whenever the user selects a new game pin
  useEffect(() => {
    const fetchRating = async () => {
      if (!selectedGame) return;
      
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/games/rating/${selectedGame.host_id}`);
        setHostRating(res.data);
      } catch (err) {
        console.error("Failed to fetch host rating", err);
        setHostRating(null);
      }
    };
    
    fetchRating();
  }, [selectedGame]);

  // Handle the logic for joining both free and paid games
  const handleJoinGame = async () => {
    if (!selectedGame) return;
    
    const isFull = parseInt(selectedGame.player_count, 10) >= parseInt(selectedGame.max_players, 10);
    if (isFull) return alert("Sorry, this game is full!");

    try {
        const token = localStorage.getItem("token");
        const price = parseFloat(selectedGame.price);
        
        if (price > 0) {
            // Stripe checkout
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/games/checkout/${selectedGame.game_id}`, {}, { headers: { token } });
            window.location.href = res.data.url;
        } else {
            // Add user for free games
            await axios.post(`${import.meta.env.VITE_API_URL}/games/join/${selectedGame.game_id}`, {}, { headers: { token } });
            alert("✅ Joined successfully for free!");
            fetchGames();
        }
    } catch (err) {
        alert(err.response?.data || "Error joining game");
    }
  };

  // Allow main admin or original host to securely cancel and delete a game
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

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchSkill = filterSkill === "All" || game.skill_level === filterSkill;
      
      const isFree = parseFloat(game.price) === 0;
      const matchPrice = filterPrice === "All" || (filterPrice === "Free" && isFree) || (filterPrice === "Paid" && !isFree);
      
      // Extract local date segments safely to avoid cross-browser timezone bugs
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

      if (filterDate) {
        matchDate = gameDateStr >= filterDate;
      }

      // Check if the game occurs after the selected time
      if (filterTime) {
        if (filterDate) {
           if (gameDateStr === filterDate) {
             matchTime = gameTimeStr >= filterTime;
           } else if (gameDateStr > filterDate) {
             matchTime = true;
           }
        } else {
           matchTime = gameTimeStr >= filterTime;
        }
      }

      const currentUserId = user?.user_id || user?.id;
      const isMyGame = !filterMyGames || String(game.host_id) === String(currentUserId);

      return matchSkill && matchPrice && matchDate && matchTime && isMyGame;
    });
  }, [games, filterSkill, filterPrice, filterDate, filterTime, filterMyGames, user]);

  return (
    <div className="container">
      {/* Platform Header Navigation */}
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

      {/* Search and Filter Controls */}
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

        <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", color: "var(--text-main)", fontWeight: "bold" }}>
          <input 
            type="checkbox" 
            checked={filterMyGames} 
            onChange={(e) => setFilterMyGames(e.target.checked)} 
          />
          My Games Only
        </label>
        
        {/* Render a reset button if any filters are currently active */}
        {(filterSkill !== "All" || filterPrice !== "All" || filterDate || filterTime || filterMyGames) && (
            <button 
              onClick={() => { setFilterSkill("All"); setFilterPrice("All"); setFilterDate(""); setFilterTime(""); setFilterMyGames(false); }} 
              style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", textDecoration: "underline" }}
            >
              Clear Filters
            </button>
        )}
      </div>
      
      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        <div className="map-wrapper" style={{position: "relative"}}>
          <CourtMap 
            games={filteredGames} 
            onMapClick={(data) => {
               if (data.game) { 
                 setSelectedGame(data.game); 
                 setClickedCoords(null); 
               } else { 
                 // Clicking empty map space passes coordinates up to trigger the hosting modal
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

                {/* Secure administrative controls for the game owner and platform admins */}
                {user && (user.is_admin || String(user.id || user.user_id) === String(selectedGame.host_id)) && (
                    <div style={{ marginTop: "10px", marginBottom: "20px", padding: "15px", background: "var(--bg-color)", borderRadius: "var(--radius)", border: "1px dashed #ff7675" }}>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "#d63031" }}>
                            🛡️ Host / Admin Controls
                        </p>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {/* 🚀 FEATURE: Added the Edit Game button to trigger the modal */}
                            <button 
                                onClick={() => setIsEditModalOpen(true)} 
                                className="btn btn-primary" 
                                style={{ flex: 1 }}
                            >
                                Edit Game ✏️
                            </button>
                            <button 
                                onClick={handleDeleteGame} 
                                className="btn btn-danger" 
                                style={{ flex: 1 }}
                            >
                                Delete Game 🗑️
                            </button>
                        </div>
                    </div>
                )}

                {/* Conditional UI rendering indicating the game has reached capacity */}
                {selectedGame.min_players && parseInt(selectedGame.player_count, 10) >= parseInt(selectedGame.min_players, 10) && (
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
      
      {/* Conditionally render the hosting modal over the viewport */}
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

      {/* Conditionally render the Edit Game modal over the viewport */}
      {isEditModalOpen && selectedGame && (
        <EditGameModal 
          game={selectedGame}
          onClose={() => setIsEditModalOpen(false)}
          onGameUpdated={() => {
            fetchGames(); // Refresh the map and data
            setIsEditModalOpen(false); // Close the modal
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;