import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🚀 SPRINT 6: Custom 5-Star Rating Component
const RateHost = ({ game }) => {
  const [hover, setHover] = useState(0);

  const submitRating = async (score) => {
    try {
      await axios.post(
        `http://localhost:5000/games/rate/${game.game_id}`,
        { rating: score, hostId: game.host_id },
        { headers: { token: localStorage.getItem("token") } }
      );
      alert("✅ Thanks for rating the host!");
    } catch (err) {
      alert(err.response?.data || "Error rating host");
    }
  };

  return (
    <div style={{ marginTop: "10px", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #eee" }}>
      <small style={{ fontWeight: "bold", color: "#555", display: "block", marginBottom: "5px" }}>
        Game Finished! Rate the Host:
      </small>
      <div style={{ display: "flex", gap: "5px", cursor: "pointer", fontSize: "1.5em" }}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <span
              key={starValue}
              onClick={() => submitRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              style={{ color: starValue <= hover ? "#f1c40f" : "#ccc", transition: "color 0.2s" }}
            >
              ★
            </span>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN PROFILE COMPONENT ---
const Profile = () => {
  const [hostedGames, setHostedGames] = useState([]);
  const [joinedGames, setJoinedGames] = useState([]);
  const [user, setUser] = useState({ username: "Loading..." });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const userRes = await axios.get("http://localhost:5000/auth/verify", { headers: { token } });
      setUser(userRes.data);

      const gameRes = await axios.get("http://localhost:5000/games/mygames", { headers: { token } });
      
      setHostedGames(gameRes.data.hosted);
      setJoinedGames(gameRes.data.joined);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    document.title = "My Profile - CourtLink";
    fetchData();
  }, [navigate]);

  const handleDelete = async (gameId) => {
    if (!window.confirm("Are you sure you want to cancel this game?")) return;
    try {
        await axios.delete(`http://localhost:5000/games/delete/${gameId}`, {
            headers: { token: localStorage.getItem("token") }
        });
        fetchData(); 
    } catch (err) {
        alert(err.response?.data || "Error deleting game");
    }
  };

  const handleLeave = async (gameId) => {
    if (!window.confirm("Are you sure you want to leave this game?")) return;
    try {
        await axios.delete(`http://localhost:5000/games/leave/${gameId}`, {
            headers: { token: localStorage.getItem("token") }
        });
        fetchData(); 
    } catch (err) {
        alert("Error leaving game");
    }
  };

  // Helper to check if a game is in the past
  const isPastGame = (dateString) => {
      return new Date(dateString) < new Date();
  };

  return (
    <div className="container" style={{maxWidth: "800px", marginTop: "20px"}}>
      <button onClick={() => navigate("/dashboard")} className="btn" style={{marginBottom: "20px"}}>← Back to Map</button>
      
      <div className="card" style={{textAlign: "center", marginBottom: "30px"}}>
        <h1 style={{color: "#ff5722", margin: "10px 0"}}>👤 {user.username}'s Profile</h1>
        <p style={{color: "#666"}}>Manage your basketball schedule here.</p>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
        
        {/* LEFT COLUMN: HOSTED GAMES */}
        <div className="card">
            <h3 style={{color: "#2d3436", borderBottom: "2px solid #ff5722", paddingBottom: "10px"}}>📢 Hosted by Me</h3>
            {hostedGames?.length === 0 ? <p style={{color:"#888"}}>You haven't hosted any games.</p> : (
                <ul style={{listStyle: "none", padding: 0}}>
                    {hostedGames.map(g => (
                        <li key={g.game_id} style={{background: "#f9f9f9", padding: "10px", margin: "10px 0", borderRadius: "8px"}}>
                            <strong>{g.court_name}</strong><br/>
                            <small style={{color: "#888"}}>{new Date(g.date_time).toLocaleString()}</small><br/>
                            {/* Hosts can only delete games that haven't happened yet */}
                            {!isPastGame(g.date_time) ? (
                                <button onClick={() => handleDelete(g.game_id)} className="btn btn-danger" style={{marginTop: "10px", padding: "5px 10px", fontSize: "0.8em"}}>
                                    Delete Game
                                </button>
                            ) : (
                                <span style={{display: "block", marginTop: "10px", color: "#27ae60", fontWeight: "bold", fontSize: "0.9em"}}>
                                    ✅ Game Completed
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* RIGHT COLUMN: JOINED GAMES */}
        <div className="card">
            <h3 style={{color: "#0984e3", borderBottom: "2px solid #0984e3", paddingBottom: "10px"}}>🏀 Games I Joined</h3>
            {joinedGames?.length === 0 ? <p style={{color:"#888"}}>You haven't joined any games.</p> : (
                <ul style={{listStyle: "none", padding: 0}}>
                    {joinedGames.map(g => (
                        <li key={g.game_id} style={{background: "#f9f9f9", padding: "10px", margin: "10px 0", borderRadius: "8px"}}>
                            <strong>{g.court_name}</strong><br/>
                            <small style={{color: "#888"}}>{new Date(g.date_time).toLocaleString()}</small><br/>
                            
                            {/* 🚀 SPRINT 6 LOGIC: Show Stars if past, show Leave button if future */}
                            {isPastGame(g.date_time) ? (
                                <RateHost game={g} />
                            ) : (
                                <button onClick={() => handleLeave(g.game_id)} className="btn" style={{marginTop: "10px", padding: "5px 10px", fontSize: "0.8em", background: "#b2bec3"}}>
                                    Leave Game
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>

      </div>
    </div>
  );
};

export default Profile;