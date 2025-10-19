import React from "react";

// Full HD Frame wrapper component
export default function FullHDFrame({ children, className = "" }) {
    return (
        <div className={`fullhd-frame ${className}`}>
            {children}
        </div>
    );
}
