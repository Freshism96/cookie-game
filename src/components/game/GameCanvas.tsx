import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Player, Enemy, Bullet, Particle, FloatingText, Beam } from '@/types/game';

interface GameCanvasProps {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  beams: Beam[];
  isPlaying: boolean;
  mobilePortrait?: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  enemies,
  bullets,
  particles,
  floatingTexts,
  beams,
  isPlaying,
  mobilePortrait = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#003300';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!isPlaying) {
      // Matrix rain background for non-playing states
      ctx.fillStyle = '#0f0';
      ctx.font = '20px VT323';
      for (let i = 0; i < width / 20; i++) {
        if (Math.random() > 0.95) {
          ctx.fillText(
            String.fromCharCode(0x30A0 + Math.random() * 96),
            i * 20,
            Math.random() * height
          );
        }
      }
      return;
    }

    // Draw beams
    beams.forEach(beam => {
      ctx.strokeStyle = `rgba(0, 255, 0, ${beam.life})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(beam.x1, beam.y1);
      ctx.lineTo(beam.x2, beam.y2);
      ctx.stroke();
    });

    // Draw enemies
    enemies.forEach(enemy => {
      if (enemy.dead) return;

      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Enemy body
      ctx.fillStyle = enemy.poisoned ? '#008800' : '#000';
      ctx.strokeStyle = enemy.type.color;
      ctx.lineWidth = enemy.isBoss ? 4 : 2;

      ctx.beginPath();
      if (enemy.type.shape === 'boss') {
        // Boss: large octagon with glow effect
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 20;
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * enemy.radius;
          const y = Math.sin(angle) * enemy.radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Boss crown
        ctx.fillStyle = '#ff0';
        ctx.font = '24px VT323';
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -enemy.radius - 10);
      } else if (enemy.type.shape === 'triangle') {
        ctx.moveTo(0, -enemy.radius);
        ctx.lineTo(enemy.radius, enemy.radius);
        ctx.lineTo(-enemy.radius, enemy.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.rect(-enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2);
        ctx.fill();
        ctx.stroke();
      }

      // HP bar
      const barW = enemy.isBoss ? 60 : 30;
      const barH = enemy.isBoss ? 6 : 4;
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      const barY = enemy.radius + 10;

      ctx.fillStyle = '#500';
      ctx.fillRect(-barW / 2, barY, barW, barH);
      ctx.fillStyle = enemy.isBoss ? '#ff00ff' : '#0f0';
      ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);

      ctx.fillStyle = '#fff';
      ctx.font = enemy.isBoss ? 'bold 14px VT323' : '12px VT323';
      ctx.textAlign = 'center';
      ctx.fillText(Math.ceil(enemy.hp).toString(), 0, barY + 15);

      // Question text - centered on monster
      ctx.font = enemy.isBoss ? 'bold 28px "Noto Sans KR", monospace' : 'bold 22px "Noto Sans KR", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw text background
      const textWidth = ctx.measureText(enemy.questionString).width;
      ctx.fillStyle = enemy.isBoss ? 'rgba(80, 0, 80, 0.85)' : 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(-textWidth / 2 - 6, -14, textWidth + 12, 28);
      
      // Draw text centered on monster body
      ctx.fillStyle = enemy.isBoss ? '#ff00ff' : '#0f0';
      ctx.fillText(enemy.questionString, 0, 0);

      // Input progress bar
      if (enemy.inputProgress > 0) {
        ctx.fillStyle = '#333';
        ctx.fillRect(-15, -18, 30, 4);
        ctx.fillStyle = enemy.isBoss ? '#ff00ff' : '#0f0';
        ctx.fillRect(-15, -18, 30 * (enemy.inputProgress / enemy.answerString.length), 4);
      }

      ctx.restore();
    });

    // Draw bullets
    bullets.forEach(bullet => {
      ctx.strokeStyle = bullet.isDrone ? '#aaf' : '#0f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (bullet.trail.length > 0) {
        ctx.moveTo(bullet.trail[0].x, bullet.trail[0].y);
        bullet.trail.forEach(p => ctx.lineTo(p.x, p.y));
      }
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 3, 3);
      ctx.globalAlpha = 1.0;
    });

    // Draw floating texts
    floatingTexts.forEach(text => {
      ctx.globalAlpha = Math.max(0, text.life);
      ctx.fillStyle = text.color;
      ctx.font = '14px "Noto Sans KR"';
      ctx.fillText(text.text, text.x, text.y);
      ctx.globalAlpha = 1.0;
    });

    // Draw player
    ctx.save();
    ctx.translate(player.x, player.y);

    const isBlinking = player.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0;
    ctx.fillStyle = isBlinking ? '#555' : '#000';
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Player icon
    ctx.fillStyle = '#0f0';
    ctx.fillRect(-6, -6, 12, 12);

    ctx.restore();
  }, [player, enemies, bullets, particles, floatingTexts, beams, isPlaying]);

  // Handle viewport resize (including virtual keyboard)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const width = window.innerWidth;
      let height: number;
      
      // For mobile portrait mode (DS style), use 50% of screen
      if (mobilePortrait) {
        height = Math.floor(window.innerHeight * 0.5);
      } else {
        // Use visualViewport if available (accounts for virtual keyboard)
        const vv = window.visualViewport;
        height = vv ? vv.height : window.innerHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      setViewportHeight(height);
    };

    updateCanvasSize();
    
    // Listen to both window resize and visualViewport resize
    window.addEventListener('resize', updateCanvasSize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateCanvasSize);
      window.visualViewport.addEventListener('scroll', updateCanvasSize);
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateCanvasSize);
        window.visualViewport.removeEventListener('scroll', updateCanvasSize);
      }
    };
  }, [mobilePortrait]);

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed left-0 top-0 z-0"
      style={{ height: viewportHeight }}
    />
  );
};
