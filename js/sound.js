// FILE_ENTRY: js/sound.js
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isUnlocked = false;
    this.pendingBgmKey = null;

    this.bgmEnabled = true;
    this.seEnabled = true;

    // マスター音量設定（BGM: 0.10, SE: 0.6倍スケール）
    this.bgmVolume = 0.10;
    this.seVolume = 0.55;

    this.loadSettings();

    // BGMの生成（MP3優先、WAVフォールバックの多重ソース登録）
    this.bgms = {
      opening: this.createBgmElement('bgm_opening', false),
      field: this.createBgmElement('bgm_peace_field', true),
      dungeon: this.createBgmElement('bgm_dungeon', true),
      battle: this.createBgmElement('bgm_battle', true),
      church: this.createBgmElement('bgm_church', true),
      dragons_cave: this.createBgmElement('bgm_dragons_cave', true)
    };

    this.setupAutoplayUnlock();
  }

  loadSettings() {
    try {
      const savedBgm = localStorage.getItem('camino_de_leyenda_setting_bgm');
      if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';

      const savedSe = localStorage.getItem('camino_de_leyenda_setting_se');
      if (savedSe !== null) this.seEnabled = savedSe === 'true';
    } catch (e) {
      console.warn('サウンド設定の読み込みに失敗しました:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('camino_de_leyenda_setting_bgm', String(this.bgmEnabled));
      localStorage.setItem('camino_de_leyenda_setting_se', String(this.seEnabled));
    } catch (e) {
      console.warn('サウンド設定の保存に失敗しました:', e);
    }
  }

  toggleBgm() {
    this.bgmEnabled = !this.bgmEnabled;
    this.saveSettings();
    if (!this.bgmEnabled) {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  toggleSe() {
    this.seEnabled = !this.seEnabled;
    this.saveSettings();
    if (this.seEnabled) {
      this.playSubmit();
    }
    return this.seEnabled;
  }

  // 拡張子なしのベース名からMP3/WAV両対応のAudio要素を生成
  createBgmElement(baseFileName, loop = true) {
    const audio = document.createElement('audio');
    audio.loop = loop;
    audio.volume = this.bgmVolume;

    const srcMp3 = document.createElement('source');
    srcMp3.src = `audio/${baseFileName}.mp3`;
    srcMp3.type = 'audio/mpeg';

    const srcWav = document.createElement('source');
    srcWav.src = `audio/${baseFileName}.wav`;
    srcWav.type = 'audio/wav';

    audio.appendChild(srcMp3);
    audio.appendChild(srcWav);

    return audio;
  }
setupAutoplayUnlock() {
    if (typeof window === 'undefined') {
      return;
    }
    const unlockHandler = (e) => {
      console.log(`[SoundSystem] 初回ユーザー操作検知 (${e.type}) - 音声アンロック試行`);
      this.unlock();
      ['pointerdown', 'keydown', 'click', 'touchstart'].forEach((type) => {
        window.removeEventListener(type, unlockHandler, true);
      });
    };
    ['pointerdown', 'keydown', 'click', 'touchstart'].forEach((type) => {
      window.addEventListener(type, unlockHandler, { capture: true, once: false });
    });
  }

  unlock() {
    if (typeof window !== 'undefined') {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    this.isUnlocked = true;

    if (this.pendingBgmKey) {
      const resumeKey = this.pendingBgmKey;
      console.log(`[SoundSystem] 保留中BGM [${resumeKey}] の自動復帰を実行`);
      this.pendingBgmKey = null;
      this.playBgm(resumeKey);
    }
  }

  playBgm(key) {
    if (!this.bgmEnabled) {
      console.log(`[SoundSystem] playBgm [${key}] 中止: bgmEnabled が false です`);
      this.currentBgmKey = key;
      this.pendingBgmKey = null;
      return;
    }

    if (!this.bgms[key]) {
      console.warn(`[SoundSystem] playBgm [${key}] 中止: 音源キーが存在しません`);
      return;
    }

    if (!this.isUnlocked) {
      console.log(`[SoundSystem] playBgm [${key}] 保留: ユーザー操作によるアンロック待機中`);
      this.pendingBgmKey = key;
      return;
    }

    if (this.currentBgmKey === key && !this.bgms[key].paused) {
      return;
    }

    this.stopBgm();

    this.currentBgmKey = key;
    const targetAudio = this.bgms[key];

    // メディアバッファ破棄を防ぐため、未ロード状態（HAVE_NOTHING）の場合のみ load() を呼び出す
    if (targetAudio.readyState === 0) {
      targetAudio.load();
    }
    targetAudio.currentTime = 0;

    targetAudio.play().then(() => {
      console.log(`[SoundSystem] BGM [${key}] 再生開始`);
      this.pendingBgmKey = null;
    }).catch(e => {
      console.warn(`BGM [${key}] 再生待機中:`, e);
      this.pendingBgmKey = key;
    });
  }

  stopBgm() {
    this.pendingBgmKey = null;
    if (this.currentBgmKey && this.bgms[this.currentBgmKey]) {
      const current = this.bgms[this.currentBgmKey];
      current.pause();
      current.currentTime = 0;
      this.currentBgmKey = null;
    }
  }

playTone(freq, duration, type = 'square', gainVal = 0.1) {
    if (this.pendingBgmKey) {
      this.unlock();
    }
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;

    const finalGain = gainVal * this.seVolume;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(finalGain, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration, gainVal = 0.05) {
    if (this.pendingBgmKey) {
      this.unlock();
    }
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;

    const finalGain = gainVal * this.seVolume;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(finalGain, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  playFootstep() {
    this.playNoise(0.04, 0.03);
  }

  playBump() {
    this.playTone(80, 0.08, 'triangle', 0.15);
  }

  playTextChar() {
    this.playTone(660, 0.03, 'square', 0.03);
  }

  playCursor() {
    this.playTone(440, 0.04, 'square', 0.05);
  }

  playCancel() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [330, 220].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.08 * this.seVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.05);
    });
  }

  playSubmit() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.08 * this.seVolume, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.06);
    });
  }

  playStairs() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [330, 293, 261, 220].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12 * this.seVolume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.08);
    });
  }

  playChest() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.1 * this.seVolume, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.12);
    });
  }

  playEncounter() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 440, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15 * this.seVolume, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.08);
    });
  }

  playAttack() {
    this.playNoise(0.12, 0.2);
    this.playTone(120, 0.08, 'square', 0.15);
  }

  playPoisonDamage() {
    this.playNoise(0.08, 0.18);
    this.playTone(85, 0.08, 'sawtooth', 0.14);
  }

  playEscape() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.15 * this.seVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playVictory() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 523.25, d: 0.2 },
      { f: 415.30, d: 0.2 },
      { f: 466.16, d: 0.2 },
      { f: 523.25, d: 0.4 }
    ];
    let offset = 0;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + offset);
      gain.gain.setValueAtTime(0.1 * this.seVolume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + note.d);
      offset += note.d + 0.02;
    });
  }

  playHeal() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [392.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.15 * this.seVolume, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.3);
    });
  }

  playInn() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.11 },
      { f: 659.25, d: 0.11 },
      { f: 783.99, d: 0.11 },
      { f: 1046.50, d: 0.18 },
      { f: 880.00, d: 0.13 },
      { f: 783.99, d: 0.13 },
      { f: 659.25, d: 0.13 },
      { f: 587.33, d: 0.22 },
      { f: 523.25, d: 0.11 },
      { f: 659.25, d: 0.11 },
      { f: 783.99, d: 0.18 },
      { f: 1046.50, d: 0.45 }
    ];
    let offset = 0;
    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + offset);
      gain.gain.setValueAtTime(0.12 * this.seVolume, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + note.d);
      offset += note.d + 0.02;
    });
  }

  playBuy() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1174.66].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15 * this.seVolume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.12);
    });
  }

  playMagic() {
    if (!this.seEnabled || !this.isUnlocked || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);

    gain.gain.setValueAtTime(0.1 * this.seVolume, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const sound = new SoundSystem();
if (typeof window !== 'undefined') {
  window.sound = sound;
}