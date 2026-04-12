CourtLink
Live URL: https://thecourtlink.com/
<img width="1645" height="1122" alt="image" src="https://github.com/user-attachments/assets/b29946a4-8047-4cef-bcad-3f0cc4237e80" />

**CourtLink** is a web-based application using a full body, location-based application to ease the process of organising pickup basketball games. This is designed to complete the balancing act between digital coordination and physical recreation by enabling the users to safely host and find local games and also join them.

---

## Core Features

* **Interactive Geolocation Map:** Powered by Leaflet.js, users can browse in local courts, search through a geocoding search landing built-in, or open the browser GPS to find games nearby.
* **Dynamic Capacity UI:** Map pins and lobby interfaces dynamically react to database states. Once the game attains the number of players needed by the host of the game, the UI will instantly change to reflect that the game is "ON".
* **Forward-Facing Temporal Filtering:** A custom algorithm enables the user to filter the dashboard not just according to a specific date, but also match the games occurring since this very date and time.
* **Auto-Expiring Map Pins:** The backend SQL logic dynamically filters temporal data (`date_time >= NOW()`), ensuring expired games automatically vanish from the map to keep the UI uncluttered.
* **Automated Reverse Geocoding:** When a single pin is dropped by the host on the map to create a game, the location will automatically be provided with the OpenStreetMap API which will subsequently import and process a real-world street address.
* **Forward Geocoding & Address Autocomplete:** Integrated `leaflet-geosearch` into the game-editing flow. Hosts must select verified global addresses, which are mathematically converted into precise GPS coordinates to maintain strict spatial database integrity.
* **Secure Payments & Automated Refunds:** Full integration with **Stripe Checkout**. When a paid game is removed by a host or an admin, all the funded players are automatically refunded.
* **Event-Driven Email Automation:** Integrated with the Resend API to automatically dispatch dynamic HTML emails for booking confirmations, cancellations, player kicks, and capacity milestones (instantly notifying the roster when the "Game is ON").
* **State Mutation Diff-Tracking:** When a host edits a game, the backend sequentially fetches the historical state, compares it to the new payload, and emails the roster a visually "diffed" breakdown of exactly what changed (e.g., old times crossed out in red, new times highlighted in green).
* **Real-Time Game Lobbies:** Dedicated post-join lobbies featuring real-time messaging, player rosters, and host rating systems.
* **Dynamic UPSERT Rating System:** Advanced SQL operations allow users to seamlessly update and overwrite their previous post-game host ratings without triggering duplicate-key errors.
* **Role-Based Access Control:** Secure JWT-authentication to distance regular user-persons and game hosts and platform administrators such that only registered and authenticated persons have access to deletion and moderation tools.
* **Legal & Financial Compliance:** Mandatory UI checkpoints requiring users to agree to platform Terms & Conditions and Privacy Policies before Stripe payment gateways are unlocked.
* **Cloud-Based Profile Picture Uploads:** Profile images are uploaded and stored via **Cloudinary** using the `multer-storage-cloudinary` middleware. When a user selects a new avatar on the profile page, the image is streamed directly to Cloudinary's CDN, and the returned URL is persisted in the database. Users can also preview their selected image before saving and remove their picture to revert to a default placeholder.
* **Persistent Dark / Light Mode Toggle:** A global theme switcher is decoupled into its own reusable React component (`DarkModeToggle`). The selected theme is persisted to `localStorage` so it survives page refreshes and new sessions. CSS custom properties (variables) are overridden on the `body` element to instantly swap the entire colour palette, and a CSS `filter` on the Leaflet tile layer inverts the map tiles for dark mode without needing a secondary tile source.

---

## Technical Stack

This application utilises the **PERN** stack, optimised for performance and scalability.

### **Frontend**
* **React.js (Vite):** Selected because of hot Module Replacement (HMR) and fast builds.
* **React-Leaflet & Leaflet-Geosearch:** For rendering complex, interactive map layers and handling global address autocomplete APIs.
* **Framer Motion:** This package is used to perform transitions between user interfaces and modal-style animations.
* **CSS3 / Tailwind:** Completely responsive design with a permanent dark / light mode switch decoupled into a globally accessible React component using localStorage.

### **Backend**
* **Node.js & Express.js:** Node.js based/RESTful API architecture routing, middleware and business logic purposes.
* **Stripe API:** Financial infrastructure of conducting secure checkout sessions and asynchronous webhook refunds.
* **Resend API:** For orchestrating automated, programmatic HTML transactional emails.
* **JWT & bcrypt:** For secure user authentication and password hashing.
* **Cloudinary & Multer:** Cloud-based image storage pipeline for user profile pictures, using `multer-storage-cloudinary` to stream uploads directly to a CDN without relying on ephemeral server disk space.

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

---

## Screenshots

### Login Page
<img width="1917" height="1021" alt="Main Page or Login" src="https://github.com/user-attachments/assets/8fff2c94-20b9-413c-ac86-6112fcd99b9d" />

### Register Account
<img width="1912" height="1028" alt="Register Account" src="https://github.com/user-attachments/assets/fe34be99-aa67-44a5-8aa3-341a79cff466" />

### Main Dashboard (Dark Mode)
<img width="1918" height="1030" alt="Main Dashboard" src="https://github.com/user-attachments/assets/941a00d8-6d16-4299-8fb9-3f051b0fb65c" />

### Main Dashboard (Light Mode)
<img width="1915" height="1028" alt="Light Mode" src="https://github.com/user-attachments/assets/24b24270-7230-4a1a-8b1c-f666615c703a" />

### Hosting a Game
<img width="1020" height="805" alt="Hosting a Game" src="https://github.com/user-attachments/assets/338ffa2b-4a39-4bb1-873e-4feba9a808a2" />

### Editing a Game
<img width="442" height="458" alt="Editing a Game" src="https://github.com/user-attachments/assets/a8ea2711-3e0f-40ef-bea7-84bac13ad308" />

### Host / Admin Game View
<img width="1911" height="1035" alt="Page for Hosts Looking at Game" src="https://github.com/user-attachments/assets/c60b2561-01fe-40a4-a82b-1ad8576624ca" />

### Player Game View (Join & Pay)
<img width="972" height="901" alt="Page for New Users for Games" src="https://github.com/user-attachments/assets/fa7a9f3a-c5c4-419a-baf7-1c276c67908a" />

### Game is ON — Map Pin
<img width="203" height="147" alt="Game On" src="https://github.com/user-attachments/assets/a7d463a7-ddc3-47b8-999f-89530368d4ec" />

### Stripe Payment Checkout
<img width="1215" height="889" alt="Stripe Payment" src="https://github.com/user-attachments/assets/dc38059e-3057-47be-aa90-669076d891d1" />

### Payment Successful
<img width="518" height="442" alt="Payment Successful" src="https://github.com/user-attachments/assets/5aa6f0b3-0de5-4caf-8f89-f499e1ae6a0d" />

### Profile Page (Default Avatar)
<img width="1917" height="1032" alt="Profile Page" src="https://github.com/user-attachments/assets/da4ddcab-cc44-4096-a755-ffcedae15547" />

### Profile Page (Custom Avatar)
<img width="772" height="772" alt="Profile Pic" src="https://github.com/user-attachments/assets/9a9aa8c4-9dd4-4b3c-aaf5-87134b2b7d76" />

### Booking Confirmed Email
<img width="436" height="569" alt="Booking Confirmed Email" src="https://github.com/user-attachments/assets/9ac429ad-2654-4bd1-901c-07b7d76cd10e" />

### Game is ON Email
<img width="451" height="225" alt="Game On Email" src="https://github.com/user-attachments/assets/1c80d915-373a-4480-b5b7-b209ea950546" />

### Game Details Updated Email (Diff Tracking)
<img width="445" height="384" alt="Game Update Email" src="https://github.com/user-attachments/assets/98ce48cb-adc4-4c71-805b-29b2f711d997" />

### Game Cancelled & Refund Email
<img width="595" height="306" alt="Game Cancelled and Refunds" src="https://github.com/user-attachments/assets/e84d8820-76e9-4cec-aa5c-46e63b4891f6" />

### Roster Update — Player Removed Email
<img width="451" height="223" alt="Roster Update when users get removed" src="https://github.com/user-attachments/assets/9255488b-f337-46a2-962f-aea3b40039ed" />
