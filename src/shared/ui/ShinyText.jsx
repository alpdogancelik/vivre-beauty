import React from 'react';

export default function ShinyText({ text, disabled = false, speed = 5, className = '', gradient }) {
    const style = {
        ...(gradient ? { backgroundImage: gradient } : {}),
        animationDuration: `${speed}s`,
    };
    return (
        <span
            className={`shiny-text ${disabled ? '' : 'animate-shine'} ${className}`.trim()}
            style={style}
        >
            {text}
        </span>
    );
}
