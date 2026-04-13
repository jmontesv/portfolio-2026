(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  let mouseX = -999, mouseY = -999;

  function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouseX = -999; mouseY = -999;
  });

  window.addEventListener('resize', init);

  let t = 0;
  function animate() {
    t += 0.01;
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxR = 120;

      let alpha = 0.12;
      let radius = p.r;

      if (dist < maxR && mouseX > 0) {
        const force = 1 - dist / maxR;
        alpha = 0.12 + force * 0.7;
        radius = p.r + force * 3;
        p.x -= (dx / dist) * force * 1.5;
        p.y -= (dy / dist) * force * 1.5;
      } else {
        p.x += Math.sin(t + p.phase) * 0.2;
        p.y += Math.cos(t + p.phase * 0.7) * 0.2;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,240,80,${alpha})`;
      ctx.fill();
    });

    if (mouseX > 0) {
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,240,80,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }

  init();
  animate();
})();