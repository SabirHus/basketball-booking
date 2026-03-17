require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const gameRoutes = require("./routes/gameRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 🔒 SECURITY TUNING ---

// 1. Helmet: We disable the Cross-Origin-Resource-Policy for local dev
// This stops Helmet from blocking your local images/scripts
app.use(helmet({
    crossOriginResourcePolicy: false,
})); 

// 2. Rate Limiter: Increased limit for development
// Because the GameLobby polls every 2 seconds, 100 is too low!
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, // 🚀 INCREASED to 500 so your Lobby polling doesn't block you
    message: "Too many requests, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use(apiLimiter); 

// --- 🌐 SMART CORS ---
const allowedOrigins = process.env.WEB_ORIGINS 
    ? process.env.WEB_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173']; // Added both local variants

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Rejected Origin:", origin); // Helps you debug in terminal
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 🚀 EXPLICITLY allow these
    allowedHeaders: ['Content-Type', 'token'], // 🚀 EXPLICITLY allow your 'token' header
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('CourtLink API is Running! 🏀');
});

app.use('/auth', authRoutes);
app.use("/games", gameRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});