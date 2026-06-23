# Resolva 

> Transforming campus issue management through real-time tracking, intelligent workflows, and seamless collaboration.

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Express](https://img.shields.io/badge/Express.js-API-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Live Demo

🔗 https://resolva-rkct.vercel.app/

---

## Overview

Resolva is a modern full-stack MERN application designed to streamline campus issue management and communication between students and administrators.

Traditional complaint systems often suffer from delayed responses, poor visibility, and fragmented communication. Resolva addresses these challenges by providing a centralized platform where users can report issues, track their status in real time, and receive transparent updates throughout the resolution process.

The platform focuses on accountability, efficiency, and user experience while delivering a clean, responsive, and intuitive interface.

---

## Key Features

### Secure Authentication
- JWT-based authentication
- Protected routes
- Role-based access control
- Secure password handling

### Issue Management
- Create and submit complaints
- Categorize issues efficiently
- Attach detailed descriptions
- Track issue progress

### Interactive Dashboard
- Centralized issue monitoring
- Status-wise complaint tracking
- Visual insights and analytics
- User-friendly dashboard experience

### Role-Based Access
#### Student
- Raise new complaints
- View personal complaints
- Track complaint status
- Receive updates

#### Admin
- Manage all complaints
- Update issue status
- Review reported issues
- Monitor overall platform activity

#### Staff
- View assigned complaints
- Update issue progress
- Mark issues as resolved
- Add remarks and resolution details
- Manage department-specific tasks

### Real-Time Experience
- Instant updates
- Dynamic interface
- Faster communication workflow

### Responsive Design
- Mobile-friendly
- Tablet-friendly
- Desktop optimized

---

## System Architecture

```text
Frontend (React + Vite)
        │
        ▼
Backend API (Node.js + Express)
        │
        ▼
      MongoDB
```

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT
- bcryptjs

### Deployment
- Vercel
- MongoDB Atlas

---

## Project Structure

```text
Resolva
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── sockets
│   ├── utils
│   ├── app.js
│   └── server.js
│
└── README.md
```

---

## Getting Started

### Clone Repository

```bash
git clone <your-repository-url>
```

### Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

### Configure Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
```

### Run Development Server

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm run dev
```

---

## Problem Statement

Managing campus issues often involves:

- Lack of transparency
- Slow communication
- No centralized tracking
- Difficulty monitoring progress

Resolva provides a structured workflow that enables users to report, track, and manage issues efficiently while maintaining accountability throughout the process.

---

## Screenshots
<img width="1918" height="913" alt="image" src="https://github.com/user-attachments/assets/72a1267d-1a93-44cf-995f-d363a818630e" />

---

## What I Learned

While building Resolva, I gained hands-on experience with:

- Full-stack MERN development
- Authentication & authorization
- REST API design
- MongoDB data modeling
- State management
- Frontend-backend integration
- Deployment workflows
- Building scalable project structures

---
