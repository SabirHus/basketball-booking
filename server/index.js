const express = require('express');
const cors = require('cors');
const gameRoutes = require("./routes/gameRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows server to read JSON data

app.get('/', (req, res) => {
    res.send('Basketball Booking Backend is Running!');
});

// ROUTES
app.use('/auth', require('./routes/authRoutes')); // ADD THIS LINE
app.use("/games", gameRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});