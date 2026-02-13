## FinEdge Backend – Senior Assignment Skeleton

This repository is a **starter skeleton** for the FinEdge backend assignment for **senior backend developers**.
It includes a suggested architecture, boilerplate setup, and TODOs for students to complete.

### Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Jest** + **Supertest** for tests

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your `.env` file in the project root (use these keys):

```bash
PORT=4000
DB_CONNECTION=mongodb+srv://user:13pbelieber3030@mycluster.sstep5o.mongodb.net/?appName=MyCluster
DB_NAME=test
JWT_SECRET=supersecretjwtkey
LOG_FILE_PATH=logs/requests.log
```

> Replace values as needed. **Never commit your real `.env` to Git.**

3. Run in development mode:

```bash
npm run dev
```

4. Run tests:

```bash
npm test
```

### High-Level TODOs for Students

- Implement MongoDB connection in `src/config/db.js`.
- Implement env loading and validation in `src/config/env.js`.
- Design `User`, `Transaction`, and optional `Budget` models.
- Implement controllers, services, and routes for:
  - `/health`
  - `/users` (registration)
  - `/login`
  - `/transactions` CRUD
  - `/summary`
- Implement:
  - JWT-based auth middleware
  - Global error-handling middleware
  - Request logging middleware (console + file via `fs/promises`)
  - Transaction validation middleware
- Add custom error classes and use them in services.
- Use async/await consistently for DB and file I/O.
- Write tests in the `tests/` folder for core endpoints.

Refer to the assignment specification for full requirements.


