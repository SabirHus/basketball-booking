# CourtLink
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
![Login Page](screenshots/Main_Page_or_Login.png)

### Register Account
![Register Account](screenshots/Register_Account.png)

### Main Dashboard (Dark Mode)
![Main Dashboard Dark Mode](screenshots/Main_Dashboard.png)

### Main Dashboard (Light Mode)
![Main Dashboard Light Mode](screenshots/Light_Mode.png)

### Hosting a Game
![Hosting a Game](screenshots/Hosting_a_Game.png)

### Editing a Game
![Editing a Game](screenshots/Editing_a_Game.png)

### Host / Admin Game View
![Host Game View](screenshots/Page_for_Hosts_Looking_at_Game.png)

### Player Game View (Join & Pay)
![Player Game View](screenshots/Page_for_New_Users_for_Games.png)

### Game is ON — Map Pin
![Game ON Map Pin](screenshots/Game_On.png)

### Stripe Payment Checkout
![Stripe Payment](screenshots/Stripe_Payment.png)

### Payment Successful
![Payment Successful](screenshots/Payment_Successful.png)

### Profile Page (Default Avatar)
![Profile Page](screenshots/Profile_Page.png)

### Profile Page (Custom Avatar)
![Profile Page with Avatar](screenshots/Profile_Pic.png)

### Booking Confirmed Email
![Booking Confirmed Email](screenshots/Booking_Confirmed_Email.png)

### Game is ON Email
![Game ON Email](screenshots/Game_On_Email.png)

### Game Details Updated Email (Diff Tracking)
![Game Update Email](screenshots/Game_Update_Email.png)

### Game Cancelled & Refund Email
![Game Cancelled Email](screenshots/Game_Cancelled_and_Refunds.png)

### Roster Update — Player Removed Email
![Roster Update Email](screenshots/Roster_Update_when_users_get_removed.png)
