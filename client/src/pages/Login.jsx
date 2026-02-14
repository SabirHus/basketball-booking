import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const res = await axios.post("http://localhost:5000/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Header Bar */}
      <nav className="auth-header">
        <span style={{fontSize: "24px"}}>🏀</span>
        <h1 className="auth-logo">CourtLink</h1>
      </nav>

      {/* Centered Card */}
      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{color: "#ff5722"}}>Welcome Back</h2>
          <p style={{color: "#666", marginBottom: "30px"}}>Enter your details to find a game.</p>
          
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
            New to CourtLink? <Link to="/register" style={{color: "#ff5722", fontWeight: "bold", textDecoration: "none"}}>Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;