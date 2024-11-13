import TextureKey from '../consts/texture-key'

export default class EndGamePanel extends Phaser.GameObjects.Container {
  private msg!: Phaser.GameObjects.BitmapText

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    const panelHeight = 140

    const bg = scene.add.sprite(0, 0, TextureKey.PanelEnd).setOrigin(0.5)
    const title = scene.add.bitmapText(0, -panelHeight / 2 + 16, TextureKey.Font, 'Fin de partie', 7).setOrigin(0.5, 0)

    this.msg = scene.add
      .bitmapText(0, -panelHeight / 2 + 36, TextureKey.Font, '', 7)
      .setMaxWidth(180)
      .setLineSpacing(4)
      .setCenterAlign()
      .setOrigin(0.5, 0)

    const btnRestart = scene.add.sprite(0, -panelHeight / 2 + 112, TextureKey.Btn).setOrigin(0.5)
    btnRestart.setInteractive()
    btnRestart.on('pointerdown', () => {
      scene.scene.restart()
    })

    const txtRestart = scene.add
      .bitmapText(0, -panelHeight / 2 + 112, TextureKey.Font, 'Recommencer', 7)
      .setCharacterTint(0, -1, true, 0x00000)
      .setOrigin(0.5, 0)

    Phaser.Display.Align.In.Center(txtRestart, btnRestart)

    this.add([bg, title, this.msg, btnRestart, txtRestart])
  }

  setWinState(winState: boolean) {
    this.msg.setText(
      winState
        ? `Bravo, Je pense qu'ils ont compris cette fois ! Si t'es pas encore abonne... ben t'abonne pas ! Sinon je te mets dans le prochain jeu !`
        : `Aie... c'est ca que t'appelle une vengeance? Degomme-moi ces abonnes, ils l'ont bien merite apres tout !`
    )
  }
}
