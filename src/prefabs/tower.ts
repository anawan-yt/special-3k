import AudioKey from '../consts/audio-key'
import eventKey from '../consts/event-key'
import { ENEMY_HEALTH_LEVEL, Level, LEVELS } from '../consts/globals'
import TextureKey from '../consts/texture-key'
import GameScene from '../scenes/game-scene'
import Arrow from './arrow'
import Enemy from './enemy'

export default class Tower extends Phaser.GameObjects.Sprite {
  private enemies!: Phaser.Physics.Arcade.Group
  private arrows!: Phaser.Physics.Arcade.Group
  private lastFired: number = 0
  private rangeCircle: Phaser.GameObjects.Graphics
  private currentLevelNum: number = 0
  private level: Level

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemies: Phaser.Physics.Arcade.Group,
    arrows: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, TextureKey.Tower)
    this.enemies = enemies
    this.arrows = arrows
    this.level = LEVELS[this.currentLevelNum]
    scene.add.existing(this)
    this.rangeCircle = scene.add.graphics({ lineStyle: { width: 1, color: 0x5f574f, alpha: 0.5 } })
    this.drawRange()

    this.setInteractive()
    this.on('pointerdown', this.upgrade, this)
  }

  update(time: number) {
    if (time < this.lastFired + this.level.fireRate) return
    const target = this.getClosestEnemy()
    if (!target) return

    this.shoot(target)
    this.lastFired = time
  }

  upgrade() {
    const { isPlaying, coins } = this.scene as GameScene
    if (isPlaying && this.currentLevelNum < LEVELS.length - 1 && coins >= LEVELS[this.currentLevelNum + 1].price) {
      this.currentLevelNum += 1
      this.level = LEVELS[this.currentLevelNum]
      this.setFrame(this.currentLevelNum)
      this.drawRange()
      this.scene.events.emit(eventKey.SpendCoins, this.level.price)
    }
  }

  drawRange() {
    this.rangeCircle.clear()
    this.rangeCircle.strokeCircle(this.x, this.y, this.level.range)
  }

  getClosestEnemy(): Enemy | null {
    let closestEnemy: Enemy | null = null
    const inRangeEnemies: Enemy[] = []
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy
      if (enemy.active && enemy.visible) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y)
        if (distance < this.level.range) {
          inRangeEnemies.push(enemy)
        }
      }
    })

    let minHealth = Number.MAX_VALUE
    inRangeEnemies.forEach((child) => {
      const enemy = child as Enemy
      const healthRatio = enemy.health / (enemy.level * ENEMY_HEALTH_LEVEL)
      if (healthRatio < minHealth) {
        closestEnemy = enemy as Enemy
        minHealth = healthRatio
      }
    })

    return closestEnemy
  }

  shoot(target: Enemy) {
    const arrow = this.arrows.get(this.x, this.y) as Arrow
    if (arrow) {
      this.scene.sound.play(AudioKey.Shot)
      arrow.setActive(true)
      arrow.setVisible(true)
      const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
      arrow.setRotation(angle)
      const velocity = this.scene.physics.velocityFromRotation(angle, 600)
      arrow.setVelocity(velocity.x, velocity.y)

      arrow.update = () => {
        // Vérifie si la flèche est proche de l'ennemi
        if (Phaser.Math.Distance.Between(arrow.x, arrow.y, target.x, target.y) < 20) {
          arrow.setActive(false)
          arrow.setVisible(false)
          target.takeDamage(this.level.damage)
        }

        // Optionnel: remettre la flèche dans le pool si elle sort de l'écran
        if (arrow.x < 0 || arrow.x > this.scene.scale.width || arrow.y < 0 || arrow.y > this.scene.scale.height) {
          arrow.setActive(false)
          arrow.setVisible(false)
        }
      }
    }
  }
}
