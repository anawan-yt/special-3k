import TextureKey from '../consts/texture-key'

export default class Arrow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKey.Arrow)
    scene.add.existing(this)
  }
}
