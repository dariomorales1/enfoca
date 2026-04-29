import React from 'react';

export default function SplitCardLayout({children, graphicContent, invertOrder = false}) {
    return (
        <div className="h-full w-full flex items-center justify-center p-4 bg-black">

            <div className={`
                flex w-full max-w-5xl h-[80%] max-h-[580px] min-h-[450px]
                bg-black border border-neutral-800 rounded-2xl 
                overflow-hidden shadow-2xl transition-all duration-500
                ${invertOrder ? 'flex-row-reverse' : 'flex-row'}
            `}>


                <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-4">
                    <div className="w-full max-w-sm flex flex-col justify-between h-full max-h-[500px]">
                        {children}
                    </div>
                </div>

                <div className={`
                  w-1/2 relative hidden lg:block bg-neutral-900
                  ${invertOrder ? 'border-r border-neutral-800/50' : 'border-l border-neutral-800/50'}
                `}>
                    {graphicContent}
                </div>

            </div>
        </div>
    );
}