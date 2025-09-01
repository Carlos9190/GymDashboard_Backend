# GymDashboard Backend

## Description

This is the backend for the **GymDashboard** project, providing a secure RESTful API for managing gym routines, exercises, user accounts, and workout records. It supports authentication, password recovery, image uploads, and integrates with the frontend for a seamless user experience.

---

## Technologies Used

- **MongoDB & Mongoose** – NoSQL database and ODM
- **Express.js** – REST API framework
- **Node.js** – JavaScript runtime
- **TypeScript** – Type safety
- **JSON Web Tokens (JWT)** – Authentication
- **Nodemailer** – Email service (account confirmation, password reset)
- **Bcrypt** – Password hashing
- **Cloudinary** – Image upload and management
- **Formidable** – File upload parsing
- **Colors** – Console output styling
- **dotenv** – Environment variable management
- **CORS** – Cross-origin resource sharing

---

## Features

- **User Authentication**: Register, login, JWT-based sessions, account confirmation via email token.
- **Password Recovery**: Request password reset, validate token, update password.
- **Profile Management**: Update profile info, change password.
- **Routine Management**: Create, edit, delete routines; assign exercises.
- **Exercise Management**: CRUD for exercises, image upload via Cloudinary, assign to routines.
- **Workout Records**: Add, edit, delete records for exercises; pagination support.
- **Validation & Error Handling**: Input validation, custom error responses.
- **API Documentation**: Postman collection available in the `collections` folder.

---

## Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Carlos9190/GymDashboard_Backend.git
cd GymDashboard_Backend
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Configure environment variables

Create a `.env` file in the root directory. See `.env.example` for required variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## Usage

### Start the Server

For API-only development (Postman testing):

```bash
npm run dev:api
```

For full application usage:

```bash
npm run dev
```

---

## API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/confirm-account`, `/api/auth/request-code`, `/api/auth/forgot-password`, `/api/auth/validate-token`, `/api/auth/update-password/:token`, `/api/auth/profile`, `/api/auth/update-password`, `/api/auth/user`
- **Exercises**: `/api/exercises` (CRUD, image upload, assign to routines)
- **Routines**: `/api/routines` (CRUD, assign exercises)
- **Records**: `/api/exercises/:exerciseId/records` (CRUD, pagination)

See the Postman collection in the `collections` folder for full documentation.

---

Developed by **[Carlos Ibarra](https://github.com/Carlos9190)** and **[Elkin Carreño](https://github.com/elkincarreno10)**.

- [Frontend Repository](https://github.com/Carlos9190/GymDashboard_Frontend)
