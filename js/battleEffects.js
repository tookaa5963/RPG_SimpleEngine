// FILE_ENTRY: js/battleEffects.js
export class BattleEffects {
  constructor() {
    this.popups = [];
    this.particles = [];
    this.slashes = [];
    this.screenShakeTimer = 0;
  }

  reset() {
    this.popups = [];
    this.particles = [];
    this.slashes = [];
    this.screenShakeTimer = 0;
  }

  shake(duration = 14) {
    this.screenShakeTimer = duration;
  }

  addPopup(text, x, y, fillColor = '#ffffff', strokeColor = '#e74c3c', isBig = false, type = 'bounce') {
    this.popups.push({
      text: String(text),
      x: x + (Math.random() - 0.5) * 8,
      y: y,
      baseX: x,
      vx: (Math.random() - 0.5) * 2.0,
      vy: type === 'bounce' ? -6.0 : 0,
      gravity: type === 'bounce' ? 0.28 : 0,
      timer: 55,
      maxTimer: 55,
      fillColor: fillColor,
      strokeColor: strokeColor,
      scale: 1.8,
      isBig: isBig,
      type: type
    });
  }

  createSparks(x, y, color = '#ffffff', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0,
        size: Math.random() * 4 + 3,
        color: color,
        life: 22,
        maxLife: 22
      });
    }
  }

  createPlayerDamageEffect(x, y, isCrit = false) {
    const length = isCrit ? 120 : 80;
    const duration = isCrit ? 20 : 14;
    this.slashes.push({
      x: x,
      y: y,
      angle1: -Math.PI / 4,
      angle2: Math.PI / 4,
      length: length,
      life: duration,
      maxLife: duration,
      color: isCrit ? '#ff3838' : '#ff0055'
    });

    const particleCount = isCrit ? 26 : 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * (isCrit ? 8 : 5) + 2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed * 0.5,
        gravity: 0.35,
        size: Math.random() * 5 + 3,
        color: Math.random() < 0.5 ? '#ff0055' : (isCrit ? '#ff3838' : '#7158e2'),
        life: 26,
        maxLife: 26
      });
    }
  }

  update() {
    if (this.screenShakeTimer > 0) this.screenShakeTimer--;

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.timer--;
      p.scale = Math.max(1.0, p.scale - 0.07);

      if (p.type === 'bounce') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
      } else if (p.type === 'shake') {
        p.x = p.baseX + (Math.random() - 0.5) * 8;
        p.y -= 0.4;
      }

      if (p.timer <= 0) {
        this.popups.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life--;
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += pt.gravity;
      pt.vx *= 0.94;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const sl = this.slashes[i];
      sl.life--;
      if (sl.life <= 0) {
        this.slashes.splice(i, 1);
      }
    }
  }

  applyScreenShake(ctx) {
    if (this.screenShakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * 14;
      const shakeY = (Math.random() - 0.5) * 14;
      ctx.translate(shakeX, shakeY);
    }
  }

  draw(ctx) {
    this.drawSlashes(ctx);
    this.drawParticles(ctx);
    this.drawPopups(ctx);
  }

  drawSlashes(ctx) {
    ctx.save();
    this.slashes.forEach(sl => {
      const alpha = sl.life / sl.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.lineWidth = 5 * alpha;
      ctx.strokeStyle = sl.color;
      ctx.lineCap = 'round';

      const cos1 = Math.cos(sl.angle1) * sl.length;
      const sin1 = Math.sin(sl.angle1) * sl.length;
      ctx.beginPath();
      ctx.moveTo(sl.x - cos1, sl.y - sin1);
      ctx.lineTo(sl.x + cos1, sl.y + sin1);
      ctx.stroke();

      const cos2 = Math.cos(sl.angle2) * sl.length;
      const sin2 = Math.sin(sl.angle2) * sl.length;
      ctx.beginPath();
      ctx.moveTo(sl.x - cos2, sl.y - sin2);
      ctx.lineTo(sl.x + cos2, sl.y + sin2);
      ctx.stroke();
    });
    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    this.particles.forEach(pt => {
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    });
    ctx.restore();
  }

  drawPopups(ctx) {
    ctx.save();
    this.popups.forEach(p => {
      const alpha = Math.min(1.0, p.timer / 15);
      ctx.globalAlpha = Math.max(0, alpha);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      const baseFontSize = p.isBig ? 48 : 38;
      ctx.font = `900 ${baseFontSize}px Impact, "Arial Black", "Hiragino Kaku Gothic ProN", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 14;
      ctx.lineJoin = 'round';
      ctx.strokeText(p.text, 0, 0);

      ctx.strokeStyle = p.strokeColor;
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.strokeText(p.text, 0, 0);

      ctx.fillStyle = p.fillColor;
      ctx.fillText(p.text, 0, 0);

      ctx.restore();
    });
    ctx.restore();
  }
}