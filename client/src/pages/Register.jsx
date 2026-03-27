import { useEffect, useState } from "react";
import axios from "axios";
import DarkModeToggle from "../components/DarkModeToggle";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  // Initialise form state to capture user credentials
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "" 
  });

  const navigate = useNavigate();

  // Update the document title for better browser accessibility and tab management
  useEffect(() => {
    document.title = "Join the Squad - CourtLink";
  }, []);

  // Update the specific state field dynamically based on the input name attribute
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the user has entered matching passwords before attempting a server request
    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return; 
    }

    try {
      // Package the payload for the backend API excluding the local confirmation password
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload);
      
      alert("✅ Registration Successful! Please Log In.");
      navigate("/"); 
    } catch (err) {
      console.error("Registration failed:", err);
      // Safely extract the error message from the backend response payload
      alert(err.response?.data?.message || "Error registering your account.");
    }
  };

  return (
    <div className="auth-wrapper">
      <nav className="auth-header">
        <span style={{ fontSize: "24px" }}>🏀</span>
        <h1 className="auth-logo">CourtLink</h1>
      </nav>

      <div className="auth-container">
        <div className="auth-card">
          <h2 style={{ color: "#ff5722" }}>Join the Squad</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>Create an account to start balling.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ fontSize: "0.9em", fontWeight: "bold", color: "#444" }}>Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g. LeBron"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.9em", fontWeight: "bold", color: "#444" }}>Email</label>
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
              <label style={{ fontSize: "0.9em", fontWeight: "bold", color: "#444" }}>Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: "0.9em", fontWeight: "bold", color: "#444" }}>Repeat Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "10px" }}>
              Create Account
            </button>
          </form>

          <div style={{ marginTop: "25px", fontSize: "0.9em" }}>
          <DarkModeToggle />
            Already have an account? <Link to="/" style={{ color: "#ff5722", fontWeight: "bold", textDecoration: "none" }}>Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;