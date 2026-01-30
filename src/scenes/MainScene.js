import { state, applyHit, getHitZoneWidth, getBarSpeed, unlockUpgrades, getGoodZonePadding, getBaseSparkBonus, getComboStartBonus } from "../core/state.js";
import { updateHUD, refreshUpgrades, setUpgradeLock, setPhase, setTimerText } from "../core/ui.js";
import { idleUpdate } from "../core/idle.js";

const BAR_WIDTH = 520;
const BAR_HEIGHT = 18;
const BASE_HIT_ZONE_WIDTH = 90;
const BASE_BAR_SPEED = 0.85;

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.barValue = 0;
    this.barDir = 1;
    this.barSpeed = BASE_BAR_SPEED; // cycles per second
    this.lastResult = "Esperando golpe…";
    this.floatingTexts = [];
    this.upgradeUnlockMs = 10_000;
    this.isShop = false;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 36, "Forja del Núcleo", {
      fontSize: "30px",
      color: "#ffc857",
      fontStyle: "bold",
    }).setOrigin(0.5, 0.5);

    this.resultText = this.add.text(width / 2, height - 60, "Pulsa espacio o click", {
      fontSize: "18px",
      color: "#9aa0a6",
    }).setOrigin(0.5, 0.5);

    this.barX = width / 2 - BAR_WIDTH / 2;
    this.barY = height / 2;

    this.graphics = this.add.graphics();

    this.input.keyboard.on("keydown-SPACE", () => this.handleHit());
    this.input.on("pointerdown", () => this.handleHit());

    updateHUD(state);
    setPhase(false);
    setTimerText(this.upgradeUnlockMs);
    setUpgradeLock(this.upgradeUnlockMs, false);
  }

  update(time, delta) {
    const idleTicked = idleUpdate(delta);
    if (this.isShop && idleTicked) {
      refreshUpgrades(state);
    }
    this.updateUnlock(delta);
    setTimerText(this.upgradeUnlockMs);
    const dt = delta / 1000;
    this.barSpeed = getBarSpeed(BASE_BAR_SPEED);
    const step = this.barSpeed * dt * 2; // back and forth across 0..1
    this.barValue += step * this.barDir;

    if (this.barValue >= 1) {
      this.barValue = 1;
      this.barDir = -1;
    }
    if (this.barValue <= 0) {
      this.barValue = 0;
      this.barDir = 1;
    }

    this.drawBar();
    this.updateFloatingTexts(delta);
    updateHUD(state);
  }

  drawBar() {
    if (this.isShop) return;
    this.graphics.clear();

    // Base bar
    this.graphics.fillStyle(0x1f2430, 1);
    this.graphics.fillRoundedRect(this.barX, this.barY, BAR_WIDTH, BAR_HEIGHT, 6);

    // Perfect zone
    const hitZoneWidth = getHitZoneWidth(BASE_HIT_ZONE_WIDTH);
    const zoneX = this.barX + (BAR_WIDTH - hitZoneWidth) / 2;
    this.graphics.fillStyle(0x3fa9f5, 0.6);
    this.graphics.fillRoundedRect(zoneX, this.barY, hitZoneWidth, BAR_HEIGHT, 6);

    // Slider
    const sliderX = this.barX + this.barValue * BAR_WIDTH;
    this.graphics.fillStyle(0xffc857, 1);
    this.graphics.fillCircle(sliderX, this.barY + BAR_HEIGHT / 2, 12);
  }

  handleHit() {
    if (this.isShop) return;
    const hitZoneWidth = getHitZoneWidth(BASE_HIT_ZONE_WIDTH);
    const zoneStart = (BAR_WIDTH - hitZoneWidth) / 2;
    const zoneEnd = zoneStart + hitZoneWidth;
    const pos = this.barValue * BAR_WIDTH;
    const goodPad = getGoodZonePadding(80);

    let result = "Miss";
    let color = "#d04e4e";
    let baseSparks = 0;

    if (pos >= zoneStart && pos <= zoneEnd) {
      result = "Perfect";
      color = "#f2d78c";
      baseSparks = 10;
    } else if (pos >= zoneStart - goodPad && pos <= zoneEnd + goodPad) {
      result = "Good";
      color = "#8bd17c";
      baseSparks = 5;
    }

    baseSparks += getBaseSparkBonus(result);
    const { combo, gainedSparks } = applyHit(result, baseSparks);

    this.resultText.setText(`Resultado: ${result} | Combo x${combo.toFixed(1)}`);
    this.resultText.setColor(color);
    refreshUpgrades(state);

    this.spawnFloatingText(gainedSparks);
    // Sin flash ni shake para evitar parpadeo.
  }

  spawnFloatingText(amount) {
    if (!amount) return;
    const text = this.add.text(this.barX + BAR_WIDTH / 2, this.barY - 30, `+${amount} ✦`, {
      fontSize: "18px",
      color: "#ffc857",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.floatingTexts.push({ obj: text, life: 600, speed: 24 });
  }

  updateFloatingTexts(delta) {
    const toRemove = [];
    this.floatingTexts.forEach((ft, idx) => {
      ft.life -= delta;
      ft.obj.y -= (ft.speed * delta) / 1000;
      ft.obj.setAlpha(Math.max(0, ft.life / 600));
      if (ft.life <= 0) {
        ft.obj.destroy();
        toRemove.push(idx);
      }
    });
    // remove in reverse order
    toRemove.reverse().forEach((idx) => this.floatingTexts.splice(idx, 1));
  }

  updateUnlock(delta) {
    if (state.flags.upgradesUnlocked) {
      setUpgradeLock(0, true);
      return;
    }
    this.upgradeUnlockMs = Math.max(0, this.upgradeUnlockMs - delta);
    setUpgradeLock(this.upgradeUnlockMs, false);
    if (this.upgradeUnlockMs <= 0 && !state.flags.upgradesUnlocked) {
      this.enterShopPhase();
    }
  }

  enterShopPhase() {
    this.isShop = true;
    unlockUpgrades();
    setPhase(true);
    setUpgradeLock(0, true);
    refreshUpgrades(state);
  }

  restartPlayPhase() {
    this.isShop = false;
    state.flags.upgradesUnlocked = false;
    this.upgradeUnlockMs = 10_000;
    setPhase(false);
    setUpgradeLock(this.upgradeUnlockMs, false);
    setTimerText(this.upgradeUnlockMs);
    this.barValue = 0;
    this.barDir = 1;
    state.combo = 1 + getComboStartBonus();
    this.floatingTexts.forEach((ft) => ft.obj.destroy());
    this.floatingTexts = [];
  }
}
