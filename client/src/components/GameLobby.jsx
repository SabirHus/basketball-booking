import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const GameLobby = ({ game, currentUser, onJoin }) => {
    // Start up state for the lobby roster and real-time chat
    const [players, setPlayers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false); 

    // Function to fetch current players and messages in the lobby
    const fetchLobbyData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const [playerRes, msgRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/games/players/${game.game_id}`, { headers: { token } }),
                axios.get(`${import.meta.env.VITE_API_URL}/games/messages/${game.game_id}`, { headers: { token } })
            ]);

            setPlayers(playerRes.data);
            setMessages(msgRes.data);
        } catch (err) {
            console.error("Error fetching lobby data:", err);
        }
    }, [game.game_id]);

    // Load lobby data on component mount and set an interval to refresh
    useEffect(() => {
        fetchLobbyData();
        
        // Refresh data every 5 seconds
        const interval = setInterval(fetchLobbyData, 5000); 
        
        // Clean up the interval on unmount
        return () => clearInterval(interval);
    }, [fetchLobbyData]);

    // Send a new chat message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        // Stops blank messsages being sent
        if (!newMessage.trim()) return;
        
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/games/messages/${game.game_id}`, { message: newMessage }, { headers: { token } });
            
            // Clear the input and display new message
            setNewMessage("");
            fetchLobbyData();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    // Extract user details to check their membership status
    const currentUserId = currentUser ? String(currentUser.id || currentUser.user_id).toLowerCase() : "";
    const currentUsername = currentUser?.username;

    // Check if the current user exists
    const hasJoined = players.some(p => 
        String(p.user_id).toLowerCase() === currentUserId || 
        p.username === currentUsername
    );
    
    // Determine if the game has reached its max
    const isFull = parseInt(game.player_count, 10) >= parseInt(game.max_players, 10);

    return (
        <div style={{ marginTop: "20px" }}>
            
            {/* --- 1. PLAYERS ROSTER SECTION --- */}
            <div className="lobby-players-card">
                <h4 className="lobby-header" style={{ borderBottom: "2px solid var(--primary)", paddingBottom: "10px", marginBottom: "15px" }}>
                    <span>📋 Player Roster</span>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: players.length >= game.max_players ? "#e74c3c" : "#27ae60" }}>
                        {players.length} / {game.max_players}
                    </span>
                </h4>
                
                <div className="player-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {players.length > 0 ? players.map(p => {
                        const isMe = String(p.user_id).toLowerCase() === currentUserId || p.username === currentUsername;
                        
                        return (
                            <div key={p.user_id} style={{
                                display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-color)",
                                padding: "10px", borderRadius: "8px", border: `1px solid ${isMe ? "var(--primary)" : "var(--border-color)"}`
                            }}>
                                {/* Player Avatar */}
                                <img
                                    src={p.profile_pic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                    alt={p.username}
                                    style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }}
                                />
                                
                                {/* Player Information */}
                                <div style={{ flex: 1, textAlign: "left" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                                            {p.username} {isMe && <span style={{color: "var(--primary)", fontSize: "12px"}}>(You)</span>}
                                        </strong>
                                        
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "11px", background: "var(--primary)", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                                                {p.position || "Not Specified"}
                                            </span>

                                            {/* Kick Player Button */}
                                            {currentUser && String(game.host_id) === currentUserId && !isMe && (
                                                <button 
                                                    onClick={async () => {
                                                        if(window.confirm(`Are you sure you want to kick ${p.username}?`)) {
                                                            try {
                                                                const token = localStorage.getItem("token");
                                                                await axios.delete(`${import.meta.env.VITE_API_URL}/games/kick/${game.game_id}/${p.user_id}`, { headers: { token }});
                                                                fetchLobbyData(); // Instantly refresh the roster UI
                                                            } catch (err) {
                                                                console.error("Failed to kick player", err);
                                                            }
                                                        }
                                                    }}
                                                    style={{ background: "#ff7675", color: "white", border: "none", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" }}
                                                >
                                                    Kick
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-light)", fontStyle: "italic" }}>
                                        "{p.bio || "I am ready to hoop!"}"
                                    </p>
                                </div>
                            </div>
                        )
                    }) : <span style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", textAlign: "center", display: "block" }}>No players yet...</span>}
                </div>
            </div>

            {/* --- 2. JOIN GAME BUTTON --- */}
            {!hasJoined && (
                <div style={{ marginTop: "15px", marginBottom: "20px", padding: "15px", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", color: "var(--text-main)", marginBottom: "15px" }}>
                        <input 
                            type="checkbox" 
                            checked={agreedToTerms} 
                            onChange={(e) => setAgreedToTerms(e.target.checked)} 
                            style={{ width: "18px", height: "18px" }}
                        />
                        <span>
                            I agree to the <Link to="/terms" target="_blank" style={{ color: "var(--primary)" }}>Terms & Conditions</Link> and <Link to="/privacy" target="_blank" style={{ color: "var(--primary)" }}>Privacy Policy</Link>.
                        </span>
                    </label>

                    <button 
                        onClick={onJoin} 
                        disabled={isFull || !agreedToTerms}
                        className="btn btn-primary" 
                        style={{ width: "100%", background: (isFull || !agreedToTerms) ? "#ccc" : "", cursor: (isFull || !agreedToTerms) ? "not-allowed" : "pointer" }}
                    >
                        {isFull 
                            ? "Game Full 🚫" 
                            : parseFloat(game.price) > 0 ? `Pay £${parseFloat(game.price).toFixed(2)} to Join 💳` : "Join for Free 🏀"}
                    </button>
                    {!agreedToTerms && !isFull && <small style={{ color: "#d63031", display: "block", marginTop: "8px", textAlign: "center" }}>You must agree to the terms to join.</small>}
                </div>
            )}

            {/* --- 3. SECURE LOCKER ROOM CHAT --- */}
            {hasJoined ? (
                <div className="chat-container" style={{ marginTop: "20px" }}>
                    <div className="chat-header">💬 Locker Room Chat</div>
                    
                    <div className="chat-messages">
                        {messages.length > 0 ? messages.map((msg, index) => {
                            const isMe = String(msg.user_id).toLowerCase() === currentUserId || msg.username === currentUsername;
                            return (
                                <div key={msg.message_id || index} className={`chat-wrapper ${isMe ? "is-me" : "is-other"}`}>
                                    <span className="chat-sender">{msg.username}</span>
                                    <div className={`chat-bubble ${isMe ? "is-me" : "is-other"}`}>
                                        {msg.message}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", marginTop: "50px" }}>No messages yet. Say hi! 👋</div>
                        )}
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-form">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="chat-input"
                        />
                        <button type="submit" disabled={!newMessage.trim()} className="chat-send-btn">
                            Send
                        </button>
                    </form>
                </div>
            ) : (
                <div className="chat-locked" style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
                    <div style={{ fontSize: "15px", fontWeight: "bold" }}>Locker Room Locked</div>
                    <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.8 }}>Join the game to chat with the players!</div>
                </div>
            )}
        </div>
    );
};

export default GameLobby;