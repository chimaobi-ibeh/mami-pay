# Mami Pay - Fintech Application

Mami Pay is a full-stack fintech application built with Node.js, Express, React, and PostgreSQL. It features a modular monolith architecture, role-based access control, and a professional banking UI.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Wallet Management**: Real-time balance tracking and transaction history.
- **Fund Transfers**: Secure peer-to-peer money transfers.
- **Role-Based Access**: Specialized dashboards for Employees, Vendors, and Admins.
- **Audit Logging**: Comprehensive tracking of system activities for security and compliance.
- **Professional UI**: Clean, modern banking interface using TailwindCSS and Lucide icons.

## Tech Stack

### Backend
- **Node.js & Express.js**: Server-side logic and API development.
- **PostgreSQL**: Relational database for secure data storage.
- **Sequelize**: ORM for database interactions.
- **JWT**: Secure authentication and authorization.
- **Joi**: Request validation.

### Frontend
- **React & Vite**: Modern frontend development.
- **TailwindCSS**: Utility-first CSS framework for professional styling.
- **Lucide React**: Beautiful, consistent iconography.
- **Axios**: HTTP client for API communication.
- **React Router**: Client-side routing.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Docker & Docker Compose (optional)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mami-pay
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Update .env with your database credentials
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Setup
Run the entire stack using Docker Compose:
```bash
docker-compose up --build
```

## Folder Structure

```
mami-pay/
├── backend/
│   ├── src/
│   │   ├── config/       # Database and app configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth and validation middleware
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic and utilities
│   │   └── app.js        # Express app setup
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main application component
│   │   └── main.jsx      # Entry point
│   └── tailwind.config.js
└── docker-compose.yml
```

## License
This project is licensed under the MIT License.
