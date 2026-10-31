import Phaser from 'phaser';
import { characters, CharacterData } from '../data/characters';
import { levels, LevelData } from '../data/levels';
import { loadSave, completeLevel, saveSave, SaveData } from '../systems/SaveSystem';
import { audioSystem } from '../systems/AudioSystem';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: any;
  private charData!: CharacterData;
  private levelData!: LevelData;
  private save!: SaveData;

  private health = 3;
  private energy = 0;
  private maxEnergy = 100;
  private runRolls = 0;
  private totalRollsInLevel = 0;
  private score = 0;
  private combo = 1;
  private maxCombo = 1;
  private isPaused = false;
  private isDead = false;
  private isVictory = false;
  private levelTime = 0;
  private levelLength = 0;
  private scrollSpeed = 0;
  private baseScrollSpeed = 0;
  private cameraX = 0;
  private groundY = 520;
  private pitPositions: { x: number; w: number }[] = [];

  private speedMod = 1;
  private jumpMod = 1;
  private jumpCount = 0;
  private maxJumps = 1;
  private isGrounded = false;
  private coyoteTimer = 0;
  private invincibleTimer = 0;
  private isSliding = false;
  private slideTimer = 0;

  private abilityActive = false;
  private abilityTimer = 0;
  private shieldActive = false;
  private magnetActive = false;
  private magnetTimer = 0;
  private slowmoActive = false;
  private slowmoTimer = 0;
  private doubleActive = false;
  private doubleTimer = 0;
  private dashActive = false;
  private dashTimer = 0;

  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private grounds!: Phaser.Physics.Arcade.StaticGroup;

  private healthIcons: Phaser.GameObjects.Image[] = [];
  private rollText!: Phaser.GameObjects.Text;
  private energyBar!: Phaser.GameObjects.Graphics;
  private comboText!: Phaser.GameObjects.Text;
  private tutorialTexts: Phaser.GameObjects.Text[] = [];
  private tutorialStep = 0;
  private tutorialShown = false;

  private pauseUI: Phaser.GameObjects.GameObject[] = [];
  private playerTrail: Phaser.GameObjects.Graphics | null = null;

  constructor() { super('GameScene'); }

  init(data: { levelIndex: number }) {
    const levelIndex = data.levelIndex || 0;
    this.save = loadSave();
    this.charData = characters.find(c => c.id === this.save.selectedCharacter) || characters[0];
    this.levelData = levels[levelIndex];

    this.health = 3;
    this.energy = 0;
    this.runRolls = 0;
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.isPaused = false;
    this.isDead = false;
    this.isVictory = false;
    this.levelTime = 0;
    this.jumpCount = 0;
    this.isGrounded = false;
    this.invincibleTimer = 0;
    this.isSliding = false;
    this.abilityActive = false;
    this.shieldActive = false;
    this.magnetActive = false;
    this.slowmoActive = false;
    this.doubleActive = false;
    this.dashActive = false;
    this.tutorialStep = 0;
    this.tutorialShown = false;
    this.cameraX = 0;
    this.pauseUI = [];

    this.speedMod = 0.7 + (this.charData.speed / 5) * 0.6;
    this.jumpMod = 0.7 + (this.charData.jump / 5) * 0.6;
    this.maxJumps = this.charData.id === 'cappuccina' ? 2 : 1;

    this.baseScrollSpeed = this.levelData.speed * this.speedMod;
    this.scrollSpeed = this.baseScrollSpeed;
    this.levelLength = this.baseScrollSpeed * this.levelData.duration;

    // Gather pit positions
    this.pitPositions = this.levelData.obstacles
      .filter(o => o.type === 'pit')
      .map(o => ({ x: o.x, w: o.width || 80 }));
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.createBackground();

    // Ground
    this.grounds = this.physics.add.staticGroup();
    this.createGround();

    // Player
    this.player = this.physics.add.sprite(80, this.groundY - 50, 'player_' + this.charData.id);
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0);
    this.player.body!.setSize(28, 48);
    this.player.body!.setOffset(10, 10);
    (this.player.body as Phaser.Physics.Arcade.Body).allowGravity = true;
    this.player.setDepth(10);

    // Groups
    this.obstacles = this.physics.add.group({ allowGravity: false });
    this.collectibles = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group({ allowGravity: false });

    this.generateLevelContent();

    // Collisions
    this.physics.add.collider(this.player, this.grounds as any, () => {
      if (this.player.body!.velocity.y >= 0) {
        this.isGrounded = true;
        this.jumpCount = 0;
        this.coyoteTimer = 100;
      }
    });

    this.physics.add.overlap(this.player, this.obstacles as any, this.handleObstacleHit, undefined, this);
    this.physics.add.overlap(this.player, this.collectibles as any, this.handleCollect, undefined, this);
    this.physics.add.overlap(this.player, this.enemies as any, this.handleEnemyHit, undefined, this);

    this.setupInput();
    this.createHUD();

    if (this.levelData.tutorial && !this.save.tutorialDone) {
      this.showTutorial();
    }

    audioSystem.startMusic();
  }

  private createBackground() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      Phaser.Display.Color.HexStringToColor(this.levelData.bgColor1).color,
      Phaser.Display.Color.HexStringToColor(this.levelData.bgColor1).color,
      Phaser.Display.Color.HexStringToColor(this.levelData.bgColor2).color,
      Phaser.Display.Color.HexStringToColor(this.levelData.bgColor2).color,
      1
    );
    bg.fillRect(0, 0, width, height);
    bg.setScrollFactor(0);

    // Parallax buildings
    for (let i = 0; i < 10; i++) {
      const layer = this.add.graphics();
      layer.fillStyle(0xFFFFFF, 0.04 + i * 0.01);
      const bw = 30 + Math.random() * 50;
      const bh = 50 + Math.random() * 130;
      layer.fillRoundedRect(0, 0, bw, bh, 4);
      layer.setPosition(i * 45 - 20, this.groundY - bh + 20);
      layer.setScrollFactor(0.1 + i * 0.05);
    }

    // Clouds
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xFFFFFF, 0.12);
      cloud.fillEllipse(0, 0, 50 + Math.random() * 50, 15 + Math.random() * 12);
      cloud.fillEllipse(20, -5, 30 + Math.random() * 20, 12 + Math.random() * 8);
      cloud.setPosition(Math.random() * width * 2, 40 + Math.random() * 120);
      cloud.setScrollFactor(0.03 + Math.random() * 0.04);
    }

    // Decorative elements on ground level
    for (let i = 0; i < 8; i++) {
      const deco = this.add.graphics();
      deco.fillStyle(0xFFFFFF, 0.06);
      const dw = 20 + Math.random() * 30;
      const dh = 30 + Math.random() * 60;
      deco.fillRoundedRect(0, 0, dw, dh, 3);
      deco.setPosition(i * 80 + Math.random() * 40, this.groundY - dh + 15);
      deco.setScrollFactor(0.3 + Math.random() * 0.2);
    }
  }

  private createGround() {
    const totalWidth = this.levelLength + 800;
    for (let x = 0; x < totalWidth; x += 64) {
      const inPit = this.pitPositions.some(p => x >= p.x - 5 && x <= p.x + p.w + 5);
      if (!inPit) {
        const tile = this.grounds.create(x + 32, this.groundY + 32, 'ground') as Phaser.Physics.Arcade.Sprite;
        tile.setDisplaySize(64, 64);
        tile.refreshBody();
      }
    }

    // Pit visuals
    this.pitPositions.forEach(pit => {
      const g = this.add.graphics();
      g.fillStyle(0x0a0a1e, 1);
      g.fillRect(pit.x, this.groundY, pit.w, 120);
      // Danger stripes
      g.fillStyle(0xFF4444, 0.3);
      for (let i = 0; i < pit.w; i += 12) {
        g.fillRect(pit.x + i, this.groundY, 6, 3);
      }
    });

    // Finish portal
    const finishX = this.levelLength + 50;
    const portal = this.add.graphics();
    portal.fillStyle(0xFFC44C, 0.6);
    portal.fillRoundedRect(finishX - 15, this.groundY - 80, 30, 80, 10);
    portal.fillStyle(0xFF65A3, 0.4);
    portal.fillRoundedRect(finishX - 10, this.groundY - 75, 20, 70, 8);
    portal.fillStyle(0xFFFFFF, 0.3);
    portal.fillRoundedRect(finishX - 5, this.groundY - 70, 10, 60, 5);
    // Flag on top
    portal.fillStyle(0xFF65A3, 1);
    portal.fillRect(finishX - 2, this.groundY - 100, 4, 25);
    portal.fillTriangle(finishX + 2, this.groundY - 100, finishX + 20, this.groundY - 93, finishX + 2, this.groundY - 85);
    // Animate portal
    this.tweens.add({
      targets: portal, alpha: { from: 0.6, to: 1 }, duration: 800, yoyo: true, repeat: -1
    });
  }

  private generateLevelContent() {
    this.levelData.obstacles.forEach(obs => {
      if (obs.type === 'pit') return; // handled separately

      let sprite: Phaser.Physics.Arcade.Sprite | null = null;

      switch (obs.type) {
        case 'toilet':
          sprite = this.obstacles.create(obs.x, (obs.y || this.groundY - 25), 'toilet') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'tallToilet':
          sprite = this.obstacles.create(obs.x, (obs.y || this.groundY - 35), 'tallToilet') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'openToilet':
          sprite = this.obstacles.create(obs.x, (obs.y || this.groundY - 30), 'toilet') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'plunger':
          sprite = this.obstacles.create(obs.x, (obs.y || this.groundY - 20), 'plunger') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'pipe':
          sprite = this.obstacles.create(obs.x + 40, (obs.y || this.groundY - 80), 'pipe') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'puddle':
          sprite = this.obstacles.create(obs.x + 30, (obs.y || this.groundY - 5), 'puddle') as Phaser.Physics.Arcade.Sprite;
          break;
        case 'spinner':
          sprite = this.obstacles.create(obs.x + 25, (obs.y || this.groundY - 60), 'spinner') as Phaser.Physics.Arcade.Sprite;
          if (sprite) this.tweens.add({ targets: sprite, angle: 360, duration: 2000, repeat: -1 });
          break;
        case 'cart':
          sprite = this.obstacles.create(obs.x + 22, (obs.y || this.groundY - 25), 'cart') as Phaser.Physics.Arcade.Sprite;
          break;
        default:
          sprite = this.obstacles.create(obs.x, (obs.y || this.groundY - 25), 'toilet') as Phaser.Physics.Arcade.Sprite;
      }

      if (sprite) {
        sprite.setImmovable(true);
        (sprite as any).obstacleType = obs.type;
      }
    });

    // Collectibles
    this.levelData.collectibles.forEach(col => {
      const key = (col.type && col.type !== 'roll') ? 'power_' + col.type : 'roll';
      const item = this.collectibles.create(col.x, col.y, key) as Phaser.Physics.Arcade.Sprite;
      item.setImmovable(true);
      (item as any).collectType = col.type || 'roll';

      if (!col.type || col.type === 'roll') {
        this.totalRollsInLevel++;
        this.tweens.add({
          targets: item, y: item.y - 6, duration: 900 + Math.random() * 400,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        // Rotation
        this.tweens.add({
          targets: item, scaleX: 0.3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      }
    });

    // Enemies
    this.levelData.enemies.forEach(en => {
      if (en.type === 'tuntun') {
        const sprite = this.enemies.create(en.x, this.groundY - 45, 'tuntun') as Phaser.Physics.Arcade.Sprite;
        sprite.setImmovable(true);
        (sprite as any).enemyType = 'tuntun';
        this.tweens.add({
          targets: sprite, x: sprite.x - 150, duration: 8000,
          repeat: -1, yoyo: true, ease: 'Sine.easeInOut'
        });
      } else if (en.type === 'crocobird') {
        const sprite = this.enemies.create(en.x, 160, 'crocobird') as Phaser.Physics.Arcade.Sprite;
        sprite.setImmovable(true);
        (sprite as any).enemyType = 'crocobird';
        this.tweens.add({
          targets: sprite, y: 280, duration: 2500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
          targets: sprite, x: sprite.x + 80, duration: 3500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      }
    });
  }

  private setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys({
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        e: Phaser.Input.Keyboard.KeyCodes.E,
        p: Phaser.Input.Keyboard.KeyCodes.P,
        esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      });
    }

    this.createTouchButtons();
  }

  private createTouchButtons() {
    const { width, height } = this.scale;

    // Jump button
    const jumpBg = this.add.circle(60, height - 70, 36, 0xFF65A3, 0.85).setInteractive({ useHandCursor: true }).setDepth(100).setScrollFactor(0);
    const jumpTxt = this.add.text(60, height - 70, '↑', { fontSize: '26px', color: '#FFF', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    jumpBg.on('pointerdown', () => { this.tryJump(); jumpBg.setScale(0.85); });
    jumpBg.on('pointerup', () => jumpBg.setScale(1));
    jumpBg.on('pointerout', () => jumpBg.setScale(1));

    // Slide button
    const slideBg = this.add.circle(145, height - 70, 36, 0x49C7F5, 0.85).setInteractive({ useHandCursor: true }).setDepth(100).setScrollFactor(0);
    const slideTxt = this.add.text(145, height - 70, '↓', { fontSize: '26px', color: '#FFF', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    slideBg.on('pointerdown', () => { this.trySlide(); slideBg.setScale(0.85); });
    slideBg.on('pointerup', () => { this.stopSlide(); slideBg.setScale(1); });
    slideBg.on('pointerout', () => { this.stopSlide(); slideBg.setScale(1); });

    // Ability button
    const abBg = this.add.circle(width - 60, height - 70, 36, 0xFFC44C, 0.85).setInteractive({ useHandCursor: true }).setDepth(100).setScrollFactor(0);
    const abTxt = this.add.text(width - 60, height - 70, '★', { fontSize: '26px', color: '#FFF', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);
    abBg.on('pointerdown', () => { this.tryAbility(); abBg.setScale(0.85); });
    abBg.on('pointerup', () => abBg.setScale(1));
    abBg.on('pointerout', () => abBg.setScale(1));

    // Tap to jump on game area
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      audioSystem.resume();
      if (pointer.y < height - 120 && pointer.y > 60 && pointer.x > 190 && pointer.x < width - 100) {
        this.tryJump();
      }
    });

    // Swipe down for slide
    let startY = 0;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => { startY = p.y; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown && p.y - startY > 40 && p.y < this.scale.height - 120) {
        this.trySlide();
      }
    });
    this.input.on('pointerup', () => { this.stopSlide(); });
  }

  private createHUD() {
    const { width } = this.scale;

    // Health
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(22 + i * 26, 22, 'heart').setScale(0.85).setDepth(100).setScrollFactor(0);
      this.healthIcons.push(heart);
    }

    // Roll counter
    this.add.image(14, 50, 'roll').setScale(0.55).setDepth(100).setScrollFactor(0);
    this.rollText = this.add.text(28, 44, '× 0', {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
    }).setDepth(100).setScrollFactor(0);

    // Energy bar
    this.energyBar = this.add.graphics().setDepth(100).setScrollFactor(0);

    // Progress
    this.add.text(width / 2, 10, `УРОВЕНЬ ${this.levelData.id}/10`, {
      fontSize: '10px', fontFamily: 'Arial', color: '#FFF4E8', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    // Progress bar bg
    const pbg = this.add.graphics().setDepth(100).setScrollFactor(0);
    pbg.fillStyle(0x333355, 0.8);
    pbg.fillRoundedRect(width / 2 - 55, 24, 110, 7, 3);
    // Flag
    pbg.fillStyle(0xFFC44C, 0.8);
    pbg.fillRect(width / 2 + 53, 20, 2, 14);
    (this as any)._progFill = this.add.graphics().setDepth(100).setScrollFactor(0);

    // Combo
    this.comboText = this.add.text(width - 18, 18, '×1', {
      fontSize: '18px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    // Pause
    const pauseBtn = this.add.text(width - 14, 48, '⏸', {
      fontSize: '20px', color: '#FFFFFF'
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this.togglePause());

    // Active effects indicators
    (this as any)._effectsText = this.add.text(width - 18, 75, '', {
      fontSize: '10px', fontFamily: 'Arial', color: '#49C7F5', fontStyle: 'bold',
      align: 'right'
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);
  }

  private updateEnergyBar() {
    this.energyBar.clear();
    this.energyBar.fillStyle(0x333355, 0.8);
    this.energyBar.fillRoundedRect(90, 46, 90, 9, 4);
    const fw = (this.energy / this.maxEnergy) * 86;
    if (fw > 0) {
      const canUse = this.energy >= this.charData.abilityCost;
      this.energyBar.fillStyle(canUse ? 0xFFC44C : 0x7757E8, 1);
      this.energyBar.fillRoundedRect(92, 48, fw, 5, 2);
    }
  }

  private updateProgressBar() {
    const pf = (this as any)._progFill as Phaser.GameObjects.Graphics;
    if (!pf) return;
    pf.clear();
    const progress = Math.min(1, this.cameraX / this.levelLength);
    const { width } = this.scale;
    pf.fillStyle(0xFF65A3, 1);
    pf.fillRoundedRect(width / 2 - 53, 26, progress * 106, 3, 1);
    // Player dot
    pf.fillStyle(0xFFFFFF, 1);
    pf.fillCircle(width / 2 - 53 + progress * 106, 27, 3);
  }

  update(time: number, delta: number) {
    if (this.isPaused || this.isDead || this.isVictory) return;

    const dt = Math.min(delta / 1000, 0.05); // cap delta
    this.levelTime += dt;

    // Auto-scroll
    this.cameraX += this.scrollSpeed * dt;
    this.cameras.main.scrollX = this.cameraX - 80;

    // Player follows camera
    this.player.x = this.cameraX + 80;

    // Fall into pit check
    if (this.player.y > this.groundY + 80) {
      this.takeDamage();
      if (!this.isDead) {
        // Respawn player on nearest ground ahead
        this.player.y = this.groundY - 80;
        this.player.setVelocityY(-350);
        this.player.x = this.cameraX + 120; // push forward
      }
    }

    // If player falls behind camera, push forward
    if (this.player.x < this.cameraX - 20) {
      this.player.x = this.cameraX + 80;
      this.player.setVelocityY(-200);
    }

    // Timers
    if (this.coyoteTimer > 0) this.coyoteTimer -= delta;
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      this.player.setAlpha(Math.sin(time * 0.015) > 0 ? 1 : 0.3);
    } else {
      this.player.setAlpha(1);
    }

    if (this.isSliding) {
      this.slideTimer -= delta;
      this.player.body!.setSize(28, 22);
      this.player.body!.setOffset(10, 32);
      if (this.slideTimer <= 0) this.stopSlide();
    }

    // Ability timers
    if (this.dashActive) { this.dashTimer -= delta; if (this.dashTimer <= 0) this.dashActive = false; }
    if (this.magnetActive) { this.magnetTimer -= delta; if (this.magnetTimer <= 0) this.magnetActive = false; }
    if (this.slowmoActive) { this.slowmoTimer -= delta; if (this.slowmoTimer <= 0) { this.slowmoActive = false; this.scrollSpeed = this.baseScrollSpeed; } }
    if (this.doubleActive) { this.doubleTimer -= delta; if (this.doubleTimer <= 0) this.doubleActive = false; }
    if (this.abilityActive) { this.abilityTimer -= delta; if (this.abilityTimer <= 0) { this.abilityActive = false; this.maxJumps = this.charData.id === 'cappuccina' ? 2 : 1; } }

    // Magnet effect
    if (this.magnetActive || (this.charData.id === 'lattelisa' && this.abilityActive)) {
      const range = this.charData.id === 'lattelisa' ? 130 : 160;
      this.collectibles.getChildren().forEach((child: any) => {
        if (child.active && child.collectType === 'roll') {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
          if (dist < range) {
            const angle = Phaser.Math.Angle.Between(child.x, child.y, this.player.x, this.player.y);
            child.x += Math.cos(angle) * 4;
            child.y += Math.sin(angle) * 4;
          }
        }
      });
    }

    // Turboroll passive
    if (this.charData.id === 'turboroll') {
      this.collectibles.getChildren().forEach((child: any) => {
        if (child.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, child.x, child.y);
          if (dist < 45) {
            const angle = Phaser.Math.Angle.Between(child.x, child.y, this.player.x, this.player.y);
            child.x += Math.cos(angle) * 2.5;
            child.y += Math.sin(angle) * 2.5;
          }
        }
      });
    }

    // Keyboard
    this.handleKeyboard();

    // Animate
    this.animatePlayer();

    // HUD
    this.updateEnergyBar();
    this.updateProgressBar();
    this.rollText.setText(`× ${this.runRolls}`);
    this.comboText.setText(`×${this.combo}`);

    // Active effects display
    const effects: string[] = [];
    if (this.shieldActive) effects.push('🛡');
    if (this.magnetActive) effects.push('🧲');
    if (this.slowmoActive) effects.push('⏳');
    if (this.doubleActive) effects.push('×2');
    if (this.dashActive) effects.push('💨');
    const et = (this as any)._effectsText as Phaser.GameObjects.Text;
    if (et) et.setText(effects.join(' '));

    // Victory check
    if (this.cameraX >= this.levelLength) {
      this.victory();
    }

    // Cleanup
    this.cleanupOffscreen();

    // Tutorial
    if (this.levelData.tutorial && !this.save.tutorialDone) {
      this.updateTutorial();
    }
  }

  private handleKeyboard() {
    if (!this.keys) return;
    if (Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.tryJump();
    }
    if (this.cursors.down?.isDown || this.keys.s?.isDown) {
      this.trySlide();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.shift) || Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      this.tryAbility();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.p) || Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this.togglePause();
    }
  }

  private tryJump() {
    if (this.isDead || this.isPaused) return;

    const canGroundJump = this.isGrounded || this.coyoteTimer > 0;
    const canAirJump = !this.isGrounded && this.jumpCount < this.maxJumps;

    if (canGroundJump) {
      this.performJump();
    } else if (canAirJump) {
      this.performJump();
    }
  }

  private performJump() {
    const force = -480 * this.jumpMod;
    this.player.setVelocityY(force);
    this.isGrounded = false;
    this.jumpCount++;
    this.coyoteTimer = 0;
    audioSystem.playJump();

    this.tweens.add({
      targets: this.player, scaleX: 0.85, scaleY: 1.15,
      duration: 80, yoyo: true, ease: 'Quad.easeOut'
    });

    // Dust particles
    for (let i = 0; i < 3; i++) {
      const p = this.add.circle(this.player.x + (Math.random() - 0.5) * 20, this.player.y + 25, 3, 0xFFFFFF, 0.5);
      p.setDepth(5);
      this.tweens.add({
        targets: p, y: p.y + 10, alpha: 0, scale: 0, duration: 300,
        onComplete: () => p.destroy()
      });
    }
  }

  private trySlide() {
    if (this.isDead || this.isPaused || this.isSliding) return;
    if (!this.isGrounded) {
      this.player.setVelocityY(500);
      return;
    }
    this.isSliding = true;
    this.slideTimer = 600;
  }

  private stopSlide() {
    this.isSliding = false;
    this.player.body!.setSize(28, 48);
    this.player.body!.setOffset(10, 10);
  }

  private tryAbility() {
    if (this.isDead || this.isPaused || this.abilityActive) return;
    if (this.energy < this.charData.abilityCost) return;

    this.energy -= this.charData.abilityCost;
    this.abilityActive = true;
    audioSystem.playAbility();

    switch (this.charData.id) {
      case 'cappuccina':
        this.maxJumps = 2;
        this.invincibleTimer = 1000;
        this.abilityTimer = 1200;
        if (!this.isGrounded) this.performJump();
        this.tweens.add({ targets: this.player, angle: 720, duration: 600, ease: 'Quad.easeOut', onComplete: () => this.player.setAngle(0) });
        break;
      case 'espresso':
        this.dashActive = true;
        this.dashTimer = 650;
        this.invincibleTimer = 650;
        this.abilityTimer = 650;
        for (let i = 0; i < 6; i++) {
          const trail = this.add.circle(this.player.x - i * 12, this.player.y, 6, 0x3D2B1F, 0.6);
          trail.setDepth(5);
          this.tweens.add({ targets: trail, alpha: 0, scale: 0, duration: 500, onComplete: () => trail.destroy() });
        }
        break;
      case 'turboroll':
        this.shieldActive = true;
        this.abilityTimer = 5000;
        const shield = this.add.circle(0, 0, 32, 0x49C7F5, 0.25).setDepth(9);
        const updateShield = () => {
          if (shield.active) { shield.x = this.player.x; shield.y = this.player.y; }
        };
        this.events.on('update', updateShield);
        this.tweens.add({
          targets: shield, alpha: { from: 0.3, to: 0.1 }, duration: 400, yoyo: true, repeat: 12,
          onComplete: () => { shield.destroy(); this.shieldActive = false; this.events.off('update', updateShield); }
        });
        break;
      case 'lattelisa':
        this.magnetActive = true;
        this.magnetTimer = 5000;
        this.abilityTimer = 5000;
        break;
    }

    // Burst particles
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const p = this.add.circle(this.player.x, this.player.y, 3, 0xFFC44C, 1);
      p.setDepth(15);
      this.tweens.add({
        targets: p, x: p.x + Math.cos(angle) * 40, y: p.y + Math.sin(angle) * 40,
        alpha: 0, duration: 400, onComplete: () => p.destroy()
      });
    }
  }

  private handleObstacleHit(playerObj: any, obstacle: any) {
    if (this.invincibleTimer > 0 || this.dashActive) return;
    const type = obstacle.obstacleType;

    if (type === 'puddle') {
      this.scrollSpeed = this.baseScrollSpeed * 0.6;
      this.time.delayedCall(1200, () => { if (!this.slowmoActive) this.scrollSpeed = this.baseScrollSpeed; });
      return;
    }

    if (this.shieldActive) {
      this.shieldActive = false;
      obstacle.destroy();
      for (let i = 0; i < 6; i++) {
        const p = this.add.circle(this.player.x, this.player.y, 4, 0x49C7F5, 1);
        p.setDepth(15);
        this.tweens.add({
          targets: p, x: p.x + (Math.random() - 0.5) * 60, y: p.y + (Math.random() - 0.5) * 60,
          alpha: 0, duration: 300, onComplete: () => p.destroy()
        });
      }
      return;
    }

    this.takeDamage();
    obstacle.destroy();
  }

  private handleCollect(playerObj: any, collectible: any) {
    const type = collectible.collectType;

    if (type === 'roll') {
      const amount = this.doubleActive ? 2 : 1;
      this.runRolls += amount;
      this.score += 100 * this.combo * amount;
      this.energy = Math.min(this.maxEnergy, this.energy + (this.charData.id === 'lattelisa' ? 3 : 2));
      const prevCombo = this.combo;
      this.combo = Math.min(5, this.combo + 1);
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      
      // Combo increase effect
      if (this.combo > prevCombo && this.combo >= 3) {
        const comboPopup = this.add.text(this.player.x, this.player.y - 40, `КОМБО ×${this.combo}!`, {
          fontSize: '14px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold',
          stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(25);
        this.tweens.add({
          targets: comboPopup, y: comboPopup.y - 30, alpha: 0, scale: 1.3,
          duration: 800, onComplete: () => comboPopup.destroy()
        });
      }

      audioSystem.playCollect();

      const popup = this.add.text(collectible.x, collectible.y - 10, `+${100 * this.combo}`, {
        fontSize: '11px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets: popup, y: popup.y - 30, alpha: 0, duration: 600, onComplete: () => popup.destroy() });

      for (let i = 0; i < 4; i++) {
        const p = this.add.circle(collectible.x, collectible.y, 2, 0xFFC44C, 1);
        p.setDepth(15);
        this.tweens.add({
          targets: p, x: p.x + (Math.random() - 0.5) * 25, y: p.y + (Math.random() - 0.5) * 25,
          alpha: 0, duration: 250, onComplete: () => p.destroy()
        });
      }
    } else {
      this.activatePowerUp(type);
    }

    collectible.destroy();
  }

  private activatePowerUp(type: string) {
    audioSystem.playCollect();
    const names: Record<string, string> = {
      magnet: '🧲 МАГНИТ!', shield: '🛡 ЩИТ!', slowmo: '⏳ ЗАМЕДЛЕНИЕ!',
      double: '×2 СБОР!', energy: '☕ +25 ЭНЕРГИИ!'
    };

    switch (type) {
      case 'magnet': this.magnetActive = true; this.magnetTimer = 8000; break;
      case 'shield': this.shieldActive = true; break;
      case 'slowmo':
        this.slowmoActive = true; this.slowmoTimer = 3000;
        this.scrollSpeed = this.baseScrollSpeed * 0.5;
        this.time.delayedCall(3000, () => { this.slowmoActive = false; this.scrollSpeed = this.baseScrollSpeed; });
        break;
      case 'double': this.doubleActive = true; this.doubleTimer = 8000; break;
      case 'energy': this.energy = Math.min(this.maxEnergy, this.energy + 25); break;
    }

    const notif = this.add.text(this.scale.width / 2, 90, names[type] || type, {
      fontSize: '15px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(50).setScrollFactor(0);
    this.tweens.add({ targets: notif, y: 65, alpha: 0, duration: 1500, onComplete: () => notif.destroy() });
  }

  private handleEnemyHit(_player: any, _enemy: any) {
    if (this.invincibleTimer > 0 || this.dashActive) return;
    if (this.shieldActive) { this.shieldActive = false; return; }
    this.takeDamage();
  }

  private takeDamage() {
    if (this.invincibleTimer > 0 || this.isDead) return;

    this.health--;
    this.combo = 1;
    this.invincibleTimer = 1200;
    audioSystem.playHurt();

    this.healthIcons.forEach((h, i) => {
      h.setTint(i >= this.health ? 0x444444 : 0xFFFFFF);
    });

    this.cameras.main.shake(200, 0.012);

    if (this.health <= 0) {
      this.defeat();
    }
  }

  private animatePlayer() {
    if (this.isSliding) {
      this.player.setAngle(20);
    } else if (!this.isGrounded) {
      this.player.setAngle(this.player.body!.velocity.y < 0 ? -8 : 5);
    } else {
      this.player.setAngle(Math.sin(this.levelTime * 12) * 3);
    }
  }

  private cleanupOffscreen() {
    const leftEdge = this.cameraX - 150;
    [...this.obstacles.getChildren(), ...this.collectibles.getChildren(), ...this.enemies.getChildren()].forEach((child: any) => {
      if (child.x < leftEdge && child.destroy) child.destroy();
    });
  }

  private togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.pause();
      audioSystem.stopMusic();
      this.showPauseMenu();
    } else {
      this.physics.resume();
      audioSystem.startMusic();
      this.hidePauseMenu();
    }
  }

  private showPauseMenu() {
    const { width, height } = this.scale;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(200).setScrollFactor(0).setInteractive();
    const panel = this.add.graphics().setDepth(201).setScrollFactor(0);
    panel.fillStyle(0x172341, 1);
    panel.fillRoundedRect(50, 170, width - 100, 300, 15);
    panel.lineStyle(2, 0xFF65A3, 1);
    panel.strokeRoundedRect(50, 170, width - 100, 300, 15);

    const title = this.add.text(width / 2, 200, '⏸ ПАУЗА', {
      fontSize: '24px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202).setScrollFactor(0);

    const btnData = [
      { text: '▶ ПРОДОЛЖИТЬ', y: 260, action: () => this.togglePause() },
      { text: '↺ ЗАНОВО', y: 310, action: () => { this.isPaused = false; this.physics.resume(); this.scene.restart({ levelIndex: this.levelData.id - 1 }); } },
      { text: '🏠 ГЛАВНОЕ МЕНЮ', y: 360, action: () => { this.isPaused = false; this.physics.resume(); audioSystem.stopMusic(); this.scene.start('MenuScene'); } },
    ];

    const btns: Phaser.GameObjects.GameObject[] = [overlay, panel, title];
    btnData.forEach(b => {
      const t = this.add.text(width / 2, b.y, b.text, {
        fontSize: '14px', fontFamily: 'Arial', color: '#FFFFFF', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { audioSystem.playClick(); b.action(); });
      btns.push(t);
    });

    this.pauseUI = btns;
  }

  private hidePauseMenu() {
    this.pauseUI.forEach(obj => { if (obj && obj.destroy) obj.destroy(); });
    this.pauseUI = [];
  }

  private victory() {
    if (this.isVictory) return;
    this.isVictory = true;
    audioSystem.playVictory();
    audioSystem.stopMusic();

    const rollPercent = this.totalRollsInLevel > 0 ? this.runRolls / this.totalRollsInLevel : 1;
    let stars = 1;
    if (rollPercent >= 0.65) stars = 2;
    if (rollPercent >= 0.85 && this.health >= 1) stars = 3;

    this.score += this.health * 500;
    this.score += Math.floor(Math.max(0, this.levelData.duration - this.levelTime) * 10);

    this.save = completeLevel(this.levelData.id - 1, stars, this.score, this.runRolls, this.save);
    if (this.levelData.tutorial) {
      this.save.tutorialDone = true;
      saveSave(this.save);
    }

    // Victory animation
    this.tweens.add({
      targets: this.player, angle: { from: -10, to: 10 }, duration: 200, yoyo: true, repeat: 5
    });

    this.time.delayedCall(800, () => {
      this.scene.start('ResultScene', {
        levelIndex: this.levelData.id - 1, stars, score: this.score,
        rolls: this.runRolls, totalRolls: this.totalRollsInLevel,
        time: this.levelTime, health: this.health, maxCombo: this.maxCombo, victory: true
      });
    });
  }

  private defeat() {
    if (this.isDead) return;
    this.isDead = true;
    audioSystem.playDefeat();
    audioSystem.stopMusic();

    this.tweens.add({
      targets: this.player, y: this.player.y - 60, angle: 180, alpha: 0,
      duration: 800, ease: 'Quad.easeOut'
    });

    this.time.delayedCall(1200, () => {
      this.scene.start('ResultScene', {
        levelIndex: this.levelData.id - 1, stars: 0, score: this.score,
        rolls: this.runRolls, totalRolls: this.totalRollsInLevel,
        time: this.levelTime, health: 0, maxCombo: this.maxCombo, victory: false
      });
    });
  }

  private showTutorial() {
    const hints = [
      { x: 250, text: '👆 Нажми ↑ для прыжка!' },
      { x: 450, text: '🧻 Собирай рулоны!' },
      { x: 750, text: '👇 Подкат под трубами!' },
      { x: 1050, text: '★ Копи энергию для супер-способности!' },
      { x: 1350, text: '🏁 Доберись до финиша!' },
    ];

    hints.forEach(hint => {
      const t = this.add.text(hint.x, 180, hint.text, {
        fontSize: '12px', fontFamily: 'Arial', color: '#FFC44C', fontStyle: 'bold',
        backgroundColor: '#00000099', padding: { x: 8, y: 5 }
      }).setOrigin(0.5).setDepth(50).setAlpha(0);
      this.tutorialTexts.push(t);
    });
  }

  private updateTutorial() {
    const threshold = this.tutorialStep * 280 + 150;
    if (this.cameraX > threshold && this.tutorialStep < this.tutorialTexts.length) {
      const t = this.tutorialTexts[this.tutorialStep];
      if (t.alpha === 0) {
        t.setAlpha(1);
        this.tweens.add({
          targets: t, alpha: 0, delay: 3500, duration: 500,
          onComplete: () => { this.tutorialStep++; }
        });
      }
    }
  }
}
