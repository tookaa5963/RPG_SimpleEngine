// FILE_ENTRY: js/input.js
export class InputManager {
  constructor() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.action = false;
    this.cancel = false;

    this._prevAction = false;
    this._prevCancel = false;
    this._prevUp = false;
    this._prevDown = false;
    this._prevLeft = false;
    this._prevRight = false;

    this.actionJustPressed = false;
    this.cancelJustPressed = false;
    this.upJustPressed = false;
    this.downJustPressed = false;
    this.leftJustPressed = false;
    this.rightJustPressed = false;

    this.keys = {};

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  update() {
    this.up = !!(this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']);
    this.down = !!(this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']);
    this.left = !!(this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']);
    this.right = !!(this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']);
    this.action = !!(this.keys[' '] || this.keys['Enter']);
    this.cancel = !!(this.keys['x'] || this.keys['X'] || this.keys['Escape']);

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp) {
        const dpadUp = gp.buttons[12]?.pressed;
        const dpadDown = gp.buttons[13]?.pressed;
        const dpadLeft = gp.buttons[14]?.pressed;
        const dpadRight = gp.buttons[15]?.pressed;
        const axisY = gp.axes[1] || 0;
        const axisX = gp.axes[0] || 0;
        const THRESHOLD = 0.5;

        if (dpadUp || axisY < -THRESHOLD) this.up = true;
        if (dpadDown || axisY > THRESHOLD) this.down = true;
        if (dpadLeft || axisX < -THRESHOLD) this.left = true;
        if (dpadRight || axisX > THRESHOLD) this.right = true;

        if (gp.buttons[0]?.pressed || gp.buttons[1]?.pressed) {
          this.action = true;
        }

        if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) {
          this.cancel = true;
        }
      }
    }

    this.actionJustPressed = this.action && !this._prevAction;
    this.cancelJustPressed = this.cancel && !this._prevCancel;
    this.upJustPressed = this.up && !this._prevUp;
    this.downJustPressed = this.down && !this._prevDown;
    this.leftJustPressed = this.left && !this._prevLeft;
    this.rightJustPressed = this.right && !this._prevRight;

    this._prevAction = this.action;
    this._prevCancel = this.cancel;
    this._prevUp = this.up;
    this._prevDown = this.down;
    this._prevLeft = this.left;
    this._prevRight = this.right;
  }

  get isAnyKeyPressed() {
    return this.up || this.down || this.left || this.right || this.action || this.cancel;
  }

  updateUIInput(emitVirtualKey) {
    if (this.actionJustPressed) emitVirtualKey('Enter');
    if (this.cancelJustPressed) emitVirtualKey('Escape');
    if (this.upJustPressed) emitVirtualKey('ArrowUp');
    if (this.downJustPressed) emitVirtualKey('ArrowDown');
    if (this.leftJustPressed) emitVirtualKey('ArrowLeft');
    if (this.rightJustPressed) emitVirtualKey('ArrowRight');
  }
}