'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  color?: string;
  size?: number;
}

export default function Logo({ className = "", color = "#C1A68D", size = 40 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        {/* Abstract "M" / Arch Shape */}
        <path
          d="M20 80V30L50 20L80 30V80"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M50 20V80"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M35 50H65"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Bottom Base */}
        <rect x="15" y="80" width="70" height="4" rx="2" fill={color} />
      </svg>
      <span 
        className="text-2xl font-black tracking-tighter text-[#2A2723]" 
      >
        MAZAR
      </span>
    </div>
  );
}
