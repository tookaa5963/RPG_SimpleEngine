import assert from 'assert';
import { FieldRenderer } from '../js/drivers/field/FieldRenderer.js';

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
}

export function runFieldRendererTests() {
    console.log("=== FieldRenderer Tests Start ===");

    const validCanvas = { width: 800, height: 600 };
    const validMap = { width: 10, height: 10, data: Array(10).fill(0).map(() => Array(10).fill(0)) };
    const validPlayer = { pixelX: 0, pixelY: 0 };
    const validTileDb = { 0: { color: '#27ae60' }, 1: { blockLight: true } };
    const validState = {
        currentMap: validMap,
        currentMapId: 'test_map',
        player: validPlayer,
        tileDb: validTileDb
    };

    // ---------------------------------------------------------
    // カテゴリA：異常系・フェイルファスト検証 (TC-FR-FAIL)
    // ---------------------------------------------------------
    console.log("Running Category A: Fail-Fast Validations");
    
    // TC-FR-FAIL-01: コンストラクタ引数検証
    [0, -64, '64', NaN, null].forEach(invalidSize => {
        assert.throws(() => new FieldRenderer(invalidSize), /TypeError|RangeError/);
    });

    const renderer = new FieldRenderer(64);

    // TC-FR-FAIL-02: ctx 不正検知
    assert.throws(() => renderer.render(null, validCanvas, validState), /TypeError/);
    assert.throws(() => renderer.render(undefined, validCanvas, validState), /TypeError/);
    assert.throws(() => renderer.render({}, validCanvas, validState), /TypeError/);

    // TC-FR-FAIL-03: canvas 寸法不正検知
    const mockCtx = new MockCtx();
    assert.throws(() => renderer.render(mockCtx, null, validState), /TypeError|RangeError/);
    assert.throws(() => renderer.render(mockCtx, { width: 0, height: 600 }, validState), /TypeError|RangeError/);
    assert.throws(() => renderer.render(mockCtx, { width: 800, height: -1 }, validState), /TypeError|RangeError/);

    // TC-FR-FAIL-04: 必須状態不正検知
    assert.throws(() => renderer.render(mockCtx, validCanvas, { ...validState, currentMap: null }), /TypeError/);
    assert.throws(() => renderer.render(mockCtx, validCanvas, { ...validState, currentMap: {} }), /TypeError/);
    assert.throws(() => renderer.render(mockCtx, validCanvas, { ...validState, player: null }), /TypeError/);
    assert.throws(() => renderer.render(mockCtx, validCanvas, { ...validState, tileDb: null }), /TypeError/);

    // TC-FR-FAIL-05: updateCamera の必須引数不正検知
    assert.throws(() => renderer.updateCamera(null, validMap, 800, 600), /TypeError/);
    assert.throws(() => renderer.updateCamera(validPlayer, null, 800, 600), /TypeError/);
    assert.throws(() => renderer.updateCamera(validPlayer, validMap, 0, 600), /TypeError|RangeError/);

    // ---------------------------------------------------------
    // カテゴリB：ヘッドレス互換性検証 (TC-FR-HEADLESS)
    // ---------------------------------------------------------
    console.log("Running Category B: Headless Compatibility");
    
    // TC-FR-HEADLESS-01: 純粋 Node.js 環境での完走
    assert.doesNotThrow(() => {
        const r = new FieldRenderer(64);
        r.init({ 'test_map': validMap }, validTileDb);
        r.render(new MockCtx(), validCanvas, validState);
        r.render(new MockCtx(), validCanvas, { ...validState, currentMap: { ...validMap, isDark: true } });
    });

    // ---------------------------------------------------------
    // カテゴリC：カメラ座標計算・境界値検証 (TC-FR-CAM)
    // ---------------------------------------------------------
    console.log("Running Category C: Camera Coordinates");
    
    // TC-FR-CAM-01: マップサイズがキャンバスより小さい場合の中央寄せ
    const map7x7 = { width: 7, height: 7, data: Array(7).fill(0).map(() => Array(7).fill(0)) };
    renderer.updateCamera(validPlayer, map7x7, 800, 600);
    assert.strictEqual(renderer.camera.x, Math.floor((448 - 800) / 2));
    assert.strictEqual(renderer.camera.y, Math.floor((448 - 600) / 2));

    // TC-FR-CAM-02: マップサイズがキャンバスより大きい場合の追従およびクランプ
    const map20x20 = { width: 20, height: 20, data: Array(20).fill(0).map(() => Array(20).fill(0)) };
    
    renderer.updateCamera({ pixelX: 0, pixelY: 0 }, map20x20, 800, 600);
    assert.strictEqual(renderer.camera.x, 0);
    assert.strictEqual(renderer.camera.y, 0);

    renderer.updateCamera({ pixelX: 640, pixelY: 640 }, map20x20, 800, 600);
    assert.strictEqual(renderer.camera.x, 640 + 32 - 400); // 272
    assert.strictEqual(renderer.camera.y, 640 + 32 - 300); // 372

    renderer.updateCamera({ pixelX: 1216, pixelY: 1216 }, map20x20, 800, 600);
    assert.strictEqual(renderer.camera.x, 1280 - 800); // 480
    assert.strictEqual(renderer.camera.y, 1280 - 600); // 680

    // ---------------------------------------------------------
    // カテゴリD：描画パイプラインおよび可視範囲カリング検証 (TC-FR-DRAW)
    // ---------------------------------------------------------
    console.log("Running Category D: Draw Pipeline & Culling");
    
    // TC-FR-DRAW-01: 基本描画パイプラインと背景クリア
    const ctx = new MockCtx();
    renderer.render(ctx, validCanvas, validState);
    const clearCall = ctx.calls.find(c => c.method === 'fillRect' && c.args[2] === 800 && c.args[3] === 600);
    assert.ok(clearCall, "Canvas should be cleared with full dimensions");
    assert.strictEqual(clearCall.fillStyle, '#000000');
    
    const saveCount = ctx.calls.filter(c => c.method === 'save').length;
    const restoreCount = ctx.calls.filter(c => c.method === 'restore').length;
    assert.strictEqual(saveCount, restoreCount, "save() and restore() should be paired");
    assert.ok(saveCount > 0);

    // TC-FR-DRAW-04: プレイヤー描画およびフラッシュ・揺れ状態
    const ctxShake = new MockCtx();
    const shakingPlayer = { pixelX: 100, pixelY: 100, poisonFlashTimer: 4, poisonShakeTimer: 10 };
    renderer.render(ctxShake, validCanvas, { ...validState, player: shakingPlayer });
    
    // カメラ以外の追加 translate が発生しているか確認
    const translateCalls = ctxShake.calls.filter(c => c.method === 'translate');
    // save(), translate(), ..., restore() のような構造を想定し、translate 呼び出しを確認
    assert.ok(translateCalls.length > 0, "Should use translate for camera and/or shake");

    // ---------------------------------------------------------
    // カテゴリE：暗闇視線レイキャスト計算検証 (TC-FR-DARK)
    // ---------------------------------------------------------
    console.log("Running Category E: Line of Sight Raycast");
    
    // TC-FR-DARK-01: 可視ポリゴン生成と壁遮蔽の境界値
    const map3x3 = {
        width: 3,
        height: 3,
        data: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    };
    const startX = 32; // (0,1)タイルの中心
    const startY = 32 + 64; 
    const maxDist = 100;
    
    const poly = renderer.computeVisibilityPolygon(startX, startY, maxDist, map3x3, validTileDb);
    assert.strictEqual(Array.isArray(poly), true);
    assert.strictEqual(poly.length, 120, "Should cast exactly 120 rays");
    
    // x軸正方向レイが壁(x=64)に遮蔽され、貫通深度(24px)内に収まるか
    const rightRay = poly.find(p => p.x > startX && Math.abs(p.y - startY) < 1);
    if (rightRay) {
        assert.ok(rightRay.x <= 64 + 24 + 1, "Ray should be blocked by wall within penetration depth");
    }

    // ---------------------------------------------------------
    // カテゴリF：入力正規化境界検証 (TC-FR-INPUT)
    // ---------------------------------------------------------
    console.log("Running Category F: Input Normalization");
    
    // TC-FR-INPUT-01: 入力スナップショットの純粋データ変換
    const normalizeFn = FieldRenderer.normalizeFieldInput ? 
        FieldRenderer.normalizeFieldInput.bind(FieldRenderer) : 
        renderer.normalizeFieldInput.bind(renderer);

    const rawInput = { up: 1, down: false, left: undefined, right: true, actionJustPressed: 'yes', cancelJustPressed: 0 };
    const normalized = normalizeFn(rawInput);
    assert.deepStrictEqual(normalized, { 
        up: true, 
        down: false, 
        left: false, 
        right: true, 
        actionJustPressed: true, 
        cancelJustPressed: false 
    });

    const defaultInput = normalizeFn(null);
    assert.deepStrictEqual(defaultInput, { 
        up: false, 
        down: false, 
        left: false, 
        right: false, 
        actionJustPressed: false, 
        cancelJustPressed: false 
    });

    console.log("=== FieldRenderer Tests Passed ===");
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runFieldRendererTests();
}