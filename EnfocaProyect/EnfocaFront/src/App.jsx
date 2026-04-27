// src/App.jsx
import React from 'react';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage.jsx";
import RecoverAccountPage from "./pages/RecoverAccountPage.jsx";

function App() {
  return (
      <div className="h-screen overflow-hidden bg-black flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col overflow-hidden">
            <RecoverAccountPage />
        </main>
      </div>
  );
}

export default App;