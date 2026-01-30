import { formatNumber, getUpgradeCost, getUpgradeLevel, canAscend } from "./state.js";

const els = {
  sparks: document.getElementById("stat-sparks"),
  coins: document.getElementById("stat-coins"),
  energy: document.getElementById("stat-energy"),
  combo: document.getElementById("stat-combo"),
  lastHit: document.getElementById("stat-last-hit"),
  coinsRate: document.getElementById("stat-coins-rate"),
  energyRate: document.getElementById("stat-energy-rate"),
  ascend: document.getElementById("btn-ascend"),
  skillTree: document.getElementById("btn-skill-tree"),
  upgradeList: document.getElementById("upgrade-list"),
  upgradeLock: document.getElementById("upgrades-lock-msg"),
  gameWrap: document.getElementById("game-wrapper"),
  shopWrap: document.getElementById("shop-wrapper"),
  hudLeft: document.querySelector(".hud-left"),
  hudMain: document.querySelector("main.hud-main"),
  phaseLabel: document.getElementById("phase-label"),
  roundTimer: document.getElementById("round-timer"),
  playAgain: document.getElementById("btn-play-again"),
};

let upgradeDefs = [];
let onBuyUpgrade = null;

export function updateHUD(state) {
  if (els.sparks) els.sparks.textContent = formatNumber(state.resources.sparks);
  if (els.coins) els.coins.textContent = formatNumber(state.resources.coins);
  if (els.energy) els.energy.textContent = formatNumber(state.resources.energy);
  if (els.combo) els.combo.textContent = `x${state.combo.toFixed(1)}`;
  if (els.lastHit) els.lastHit.textContent = state.lastResult;
  if (els.coinsRate) els.coinsRate.textContent = `+${state.rates.coinsPerSec.toFixed(2)}/s`;
  if (els.energyRate) els.energyRate.textContent = `+${state.rates.energyPerSec.toFixed(2)}/s`;
  if (els.ascend) {
    const ready = canAscend();
    els.ascend.textContent = ready ? "Ascender" : "Ascender (bloqueado)";
  }
}

export function wirePlaceholders() {
  if (els.skillTree && !document.getElementById("overlay-skill")) {
    els.skillTree.addEventListener("click", () => alert("Árbol de habilidades aún no implementado"));
  }
  if (els.ascend && !document.getElementById("overlay-ascend")) {
    els.ascend.addEventListener("click", () => alert("Ascensión se desbloqueará más adelante"));
  }
}

export function onPlayAgain(cb) {
  if (els.playAgain) els.playAgain.addEventListener("click", cb);
}

export function setPhase(isShop) {
  if (els.gameWrap) els.gameWrap.style.display = isShop ? "none" : "block";
  if (els.shopWrap) els.shopWrap.style.display = isShop ? "block" : "none";
  if (els.hudLeft) els.hudLeft.style.display = isShop ? "block" : "none";
  if (els.hudMain) {
    els.hudMain.classList.toggle("game-mode", !isShop);
  }
  if (els.phaseLabel) els.phaseLabel.textContent = isShop ? "Fase: Taller de mejoras" : "Fase: Minijuego";
}

export function setTimerText(ms) {
  if (!els.roundTimer) return;
  const secs = Math.max(0, ms / 1000);
  els.roundTimer.textContent = `${secs.toFixed(1)}s`;
}

export function setUpgradeLock(secondsRemaining, unlocked) {
  if (!els.upgradeLock) return;
  if (unlocked) {
    els.upgradeLock.textContent = "Upgrades disponibles.";
    return;
  }
  const sec = Math.ceil(secondsRemaining / 1000);
  els.upgradeLock.textContent = `Se desbloquean en ${sec}s de minijuego.`;
}

export function initUpgradeUI(defs, handleBuy) {
  upgradeDefs = defs;
  onBuyUpgrade = handleBuy;
  refreshUpgrades(null);
}

export function refreshUpgrades(state) {
  if (!els.upgradeList || !upgradeDefs.length) return;
  const res = state ? state.resources : { coins: 0 };
  els.upgradeList.innerHTML = "";

  if (els.upgradeLock) {
    els.upgradeLock.textContent = state && state.flags.upgradesUnlocked
      ? "Upgrades disponibles."
      : "Se desbloquean tras 10s de minijuego.";
  }

  const visible = upgradeDefs.filter((def) => {
    if (!state) return true;
    const maxLevel = def.maxLevel ?? 5;
    const level = getUpgradeLevel(def.id);
    if (level >= maxLevel) return false;
    if (!def.requires || !def.requires.length) return true;
    const requiresMax = def.requiresMax ?? true;
    return def.requires.every((reqId) => {
      const reqLevel = getUpgradeLevel(reqId);
      if (requiresMax) {
        const reqDef = upgradeDefs.find((u) => u.id === reqId);
        const reqMax = reqDef?.maxLevel ?? 5;
        return reqLevel >= reqMax;
      }
      return reqLevel > 0;
    });
  });

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "upgrade";
    empty.textContent = "No hay mejoras disponibles ahora.";
    els.upgradeList.appendChild(empty);
    return;
  }

  visible.forEach((def) => {
    const level = getUpgradeLevel(def.id);
    const cost = getUpgradeCost(def);
    const afford = (res.coins ?? 0) >= cost.coins && (res.energy ?? 0) >= cost.energy;
    const nextEffect = getNextEffect(def);
    const maxLevel = def.maxLevel ?? 5;

    const wrapper = document.createElement("div");
    wrapper.className = "upgrade";

    const title = document.createElement("div");
    title.innerHTML = `<strong>${def.name}</strong> <span style="color:#9aa0a6;">Lv ${level}/${maxLevel}</span>`;

    const desc = document.createElement("div");
    desc.style.fontSize = "12px";
    desc.style.color = "#c0c4cc";
    desc.textContent = def.desc;

    const next = document.createElement("div");
    next.style.fontSize = "11px";
    next.style.color = "#8fb2ff";
    next.style.marginTop = "3px";
    next.textContent = `Próximo: ${nextEffect}`;

    const costLine = document.createElement("div");
    costLine.style.marginTop = "4px";
    costLine.style.display = "flex";
    costLine.style.justifyContent = "space-between";
    costLine.style.alignItems = "center";
    const costParts = [`${formatNumber(cost.coins)} Monedas`];
    if (cost.energy > 0) costParts.push(`${formatNumber(cost.energy)} Energía`);
    costLine.innerHTML = `<span style=\"color:#9aa0a6;\">Coste: ${costParts.join(" · ")}</span>`;

    const btn = document.createElement("button");
    btn.textContent = afford ? "Comprar" : "No alcanza";
    btn.disabled = !afford;
    btn.style.marginTop = "6px";
    btn.style.width = "100%";
    btn.style.padding = "7px";
    btn.style.borderRadius = "8px";
    btn.style.border = "1px solid #30384d";
    btn.style.background = afford ? "linear-gradient(135deg,#294060,#3b5275)" : "#1c2230";
    btn.style.color = afford ? "#e5e7eb" : "#66708a";
    btn.style.cursor = afford ? "pointer" : "not-allowed";
    btn.addEventListener("click", () => onBuyUpgrade && onBuyUpgrade(def));

    wrapper.appendChild(title);
    wrapper.appendChild(desc);
    wrapper.appendChild(next);
    wrapper.appendChild(costLine);
    wrapper.appendChild(btn);
    els.upgradeList.appendChild(wrapper);
  });
}

function getNextEffect(def) {
  switch (def.id) {
    case "chispa_brillante":
      return "+20% chispas";
    case "chispa_legendaria":
      return "+30% chispas";
    case "chispa_prismatica":
      return "+35% chispas";
    case "chispa_aurora":
      return "+50% chispas";
    case "zona_estable":
      return "+12px a zona Perfect";
    case "zona_fulgor":
      return "+18px a zona Perfect";
    case "zona_radiante":
      return "+24px a zona Perfect";
    case "zona_divina":
      return "+36px a zona Perfect";
    case "ritmo_constante":
      return "Barra -8% velocidad";
    case "ritmo_maestro":
      return "Barra -10% velocidad";
    case "ritmo_etereo":
      return "Barra -14% velocidad";
    case "combo_fino":
      return "+0.02 crecimiento combo";
    case "combo_orquestado":
      return "+0.03 crecimiento combo";
    case "combo_sublime":
      return "+0.05 crecimiento combo";
    case "combo_ascendente":
      return "+1 límite de combo";
    case "combo_celestial":
      return "+2 límite de combo";
    case "combo_transcendente":
      return "+3 límite de combo";
    case "chispas_cristalinas":
      return "+0.25 Energía por chispa";
    case "chispas_etéreas":
      return "+0.35 Energía por chispa";
    case "forja_eficiente":
      return "+5% Monedas por chispa";
    case "forja_precisa":
      return "+7% Monedas por chispa";
    case "tempo_sereno":
      return "-10% penalización por Miss";
    case "tempo_impecable":
      return "-12% penalización por Miss";
    case "ritual_idle":
      return "+0.2 Monedas/s base";
    case "ritual_profundo":
      return "+0.35 Monedas/s base";
    case "ritual_soberano":
      return "+0.55 Monedas/s base";
    case "ritual_imperial":
      return "+0.8 Monedas/s base";
    case "bateria_arcana":
      return "+0.05 Energía/s base";
    case "bateria_solar":
      return "+0.08 Energía/s base";
    case "bateria_estelar":
      return "+0.12 Energía/s base";
    case "bateria_nucleo":
      return "+0.18 Energía/s base";
    case "pulso_resonado":
      return "+2 chispas Good";
    case "pulso_ritual":
      return "+3 chispas Perfect";
    case "pulso_celeste":
      return "+5 chispas Perfect";
    case "pulso_abundante":
      return "+3 chispas Good";
    case "enfoque_firme":
      return "+4px zona Good";
    case "enfoque_maestro":
      return "+6px zona Good";
    case "latido_tenaz":
      return "+0.15 combo inicial";
    case "latido_real":
      return "+0.25 combo inicial";
    case "latido_ancestral":
      return "+0.4 combo inicial";
    case "latido_eterno":
      return "+0.6 combo inicial";
    case "golpe_critico":
      return "+3% crítico";
    case "maestria_critica":
      return "+5% crítico";
    case "critico_exceso":
      return "+7% crítico";
    case "critico_puro":
      return "+0.20 mult crítico";
    case "critico_sublime":
      return "+0.35 mult crítico";
    case "critico_perfecto":
      return "+5% crítico en Perfect";
    case "critico_oracular":
      return "+8% crítico en Perfect";
    case "sifon_critico":
      return "+0.12 energía por chispa en CRIT";
    case "sifon_absoluto":
      return "+0.20 energía por chispa en CRIT";
    case "guardia_critica":
      return "CRIT da escudo anti-Miss";
    case "eco_critico":
      return "+12% chispas en CRIT";
    default:
      return "Mejora incremental";
  }
}
