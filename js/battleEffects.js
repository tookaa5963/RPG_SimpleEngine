// FILE_ENTRY: js/battleEffects.js

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
  return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

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
    if (typeof duration !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:shake', 'duration', duration);
    }
    if (Number.isNaN(duration)) {
      throw createProtocolError('RangeError', 'battleEffects.js:shake', 'duration', duration);
    }
    this.screenShakeTimer = duration;
  }

  addPopup(text, x, y, fillColor = '#ffffff', strokeColor = '#e74c3c', isBig = false, type = 'bounce') {
    if (text === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:addPopup', 'text', text);
    }
    if (text === undefined) {
      throw createProtocolError('UndefinedReferenceError', 'battleEffects.js:addPopup', 'text', text);
    }
    if (typeof x !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'x', x);
    }
    if (Number.isNaN(x)) {
      throw createProtocolError('RangeError', 'battleEffects.js:addPopup', 'x', x);
    }
    if (typeof y !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'y', y);
    }
    if (Number.isNaN(y)) {
      throw createProtocolError('RangeError', 'battleEffects.js:addPopup', 'y', y);
    }
    if (typeof fillColor !== 'string') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'fillColor', fillColor);
    }
    if (typeof strokeColor !== 'string') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'strokeColor', strokeColor);
    }
    if (typeof isBig !== 'boolean') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'isBig', isBig);
    }
    if (typeof type !== 'string') {
      throw createProtocolError('TypeError', 'battleEffects.js:addPopup', 'type', type);
    }

    let vy = 0;
    let gravity = 0;
    if (type === 'bounce') {
      vy = -6.0;
      gravity = 0.28;
    }

    this.popups.push({
      text: String(text),
      x: x + (Math.random() - 0.5) * 8,
      y: y,
      baseX: x,
      vx: (Math.random() - 0.5) * 2.0,
      vy: vy,
      gravity: gravity,
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
    if (typeof x !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:createSparks', 'x', x);
    }
    if (Number.isNaN(x)) {
      throw createProtocolError('RangeError', 'battleEffects.js:createSparks', 'x', x);
    }
    if (typeof y !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:createSparks', 'y', y);
    }
    if (Number.isNaN(y)) {
      throw createProtocolError('RangeError', 'battleEffects.js:createSparks', 'y', y);
    }
    if (typeof color !== 'string') {
      throw createProtocolError('TypeError', 'battleEffects.js:createSparks', 'color', color);
    }
    if (typeof count !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:createSparks', 'count', count);
    }
    if (Number.isNaN(count)) {
      throw createProtocolError('RangeError', 'battleEffects.js:createSparks', 'count', count);
    }

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
    if (typeof x !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:createPlayerDamageEffect', 'x', x);
    }
    if (Number.isNaN(x)) {
      throw createProtocolError('RangeError', 'battleEffects.js:createPlayerDamageEffect', 'x', x);
    }
    if (typeof y !== 'number') {
      throw createProtocolError('TypeError', 'battleEffects.js:createPlayerDamageEffect', 'y', y);
    }
    if (Number.isNaN(y)) {
      throw createProtocolError('RangeError', 'battleEffects.js:createPlayerDamageEffect', 'y', y);
    }
    if (typeof isCrit !== 'boolean') {
      throw createProtocolError('TypeError', 'battleEffects.js:createPlayerDamageEffect', 'isCrit', isCrit);
    }

    let length = 80;
    let duration = 14;
    let slashColor = '#ff0055';
    let particleCount = 16;
    let speedMultiplier = 5;

    if (isCrit) {
      length = 120;
      duration = 20;
      slashColor = '#ff3838';
      particleCount = 26;
      speedMultiplier = 8;
    }

    this.slashes.push({
      x: x,
      y: y,
      angle1: -Math.PI / 4,
      angle2: Math.PI / 4,
      length: length,
      life: duration,
      maxLife: duration,
      color: slashColor
    });

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * 1.5;
      const speed = Math.random() * speedMultiplier + 2;

      let particleColor = '#7158e2';
      if (isCrit) {
        particleColor = '#ff3838';
      }
      if (Math.random() < 0.5) {
        particleColor = '#ff0055';
      }

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed * 0.5,
        gravity: 0.35,
        size: Math.random() * 5 + 3,
        color: particleColor,
        life: 26,
        maxLife: 26
      });
    }
  }

  update() {
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer--;
    }

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
    if (ctx === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:applyScreenShake', 'ctx', ctx);
    }
    if (typeof ctx !== 'object') {
      throw createProtocolError('TypeError', 'battleEffects.js:applyScreenShake', 'ctx', ctx);
    }

    if (this.screenShakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * 14;
      const shakeY = (Math.random() - 0.5) * 14;
      ctx.translate(shakeX, shakeY);
    }
  }

  draw(ctx) {
    if (ctx === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:draw', 'ctx', ctx);
    }
    if (typeof ctx !== 'object') {
      throw createProtocolError('TypeError', 'battleEffects.js:draw', 'ctx', ctx);
    }

    this.drawSlashes(ctx);
    this.drawParticles(ctx);
    this.drawPopups(ctx);
  }

  drawSlashes(ctx) {
    if (ctx === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:drawSlashes', 'ctx', ctx);
    }
    if (typeof ctx !== 'object') {
      throw createProtocolError('TypeError', 'battleEffects.js:drawSlashes', 'ctx', ctx);
    }

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
    if (ctx === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:drawParticles', 'ctx', ctx);
    }
    if (typeof ctx !== 'object') {
      throw createProtocolError('TypeError', 'battleEffects.js:drawParticles', 'ctx', ctx);
    }

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
    if (ctx === null) {
      throw createProtocolError('NullReferenceError', 'battleEffects.js:drawPopups', 'ctx', ctx);
    }
    if (typeof ctx !== 'object') {
      throw createProtocolError('TypeError', 'battleEffects.js:drawPopups', 'ctx', ctx);
    }

    ctx.save();
    this.popups.forEach(p => {
      const alpha = Math.min(1.0, p.timer / 15);
      ctx.globalAlpha = Math.max(0, alpha);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.scale, p.scale);

      let baseFontSize = 38;
      if (p.isBig) {
        baseFontSize = 48;
      }

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
