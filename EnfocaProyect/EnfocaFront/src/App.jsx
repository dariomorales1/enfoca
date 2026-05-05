import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecoverAccountPage from './pages/RecoverAccountPage';
import DashboardPage from './pages/DashboardPage';
import StudyPlanPage from './pages/StudyPlanPage';
import { AuthProvider } from './contexts/AuthProvider';

function PublicLayout({ children }) {
    return (
        <div className="h-screen overflow-hidden bg-black flex flex-col font-sans text-white">
            <Navbar />
            <main className="flex-1 flex flex-col min-h-0">{children}</main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
                    <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                    <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
                    <Route path="/recover" element={<PublicLayout><RecoverAccountPage /></PublicLayout>} />

                    {/* Protected routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="study-plans" element={<StudyPlanPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
