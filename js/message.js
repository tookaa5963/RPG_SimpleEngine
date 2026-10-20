// FILE_ENTRY: js/message.js
import { sound } from './sound.js';
import { drawFrame } from './ui.js';
import { i18n } from './i18n.js';

export class MessageWindow {
  constructor(onCloseCallback) {
    this.textQueue = [];
    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 2;
    this.isComplete = false;
    this.isOpen = false;
    this.onClose = onCloseCallback;
    this.isTop = false;

    this.hasMenu = false;
    this.menuOptions = [];
    this.menuIndex = 0;
    this.onMenuSelect = null;
    this.onMenuCancel = null;
    this.onComplete = null;
  }

  wrapJapaneseText(text, maxCharsPerLine) {
    const rawLines = text.split('\n');
    const wrappedLines = [];

    rawLines.forEach(line => {
      let current = '';
      let currentLen = 0;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const chLen = ch.charCodeAt(0) > 255 ? 1 : 0.5;
        if (currentLen + chLen > maxCharsPerLine) {
          wrappedLines.push(current);
          current = ch;
          currentLen = chLen;
        } else {
          current += ch;
          currentLen += chLen;
        }
      }
      if (current) {
        wrappedLines.push(current);
      }
    });

    return wrappedLines;
  }

  wrapWesternText(text, maxCharsPerLine) {
    const rawLines = text.split('\n');
    const wrappedLines = [];

    rawLines.forEach(line => {
      const words = line.split(' ');
      let currentLine = '';

      words.forEach(word => {
        if (!currentLine) {
          currentLine = word;
        } else if ((currentLine.length + 1 + word.length) <= maxCharsPerLine) {
          currentLine += ' ' + word;
        } else {
          wrappedLines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) {
        wrappedLines.push(currentLine);
      }
    });

    return wrappedLines;
  }

  open(textArray, onComplete = null) {
    this.hasMenu = false;
    this.menuOptions = [];
    this.onMenuSelect = null;
    this.onMenuCancel = null;
    this.onComplete = onComplete;

    const MAX_CHARS_JA = 26;
    const MAX_CHARS_WESTERN = 46;
    const MAX_LINES_PER_PAGE = 4;

    const isWestern = i18n.currentLang !== 'ja';
    const expandedQueue = [];

    textArray.forEach(text => {
      const wrappedLines = isWestern
        ? this.wrapWesternText(text, MAX_CHARS_WESTERN)
        : this.wrapJapaneseText(text, MAX_CHARS_JA);

      for (let i = 0; i < wrappedLines.length; i += MAX_LINES_PER_PAGE) {
        expandedQueue.push(wrappedLines.slice(i, i + MAX_LINES_PER_PAGE).join('\n'));
      }
    });

    this.textQueue = expandedQueue;
    this.isOpen = true;
    this.nextPage();
  }

  openMenu(messageText, options, onSelect, onCancel = null) {
    this.open([messageText]);
    this.hasMenu = true;
    this.menuOptions = options;
    this.menuIndex = 0;
    this.onMenuSelect = onSelect;
    this.onMenuCancel = onCancel;
  }

  nextPage() {
    if (this.textQueue.length > 0) {
      this.currentText = this.textQueue.shift();
      this.displayedText = '';
      this.charIndex = 0;
      this.charTimer = 0;
      this.isComplete = false;
      sound.playSubmit();
    } else {
      this.isOpen = false;
      this.hasMenu = false;
      sound.playSubmit();
      const cb = this.onComplete;
      this.onComplete = null;
      if (cb) {
        cb();
      }
      if (!this.isOpen && this.onClose) {
        this.onClose();
      }
    }
  }

  update() {
    if (!this.isOpen || this.isComplete) return;

    this.charTimer++;
    if (this.charTimer >= this.textSpeed) {
      this.charTimer = 0;
      if (this.charIndex < this.currentText.length) {
        const char = this.currentText[this.charIndex];
        this.displayedText += char;
        this.charIndex++;

        if (char !== ' ' && char !== '\n') {
          sound.playTextChar();
        }
      } else {
        this.isComplete = true;
      }
    }
  }

  handleAction() {
    if (!this.isOpen) return;

    if (!this.isComplete) {
      this.displayedText = this.currentText;
      this.charIndex = this.currentText.length;
      this.isComplete = true;
      return;
    }

    if (this.hasMenu && this.textQueue.length === 0) {
      if (this.onMenuSelect) {
        sound.playSubmit();
        const selected = this.menuIndex;
        this.hasMenu = false;
        this.onMenuSelect(selected);
      }
      return;
    }

    this.nextPage();
  }

  handleKeyDown(keyName) {
    if (!this.isOpen) return;

    if (this.hasMenu && this.textQueue.length === 0 && this.isComplete) {
      if (keyName === 'ArrowUp') {
        sound.playCursor();
        this.menuIndex = (this.menuIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        return;
      } else if (keyName === 'ArrowDown') {
        sound.playCursor();
        this.menuIndex = (this.menuIndex + 1) % this.menuOptions.length;
        return;
      } else if (keyName === 'Escape') {
        if (this.onMenuCancel) {
          sound.playCancel();
          this.hasMenu = false;
          this.onMenuCancel();
        } else {
          sound.playCancel();
          this.close();
        }
        return;
      }
    }

    if (keyName === 'Enter') {
      this.handleAction();
    } else if (keyName === 'Escape') {
      sound.playCancel();
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.hasMenu = false;
    this.textQueue = [];
    const cb = this.onComplete;
    this.onComplete = null;
    if (cb) {
      cb();
    }
    if (!this.isOpen && this.onClose) {
      this.onClose();
    }
  }

  draw(ctx, canvas) {
    if (!this.isOpen) return;

    const cw = canvas ? canvas.width : 768;
    const ch = canvas ? canvas.height : 768;

    const margin = Math.floor(cw * 0.04);
    const winX = margin;
    const winWidth = cw - (margin * 2);
    const winHeight = Math.floor(ch * 0.28);
    const winY = this.isTop ? margin : (ch - winHeight - margin);

    drawFrame(ctx, winX, winY, winWidth, winHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const lines = this.displayedText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], winX + 24, winY + 24 + (i * 30));
    }

    if (this.isComplete && !this.hasMenu && Math.floor(Date.now() / 400) % 2 === 0) {
      ctx.fillText('▼', winX + winWidth - 36, winY + winHeight - 32);
    }

    if (this.hasMenu && this.isComplete && this.textQueue.length === 0) {
      const optCount = this.menuOptions.length;
      let maxLen = 0;
      this.menuOptions.forEach(opt => {
        if (opt.length > maxLen) maxLen = opt.length;
      });

      const optW = Math.max(160, maxLen * 14 + 64);
      const optH = 24 + optCount * 32;
      const optX = cw - optW - margin;
      const optY = this.isTop ? (winY + winHeight + 12) : (winY - optH - 12);

      drawFrame(ctx, optX, optY, optW, optH);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      this.menuOptions.forEach((opt, idx) => {
        const posY = optY + 16 + idx * 32;
        ctx.fillText(opt, optX + 38, posY);
        if (this.menuIndex === idx) {
          ctx.fillText('▶', optX + 16, posY);
        }
      });
    }
  }
}