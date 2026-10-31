import Phaser from 'phaser';
import { audioSystem } from '../systems/AudioSystem';
import { loadSave, saveSave, resetSave } from '../systems/SaveSystem';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    audioSystem.init();
    audioSystem.resume();
    
    const { width, height } = this.scale;
    
    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor('#FF65A3').color,
      Phaser.Display.Color.HexStringToColor('#FF65A3').color,
      Phaser.Display.Color.HexStringToColor('#7757E8').color,
      Phaser.Display.Color.HexStringToColor('#7757E8').color,
      1
    );
    bg.fillRect(0, 0, width, height);

    // Decorative buildings
    const buildings = this.add.graphics();
    buildings.fillStyle(0xFFFFFF, 0.1);
    for (let i = 0; i < 8; i++) {
      const bw = 30 + Math.random() * 40;
      const bh = 80 + Math.random() * 150;
      buildings.fillRoundedRect(i * 50 - 10, height - bh - 100, bw, bh, 5);
    }

    // Floating decorations - coffee cups and rolls
    for (let i = 0; i < 8; i++) {
      const dec = this.add.graphics();
      const isCup = Math.random() > 0.5;
      if (isCup) {
        dec.fillStyle(0xFFFFFF, 0.12);
        dec.fillRoundedRect(0, 0, 18, 22, 4);
        dec.fillStyle(0x9B5C3C, 0.15);
        dec.fillCircle(9, 6, 5);
      } else {
        dec.fillStyle(0xFFFFFF, 0.12);
        dec.fillCircle(8, 8, 8);
        dec.fillStyle(0xFFC44C, 0.1);
        dec.fillCircle(8, 8, 5);
      }
      dec.setPosition(30 + Math.random() * (width - 60), 80 + Math.random() * 250);
      this.tweens.add({
        targets: dec,
        y: dec.y - 15 - Math.random() * 15,
        alpha: { from: 0.8, to: 0.4 },
        duration: 2500 + Math.random() * 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Animated sparkles
    for (let i = 0; i < 6; i++) {
      const sparkle = this.add.graphics();
      sparkle.fillStyle(0xFFC44C, 0.6);
      sparkle.fillCircle(3, 3, 2);
      sparkle.setPosition(Math.random() * width, Math.random() * height);
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0, to: 0.8 },
        scaleX: { from: 0.5, to: 1.5 },
        scaleY: { from: 0.5, to: 1.5 },
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
        ease: 'Sine.easeInOut'
      });
    }

    // Title
    this.add.text(width / 2, 100, 'БАЛЕРИНА', {
      fontSize: '36px', fontFamily: 'Arial, sans-serif', color: '#FFFFFF',
      fontStyle: 'bold', stroke: '#9B5C3C', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 145, 'КАПУЧИНА', {
      fontSize: '42px', fontFamily: 'Arial, sans-serif', color: '#FFC44C',
      fontStyle: 'bold', stroke: '#9B5C3C', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, 'БУМАЖНЫЙ ПОБЕГ', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#FFF4E8', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character preview
    const save = loadSave();
    const charImg = this.add.image(width / 2, 290, 'player_' + save.selectedCharacter).setScale(2.5);
    this.tweens.add({
      targets: charImg, y: 280, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Buttons
    const buttonsData = [
      { text: '▶ ИГРАТЬ', y: 400, action: () => this.scene.start('LevelSelectScene'), key: 'btn_big' },
      { text: '👤 ПЕРСОНАЖИ', y: 465, action: () => this.scene.start('CharacterScene'), key: 'btn_purple' },
      { text: '📋 УРОВНИ', y: 520, action: () => this.scene.start('LevelSelectScene'), key: 'btn_blue' },
      { text: '⚙ НАСТРОЙКИ', y: 575, action: () => this.showSettings(), key: 'btn_gold' },
    ];

    buttonsData.forEach(btn => {
      const container = this.add.container(width / 2, btn.y);
      const bgImg = this.add.image(0, 0, btn.key).setInteractive({ useHandCursor: true });
      const txt = this.add.text(0, -2, btn.text, {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#FFFFFF', fontStyle: 'bold',
      }).setOrigin(0.5);
      container.add([bgImg, txt]);
      bgImg.on('pointerdown', () => { audioSystem.resume(); audioSystem.playClick(); btn.action(); });
      bgImg.on('pointerover', () => container.setScale(1.05));
      bgImg.on('pointerout', () => container.setScale(1));
    });
  }

  private showSettings() {
    const save = loadSave();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, 360, 640);
    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 360, 640), Phaser.Geom.Rectangle.Contains);

    const panel = this.add.graphics();
    panel.fillStyle(0x172341, 1);
    panel.fillRoundedRect(30, 150, 300, 340, 20);
    panel.lineStyle(2, 0xFF65A3, 1);
    panel.strokeRoundedRect(30, 150, 300, 340, 20);

    this.add.text(180, 185, 'НАСТРОЙКИ', {
      fontSize: '24px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
    }).setOrigin(0.5);

    const musicText = this.add.text(60, 240, `Музыка: ${save.musicEnabled ? 'ВКЛ ✓' : 'ВЫКЛ ✗'}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF'
    }).setInteractive({ useHandCursor: true });
    musicText.on('pointerdown', () => {
      save.musicEnabled = !save.musicEnabled;
      musicText.setText(`Музыка: ${save.musicEnabled ? 'ВКЛ ✓' : 'ВЫКЛ ✗'}`);
      audioSystem.setMusicEnabled(save.musicEnabled);
      saveSave(save);
    });

    const sfxText = this.add.text(60, 290, `Звуки: ${save.sfxEnabled ? 'ВКЛ ✓' : 'ВЫКЛ ✗'}`, {
      fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF'
    }).setInteractive({ useHandCursor: true });
    sfxText.on('pointerdown', () => {
      save.sfxEnabled = !save.sfxEnabled;
      sfxText.setText(`Звуки: ${save.sfxEnabled ? 'ВКЛ ✓' : 'ВЫКЛ ✗'}`);
      audioSystem.setSfxEnabled(save.sfxEnabled);
      saveSave(save);
    });

    const resetBtn = this.add.text(180, 370, '🗑 СБРОСИТЬ ПРОГРЕСС', {
      fontSize: '14px', fontFamily: 'Arial', color: '#FF65A3', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resetBtn.on('pointerdown', () => {
      // Custom confirm dialog
      const confirmOverlay = this.add.graphics();
      confirmOverlay.fillStyle(0x000000, 0.9);
      confirmOverlay.fillRect(0, 0, 360, 640);
      confirmOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 360, 640), Phaser.Geom.Rectangle.Contains);
      
      const confirmPanel = this.add.graphics();
      confirmPanel.fillStyle(0x172341, 1);
      confirmPanel.fillRoundedRect(50, 230, 260, 150, 15);
      confirmPanel.lineStyle(2, 0xFF4444, 1);
      confirmPanel.strokeRoundedRect(50, 230, 260, 150, 15);
      
      this.add.text(180, 260, 'Сбросить прогресс?', {
        fontSize: '16px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(180, 290, 'Все данные будут удалены!', {
        fontSize: '12px', fontFamily: 'Arial', color: '#AAAACC'
      }).setOrigin(0.5);
      
      const yesBtn = this.add.text(120, 340, '✓ ДА', {
        fontSize: '16px', fontFamily: 'Arial', color: '#FF4444', fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      yesBtn.on('pointerdown', () => { resetSave(); location.reload(); });
      
      const noBtn = this.add.text(240, 340, '✕ НЕТ', {
        fontSize: '16px', fontFamily: 'Arial', color: '#49C7F5', fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      noBtn.on('pointerdown', () => { this.scene.restart(); });
    });

    const closeBtn = this.add.text(180, 440, '✕ ЗАКРЫТЬ', {
      fontSize: '18px', fontFamily: 'Arial', color: '#49C7F5', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.restart();
    });
  }
}
