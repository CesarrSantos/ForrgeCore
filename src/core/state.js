export const state = {
  resources: {
    sparks: 5_000_000,
    coins: 5_000_000,
    energy: 5_000_000,
  },
  rates: {
    coinsPerSec: 0,
    energyPerSec: 0,
  },
  combo: 1,
  lastResult: "Esperando golpe…",
  upgrades: {},
  skills: {},
  ascension: {
    points: 0,
    upgrades: {},
  },
  stats: {
    bestSingleHit: 0,
  },
  flags: {
    upgradesUnlocked: false,
    comboShield: 0,
  },
};

const SPARK_TO_COIN = 1;
const SPARK_TO_ENERGY = 0.35;

export function getUpgradeLevel(id) {
  return state.upgrades[id] || 0;
}

export function isSkillUnlocked(id) {
  return Boolean(state.skills[id]);
}

export function getAscensionLevel(id) {
  return state.ascension.upgrades[id] || 0;
}

export function getAscensionPointsGain() {
  if (state.stats.bestSingleHit < 2000) return 0;
  const ratio = state.stats.bestSingleHit / 2000;
  return 1 + Math.floor(Math.log2(ratio));
}

export function canAscend() {
  return state.stats.bestSingleHit >= 2000;
}

export function purchaseAscensionUpgrade(def) {
  const level = getAscensionLevel(def.id);
  const maxLevel = def.maxLevel ?? 5;
  if (level >= maxLevel) return false;
  const cost = Math.floor(def.baseCost * Math.pow(def.costMult ?? 1.7, level));
  if (state.ascension.points < cost) return false;
  state.ascension.points -= cost;
  state.ascension.upgrades[def.id] = level + 1;
  return true;
}

export function ascend() {
  if (!canAscend()) return 0;
  const gain = getAscensionPointsGain();
  state.ascension.points += gain;
  resetRunState();
  return gain;
}

export function resetRunState() {
  state.resources.sparks = 0;
  state.resources.coins = 0;
  state.resources.energy = 0;
  state.rates.coinsPerSec = 0;
  state.rates.energyPerSec = 0;
  state.combo = 1;
  state.lastResult = "Esperando golpe…";
  state.upgrades = {};
  state.skills = {};
  state.flags.upgradesUnlocked = false;
  state.flags.comboShield = 0;
  state.stats.bestSingleHit = 0;
}

export function purchaseSkill(def) {
  if (isSkillUnlocked(def.id)) return false;
  const sparksCost = def.cost?.sparks ?? 0;
  const energyCost = def.cost?.energy ?? 0;
  if (state.resources.sparks < sparksCost) return false;
  if (state.resources.energy < energyCost) return false;
  state.resources.sparks -= sparksCost;
  state.resources.energy -= energyCost;
  state.skills[def.id] = true;
  return true;
}

export function getUpgradeCost(def) {
  const level = getUpgradeLevel(def.id);
  const mult = def.costMult ?? 1.6;
  const energyMult = def.energyCostMult ?? mult;
  const coins = Math.floor(def.baseCost * Math.pow(mult, level));
  const energyBase = def.energyBaseCost ?? 0;
  const energy = energyBase > 0 ? Math.floor(energyBase * Math.pow(energyMult, level)) : 0;
  return { coins, energy };
}

export function purchaseUpgrade(def) {
  const maxLevel = def.maxLevel ?? 5;
  if (getUpgradeLevel(def.id) >= maxLevel) return false;
  const cost = getUpgradeCost(def);
  if (state.resources.coins < cost.coins) return false;
  if (state.resources.energy < cost.energy) return false;
  state.resources.coins -= cost.coins;
  state.resources.energy -= cost.energy;
  state.upgrades[def.id] = getUpgradeLevel(def.id) + 1;
  return true;
}

export function getSparkMultiplier() {
  const base = 1
    + getUpgradeLevel("chispa_brillante") * 0.2
    + getUpgradeLevel("chispa_legendaria") * 0.3
    + getUpgradeLevel("chispa_prismatica") * 0.35
    + getUpgradeLevel("chispa_aurora") * 0.5
    + (isSkillUnlocked("forge_sparks_i") ? 0.1 : 0)
    + (isSkillUnlocked("forge_sparks_ii") ? 0.15 : 0)
    + (isSkillUnlocked("forge_sparks_iii") ? 0.2 : 0)
    + (isSkillUnlocked("forge_ember_i") ? 0.3 : 0)
    + (isSkillUnlocked("forge_ember_ii") ? 0.5 : 0)
    + (isSkillUnlocked("forge_ember_iii") ? 0.8 : 0)
    + (isSkillUnlocked("forge_overdrive") ? 2.0 : 0)
    + (isSkillUnlocked("forge_apex") ? 4.0 : 0);
  const ascMult = 1
    + getAscensionLevel("asc_sparks") * 2.0
    + getAscensionLevel("asc_sparks_ii") * 4.0;
  return base * ascMult;
}

export function getEnergyPerSparkBonus() {
  return getUpgradeLevel("chispas_cristalinas") * 0.25
    + getUpgradeLevel("chispas_etéreas") * 0.35
    + (isSkillUnlocked("arcane_energy_i") ? 0.15 : 0)
    + (isSkillUnlocked("arcane_energy_ii") ? 0.2 : 0)
    + (isSkillUnlocked("arcane_flux_i") ? 0.25 : 0)
    + (isSkillUnlocked("arcane_flux_ii") ? 0.45 : 0)
    + (isSkillUnlocked("arcane_flux_iii") ? 0.8 : 0)
    + (isSkillUnlocked("arcane_overflow") ? 1.0 : 0)
    + (isSkillUnlocked("arcane_superflow") ? 2.0 : 0)
    + getAscensionLevel("asc_energy") * 2.0;
}

export function getCoinPerSparkBonus() {
  return getUpgradeLevel("forja_eficiente") * 0.05
    + getUpgradeLevel("forja_precisa") * 0.07
    + (isSkillUnlocked("economy_coin_i") ? 0.04 : 0)
    + (isSkillUnlocked("economy_coin_ii") ? 0.06 : 0)
    + (isSkillUnlocked("economy_tithe_i") ? 0.1 : 0)
    + (isSkillUnlocked("economy_tithe_ii") ? 0.18 : 0)
    + (isSkillUnlocked("economy_tithe_iii") ? 0.3 : 0)
    + (isSkillUnlocked("economy_overdrive") ? 0.8 : 0)
    + (isSkillUnlocked("economy_crown") ? 1.5 : 0)
    + getAscensionLevel("asc_coin") * 1.5;
}

export function getHitZoneWidth(base) {
  return base
    + getUpgradeLevel("zona_estable") * 12
    + getUpgradeLevel("zona_fulgor") * 18
    + getUpgradeLevel("zona_radiante") * 24
    + getUpgradeLevel("zona_divina") * 36
    + (isSkillUnlocked("tempo_focus_i") ? 8 : 0)
    + (isSkillUnlocked("tempo_focus_ii") ? 10 : 0);
}

export function getBarSpeed(base) {
  const factor = 1
    - getUpgradeLevel("ritmo_constante") * 0.08
    - getUpgradeLevel("ritmo_maestro") * 0.1
    - getUpgradeLevel("ritmo_etereo") * 0.14
    - (isSkillUnlocked("tempo_flow") ? 0.05 : 0)
    - (isSkillUnlocked("tempo_stream_i") ? 0.08 : 0)
    - (isSkillUnlocked("tempo_stream_ii") ? 0.12 : 0)
    - (isSkillUnlocked("tempo_stream_iii") ? 0.18 : 0)
    - (isSkillUnlocked("tempo_anchor") ? 0.25 : 0);
  return Math.max(0.4, base * factor);
}

export function getComboGrowthBonus() {
  return getUpgradeLevel("combo_fino") * 0.02
    + getUpgradeLevel("combo_orquestado") * 0.03
    + getUpgradeLevel("combo_sublime") * 0.05
    + (isSkillUnlocked("combo_core_i") ? 0.02 : 0)
    + (isSkillUnlocked("combo_core_ii") ? 0.03 : 0)
    + (isSkillUnlocked("combo_surge") ? 0.12 : 0)
    + getAscensionLevel("asc_combo_flow") * 0.8;
}

export function getComboCap() {
  return 10
    + getUpgradeLevel("combo_ascendente") * 1
    + getUpgradeLevel("combo_celestial") * 2
    + getUpgradeLevel("combo_transcendente") * 3
    + (isSkillUnlocked("combo_domain") ? 10 : 0)
    + getAscensionLevel("asc_combo_cap") * 15;
}

export function getMissPenaltyReduction() {
  return Math.min(
    0.9,
    getUpgradeLevel("tempo_sereno") * 0.1
      + getUpgradeLevel("tempo_impecable") * 0.12
      + (isSkillUnlocked("miss_guard_i") ? 0.1 : 0)
      + (isSkillUnlocked("miss_guard_ii") ? 0.12 : 0)
      + (isSkillUnlocked("miss_guard_iii") ? 0.18 : 0)
      + (isSkillUnlocked("miss_guard_iv") ? 0.25 : 0),
  );
}

export function getIdleRatesBase() {
  const coins = getUpgradeLevel("ritual_idle") * 0.2
    + getUpgradeLevel("ritual_profundo") * 0.35
    + getUpgradeLevel("ritual_soberano") * 0.55
    + getUpgradeLevel("ritual_imperial") * 0.8
    + (isSkillUnlocked("economy_idle") ? 0.3 : 0);
  const energy = getUpgradeLevel("bateria_arcana") * 0.05
    + getUpgradeLevel("bateria_solar") * 0.08
    + getUpgradeLevel("bateria_estelar") * 0.12
    + getUpgradeLevel("bateria_nucleo") * 0.18
    + (isSkillUnlocked("arcane_battery") ? 0.08 : 0)
    + (isSkillUnlocked("idle_energy_i") ? 0.06 : 0)
    + (isSkillUnlocked("idle_energy_ii") ? 0.1 : 0);
  const idleCoinsBonus = (isSkillUnlocked("idle_coins_i") ? 0.2 : 0)
    + (isSkillUnlocked("idle_coins_ii") ? 0.35 : 0)
    + (isSkillUnlocked("idle_coins_iii") ? 0.55 : 0)
    + (isSkillUnlocked("idle_coins_iv") ? 1.2 : 0)
    + (isSkillUnlocked("idle_coins_v") ? 2.5 : 0);
  const idleEnergyBonus = (isSkillUnlocked("idle_energy_iii") ? 0.14 : 0)
    + (isSkillUnlocked("idle_energy_iv") ? 0.35 : 0)
    + (isSkillUnlocked("idle_energy_v") ? 0.7 : 0);
  const idleDualCoins = (isSkillUnlocked("idle_dual_i") ? 0.8 : 0)
    + (isSkillUnlocked("idle_dual_ii") ? 1.6 : 0)
    + (isSkillUnlocked("idle_dual_iii") ? 3.0 : 0);
  const idleDualEnergy = (isSkillUnlocked("idle_dual_i") ? 0.12 : 0)
    + (isSkillUnlocked("idle_dual_ii") ? 0.22 : 0)
    + (isSkillUnlocked("idle_dual_iii") ? 0.35 : 0);
  const idleSkillCoins = (isSkillUnlocked("idle_overclock") ? 20 : 0)
    + (isSkillUnlocked("idle_singularity") ? 50 : 0);
  const idleSkillEnergy = (isSkillUnlocked("idle_overclock") ? 5 : 0)
    + (isSkillUnlocked("idle_singularity") ? 12 : 0);
  const idleMult = 1 + getAscensionLevel("asc_idle") * 4.0;
  const idleFlatCoins = getAscensionLevel("asc_idle_flux") * 25;
  const idleFlatEnergy = getAscensionLevel("asc_idle_flux") * 6;
  return {
    coinsPerSec: (coins + idleCoinsBonus + idleDualCoins + idleSkillCoins) * idleMult + idleFlatCoins,
    energyPerSec: (energy + idleEnergyBonus + idleDualEnergy + idleSkillEnergy) * idleMult + idleFlatEnergy,
  };
}

export function getGoodZonePadding(base) {
  return base
    + getUpgradeLevel("enfoque_firme") * 4
    + getUpgradeLevel("enfoque_maestro") * 6
    + (isSkillUnlocked("precision_good_i") ? 4 : 0)
    + (isSkillUnlocked("precision_good_ii") ? 6 : 0)
    + (isSkillUnlocked("precision_surge_i") ? 12 : 0)
    + (isSkillUnlocked("precision_surge_ii") ? 20 : 0)
    + (isSkillUnlocked("precision_surge_iii") ? 30 : 0)
    + (isSkillUnlocked("good_bloom") ? 40 : 0)
    + getAscensionLevel("asc_good_width") * 80;
}

export function getBaseSparkBonus(result) {
  if (result === "Good") {
    return getUpgradeLevel("pulso_resonado") * 2
      + getUpgradeLevel("pulso_abundante") * 3
      + (isSkillUnlocked("pulse_good") ? 2 : 0);
  }
  if (result === "Perfect") {
    return getUpgradeLevel("pulso_ritual") * 3
      + getUpgradeLevel("pulso_celeste") * 5;
  }
  return 0;
}

export function getComboStartBonus() {
  return getUpgradeLevel("latido_tenaz") * 0.15
    + getUpgradeLevel("latido_real") * 0.25
    + getUpgradeLevel("latido_ancestral") * 0.4
    + getUpgradeLevel("latido_eterno") * 0.6
    + (isSkillUnlocked("combo_start") ? 0.3 : 0)
    + (isSkillUnlocked("combo_genesis") ? 2 : 0)
    + getAscensionLevel("asc_combo_start") * 3;
}

export function getCritChance() {
  return Math.min(
    0.6,
    getUpgradeLevel("golpe_critico") * 0.03
      + getUpgradeLevel("maestria_critica") * 0.05
      + getUpgradeLevel("critico_exceso") * 0.07
      + (isSkillUnlocked("crit_focus") ? 0.1 : 0)
      + (isSkillUnlocked("crit_fury") ? 0.15 : 0)
      + getAscensionLevel("asc_crit_chance") * 0.12,
  );
}

export function getCritMultiplier() {
  return 1.5
    + getUpgradeLevel("critico_puro") * 0.2
    + getUpgradeLevel("critico_sublime") * 0.35
    + (isSkillUnlocked("crit_rupture") ? 1.0 : 0)
    + getAscensionLevel("asc_crit_mult") * 1.0;
}

export function getPerfectCritBonus() {
  return getUpgradeLevel("critico_perfecto") * 0.05
    + getUpgradeLevel("critico_oracular") * 0.08
    + (isSkillUnlocked("perfect_orbit") ? 0.2 : 0)
    + getAscensionLevel("asc_crit_perfect") * 0.2;
}

export function getCritEnergyBonusPerSpark() {
  return getUpgradeLevel("sifon_critico") * 0.12
    + getUpgradeLevel("sifon_absoluto") * 0.2
    + getAscensionLevel("asc_crit_energy") * 1.2;
}

export function getCritShieldMax() {
  return getUpgradeLevel("guardia_critica")
    + getAscensionLevel("asc_shield") * 2;
}

export function applyHit(result, baseSparks) {
  const sparks = Math.max(0, baseSparks);
  const comboBase = result === "Perfect" ? 1.1 : result === "Good" ? 1.0 : 0;
  const comboGain = comboBase * (0.05 + getComboGrowthBonus());
  let shieldedMiss = false;
  if (result === "Miss" && state.flags.comboShield > 0) {
    state.flags.comboShield = Math.max(0, state.flags.comboShield - 1);
    shieldedMiss = true;
  }
  state.combo = result === "Miss"
    ? (shieldedMiss ? state.combo : 1)
    : Math.min(getComboCap(), state.combo * (1 + comboGain));

  const missPenalty = 1 - getMissPenaltyReduction(); // 1 = full penalty, 0.1 = 90% reduced
  const comboMult = result === "Miss" ? state.combo * missPenalty * 0.1 : state.combo;
  const sparkMult = getSparkMultiplier();
  let gained = Math.floor(sparks * comboMult * sparkMult);
  let critHit = false;
  const critChance = Math.min(0.85, getCritChance() + (result === "Perfect" ? getPerfectCritBonus() : 0));
  if (result !== "Miss" && gained > 0 && Math.random() < critChance) {
    critHit = true;
    gained = Math.floor(gained * getCritMultiplier());
    gained = Math.floor(gained * (1 + getUpgradeLevel("eco_critico") * 0.12 + getAscensionLevel("asc_crit_sparks") * 0.6));
  }
  if (result === "Perfect") {
    gained = Math.floor(gained * (1 + getAscensionLevel("asc_perfect") * 0.6));
  } else if (result === "Good") {
    gained = Math.floor(gained * (1 + getAscensionLevel("asc_good") * 0.4));
  }

  state.resources.sparks += gained;
  state.resources.coins += gained * (SPARK_TO_COIN + getCoinPerSparkBonus());
  const critEnergyBonus = critHit ? getCritEnergyBonusPerSpark() : 0;
  state.resources.energy += gained * (SPARK_TO_ENERGY + getEnergyPerSparkBonus() + critEnergyBonus);
  if (critHit) {
    const maxShield = getCritShieldMax();
    if (maxShield > 0) {
      state.flags.comboShield = Math.min(maxShield, state.flags.comboShield + 1);
    }
  }
  const missTag = shieldedMiss ? " Guardado" : "";
  state.lastResult = `${result}${missTag}${critHit ? " CRIT" : ""}${gained > 0 ? ` (+${gained} chispas)` : ""}`;
  if (gained > state.stats.bestSingleHit) {
    state.stats.bestSingleHit = gained;
  }

  return { gainedSparks: gained, combo: state.combo };
}

export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.floor(n).toString();
}

export function unlockUpgrades() {
  state.flags.upgradesUnlocked = true;
}
