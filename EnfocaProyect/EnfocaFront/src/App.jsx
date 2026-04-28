// src/App.jsx
import React from 'react';
import Navbar from './components/common/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage.jsx";
import RecoverAccountPage from "./pages/RecoverAccountPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Footer from "./components/common/Footer.jsx";

function App() {
  return (
      <Router>
          {/* min-h-screen asegura que el fondo negro cubra todo,
          pero permite que la página crezca más allá de la pantalla */}
          <div className="min-h-screen bg-black flex flex-col font-sans text-white">

              <Navbar />

              {/* Eliminamos h-screen y overflow-hidden de aquí */}
              <main className="flex-1">
                  <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/recover" element={<RecoverAccountPage />} />
                  </Routes>
              </main>

              <Footer />
          </div>
      </Router>
  );
}

export default App;