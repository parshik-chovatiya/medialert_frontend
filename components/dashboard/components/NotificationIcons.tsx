import React from "react";

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
);

export const EmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
);

export const SmsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z" />
    </svg>
);

export const DesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" />
    </svg>
);
