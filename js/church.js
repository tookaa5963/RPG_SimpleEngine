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

export let CHURCH_DATA = null;

export async function initChurchData() {
    const res = await fetch('data/facilities/church.json');
    if (!res.ok) {
        throw createProtocolError('HttpError', 'church.js:initChurchData', 'res.status', res.status);
    }
    CHURCH_DATA = await res.json();
    console.log('CHURCH_DATA initialized successfully from church.json.');
}

export class ChurchManager {
    constructor(player, messageWindow, options = {}) {
        if (typeof player === 'undefined') {
            throw createProtocolError('TypeError', 'church.js:ChurchManager.constructor', 'player', undefined);
        }
        if (player === null) {
            throw createProtocolError('NullValueError', 'church.js:ChurchManager.constructor', 'player', null);
        }
        if (typeof messageWindow === 'undefined') {
            throw createProtocolError('TypeError', 'church.js:ChurchManager.constructor', 'messageWindow', undefined);
        }
        if (messageWindow === null) {
            throw createProtocolError('NullValueError', 'church.js:ChurchManager.constructor', 'messageWindow', null);
        }

        this.player = player;
        this.msgWin = messageWindow;
        this.onPlaySound = null;

        if (typeof options === 'object') {
            if (options !== null) {
                if (typeof options.onPlaySound === 'function') {
                    this.onPlaySound = options.onPlaySound;
                }
            }
        }
    }

    _ensureData() {
        if (typeof CHURCH_DATA === 'undefined') {
            throw createProtocolError('DataNotInitializedError', 'church.js:ChurchManager._ensureData', 'CHURCH_DATA', undefined);
        }
        if (CHURCH_DATA === null) {
            throw createProtocolError('DataNotInitializedError', 'church.js:ChurchManager._ensureData', 'CHURCH_DATA', null);
        }
    }

    getMessage(key) {
        this._ensureData();
        if (typeof key !== 'string') {
            throw createProtocolError('TypeError', 'church.js:ChurchManager.getMessage', 'key', key);
        }
        if (key.trim() === '') {
            throw createProtocolError('EmptyStringError', 'church.js:ChurchManager.getMessage', 'key', key);
        }
        if (typeof CHURCH_DATA.messages === 'undefined') {
            throw createProtocolError('MissingPropertyError', 'church.js:ChurchManager.getMessage', 'CHURCH_DATA.messages', undefined);
        }
        const msgObj = CHURCH_DATA.messages[key];
        if (typeof msgObj === 'undefined') {
            throw createProtocolError('NotFoundError', 'church.js:ChurchManager.getMessage', `messages.${key}`, undefined);
        }
        return i18n.resolve(msgObj);
    }

    open(npc) {
        this._ensureData();
        this.msgWin.openMenu(
            this.getMessage('greeting'),
            [
                i18n.resolve(CHURCH_DATA.commands.talk),
                i18n.resolve(CHURCH_DATA.commands.set_return),
                i18n.resolve(CHURCH_DATA.commands.leave)
            ],
            (selectedIndex) => this.handleMenuSelect(selectedIndex, npc),
            () => this.handleCancel()
        );
    }

    setReturnPoint(npc) {
        if (typeof npc === 'object') {
            if (npc !== null) {
                if (typeof npc.returnPoint !== 'undefined') {
                    if (npc.returnPoint !== null) {
                        this.player.returnPoint = { ...npc.returnPoint };
                    }
                }
            }
        }
        if (typeof this.onPlaySound === 'function') {
            this.onPlaySound('victory');
        }
        return {
            success: true,
            soundId: 'victory',
            returnPoint: this.player.returnPoint
        };
    }

    handleMenuSelect(index, npc) {
        if (index === 0) {
            let isScholarTalked = false;
            if (typeof this.player.flags === 'object') {
                if (this.player.flags !== null) {
                    if (this.player.flags.talkedToScholar === true) {
                        isScholarTalked = true;
                    }
                }
            }

            if (!isScholarTalked) {
                this.msgWin.open([
                    this.getMessage('hint_scholar_1'),
                    this.getMessage('hint_scholar_2')
                ]);
            } else {
                this.msgWin.open([
                    this.getMessage('hint_general')
                ]);
            }
        } else if (index === 1) {
            this.setReturnPoint(npc);
            this.msgWin.open([
                this.getMessage('return_registered')
            ]);
        } else {
            this.handleCancel();
        }
    }

    handleCancel() {
        this.msgWin.open([this.getMessage('blessing')]);
    }
}
