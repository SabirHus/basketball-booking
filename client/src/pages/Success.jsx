import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get("gameId");
  
  // useRef prevents the React StrictMode double-fire bug from joining the game twice
  const hasJoined = useRef(false);

  useEffect(() => {
    const finalizeBooking = async () => {
      if (hasJoined.current) return;
      hasJoined.current = true;

      try {
        const token = localStorage.getItem("token");
        // Actually insert them into the game_players database now that they paid!
        await axios.post(`http://localhost:5000/games/join/${gameId}`, {}, {
            headers: { token: token }
        });
      } catch (err) {
        console.error("Booking error:", err);
      }
    };

    if (gameId) finalizeBooking();
  }, [gameId]);

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "4em", margin: "0" }}>✅</h1>
      <h1 style={{ color: "#27ae60" }}>Payment Successful!</h1>
      <p style={{ color: "#666", fontSize: "1.2em" }}>Your spot on the court is officially secured.</p>
      
      <div style={{ marginTop: "30px", display: "flex", gap: "20px", justifyContent: "center" }}>
        <button onClick={() => navigate("/dashboard")} className="btn btn-primary">Back to Map</button>
        <button onClick={() => navigate("/profile")} className="btn" style={{ background: "#2d3436" }}>View My Profile</button>
      </div>
    </div>
  );
};

export default Success;