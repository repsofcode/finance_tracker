# Finance Tracker

A full-stack personal finance tracking web application built with the MERN stack. Users can register, log in, set a monthly budget, track expenses by category, and view a real-time spending summary.

**Live Demo:** [financetracker-two-kappa.vercel.app](https://financetracker-two-kappa.vercel.app)

---

## Features

- User registration and login with JWT authentication
- Access token + refresh token with automatic rotation
- Set and update monthly budget
- Add, edit, and delete expenses
- Filter expenses by month and category
- Real-time spending summary with status (Comfortable / Tight / Difficult / Overspending)
- Budget progress bar showing percentage used
- Protected routes — dashboard and expenses require login
- Fully deployed — backend on Render, frontend on Vercel

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- cookie-parser (httpOnly cookie support)
- cors
- dotenv

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Context API (global auth state)

---

## Project Structure

```
finance-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── summarybudgetcontroller.js
│   │   └── updatebudgetcontroller.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── utils/
│   │   └── jwt.js
│   ├── server.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   └── PrivateRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Expenses.jsx
    │   │   ├── AddExpense.jsx
    │   │   ├── EditExpense.jsx
    │   │   └── BudgetSettings.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── .env
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout and revoke refresh token |

### Expenses (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (filter by month/category) |
| POST | `/api/expenses` | Add a new expense |
| GET | `/api/expenses/:id` | Get a single expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

### Budget (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/budget` | Set or update monthly budget |
| GET | `/api/budget/summary` | Get spending summary for a month |

---

## Authentication Flow

1. User registers or logs in
2. Backend returns an **access token** (20 min) in the response body
3. Backend sets a **refresh token** (14 days) in an httpOnly cookie
4. Every API request automatically attaches the access token via Axios interceptor
5. When the access token expires, the Axios response interceptor calls `/auth/refresh`
6. A new token pair is issued and the old refresh token is rotated (deleted from DB)
7. If refresh token is also expired, user is redirected to login

---

## Environment Variables

### Backend `.env`
```
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Running Locally

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

- **Backend** — Render (Web Service, Node runtime)
- **Frontend** — Vercel (Vite auto-detected)
- **Database** — MongoDB Atlas (free tier)

---

## Security Highlights

- Passwords hashed with bcryptjs (12 salt rounds)
- Refresh tokens stored in httpOnly cookies (XSS protection)
- Refresh token rotation on every use
- Access token excluded from cookies to prevent CSRF
- Password field excluded from all database queries (`select: false`)
- CORS restricted to frontend URL only
- Input validation on all endpoints

---

## Author

Built by Harsh — [github.com/repsofcode](https://github.com/repsofcode)
