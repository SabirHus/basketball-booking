require('dotenv').config(); // 🚀 Load environment variables at the very top
const express = require('express');
const cors = require('cors');
const gameRoutes = require("./routes/gameRoutes");
const authRoutes = require('./routes/authRoutes');

const app = express();

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
    res.send('CourtLink API is Running! 🏀');
});

app.use('/auth', authRoutes);
app.use("/games", gameRoutes);

// --- SERVER START ---
// Use the PORT from .env, or default to 5000 for local dev
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});