import React from "react";

export default function Input({ label, type = 'text', placeholder, rightElement, ...props}) {
    return (
        <div className="space -y -1.5">
            <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-300">
                    {label}
                </label>
                {rightElement && rightElement}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full bg-[#111111] border border-neutral-800 rounded-lg px-3 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                {...props}
            />
        </div>
    );
}