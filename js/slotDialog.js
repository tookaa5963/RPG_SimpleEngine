// FILE_ENTRY: js/slotDialog.js
import { sound } from './sound.js';
import { SaveManager } from './save.js';
import { i18n } from './i18n.js';

export class SlotDialog {
  constructor({ onSave, onLoad, onClose }) {
    this.onSave = onSave;
    this.onLoad = onLoad;
    this.onClose = onClose;

    this.dialog = document.getElementById('slot-dialog');
    this.title = document.getElementById('slot-dialog-title');
    this.currentInfo = document.getElementById('slot-current-info');
    this.list = document.getElementById('slot-list');
    this.confirmContainer = document.getElementById('slot-confirm-container');
    this.confirmText = document.getElementById('slot-confirm-text');
    this.btnConfirmYes = document.getElementById('btn-confirm-yes');
    this.btnConfirmNo = document.getElementById('btn-confirm-no');
    this.btnCancel = document.getElementById('btn-slot-cancel');
    
    // ★ バックアップ機能のDOM
    this.btnExport = document.getElementById('btn-export-save');
    this.btnImport = document.getElementById('btn-import-save');
    this.fileImport = document.getElementById('file-import-save');

    this.isOpen = false;
    this.mode = 'title_load'; // 'title_load' | 'menu_load' | 'menu_save' | 'auto_save'
    this.index = 0;
    this.buttonElements = [];
    this.isConfirmingOverwrite = false;
    this.confirmIndex = 1;
    this.pendingSaveSlot = null;
    this.MAX_SLOTS = 10;

    let savedSlot = null;
    try {
      savedSlot = localStorage.getItem('camino_de_leyenda_current_loaded_slot');
    } catch (e) {
      console.warn('localStorageへのアクセスが拒否されました:', e);
    }
    this.currentLoadedSlot = savedSlot ? parseInt(savedSlot, 10) : null;

    this.initDomEvents();
  }

  initDomEvents() {
    this.btnConfirmYes.addEventListener('click', () => {
      sound.playSubmit();
      if (this.pendingSaveSlot !== null) {
        this.executeSave(this.pendingSaveSlot);
      }
    });
    this.btnConfirmYes.addEventListener('mousemove', () => {
      if (this.confirmIndex !== 0) {
        this.confirmIndex = 0;
        this.updateUI();
      }
    });

    this.btnConfirmNo.addEventListener('click', () => {
      sound.playCancel();
      this.cancelOverwrite();
    });
    this.btnConfirmNo.addEventListener('mousemove', () => {
      if (this.confirmIndex !== 1) {
        this.confirmIndex = 1;
        this.updateUI();
      }
    });

    this.btnCancel.addEventListener('click', () => {
      sound.playCancel();
      this.close();
    });
    this.btnCancel.addEventListener('mousemove', () => {
      if (!this.isConfirmingOverwrite && this.index !== this.buttonElements.length - 1) {
        this.index = this.buttonElements.length - 1;
        this.updateUI();
      }
    });

    // ★ バックアップ出力
    if (this.btnExport) {
      this.btnExport.addEventListener('click', () => {
        sound.playSubmit();
        const dataStr = SaveManager.exportAllData(this.MAX_SLOTS);
        if (dataStr && dataStr !== '{}') {
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `camino_save_backup_${new Date().getTime()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          alert(i18n.currentLang === 'ja' ? 'バックアップをダウンロードしました。' : 'Backup downloaded successfully.');
        } else {
          sound.playBump();
          alert(i18n.currentLang === 'ja' ? '保存されているデータがありません。' : 'No save data to backup.');
        }
      });
    }

    // ★ バックアップ読込トリガー
    if (this.btnImport) {
      this.btnImport.addEventListener('click', () => {
        sound.playSubmit();
        if (this.fileImport) {
          this.fileImport.click();
        }
      });
    }

    // ★ ファイル読込処理
    if (this.fileImport) {
      this.fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = SaveManager.importAllData(ev.target.result, this.MAX_SLOTS);
          if (success) {
            sound.playVictory();
            alert(i18n.currentLang === 'ja' ? 'バックアップから復元しました！\n反映のため一覧を再読み込みします。' : 'Backup restored successfully!');
            // 一覧を再構築
            this.open(this.mode, this.mode === 'title_load', this.mode === 'auto_save');
          } else {
            sound.playBump();
            alert(i18n.currentLang === 'ja' ? 'ファイルの読み込みに失敗しました。\n形式が違うか破損しています。' : 'Failed to load file. It might be corrupted.');
          }
        };
        reader.readAsText(file);
        
        // 連続して同じファイルを選べるようにリセット
        e.target.value = '';
      });
    }
  }

  open(mode = 'load', isFromTitle = false, isAutoSave = false) {
    this.isOpen = true;
    if (isFromTitle) {
      this.mode = 'title_load';
    } else if (isAutoSave || mode === 'auto_save') {
      this.mode = 'auto_save';
    } else if (mode === 'save') {
      this.mode = 'menu_save';
    } else {
      this.mode = 'menu_load';
    }

    const isSaveMode = (this.mode === 'menu_save' || this.mode === 'auto_save');
    this.title.textContent = isSaveMode ? i18n.t('slot.title_save') : i18n.t('slot.title_load');
    this.btnConfirmYes.textContent = i18n.t('slot.yes');
    this.btnConfirmNo.textContent = i18n.t('slot.no');
    this.btnCancel.textContent = i18n.t('slot.back');

    if (this.btnExport) this.btnExport.textContent = i18n.t('slot.backup_export') || "バックアップ出力";
    if (this.btnImport) this.btnImport.textContent = i18n.t('slot.backup_import') || "バックアップ読込";

    if (this.currentLoadedSlot === null) {
      try {
        const savedSlot = localStorage.getItem('camino_de_leyenda_current_loaded_slot');
        if (savedSlot) {
          this.currentLoadedSlot = parseInt(savedSlot, 10);
        }
      } catch (e) {
        // Ignored
      }
    }

    if (this.currentInfo) {
      if (this.mode === 'title_load') {
        this.currentInfo.style.display = 'none';
      } else {
        this.currentInfo.style.display = 'block';
        if (this.currentLoadedSlot !== null) {
          this.currentInfo.textContent = `${i18n.t('slot.current')}: ${i18n.t('slot.book')}${this.currentLoadedSlot}`;
        } else {
          this.currentInfo.textContent = `${i18n.t('slot.current')}: ${i18n.t('slot.new_game')}`;
        }
      }
    }

    this.isConfirmingOverwrite = false;
    this.confirmContainer.style.display = 'none';
    this.list.style.display = 'block';
    this.btnCancel.style.display = 'block';

    this.list.innerHTML = '';
    this.buttonElements = [];

    const bookPrefix = i18n.t('slot.book');
    const currentBadge = i18n.t('slot.current_badge');

    for (let slot = 1; slot <= this.MAX_SLOTS; slot++) {
      const summary = SaveManager.getSlotSummary(slot);
      const btn = document.createElement('button');
      btn.className = 'title-btn slot-btn';
      btn.tabIndex = -1;

      const isCurrent = (slot === this.currentLoadedSlot);
      if (isCurrent) {
        btn.classList.add('current-active');
      }

      const badgeStr = isCurrent ? currentBadge : '';
      const slotNumStr = String(slot).padStart(2, '0');
      btn.textContent = `${bookPrefix}${slotNumStr}: ${summary}${badgeStr}`;

      btn.addEventListener('click', () => {
        this.handleSlotAction(slot);
      });
      btn.addEventListener('mousemove', () => {
        if (!this.isConfirmingOverwrite && this.index !== slot - 1) {
          this.index = slot - 1;
          this.updateUI();
        }
      });
      this.list.appendChild(btn);
      this.buttonElements.push(btn);
    }

    this.buttonElements.push(this.btnCancel);

    if (this.currentLoadedSlot !== null && this.currentLoadedSlot >= 1 && this.currentLoadedSlot <= this.MAX_SLOTS) {
      this.index = this.currentLoadedSlot - 1;
    } else {
      this.index = 0;
    }

    this.dialog.style.display = 'block';
    this.updateUI();

    if (this.buttonElements[this.index]) {
      this.buttonElements[this.index].scrollIntoView({ block: 'nearest' });
    }
  }

  close() {
    const closedMode = this.mode;
    this.isOpen = false;
    this.dialog.style.display = 'none';
    this.isConfirmingOverwrite = false;
    this.pendingSaveSlot = null;

    this.list.style.display = 'block';
    this.btnCancel.style.display = 'block';
    this.confirmContainer.style.display = 'none';

    if (this.onClose) {
      this.onClose(closedMode);
    }
  }

  cancelOverwrite() {
    this.isConfirmingOverwrite = false;
    this.pendingSaveSlot = null;
    this.confirmContainer.style.display = 'none';
    this.list.style.display = 'block';
    this.btnCancel.style.display = 'block';
    const isSaveMode = (this.mode === 'menu_save' || this.mode === 'auto_save');
    this.title.textContent = isSaveMode ? i18n.t('slot.title_save') : i18n.t('slot.title_load');
    this.updateUI();
  }

  handleSlotAction(slot) {
    if (this.mode === 'menu_save' || this.mode === 'auto_save') {
      const summary = SaveManager.getSlotSummary(slot);
      if (summary !== i18n.t('slot.empty')) {
        this.pendingSaveSlot = slot;
        this.isConfirmingOverwrite = true;
        this.confirmIndex = 1;

        this.list.style.display = 'none';
        this.btnCancel.style.display = 'none';
        this.title.textContent = i18n.t('slot.overwrite_title');
        this.confirmText.textContent = i18n.t('slot.overwrite_confirm', { slot: String(slot) });
        this.confirmContainer.style.display = 'block';

        this.updateUI();
        return;
      }
      this.executeSave(slot);
    } else {
      this.executeLoad(slot);
    }
  }

  executeSave(slot) {
    if (this.onSave) {
      this.onSave(slot);
    }
  }

  executeLoad(slot) {
    if (this.onLoad) {
      this.onLoad(slot, this.mode);
    }
  }

  updateUI() {
    this.buttonElements.forEach((btn, idx) => {
      if (!this.isConfirmingOverwrite && idx === this.index) {
        btn.classList.add('active');
        btn.scrollIntoView({ block: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });

    if (this.isConfirmingOverwrite) {
      if (this.confirmIndex === 0) {
        this.btnConfirmYes.classList.add('active');
        this.btnConfirmNo.classList.remove('active');
      } else {
        this.btnConfirmYes.classList.remove('active');
        this.btnConfirmNo.classList.add('active');
      }
    }
  }

  updateInput(input) {
    if (this.isConfirmingOverwrite) {
      if (input.leftJustPressed || input.rightJustPressed || input.upJustPressed || input.downJustPressed) {
        sound.playCursor();
        this.confirmIndex = this.confirmIndex === 0 ? 1 : 0;
        this.updateUI();
      } else if (input.actionJustPressed) {
        sound.playSubmit();
        if (this.confirmIndex === 0) {
          this.executeSave(this.pendingSaveSlot);
        } else {
          this.cancelOverwrite();
        }
      } else if (input.cancelJustPressed) {
        sound.playCancel();
        this.cancelOverwrite();
      }
      return;
    }

    if (input.upJustPressed) {
      sound.playCursor();
      this.index = (this.index - 1 + this.buttonElements.length) % this.buttonElements.length;
      this.updateUI();
    } else if (input.downJustPressed) {
      sound.playCursor();
      this.index = (this.index + 1) % this.buttonElements.length;
      this.updateUI();
    } else if (input.actionJustPressed) {
      sound.playSubmit();
      if (this.index === this.buttonElements.length - 1) {
        this.close();
      } else {
        this.handleSlotAction(this.index + 1);
      }
    } else if (input.cancelJustPressed) {
      sound.playCancel();
      this.close();
    }
  }
}