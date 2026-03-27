# CourtLink
Live URL: https://thecourtlink.com/
<img width="1683" height="887" alt="image" src="https://github.com/user-attachments/assets/e8dde25f-a1a9-458e-ab40-fb2eb1532070" />

**CourtLink** is a web-based application using a full body, location-based application to ease the process of organising pickup basketball games. This is designed to complete the balancing act between digital coordination and physical recreation by enabling the users to safely host and find local games and also join them.

---

## Core Features

* ** Interactive Geolocation Map:** Powered by Leaflet.js, users can browse in local courts, or search through a geocoding search landing built-in, or open the browser GPS to find games nearby.
* ** Dynamic Capacity UI:** Map pins and lobby interfaces dynamically react to database states. Once the game attains the number of players needed by the host of the game, the UI will instantly change to reflect that the game is "ON".
* ** Forward-Facing Temporal Filtering:** A custom algorithm enables the user to filter the dashboard not just accodingly to specific date, but also match the games occurring since this very date and time.
* ** Automated Reverse Geocoding:** WWhen a single pin is dropped by the host on the map to create a game, the location will automatically be provided with the OpenStreetMap API which will subsequently import and process a real world street address.
* ** Secure Payments & Automated Refunds:** Full integration with **Stripe Checkout**. When a paid game is removed by a host or an admin, all the funded players are automatically refunded.
* ** Real-Time Game Lobbies:** Dedicated post-join lobbies featuring real-time messaging, player rosters, and host rating systems.
* ** Role-Based Access Control:** Secure JWT-authentication to distance regular user-persons and game hosts and platform administrators such that only registered and authenticated persons have access to deletion and moderation tools.

---

## Technical Stack

This application utilises the **PERN** stack, optimised for performance and scalability.

### **Frontend**
* **React.js (Vite):** Selected because of hot Module Replacement (HMR) and fast builds.
* **React-Leaflet:** For rendering complex, interactive map layers.
* **Framer Motion:** This package is used to perform transitions between user interfaces and modal-style animations.
* **CSS3 / Tailwind:**  Completely responsive design with a permanent dark / light mode switch with the use of localStorage.

### **Backend**
* **Node.js & Express.js:** Node.js based/RESTful API architecture routing, middleware and business logic purposes.
* **Stripe API:** Financial infrastructure of conducting secure checkout sessions and asynchronous webhook refunds.
* **JWT & bcrypt:** For secure user authentication and password hashing.

---

## Database Architecture

* **PostgreSQL (Hosted on Neon):** A powerful relational database that is of use because of complex data relationships.
* **Key Relational Logic:** Uses the SQL join on the bases of users, games, game players and game messages. It makes sure that, on querying a game, the frontend gets full payload of profile of the host, the actual capacity as well as the roster of players in one, effective query.

---

## Infrastructure & Deployment

The deployment pipeline was designed in such a way that it was highly available, secure, and continuously deployed (CD).

* **Render:** * **Static Site Hosting:** Serves the compiled Vite/React frontend (`dist` folder) with client-side routing rewrite rules configured for SPAs.
  * **Web Service Hosting:** Runs the Node.js backend environment.
* **Cloudflare:**
  * **DNS Management & Proxy:** Shields the origin servers and provides CDN caching.
  * **Edge Security:** Enforces **Full (Strict) SSL/TLS encryption** and Automatic HTTPS Rewrites, which accomplish eliminating Mixed Content vulnerability between the client and API in effect.
