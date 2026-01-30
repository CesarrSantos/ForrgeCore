export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Placeholder for future assets.
  }

  create() {
    // Avisamos al DOM que la app está lista para ocultar loaders.
    this.game.events.emit("ready");
    this.scene.start("MainScene");
  }
}
