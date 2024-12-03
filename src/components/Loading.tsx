import { BouncingDotLoader } from "@/components/ui/bouncing-dot-loader";

interface LoadingProps {
  message?: string;
  size?: number;
  startColor?: string;
  endColor?: string;
  dotCount?: number;
  duration?: number;
}

export function Loading({
  message = "Loading...",
  size = 60,
  startColor = "#3498db",
  endColor = "#e74c3c",
  dotCount = 5,
  duration = 1000,
}: LoadingProps) {
  return (
    <div
      className="flex flex-col items-center justify-center space-y-4 p-4"
      role="status"
    >
      <BouncingDotLoader
        size={size}
        startColor={startColor}
        endColor={endColor}
        dotCount={dotCount}
        duration={duration}
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}
