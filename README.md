# Spending Tracker

A full-stack spending tracker where users can define monthly spending targets,
record actual spending, and compare planned vs actual spending through reports.

The application is being built as part of a technical assignment focused on:

- Authentication and authorization
- User-scoped data
- Time-series/monthly data modeling
- Plan vs actual aggregation
- Variance calculations
- Locked accounting periods
- Reporting and visualization

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Backend

- Node.js
- Express
- TypeScript
- Mongoose

### Database

- MongoDB Atlas

### Authentication

- bcrypt for password hashing
- JSON Web Tokens (JWT) for authentication
- Express middleware for protected routes

### Deployment

- Frontend: Netlify
- Backend: TBD
- Database: MongoDB Atlas

---

# Project Structure

The repository is currently split into two applications:

```text
/
├── client/          # React frontend
│
├── server/          # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```