import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - CourtLink";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send data to server
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);
      
      // Save the token
      localStorage.setItem("token", res.data.token);
      
      // Go to Dashboard
      navigate("/dashboard");
      
    } catch (err) {
      console.error(err);
      // 🚀 THE FIX: Look for '.message' first! If it's not there, fallback to raw data.
      const errorMessage = err.response?.data?.message || err.response?.data || "Login Failed";
      alert(errorMessage);
    }
  };

  return (
    <div className="auth-wrapper">
      <nav className="auth-header">
        <span style={{fontSize: "24px"}}>🏀</span>
        <h1 className="auth-logo">CourtLink</h1>
      </nav>

      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{color: "#ff5722"}}>Welcome Back</h2>
          <p style={{color: "#666", marginBottom: "30px"}}>Log in to your account.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{fontSize: "0.9em", fontWeight:"bold", color: "#444"}}>Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="baller@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label style={{fontSize: "0.9em", fontWeight:"bold", color: "#444"}}>Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{width: "100%", marginTop: "10px"}}>
              Log In
            </button>
          </form>

          <div style={{marginTop: "20px", fontSize: "0.9em"}}>
            New to CourtLink? <Link to="/register" style={{color: "#ff5722", fontWeight: "bold", textDecoration: "none"}}>Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;