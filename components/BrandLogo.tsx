'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  color?: string;
  className?: string;
  showText?: boolean;
  subText?: string;
}

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
  '2xl': 100,
};

export default function BrandLogo({
  size = 'lg',
  color = '#D8163F',
  className = '',
  showText = false,
  subText = '',
}: BrandLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 64;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Official Transparent IX Monogram (Using CSS Alpha Mask for crisp scalable color) */}
      <div className="relative group cursor-default">
        <div
          className="transition-transform duration-300 group-hover:scale-105 active:scale-95"
          style={{
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
            backgroundColor: color,
            WebkitMaskImage: 'url(/images/logo/ix-logo-nobg.png)',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskImage: 'url(/images/logo/ix-logo-nobg.png)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
          aria-label="HENRY IX Logo"
          role="img"
        />
      </div>

      {showText && (
        <div className="mt-3 text-center">
          <div className="font-avathe text-xl tracking-wider text-white font-bold leading-none">
            HENRY IX
          </div>
          {subText && (
            <div className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase mt-1">
              // {subText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
