// src/App.jsx
import React from 'react';
import Navbar from './components/common/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage.jsx";
import RecoverAccountPage from "./pages/RecoverAccountPage.jsx";

function App() {
  return (
      <Router>
          <div className="h-screen overflow-hidden bg-black flex flex-col font-sans text-white">
              <Navbar />

              <main className="flex-1 flex flex-col overflow-hidden">
                  <Routes>
                      {/* Redirigir la raíz al login por defecto */}
                      <Route path="/" element={<Navigate to="/login" replace />} />

                      {/* Nuestras 3 páginas de autenticación */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/recover" element={<RecoverAccountPage />} />
                  </Routes>
              </main>
          </div>
      </Router>
  );
}

export default App;