import { state, getIdleRatesBase } from "./state.js";

const TICK_MS = 1000;
let acc = 0;

export function idleUpdate(deltaMs) {
  acc += deltaMs;
  if (acc < TICK_MS) return false;
  const ticks = Math.floor(acc / TICK_MS);
  acc -= ticks * TICK_MS;

  const base = getIdleRatesBase();
  const coinsGain = base.coinsPerSec * ticks;
  const energyGain = base.energyPerSec * ticks;

  state.resources.coins += coinsGain;
  state.resources.energy += energyGain;
  state.rates.coinsPerSec = base.coinsPerSec;
  state.rates.energyPerSec = base.energyPerSec;
  return ticks > 0;
}
