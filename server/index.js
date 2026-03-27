require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import modular routing controllers
const gameRoutes = require("./routes/gameRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

// 1. INFRASTRUCTURE & PROXY CONFIGURATION
app.set('trust proxy', 1);

// 2. SECURITY MIDDLEWARE
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); 

// API Rate Limiting to prevent brute-force login attempts and DDoS attacks
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: "Too many requests detected from this IP. Please try again later.",
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use(apiLimiter); 

// 3. CORS (Cross-Origin Resource Sharing)
const allowedOrigins = process.env.WEB_ORIGINS 
    ? process.env.WEB_ORIGINS.split(',') 
    : ['https://thecourtlink.com', 'https://www.thecourtlink.com'];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin or from allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error("🚫 Blocked by CORS policy:", origin); 
            callback(new Error('Origin not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'token', 'Authorization'], 
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 

// Parse incoming JSON payloads
app.use(express.json());

// 4. API ROUTING
app.use("/games", gameRoutes);
app.use("/auth", authRoutes);

// Health check endpoint for cloud load balancers to verify uptime
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "CourtLink API is running smoothly." });
});

// 5. SERVER INITIALISATION
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 API Server successfully launched on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});