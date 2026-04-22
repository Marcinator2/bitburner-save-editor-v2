import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/\\|[]{}";

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const fontSize = 14;
    let cols: number;
    let drops: number[];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -100);
    }

    resize();
    window.addEventListener("resize", resize);

    const interval = setInterval(() => {
      // Fade trail
      ctx.fillStyle = "rgba(5, 13, 5, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i] * fontSize;

        // Bright head
        ctx.fillStyle = "#66ff66";
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(ch, i * fontSize, y);

        // Slightly dimmer second char
        if (drops[i] > 1) {
          ctx.fillStyle = "#00b300";
          const ch2 = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(ch2, i * fontSize, y - fontSize);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    }, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.18,
      }}
    />
  );
}
