# CarShop - Full-Stack Car Dealership Application

A modern full-stack web application for buying and selling cars, built with React (TypeScript) on the frontend and Node.js/Express on the backend.

**Live Demo:** [https://carshop-8l22.onrender.com](https://carshop-8l22.onrender.com)

## Features

- **User Authentication**: Email/password login and Google OAuth sign-in
- **Role-Based Access Control**: Regular users and admin roles
- **Car Catalog**: Browse available cars with filtering by brand
- **Shopping Cart**: Add cars to cart and manage selections
- **Order Management**: Place and track orders
- **Admin Panel**: Manage car inventory (add, edit, delete cars)
- **Image Upload**: Support for Cloudinary or local file storage
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Project Structure

```
/workspace
├── client/                 # Frontend (React + TypeScript + Vite)
│   └── carshop/
│       ├── src/
│       │   ├── components/ # React components (pages & UI)
│       │   ├── store/      # Redux Toolkit state management
│       │   ├── context/    # React Context (Auth)
│       │   ├── config.ts   # API URL configuration
│       │   └── main.tsx    # App entry point
│       └── package.json
│
└── server/                 # Backend (Node.js + Express + MongoDB)
    ├── routes/             # API route definitions
    ├── controllers/        # Business logic handlers
    ├── models/             # Mongoose schemas (User, Car, Order, Cart)
    ├── middleware/         # Auth, rate limiting, file upload
    ├── app.js              # Express app setup
    └── package.json
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Redux Toolkit for state management
- React Router DOM for navigation
- React Hook Form for form handling
- Google OAuth library
- Vite as build tool
- FontAwesome for icons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Cloudinary integration for image hosting
- CORS for cross-origin requests
- express-rate-limit for API protection

### Data Flow

1. **Client-side routing**: React Router handles navigation between pages (`/`, `/cart`, `/orders`, `/profile`, `/admin`)
2. **State Management**: Redux Toolkit manages global state for cars, cart, and orders
3. **API Communication**: Frontend sends requests to `/api/*` endpoints
4. **Authentication**: JWT tokens stored in localStorage, validated by middleware
5. **Hybrid Deployment**: Server can serve both API and static frontend files from a single instance

### Key Middleware Chain

```
Request → CORS → Body Parser → [Auth Middleware] → [Role Middleware] → Controller → Response
```
## MongoDB Schema & Data Architecture

The application uses 4 main collections in MongoDB, managed via Mongoose ODM.

### 1. User Collection (`users`)
- `_id`: ObjectId
- `email`: String (unique, required, lowercase)
- `password`: String (required, hashed with bcrypt)
- `username`: String
- `role`: String (enum: ['user', 'admin'], default: 'user')
- `avatar`: String (URL)
- `refreshToken`: String
- `createdAt`, `updatedAt`: Date (auto-generated)

### 2. Car Collection (`cars`)
- `_id`: ObjectId
- `brand`: String (required)
- `model`: String (required)
- `year`: Number (required)
- `price`: Number (required)
- `imageUrl`: String (Cloudinary URL or local path)
- `createdAt`, `updatedAt`: Date (auto-generated)

### 3. Cart Collection (`carts`)
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User', required, unique)
- `items`: Array of Objects
  - `carId`: ObjectId (ref: 'Car') —  N:M with Car
  - `quantity`: Number (default: 1)
- `updatedAt`: Date

### 4. Order Collection (`orders`)
- `_id`: ObjectId
- `userId`: ObjectId (ref: 'User', required)
- `items`: Array of Objects
  - `carId`: ObjectId (ref: 'Car') — N:M with Car
  - `brand`, `model`, `price`: String/Number 
- `status`: String (enum: ['pending', 'completed', 'delivered'], default: 'pending')
- `total`: Number
- `createdAt`, `updatedAt`: Date

### Relationships Summary

| From | To | Type | Description |
|------|-----|------|-------------|
| User | Cart | 1:1 | Each user has exactly one cart |
| User | Order | 1:N | One user can place multiple orders |
| Car | Cart | N:M | A car can be in multiple carts |
| Car | Order | N:M | A car can appear in multiple orders |

### Mongoose Features Used

- **References (`ref`)**: Cart and Order use ObjectId references to link Users and Cars
- **Middleware Hooks**: `pre('save')` hook in User model to hash passwords with bcrypt before saving
- **Instance Methods**: `matchPassword()` method in User model for secure password comparison
- **Timestamps**: All models use `timestamps: true` for automatic createdAt and updatedAt fields
- **Select Exclusion**: Password field is excluded from query results by default (`select: false`)
- **Enum Validation**: `role` and `status` fields use enum constraints to prevent invalid values
- **Unique Indexes**: `email` in User and `userId` in Cart have unique constraints

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret key for signing JWT tokens (use strong random string) |
| `JWT_EXPIRE` | Access token expiration time | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration time | `20d` |
| `PORT` | Server port (optional, defaults to 3000) | `3000` |
| `CLIENT_URL` | Frontend URL(s) for CORS (comma-separated) | `http://localhost:5173,https://yourdomain.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID from Google Cloud Console |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | 
| `CLOUDINARY_API_KEY` | Cloudinary API key|
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | 

**Notes:**
- If Cloudinary credentials are not provided, images are saved locally in `/server/uploads/`

### Frontend (.env)

The frontend uses Vite's environment variable system. Create `.env` in `/client/carshop/` if needed:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | Empty (uses same origin) or `http://localhost:3000` in dev |

**Notes:**
- In development mode, the default API URL is `http://localhost:3000`
- In production, if `VITE_API_URL` is not set, requests go to the same domain (hybrid deployment)
- The Google Client ID is hardcoded in `main.tsx` and should match the backend's `GOOGLE_CLIENT_ID`

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client/carshop
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In /server directory
   cp .env.example .env
   # Edit .env with your values
   ```

5. **Start the development servers**

   **Backend** (from `/server`):
   ```bash
   node app.js
   ```

   **Frontend** (from `/client/carshop`):
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3000` and the frontend on `http://localhost:5173`.

### Production Build

Since this is a Monorepo, you can build and run the entire application from the root directory using the unified scripts:

1. **Build the frontend and install all dependencies**
   ```bash
   npm run build
   ```
2. **Start the server**
   ```
   npm start
   ```

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars (supports `?brand=` filter)
- `GET /api/cars/:id` - Get car by ID
- `POST /api/cars` - Create car (admin only, supports image upload)
- `PUT /api/cars/:id` - Update car (admin only)
- `DELETE /api/cars/:id` - Delete car (admin only)

### Users
- `POST /api/users/registration` - Register new user
- `POST /api/users/login` - Login user (rate-limited)
- `POST /api/users/logout` - Logout user (invalidates refresh token)
- `POST /api/users/refresh` - Refresh access token
- `GET /api/users/profile` - Get current user profile (authenticated)
- `POST /api/users/avatar` - Upload user avatar (authenticated)
- `POST /api/users/google-signin` - Google OAuth login

### Cart
- `GET /api/cart` - Get user's cart (authenticated)
- `POST /api/cart` - Add item to cart (authenticated)
- `DELETE /api/cart/:id` - Remove item from cart (authenticated)

### Orders
- `POST /api/orders` - Create new order (authenticated)
- `GET /api/orders/user-orders` - Get current user's orders (authenticated)
- `GET /api/orders` - Get all orders (admin only)
- `DELETE /api/orders/:id` - Delete order (admin only)

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User logs in with email/password or Google OAuth
2. Server returns access token (short-lived) and refresh token (long-lived)
3. Tokens are stored in localStorage on the client
4. Protected routes require `Authorization: Bearer <token>` header
5. Admin routes require user role to be `'admin'`

## Security

- **Rate Limiting**: Login endpoint (`/api/users/login`) is protected against brute-force attacks — max 10 attempts per IP per 15 minutes
- **Role-Based Authorization**: Admin-only routes (car management, order management) protected via `authorize('admin')` middleware
- **Password Hashing**: User passwords hashed with bcryptjs before storage

