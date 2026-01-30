import React from 'react';

const BadgeIcon = ({ type = 'Gold', size = 48, className = "" }) => {
    // Colors
    const colors = {
        Gold: {
            main: "#FFD700",
            shadow: "#B8860B",
            ribbon: "#ef4444", // Red
            ribbonDark: "#b91c1c",
            star: "#FFF"
        },
        Silver: {
            main: "#C0C0C0",
            shadow: "#A9A9A9",
            ribbon: "#3b82f6", // Blue
            ribbonDark: "#1d4ed8",
            star: "#FFF"
        },
        Bronze: {
            main: "#CD7F32",
            shadow: "#8B4513",
            ribbon: "#10b981", // Green
            ribbonDark: "#047857",
            star: "#FFF"
        }
    };

    const c = colors[type] || colors.Gold;
    const s = size;

    return (
        <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Ribbons */}
            <path d="M20 70 L30 95 L50 85 L70 95 L80 70" fill={c.ribbon} />
            <path d="M30 95 L50 85 L35 75 Z" fill={c.ribbonDark} opacity="0.5" />
            <path d="M70 95 L50 85 L65 75 Z" fill={c.ribbonDark} opacity="0.5" />

            {/* Outer Circle (Medal Body) */}
            <circle cx="50" cy="50" r="30" fill={c.main} />
            <circle cx="50" cy="50" r="30" fill="url(#gradient)" opacity="0.3" />
            
            {/* Inner Ring */}
            <circle cx="50" cy="50" r="24" fill="none" stroke={c.shadow} strokeWidth="2" opacity="0.5" />
            
            {/* Star */}
            <path d="M50 35 L54 46 H66 L57 53 L60 64 L50 57 L40 64 L43 53 L34 46 H46 Z" fill={c.star} filter="url(#glow)" />

            {/* Definitions */}
            <defs>
                <linearGradient id="gradient" x1="20" y1="20" x2="80" y2="80">
                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="black" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
        </svg>
    );
};

export default BadgeIcon;
