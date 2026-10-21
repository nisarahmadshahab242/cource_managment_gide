# CourseFlow — Course Management System

## Requirements

- Java 21
- MySQL 8.x or compatible MariaDB
- Node.js 20+
- Internet access for first Maven/npm dependency downloads

## Database

Create the database in MySQL or phpMyAdmin:

CREATE DATABASE course_db;

Default configuration:

- Host: localhost
- Port: 3306
- Username: root
- Password: empty

Edit backend/src/main/resources/application.properties
if your MySQL credentials differ.

## Run backend

Open a terminal in backend:

.\mvnw.cmd spring-boot:run

API:
http://localhost:8080/api/v1/courses

## Run frontend

Open another terminal in frontend:

npm install
npm run dev

Open:
http://localhost:5173

## API endpoints

GET /api/v1/courses
GET /api/v1/courses/{id}
POST /api/v1/courses
PUT /api/v1/courses/{id}
DELETE /api/v1/courses/{id}

Course fields:

- code
- title
- credits
- instructor
- department
