// Lightweight fallback UI kit — minimal Tailwind utility styles
// Provides Button, Card, Slider.

import React from "react";

// -------------------- Button --------------------
export function Button({ variant = "default", size = "base", className = "", children, ...rest }) {
    const base =
        "inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants = {
        default: "bg-stone-900 text-stone-50 hover:bg-stone-800 ring-stone-900",
        outline: "border border-stone-300 text-stone-900 hover:bg-stone-100 ring-stone-300",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        base: "px-4 py-2 text-sm",
    };
    return (
        <button {...rest} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`.trim()}>
            <span className="shiny-text animate-shine">{children}</span>
        </button>
    );
}

// -------------------- Card --------------------
export function Card({ children, className = "" }) {
    return <div className={`rounded-lg border border-stone-200 bg-white ${className}`}>{children}</div>;
}
export const CardHeader = ({ children, className = "" }) => (
    <div className={`p-4 border-b border-stone-200 ${className}`}>{children}</div>
);
export const CardTitle = ({ children, className = "" }) => (
    <h3 className={`font-semibold text-stone-900 ${className}`}>{children}</h3>
);
export const CardDescription = ({ children, className = "" }) => (
    <p className={`text-xs text-stone-500 ${className}`}>{children}</p>
);
export const CardContent = ({ children, className = "" }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

// -------------------- Slider --------------------
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className = "" }) {
    return (
        <input
            type="range"
            value={value[0]}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onValueChange([Number(e.target.value)])}
            className={`w-full accent-stone-900 ${className}`}
        />
    );
}

export default Button;
