# 🏀 CourtLink
Live URL: https://thecourtlink.com/
<img width="1683" height="887" alt="image" src="https://github.com/user-attachments/assets/e8dde25f-a1a9-458e-ab40-fb2eb1532070" />

**CourtLink** is a full-stack, location-based web application designed to streamline the organization of pickup basketball games. Built as a Final Year University Dissertation, this platform bridges the gap between digital coordination and physical recreation by allowing users to securely host, discover, and join local games.

---

## ✨ Core Features

* **🗺️ Interactive Geolocation Map:** Powered by Leaflet.js, users can explore local courts, search via a built-in geocoding search bar, or use browser GPS to find games nearby.
* **🚦 Dynamic Capacity UI:** Map pins and lobby interfaces dynamically react to database states. When a game reaches the host's required "Minimum Players" threshold, the UI updates instantly to confirm the game is "ON".
* **⏳ Forward-Facing Temporal Filtering:** A custom algorithm allows users to filter the dashboard not just by exact dates, but for games happening from a specific date and time *onward*.
* **📍 Automated Reverse Geocoding:** When a host drops a pin on the map to create a game, the system automatically fetches and formats the real-world street address using the OpenStreetMap API.
* **💳 Secure Payments & Automated Refunds:** Full integration with **Stripe Checkout**. If a host or admin deletes a paid game, the backend automatically calculates and processes refunds to all enrolled players.
* **💬 Real-Time Game Lobbies:** Dedicated post-join lobbies featuring real-time messaging, player rosters, and host rating systems.
* **🛡️ Role-Based Access Control:** Secure JWT authentication that separates standard users, game hosts, and platform admins, ensuring secure access to deletion and moderation tools.

---

## 🛠️ Technical Stack

This application utilizes the **PERN** stack, optimized for performance and scalability.

### **Frontend**
* **React.js (Vite):** Chosen for its rapid build times and hot Module Replacement (HMR).
* **React-Leaflet:** For rendering complex, interactive map layers.
* **Framer Motion:** Implemented for smooth, professional UI transitions and modal animations.
* **CSS3 / Tailwind:** Fully responsive design featuring a persistent Dark/Light mode toggle utilizing `localStorage`.

### **Backend**
* **Node.js & Express.js:** RESTful API architecture handling routing, middleware, and business logic.
* **Stripe API:** Financial infrastructure managing secure checkout sessions and asynchronous webhook refunds.
* **JWT & bcrypt:** For secure user authentication and password hashing.

---

## 🗄️ Database Architecture

* **PostgreSQL (Hosted on Neon):** A robust relational database chosen to handle complex data relationships.
* **Key Relational Logic:** Utilizes SQL `JOIN` operations to connect `users`, `games`, `game_players`, and `game_messages`. This ensures that when a game is queried, the frontend receives a complete payload including the host's profile, the current capacity, and the player roster in a single, efficient query.

---

## ☁️ Infrastructure & Deployment

The deployment pipeline was architected to ensure high availability, security, and continuous deployment (CD).

* **Render:** * **Static Site Hosting:** Serves the compiled Vite/React frontend (`dist` folder) with client-side routing rewrite rules configured for SPAs.
  * **Web Service Hosting:** Runs the Node.js backend environment.
* **Cloudflare:**
  * **DNS Management & Proxy:** Shields the origin servers and provides CDN caching.
  * **Edge Security:** Enforces **Full (Strict) SSL/TLS encryption** and Automatic HTTPS Rewrites, effectively eliminating Mixed Content vulnerabilities between the client and API.
