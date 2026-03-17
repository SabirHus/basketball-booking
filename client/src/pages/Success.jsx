import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get("gameId");
  
  // 🚀 THE FIX: Grab the Stripe session ID from the URL that Stripe sent us back to
  const sessionId = searchParams.get("session_id"); 
  
  const hasJoined = useRef(false);

  useEffect(() => {
    const finalizeBooking = async () => {
      if (hasJoined.current) return;
      hasJoined.current = true;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/games/join/${gameId}`, 
          { sessionId }, // 🚀 THE FIX: Send the sessionId in the request body!
          { headers: { token: localStorage.getItem("token") } }
        );
      } catch (err) { console.error("Booking error:", err); }
    };
    if (gameId) finalizeBooking();
  }, [gameId, sessionId]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      <div className="card" style={{ textAlign: "center", padding: "40px", maxWidth: "500px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        
        {/* Animated Checkmark Simulation */}
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#e8f8f5", color: "#27ae60", fontSize: "40px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            ✓
        </div>
        
        <h1 style={{ color: "#2d3436", marginBottom: "10px" }}>Payment Successful!</h1>
        <p style={{ color: "#636e72", fontSize: "1.1em", lineHeight: "1.6" }}>
          Your transaction is complete. Your spot on the court is officially secured. A receipt has been sent to your email.
        </p>
        
        <hr style={{ border: "none", borderTop: "2px dashed #dfe6e9", margin: "30px 0" }} />
        
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={{ padding: "12px 24px" }}>
            Return to Map
          </button>
          <button onClick={() => navigate("/profile")} className="btn" style={{ background: "#2d3436", color: "white", padding: "12px 24px" }}>
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;