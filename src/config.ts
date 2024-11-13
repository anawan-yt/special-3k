import BootScene from './scenes/boot-scene'
import PreloaderScene from './scenes/preloader-scene'
import GameScene from './scenes/game-scene'

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: '3K',
  version: '1.0.0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 288,
    height: 320,
  },
  physics: {
    default: 'arcade',
  },
  type: Phaser.AUTO,
  pixelArt: true,
  roundPixels: false,
  antialias: false,
  backgroundColor: '#ffffff',
  scene: [BootScene, PreloaderScene, GameScene],
}
