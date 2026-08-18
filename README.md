# GupShup Chat 💬

GupShup Chat is a full-stack real-time messaging application built using the MERN stack. It allows users to sign up, log in, and engage in real-time conversations seamlessly.

## 🚀 Key Features

- **User Authentication:** Secure Signup and Login functionality with JWT.
- **Real-Time Chat:** Instant messaging powered by Socket.io.
- **Route Protection:** Secure pages that are accessible only to authenticated users.
- **Responsive UI:** Modern, clean, and mobile-friendly design using Tailwind CSS.
- **User Management:** Easy logout and profile session management.
- **Deployment:** Fully deployed and accessible online.

## 🛠️ Tech Stack

### Frontend:

- React.js (Vite)
- Tailwind CSS
- Axios (for API requests)
- React Router (for navigation)

### Backend:

- Node.js
- Express.js
- Socket.io (for real-time features)

### Database & Deployment:

- Database: MongoDB
- Frontend Hosting: Vercel
- Backend Hosting: Render

## ⚙️ Installation & Setup

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone [https://github.com/Luckygautam02/gupshup-chat.git]
   cd gupshup-chat

   ```

2. Setup Backend:

````bash
  cd backend
  npm install
  # Create a .env file and add your MONGO_URI, JWT_SECRET, etc.
  node server.js

3. Setup Frontend
```bash
  cd frontend
  npm install
  # Configure your API URL in .env
  npm run dev
````
