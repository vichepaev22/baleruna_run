import Phaser from 'phaser';
import { levels } from '../data/levels';
import { audioSystem } from '../systems/AudioSystem';

interface ResultData {
  levelIndex: number;
  stars: number;
  score: number;
  rolls: number;
  totalRolls: number;
  time: number;
  health: number;
  maxCombo: number;
  victory: boolean;
}

export class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  create() {
    const data = this.scene.settings.data as ResultData;
    const { width, height } = this.scale;
    const level = levels[data.levelIndex];

    // Background
    const bg = this.add.graphics();
    if (data.victory) {
      bg.fillGradientStyle(0x172341, 0x172341, 0x2a1a4e, 0x2a1a4e, 1);
    } else {
      bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x2a0a1a, 0x2a0a1a, 1);
    }
    bg.fillRect(0, 0, width, height);

    // Title
    const titleText = data.victory ? 'УРОВЕНЬ ПРОЙДЕН!' : 'ПОРАЖЕНИЕ';
    const titleColor = data.victory ? '#FFC44C' : '#FF4444';
    
    const title = this.add.text(width / 2, 60, titleText, {
      fontSize: '26px', fontFamily: 'Arial', color: titleColor, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    if (data.victory) {
      this.tweens.add({ targets: title, scale: 1.1, duration: 500, yoyo: true, repeat: -1 });
    }

    // Level name
    this.add.text(width / 2, 95, level.name, {
      fontSize: '14px', fontFamily: 'Arial', color: '#FFF4E8'
    }).setOrigin(0.5);

    // Stars
    const starY = 140;
    for (let i = 0; i < 3; i++) {
      const starX = width / 2 - 40 + i * 40;
      const star = this.add.image(starX, starY, 'star').setScale(1.5);
      if (i < data.stars) {
        star.setTint(0xFFC44C);
        // Animate stars appearing
        star.setScale(0);
        this.tweens.add({
          targets: star, scale: 1.5, duration: 300, delay: i * 200, ease: 'Back.easeOut'
        });
      } else {
        star.setTint(0x444455);
      }
    }

    // Stats panel
    const panelY = 190;
    const panel = this.add.graphics();
    panel.fillStyle(0x172341, 0.8);
    panel.fillRoundedRect(30, panelY, width - 60, 220, 12);
    panel.lineStyle(2, data.victory ? 0xFFC44C : 0xFF4444, 0.5);
    panel.strokeRoundedRect(30, panelY, width - 60, 220, 12);

    // Stats
    const stats = [
      { label: 'Рулоны', value: `${data.rolls} / ${data.totalRolls}`, icon: '🧻' },
      { label: 'Очки', value: `${data.score}`, icon: '⭐' },
      { label: 'Время', value: `${data.time.toFixed(1)} сек`, icon: '⏱' },
      { label: 'Здоровье', value: `${'❤'.repeat(data.health)}${'♡'.repeat(3 - data.health)}`, icon: '' },
      { label: 'Макс. комбо', value: `×${data.maxCombo}`, icon: '🔥' },
    ];

    stats.forEach((stat, i) => {
      const sy = panelY + 20 + i * 38;
      this.add.text(55, sy, `${stat.icon} ${stat.label}`, {
        fontSize: '13px', fontFamily: 'Arial', color: '#AAAACC'
      });
      this.add.text(width - 55, sy, stat.value, {
        fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(1, 0);
    });

    // Buttons
    const btnY = 450;

    if (data.victory && data.levelIndex < 9) {
      // Next level button
      const nextBtn = this.add.container(width / 2, btnY);
      const nextBg = this.add.image(0, 0, 'btn_big').setInteractive({ useHandCursor: true });
      const nextTxt = this.add.text(0, -2, '▶ СЛЕДУЮЩИЙ УРОВЕНЬ', {
        fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5);
      nextBtn.add([nextBg, nextTxt]);
      nextBg.on('pointerdown', () => {
        audioSystem.playClick();
        this.scene.start('GameScene', { levelIndex: data.levelIndex + 1 });
      });
    }

    // Retry button
    const retryY = data.victory && data.levelIndex < 9 ? btnY + 55 : btnY;
    const retryBtn = this.add.container(width / 2, retryY);
    const retryBg = this.add.image(0, 0, 'btn_purple').setInteractive({ useHandCursor: true });
    const retryTxt = this.add.text(0, -2, '↺ ПОВТОРИТЬ', {
      fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    retryBtn.add([retryBg, retryTxt]);
    retryBg.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.start('GameScene', { levelIndex: data.levelIndex });
    });

    // Menu button
    const menuBtn = this.add.container(width / 2, retryY + 55);
    const menuBg = this.add.image(0, 0, 'btn_small').setInteractive({ useHandCursor: true });
    const menuTxt = this.add.text(0, -2, '🏠 МЕНЮ', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    menuBtn.add([menuBg, menuTxt]);
    menuBg.on('pointerdown', () => {
      audioSystem.playClick();
      this.scene.start('MenuScene');
    });

    // Victory particles
    if (data.victory) {
      for (let i = 0; i < 20; i++) {
        const p = this.add.circle(
          Math.random() * width,
          height + 10,
          3 + Math.random() * 4,
          [0xFF65A3, 0xFFC44C, 0x49C7F5, 0x7757E8][Math.floor(Math.random() * 4)],
          1
        );
        this.tweens.add({
          targets: p,
          y: -20,
          x: p.x + (Math.random() - 0.5) * 100,
          alpha: 0,
          duration: 2000 + Math.random() * 2000,
          delay: Math.random() * 1000,
          repeat: -1,
          onRepeat: () => {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.setAlpha(1);
          }
        });
      }
    }

    // Final victory message for level 10
    if (data.victory && data.levelIndex === 9) {
      this.add.text(width / 2, height - 80, '🎉 ПОЗДРАВЛЯЕМ! 🎉', {
        fontSize: '18px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(width / 2, height - 55, 'Все уровни пройдены!', {
        fontSize: '13px', fontFamily: 'Arial', color: '#FFF4E8'
      }).setOrigin(0.5);
    }
  }
}
