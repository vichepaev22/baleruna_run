import Phaser from 'phaser';
import { characters } from '../data/characters';
import { loadSave, saveSave } from '../systems/SaveSystem';
import { audioSystem } from '../systems/AudioSystem';

export class CharacterScene extends Phaser.Scene {
  constructor() { super('CharacterScene'); }

  create() {
    const { width, height } = this.scale;
    const save = loadSave();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x172341, 0x172341, 0x2a1a4e, 0x2a1a4e, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 30, 'ВЫБОР ПЕРСОНАЖА', {
      fontSize: '20px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Character cards
    const cardWidth = 150;
    const cardHeight = 220;
    const startX = (width - cardWidth * 2 - 20) / 2;

    characters.forEach((char, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = startX + col * (cardWidth + 20) + cardWidth / 2;
      const cy = 80 + row * (cardHeight + 15) + cardHeight / 2;

      const card = this.add.graphics();
      const isSelected = save.selectedCharacter === char.id;
      
      card.fillStyle(isSelected ? 0x2a2a5e : 0x1a1a3e, 1);
      card.fillRoundedRect(cx - cardWidth / 2, cy - cardHeight / 2, cardWidth, cardHeight, 10);
      card.lineStyle(isSelected ? 3 : 1, isSelected ? 0xFFC44C : 0x444466, 1);
      card.strokeRoundedRect(cx - cardWidth / 2, cy - cardHeight / 2, cardWidth, cardHeight, 10);

      // Character image
      this.add.image(cx, cy - 60, 'player_' + char.id).setScale(1.8);

      // Name
      this.add.text(cx, cy - 10, char.name, {
        fontSize: '11px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold', align: 'center', wordWrap: { width: cardWidth - 10 }
      }).setOrigin(0.5);

      // Stats bars
      const stats = [
        { label: 'СКР', value: char.speed },
        { label: 'ПРЖ', value: char.jump },
        { label: 'ЗАЩ', value: char.defense },
        { label: 'СБО', value: char.collect },
      ];
      stats.forEach((stat, si) => {
        const sy = cy + 15 + si * 18;
        this.add.text(cx - 55, sy, stat.label, { fontSize: '8px', fontFamily: 'Arial', color: '#AAAACC' });
        // Bar background
        const barBg = this.add.graphics();
        barBg.fillStyle(0x333355, 1);
        barBg.fillRoundedRect(cx - 30, sy + 2, 80, 8, 4);
        // Bar fill
        const barFill = this.add.graphics();
        const barColor = stat.value >= 4 ? 0x49C7F5 : stat.value >= 3 ? 0xFFC44C : 0xFF65A3;
        barFill.fillStyle(barColor, 1);
        barFill.fillRoundedRect(cx - 30, sy + 2, (stat.value / 5) * 80, 8, 4);
      });

      // Ability name
      this.add.text(cx, cy + 95, char.abilityName, {
        fontSize: '9px', fontFamily: 'Arial', color: '#FF65A3', fontStyle: 'bold', align: 'center', wordWrap: { width: cardWidth - 10 }
      }).setOrigin(0.5);

      // Make card interactive
      const hitZone = this.add.zone(cx, cy, cardWidth, cardHeight).setInteractive({ useHandCursor: true });
      hitZone.on('pointerdown', () => {
        audioSystem.playClick();
        save.selectedCharacter = char.id;
        saveSave(save);
        this.scene.restart();
      });

      if (isSelected) {
        this.add.text(cx, cy + cardHeight / 2 - 12, '✓ ВЫБРАН', {
          fontSize: '10px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
        }).setOrigin(0.5);
      }
    });

    // Back button
    const backBtn = this.add.container(width / 2, height - 40);
    const backBg = this.add.image(0, 0, 'btn_small').setInteractive({ useHandCursor: true });
    const backTxt = this.add.text(0, -2, '← НАЗАД', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setOrigin(0.5);
    backBtn.add([backBg, backTxt]);
    backBg.on('pointerdown', () => { audioSystem.playClick(); this.cameras.main.fadeOut(200, 0, 0, 0); this.time.delayedCall(200, () => this.scene.start('MenuScene')); });
    backBg.on('pointerover', () => backBtn.setScale(1.05));
    backBg.on('pointerout', () => backBtn.setScale(1));
    
    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
