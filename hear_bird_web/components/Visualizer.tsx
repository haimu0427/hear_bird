import React, { useEffect, useState } from 'react';

interface VisualizerProps {
  isListening: boolean;
}

export const Visualizer: React.FC<VisualizerProps> = ({ isListening }) => {
  const [heights, setHeights] = useState<number[]>(Array(15).fill(10));

  useEffect(() => {
    if (!isListening) {
      setHeights(Array(15).fill(10)); // Reset to low idle state
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.max(10, Math.random() * 80)));
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="flex items-center justify-center gap-[4px] h-20 w-full mb-8 opacity-90">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ease-in-out ${
            i === 7 ? 'bg-primary shadow-[0_0_15px_rgba(19,236,91,0.6)]' : 'bg-primary'
          }`}
          style={{ 
            height: `${isListening ? h : [20, 30, 25, 40, 50, 30, 60, 80, 50, 55, 40, 20, 30, 15, 10][i]}%`,
            opacity: isListening ? 1 : Math.max(0.2, 1 - (Math.abs(7 - i) * 0.1))
          }}
        ></div>
      ))}
    </div>
  );
};
