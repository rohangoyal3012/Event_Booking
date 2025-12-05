# 🎭 Event Booking System

A full-stack event booking platform built with React (Vite) and Node.js (Express) that allows users to browse events, make bookings, and administrators to manage events.

## 📹 Demo Video

Watch the complete project demonstration here:  
**[Project Demo Video](https://drive.google.com/file/d/1M0wjCxrZiy_K6TV-30ZnWWj22LaSylon/view?usp=sharing)**

---

## 🌟 Features

### User Features

- ✅ User Registration & Authentication (JWT-based)
- ✅ Browse all upcoming events with beautiful cards
- ✅ View detailed event information
- ✅ Book tickets with multiple categories (VIP, Regular, Student)
- ✅ View personal booking history
- ✅ Real-time seat availability tracking
- ✅ Cancel bookings

### Admin Features

- ✅ Create, edit, and delete events
- ✅ Manage ticket categories and pricing
- ✅ View all bookings
- ✅ Dashboard for event management
- ✅ Real-time updates on seat availability

### Technical Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Real-time API integration
- ✅ Secure authentication with JWT tokens
- ✅ Role-based access control (Admin/User)
- ✅ Beautiful gradient UI with modern design
- ✅ Form validation
- ✅ Error handling and user feedback

---

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
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
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and save as .env
```

**Backend `.env` file:**

```env
# Server Configuration
PORT=9000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking_db
DB_PORT=3306

# JWT Secret (Use a strong secret key)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

```bash
# Make sure MySQL is running
# The application will create the database and tables automatically

# Start the backend server
npm run dev
```

Backend will run at: `http://localhost:9000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend folder
cd forntend

# Install dependencies
npm install

# Create .env.local file (optional, defaults to localhost:9000)
# Add this line if needed:
# VITE_API_URL=http://localhost:9000/api

# Start the frontend development server
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🎯 Default Admin Credentials

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
│   │   │   └── db_connection.js
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   └── event.controller.js
│   │   ├── middleware/          # Custom middleware
│   │   │   └── auth.middleware.js
│   │   ├── models/              # Database models
│   │   │   ├── user.model.js
│   │   │   ├── event.model.js
│   │   │   ├── booking.model.js
│   │   │   └── ticket_category.model.js
│   │   ├── routes/              # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── event.route.js
│   │   │   └── booking.route.js
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── event.service.js
│   │   │   └── booking.service.js
│   │   └── app.js               # Express app entry point
│   ├── package.json
│   └── .env                     # Environment variables
│
├── forntend/                    # Frontend React/Vite app
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── BookingForm.jsx
│   │   │   ├── EventForm.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/             # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── features/            # Feature-based components
│   │   │   └── events/
│   │   │       ├── EventCard.jsx
│   │   │       └── EventList.jsx
│   │   ├── layouts/             # Layout components
│   │   │   └── Navbar.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── EditEvent.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── BookingSuccess.jsx
│   │   ├── services/            # API services
│   │   │   └── api.js
│   │   ├── shared/              # Shared components
│   │   │   └── components/
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Input.jsx
│   │   │       └── Badge.jsx
│   │   ├── utils/               # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local               # Local environment variables
│
├── README.md                    # This file
└── .gitignore
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
| GET    | `/api/bookings/:id`          | Get booking by ID  | Yes           |
| POST   | `/api/bookings`              | Create new booking | Yes           |
| PUT    | `/api/bookings/:id/cancel`   | Cancel booking     | Yes           |

---

## 💾 Database Schema

### Users Table

```sql
- id (INT, Primary Key, Auto Increment)
- username (VARCHAR)
- email (VARCHAR, Unique)
- password (VARCHAR, Hashed)
- role (ENUM: 'admin', 'user')
- created_at (TIMESTAMP)
```

### Events Table

```sql
- id (INT, Primary Key, Auto Increment)
- title (VARCHAR)
- description (TEXT)
- date (DATE)
- time (TIME)
- location (VARCHAR)
- capacity (INT)
- available_seats (INT)
- status (ENUM: 'upcoming', 'completed', 'cancelled')
- created_at (TIMESTAMP)
```

### Bookings Table

```sql
- id (INT, Primary Key, Auto Increment)
- user_id (INT, Foreign Key → users.id)
- event_id (INT, Foreign Key → events.id)
- ticket_category_id (INT, Foreign Key → ticket_categories.id)
- number_of_tickets (INT)
- total_amount (DECIMAL)
- booking_status (ENUM: 'confirmed', 'cancelled')
- created_at (TIMESTAMP)
```

### Ticket Categories Table

```sql
- id (INT, Primary Key, Auto Increment)
- event_id (INT, Foreign Key → events.id)
- category_name (VARCHAR: 'VIP', 'Regular', 'Student')
- price (DECIMAL)
- available_quantity (INT)
- created_at (TIMESTAMP)
```

---

## 🎨 Features in Detail

### User Authentication

- Secure JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected routes for authenticated users

### Event Management

- Create events with multiple ticket categories
- Edit event details and pricing
- Delete events (with confirmation)
- Real-time seat availability updates

### Booking System

- Select ticket categories (VIP/Regular/Student)
- Choose number of tickets
- Automatic price calculation
- Booking confirmation
- View booking history
- Cancel bookings

### UI/UX Features

- Responsive design for all screen sizes
- Beautiful gradient theme
- Loading states and error handling
- Form validation
- Success/error notifications
- Smooth animations and transitions

---

## 🔧 Available Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🚀 Deployment

### Backend Deployment (AWS EC2)

1. Launch Ubuntu EC2 instance (t2.micro)
2. Install Node.js and MySQL
3. Clone repository
4. Setup environment variables
5. Start with PM2 process manager
6. Configure Nginx as reverse proxy

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to `forntend`
4. Add environment variable: `VITE_API_URL`
5. Deploy

**Detailed deployment guide available in the repository**

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**

```bash
# Find and kill process using port 9000
netstat -ano | findstr :9000
taskkill /PID <PID> /F
```

**Database connection error:**

- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists (it auto-creates on first run)

**JWT errors:**

- Ensure JWT_SECRET is set in `.env`
- Check token format in Authorization header

### Frontend Issues

**API calls failing:**

- Verify backend is running on port 9000
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

**Build fails:**

- Delete `node_modules` and run `npm install`
- Clear cache: `npm cache clean --force`

---

## 🔒 Security Best Practices

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for secure authentication
- ✅ CORS configured for allowed origins
- ✅ SQL injection prevention with parameterized queries
- ✅ Input validation on both client and server
- ✅ Environment variables for sensitive data

⚠️ **For Production:**

- Change default admin password
- Use strong JWT_SECRET (minimum 32 characters)
- Enable HTTPS
- Restrict CORS to specific domains
- Set up database backups
- Use environment-specific configurations

---

## 📊 Key Highlights

- **Full-stack MERN-like architecture** (MySQL instead of MongoDB)
- **RESTful API design** with proper HTTP methods
- **Real-time updates** with polling mechanism
- **Responsive UI** built with Tailwind CSS
- **Clean code structure** with separation of concerns
- **Error handling** at every layer
- **Database auto-initialization** on first run

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Rohan Goyal**  
GitHub: [@rohangoyal3012](https://github.com/rohangoyal3012)

---

## 📞 Support

For support or queries:

- Open an issue on GitHub
- Watch the demo video for complete walkthrough
- Check the troubleshooting section above

---

## 🎉 Acknowledgments

- React and Vite teams for excellent tooling
- Express.js community
- MySQL database
- All open-source contributors

---

**⭐ If you find this project useful, please consider giving it a star!**

---

**Made with ❤️ using React, Node.js, and MySQL**
