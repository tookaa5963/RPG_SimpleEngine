// FILE_ENTRY: js/titleScene.js
import { sound } from './sound.js';
import { i18n } from './i18n.js';
import { playTheaterVideo } from './main.js';

export class TitleScene {
  constructor({ onNewGame, onLoadGame }) {
    this.onNewGame = onNewGame;
    this.onLoadGame = onLoadGame;

    this.titleOverlay = document.getElementById('title-overlay');
    this.openingVideo = document.getElementById('opening-video');
    this.titleScreen = document.getElementById('title-screen');

    this.btnNewGame = document.getElementById('btn-new-game');
    this.btnLoadGame = document.getElementById('btn-load-game');

    const titleMenu = document.getElementById('title-menu');

    this.btnTheater = document.createElement('button');
    this.btnTheater.id = 'btn-theater';
    this.btnTheater.className = 'title-btn';
    this.btnTheater.tabIndex = -1;
    this.btnTheater.style.display = 'none';
    titleMenu.appendChild(this.btnTheater);

    this.btnLang = document.createElement('button');
    this.btnLang.id = 'btn-lang';
    this.btnLang.className = 'title-btn';
    this.btnLang.tabIndex = -1;
    titleMenu.appendChild(this.btnLang);

    this.theaterMenu = document.getElementById('theater-menu');
    this.btnTheaterFall = document.getElementById('btn-theater-fall');
    this.btnTheaterEnding = document.getElementById('btn-theater-ending');
    this.btnTheaterBack = document.getElementById('btn-theater-back');

    this.titleMenuElement = titleMenu;
    this.titleMenuIndex = 0;
    this.titleButtons = [this.btnNewGame, this.btnLoadGame, this.btnTheater, this.btnLang];

    this.theaterMenuIndex = 0;
    this.theaterButtons = [this.btnTheaterFall, this.btnTheaterEnding, this.btnTheaterBack];

    this.phase = 'INACTIVE'; // 'VIDEO' | 'MENU' | 'THEATER_SELECT' | 'INACTIVE'
    this.isCleared = false;

    this.initDomEvents();
    this.updateLangUI();
  }

  get isActive() {
    return this.phase !== 'INACTIVE';
  }

  initDomEvents() {
    this.btnNewGame.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      if (this.onNewGame) this.onNewGame();
    });
    this.btnNewGame.addEventListener('mouseenter', () => {
      if (this.phase === 'MENU') {
        this.titleMenuIndex = 0;
        this.updateButtonsUI();
      }
    });

    this.btnLoadGame.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      if (this.onLoadGame) this.onLoadGame();
    });
    this.btnLoadGame.addEventListener('mouseenter', () => {
      if (this.phase === 'MENU') {
        this.titleMenuIndex = 1;
        this.updateButtonsUI();
      }
    });

    this.btnTheater.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      this.openTheaterSelect();
    });
    this.btnTheater.addEventListener('mouseenter', () => {
      if (this.phase === 'MENU') {
        this.titleMenuIndex = 2;
        this.updateButtonsUI();
      }
    });

    this.btnLang.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      i18n.toggleLang();
      this.updateLangUI();
    });
    this.btnLang.addEventListener('mouseenter', () => {
      if (this.phase === 'MENU') {
        this.titleMenuIndex = 3;
        this.updateButtonsUI();
      }
    });

    this.btnTheaterFall.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      this.hide();
      playTheaterVideo('fall');
    });
    this.btnTheaterFall.addEventListener('mouseenter', () => {
      if (this.phase === 'THEATER_SELECT') {
        this.theaterMenuIndex = 0;
        this.updateTheaterButtonsUI();
      }
    });

    this.btnTheaterEnding.addEventListener('click', () => {
      sound.unlock();
      sound.playSubmit();
      this.hide();
      playTheaterVideo('ending');
    });
    this.btnTheaterEnding.addEventListener('mouseenter', () => {
      if (this.phase === 'THEATER_SELECT') {
        this.theaterMenuIndex = 1;
        this.updateTheaterButtonsUI();
      }
    });

    this.btnTheaterBack.addEventListener('click', () => {
      sound.unlock();
      sound.playCancel();
      this.closeTheaterSelect();
    });
    this.btnTheaterBack.addEventListener('mouseenter', () => {
      if (this.phase === 'THEATER_SELECT') {
        this.theaterMenuIndex = 2;
        this.updateTheaterButtonsUI();
      }
    });

    this.titleOverlay.addEventListener('click', () => {
      sound.unlock();
      if (this.phase === 'VIDEO') this.switchToTitleScreen();
    });

    document.addEventListener('keydown', () => {
      if (this.phase !== 'INACTIVE') sound.unlock();
    }, { once: true });
  }

  updateLangUI() {
    this.btnNewGame.textContent = i18n.t('title.new_game');
    this.btnLoadGame.textContent = i18n.t('title.load_game');
    this.btnTheater.textContent = i18n.t('title.theater');
    this.btnLang.textContent = i18n.t('title.lang');
    this.btnTheaterFall.textContent = i18n.t('title.theater_fall');
    this.btnTheaterEnding.textContent = i18n.t('title.theater_ending');
    this.btnTheaterBack.textContent = i18n.t('title.theater_back');
  }

  startSequence() {
    sound.stopBgm();
    document.body.classList.add('title-mode');
    this.titleOverlay.style.display = 'flex';
    this.titleScreen.style.display = 'none';
    this.titleMenuElement.style.display = 'flex';
    if (this.theaterMenu) this.theaterMenu.style.display = 'none';

    try {
      this.isCleared = localStorage.getItem('camino_game_cleared') === 'true';
    } catch (e) {
      this.isCleared = false;
    }

    if (this.isCleared) {
      this.btnTheater.style.display = 'flex';
      this.titleButtons = [this.btnNewGame, this.btnLoadGame, this.btnTheater, this.btnLang];
    } else {
      this.btnTheater.style.display = 'none';
      this.titleButtons = [this.btnNewGame, this.btnLoadGame, this.btnLang];
    }

    this.titleMenuIndex = 0;
    this.updateButtonsUI();

    // ★ オープニング動画の再生切り替えフラグ（true に変更すればいつでも動画再生が復帰します）
    const ENABLE_OPENING_VIDEO = false;

    if (!ENABLE_OPENING_VIDEO) {
      this.switchToTitleScreen();
      return;
    }

    this.openingVideo.src = 'video/opening.mp4';
    this.openingVideo.muted = !sound.bgmEnabled;
    this.openingVideo.volume = sound.bgmVolume ? Math.min(1.0, sound.bgmVolume * 5) : 0.5;
    this.openingVideo.currentTime = 0;
    this.openingVideo.style.display = 'block';
    this.phase = 'VIDEO';

    this.openingVideo.play().catch(e => {
      this.switchToTitleScreen();
    });

    this.openingVideo.onended = () => {
      this.switchToTitleScreen();
    };
  }

  switchToTitleScreen() {
    sound.unlock();
    this.openingVideo.pause();
    this.openingVideo.style.display = 'none';
    this.titleScreen.style.display = 'flex';
    this.phase = 'MENU';
    sound.playBgm('opening');
  }

  openTheaterSelect() {
    this.phase = 'THEATER_SELECT';
    this.titleMenuElement.style.display = 'none';
    if (this.theaterMenu) {
      this.theaterMenu.style.display = 'flex';
    }
    this.theaterMenuIndex = 0;
    this.updateTheaterButtonsUI();
  }

  closeTheaterSelect() {
    this.phase = 'MENU';
    if (this.theaterMenu) {
      this.theaterMenu.style.display = 'none';
    }
    this.titleMenuElement.style.display = 'flex';
    this.updateButtonsUI();
  }

  updateButtonsUI() {
    this.titleButtons.forEach((btn, idx) => {
      if (idx === this.titleMenuIndex) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  updateTheaterButtonsUI() {
    this.theaterButtons.forEach((btn, idx) => {
      if (idx === this.theaterMenuIndex) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  updateInput(input, isSlotDialogOpen) {
    if (this.phase === 'VIDEO') {
      if (input.actionJustPressed || input.cancelJustPressed || input.isAnyKeyPressed) {
        this.switchToTitleScreen();
      }
      return;
    }
    if (input.upJustPressed || input.downJustPressed || input.actionJustPressed || input.cancelJustPressed || input.isAnyKeyPressed) {
      sound.unlock();
    }
    if (this.phase === 'MENU' && !isSlotDialogOpen) {
      if (input.upJustPressed) {
        sound.playCursor();
        this.titleMenuIndex = (this.titleMenuIndex - 1 + this.titleButtons.length) % this.titleButtons.length;
        this.updateButtonsUI();
      } else if (input.downJustPressed) {
        sound.playCursor();
        this.titleMenuIndex = (this.titleMenuIndex + 1) % this.titleButtons.length;
        this.updateButtonsUI();
      } else if (input.actionJustPressed) {
        sound.playSubmit();
        const activeBtn = this.titleButtons[this.titleMenuIndex];
        if (activeBtn === this.btnNewGame) {
          if (this.onNewGame) this.onNewGame();
        } else if (activeBtn === this.btnLoadGame) {
          if (this.onLoadGame) this.onLoadGame();
        } else if (activeBtn === this.btnTheater) {
          this.openTheaterSelect();
        } else if (activeBtn === this.btnLang) {
          i18n.toggleLang();
          this.updateLangUI();
        }
      }
    } else if (this.phase === 'THEATER_SELECT' && !isSlotDialogOpen) {
      if (input.upJustPressed) {
        sound.playCursor();
        this.theaterMenuIndex = (this.theaterMenuIndex - 1 + this.theaterButtons.length) % this.theaterButtons.length;
        this.updateTheaterButtonsUI();
      } else if (input.downJustPressed) {
        sound.playCursor();
        this.theaterMenuIndex = (this.theaterMenuIndex + 1) % this.theaterButtons.length;
        this.updateTheaterButtonsUI();
      } else if (input.actionJustPressed) {
        sound.playSubmit();
        if (this.theaterMenuIndex === 0) {
          this.hide();
          playTheaterVideo('fall');
        } else if (this.theaterMenuIndex === 1) {
          this.hide();
          playTheaterVideo('ending');
        } else if (this.theaterMenuIndex === 2) {
          this.closeTheaterSelect();
        }
      } else if (input.cancelJustPressed) {
        sound.playCancel();
        this.closeTheaterSelect();
      }
    }
  }

  hide() {
    this.phase = 'INACTIVE';
    document.body.classList.remove('title-mode');
    this.titleOverlay.style.display = 'none';
  }
}