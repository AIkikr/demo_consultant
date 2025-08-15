import { useEffect, useState } from "react";

interface AudioVisualizerProps {
  audioLevel?: number;
  barCount?: number;
}

export function AudioVisualizer({ audioLevel = 0, barCount = 5 }: AudioVisualizerProps) {
  const [animatedBars, setAnimatedBars] = useState<number[]>(new Array(barCount).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBars(prev => 
        prev.map(() => Math.random() * (audioLevel * 100) + 20)
      );
    }, 150);

    return () => clearInterval(interval);
  }, [audioLevel]);

  return (
    <div className="flex items-center space-x-1" data-testid="audio-visualizer">
      {animatedBars.map((height, index) => (
        <div
          key={index}
          className="w-1 bg-red-400 rounded-full transition-all duration-150"
          style={{ 
            height: `${Math.max(height, 16)}px`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
}
