import { skills } from "../data/skills.js";
import { isSkillUnlocked, purchaseSkill } from "../core/state.js";
import { updateHUD } from "../core/ui.js";

const skillTreeEl = document.getElementById("skill-tree");

function groupByBranch(defs) {
  const map = new Map();
  defs.forEach((def) => {
    if (!map.has(def.branch)) map.set(def.branch, []);
    map.get(def.branch).push(def);
  });
  return map;
}

function formatCost(cost) {
  const parts = [];
  if (cost?.sparks) parts.push(`${cost.sparks} Chispas`);
  if (cost?.energy) parts.push(`${cost.energy} Energía`);
  return parts.join(" · ") || "Gratis";
}

function canUnlock(def) {
  if (!def.requires || !def.requires.length) return true;
  return def.requires.every((id) => isSkillUnlocked(id));
}

export function refreshSkillTree(state) {
  if (!skillTreeEl) return;
  skillTreeEl.innerHTML = "";
  const branches = groupByBranch(skills);

  branches.forEach((defs, branchName) => {
    const branch = document.createElement("div");
    branch.className = "skill-branch";

    const title = document.createElement("h4");
    title.textContent = branchName;
    branch.appendChild(title);

    defs.forEach((def) => {
      if (isSkillUnlocked(def.id)) return;
      const unlocked = canUnlock(def);
      const canAfford = (state.resources.sparks >= (def.cost?.sparks ?? 0))
        && (state.resources.energy >= (def.cost?.energy ?? 0));

      const card = document.createElement("div");
      card.className = `skill-card${unlocked ? "" : " locked"}`;

      const name = document.createElement("h5");
      name.textContent = def.name;

      const desc = document.createElement("p");
      desc.textContent = def.desc;

      const cost = document.createElement("div");
      cost.className = "skill-cost";
      cost.textContent = `Coste: ${formatCost(def.cost)}`;

      const btn = document.createElement("button");
      if (!unlocked) {
        btn.textContent = "Requiere habilidad previa";
        btn.disabled = true;
      } else {
        btn.textContent = canAfford ? "Desbloquear" : "No alcanza";
        btn.disabled = !canAfford;
      }

      btn.addEventListener("click", () => {
        if (!unlocked) return;
        const bought = purchaseSkill(def);
        if (!bought) return;
        updateHUD(state);
        refreshSkillTree(state);
      });

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(cost);
      card.appendChild(btn);
      branch.appendChild(card);
    });

    if (!branch.querySelector(".skill-card")) {
      const done = document.createElement("div");
      done.className = "skill-card";
      done.textContent = "Rama completada.";
      branch.appendChild(done);
    }

    skillTreeEl.appendChild(branch);
  });
}
