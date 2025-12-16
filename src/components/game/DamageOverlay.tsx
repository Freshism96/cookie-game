import React, { useEffect, useState, useRef } from 'react';

interface DamageOverlayProps {
  invincibleTimer: number;
}

export const DamageOverlay: React.FC<DamageOverlayProps> = ({ invincibleTimer }) => {
  const [opacity, setOpacity] = useState(0);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDamageRef = useRef(0);

  useEffect(() => {
    // Only trigger when new damage occurs (invincibleTimer resets to 60)
    if (invincibleTimer === 60 && lastDamageRef.current !== 60) {
      // Set initial opacity, but cap it to prevent over-stacking
      setOpacity(prev => Math.min(0.5, prev + 0.3));
      
      // Clear existing fade interval
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      // Start gradual fade
      fadeIntervalRef.current = setInterval(() => {
        setOpacity(prev => {
          const newOpacity = prev - 0.02;
          if (newOpacity <= 0) {
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
            return 0;
          }
          return newOpacity;
        });
      }, 50);
    }
    
    lastDamageRef.current = invincibleTimer;

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [invincibleTimer]);

  if (opacity <= 0) return null;

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[200] bg-destructive"
      style={{ opacity }}
    />
  );
};
