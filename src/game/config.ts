import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CharacterScene } from './scenes/CharacterScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parent,
    width: 360,
    height: 640,
    backgroundColor: '#172341',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 1250 },
        debug: false
      }
    },
    scene: [BootScene, MenuScene, CharacterScene, LevelSelectScene, GameScene, ResultScene],
    input: {
      activePointers: 3
    },
    render: {
      antialias: true,
      pixelArt: false,
    }
  };
}
