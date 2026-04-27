// src/components/common/SplitCardLayout.jsx
import React from 'react';

export default function SplitCardLayout({ children, graphicContent, invertOrder = false }) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-black">


            <div className={`
                    flex max-w-6xl w-full h-[80vh] max-h-[720px]
                    bg-black border border-neutral-800 rounded-2xl 
                    overflow-hidden shadow-2xl transition-all
                    ${invertOrder ? 'flex-row-reverse' : 'flex-row'}
                `}>


                <div className="w-1/2 flex items-center justify-center p-8 lg:p-10 overflow-y-auto">
                    <div className="w-full max-w-sm">
                        {children}
                    </div>
                </div>


                <div className="w-1/2 relative h-full bg-neutral-900 border-neutral-800/50 overflow-hidden">
                    {graphicContent}
                </div>

            </div>
        </div>
    );
}