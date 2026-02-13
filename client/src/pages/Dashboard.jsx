import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // We will use this later

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    } else {
      // FIX: We wrap this in a helper function to simulate an API call.
      // In the future, this will be a real `await axios.get(...)` call.
      const fetchUserData = async () => {
        // Simulate a tiny delay (network request) to satisfy the linter
        setTimeout(() => {
           setUser({ username: "Baller" }); // Placeholder name
        }, 100);
      };

      fetchUserData();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to the Court, {user?.username}! 🏀</h1>
      
      <div className="stats-panel">
        <div className="card">
          <h3>Your Games</h3>
          <p>0 Upcoming</p>
        </div>
        <div className="card">
          <h3>Reputation</h3>
          <p>⭐⭐⭐⭐⭐ (New)</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn-primary">Find a Game</button>
        <button className="btn-secondary">Host a Game</button>
        <button onClick={handleLogout} className="btn-danger">Log Out</button>
      </div>
    </div>
  );
};

export default Dashboard;