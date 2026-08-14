# Spending Tracker

Spending Tracker is a full-stack personal finance application for setting monthly spending targets, recording actual spending, and comparing planned vs actual amounts through a reporting dashboard.

The application supports:

- User authentication
- User-specific spending categories
- Monthly spending plans
- Monthly actual spending
- Date-range reporting
- Plan vs actual variance calculations
- Monthly variance visualization
- Locked months
- PDF report export
- MongoDB Atlas persistence
- Deployed frontend and backend

---

## Live Application

**Frontend:**  

https://spendstracker.netlify.app/

**Backend API:**  
https://spending-tracker-api-fcln.onrender.com/

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS
- jsPDF
- jspdf-autotable

### Backend

- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB Atlas
- JWT authentication
- bcrypt

### Deployment

- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```text
spending-tracker/
│
├── client/
│   ├── public/ 
│   │   └── _redirects
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── routes/
│   │   └── layouts/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── types/
│   │   └── server.ts
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## Features

### Authentication

Users can:

- Sign up with an email and password
- Log in
- Remain authenticated using a JWT
- Access only their own data

Passwords are hashed using bcrypt before being stored.

Protected API routes use authentication middleware to identify the current user.

The current implementation stores the JWT in browser local storage.

---

### Categories

Users can create spending categories such as: 

- Marketing
- Payroll
- Tools
- Operations

Categories are associated with the authenticated user and can be assigned to both plans and actual spending records.

---

### Plans

Users can create monthly spending targets for each category.

Example:

```text
Marketing
January 2026
₹5,000
```

Plans are stored with:

- User
- Category
- Month
- Amount

Plans belonging to locked periods cannot be modified.

---

### Actuals

Users can record actual spending for a category and month.

Each actual entry contains:

- User
- Category
- Month
- Amount
- Optional note

Multiple actual entries can exist for the same category and month. The reporting API aggregates them when generating reports.

---

### Reporting


The report page allows users to select a date range.

Example:

```text
From: January 2026
To: March 2026
```

The report displays:

```text
| Category  | Month        |  Plan   |  Actual | Variance | Variance % |
| --------- | ------------ | ------  | ------  | -------  | ---------  |
| Marketing | January 2026 |  ₹5,000 |  ₹4,800 |    -₹200 |     -4.00% |
| Payroll   | January 2026 | ₹20,000 | ₹20,500 |    +₹500 |     +2.50% |
```

The report also includes:

- Total planned spending
- Total actual spending
- Net variance
- Overall variance percentage
- Monthly variance chart
- Category × month breakdown
- PDF export



---

### Variance Calculation

Variance is calculated as:

```text
Variance = Actual - Plan
```

Therefore:

- Negative variance = under plan
- Positive variance = over plan
- Zero variance = exactly on plan

Example:
```text
Plan:   ₹5,000
Actual: ₹4,800

Variance = ₹4,800 - ₹5,000
         = -₹200
```

---

### Variance Percentage

Variance percentage is calculated as:

```text
((Actual - Plan) / Plan) × 100
```
Example:
```text
Plan:     ₹5,000
Actual:   ₹4,800
Variance: -₹200

Variance % = (-₹200 / ₹5,000) × 100
           = -4.00%
```

**Plan = 0**

When the planned amount is zero, variance percentage is returned as:
```text
N/A
```
This prevents division-by-zero errors and avoids displaying NaN or Infinity.

The API represents this as:
```text
variancePercentage: null
```
The frontend displays N/A.

---

### Missing Actuals

Missing actual spending is treated as:
```text
₹0
```
This means if a category has a plan but no actual entry, the report calculates the variance using zero actual spending.

Example:
```text
Plan:   ₹5,000
Actual: ₹0

Variance: -₹5,000
Variance %: -100%
```
This behavior is consistent throughout the reporting API and UI.

---

### Monthly Reporting

The application provides a monthly dashboard in addition to the date-range report.

The dashboard displays:

- Planned total
- Actual total
- Variance
- Variance percentage
- Category-level breakdown

The month selector allows the user to switch between months.

---

### Locking

The application uses month-level locking.

When a month is locked:

- Plans for that month become read-only
- Actuals for that month become read-only
- Existing data can still be viewed
- Edit/delete operations are rejected by the API

Locking is enforced on the server, not only through the UI.

This is important because hiding an edit button would not provide sufficient protection against direct API requests.

----

### Unlocking

A locked month can be unlocked when a correction or other legitimate change is required.

To maintain accountability, unlocking requires a reason. The unlock information is stored along with the relevant month and user information.

The stored unlock data can later be used to provide an audit history showing who unlocked a month, when it was unlocked, and why.

--- 

### API

The backend exposes REST API endpoints for:

```text
/api/auth
/api/categories
/api/plans
/api/actuals
/api/locks
/api/reports
```

Protected endpoints require a valid JWT in the Authorization header:

```text
Authorization: Bearer <token>
```

Examples:

**Monthly report**
```text
GET /api/reports/2026-01
```
**Range report**
```text
GET /api/reports?from=2026-01&to=2026-03
```
The range report returns:

- Summary totals
- Monthly totals
- Category × month rows

---

## Local Development

### Prerequisites

You will need:

- Node.js
- npm
- MongoDB Atlas account
- Git


### Clone the Repository
```text
git clone <your-github-repository-url>
cd spending-tracker
```


---

### Server Setup

Navigate to the server:
```text
cd server
```
Install dependencies:
```text
npm install
```
Create:
```text
server/.env
```
Add:
```text
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```
Start the development server:
```text
npm run dev
```
The API will run locally on:
```text
http://localhost:5000
```

---

### Client Setup

Open another terminal and navigate to:
```text
cd client
```
Install dependencies:
```text
npm install
```
Create:
```text
client/.env
```
Add:
```text
VITE_API_BASE_URL=http://localhost:5000/api
```
Start the frontend:
```text
npm run dev
```
The frontend will be available at the Vite development URL.

---

### Environment Variables

Server
```text
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```
Client
```text
VITE_API_BASE_URL=http://localhost:5000/api
```
Environment files containing secrets are intentionally excluded from Git.

---

## Deployment

```text
                    ┌─────────────────────┐
                    │       Netlify       │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                               │ HTTPS API requests
                               ▼
                    ┌─────────────────────┐
                    │       Render        │
                    │ Express + Node.js   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB Atlas    │
                    │      Database       │
                    └─────────────────────┘
```

### Frontend

The frontend is configured as a single-page application using React Router.

A Netlify `_redirects` file is included so that direct navigation and browser refreshes on routes such as `/dashboard`, `/reports`, and `/categories` are handled correctly.

The redirect rule is:

```text
/*    /index.html   200
```

The frontend is deployed using Netlify.

Build command:
```text
npm run build
```
The client uses:
```text
VITE_API_BASE_URL=https://<render-api-url>/api
```
as its production API endpoint.

---

### Backend

The backend is deployed using Render.

The production server uses the PORT value provided by Render and connects to MongoDB Atlas using the MONGODB_URI environment variable.

---

### Database

MongoDB Atlas is used for persistent data storage.

The database stores:

- Users
- Categories
- Plans
- Actuals
- Locks

All application records are associated with the relevant authenticated user where appropriate.

---

## Data Isolation

Every authenticated request identifies the current user through the JWT.

Database queries include the authenticated user's ID when accessing user-owned resources.

This ensures one user cannot access another user's:

- Categories
- Plans
- Actuals
- Reports
- Locks

---

## Reporting Data Model

Reports are generated from stored plans and actuals rather than storing pre-calculated report values.

For range reports, data is aggregated using:
```text
categoryId + month
```
This allows multiple plan or actual records for the same category and month to be combined.

Monthly totals are then calculated from the category × month results.

---

## Performance Considerations

The current application is designed for a small-to-medium dataset.

At larger scale, the following indexes would be useful:
```text
Plans:
(userId, month)
(userId, categoryId, month)

Actuals:
(userId, month)
(userId, categoryId, month)

Categories:
(userId)
```
These indexes would improve filtering and aggregation queries as the amount of data grows.

For very large datasets, MongoDB aggregation pipelines could also be used to move more aggregation work into the database rather than loading all records into application memory.

---

## Assumptions and Tradeoffs

### Monthly locking

Month-level locking was chosen instead of quarter-level locking because plans and actuals are already modeled at monthly granularity.

### Missing actuals

Missing actuals are treated as zero. This makes variance calculations straightforward and ensures every planned category can still produce a meaningful variance.

### Plan = 0

Variance percentage is shown as N/A because percentage variance cannot be meaningfully calculated when the denominator is zero.

### Multiple records

Multiple plan or actual records for the same category and month are aggregated in reports.

### Currency

The current UI uses Indian Rupees (₹) and Indian number formatting.

### Date range

Reports use calendar months in YYYY-MM format.

---

## Future Improvements

Potential future improvements include:

- Automated test coverage for all API routes
- More extensive aggregation tests
- Improved authentication/session management
- Password reset functionality
- Email verification
- Rate limiting
- Stronger request validation
- Pagination for large datasets
- CSV import/export
- Report drill-down
- More advanced charts
- Audit history for locked periods
- Production monitoring and logging
- Automated CI/CD checks