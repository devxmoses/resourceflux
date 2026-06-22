# Resource Flux

Resource Flux is a resource management platform that helps teams plan, schedule, and track shared resources. It focuses on core resource workflows such as allocation, availability tracking, scheduling, and basic analytics.

## Overview

This repository contains a full-stack reference implementation (React frontend + Node/Express backend) for resource management features including user authentication, resource CRUD, scheduling primitives, and reporting.

## Tech Stack

- **Frontend:** React.js, Redux/Context API
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, cookie-based tokens
- **API:** RESTful APIs

## What the app currently implements

- User authentication (email/password, Google OAuth)
- Registration, email verification, password reset
- Basic user roles (user, admin)
- API scaffolding for resource and scheduling modules

## Planned work (concise and relevant)

- Resource allocation (create/list/update/delete resources)
- Scheduling engine / bookings
- Role-based access control for resource operations
- Dashboard with usage metrics
- Integrations (webhooks, calendar sync)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation
```bash
# Clone the repository
git clone https://github.com/devxmoses/resourceflux.git

# Navigate to project directory
cd resourceflux

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (if present)
cd ../client
npm install
```

## Running the Application
```bash
# Run backend (from backend directory)
npm run dev

# Run frontend (from client directory)
npm start
```

## Project structure
```
resourceflux/
├── client/                 # React frontend (if present)
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
└── README.md
```

## Contributing

Contributions welcome — open an issue or pull request. Keep changes focused and include tests for new features when possible.

## Contact

For questions or support: mosesoparah@gmail.com

---
