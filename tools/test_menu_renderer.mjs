import assert from 'assert';
import { MenuRenderer } from '../js/drivers/menu/MenuRenderer.js';

/**
 * 描画内容を検証するためのヘッドレス用Canvas Contextモック
 */
class MockCtx {
    constructor() {
        this.calls = [];
        this.fillStyle = '';
        this.globalCompositeOperation = '';
        this.globalAlpha = 1.0;
        this.font = '';
        this.textAlign = '';
        this.textBaseline = '';
    }
    fillRect(x, y, w, h) { this.calls.push({ method: 'fillRect', args: [x, y, w, h], fillStyle: this.fillStyle }); }
    clearRect(x, y, w, h) { this.calls.push({ method: 'clearRect', args: [x, y, w, h] }); }
    save() { this.calls.push({ method: 'save' }); }
    restore() { this.calls.push({ method: 'restore' }); }
    translate(x, y) { this.calls.push({ method: 'translate', args: [x, y] }); }
    beginPath() { this.calls.push({ method: 'beginPath' }); }
    moveTo(x, y) { this.calls.push({ method: 'moveTo', args: [x, y] }); }
    lineTo(x, y) { this.calls.push({ method: 'lineTo', args: [x, y] }); }
    closePath() { this.calls.push({ method: 'closePath' }); }
    fill() { this.calls.push({ method: 'fill', fillStyle: this.fillStyle }); }
    drawImage(...args) { this.calls.push({ method: 'drawImage', args }); }
    fillText(text, x, y) { this.calls.push({ method: 'fillText', args: [text, x, y] }); }
    strokeRect(x, y, w, h) { this.calls.push({ method: 'strokeRect', args: [x, y, w, h] }); }
}

export function runMenuRendererTests() {
    console.log("=== MenuRenderer Tests Start ===");

    const renderer = new MenuRenderer();

    // ---------------------------------------------------------
    // カテゴリA：入力正規化検証 (TC-MR-INPUT)
    // ---------------------------------------------------------
    console.log("Running Category A: Input Normalization");
    
    assert.strictEqual(renderer.normalizeMenuInput('ArrowUp'), 'UP');
    assert.strictEqual(renderer.normalizeMenuInput('w'), 'UP');
    assert.strictEqual(renderer.normalizeMenuInput('W'), 'UP');
    assert.strictEqual(renderer.normalizeMenuInput('ArrowDown'), 'DOWN');
    assert.strictEqual(renderer.normalizeMenuInput('s'), 'DOWN');
    assert.strictEqual(renderer.normalizeMenuInput('S'), 'DOWN');
    assert.strictEqual(renderer.normalizeMenuInput('ArrowLeft'), 'LEFT');
    assert.strictEqual(renderer.normalizeMenuInput('a'), 'LEFT');
    assert.strictEqual(renderer.normalizeMenuInput('A'), 'LEFT');
    assert.strictEqual(renderer.normalizeMenuInput('ArrowRight'), 'RIGHT');
    assert.strictEqual(renderer.normalizeMenuInput('d'), 'RIGHT');
    assert.strictEqual(renderer.normalizeMenuInput('D'), 'RIGHT');
    assert.strictEqual(renderer.normalizeMenuInput(' '), 'CONFIRM');
    assert.strictEqual(renderer.normalizeMenuInput('Enter'), 'CONFIRM');
    assert.strictEqual(renderer.normalizeMenuInput('Escape'), 'CANCEL');
    assert.strictEqual(renderer.normalizeMenuInput('x'), 'CANCEL');
    assert.strictEqual(renderer.normalizeMenuInput('X'), 'CANCEL');
    assert.strictEqual(renderer.normalizeMenuInput('UnknownKey'), null);

    // ---------------------------------------------------------
    // カテゴリB：異常系・フェイルファスト検証 (TC-MR-FAIL)
    // ---------------------------------------------------------
    console.log("Running Category B: Fail-Fast Validations");

    const validCanvas = { width: 800, height: 600 };
    const validState = { phase: 'ROOT', rootIndex: 0 };
    const mockCtx = new MockCtx();

    // ctx 不正検知
    assert.throws(() => renderer.render(null, validCanvas, validState), /TypeError/);
    assert.throws(() => renderer.render(undefined, validCanvas, validState), /TypeError/);
    assert.throws(() => renderer.render({}, validCanvas, validState), /TypeError/);

    // canvas 寸法不正検知
    assert.throws(() => renderer.render(mockCtx, null, validState), /TypeError|RangeError/);
    assert.throws(() => renderer.render(mockCtx, { width: 0, height: 600 }, validState), /TypeError|RangeError/);
    assert.throws(() => renderer.render(mockCtx, { width: 800, height: -1 }, validState), /TypeError|RangeError/);

    // 必須状態不正検知
    assert.throws(() => renderer.render(mockCtx, validCanvas, null), /TypeError/);
    assert.throws(() => renderer.render(mockCtx, validCanvas, undefined), /TypeError/);

    // ---------------------------------------------------------
    // カテゴリC：ヘッドレス互換性検証 (TC-MR-HEADLESS)
    // ---------------------------------------------------------
    console.log("Running Category C: Headless Compatibility");

    // 純粋 Node.js 環境下での完走確認
    assert.doesNotThrow(() => {
        renderer.render(mockCtx, validCanvas, validState);
    });

    console.log("MenuRenderer Tests Passed.");
}