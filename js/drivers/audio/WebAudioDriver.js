import { EventTypes } from '../../engine/core/EventTypes.js';

/**
 * sound.js の具象メソッド名マッピング（全17種）
 */
const SE_METHOD_MAP = Object.freeze({
  footstep: 'playFootstep',
  bump: 'playBump',
  textChar: 'playTextChar',
  cursor: 'playCursor',
  cancel: 'playCancel',
  submit: 'playSubmit',
  stairs: 'playStairs',
  chest: 'playChest',
  encounter: 'playEncounter',
  attack: 'playAttack',
  poisonDamage: 'playPoisonDamage',
  escape: 'playEscape',
  victory: 'playVictory',
  heal: 'playHeal',
  inn: 'playInn',
  buy: 'playBuy',
  magic: 'playMagic',
});

/**
 * WebAudioDriver
 * EngineEventBus の音声イベントを購読し、SoundSystem へ取り次ぐ出力ドライバ。
 */
export class WebAudioDriver {
  /**
   * @param {Object} eventBus - EngineEventBus インスタンス
   * @param {Object} soundInstance - SoundSystem インスタンス
   */
  constructor(eventBus, soundInstance) {
    if (typeof eventBus !== 'object' || eventBus === null) {
      throw new TypeError('[WebAudioDriver] eventBus は有効なオブジェクトである必要があります');
    }
    if (typeof eventBus.on !== 'function') {
      throw new TypeError('[WebAudioDriver] eventBus.on メソッドが存在しません');
    }
    if (typeof soundInstance !== 'object' || soundInstance === null) {
      throw new TypeError('[WebAudioDriver] soundInstance は有効なオブジェクトである必要があります');
    }

    this.eventBus = eventBus;
    this.sound = soundInstance;
    this.unsubscribers = [];
    this.isSubscribed = false;

    this.handlePlaySe = this.handlePlaySe.bind(this);
    this.handlePlayBgm = this.handlePlayBgm.bind(this);
    this.handleStopBgm = this.handleStopBgm.bind(this);
  }

  /**
   * 音声イベントの購読を開始します。
   */
  subscribe() {
    if (this.isSubscribed) {
      return;
    }

    const unsubSe = this.eventBus.on(EventTypes.SYSTEM.AUDIO_PLAY_SE, this.handlePlaySe);
    const unsubBgm = this.eventBus.on(EventTypes.SYSTEM.AUDIO_PLAY_BGM, this.handlePlayBgm);
    const unsubStop = this.eventBus.on(EventTypes.SYSTEM.AUDIO_STOP_BGM, this.handleStopBgm);

    if (typeof unsubSe === 'function') {
      this.unsubscribers.push(unsubSe);
    }
    if (typeof unsubBgm === 'function') {
      this.unsubscribers.push(unsubBgm);
    }
    if (typeof unsubStop === 'function') {
      this.unsubscribers.push(unsubStop);
    }

    this.isSubscribed = true;
  }

  /**
   * 音声イベントの購読を解除します。
   */
  unsubscribe() {
    if (!this.isSubscribed) {
      return;
    }

    for (let i = 0; i < this.unsubscribers.length; i = i + 1) {
      const unsub = this.unsubscribers[i];
      unsub();
    }

    this.unsubscribers = [];
    this.isSubscribed = false;
  }

  /**
   * SE再生イベントハンドラ
   * @param {string|Object} payload - SE名または { se: string } / { soundId: string }
   */
  handlePlaySe(payload) {
    let soundId = '';

    if (typeof payload === 'string') {
      soundId = payload;
    } else if (typeof payload === 'object' && payload !== null) {
      if (typeof payload.se === 'string') {
        soundId = payload.se;
      } else if (typeof payload.soundId === 'string') {
        soundId = payload.soundId;
      }
    }

    if (soundId === '') {
      throw new TypeError('[WebAudioDriver:handlePlaySe] payload に有効な soundId が指定されていません');
    }

    const methodName = SE_METHOD_MAP[soundId];
    if (typeof methodName !== 'string') {
      throw new Error(`[WebAudioDriver:handlePlaySe] 未定義の soundId です: "${soundId}"`);
    }

    const targetFunc = this.sound[methodName];
    if (typeof targetFunc !== 'function') {
      throw new Error(`[WebAudioDriver:handlePlaySe] SoundSystem にメソッド "${methodName}" が存在しません`);
    }

    targetFunc.call(this.sound);
  }

  /**
   * BGM再生イベントハンドラ
   * @param {string|Object} payload - BGMキーまたは { bgm: string } / { bgmKey: string }
   */
  handlePlayBgm(payload) {
    let bgmKey = '';

    if (typeof payload === 'string') {
      bgmKey = payload;
    } else if (typeof payload === 'object' && payload !== null) {
      if (typeof payload.bgm === 'string') {
        bgmKey = payload.bgm;
      } else if (typeof payload.bgmKey === 'string') {
        bgmKey = payload.bgmKey;
      }
    }

    if (bgmKey === '') {
      throw new TypeError('[WebAudioDriver:handlePlayBgm] payload に有効な bgmKey が指定されていません');
    }

    if (typeof this.sound.playBgm !== 'function') {
      throw new Error('[WebAudioDriver:handlePlayBgm] SoundSystem に playBgm メソッドが存在しません');
    }

    this.sound.playBgm(bgmKey);
  }

  /**
   * BGM停止イベントハンドラ
   */
  handleStopBgm() {
    if (typeof this.sound.stopBgm !== 'function') {
      throw new Error('[WebAudioDriver:handleStopBgm] SoundSystem に stopBgm メソッドが存在しません');
    }

    this.sound.stopBgm();
  }
}