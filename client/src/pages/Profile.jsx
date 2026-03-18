import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// The standard blank avatar URL
const DEFAULT_PIC = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const RateHost = ({ game }) => {
  const [hover, setHover] = useState(0);

  const submitRating = async (score) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/games/rate/${game.game_id}`,
        { rating: score, hostId: game.host_id },
        { headers: { token: localStorage.getItem("token") } }
      );
      alert("✅ Thanks for rating the host!");
    } catch (err) {
      alert(err.response?.data || "Error rating host");
    }
  };

  return (
    <div style={{ marginTop: "10px", background: "var(--bg-color)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
      <small style={{ fontWeight: "bold", color: "var(--text-light)", display: "block", marginBottom: "5px" }}>
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

const Profile = () => {
  const [hostedGames, setHostedGames] = useState([]);
  const [joinedGames, setJoinedGames] = useState([]);
  const [user, setUser] = useState({ username: "Loading..." });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [position, setPosition] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removePic, setRemovePic] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      // 1. Fetch Profile Data
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`, { headers: { token } });
      setUser(userRes.data);
      setBio(userRes.data.bio || "");
      setPosition(userRes.data.position || "Not Specified");
      setPreviewUrl(userRes.data.profile_pic || DEFAULT_PIC);

      // 2. 🚀 THE FIX: Fetch the user's games! (I accidentally deleted this earlier)
      const gameRes = await axios.get(`${import.meta.env.VITE_API_URL}/games/mygames`, { headers: { token } });
      setHostedGames(gameRes.data.hosted);
      setJoinedGames(gameRes.data.joined);

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) navigate("/");
    }
  };

  useEffect(() => {
    document.title = "My Profile - CourtLink";
    fetchData();
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setRemovePic(false); 
    }
  };

  const handleRemovePicture = () => {
    setRemovePic(true);
    setSelectedFile(null);
    setPreviewUrl(DEFAULT_PIC);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("position", position);
      
      if (removePic) {
        formData.append("existing_pic", DEFAULT_PIC);
      } else {
        formData.append("existing_pic", user.profile_pic); 
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/profile`, formData, {
        headers: { token, "Content-Type": "multipart/form-data" }
      });

      setUser(res.data);
      setIsEditing(false);
      setRemovePic(false);
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm("Are you sure you want to cancel this game?")) return;
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/games/delete/${gameId}`, {
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/games/leave/${gameId}`, {
            headers: { token: localStorage.getItem("token") }
        });
        fetchData(); 
    } catch (err) {
        alert("Error leaving game");
    }
  };

  const isPastGame = (dateString) => new Date(dateString) < new Date();

  return (
    <div className="container" style={{maxWidth: "900px", marginTop: "20px"}}>
      <button onClick={() => navigate("/dashboard")} className="btn" style={{marginBottom: "20px", background: "var(--card-bg)", color: "var(--text-main)", border: "1px solid var(--border-color)"}}>
        ← Back to Dashboard
      </button>
      
      <div className="card" style={{ textAlign: "center", marginBottom: "30px", padding: "30px" }}>
        
        <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 15px auto" }}>
          <img 
            src={previewUrl} 
            alt="Profile" 
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary)", boxShadow: "var(--shadow)" }} 
          />
          {isEditing && (
            <>
              <label style={{
                  position: "absolute", bottom: "0", right: "0", background: "var(--primary)", color: "white", 
                  padding: "8px", borderRadius: "50%", cursor: "pointer", fontSize: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                📷 <input type="file" accept="image/png, image/jpeg" style={{ display: "none" }} onChange={handleFileChange} />
              </label>

              {(previewUrl !== DEFAULT_PIC || user.profile_pic !== DEFAULT_PIC) && (
                <button 
                  type="button"
                  onClick={handleRemovePicture}
                  style={{
                    position: "absolute", bottom: "0", left: "0", background: "#d63031", color: "white", border: "none",
                    padding: "8px", borderRadius: "50%", cursor: "pointer", fontSize: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                  title="Remove Picture"
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>

        <h1 style={{color: "var(--primary)", margin: "0 0 5px 0"}}>👤 {user.username}</h1>
        {user.is_admin && (
          <span style={{ background: "#d63031", color: "white", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", display: "inline-block", marginBottom: "10px" }}>
            ADMIN
          </span>
        )}

        {!isEditing ? (
            <div style={{ background: "var(--bg-color)", padding: "15px", borderRadius: "12px", maxWidth: "400px", margin: "10px auto" }}>
              <p style={{ margin: "5px 0" }}><strong>🏀 Position:</strong> {user.position}</p>
              <p style={{ margin: "5px 0" }}><strong>📝 Bio:</strong> {user.bio}</p>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ width: "100%", marginTop: "15px", padding: "8px" }}>
                Edit Profile
              </button>
            </div>
        ) : (
            <form onSubmit={handleSaveProfile} style={{ background: "var(--bg-color)", padding: "20px", borderRadius: "12px", maxWidth: "400px", margin: "10px auto", textAlign: "left" }}>
              <div className="form-group">
                <label style={{ fontWeight: "bold" }}>Position</label>
                <select className="form-input" value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="Not Specified">Not Specified</option>
                  <option value="Point Guard">Point Guard</option>
                  <option value="Shooting Guard">Shooting Guard</option>
                  <option value="Small Forward">Small Forward</option>
                  <option value="Power Forward">Power Forward</option>
                  <option value="Center">Center</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: "bold" }}>Bio</label>
                <textarea 
                  className="form-input" rows="2" value={bio} 
                  onChange={(e) => setBio(e.target.value)} placeholder="Tell people about your play style..."
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-danger" style={{ flex: 1, background: "#aaa" }} onClick={() => { 
                  setIsEditing(false); 
                  setRemovePic(false);
                  setPreviewUrl(user.profile_pic || DEFAULT_PIC); 
                  setSelectedFile(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
        )}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px"}}>
        <div className="card">
            <h3 style={{color: "var(--text-main)", borderBottom: "2px solid var(--primary)", paddingBottom: "10px"}}>📢 Hosted by Me</h3>
            {hostedGames?.length === 0 ? <p style={{color:"var(--text-light)"}}>You haven't hosted any games.</p> : (
                <ul style={{listStyle: "none", padding: 0}}>
                    {hostedGames.map(g => (
                        <li key={g.game_id} style={{background: "var(--bg-color)", padding: "10px", margin: "10px 0", borderRadius: "8px"}}>
                            <strong style={{color: "var(--text-main)"}}>{g.court_name}</strong><br/>
                            <small style={{color: "var(--text-light)"}}>{new Date(g.date_time).toLocaleString()}</small><br/>
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

        <div className="card">
            <h3 style={{color: "#0984e3", borderBottom: "2px solid #0984e3", paddingBottom: "10px"}}>🏀 Games I Joined</h3>
            {joinedGames?.length === 0 ? <p style={{color:"var(--text-light)"}}>You haven't joined any games.</p> : (
                <ul style={{listStyle: "none", padding: 0}}>
                    {joinedGames.map(g => (
                        <li key={g.game_id} style={{background: "var(--bg-color)", padding: "10px", margin: "10px 0", borderRadius: "8px"}}>
                            <strong style={{color: "var(--text-main)"}}>{g.court_name}</strong><br/>
                            <small style={{color: "var(--text-light)"}}>{new Date(g.date_time).toLocaleString()}</small><br/>
                            
                            {isPastGame(g.date_time) ? (
                                <RateHost game={g} />
                            ) : (
                                <button onClick={() => handleLeave(g.game_id)} className="btn" style={{marginTop: "10px", padding: "5px 10px", fontSize: "0.8em", background: "var(--border-color)", color: "var(--text-main)"}}>
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