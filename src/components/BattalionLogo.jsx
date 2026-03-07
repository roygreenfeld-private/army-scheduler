import React from 'react'; // Force Vite HMR reload v3

/**
 * Battalion 749 emblem — pure inline SVG (no external image dependency).
 * To use the real badge: copy the image to src/assets/battalion749.png
 * and swap the SVG for <img src={battalionImg} ... />
 */
const BattalionLogo = ({ size = 80 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="סמל גדוד 749"
    >
        <defs>
            <linearGradient id="shield749" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b1c1c" />
                <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <radialGradient id="burst749" cx="50%" cy="45%" r="30%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
        </defs>

        {/* Shield body */}
        <path
            d="M50 3 L93 18 L93 62 Q93 88 50 103 Q7 88 7 62 L7 18 Z"
            fill="url(#shield749)"
            stroke="#7f1d1d"
            strokeWidth="1.5"
        />

        {/* Yellow starburst / explosion */}
        <polygon
            points="50,22 53,30 61,28 57,36 65,38 57,42 61,50 53,47 50,55 47,47 39,50 43,42 35,38 43,36 39,28 47,30"
            fill="url(#burst749)"
            opacity="0.95"
        />

        {/* Sword blade */}
        <line x1="50" y1="16" x2="50" y2="66" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* Sword guard (crossguard) */}
        <line x1="42" y1="38" x2="58" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sword pommel */}
        <circle cx="50" cy="66" r="3" fill="white" />

        {/* Rocky terrain at bottom-left */}
        <path d="M7 75 Q18 60 28 68 Q20 75 15 80 Q10 82 7 80 Z" fill="#292524" opacity="0.85" />

        {/* Castle tower at bottom-right */}
        <rect x="65" y="62" width="20" height="22" rx="1" fill="#60a5fa" opacity="0.9" />
        <rect x="63" y="58" width="5" height="7" rx="1" fill="#60a5fa" opacity="0.9" />
        <rect x="71" y="58" width="5" height="7" rx="1" fill="#60a5fa" opacity="0.9" />
        <rect x="79" y="58" width="5" height="7" rx="1" fill="#60a5fa" opacity="0.9" />

        {/* "749" text */}
        <text
            x="50" y="98"
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="900"
            fontFamily="Arial Black, Arial, sans-serif"
            letterSpacing="1.5"
        >
            749
        </text>
    </svg>
);

export default BattalionLogo;
