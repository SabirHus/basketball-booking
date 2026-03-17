require('dotenv').config(); // 🚀 Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 🛡️ NEW: Helmet Security
const rateLimit = require('express-rate-limit'); // ⏱️ NEW: Rate Limiter

const gameRoutes = require("./routes/gameRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 🔒 ADVANCED SECURITY (Task 7.3) ---
// 1. Helmet: Hides Express details and protects against XSS attacks
app.use(helmet()); 

// 2. Rate Limiter: Blocks IPs that spam the server (Brute Force Protection)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again after 15 minutes.",
    standardHeaders: true, 
    legacyHeaders: false,
});
// Apply the rate limiter to all routes
app.use(apiLimiter); 

// --- 🔒 SMART CORS SECURITY ---
// This reads your WEB_ORIGINS from .env and turns it into an array
const allowedOrigins = process.env.WEB_ORIGINS 
    ? process.env.WEB_ORIGINS.split(',') 
    : ['http://localhost:5173'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or check if the origin is in our allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS security policy'));
        }
    },
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // 🛡️ Applied our security settings
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('CourtLink API is Running Securely! 🏀🛡️');
});

app.use('/auth', authRoutes);
app.use("/games", gameRoutes);

// --- SERVER START ---
// Use the PORT from .env, or default to 5000 for local dev
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
    console.log(`🛡️ Security: Helmet & Rate Limiting Active`);
});