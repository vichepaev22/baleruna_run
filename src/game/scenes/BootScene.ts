import Phaser from 'phaser';
import { characters } from '../data/characters';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  private generateTextures() {
    // Player textures for each character
    characters.forEach(char => {
      this.createPlayerTexture(char.id, char.colors);
    });

    // Obstacles
    this.createToiletTexture();
    this.createTallToiletTexture();
    this.createPipeTexture();
    this.createPlungerTexture();
    this.createPitTexture();
    this.createPuddleTexture();
    this.createSpinnerTexture();

    // Collectibles
    this.createRollTexture();
    this.createPowerUpTexture('magnet', '#FF65A3');
    this.createPowerUpTexture('shield', '#49C7F5');
    this.createPowerUpTexture('slowmo', '#7757E8');
    this.createPowerUpTexture('double', '#FFC44C');
    this.createPowerUpTexture('energy', '#00FF88');

    // Enemies
    this.createTuntunTexture();
    this.createCrocobirdTexture();

    // Cart texture
    this.createCartTexture();

    // UI elements
    this.createHeartTexture();
    this.createStarTexture();
    this.createButtonTexture(200, 50, '#FF65A3');
    this.createButtonTexture(200, 50, '#49C7F5', 'btn_blue');
    this.createButtonTexture(200, 50, '#FFC44C', 'btn_gold');
    this.createButtonTexture(200, 50, '#7757E8', 'btn_purple');
    this.createButtonTexture(280, 60, '#FF65A3', 'btn_big');
    this.createButtonTexture(120, 40, '#49C7F5', 'btn_small');

    // Ground tiles
    this.createGroundTexture();

    // Particles
    this.createParticleTexture();
  }

  private createPlayerTexture(id: string, colors: { primary: string; secondary: string; accent: string; skin: string }) {
    const g = this.make.graphics({ x: 0, y: 0 });
    const pc = Phaser.Display.Color.HexStringToColor(colors.primary).color;
    const sc = Phaser.Display.Color.HexStringToColor(colors.secondary).color;
    const ac = Phaser.Display.Color.HexStringToColor(colors.accent).color;
    const skc = Phaser.Display.Color.HexStringToColor(colors.skin).color;
    
    if (id === 'cappuccina') {
      // Ballet dress (tutu)
      g.fillStyle(0xFF65A3, 1);
      g.fillTriangle(10, 35, 24, 20, 38, 35);
      g.fillRoundedRect(12, 30, 24, 12, 3);
      // Dress layers
      g.fillStyle(0xFF85B3, 0.7);
      g.fillRoundedRect(8, 33, 32, 8, 4);
      // Body
      g.fillStyle(skc, 1);
      g.fillRoundedRect(16, 18, 16, 16, 4);
      // Head (cup shape)
      g.fillStyle(0xFFFFFF, 1);
      g.fillRoundedRect(14, 2, 20, 18, 6);
      // Coffee art on top
      g.fillStyle(0x9B5C3C, 1);
      g.fillCircle(24, 8, 6);
      g.fillStyle(0xFFF4E8, 0.6);
      g.fillCircle(22, 7, 2);
      // Eyes
      g.fillStyle(0x000000, 1);
      g.fillCircle(20, 14, 2.5);
      g.fillCircle(28, 14, 2.5);
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(21, 13, 1);
      g.fillCircle(29, 13, 1);
      // Blush
      g.fillStyle(0xFF9999, 0.4);
      g.fillCircle(17, 16, 2);
      g.fillCircle(31, 16, 2);
      // Legs (ballet)
      g.fillStyle(skc, 1);
      g.fillRect(18, 42, 5, 14);
      g.fillRect(25, 42, 5, 14);
      // Pointe shoes
      g.fillStyle(0xFF65A3, 1);
      g.fillRoundedRect(17, 54, 7, 5, 2);
      g.fillRoundedRect(24, 54, 7, 5, 2);
    } else if (id === 'espresso') {
      // Dark body suit
      g.fillStyle(0x3D2B1F, 1);
      g.fillRoundedRect(14, 18, 20, 26, 4);
      // Head
      g.fillStyle(skc, 1);
      g.fillCircle(24, 12, 10);
      // Mask
      g.fillStyle(0x1a1a1a, 1);
      g.fillRoundedRect(14, 8, 20, 8, 3);
      // Eyes (intense)
      g.fillStyle(0xFFC44C, 1);
      g.fillCircle(20, 12, 3);
      g.fillCircle(28, 12, 3);
      g.fillStyle(0x000000, 1);
      g.fillCircle(20, 12, 1.5);
      g.fillCircle(28, 12, 1.5);
      // Headband
      g.fillStyle(0xFF4444, 1);
      g.fillRect(14, 6, 20, 3);
      // Belt
      g.fillStyle(0xFFC44C, 1);
      g.fillRect(14, 32, 20, 3);
      // Legs
      g.fillStyle(0x2a1a0f, 1);
      g.fillRect(16, 44, 7, 12);
      g.fillRect(25, 44, 7, 12);
      // Boots
      g.fillStyle(0x1a1a1a, 1);
      g.fillRoundedRect(15, 53, 9, 6, 2);
      g.fillRoundedRect(24, 53, 9, 6, 2);
    } else if (id === 'turboroll') {
      // Robot body (roll shape)
      g.fillStyle(0xFFFFFF, 1);
      g.fillRoundedRect(10, 12, 28, 32, 8);
      // Paper texture lines
      g.lineStyle(1, 0xDDDDDD, 0.5);
      for (let i = 0; i < 4; i++) {
        g.lineBetween(12, 18 + i * 7, 36, 18 + i * 7);
      }
      // Face plate
      g.fillStyle(0x49C7F5, 1);
      g.fillRoundedRect(14, 16, 20, 14, 4);
      // Eyes (glowing)
      g.fillStyle(0x00FFFF, 1);
      g.fillCircle(20, 22, 4);
      g.fillCircle(28, 22, 4);
      g.fillStyle(0xFFFFFF, 1);
      g.fillCircle(20, 22, 2);
      g.fillCircle(28, 22, 2);
      // Antenna
      g.fillStyle(0xFFC44C, 1);
      g.fillRect(23, 4, 2, 10);
      g.fillCircle(24, 4, 3);
      // Legs (mechanical)
      g.fillStyle(0x888888, 1);
      g.fillRect(16, 44, 6, 10);
      g.fillRect(26, 44, 6, 10);
      // Feet
      g.fillStyle(0x49C7F5, 1);
      g.fillRoundedRect(14, 52, 10, 6, 2);
      g.fillRoundedRect(24, 52, 10, 6, 2);
      // Mechanical details
      g.fillStyle(0xFFC44C, 1);
      g.fillCircle(12, 38, 2);
      g.fillCircle(36, 38, 2);
    } else if (id === 'lattelisa') {
      // Fox body
      g.fillStyle(0xFF8C42, 1);
      g.fillRoundedRect(12, 18, 24, 26, 5);
      // Head
      g.fillStyle(0xFFB366, 1);
      g.fillCircle(24, 12, 11);
      // Ears
      g.fillStyle(0xFF8C42, 1);
      g.fillTriangle(16, 5, 14, -2, 20, 5);
      g.fillTriangle(32, 5, 34, -2, 28, 5);
      // Inner ears
      g.fillStyle(0xFFCCAA, 1);
      g.fillTriangle(17, 4, 16, 0, 19, 4);
      g.fillTriangle(31, 4, 32, 0, 29, 4);
      // Face
      g.fillStyle(0xFFF4E8, 1);
      g.fillRoundedRect(18, 10, 12, 8, 4);
      // Eyes
      g.fillStyle(0x2E8B57, 1);
      g.fillCircle(20, 12, 3);
      g.fillCircle(28, 12, 3);
      g.fillStyle(0x000000, 1);
      g.fillCircle(20, 12, 1.5);
      g.fillCircle(28, 12, 1.5);
      // Nose
      g.fillStyle(0x333333, 1);
      g.fillCircle(24, 16, 2);
      // Sport accessories
      g.fillStyle(0x49C7F5, 1);
      g.fillRect(12, 20, 24, 3); // headband
      // Tail
      g.fillStyle(0xFF8C42, 1);
      g.fillTriangle(36, 30, 46, 25, 40, 40);
      g.fillStyle(0xFFFFFF, 0.7);
      g.fillTriangle(42, 28, 46, 25, 44, 35);
      // Legs
      g.fillStyle(0xFF8C42, 1);
      g.fillRect(16, 44, 6, 12);
      g.fillRect(26, 44, 6, 12);
      // Sneakers
      g.fillStyle(0x49C7F5, 1);
      g.fillRoundedRect(14, 53, 10, 6, 2);
      g.fillRoundedRect(24, 53, 10, 6, 2);
    }
    
    g.generateTexture('player_' + id, 48, 60);
    g.destroy();
  }

  private createToiletTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Bowl
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(5, 15, 30, 35, 8);
    // Tank
    g.fillStyle(0xE8E8E8, 1);
    g.fillRoundedRect(8, 0, 24, 20, 4);
    // Seat
    g.fillStyle(0xDDDDDD, 1);
    g.fillRoundedRect(8, 20, 24, 8, 3);
    // Shadow
    g.fillStyle(0xCCCCCC, 1);
    g.fillRect(10, 45, 20, 5);
    g.generateTexture('toilet', 40, 50);
    g.destroy();
  }

  private createTallToiletTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(5, 25, 30, 45, 8);
    g.fillStyle(0xE8E8E8, 1);
    g.fillRoundedRect(8, 0, 24, 30, 4);
    g.fillStyle(0xDDDDDD, 1);
    g.fillRoundedRect(8, 30, 24, 8, 3);
    g.fillStyle(0xCCCCCC, 1);
    g.fillRect(10, 65, 20, 5);
    g.generateTexture('tallToilet', 40, 70);
    g.destroy();
  }

  private createPipeTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x808080, 1);
    g.fillRoundedRect(0, 5, 80, 20, 10);
    g.fillStyle(0x666666, 1);
    g.fillRect(0, 15, 80, 5);
    g.generateTexture('pipe', 80, 30);
    g.destroy();
  }

  private createPlungerTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Handle
    g.fillStyle(0x8B4513, 1);
    g.fillRect(12, 0, 6, 25);
    // Cup
    g.fillStyle(0xFF4444, 1);
    g.fillEllipse(15, 32, 24, 16);
    g.generateTexture('plunger', 30, 40);
    g.destroy();
  }

  private createPitTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(0, 0, 80, 60);
    g.fillStyle(0x0d0d1a, 1);
    g.fillRect(5, 5, 70, 50);
    g.generateTexture('pit', 80, 60);
    g.destroy();
  }

  private createPuddleTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x49C7F5, 0.6);
    g.fillEllipse(30, 7, 60, 14);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillEllipse(25, 5, 20, 6);
    g.generateTexture('puddle', 60, 15);
    g.destroy();
  }

  private createSpinnerTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xFFC44C, 1);
    g.fillRect(20, 0, 10, 50);
    g.fillStyle(0xFF65A3, 1);
    g.fillCircle(25, 25, 20);
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(25, 25, 10);
    g.generateTexture('spinner', 50, 50);
    g.destroy();
  }

  private createCartTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Cart body
    g.fillStyle(0xAAAAAA, 1);
    g.fillRect(5, 10, 35, 30);
    // Grid lines
    g.lineStyle(1, 0x888888, 1);
    for (let i = 0; i < 4; i++) {
      g.lineBetween(5, 10 + i * 10, 40, 10 + i * 10);
    }
    // Handle
    g.fillStyle(0x666666, 1);
    g.fillRect(38, 5, 4, 20);
    // Wheels
    g.fillStyle(0x333333, 1);
    g.fillCircle(12, 45, 5);
    g.fillCircle(33, 45, 5);
    g.generateTexture('cart', 45, 50);
    g.destroy();
  }

  private createRollTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Glow
    g.fillStyle(0xFFC44C, 0.3);
    g.fillCircle(12, 12, 12);
    // Roll body
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(12, 12, 9);
    // Center hole
    g.fillStyle(0xDDCCAA, 1);
    g.fillCircle(12, 12, 4);
    // Highlight
    g.fillStyle(0xFFFFFF, 0.5);
    g.fillCircle(9, 9, 3);
    g.generateTexture('roll', 24, 24);
    g.destroy();
  }

  private createPowerUpTexture(type: string, color: string) {
    const g = this.make.graphics({ x: 0, y: 0 });
    const c = Phaser.Display.Color.HexStringToColor(color).color;
    g.fillStyle(c, 0.4);
    g.fillCircle(14, 14, 14);
    g.fillStyle(c, 1);
    g.fillCircle(14, 14, 10);
    g.fillStyle(0xFFFFFF, 0.6);
    g.fillCircle(11, 11, 4);
    g.generateTexture('power_' + type, 28, 28);
    g.destroy();
  }

  private createTuntunTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Body - wooden
    g.fillStyle(0x8B4513, 1);
    g.fillRoundedRect(15, 20, 30, 50, 5);
    // Head
    g.fillStyle(0xA0522D, 1);
    g.fillCircle(30, 15, 15);
    // Eyes
    g.fillStyle(0xFF0000, 1);
    g.fillCircle(25, 12, 4);
    g.fillCircle(35, 12, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(25, 12, 2);
    g.fillCircle(35, 12, 2);
    // Arms
    g.fillStyle(0x8B4513, 1);
    g.fillRect(5, 30, 10, 5);
    g.fillRect(45, 30, 10, 5);
    // Stick
    g.fillStyle(0x654321, 1);
    g.fillRect(50, 20, 5, 45);
    // Legs
    g.fillRect(18, 70, 8, 15);
    g.fillRect(34, 70, 8, 15);
    g.generateTexture('tuntun', 60, 85);
    g.destroy();
  }

  private createCrocobirdTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Body
    g.fillStyle(0x228B22, 1);
    g.fillRoundedRect(15, 15, 40, 25, 8);
    // Head
    g.fillStyle(0x2E8B2E, 1);
    g.fillRoundedRect(50, 10, 25, 20, 5);
    // Wings
    g.fillStyle(0x3CB371, 1);
    g.fillTriangle(20, 15, 35, 0, 45, 15);
    g.fillTriangle(20, 40, 35, 55, 45, 40);
    // Eye
    g.fillStyle(0xFFFF00, 1);
    g.fillCircle(62, 18, 5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(63, 18, 2);
    // Propeller
    g.fillStyle(0x888888, 1);
    g.fillRect(25, 10, 20, 3);
    // Tail
    g.fillStyle(0x228B22, 1);
    g.fillTriangle(15, 20, 0, 27, 15, 35);
    g.generateTexture('crocobird', 75, 55);
    g.destroy();
  }

  private createHeartTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xFF3366, 1);
    g.fillCircle(8, 8, 7);
    g.fillCircle(16, 8, 7);
    g.fillTriangle(1, 10, 12, 22, 23, 10);
    g.generateTexture('heart', 24, 24);
    g.destroy();
  }

  private createStarTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xFFC44C, 1);
    const cx = 12, cy = 12, spikes = 5, outerR = 11, innerR = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fillPath();
    g.generateTexture('star', 24, 24);
    g.destroy();
  }

  private createButtonTexture(w: number, h: number, color: string, key = 'btn_pink') {
    const g = this.make.graphics({ x: 0, y: 0 });
    const c = Phaser.Display.Color.HexStringToColor(color).color;
    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(2, 4, w, h, h / 2);
    // Button body
    g.fillStyle(c, 1);
    g.fillRoundedRect(0, 0, w, h, h / 2);
    // Highlight
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRoundedRect(4, 2, w - 8, h / 2 - 2, h / 4);
    g.generateTexture(key, w, h + 4);
    g.destroy();
  }

  private createGroundTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x8B7355, 1);
    g.fillRect(0, 0, 64, 64);
    g.fillStyle(0x7A6245, 1);
    g.fillRect(0, 0, 64, 4);
    g.fillStyle(0x9B8365, 1);
    for (let i = 0; i < 5; i++) {
      g.fillRect(Math.random() * 50, Math.random() * 50, 8, 4);
    }
    g.generateTexture('ground', 64, 64);
    g.destroy();
  }

  private createParticleTexture() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}
