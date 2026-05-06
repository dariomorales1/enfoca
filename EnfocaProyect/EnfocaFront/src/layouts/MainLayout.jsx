import React from 'react';
import Sidebar from '../components/common/Sidebar';

export default function MainLayout({children}) {
    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* 1. Sidebar fijo a la izquierda */}
            <Sidebar/>

            {/* 2. Contenedor del contenido principal (Dashboard, Pomodoro, etc.) */}
            <main className="flex-grow flex flex-col overflow-hidden">
                <div className="p-4 lg:p-8 w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}