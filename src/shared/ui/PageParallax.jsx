import React from "react";

// Page parallax effect component
export default function PageParallax({ children, speed = 0.5, className = "" }) {
    return (
        <div className={`parallax-container ${className}`} data-speed={speed}>
            {children}
        </div>
    );
}
