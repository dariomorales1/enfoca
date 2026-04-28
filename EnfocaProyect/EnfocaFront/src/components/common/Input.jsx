// src/components/common/Input.jsx
export default function Input({label, type = 'text', placeholder, rightElement, ...props}) {
    return (
        <div className="flex flex-col gap-1"> {/* Eliminamos space-y fijo */}
            <div className="flex justify-between items-center">
                <label className="text-[10px] lg:text-xs font-medium text-neutral-400">
                    {label}
                </label>
                {rightElement}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                /* Padding dinámico: py-[clamp(0.4rem,1vh,0.75rem)]
                   Texto dinámico: text-[clamp(0.75rem,0.9vh,0.875rem)]
                */
                className="w-full bg-[#111111] border border-neutral-800 rounded-lg
                           px-3 py-[clamp(0.4rem,1vh,0.75rem)]
                           text-[clamp(0.75rem,0.9vh,0.875rem)]
                           text-white placeholder-neutral-700 focus:outline-none
                           focus:border-violet-500 transition-all"
                {...props}
            />
        </div>
    );
}