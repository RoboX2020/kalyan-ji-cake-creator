// Kalyan-Ji Bakery — Pixel Loader (shared animated loading canvas)

function PixelLoader({ size = 460 }) {
  const { useEffect, useRef } = React;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const PIXEL = 14;
    const cols = Math.ceil(W / PIXEL);
    const rows = Math.ceil(H / PIXEL);

    const palette = [
      '#FAF7F2', '#F0EBE2', '#E2D9CC',
      '#C8956C', '#E8C9A8', '#C9A96E',
      '#A0704A', '#2C1A0E', '#5C4033',
      '#F5E6C8', '#E8D5A8', '#D4A5A5',
    ];

    const pixels = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        color: palette[Math.floor(Math.random() * palette.length)],
        next: palette[Math.floor(Math.random() * palette.length)],
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.016,
        lit: Math.random() > 0.72,
      }))
    );

    let frame;
    let tick = 0;

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    function lerpColor(a, b, t) {
      const [r1, g1, b1] = hexToRgb(a);
      const [r2, g2, b2] = hexToRgb(b);
      return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
    }

    function draw() {
      tick++;
      const scanX = (tick * 1.6) % (W + PIXEL * 4) - PIXEL * 2;
      ctx.clearRect(0, 0, W, H);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = pixels[r][c];
          px.progress += px.speed;
          if (px.progress >= 1) {
            px.color = px.next;
            px.next = palette[Math.floor(Math.random() * palette.length)];
            px.progress = 0;
            px.speed = 0.005 + Math.random() * 0.014;
          }
          const x = c * PIXEL;
          const y = r * PIXEL;
          const distFromScan = Math.abs(x - scanX);
          const scanGlow = Math.max(0, 1 - distFromScan / (PIXEL * 7));
          ctx.fillStyle = lerpColor(px.color, px.next, px.progress);
          ctx.fillRect(x, y, PIXEL - 1, PIXEL - 1);
          if (scanGlow > 0) {
            ctx.fillStyle = `rgba(255,248,238,${scanGlow * 0.5})`;
            ctx.fillRect(x, y, PIXEL - 1, PIXEL - 1);
          }
          if (px.lit) {
            ctx.fillStyle = 'rgba(255,248,238,0.28)';
            ctx.fillRect(x + PIXEL * 0.3, y + PIXEL * 0.3, PIXEL * 0.4, PIXEL * 0.4);
          }
        }
      }

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, W*0.15, W/2, H/2, W*0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(44,26,14,0.38)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      frame = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(frame);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

// Export
window.PixelLoader = PixelLoader;
// Legacy AIImagePreview — no longer used but kept for compat
window.AIImagePreview = function() { return null; };
