# BuiltRise - Project Report

## 1. Executive Summary
BuiltRise is a full-stack web application designed to serve as the digital storefront and lead-generation platform for a premier construction and consulting firm. The application showcases the company's services, portfolio, pricing packages, and provides interactive forms for potential clients to request quotes or schedule consultations.

## 2. Technology Stack
The project is built using a modern, lightweight, and efficient technology stack without heavy frontend frameworks, ensuring fast loading times and straightforward maintainability.

### Frontend
* **HTML5:** Semantic HTML structure for better SEO and accessibility.
* **CSS3 (Vanilla):** Custom styling using CSS variables, Flexbox, Grid, and keyframe animations. It includes complex UI components like horizontal scrolling marquees and glassmorphism effects.
* **JavaScript (Vanilla):** Client-side logic for DOM manipulation, modal handling, form validation, and asynchronous API requests.
* **Typography:** Custom fonts hosted via Fontshare (Clash Grotesk and General Sans).

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js (v5.2.1) - Used for handling routing, middleware, and API endpoints.
* **Environment Management:** `dotenv` - Used for managing secure environment variables (database credentials).
* **Cross-Origin Resource Sharing:** `cors` - Configured to allow secure requests from the frontend to the backend APIs.

### Database
* **Database Management System:** MySQL
* **Driver:** `mysql2/promise` - Used for establishing a connection pool and executing asynchronous SQL queries.

## 3. Project Architecture & Directory Structure
The repository is structured as a monolith where both frontend assets and backend logic reside together.

* `index.html`: The main landing page containing all sections (Hero, About, Services, Projects, Packages, Contact).
* `style.css`: The global stylesheet containing all UI designs, themes, and responsiveness rules.
* `script.js`: Handles interactive elements like modals, sticky navigation, and AJAX form submissions.
* `server.js`: The backend Express server. It initializes the database, serves static files, and defines API routes.
* `.env`: Configuration file for database credentials and ports.
* `images/` & `logo-symbol.png`: Static assets used across the website.

## 4. Key Features Implemented
* **Responsive Navigation:** A sticky navbar that adapts to screen size, including direct WhatsApp integration.
* **Hero Section:** Features a dynamic layout with an integrated tour video modal and floating animated badges.
* **Services Marquee:** A smooth, infinitely scrolling horizontal marquee displaying various construction services.
* **Project Galleries:** Displays ongoing projects in an arc-layout and completed projects in a horizontal scrollable gallery.
* **Dynamic Pricing Packages:** Clearly listed construction packages (Classic, Premium, Luxury, Signature) with interactive quote generation triggers.
* **Lead Generation Forms:** Multiple forms (Schedule Call, Contact Us, Package Quotation) that validate user input and send data asynchronously to the backend.
* **Multi-number WhatsApp Integration:** A customized modal allowing users to choose which representative to message.

## 5. Database Schema
The database (`builtrise_db` by default) automatically initializes on server startup. It consists of two primary tables:

### Table: `contacts`
Stores general inquiries and consultation requests.
* `id` (INT, Primary Key, Auto Increment)
* `name` (VARCHAR 255, Not Null)
* `email` (VARCHAR 255, Not Null)
* `phone` (VARCHAR 50)
* `message` (TEXT)
* `created_at` (TIMESTAMP, Default: Current Timestamp)

### Table: `quotes`
Stores specific requests for construction pricing packages.
* `id` (INT, Primary Key, Auto Increment)
* `package_name` (VARCHAR 100, Not Null)
* `name` (VARCHAR 255, Not Null)
* `phone` (VARCHAR 50, Not Null)
* `created_at` (TIMESTAMP, Default: Current Timestamp)

## 6. Backend API Endpoints
All API endpoints are prefixed with `/api/` and return JSON responses.

* **`POST /api/contact`**
  * **Payload:** `{ name, email, phone, message }`
  * **Purpose:** Saves a new contact request to the database.
* **`POST /api/quote`**
  * **Payload:** `{ package_name, name, phone }`
  * **Purpose:** Saves a request for a specific package quote.

## 7. Guide for Future Changes & Maintenance

### Changing Pricing or Packages
To update package pricing (e.g., changing Classic from ₹1899 to ₹1999), you must edit `index.html`. Locate the `<section class="packages" id="packages">` and update the respective text content within the `.package-card` elements.

### Adding New Services
To add a new service to the scrolling marquee, edit `index.html`. Locate the `<div class="services-marquee-container">` and add a new `<div class="service-marquee-card">` block containing the SVG icon, title, and description. Ensure you add it to both the primary set and the duplicate set to keep the infinite scroll seamless.

### Modifying Database Credentials
Database connections are managed via environment variables. If deploying to a new server or changing passwords, update the `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=builtrise_db
```

### Updating Images
To replace gallery or background images, place the new image files in the `images/` directory and update the `src` or `background-image` paths in `index.html` or `style.css`.

### Deployment Considerations
* Before deploying to production, ensure `NODE_ENV=production` is set.
* Ensure the production database is created and the user credentials have the appropriate read/write privileges.
* Configure a process manager like PM2 to keep the `server.js` process running in the background.
* Set up an SSL certificate (HTTPS) as the site handles user contact data.
