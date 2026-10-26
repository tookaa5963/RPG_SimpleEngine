import { sound } from './sound.js';

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

/**
 * オーディオディスパッチャおよび具象サウンドファサード
 */
export class AudioService {
    /**
     * 効果音（SE）の再生
     * @param {string} soundId
     */
    playSe(soundId) {
        if (typeof soundId !== 'string') {
            throw createProtocolError('TypeError', 'audioService.js:playSe', 'soundId', soundId);
        }
        if (soundId.trim() === '') {
            throw createProtocolError('EmptyStringError', 'audioService.js:playSe', 'soundId', soundId);
        }

        if (soundId === 'victory') {
            sound.playVictory();
            return;
        }
        if (soundId === 'bump') {
            sound.playBump();
            return;
        }
        if (soundId === 'inn') {
            sound.playInn();
            return;
        }
        if (soundId === 'heal') {
            sound.playHeal();
            return;
        }
        if (soundId === 'cancel') {
            sound.playCancel();
            return;
        }
        if (soundId === 'submit') {
            sound.playSubmit();
            return;
        }

        throw createProtocolError('NotFoundError', 'audioService.js:playSe', 'soundId', soundId);
    }

    /**
     * BGMの再生
     * @param {string} bgmKey
     */
    playBgm(bgmKey) {
        if (typeof bgmKey !== 'string') {
            throw createProtocolError('TypeError', 'audioService.js:playBgm', 'bgmKey', bgmKey);
        }
        if (bgmKey.trim() === '') {
            throw createProtocolError('EmptyStringError', 'audioService.js:playBgm', 'bgmKey', bgmKey);
        }
        sound.playBgm(bgmKey);
    }

    /**
     * BGMの停止
     */
    stopBgm() {
        sound.stopBgm();
    }

    /**
     * イベント駆動型オーディオ通知のディスパッチ
     * @param {string} action
     * @param {*} [payload]
     */
    handleAudioEvent(action, payload) {
        if (typeof action !== 'string') {
            throw createProtocolError('TypeError', 'audioService.js:handleAudioEvent', 'action', action);
        }
        if (action.trim() === '') {
            throw createProtocolError('EmptyStringError', 'audioService.js:handleAudioEvent', 'action', action);
        }

        if (action === 'bump') {
            this.playSe('bump');
            return;
        }
        if (action === 'inn') {
            this.playSe('inn');
            return;
        }
        if (action === 'stopBgm') {
            this.stopBgm();
            return;
        }
        if (action === 'playBgm') {
            this.playBgm(payload);
            return;
        }

        throw createProtocolError('NotFoundError', 'audioService.js:handleAudioEvent', 'action', action);
    }

    /**
     * SE要求イベントのハンドリング
     * @param {string} soundId
     */
    handleSeEvent(soundId) {
        this.playSe(soundId);
    }
}

export const audioService = new AudioService();
