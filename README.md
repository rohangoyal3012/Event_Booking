# 🎭 Event Booking System

A full-stack event booking platform built with React (Vite) and Node.js (Express) that allows users to browse events, make bookings, and administrators to manage events.

## 📹 Demo Video

**[Watch Project Demo](https://drive.google.com/file/d/1trfx1drchDMtWYmnww9zWP6v0w0NpnQ5/view?usp=sharing)**

---

## 🌟 Features

### User Features

- ✅ User Registration & Authentication with JWT
- ✅ Browse all upcoming events with beautiful event cards
- ✅ View detailed event information
- ✅ Book tickets with multiple categories (VIP, Regular, Student)
- ✅ View personal booking history
- ✅ Real-time seat availability tracking
- ✅ Cancel bookings

### Admin Features

- ✅ Create, edit, and delete events
- ✅ Manage ticket categories and pricing
- ✅ View all bookings across the platform
- ✅ Admin dashboard for event management
- ✅ Real-time updates on seat availability

### Technical Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Real-time API integration
- ✅ Secure authentication with JWT tokens
- ✅ Role-based access control (Admin/User)
- ✅ Beautiful gradient UI with Tailwind CSS
- ✅ Form validation and error handling
- ✅ Loading states and user feedback

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

---

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** package manager
- **Git** (optional, for cloning)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rohangoyal3012/Event_Booking.git
cd Event_Booking
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=9000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking_db
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

Backend will run at: `http://localhost:9000`

**Note:** The application will automatically create the database and tables on first run.

### 3. Frontend Setup

Open a new terminal:

```bash
cd forntend
npm install
```

Create `.env.local` file (optional - defaults to localhost:9000):

```env
VITE_API_URL=http://localhost:9000/api
```

Start the frontend server:

```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🎯 Default Admin Login

The system creates a default admin account on first run:

```
Email: admin@eventbooking.com
Password: admin123
```

⚠️ **Important:** Change this password after first login in production!

---

## 📁 Project Structure

```
Event_Booking/
├── backend/                      # Backend Node.js/Express API
│   ├── src/
│   │   ├── config/              # Database configuration
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/          # Auth middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── app.js               # Express app entry point
│   ├── package.json
│   └── .env                     # Environment variables
│
└── forntend/                    # Frontend React/Vite app
    ├── src/
    │   ├── components/          # Reusable components
    │   ├── context/             # React Context (Auth)
    │   ├── features/            # Feature components
    │   ├── layouts/             # Layout components
    │   ├── pages/               # Page components
    │   ├── services/            # API services
    │   ├── shared/              # Shared UI components
    │   ├── utils/               # Utility functions
    │   └── App.jsx              # Main app
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | User login        | No            |
| GET    | `/api/auth/profile`  | Get user profile  | Yes           |

### Events

| Method | Endpoint          | Description      | Auth Required |
| ------ | ----------------- | ---------------- | ------------- |
| GET    | `/api/events`     | Get all events   | No            |
| GET    | `/api/events/:id` | Get event by ID  | No            |
| POST   | `/api/events`     | Create new event | Yes (Admin)   |
| PUT    | `/api/events/:id` | Update event     | Yes (Admin)   |
| DELETE | `/api/events/:id` | Delete event     | Yes (Admin)   |

### Bookings

| Method | Endpoint                     | Description        | Auth Required |
| ------ | ---------------------------- | ------------------ | ------------- |
| GET    | `/api/bookings`              | Get all bookings   | Yes (Admin)   |
| GET    | `/api/bookings/user/:userId` | Get user bookings  | Yes           |
| POST   | `/api/bookings`              | Create new booking | Yes           |
| PUT    | `/api/bookings/:id/cancel`   | Cancel booking     | Yes           |

---

## 💾 Database Schema

### Users Table

- `id` - Primary key, Auto increment
- `username` - User's name
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `role` - User role (admin/user)
- `created_at` - Timestamp

### Events Table

- `id` - Primary key, Auto increment
- `title` - Event title
- `description` - Event description
- `date` - Event date
- `time` - Event time
- `location` - Event venue
- `capacity` - Total seats
- `available_seats` - Remaining seats
- `status` - Event status (upcoming/completed/cancelled)
- `created_at` - Timestamp

### Bookings Table

- `id` - Primary key, Auto increment
- `user_id` - Foreign key (users)
- `event_id` - Foreign key (events)
- `ticket_category_id` - Foreign key (ticket_categories)
- `number_of_tickets` - Quantity
- `total_amount` - Total price
- `booking_status` - Status (confirmed/cancelled)
- `created_at` - Timestamp

### Ticket Categories Table

- `id` - Primary key, Auto increment
- `event_id` - Foreign key (events)
- `category_name` - Category (VIP/Regular/Student)
- `price` - Ticket price
- `available_quantity` - Available tickets
- `created_at` - Timestamp

---

## 🔧 Available Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start dev server with nodemon
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Configure the following:
   - **Root Directory:** `forntend`
   - **Framework Preset:** Vite
   - **Environment Variable:**
     - Name: `VITE_API_URL`
     - Value: `https://your-backend-url.com/api`
4. Click Deploy

Your frontend will be live at: `https://your-app.vercel.app`

### Backend Deployment (AWS EC2)

1. **Launch EC2 Instance**

   - AMI: Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier)
   - Configure security groups (Allow ports: 22, 80, 443, 9000)

2. **Connect and Setup Server**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MySQL
   sudo apt install mysql-server -y

   # Install PM2
   sudo npm install -g pm2
   ```

3. **Setup MySQL Database**

   ```bash
   sudo mysql
   CREATE DATABASE event_booking_db;
   CREATE USER 'eventuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON event_booking_db.* TO 'eventuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Deploy Application**

   ```bash
   # Clone repository
   git clone https://github.com/rohangoyal3012/Event_Booking.git
   cd Event_Booking/backend

   # Install dependencies
   npm install

   # Create .env file with production values
   nano .env

   # Start with PM2
   pm2 start src/app.js --name event-booking-api
   pm2 startup
   pm2 save
   ```

5. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/event-booking
   ```

Your backend will be accessible at: `http://your-ec2-ip:9000`

---



### Common Backend Issues

**Port already in use:**

```bash
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation on client and server
- ✅ Environment variables for sensitive data
- ✅ CORS configuration



## 📊 Key Features Implementation

### Authentication Flow

1. User registers with username, email, password
2. Password is hashed using bcrypt
3. User logs in with email and password
4. Backend validates credentials and returns JWT token
5. Token is stored in localStorage
6. Token is sent with each API request in Authorization header
7. Backend verifies token before processing requests

### Booking Flow

1. User browses available events
2. Clicks on event to view details
3. Selects ticket category and quantity
4. System calculates total amount
5. User confirms booking
6. Backend validates availability
7. Creates booking and updates seat availability
8. Returns booking confirmation

### Real-time Updates

- Event seat availability updates after each booking
- Polling mechanism refreshes event data every 5 seconds
- Instant feedback on booking actions

---

## 👨‍💻 Author

**Rohan Goyal**  
GitHub: [@rohangoyal3012](https://github.com/rohangoyal3012)

