// src/App.jsx
import React from 'react';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
      // h-screen: Altura exacta de la ventana
      // overflow-hidden: Evita que aparezcan barras de scroll laterales/verticales
      <div className="h-screen overflow-hidden bg-black flex flex-col">
        <Navbar />

        {/* flex-1: Ocupa todo el espacio sobrante debajo del Nav */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <LoginPage />
        </main>
      </div>
  );
}

export default App;