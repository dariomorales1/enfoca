import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import AppRouter from './router/AppRouter';
import {AuthProvider} from './contexts/AuthProvider.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';


export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-[#0a0a0a]">

                    {/* 1. El Navbar se queda en la parte superior */}
                    <Navbar/>

                    {/* 2. El 'flex-grow' hace que esta sección se estire y empuje al footer hacia abajo */}
                    <main className="flex-grow flex flex-col">
                        <AppRouter/>
                    </main>

                    {/* 3. El Footer siempre se mantendrá al final de la página */}
                    <Footer/>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}