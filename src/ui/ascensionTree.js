import { ascensionUpgrades } from "../data/ascensionUpgrades.js";
import {
  ascend,
  canAscend,
  getAscensionLevel,
  getAscensionPointsGain,
  purchaseAscensionUpgrade,
} from "../core/state.js";
import { updateHUD, refreshUpgrades } from "../core/ui.js";
import { refreshSkillTree } from "./skillTree.js";

const ascTreeEl = document.getElementById("ascension-tree");
const ascPointsEl = document.getElementById("ascension-points");
const ascBestEl = document.getElementById("ascension-best");
const ascGainEl = document.getElementById("ascension-gain");
const ascReqEl = document.getElementById("ascension-req");
const ascBtn = document.getElementById("btn-ascend-confirm");

function groupByBranch(defs) {
  const map = new Map();
  defs.forEach((def) => {
    if (!map.has(def.branch)) map.set(def.branch, []);
    map.get(def.branch).push(def);
  });
  return map;
}

function canUnlock(def) {
  if (!def.requires || !def.requires.length) return true;
  const requiresMax = def.requiresMax ?? true;
  return def.requires.every((reqId) => {
    const reqDef = ascensionUpgrades.find((u) => u.id === reqId);
    const reqLevel = getAscensionLevel(reqId);
    const reqMax = reqDef?.maxLevel ?? 5;
    return requiresMax ? reqLevel >= reqMax : reqLevel > 0;
  });
}

function getCost(def) {
  const level = getAscensionLevel(def.id);
  return Math.floor(def.baseCost * Math.pow(def.costMult ?? 1.7, level));
}

export function refreshAscensionTree(state) {
  if (!ascTreeEl) return;
  ascTreeEl.innerHTML = "";
  if (ascPointsEl) ascPointsEl.textContent = state.ascension.points.toString();
  if (ascBestEl) ascBestEl.textContent = state.stats.bestSingleHit.toString();
  if (ascGainEl) ascGainEl.textContent = getAscensionPointsGain().toString();
  if (ascReqEl) {
    ascReqEl.textContent = canAscend()
      ? " (Listo para ascender)"
      : ` (Actual: ${state.stats.bestSingleHit})`;
  }
  if (ascBtn) {
    const gain = getAscensionPointsGain();
    ascBtn.disabled = !canAscend();
    ascBtn.textContent = canAscend() ? `Ascender ahora (+${gain} Esencia)` : "Ascender ahora";
  }

  const branches = groupByBranch(ascensionUpgrades);
  branches.forEach((defs, branchName) => {
    const branch = document.createElement("div");
    branch.className = "skill-branch";

    const title = document.createElement("h4");
    title.textContent = branchName;
    branch.appendChild(title);

    defs.forEach((def) => {
      const level = getAscensionLevel(def.id);
      const maxLevel = def.maxLevel ?? 5;
      if (level >= maxLevel) return;
      const unlocked = canUnlock(def);
      const cost = getCost(def);
      const canAfford = state.ascension.points >= cost;

      const card = document.createElement("div");
      card.className = `skill-card${unlocked ? "" : " locked"}`;

      const name = document.createElement("h5");
      name.textContent = `${def.name} (${level}/${maxLevel})`;

      const desc = document.createElement("p");
      desc.textContent = def.desc;

      const costLine = document.createElement("div");
      costLine.className = "skill-cost";
      costLine.textContent = `Coste: ${cost} Esencia`;

      const btn = document.createElement("button");
      if (!unlocked) {
        btn.textContent = "Requiere ascensión previa";
        btn.disabled = true;
      } else {
        btn.textContent = canAfford ? "Desbloquear" : "No alcanza";
        btn.disabled = !canAfford;
      }

      btn.addEventListener("click", () => {
        if (!unlocked) return;
        const bought = purchaseAscensionUpgrade(def);
        if (!bought) return;
        refreshAscensionTree(state);
      });

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(costLine);
      card.appendChild(btn);
      branch.appendChild(card);
    });

    if (!branch.querySelector(".skill-card")) {
      const done = document.createElement("div");
      done.className = "skill-card";
      done.textContent = "Rama completada.";
      branch.appendChild(done);
    }

    ascTreeEl.appendChild(branch);
  });
}

export function wireAscensionAction(state, getScene) {
  if (!ascBtn) return;
  ascBtn.addEventListener("click", () => {
    if (!canAscend()) return;
    const gained = ascend();
    if (!gained) return;
    const scene = getScene?.();
    if (scene?.restartPlayPhase) scene.restartPlayPhase();
    updateHUD(state);
    refreshUpgrades(state);
    refreshSkillTree(state);
    refreshAscensionTree(state);
    const overlay = document.getElementById("overlay-ascend");
    if (overlay) overlay.style.display = "none";
  });
}
