import React, { useEffect, useRef, useState } from 'react';

interface PrismProps {
  animationType?: 'rotate' | 'float' | 'pulse';
  timeScale?: number;
  height?: number;
  baseWidth?: number;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  noise?: number;
  glow?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const Prism: React.FC<PrismProps> = ({
  animationType = 'rotate',
  timeScale = 0.5,
  height = 3.5,
  baseWidth = 5.5,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  noise = 0,
  glow = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const mouseRef = useRef({ x: 0, y: 300, isOver: false });

  // Handle Resize beautifully
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || 600,
          height: height || 600,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const particles: Particle[] = [];

    // Rainbow colors for refraction
    const getRainbowColor = (index: number, total: number, shift: number) => {
      const hue = ((index / total) * 360 * colorFrequency + shift) % 360;
      return `hsla(${hue}, 95%, 65%, 0.85)`;
    };

    const getRainbowGlowColor = (index: number, total: number, shift: number) => {
      const hue = ((index / total) * 360 * colorFrequency + shift) % 360;
      return `hsla(${hue}, 100%, 60%, 0.22)`;
    };

    const animate = () => {
      time += 16 * timeScale;
      const width = dimensions.width;
      const heightCanvas = dimensions.height;

      // 1. Clear and Draw elegant spatial background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, heightCanvas);

      // Radial background ambient glow
      if (glow > 0) {
        const ambientGlow = ctx.createRadialGradient(
          width / 2,
          heightCanvas / 2,
          20,
          width / 2,
          heightCanvas / 2,
          Math.min(width, heightCanvas) * 0.6
        );
        ambientGlow.addColorStop(0, 'rgba(99, 102, 241, 0.12)'); // indigo
        ambientGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)'); // purple
        ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, heightCanvas);
      }

      // 2. Define 3D Prism geometry based on props
      const sizeMultiplier = scale * 15;
      const h = height * sizeMultiplier;
      const w = baseWidth * sizeMultiplier;

      // Triangular prism 3D vertices (centered at 0, 0, 0)
      // Bottom base
      const r = w / Math.sqrt(3);
      const v0 = [0, -h / 2, r];
      const v1 = [-w / 2, -h / 2, -r / 2];
      const v2 = [w / 2, -h / 2, -r / 2];
      // Top base
      const v3 = [0, h / 2, r];
      const v4 = [-w / 2, h / 2, -r / 2];
      const v5 = [w / 2, h / 2, -r / 2];

      const vertices = [v0, v1, v2, v3, v4, v5];

      // Rotation angles
      let yaw = time * 0.0012;
      let pitch = 0.35;
      let roll = 0;

      if (animationType === 'float') {
        yaw = Math.sin(time * 0.0006) * 0.8;
        pitch = 0.35 + Math.cos(time * 0.001) * 0.15;
        roll = Math.sin(time * 0.0008) * 0.2;
      } else if (animationType === 'pulse') {
        yaw = time * 0.0004;
        pitch = 0.3 + Math.sin(time * 0.001) * 0.1;
      }

      // Apply mouse tilt interaction for extra responsiveness
      if (mouseRef.current.isOver) {
        const mouseDx = (mouseRef.current.x - width / 2) / width;
        const mouseDy = (mouseRef.current.y - heightCanvas / 2) / heightCanvas;
        yaw += mouseDx * 0.8;
        pitch += mouseDy * 0.8;
      }

      // Rotate and Project function
      const project = (v: number[]) => {
        let [x, y, z] = v;

        // Roll (Z)
        if (roll !== 0) {
          const cosR = Math.cos(roll);
          const sinR = Math.sin(roll);
          const rx = x * cosR - y * sinR;
          const ry = x * sinR + y * cosR;
          x = rx;
          y = ry;
        }

        // Pitch (X)
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);
        const py = y * cosP - z * sinP;
        const pz = y * sinP + z * cosP;
        y = py;
        z = pz;

        // Yaw (Y)
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const yx = x * cosY - z * sinY;
        const yz = x * sinY + z * cosY;
        x = yx;
        z = yz;

        // Perspective / Orthographic projection centered
        const distance = 800;
        const perspective = distance / (distance + z);
        
        // Pulse animation scale adjustment
        const pulseScale = animationType === 'pulse' ? 1 + Math.sin(time * 0.002) * 0.08 : 1;

        return {
          sx: width / 2 + x * perspective * pulseScale,
          sy: heightCanvas / 2 + y * perspective * pulseScale,
          sz: z,
        };
      };

      const projected = vertices.map(project);

      // Define 5 Faces of the Prism for back-to-front rendering (depth-sorting)
      const faces = [
        // Side face 1 (v0-v1-v4-v3)
        { indices: [0, 1, 4, 3], color: 'rgba(99, 102, 241, 0.06)', isBase: false },
        // Side face 2 (v1-v2-v5-v4)
        { indices: [1, 2, 5, 4], color: 'rgba(168, 85, 247, 0.06)', isBase: false },
        // Side face 3 (v2-v0-v3-v5)
        { indices: [2, 0, 3, 5], color: 'rgba(59, 130, 246, 0.06)', isBase: false },
        // Bottom Base (v0-v2-v1)
        { indices: [0, 2, 1], color: 'rgba(236, 72, 153, 0.04)', isBase: true },
        // Top Base (v3-v4-v5)
        { indices: [3, 4, 5], color: 'rgba(6, 182, 212, 0.04)', isBase: true },
      ];

      // Calculate depth of each face (average projected Z)
      const facesWithDepth = faces.map((face) => {
        const sumZ = face.indices.reduce((sum, idx) => sum + projected[idx].sz, 0);
        const avgZ = sumZ / face.indices.length;
        return { ...face, depth: avgZ };
      });

      // Sort back-to-front (descending depth, i.e., larger Z first)
      facesWithDepth.sort((a, b) => b.depth - a.depth);

      // 3. Draw Laser Ray & Rainbow Refraction
      // Source point of light (from left margin, responding dynamically to mouse y if hovered)
      const sourceY = mouseRef.current.isOver ? mouseRef.current.y : heightCanvas / 2 + Math.sin(time * 0.0008) * 120;
      const lightSource = { x: 0, y: sourceY };
      const prismCenter = { x: width / 2, y: heightCanvas / 2 };

      // Drawing Incident White Laser Light (Left side)
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(lightSource.x, lightSource.y);
      ctx.lineTo(prismCenter.x, prismCenter.y);
      ctx.stroke();
      ctx.restore();

      // Core white light inner line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lightSource.x, lightSource.y);
      ctx.lineTo(prismCenter.x, prismCenter.y);
      ctx.stroke();

      // 4. Render Back Faces of the Prism first
      const drawPrismFace = (face: typeof facesWithDepth[0]) => {
        ctx.beginPath();
        const firstProj = projected[face.indices[0]];
        ctx.moveTo(firstProj.sx, firstProj.sy);
        for (let i = 1; i < face.indices.length; i++) {
          const p = projected[face.indices[i]];
          ctx.lineTo(p.sx, p.sy);
        }
        ctx.closePath();

        // Beautiful glass face gradient
        const grad = ctx.createRadialGradient(
          width / 2,
          heightCanvas / 2,
          10,
          width / 2,
          heightCanvas / 2,
          w * 1.5
        );
        grad.addColorStop(0, face.color);
        grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.01)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');

        ctx.fillStyle = grad;
        ctx.fill();

        // Edge stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };

      // Draw the 3 furthest (back) faces
      facesWithDepth.slice(0, 3).forEach(drawPrismFace);

      // 5. Drawing refract/dispersion rainbow on the right
      // The prism splits the white ray into a rainbow spectrum spanning to the right edge
      const beamCount = 12;
      const rightBorderX = width;
      const spectrumSpread = 160 + Math.sin(time * 0.001) * 30; // shimmer spread width
      const spectrumCenterY = heightCanvas / 2 - (sourceY - heightCanvas / 2) * 0.4; // inverted refraction angle

      // Spark generation in beams (if noise/particles requested)
      if (Math.random() < 0.25 + noise * 0.5) {
        const randomBeamIndex = Math.floor(Math.random() * beamCount);
        const bY = spectrumCenterY + (randomBeamIndex / beamCount - 0.5) * spectrumSpread;
        const color = getRainbowColor(randomBeamIndex, beamCount, hueShift);
        
        particles.push({
          x: prismCenter.x,
          y: prismCenter.y,
          vx: (rightBorderX - prismCenter.x) / 110 + (Math.random() - 0.5) * 0.5,
          vy: (bY - prismCenter.y) / 110 + (Math.random() - 0.5) * 0.5,
          life: 0,
          maxLife: 90 + Math.random() * 40,
          size: 1.5 + Math.random() * 3,
          color,
        });
      }

      // Draw 12 fine lines inside the prism to represent inner refraction
      for (let i = 0; i < beamCount; i++) {
        const color = getRainbowColor(i, beamCount, hueShift);
        const targetBeamY = spectrumCenterY + (i / beamCount - 0.5) * spectrumSpread;
        
        // Find exit point (subtle shift inside prism)
        const innerRefractX = prismCenter.x + (i - beamCount / 2) * 1.5;
        const innerRefractY = prismCenter.y + Math.sin(time * 0.002 + i) * 3;

        // Draw refractive paths inside
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(prismCenter.x, prismCenter.y);
        ctx.lineTo(innerRefractX, innerRefractY);
        ctx.stroke();

        // Exiting dispersed rainbow ray (right side of prism to end)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(innerRefractX, innerRefractY);
        ctx.lineTo(rightBorderX, targetBeamY);
        
        // Apply neon glow on exiting paths
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.2;
        ctx.stroke();
        ctx.restore();

        // Thick ambient volumetric glow overlay
        ctx.strokeStyle = getRainbowGlowColor(i, beamCount, hueShift);
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(innerRefractX, innerRefractY);
        ctx.lineTo(rightBorderX, targetBeamY);
        ctx.stroke();
      }

      // 6. Draw front faces of the Prism on top of the refract rays
      facesWithDepth.slice(3).forEach(drawPrismFace);

      // Draw elegant crystal apex vertex dots for a premium vector tech-drawing feel
      projected.forEach((p) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 7. Update and Draw sparkling dust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color.replace('0.85', `${alpha * 0.9}`);
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, animationType, timeScale, height, baseWidth, scale, hueShift, colorFrequency, noise, glow]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isOver: true,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    mouseRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      isOver: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.isOver = false;
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden select-none cursor-crosshair rounded-3xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 block w-full h-full"
      />
    </div>
  );
};

export default Prism;
