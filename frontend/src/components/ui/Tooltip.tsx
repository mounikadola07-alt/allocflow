"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  maxWidth?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 120,
  className = "",
  maxWidth = "max-w-xs",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-[999] pointer-events-none ${positionClasses[position]} ${maxWidth} w-max animate-in fade-in zoom-in-95 duration-150 ease-out`}
        >
          <div className="rounded-lg bg-ink-black/95 px-2.5 py-1.5 text-[11px] font-mono font-medium text-beige-bg shadow-2xl border border-white/10 backdrop-blur-sm text-left leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export function InfoTooltip({
  content,
  position = "top",
  size = "sm",
}: {
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  size?: "xs" | "sm";
}) {
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center text-muted-foreground/60 hover:text-ink-black transition-colors cursor-help p-0.5 rounded">
        <Info className={iconSize} />
      </span>
    </Tooltip>
  );
}
