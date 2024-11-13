import AudioKey from '../consts/audio-key'
import EventKey from '../consts/event-key'
import {
  ENEMY_BASE_COINS,
  ENEMY_DELAY,
  EnemyData,
  INITIAL_COINS_COUNT,
  INITIAL_LIVES_COUNT,
  LEVELS,
  TILE_SIZE,
} from '../consts/globals'
import SceneKey from '../consts/scene-key'
import TextureKey from '../consts/texture-key'
import Arrow from '../prefabs/arrow'
import EndGamePanel from '../prefabs/end-game-panel'
import Enemy from '../prefabs/enemy'
import StartGamePanel from '../prefabs/start-game-panel'
import Tower from '../prefabs/tower'

const towerPositions = [
  { x: 6, y: 5 },
  { x: 8, y: 7 },
  { x: 6, y: 10 },
  { x: 7, y: 13 },
  { x: 11, y: 16 },
]

export default class GameScene extends Phaser.Scene {
  // private graphics!: Phaser.GameObjects.Graphics
  private path!: Phaser.Curves.Path
  private enemies!: Phaser.Physics.Arcade.Group
  private towers!: Phaser.GameObjects.Group
  private arrows!: Phaser.Physics.Arcade.Group
  public coins!: number
  private totalEnemies!: number
  private enemiesCount!: number
  private coinsText!: Phaser.GameObjects.BitmapText
  private lives!: number
  private livesText!: Phaser.GameObjects.BitmapText
  private toastContainer!: Phaser.GameObjects.Container
  private killsToasts: Phaser.GameObjects.BitmapText[] = []
  public isPlaying!: boolean
  private hasStarted!: boolean
  private btnMute!: Phaser.GameObjects.Sprite
  private hudLayer!: Phaser.GameObjects.Layer
  private endGamePanel!: EndGamePanel
  private startGamePanel!: StartGamePanel

  constructor() {
    super({ key: SceneKey.Game })
  }

  init() {
    this.coins = INITIAL_COINS_COUNT
    this.lives = INITIAL_LIVES_COUNT
    this.isPlaying = true
    this.hasStarted = false
    this.enemiesCount = 0
  }

  create() {
    const { width, height } = this.game.scale
    this.cameras.main.setBounds(0, 0, width, height)

    const level = this.make.tilemap({ key: TextureKey.Level })
    const tiles = level.addTilesetImage('tileset', TextureKey.Tileset)
    level.createLayer('ground', tiles!, 0, 0)
    level.createLayer('back', tiles!, 0, 0)
    level.createLayer('path', tiles!, 0, 0)
    level.createLayer('front', tiles!, 0, 0)
    level.createLayer('above', tiles!, 0, 0)

    // this.graphics = this.add.graphics()
    this.path = new Phaser.Curves.Path(0, 72)
    this.path.lineTo(56, 72)
    this.path.lineTo(56, 104)
    this.path.lineTo(120, 104)
    this.path.lineTo(120, 72)
    this.path.lineTo(152, 72)
    this.path.lineTo(152, 136)
    this.path.lineTo(88, 136)
    this.path.lineTo(88, 184)
    this.path.lineTo(136, 184)
    this.path.lineTo(136, 216)
    this.path.lineTo(168, 216)
    this.path.lineTo(168, 280)
    this.path.lineTo(248, 280)
    this.path.lineTo(248, 256)
    // this.graphics.lineStyle(1, 0x000000, 1)
    // this.path.draw(this.graphics)

    this.enemies = this.physics.add.group({
      classType: Enemy,
    })

    this.arrows = this.physics.add.group({
      classType: Arrow,
      runChildUpdate: true,
    })

    this.towers = this.add.group({
      classType: Tower,
      runChildUpdate: true,
    })

    for (let i = 0; i < towerPositions.length; i++) {
      const { x, y } = towerPositions[i]
      const spot = this.add.sprite(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TextureKey.Spot)
      spot.setInteractive()
      spot.on('pointerdown', () => {
        if (!this.isPlaying || this.coins < LEVELS[0].price) return
        spot.destroy()
        this.addTower(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2)
      })
    }

    this.events.on(EventKey.EnemyDied, this.handleEnemyDeath, this)
    this.events.on(EventKey.EnemyHit, this.handleEnemyHit, this)
    this.events.on(EventKey.SpendCoins, this.handleSpendCoins, this)
    this.events.on(EventKey.StartGame, this.startGame, this)
    this.events.once('shutdown', this.handleShutDown, this)

    // // HUD
    this.add.image(2, 2, TextureKey.HUDCoins).setOrigin(0)
    this.add.image(2, 18, TextureKey.HUDHearts).setOrigin(0)
    this.coinsText = this.add
      .bitmapText(18, 6, TextureKey.Font, this.coins.toString().padStart(3, '0'), 7)
      .setCharacterTint(0, 3, true, 0x000000)
    this.livesText = this.add
      .bitmapText(18, 22, TextureKey.Font, this.lives.toString().padStart(2, '0'), 7)
      .setCharacterTint(0, 3, true, 0x000000)
    this.toastContainer = this.add.container(16, height - 24)

    this.btnMute = this.add.sprite(9, 40, TextureKey.Mute)
    this.btnMute.setInteractive()
    this.btnMute.on('pointerdown', this.toggleMute, this)
    this.hudLayer = this.add.layer()
    this.endGamePanel = new EndGamePanel(this, width / 2, height / 2)
    this.endGamePanel.setAlpha(0)
    this.startGamePanel = new StartGamePanel(this, width / 2, height / 2)
    this.hudLayer.add([
      this.coinsText,
      this.livesText,
      this.toastContainer,
      this.btnMute,
      this.endGamePanel,
      this.startGamePanel,
    ])
    this.hudLayer.setDepth(1000)
  }

  toggleMute() {
    this.sound.mute = !this.sound.mute
    this.btnMute.setFrame(this.sound.mute ? 0 : 1)
  }

  startGame() {
    if (this.hasStarted) return

    this.hasStarted = true
    this.isPlaying = true
    this.startGamePanel.setAlpha(0)
    let pseudos = (this.cache.json.get(TextureKey.Pseudos) || []) as EnemyData[]
    pseudos = [...this.shuffleArray(pseudos.slice(0, 100)), ...this.shuffleArray(pseudos.slice(100))]
    this.totalEnemies = pseudos.length
    for (let i = 0; i < pseudos.length; i++) {
      const enemy = this.enemies.get() as Enemy
      enemy.setPseudoPos(i % 2 === 0)
      if (enemy) {
        enemy.setPath(this.path)
        enemy.setStartPosition(i * ENEMY_DELAY)
        enemy.pseudo = pseudos[i].pseudo
        enemy.level = pseudos[i].count
      }
    }
  }

  handleEnemyDeath(enemy: Enemy) {
    if (!this.isPlaying) return
    this.coins += ENEMY_BASE_COINS * enemy.level
    this.updateCoinsText()
    this.addToast(enemy)
    this.sound.play(AudioKey.Death)

    this.updateEnemiesCounter()
  }

  handleSpendCoins(amount: number) {
    this.coins -= amount
    this.updateCoinsText()
    this.sound.play(AudioKey.Coin)
  }

  updateEnemiesCounter() {
    this.enemiesCount += 1
    if (this.enemiesCount >= this.totalEnemies) {
      this.win()
    }
  }

  handleEnemyHit(enemy: Enemy) {
    if (!this.isPlaying) return

    this.lives -= 1
    this.updateEnemiesCounter()
    this.updateLivesText()
    this.addToast(enemy, true)
    this.sound.play(AudioKey.Bell)

    if (this.lives <= 0) {
      this.gameOver()
    }
  }

  gameOver() {
    this.isPlaying = false
    this.sound.play(AudioKey.Lose)
    this.showEndGamePanel()
  }

  win() {
    if (!this.isPlaying) return
    this.isPlaying = false
    this.sound.play(AudioKey.Win)
    this.showEndGamePanel(true)
  }

  showEndGamePanel(win = false) {
    this.endGamePanel.setWinState(win)
    this.tweens.add({
      targets: this.endGamePanel,
      alpha: 1,
      y: '-=20',
      duration: 300,
      ease: 'Power2',
    })
  }

  updateCoinsText() {
    this.coinsText.setText(this.coins.toString().padStart(3, '0'))
  }

  updateLivesText() {
    this.livesText.setText(this.lives.toString().padStart(2, '0'))
  }

  addTower(x: number, y: number) {
    this.towers.add(new Tower(this, x, y, this.enemies, this.arrows))
    this.coins -= LEVELS[0].price
    this.updateCoinsText()
    this.sound.play(AudioKey.Coin)
  }

  addToast(enemy: Enemy, isHit = false) {
    let toast: Phaser.GameObjects.BitmapText
    if (isHit) {
      toast = this.add
        .bitmapText(0, 0, TextureKey.Font, `${enemy.pseudo} *hit* Anawan`, 7)
        .setCharacterTint(0, enemy.pseudo.length, true, 0xff004d)
    } else {
      toast = this.add
        .bitmapText(0, 0, TextureKey.Font, `Anawan *killed* ${enemy.pseudo}`, 7)
        .setCharacterTint(16, -1, true, 0x1d2b53)
    }

    this.toastContainer.add(toast)
    this.killsToasts.push(toast)
    this.positionToasts()

    this.tweens.add({
      targets: toast,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        toast.destroy()
        this.killsToasts.shift()
        this.positionToasts()
      },
    })
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  positionToasts() {
    let currentY = 0
    for (let i = this.killsToasts.length - 1; i >= 0; i--) {
      const toast = this.killsToasts[i]
      toast.setPosition(0, -currentY)
      currentY += 8 + 4
    }
  }

  handleShutDown() {
    this.events.off(EventKey.StartGame, this.startGame, this)
    this.events.off(EventKey.EnemyDied, this.handleEnemyDeath, this)
    this.events.off(EventKey.EnemyHit, this.handleEnemyHit, this)
    this.events.off(EventKey.SpendCoins, this.handleSpendCoins, this)
  }
}
