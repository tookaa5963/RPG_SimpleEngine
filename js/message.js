// FILE_ENTRY: js/message.js
import { audioService } from './audioService.js';
import { drawFrame } from './ui.js';
import { i18n } from './i18n.js';

/**
 * プロトコル第3項準拠の高解像度例外を生成する決定論的ヘルパー
 * @param {string} type 例外種別
 * @param {string} contextId 発生箇所（ファイル名:関数名）
 * @param {string} propName 不正を検知したプロパティ名
 * @param {*} val 実際に渡された値
 * @returns {Error}
 */
export function createProtocolError(type, contextId, propName, val) {
    return new Error(`[${type}] ${contextId}: プロパティ "${propName}" が不正です (値: ${JSON.stringify(val)}, 型: ${typeof val})`);
}

export class MessageWindow {
    constructor(onCloseCallback) {
        if (typeof onCloseCallback !== 'undefined') {
            if (onCloseCallback !== null) {
                if (typeof onCloseCallback !== 'function') {
                    throw createProtocolError('TypeError', 'message.js:constructor', 'onCloseCallback', onCloseCallback);
                }
            }
        }

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
        if (typeof text !== 'string') {
            throw createProtocolError('TypeError', 'message.js:wrapJapaneseText', 'text', text);
        }
        if (typeof maxCharsPerLine !== 'number') {
            throw createProtocolError('TypeError', 'message.js:wrapJapaneseText', 'maxCharsPerLine', maxCharsPerLine);
        }

        const rawLines = text.split('\n');
        const wrappedLines = [];

        rawLines.forEach(line => {
            let current = '';
            let currentLen = 0;
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                let chLen = 0.5;
                if (ch.charCodeAt(0) > 255) {
                    chLen = 1;
                }
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
        if (typeof text !== 'string') {
            throw createProtocolError('TypeError', 'message.js:wrapWesternText', 'text', text);
        }
        if (typeof maxCharsPerLine !== 'number') {
            throw createProtocolError('TypeError', 'message.js:wrapWesternText', 'maxCharsPerLine', maxCharsPerLine);
        }

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
        if (!Array.isArray(textArray)) {
            throw createProtocolError('TypeError', 'message.js:open', 'textArray', textArray);
        }
        if (onComplete !== null) {
            if (typeof onComplete !== 'function') {
                throw createProtocolError('TypeError', 'message.js:open', 'onComplete', onComplete);
            }
        }

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
            let wrappedLines;
            if (isWestern) {
                wrappedLines = this.wrapWesternText(text, MAX_CHARS_WESTERN);
            } else {
                wrappedLines = this.wrapJapaneseText(text, MAX_CHARS_JA);
            }

            for (let i = 0; i < wrappedLines.length; i += MAX_LINES_PER_PAGE) {
                expandedQueue.push(wrappedLines.slice(i, i + MAX_LINES_PER_PAGE).join('\n'));
            }
        });

        this.textQueue = expandedQueue;
        this.isOpen = true;
        this.nextPage();
    }

    openMenu(messageText, options, onSelect, onCancel = null) {
        if (typeof messageText !== 'string') {
            throw createProtocolError('TypeError', 'message.js:openMenu', 'messageText', messageText);
        }
        if (!Array.isArray(options)) {
            throw createProtocolError('TypeError', 'message.js:openMenu', 'options', options);
        }
        if (typeof onSelect !== 'function') {
            throw createProtocolError('TypeError', 'message.js:openMenu', 'onSelect', onSelect);
        }
        if (onCancel !== null) {
            if (typeof onCancel !== 'function') {
                throw createProtocolError('TypeError', 'message.js:openMenu', 'onCancel', onCancel);
            }
        }

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
            audioService.playSe('submit');
        } else {
            this.isOpen = false;
            this.hasMenu = false;
            audioService.playSe('submit');
            const cb = this.onComplete;
            this.onComplete = null;
            if (cb) {
                cb();
            }
            if (!this.isOpen) {
                if (this.onClose) {
                    this.onClose();
                }
            }
        }
    }

    update() {
        if (!this.isOpen) {
            return;
        }
        if (this.isComplete) {
            return;
        }

        this.charTimer++;
        if (this.charTimer >= this.textSpeed) {
            this.charTimer = 0;
            if (this.charIndex < this.currentText.length) {
                const char = this.currentText[this.charIndex];
                this.displayedText += char;
                this.charIndex++;

                if (char !== ' ') {
                    if (char !== '\n') {
                        audioService.playSe('textChar');
                    }
                }
            } else {
                this.isComplete = true;
            }
        }
    }

    handleAction() {
        if (!this.isOpen) {
            return;
        }

        if (!this.isComplete) {
            this.displayedText = this.currentText;
            this.charIndex = this.currentText.length;
            this.isComplete = true;
            return;
        }

        if (this.hasMenu) {
            if (this.textQueue.length === 0) {
                if (this.onMenuSelect) {
                    audioService.playSe('submit');
                    const selected = this.menuIndex;
                    this.hasMenu = false;
                    this.onMenuSelect(selected);
                }
                return;
            }
        }

        this.nextPage();
    }

    handleKeyDown(keyName) {
        if (!this.isOpen) {
            return;
        }
        if (typeof keyName !== 'string') {
            throw createProtocolError('TypeError', 'message.js:handleKeyDown', 'keyName', keyName);
        }

        if (this.hasMenu) {
            if (this.textQueue.length === 0) {
                if (this.isComplete) {
                    if (keyName === 'ArrowUp') {
                        audioService.playSe('cursor');
                        this.menuIndex = (this.menuIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
                        return;
                    }
                    if (keyName === 'ArrowDown') {
                        audioService.playSe('cursor');
                        this.menuIndex = (this.menuIndex + 1) % this.menuOptions.length;
                        return;
                    }
                    if (keyName === 'Escape') {
                        if (this.onMenuCancel) {
                            audioService.playSe('cancel');
                            this.hasMenu = false;
                            this.onMenuCancel();
                        } else {
                            audioService.playSe('cancel');
                            this.close();
                        }
                        return;
                    }
                }
            }
        }

        if (keyName === 'Enter') {
            this.handleAction();
            return;
        }
        if (keyName === 'Escape') {
            audioService.playSe('cancel');
            this.close();
            return;
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
        if (!this.isOpen) {
            if (this.onClose) {
                this.onClose();
            }
        }
    }

    draw(ctx, canvas) {
        if (!this.isOpen) {
            return;
        }

        let cw = 768;
        let ch = 768;
        if (canvas) {
            cw = canvas.width;
            ch = canvas.height;
        }

        const margin = Math.floor(cw * 0.04);
        const winX = margin;
        const winWidth = cw - (margin * 2);
        const winHeight = Math.floor(ch * 0.28);
        let winY = ch - winHeight - margin;
        if (this.isTop) {
            winY = margin;
        }

        drawFrame(ctx, winX, winY, winWidth, winHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lines = this.displayedText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], winX + 24, winY + 24 + (i * 30));
        }

        if (this.isComplete) {
            if (!this.hasMenu) {
                if (Math.floor(Date.now() / 400) % 2 === 0) {
                    ctx.fillText('▼', winX + winWidth - 36, winY + winHeight - 32);
                }
            }
        }

        if (this.hasMenu) {
            if (this.isComplete) {
                if (this.textQueue.length === 0) {
                    const optCount = this.menuOptions.length;
                    let maxLen = 0;
                    this.menuOptions.forEach(opt => {
                        if (opt.length > maxLen) {
                            maxLen = opt.length;
                        }
                    });

                    const optW = Math.max(160, maxLen * 14 + 64);
                    const optH = 24 + optCount * 32;
                    const optX = cw - optW - margin;
                    let optY = winY - optH - 12;
                    if (this.isTop) {
                        optY = winY + winHeight + 12;
                    }

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
    }
}
