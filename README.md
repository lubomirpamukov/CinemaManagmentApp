# 🎬 Cinema Management System
This project is designed to manage multiple cinema locations, allowing administrators to create hall layouts, manage movies, and schedule projections.
* It consists of two main components:
* Back-End: A RESTful Web API built with Node.js and Express.
* Front-End: An admin dashboard built with React.

## 🧩 Tech Stack
The system is built using the MERN stack (MongoDB, Express, React, Node.js), providing hands-on experience with:
* Building and designing RESTful APIs
* Structuring scalable applications following enterprise architecture principles
* Implementing the Service–Controller pattern for better maintainability

## ⚙️ Features

Cinema management: Create and manage multiple cinema branches and halls
* Movie management: Add, update, and organize movies
* Projection scheduling: Manage movie showtimes and hall assignments
* Global error handling: Custom error middleware for consistent API responses
* Automated testing: Unit tests written with Jest, using a dedicated test database that is cleaned after each run

## 🎯 Purpose

This project was built to:
* Strengthen understanding of the **MERN** stack fundamentals
* Gain practical experience in REST API design and backend testing
* Explore enterprise-level project structure and best practices

## 🚀 Prerequisites
Before running the project, make sure you have the following installed:
* Node.js v20+
* MongoDB v8
* npm (comes with Node.js)
* dotenv
* Optional: Git


## 🖥️ Backend (Web API)
### 1️⃣ Install Dependencies
Open a terminal, navigate to the WEBAPI directory, and run:
` cd WEBAPI `
` npm install `

###2️⃣ Configure Environment Variables
Open the .env file in the WEBAPI directory and update the constants:
 ``` env
# Server configuration
SERVER_HOSTNAME='localhost'
SERVER_PORT='3000'

# MongoDB configuration
MONGO_USER='your_mongo_user'
MONGO_PASSWORD='your_mongo_password'
MONGO_URL='your_mongo_host_url'
MONGO_DATABASE='your_database_name'

# JWT configuration
JWT_SECRET='your_jwt_secret_key'
```
Tip: Keep your .env file secure and never commit it to version control.

### 3️⃣ Run the Backend
` npm run dev `
Your backend API will be available at:
` http://SERVER_HOSTNAME:SERVER_PORT `



## 🌐 Frontend (React App)
### 1️⃣ Install Dependencies
Open a terminal, navigate to the frontend directory (commonly client or frontend), and run:
` cd client `
` npm install `
or, if you use yarn:
` yarn install `
