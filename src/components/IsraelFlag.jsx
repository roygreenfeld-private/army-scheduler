import React from 'react';

/**
 * Inline SVG Israel flag.
 * No external image – guaranteed to always load.
 */
const IsraelFlag = ({ width = 30, height = 20 }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 220 160"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="דגל ישראל"
        style={{ borderRadius: '3px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', display: 'block' }}
    >
        {/* White background */}
        <rect width="220" height="160" fill="#FFFFFF" />
        {/* Top blue stripe */}
        <rect x="0" y="24" width="220" height="28" fill="#0038b8" />
        {/* Bottom blue stripe */}
        <rect x="0" y="108" width="220" height="28" fill="#0038b8" />
        {/* Star of David (Magen David) */}
        <g transform="translate(110,80)" fill="none" stroke="#0038b8" strokeWidth="7">
            <polygon points="0,-26 22.5,13 -22.5,13" />
            <polygon points="0,26 22.5,-13 -22.5,-13" />
        </g>
    </svg>
);

export default IsraelFlag;
