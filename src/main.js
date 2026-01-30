import { createGameConfig } from "./core/config.js";
import { wirePlaceholders, initUpgradeUI, refreshUpgrades, onPlayAgain, updateHUD } from "./core/ui.js";
import { wireOverlays } from "./ui/overlay.js";
import { refreshSkillTree } from "./ui/skillTree.js";
import { refreshAscensionTree, wireAscensionAction } from "./ui/ascensionTree.js";
import { purchaseUpgrade, state } from "./core/state.js";
import { upgrades } from "./data/upgrades.js";
import { BootScene } from "./scenes/BootScene.js";
import { MainScene } from "./scenes/MainScene.js";

wirePlaceholders();
wireOverlays();
refreshSkillTree(state);
refreshAscensionTree(state);
const skillBtn = document.getElementById("btn-skill-tree");
if (skillBtn) {
  skillBtn.addEventListener("click", () => refreshSkillTree(state));
}
const ascendBtn = document.getElementById("btn-ascend");
if (ascendBtn) {
  ascendBtn.addEventListener("click", () => refreshAscensionTree(state));
}
initUpgradeUI(upgrades, (def) => {
  const bought = purchaseUpgrade(def);
  if (!bought) {
    alert("No tienes recursos suficientes.");
    return;
  }
  refreshUpgrades(state);
   updateHUD(state);
});

const config = createGameConfig([BootScene, MainScene]);
const game = new Phaser.Game(config);
wireAscensionAction(state, () => game.scene.getScene("MainScene"));

const loadingEl = document.getElementById("loading");
if (loadingEl) {
  game.events.once("ready", () => loadingEl.remove());
}

onPlayAgain(() => {
  const scene = game.scene.getScene("MainScene");
  if (scene?.restartPlayPhase) {
    scene.restartPlayPhase();
  }
});
