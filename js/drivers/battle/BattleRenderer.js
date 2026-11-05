// FILE_ENTRY: js/drivers/battle/BattleRenderer.js
/**
 * js/drivers/battle/BattleRenderer.js
 * 戦闘画面描画 Platform Driver
 *
 * 責務:
 * - Canvas 2D コンテキストに対する戦闘画面の受動的レンダリング。
 * - Core層および進行管理（js/battle.js）からブラウザ API（Image, CanvasRenderingContext2D）を隔離。
 * - 敵画像・点滅演出、各種UI枠、テキスト、およびエフェクトの描画パイプライン実行。
 */

export class BattleRenderer {
  constructor() {
    this.enemyImage = null;
    this.isImageLoaded = false;
  }

  /**
   * 敵画像のロード（ブラウザ環境専用フェイルセーフ）
   * @param {string} imageSrc 画像ファイルパス
   */
  loadEnemyImage(imageSrc) {
    if (typeof Image === 'undefined') {
      return;
    }
    this.isImageLoaded = false;
    this.enemyImage = new Image();
    this.enemyImage.onload = () => {
      this.isImageLoaded = true;
    };
    this.enemyImage.onerror = () => {
      console.warn(`画像読込失敗: ${imageSrc}`);
    };
    this.enemyImage.src = imageSrc;
  }

  /**
   * 戦闘画面全体の受動レンダリング
   * @param {CanvasRenderingContext2D} ctx 描画コンテキスト
   * @param {{ width: number, height: number }} canvas キャンバス寸法
   * @param {object} state 描画ペイロード
   */
  render(ctx, canvas, state) {
    // 1. 引数アサーション（フェイルファスト検証）
    if (ctx === null || typeof ctx !== 'object') {
      throw new TypeError('[NullReferenceError] BattleRenderer:render: 引数 ctx が不正です');
    }
    if (typeof ctx.fillRect !== 'function') {
      throw new TypeError('[InvalidContextError] BattleRenderer:render: ctx.fillRect が関数ではありません');
    }

    if (canvas === null || typeof canvas !== 'object') {
      throw new TypeError('[NullReferenceError] BattleRenderer:render: 引数 canvas が不正です');
    }
    if (typeof canvas.width !== 'number' || canvas.width <= 0) {
      throw new RangeError('[RangeError] BattleRenderer:render: canvas.width は正の数値である必要があります');
    }
    if (typeof canvas.height !== 'number' || canvas.height <= 0) {
      throw new RangeError('[RangeError] BattleRenderer:render: canvas.height は正の数値である必要があります');
    }

    if (state === null || typeof state !== 'object') {
      throw new TypeError('[NullReferenceError] BattleRenderer:render: 引数 state が不正です');
    }

    const cw = canvas.width;
    const ch = canvas.height;

    // 2. パイプライン開始: 状態退避
    ctx.save();

    // 3. 前段エフェクト（画面揺れ等）
    if (state.effects && typeof state.effects.applyScreenShake === 'function') {
      state.effects.applyScreenShake(ctx);
    }

    // 4. 背景黒クリア
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, cw, ch);

    // 5. 敵描画
    if (state.enemy && state.enemy.hp > 0) {
      const flashTimer = typeof state.enemyFlashTimer === 'number' ? state.enemyFlashTimer : 0;
      if (flashTimer === 0 || Math.floor(flashTimer / 3) % 2 === 0) {
        this.drawEnemy(ctx, cw, ch, state);
      }
    }

    // 6. UI ボックス描画
    this.drawUI(ctx, cw, ch, state);

    // 7. 後段エフェクト描画
    if (state.effects && typeof state.effects.draw === 'function') {
      state.effects.draw(ctx);
    }

    // 8. パイプライン終了: 状態復元
    ctx.restore();
  }

  /**
   * 敵画像またはフォールバックの描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cw
   * @param {number} ch
   * @param {object} state
   */
  drawEnemy(ctx, cw, ch, state) {
    const cx = cw * 0.5;
    const cy = ch * 0.36;

    let drawSize = Math.floor(cw * 0.42);
    let drawX = cx - (drawSize / 2);
    let drawY = cy - (drawSize / 2);

    if (state.enemy.id === 'black_dragon') {
      drawSize = Math.max(cw, ch);
      drawX = (cw - drawSize) / 2;
      drawY = (ch - drawSize) / 2;
    }

    const isLoaded = typeof state.isImageLoaded === 'boolean' ? state.isImageLoaded : this.isImageLoaded;
    const enemyImg = state.enemyImage !== undefined ? state.enemyImage : this.enemyImage;

    if (isLoaded && enemyImg) {
      ctx.drawImage(enemyImg, drawX, drawY, drawSize, drawSize);
    } else {
      const charIndex = typeof state.charIndex === 'number' ? state.charIndex : 100;
      if (charIndex < 50) {
        return;
      }
      const half = drawSize * 0.25;
      ctx.fillStyle = state.enemy.color || '#00aa00';
      ctx.fillRect(cx - half, cy - half, half * 2, half * 2);
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.enemy.name || '', cx, cy);
    }
  }

  /**
   * UI ボックス群（コマンド、アイテム、破棄、メッセージ枠）の描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} cw
   * @param {number} ch
   * @param {object} state
   */
  drawUI(ctx, cw, ch, state) {
    const margin = Math.floor(cw * 0.04);
    const msgW = cw - (margin * 2);
    const msgH = Math.floor(ch * 0.32);
    const msgY = ch - msgH - margin;

    const isWestern = Boolean(state.isWestern);
    const cmdW = isWestern ? 180 : 160;
    const cmdX = cw - margin - cmdW;
    const cmdY = msgY - 170;

    const phase = state.phase || '';

    if (phase === 'COMMAND_SELECT' || phase === 'ITEM_SELECT') {
      const commands = Array.isArray(state.commands) ? state.commands : [];
      const commandIndex = typeof state.commandIndex === 'number' ? state.commandIndex : 0;
      this.drawListBox(ctx, cmdX, cmdY, commands, commandIndex, 4, isWestern);
    }

    if (phase === 'ITEM_SELECT') {
      const itemList = Array.isArray(state.itemList) ? state.itemList : [];
      const itemNames = itemList.map(i => (typeof i === 'string' ? i : (i && i.name ? i.name : '')));
      const itemX = cmdX - (isWestern ? 250 : 220);
      const itemIndex = typeof state.itemIndex === 'number' ? state.itemIndex : 0;
      this.drawListBox(ctx, itemX, cmdY, itemNames, itemIndex, 5, isWestern);
    }

    if (phase === 'DISCARD_SELECT') {
      const discardMsg = typeof state.discardSelectMsg === 'string' ? state.discardSelectMsg : '';
      this.drawMessageBox(ctx, margin, msgY, msgW, msgH, discardMsg, false);

      const discardList = Array.isArray(state.discardList) ? state.discardList : [];
      const discardNames = discardList.map(i => (typeof i === 'string' ? i : (i && i.name ? i.name : '')));
      const discardIndex = typeof state.discardIndex === 'number' ? state.discardIndex : 0;
      this.drawListBox(ctx, Math.floor(cw * 0.35), msgY - 200, discardNames, discardIndex, 6, isWestern);
    } else {
      const showIndicator = Boolean(state.isTextComplete && phase === 'MESSAGE');
      const text = typeof state.displayedText === 'string' ? state.displayedText : '';
      this.drawMessageBox(ctx, margin, msgY, msgW, msgH, text, showIndicator);
    }
  }

  /**
   * 共通矩形枠描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  drawFrame(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
  }

  /**
   * メッセージ枠描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {string} text
   * @param {boolean} showIndicator
   */
  drawMessageBox(ctx, x, y, w, h, text, showIndicator) {
    this.drawFrame(ctx, x, y, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    if (typeof text === 'string' && text.length > 0) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x + 24, y + 24 + (i * 30));
      }
    }

    if (showIndicator === true) {
      if (Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillText('▼', x + w - 36, y + h - 32);
      }
    }
  }

  /**
   * リスト選択枠描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {string[]} items
   * @param {number} selectedIndex
   * @param {number} visibleCount
   * @param {boolean} isWestern
   */
  drawListBox(ctx, x, y, items, selectedIndex, visibleCount, isWestern) {
    const lineH = 32;
    const paddingY = 16;
    const h = paddingY * 2 + visibleCount * lineH;

    let maxLen = 0;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (typeof item === 'string' && item.length > maxLen) {
        maxLen = item.length;
      }
    }

    const charWidth = isWestern ? 11 : 20;
    const w = Math.max(160, maxLen * charWidth + 56);

    this.drawFrame(ctx, x, y, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const halfVisible = Math.floor(visibleCount / 2);
    const targetOffset = selectedIndex - halfVisible;
    const maxOffset = items.length - visibleCount;
    const startIndex = Math.max(0, Math.min(targetOffset, maxOffset));
    const endIndex = Math.min(items.length, startIndex + visibleCount);

    for (let i = startIndex; i < endIndex; i++) {
      const drawY = y + paddingY + (i - startIndex) * lineH;
      ctx.fillText(items[i], x + 36, drawY);
      if (i === selectedIndex) {
        ctx.fillText('▶', x + 14, drawY);
      }
    }
  }
}