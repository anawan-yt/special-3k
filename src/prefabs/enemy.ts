import eventKey from '../consts/event-key'
import {
  ENEMY_HEALTH_LEVEL,
  ENEMY_HEALTHBAR_HEIGHT,
  ENEMY_HEALTHBAR_OFFSET,
  ENEMY_HEALTHBAR_WIDTH,
} from '../consts/globals'
import TextureKey from '../consts/texture-key'

export default class Enemy extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite
  private healthBar: Phaser.GameObjects.Graphics
  private _pseudo: string
  private pseudoText: Phaser.GameObjects.BitmapText
  private path: Phaser.Curves.Path | null = null
  private startTime: number = 0
  public t: number = 0
  public health: number
  private _level: number
  private maxHealth: number
  private isDead: boolean

  constructor(scene: Phaser.Scene) {
    super(scene, -100, -100)
    this._pseudo = 'Bobby'
    this.isDead = false
    this.health = 0
    this._level = 1
    this.maxHealth = 0
    this.sprite = scene.add.sprite(0, 0, TextureKey.Slime)
    this.add(this.sprite)

    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(this.sprite.displayWidth, this.sprite.displayHeight)

    this.healthBar = scene.add.graphics()
    this.add(this.healthBar)
    this.updateHealthBar()

    this.pseudoText = scene.add.bitmapText(0, -20, TextureKey.Font, this._pseudo, 7).setOrigin(0.5).setAlpha(0.5)

    this.sprite.anims.create({
      key: 'walk',
      repeat: -1,
      frameRate: 12,
      frames: this.sprite.anims.generateFrameNumbers(TextureKey.Slime, {
        start: 0,
        end: 7,
      }),
    })

    this.sprite.play('walk')

    // if (scene.sys.game.device.os.desktop) {
    //   this.pseudoText.setAlpha(0)
    //   this.sprite.setInteractive(
    //     new Phaser.Geom.Rectangle(-10, -10, this.sprite.width + 20, this.sprite.height + 20),
    //     Phaser.Geom.Rectangle.Contains
    //   )
    //   this.sprite.on('pointerover', () => {
    //     this.pseudoText.setAlpha(1)
    //   })
    //   this.sprite.on('pointerout', () => {
    //     this.pseudoText.setAlpha(0)
    //   })
    // }

    this.add(this.pseudoText)
  }

  get pseudo() {
    return this._pseudo
  }

  set pseudo(pseudo: string) {
    this._pseudo = pseudo
    this.pseudoText.setText(pseudo)
  }

  get level() {
    return this._level
  }

  set level(level: number) {
    this._level = level
    this.maxHealth = ENEMY_HEALTH_LEVEL * level
    this.health = ENEMY_HEALTH_LEVEL * level
    this.updateHealthBar()
  }

  public setPseudoPos(isOdd: boolean) {
    this.pseudoText.y = isOdd ? -20 : -28
  }

  setPath(path: Phaser.Curves.Path) {
    this.path = path
  }

  setStartPosition(delay: number) {
    this.startTime = delay
    this.startFollowingPath()
  }

  startFollowingPath() {
    this.scene.tweens
      .add({
        targets: this,
        t: 1,
        ease: 'Linear',
        duration: 20000,
        repeat: 0,
        delay: this.startTime,
        onUpdate: (_, target: any) => {
          const t = target.t
          const point = this.path?.getPoint(t)
          if (point) {
            this.setPosition(point.x, point.y)
          }
        },
        onComplete: this.reachTarget.bind(this),
      })
      .play()
  }

  reachTarget() {
    if (this.isDead) return
    this.scene.events.emit(eventKey.EnemyHit, this)
    this.setActive(false)
    this.setVisible(false)
  }

  takeDamage(amount: number) {
    if (this.isDead) return

    this.health -= amount
    if (this.health <= 0) {
      this.die()
    } else {
      this.flash()
      this.updateHealthBar()
    }
  }

  flash() {
    this.sprite.setTint(0xff004d)
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint()
    })
  }

  die() {
    this.isDead = true
    this.setActive(false)
    this.setVisible(false)
    this.scene.events.emit(eventKey.EnemyDied, this)
  }

  updateHealthBar() {
    this.healthBar.clear()
    this.healthBar.fillStyle(0x000000)
    this.healthBar.fillRect(
      -ENEMY_HEALTHBAR_WIDTH / 2,
      -this.sprite.displayHeight / 2 - ENEMY_HEALTHBAR_OFFSET,
      ENEMY_HEALTHBAR_WIDTH,
      ENEMY_HEALTHBAR_HEIGHT
    )

    this.healthBar.fillStyle(0xff004d)
    const width = (this.health * ENEMY_HEALTHBAR_WIDTH) / this.maxHealth
    this.healthBar.fillRect(
      -ENEMY_HEALTHBAR_WIDTH / 2,
      -this.sprite.displayHeight / 2 - ENEMY_HEALTHBAR_OFFSET,
      width,
      ENEMY_HEALTHBAR_HEIGHT
    )
  }
}
