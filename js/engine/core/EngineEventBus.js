/**
 * EngineEventBus
 * 完全ヘッドレス環境で動作する純粋なPub/Subイベントメッセージングハブ。
 */
export class EngineEventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * イベントリスナーを登録します。
     * @param {string} eventType 
     * @param {Function} callback 
     * @returns {Function} 購読解除関数
     */
    on(eventType, callback) {
        if (typeof eventType !== 'string') {
            throw new TypeError('eventType must be a string');
        }
        if (eventType.length === 0) {
            throw new TypeError('eventType must not be empty');
        }
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }

        let callbackList = this.listeners.get(eventType);
        if (typeof callbackList === 'undefined') {
            callbackList = [];
            this.listeners.set(eventType, callbackList);
        }

        callbackList.push(callback);

        return () => {
            this.off(eventType, callback);
        };
    }

    /**
     * イベントリスナーを解除します。
     * @param {string} eventType 
     * @param {Function} callback 
     */
    off(eventType, callback) {
        if (typeof eventType !== 'string') {
            throw new TypeError('eventType must be a string');
        }
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }

        const callbackList = this.listeners.get(eventType);
        if (typeof callbackList === 'undefined') {
            return;
        }

        const index = callbackList.indexOf(callback);
        if (index !== -1) {
            callbackList.splice(index, 1);
        }

        if (callbackList.length === 0) {
            this.listeners.delete(eventType);
        }
    }

    /**
     * イベントを発行し、登録されたリスナーを同期実行します。
     * @param {string} eventType 
     * @param {*} payload 
     */
    emit(eventType, payload) {
        if (typeof eventType !== 'string') {
            throw new TypeError('eventType must be a string');
        }

        const callbackList = this.listeners.get(eventType);
        if (typeof callbackList === 'undefined') {
            return;
        }

        const executionList = callbackList.slice();
        for (let i = 0; i < executionList.length; i = i + 1) {
            const callback = executionList[i];
            callback(payload);
        }
    }

    /**
     * 指定イベントまたは全イベントのリスナーを解除します。
     * @param {string} [eventType] 
     */
    clear(eventType) {
        if (typeof eventType === 'undefined') {
            this.listeners.clear();
            return;
        }

        if (typeof eventType !== 'string') {
            throw new TypeError('eventType must be a string or undefined');
        }

        this.listeners.delete(eventType);
    }
}