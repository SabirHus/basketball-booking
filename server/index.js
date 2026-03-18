require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const gameRoutes = require("./routes/gameRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

// CRITICAL FOR RENDER: Trust the reverse proxy!
// Without this, your rate limiter will block everyone instantly in production.
app.set('trust proxy', 1);

// --- 🔒 SECURITY TUNING ---

// 1. Helmet: Configured to allow external images (like Cloudinary) to load safely
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); 

// 2. Rate Limiter: Keeps your 500 limit for polling
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: "Too many requests, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use(apiLimiter); 

// --- 🌐 SMART CORS ---
// In production, this reads your Vercel URL from Render's Environment Variables.
// (It keeps localhost as a fallback just in case you ever need to test locally again).
const allowedOrigins = process.env.WEB_ORIGINS 
    ? process.env.WEB_ORIGINS.split(',') 
    : ['http://localhost:5173']; 

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error("🚫 Blocked by CORS:", origin); 
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'token', 'Authorization'], 
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); 
app.use(express.json());

// --- ROUTES ---
app.get('/', (req, res) => {
    res.send('CourtLink API is Live! 🚀');
});

app.use('/auth', authRoutes);
app.use("/games", gameRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});