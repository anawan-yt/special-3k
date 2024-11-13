import eventKey from '../consts/event-key'
import { LEVELS } from '../consts/globals'
import TextureKey from '../consts/texture-key'
import GameScene from '../scenes/game-scene'

export default class StartGamePanel extends Phaser.GameObjects.Container {
  private msg!: Phaser.GameObjects.BitmapText
  private btnStart!: Phaser.GameObjects.Sprite

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y)
    const panelHeight = 200

    const bg = scene.add.sprite(0, 0, TextureKey.PanelStart).setOrigin(0.5)
    const title = scene.add
      .bitmapText(0, -panelHeight / 2 + 16, TextureKey.Font, 'Comment jouer ?', 7)
      .setOrigin(0.5, 0)

    this.msg = scene.add
      .bitmapText(
        0,
        -panelHeight / 2 + 48,
        TextureKey.Font,
        'Construis des tours pour te debarasser de ces satanes abonnes qui me veulent du mal !',
        7
      )
      .setMaxWidth(180)
      .setLineSpacing(4)
      .setCenterAlign()
      .setOrigin(0.5, 0)

    const towers = []
    for (let i = 0; i < LEVELS.length; i++) {
      towers.push(scene.add.sprite((i - 1) * 48, -panelHeight / 2 + 112, TextureKey.Tower, i))
      towers.push(
        scene.add.bitmapText((i - 1) * 48 + 4, -panelHeight / 2 + 112, TextureKey.Font, LEVELS[i].price.toString(), 7)
      )
    }

    this.btnStart = scene.add.sprite(0, -panelHeight / 2 + 160, TextureKey.Start, 1)
    this.btnStart.setInteractive()
    this.btnStart.on('pointerdown', () => {
      this.scene.events.emit(eventKey.StartGame, this)
    })
    this.btnStart.on('pointerover', () => {
      this.btnStart.setFrame(0)
    })
    this.btnStart.on('pointerout', () => {
      this.btnStart.setFrame(1)
    })

    this.add([bg, title, this.msg, this.btnStart, ...towers])
  }
}
