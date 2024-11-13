import AudioKey from '../consts/audio-key'
import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKey.Preloader })
  }

  preload() {
    this.load.setBaseURL('assets')
    this.load.spritesheet(TextureKey.Start, 'start.png', {
      frameWidth: 168,
      frameHeight: 54,
    })
    this.load.spritesheet(TextureKey.Tower, 'tower.png', {
      frameWidth: 16,
    })
    this.load.spritesheet(TextureKey.Slime, 'slime.png', {
      frameWidth: 16,
    })
    this.load.spritesheet(TextureKey.Mute, 'mute.png', {
      frameWidth: 16,
    })
    this.load.image(TextureKey.Arrow, 'arrow.png')
    this.load.image(TextureKey.Spot, 'spot.png')
    this.load.image(TextureKey.HUDCoins, 'hud-coins.png')
    this.load.image(TextureKey.HUDHearts, 'hud-hearts.png')
    this.load.json(TextureKey.Pseudos, 'enemies.json')
    this.load.tilemapTiledJSON(TextureKey.Level, 'level.json')
    this.load.image(TextureKey.Tileset, 'tileset.png')
    this.load.image(TextureKey.PanelStart, 'panel-start.png')
    this.load.image(TextureKey.PanelEnd, 'panel-end.png')
    this.load.image(TextureKey.Btn, 'btn.png')
    this.load.bitmapFont(TextureKey.Font, 'fonts/font.png', 'fonts/font.xml')

    this.load.audio(AudioKey.Music, 'audio/music.mp3')
    this.load.audio(AudioKey.Bell, 'audio/bell.wav')
    this.load.audio(AudioKey.Coin, 'audio/coin.wav')
    this.load.audio(AudioKey.Death, 'audio/death.wav')
    this.load.audio(AudioKey.Shot, 'audio/shot.wav')
    this.load.audio(AudioKey.Lose, 'audio/lose.wav')
    this.load.audio(AudioKey.Win, 'audio/win.wav')
  }

  create() {
    const backgroundMusic = this.sound.add(AudioKey.Music, {
      loop: true,
    })
    backgroundMusic.play()
    this.scene.start(SceneKey.Game)
  }
}
