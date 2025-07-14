# MCO2 - Lab Reservation System

## Project Overview

This project features phase 2 of the lab reservation system. Complete with both front-end and back-end features, the web-based application allows for easier management and reservation of the school laboratories. It provides various features for students and lab technicians alike.

## Features

- **User Registration and Login**
  - Students and technicians must register and log in using their DLSU email.
  - Utilizes different email formats for students (i.e., firstname_lastname@dlsu.edu.ph) and technicians (i.e., firstname.lastname@dlsu.edu.ph)

- **Lab Reservation**
  - Students can view available labs and reserve specific seats for a given timeslot.
  - Technicians can add walk-in reservations and manage all reservations.

- **Profile Management**
  - Users can edit their profile information after creation.

## Prerequisites

- [Node.js](https://nodejs.org/) 
- [MongoDB](https://www.mongodb.com/)

## Installation

1. **Install dependencies:**
   Install the required dependencies by running the following command on your command prompt:
   ```sh
   npm install express express-session mongoose hbs
   ```

2. **Run the server:**
   ```sh
   node server.js
   ```


