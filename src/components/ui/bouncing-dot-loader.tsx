import React from "react";

interface BouncingDotLoaderProps {
  size?: number;
  startColor?: string;
  endColor?: string;
  dotCount?: number;
  duration?: number;
}

export function BouncingDotLoader({
  size = 60,
  startColor = "#3498db",
  endColor = "#e74c3c",
  dotCount = 5,
  duration = 1000,
}: BouncingDotLoaderProps) {
  const dotSize = size / (dotCount * 2);
  const dots = Array.from({ length: dotCount }, (_, i) => i);

  const getColor = (index: number) => {
    const ratio = index / (dotCount - 1);
    const r = Math.round(
      parseInt(startColor.slice(1, 3), 16) * (1 - ratio) +
        parseInt(endColor.slice(1, 3), 16) * ratio
    );
    const g = Math.round(
      parseInt(startColor.slice(3, 5), 16) * (1 - ratio) +
        parseInt(endColor.slice(3, 5), 16) * ratio
    );
    const b = Math.round(
      parseInt(startColor.slice(5, 7), 16) * (1 - ratio) +
        parseInt(endColor.slice(5, 7), 16) * ratio
    );
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div
      className="flex items-center justify-center space-x-2"
      style={{ height: size }}
    >
      {dots.map((dot) => (
        <div
          key={dot}
          className="animate-bounce rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: getColor(dot),
            animationDuration: `${duration}ms`,
            animationDelay: `${(duration / dotCount) * dot}ms`,
          }}
        />
      ))}
    </div>
  );
}
