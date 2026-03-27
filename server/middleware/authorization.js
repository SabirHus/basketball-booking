const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware interceptor to cryptographically verify user sessions
module.exports = async (req, res, next) => {
    try {
        // Extract the JSON Web Token from the custom request header
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Unauthorised: No token provided");
        }

        // Verify the token integrity using the private server-side secret key
        const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

        // Attach the decoded user payload to the request object for downstream routes to utilise
        req.user = payload; 
        
        // Pass control to the next middleware or final route controller
        next();
    } catch (err) {
        console.error("Authentication Error:", err.message);
        return res.status(403).json("Unauthorised: Invalid or expired token");
    }
};