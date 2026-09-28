"use client";

import { useEffect, useRef } from "react";

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.45;
    let targetX = pointerX;
    let targetY = pointerY;
    let hoverStrength = 0;
    let targetStrength = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const move = (event: PointerEvent) => {
      targetX = event.clientX / width;
      targetY = (event.clientY + window.scrollY) / height;
      targetStrength = 1;
    };
    const leave = () => { targetStrength = 0; };

    const draw = (time: number) => {
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      hoverStrength += (targetStrength - hoverStrength) * 0.08;
      context.clearRect(0, 0, width, height);

      const darkMode = document.documentElement.dataset.theme === "dark";
      for (let layer = 0; layer < 22; layer += 1) {
        const pattern = layer % 5;
        const baseline = height * (0.06 + layer * 0.047);
        const amplitude = 10 + (layer % 4) * 4 + layer * 1.5;
        const influence = (pointerX - 0.5) * (layer + 1) * 5;
        const frequency = pattern === 0 ? 8 : pattern === 1 ? 14 : pattern === 2 ? 21 : pattern === 3 ? 30 : 11;
        const thickness = pattern === 0 ? 3.2 : pattern === 1 ? 2.2 : pattern === 2 ? 1.35 : pattern === 3 ? 2.7 : 0.9;
        const spacing = pattern === 4 ? 10 : 12;
        context.lineWidth = thickness;
        context.lineCap = pattern === 2 ? "round" : "butt";
        context.beginPath();
        for (let x = -20; x <= width + 20; x += spacing) {
          const normalized = x / width;
          const wave = Math.sin(normalized * frequency + time * 0.00025 + layer * 0.52) * amplitude;
          const secondWave = Math.sin(normalized * (frequency * 2.4) - time * 0.00016 + layer) * (2 + pattern);
          const thirdWave = Math.sin(normalized * (frequency * 0.55) + time * 0.00011 - layer) * (pattern === 0 ? 5 : 2);
          const pointerLift = Math.exp(-Math.pow((normalized - pointerX) * 5, 2)) * (pointerY - 0.5) * 38 * hoverStrength;
          const ripple = Math.sin((normalized - pointerX) * 32 - time * 0.0012) * 5 * hoverStrength * Math.exp(-Math.pow((normalized - pointerX) * 3, 2));
          const y = baseline + wave + secondWave + thirdWave + influence * normalized + pointerLift + ripple;
          if (x === -20) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        const alpha = Math.max(0.045, 0.13 - layer * 0.0032);
        context.strokeStyle = darkMode
          ? `rgba(210, 220, 211, ${alpha})`
          : `rgba(81, 103, 86, ${alpha})`;
        context.stroke();
      }
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className="wave-background" aria-hidden="true" />;
}
