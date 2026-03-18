import { useState, useEffect } from "react";
import axios from "axios";

const GameLobby = ({ game, currentUser, onJoin }) => {
    const [players, setPlayers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const fetchLobbyData = async () => {
        try {
            const token = localStorage.getItem("token");
            const playerRes = await axios.get(`${import.meta.env.VITE_API_URL}/games/players/${game.game_id}`, { headers: { token } });
            setPlayers(playerRes.data);

            const msgRes = await axios.get(`${import.meta.env.VITE_API_URL}/games/messages/${game.game_id}`, { headers: { token } });
            setMessages(msgRes.data);
        } catch (err) {
            console.error("Error fetching lobby data:", err);
        }
    };

    useEffect(() => {
        fetchLobbyData();
        const interval = setInterval(fetchLobbyData, 2000); 
        return () => clearInterval(interval);
    }, [game.game_id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/games/messages/${game.game_id}`, { message: newMessage }, { headers: { token } });
            setNewMessage("");
            fetchLobbyData();
        } catch (err) {
            console.error(err);
        }
    };

    const currentUserId = String(currentUser?.id || currentUser?.user_id).toLowerCase();
    const currentUsername = currentUser?.username;

    const hasJoined = players.some(p => 
        String(p.user_id).toLowerCase() === currentUserId || 
        p.username === currentUsername
    );
    
    // Check if the game is full
    const isFull = parseInt(game.player_count) >= game.max_players;

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
                                {/* Avatar */}
                                <img
                                    src={p.profile_pic || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                    alt={p.username}
                                    style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }}
                                />
                                
                                {/* Info */}
                                <div style={{ flex: 1, textAlign: "left" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                                            {p.username} {isMe && <span style={{color: "var(--primary)", fontSize: "12px"}}>(You)</span>}
                                        </strong>
                                        <span style={{ fontSize: "11px", background: "var(--primary)", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" }}>
                                            {p.position || "Not Specified"}
                                        </span>
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

            {/* --- 2. THE JOIN BUTTON --- */}
            {!hasJoined && (
                <button 
                    onClick={onJoin} 
                    disabled={isFull}
                    className="btn btn-primary" 
                    style={{width: "100%", marginTop: "15px", marginBottom: "20px", background: isFull ? "#ccc" : ""}}
                >
                    {isFull 
                        ? "Game Full 🚫" 
                        : parseFloat(game.price) > 0 ? `Pay £${parseFloat(game.price).toFixed(2)} to Join 💳` : "Join for Free 🏀"}
                </button>
            )}

            {/* --- 3. THE CHAT SECTION --- */}
            {hasJoined ? (
                <div className="chat-container" style={{ marginTop: "20px" }}>
                    <div className="chat-header">💬 Locker Room Chat</div>
                    
                    <div className="chat-messages">
                        {messages.length > 0 ? messages.map(msg => {
                            const isMe = String(msg.user_id).toLowerCase() === currentUserId || msg.username === currentUsername;
                            return (
                                <div key={msg.message_id || Math.random()} className={`chat-wrapper ${isMe ? "is-me" : "is-other"}`}>
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