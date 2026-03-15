import React, { useState, useEffect } from "react";
import axios from "axios";

const GameLobby = ({ gameId, maxPlayers }) => {
    const [players, setPlayers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // 1. Fetch Players and Messages when the lobby opens
    useEffect(() => {
        const fetchLobbyData = async () => {
            try {
                // Fetch Players
                const playerRes = await axios.get(`http://localhost:5000/games/players/${gameId}`);
                setPlayers(playerRes.data);

                // Fetch Messages
                const msgRes = await axios.get(`http://localhost:5000/games/messages/${gameId}`);
                setMessages(msgRes.data);
            } catch (err) {
                console.error("Error loading lobby data:", err);
            }
        };

        if (gameId) fetchLobbyData();
    }, [gameId]);

    // 2. Send a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // NOTE: Make sure you are passing your JWT token in the headers!
            const res = await axios.post(
                `http://localhost:5000/games/messages/${gameId}`,
                { message: newMessage },
                { headers: { token: localStorage.getItem("token") } } 
            );

            // Add the new message to the screen immediately
            setMessages([...messages, { ...res.data, username: "You" }]); 
            setNewMessage(""); // Clear the input box
        } catch (err) {
            console.error("Error sending message:", err);
            alert("You must join the game to send a message!");
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 mt-6 bg-white p-4 rounded-lg shadow">
            
            {/* LEFT SIDE: Player List */}
            <div className="w-full md:w-1/3 border-r pr-4">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">
                    Players ({players.length}/{maxPlayers})
                </h3>
                {players.length === 0 ? (
                    <p className="text-gray-500 text-sm">No one has joined yet.</p>
                ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {players.map((p, index) => (
                            <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span className="font-semibold text-sm">👤 {p.username}</span>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    {p.skill_level}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* RIGHT SIDE: Chat Room */}
            <div className="w-full md:w-2/3 flex flex-col">
                <h3 className="text-lg font-bold mb-3 border-b pb-2">Game Chat</h3>
                
                {/* Messages Box */}
                <div className="flex-1 bg-gray-50 p-3 rounded-lg max-h-60 overflow-y-auto mb-3 border">
                    {messages.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center mt-4">No messages yet. Say hi! 👋</p>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-2">
                                <span className="font-bold text-sm text-gray-700">{msg.username}: </span>
                                <span className="text-sm text-gray-800">{msg.message}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Box */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                        Send
                    </button>
                </form>
            </div>

        </div>
    );
};

export default GameLobby;