import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecoverAccountPage from './pages/RecoverAccountPage';
import {AuthProvider} from './contexts/AuthProvider';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="h-screen overflow-hidden bg-black flex flex-col font-sans text-white">

                    <Navbar/>

                    <main className="flex-1 flex flex-col min-h-0">
                        <Routes>
                            <Route path="/" element={<LandingPage/>}/>

                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/register" element={<RegisterPage/>}/>
                            <Route path="/recover" element={<RecoverAccountPage/>}/>
                        </Routes>
                    </main>

                    <Footer/>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;