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

    // 🚀 THE FIX: Compare by ID OR Username (in case the auth route didn't send the ID!)
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
            
            {/* --- 1. PLAYERS SECTION --- */}
            <div className="lobby-players-card">
                <h4 className="lobby-header">
                    <span>👥 Players</span>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: players.length >= game.max_players ? "#e74c3c" : "#27ae60" }}>
                        {players.length} / {game.max_players}
                    </span>
                </h4>
                
                <div className="player-list">
                    {players.length > 0 ? players.map(p => {
                        // 🚀 THE FIX: Also use the bulletproof check here for the "(You)" tag!
                        const isMe = String(p.user_id).toLowerCase() === currentUserId || p.username === currentUsername;
                        
                        return (
                            <div key={p.user_id} className={`player-pill ${isMe ? "is-me" : ""}`}>
                                <div className={`player-avatar ${isMe ? "is-me" : ""}`}>
                                    {p.username.charAt(0).toUpperCase()}
                                </div>
                                {p.username} {isMe && <span style={{color: "var(--primary)", fontSize: "12px"}}>(You)</span>}
                            </div>
                        )
                    }) : <span style={{ color: "#888", fontSize: "14px", fontStyle: "italic" }}>No players yet...</span>}
                </div>
            </div>

            {/* --- 2. THE JOIN BUTTON --- */}
            {!hasJoined && (
                <button 
                    onClick={onJoin} 
                    disabled={isFull}
                    className="btn btn-primary" 
                    style={{width: "100%", marginBottom: "20px", background: isFull ? "#ccc" : ""}}
                >
                    {isFull 
                        ? "Game Full 🚫" 
                        : parseFloat(game.price) > 0 ? `Pay £${parseFloat(game.price).toFixed(2)} to Join 💳` : "Join for Free 🏀"}
                </button>
            )}

            {/* --- 3. THE CHAT SECTION --- */}
            {hasJoined ? (
                <div className="chat-container">
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
                            <div style={{ textAlign: "center", color: "#aaa", fontSize: "13px", marginTop: "50px" }}>No messages yet. Say hi! 👋</div>
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
                <div className="chat-locked">
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔒</div>
                    <div style={{ fontSize: "15px", fontWeight: "bold" }}>Locker Room Locked</div>
                    <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.8 }}>Join the game to chat with the players!</div>
                </div>
            )}
        </div>
    );
};

export default GameLobby;