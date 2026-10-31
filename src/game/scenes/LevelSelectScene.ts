import Phaser from 'phaser';
import { levels } from '../data/levels';
import { loadSave } from '../systems/SaveSystem';
import { audioSystem } from '../systems/AudioSystem';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const { width, height } = this.scale;
    const save = loadSave();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x172341, 0x172341, 0x0a1628, 0x0a1628, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 30, 'ВЫБОР УРОВНЯ', {
      fontSize: '22px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level grid
    const cols = 2;
    const cardW = 150;
    const cardH = 90;
    const gapX = 15;
    const gapY = 10;
    const startX = (width - (cols * cardW + (cols - 1) * gapX)) / 2;
    const startY = 65;

    levels.forEach((level, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = startY + row * (cardH + gapY) + cardH / 2;

      const isUnlocked = idx + 1 <= save.maxLevel;
      const stars = save.levelStars[idx] || 0;

      // Card background
      const card = this.add.graphics();
      if (isUnlocked) {
        const c1 = Phaser.Display.Color.HexStringToColor(level.bgColor1).color;
        card.fillStyle(c1, 0.3);
      } else {
        card.fillStyle(0x222233, 0.5);
      }
      card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 8);
      card.lineStyle(2, isUnlocked ? 0xFF65A3 : 0x444455, 1);
      card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 8);

      // Level number
      this.add.text(cx, cy - 25, `${idx + 1}`, {
        fontSize: '24px', fontFamily: 'Arial', color: isUnlocked ? '#FFFFFF' : '#555566', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Level name
      this.add.text(cx, cy - 2, level.name, {
        fontSize: '10px', fontFamily: 'Arial', color: isUnlocked ? '#FFF4E8' : '#444455', align: 'center',
        wordWrap: { width: cardW - 10 }
      }).setOrigin(0.5);

      // Stars
      if (isUnlocked) {
        for (let s = 0; s < 3; s++) {
          const starX = cx - 20 + s * 20;
          if (s < stars) {
            this.add.image(starX, cy + 25, 'star').setScale(0.7);
          } else {
            const emptyStar = this.add.image(starX, cy + 25, 'star').setScale(0.7);
            emptyStar.setTint(0x444455);
          }
        }
      } else {
        // Lock icon
        this.add.text(cx, cy + 25, '🔒', { fontSize: '18px' }).setOrigin(0.5);
      }

      // Interactive
      if (isUnlocked) {
        const hitZone = this.add.zone(cx, cy, cardW, cardH).setInteractive({ useHandCursor: true });
        hitZone.on('pointerdown', () => {
          audioSystem.playClick();
          this.scene.start('GameScene', { levelIndex: idx });
        });
        hitZone.on('pointerover', () => card.setAlpha(0.8));
        hitZone.on('pointerout', () => card.setAlpha(1));
      }
    });

    // Back button
    const backBtn = this.add.container(width / 2, height - 35);
    const backBg = this.add.image(0, 0, 'btn_small').setInteractive({ useHandCursor: true });
    const backTxt = this.add.text(0, -2, '← МЕНЮ', {
      fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    backBtn.add([backBg, backTxt]);
    backBg.on('pointerdown', () => { audioSystem.playClick(); this.scene.start('MenuScene'); });
  }
}
